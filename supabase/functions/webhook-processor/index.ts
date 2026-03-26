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

  const url = new URL(req.url);
  const connectorName = url.searchParams.get('connector');

  if (!connectorName) {
    return new Response(
      JSON.stringify({ error: 'Connector name is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: connector } = await supabase
      .from('connectors')
      .select('*')
      .eq('name', connectorName)
      .maybeSingle();

    if (!connector) {
      throw new Error(`Connector not found: ${connectorName}`);
    }

    const payload = await req.json();
    const headers = Object.fromEntries(req.headers.entries());

    const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        connector_id: connector.id,
        event_type: determineEventType(connectorName, payload, headers),
        event_source: connectorName,
        payload,
        headers: {
          'content-type': headers['content-type'],
          'user-agent': headers['user-agent'],
        },
        status: 'pending',
      });

    if (insertError) {
      console.error('Error inserting webhook event:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook received and queued' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function determineEventType(connector: string, payload: any, headers: any): string {
  switch (connector) {
    case 'salesforce':
      return payload.event?.type || 'unknown';

    case 'hubspot':
      return payload.subscriptionType || 'unknown';

    case 'google':
    case 'google_classroom':
      return payload.kind || headers['x-goog-resource-state'] || 'unknown';

    case 'moodle':
      return payload.eventname || 'unknown';

    default:
      return payload.type || payload.event || payload.event_type || 'unknown';
  }
}
