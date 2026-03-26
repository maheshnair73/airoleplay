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
  const path = url.pathname;

  try {
    if (path.includes('/authorize')) {
      return await handleAuthorize(url, req);
    }

    if (path.includes('/callback')) {
      return await handleCallback(url, req);
    }

    if (path.includes('/refresh')) {
      return await handleRefresh(req);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in connector-oauth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleAuthorize(url: URL, req: Request) {
  const connectorName = url.searchParams.get('connector');
  const userId = url.searchParams.get('user_id');
  const state = url.searchParams.get('state') || crypto.randomUUID();

  if (!connectorName) {
    throw new Error('Connector name is required');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: connector, error } = await supabase
    .from('connectors')
    .select('*')
    .eq('name', connectorName)
    .maybeSingle();

  if (error || !connector) {
    throw new Error(`Connector not found: ${connectorName}`);
  }

  if (connector.auth_type !== 'oauth2') {
    throw new Error('Connector does not support OAuth2');
  }

  const clientId = Deno.env.get(connector.client_id_env);
  const redirectUri = `${supabaseUrl}/functions/v1/connector-oauth/callback`;

  if (!clientId) {
    throw new Error(`Client ID not configured for ${connectorName}`);
  }

  const authUrl = new URL(connector.authorize_url);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');

  const stateData = btoa(JSON.stringify({
    connector: connectorName,
    user_id: userId,
    random: state,
  }));
  authUrl.searchParams.set('state', stateData);

  const scopes = connector.scopes || [];
  if (scopes.length > 0) {
    authUrl.searchParams.set('scope', scopes.join(' '));
  }

  if (connectorName === 'google' || connectorName === 'google_classroom') {
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
  }

  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      'Location': authUrl.toString(),
    },
  });
}

async function handleCallback(url: URL, req: Request) {
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(
      renderErrorPage(error, url.searchParams.get('error_description') || 'Unknown error'),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }

  if (!code || !stateParam) {
    throw new Error('Missing code or state parameter');
  }

  const state = JSON.parse(atob(stateParam));
  const connectorName = state.connector;
  const userId = state.user_id;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: connector } = await supabase
    .from('connectors')
    .select('*')
    .eq('name', connectorName)
    .maybeSingle();

  if (!connector) {
    throw new Error(`Connector not found: ${connectorName}`);
  }

  const clientId = Deno.env.get(connector.client_id_env);
  const clientSecret = Deno.env.get(connector.client_secret_env);
  const redirectUri = `${supabaseUrl}/functions/v1/connector-oauth/callback`;

  const tokenResponse = await fetch(connector.token_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${errorData}`);
  }

  const tokens = await tokenResponse.json();

  let userInfo: any = {};
  let instanceUrl = connector.base_url;

  if (connectorName === 'salesforce') {
    instanceUrl = tokens.instance_url;
    userInfo = {
      id: tokens.id,
      instance_url: tokens.instance_url,
    };
  } else if (connectorName === 'google' || connectorName === 'google_classroom') {
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });
    userInfo = await userInfoResponse.json();
  } else if (connectorName === 'hubspot') {
    const userInfoResponse = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + tokens.access_token, {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` },
    });
    const tokenInfo = await userInfoResponse.json();
    userInfo = {
      id: tokenInfo.user,
      hub_id: tokenInfo.hub_id,
    };
  }

  const connectionData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type || 'Bearer',
    expires_in: tokens.expires_in,
    scope: tokens.scope,
    external_user_id: userInfo.id || userInfo.sub,
    external_email: userInfo.email,
    external_display_name: userInfo.name || userInfo.displayName,
    instance_url: instanceUrl,
  };

  const encodedData = btoa(JSON.stringify(connectionData));

  return new Response(
    renderSuccessPage(connector.display_name, userInfo.email || 'Connected', encodedData),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
  );
}

async function handleRefresh(req: Request) {
  const { connector_name, refresh_token } = await req.json();

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: connector } = await supabase
    .from('connectors')
    .select('*')
    .eq('name', connector_name)
    .maybeSingle();

  if (!connector) {
    throw new Error(`Connector not found: ${connector_name}`);
  }

  const clientId = Deno.env.get(connector.client_id_env);
  const clientSecret = Deno.env.get(connector.client_secret_env);

  const tokenResponse = await fetch(connector.refresh_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.text();
    throw new Error(`Token refresh failed: ${errorData}`);
  }

  const tokens = await tokenResponse.json();

  return new Response(
    JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || refresh_token,
      expires_in: tokens.expires_in,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function renderSuccessPage(connectorName: string, email: string, encodedData: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authorization Successful</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 3rem;
            border-radius: 1rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
          }
          h1 { color: #22c55e; margin-bottom: 1rem; }
          p { color: #6b7280; margin-bottom: 0.5rem; }
          .checkmark {
            width: 80px; height: 80px; border-radius: 50%;
            display: block; stroke-width: 3; stroke: #22c55e;
            stroke-miterlimit: 10; margin: 2rem auto;
            animation: fill .4s ease-in-out .4s forwards;
          }
          @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 30px #22c55e; } }
        </style>
      </head>
      <body>
        <div class="container">
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="none" stroke="#22c55e" stroke-width="3"/>
            <path fill="none" stroke="#22c55e" stroke-width="3" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
          <h1>Connected Successfully!</h1>
          <p><strong>${connectorName}</strong></p>
          <p>${email}</p>
          <p style="margin-top: 2rem; font-size: 0.875rem;">This window will close automatically...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'connector-oauth-success',
              connector: '${connectorName}',
              data: '${encodedData}'
            }, '*');
            setTimeout(() => window.close(), 2000);
          }
        </script>
      </body>
    </html>
  `;
}

function renderErrorPage(error: string, description: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authorization Failed</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white; padding: 3rem; border-radius: 1rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center; max-width: 400px;
          }
          h1 { color: #ef4444; margin-bottom: 1rem; }
          p { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Authorization Failed</h1>
          <p><strong>Error:</strong> ${error}</p>
          <p>${description}</p>
          <p style="margin-top: 2rem; font-size: 0.875rem;">This window will close automatically...</p>
        </div>
        <script>setTimeout(() => window.close(), 5000);</script>
      </body>
    </html>
  `;
}
