import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { connector_id, action_type, params, credentials } = await req.json();

    if (!connector_id || !action_type) {
      throw new Error('Connector ID and action type are required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: connector } = await supabase
      .from('connectors')
      .select('*')
      .eq('id', connector_id)
      .maybeSingle();

    if (!connector) {
      throw new Error('Connector not found');
    }

    const result = await executeConnectorAction(
      connector.name,
      action_type,
      params,
      credentials,
      connector
    );

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error executing connector action:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeConnectorAction(
  connectorName: string,
  actionType: string,
  params: any,
  credentials: any,
  connector: any
): Promise<any> {
  switch (connectorName) {
    case 'salesforce':
      return await executeSalesforceAction(actionType, params, credentials);

    case 'hubspot':
      return await executeHubSpotAction(actionType, params, credentials);

    case 'google':
    case 'google_classroom':
      return await executeGoogleAction(actionType, params, credentials);

    case 'moodle':
      return await executeMoodleAction(actionType, params, credentials);

    default:
      throw new Error(`Connector not implemented: ${connectorName}`);
  }
}

async function executeSalesforceAction(action: string, params: any, credentials: any): Promise<any> {
  const baseUrl = credentials.instanceUrl;
  const headers = {
    'Authorization': `Bearer ${credentials.accessToken}`,
    'Content-Type': 'application/json',
  };

  switch (action) {
    case 'create_lead': {
      const response = await fetch(`${baseUrl}/services/data/v58.0/sobjects/Lead`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    }

    case 'update_lead': {
      const { id, ...updates } = params;
      const response = await fetch(`${baseUrl}/services/data/v58.0/sobjects/Lead/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(await response.text());
      return { success: true };
    }

    case 'create_contact': {
      const response = await fetch(`${baseUrl}/services/data/v58.0/sobjects/Contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    }

    default:
      throw new Error(`Unknown Salesforce action: ${action}`);
  }
}

async function executeHubSpotAction(action: string, params: any, credentials: any): Promise<any> {
  const baseUrl = 'https://api.hubapi.com';
  const headers = {
    'Authorization': `Bearer ${credentials.accessToken}`,
    'Content-Type': 'application/json',
  };

  switch (action) {
    case 'create_contact': {
      const response = await fetch(`${baseUrl}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ properties: params }),
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    }

    case 'update_contact': {
      const { id, ...properties } = params;
      const response = await fetch(`${baseUrl}/crm/v3/objects/contacts/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ properties }),
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    }

    case 'create_deal': {
      const response = await fetch(`${baseUrl}/crm/v3/objects/deals`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ properties: params }),
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    }

    default:
      throw new Error(`Unknown HubSpot action: ${action}`);
  }
}

async function executeGoogleAction(action: string, params: any, credentials: any): Promise<any> {
  const headers = {
    'Authorization': `Bearer ${credentials.accessToken}`,
    'Content-Type': 'application/json',
  };

  switch (action) {
    case 'create_event': {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    }

    case 'send_email': {
      const { to, subject, body } = params;
      const email = `To: ${to}\nSubject: ${subject}\n\n${body}`;
      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({ raw: encodedEmail }),
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    }

    default:
      throw new Error(`Unknown Google action: ${action}`);
  }
}

async function executeMoodleAction(action: string, params: any, credentials: any): Promise<any> {
  const instanceUrl = credentials.instanceUrl;
  const token = credentials.apiKey;

  const executeRequest = async (wsfunction: string, additionalParams: any) => {
    const url = new URL(`${instanceUrl}/webservice/rest/server.php`);
    url.searchParams.set('wstoken', token);
    url.searchParams.set('moodlewsrestformat', 'json');
    url.searchParams.set('wsfunction', wsfunction);

    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  };

  switch (action) {
    case 'create_user':
      return await executeRequest('core_user_create_users', {
        'users[0][username]': params.username,
        'users[0][password]': params.password,
        'users[0][firstname]': params.firstname,
        'users[0][lastname]': params.lastname,
        'users[0][email]': params.email,
      });

    case 'enroll_user':
      return await executeRequest('enrol_manual_enrol_users', {
        'enrolments[0][roleid]': params.roleid || 5,
        'enrolments[0][userid]': params.userid,
        'enrolments[0][courseid]': params.courseid,
      });

    default:
      throw new Error(`Unknown Moodle action: ${action}`);
  }
}
