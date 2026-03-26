import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface OutlookEmailEvent {
  subject: string;
  body: string;
  sender: string;
  receivedDateTime: string;
  hasAttachments: boolean;
}

interface SlackEvent {
  type: string;
  text: string;
  user: string;
  channel: string;
  timestamp: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, connectionId, eventData } = await req.json();

    if (action === 'process_email') {
      const result = await processEmailEvent(supabaseClient, connectionId, eventData);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'process_slack') {
      const result = await processSlackEvent(supabaseClient, connectionId, eventData);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'scan_emails') {
      const result = await scanOutlookEmails(supabaseClient, connectionId);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing integration event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processEmailEvent(supabaseClient: any, connectionId: string, emailData: OutlookEmailEvent) {
  const { data: connection } = await supabaseClient
    .from('integration_connections')
    .select('*, user_profiles!inner(id, email, company_id)')
    .eq('id', connectionId)
    .single();

  if (!connection) {
    throw new Error('Connection not found');
  }

  const eventRecord = {
    connection_id: connectionId,
    event_type: 'email_received',
    event_data: emailData,
    processed: false,
  };

  const { data: event, error: eventError } = await supabaseClient
    .from('integration_events')
    .insert([eventRecord])
    .select()
    .single();

  if (eventError) throw eventError;

  const { data: triggers } = await supabaseClient
    .from('ai_roleplay_triggers')
    .select('*')
    .eq('user_id', connection.user_id)
    .eq('integration_type', 'outlook')
    .eq('is_active', true);

  const matchedTriggers = [];
  const emailText = `${emailData.subject} ${emailData.body}`.toLowerCase();

  for (const trigger of triggers || []) {
    const keywords = trigger.trigger_config?.keywords || [];
    const hasMatch = keywords.some((keyword: string) =>
      emailText.includes(keyword.toLowerCase())
    );

    if (hasMatch) {
      matchedTriggers.push(trigger);
      await createRoleplaySession(supabaseClient, trigger, connection, emailData, event.id);
    }
  }

  await supabaseClient
    .from('integration_events')
    .update({ processed: true })
    .eq('id', event.id);

  return {
    success: true,
    event_id: event.id,
    matched_triggers: matchedTriggers.length,
    message: `Processed email event, created ${matchedTriggers.length} roleplay session(s)`,
  };
}

async function processSlackEvent(supabaseClient: any, connectionId: string, slackData: SlackEvent) {
  const { data: connection } = await supabaseClient
    .from('integration_connections')
    .select('*, user_profiles!inner(id, email, company_id)')
    .eq('id', connectionId)
    .single();

  if (!connection) {
    throw new Error('Connection not found');
  }

  const eventRecord = {
    connection_id: connectionId,
    event_type: 'slack_message',
    event_data: slackData,
    processed: false,
  };

  const { data: event, error: eventError } = await supabaseClient
    .from('integration_events')
    .insert([eventRecord])
    .select()
    .single();

  if (eventError) throw eventError;

  const { data: triggers } = await supabaseClient
    .from('ai_roleplay_triggers')
    .select('*')
    .eq('user_id', connection.user_id)
    .eq('integration_type', 'slack')
    .eq('is_active', true);

  const matchedTriggers = [];
  const messageText = slackData.text.toLowerCase();

  for (const trigger of triggers || []) {
    const keywords = trigger.trigger_config?.keywords || [];
    const hasMatch = keywords.some((keyword: string) =>
      messageText.includes(keyword.toLowerCase())
    );

    if (hasMatch) {
      matchedTriggers.push(trigger);
      await createRoleplaySession(supabaseClient, trigger, connection, slackData, event.id);
    }
  }

  await supabaseClient
    .from('integration_events')
    .update({ processed: true })
    .eq('id', event.id);

  return {
    success: true,
    event_id: event.id,
    matched_triggers: matchedTriggers.length,
    message: `Processed Slack event, created ${matchedTriggers.length} roleplay session(s)`,
  };
}

async function scanOutlookEmails(supabaseClient: any, connectionId: string) {
  const { data: connection } = await supabaseClient
    .from('integration_connections')
    .select('*')
    .eq('id', connectionId)
    .single();

  if (!connection || connection.status !== 'connected') {
    throw new Error('Connection not active');
  }

  const config = connection.config;
  const clientId = config.client_id;
  const clientSecret = config.client_secret;
  const tenantId = config.tenant_id;

  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    }
  );

  if (!tokenResponse.ok) {
    throw new Error('Failed to authenticate with Microsoft Graph');
  }

  const { access_token } = await tokenResponse.json();

  const lastSync = connection.metadata?.last_sync || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const emailsResponse = await fetch(
    `https://graph.microsoft.com/v1.0/users/${config.email_address}/messages?$filter=receivedDateTime ge ${lastSync}&$top=50&$select=subject,bodyPreview,receivedDateTime,from,hasAttachments`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!emailsResponse.ok) {
    throw new Error('Failed to fetch emails from Microsoft Graph');
  }

  const { value: emails } = await emailsResponse.json();

  let processedCount = 0;
  for (const email of emails) {
    await processEmailEvent(supabaseClient, connectionId, {
      subject: email.subject,
      body: email.bodyPreview,
      sender: email.from?.emailAddress?.address || 'unknown',
      receivedDateTime: email.receivedDateTime,
      hasAttachments: email.hasAttachments,
    });
    processedCount++;
  }

  await supabaseClient
    .from('integration_connections')
    .update({
      metadata: {
        ...connection.metadata,
        last_sync: new Date().toISOString(),
      },
    })
    .eq('id', connectionId);

  return {
    success: true,
    emails_processed: processedCount,
    message: `Scanned and processed ${processedCount} emails`,
  };
}

async function createRoleplaySession(
  supabaseClient: any,
  trigger: any,
  connection: any,
  eventData: any,
  eventId: string
) {
  const template = trigger.roleplay_template || {};
  const prepHoursBefore = trigger.trigger_config?.prep_hours_before || 24;

  let scheduledFor = new Date();
  scheduledFor.setHours(scheduledFor.getHours() + prepHoursBefore);

  const sessionData = {
    user_id: connection.user_id,
    company_id: connection.user_profiles?.company_id,
    scenario_type: template.scenario_type || 'discovery',
    difficulty: template.difficulty_level || 'medium',
    duration: template.duration_minutes || 15,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    metadata: {
      trigger_id: trigger.id,
      integration_event_id: eventId,
      source: trigger.integration_type,
      auto_generated: true,
      event_data: eventData,
    },
  };

  const { data: session, error } = await supabaseClient
    .from('roleplay_sessions')
    .insert([sessionData])
    .select()
    .single();

  if (error) {
    console.error('Error creating roleplay session:', error);
    throw error;
  }

  await supabaseClient
    .from('integration_events')
    .update({ roleplay_session_id: session.id })
    .eq('id', eventId);

  if (trigger.integration_type === 'outlook') {
    await sendSlackNotification(supabaseClient, connection.user_id, session, eventData);
  }

  return session;
}

async function sendSlackNotification(
  supabaseClient: any,
  userId: string,
  session: any,
  eventData: any
) {
  const { data: slackConnection } = await supabaseClient
    .from('integration_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('integration_type', 'slack')
    .eq('status', 'connected')
    .maybeSingle();

  if (!slackConnection || !slackConnection.config?.webhook_url) {
    return;
  }

  if (!slackConnection.config?.auto_post_roleplay) {
    return;
  }

  const webhookUrl = slackConnection.config.webhook_url;
  const message = {
    text: `🎯 New AI Roleplay Prep Session Created!`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 AI Roleplay Prep Session',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Type:*\n${session.scenario_type}`,
          },
          {
            type: 'mrkdwn',
            text: `*Difficulty:*\n${session.difficulty}`,
          },
          {
            type: 'mrkdwn',
            text: `*Triggered by:*\n${eventData.subject || 'Email event'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Duration:*\n${session.duration} minutes`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Auto-generated from email detection | Session ID: ${session.id}`,
          },
        ],
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}
