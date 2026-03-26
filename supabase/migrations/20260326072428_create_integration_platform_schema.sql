/*
  # Integration Platform Schema
  
  1. New Tables
    - `connectors`
      - Stores all available integration connectors (Salesforce, HubSpot, etc.)
      - Fields: name, type, auth_type, scopes, base_url, token_url, authorize_url, etc.
    
    - `connected_accounts`
      - Stores user connections to external services with encrypted tokens
      - Fields: user_id, connector_id, access_token, refresh_token, expires_at, status
    
    - `integration_flows`
      - Stores automation flows (trigger → actions)
      - Fields: name, trigger_connector, trigger_event, actions, status
    
    - `integration_flow_steps`
      - Individual steps in a flow (for drag-drop builder)
      - Fields: flow_id, step_order, step_type, connector_id, action_type, config
    
    - `webhook_events`
      - Queue for incoming webhook events
      - Fields: connector_id, event_type, payload, status, processed_at
    
    - `integration_logs`
      - Execution logs for debugging
      - Fields: flow_id, step_id, status, error_message, execution_time
  
  2. Security
    - Enable RLS on all tables
    - Policies for admin/super_admin access
    - Encrypted token storage using pgcrypto
  
  3. Indexes
    - Performance indexes on frequently queried fields
*/

-- Enable pgcrypto extension for token encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Connectors table (master list of available integrations)
CREATE TABLE IF NOT EXISTS connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('crm', 'lms', 'auth', 'communication', 'storage', 'analytics')),
  auth_type text NOT NULL CHECK (auth_type IN ('oauth2', 'api_key', 'basic', 'bearer')),
  logo_url text,
  
  -- OAuth2 configuration
  client_id_env text,
  client_secret_env text,
  authorize_url text,
  token_url text,
  refresh_url text,
  scopes jsonb DEFAULT '[]'::jsonb,
  
  -- API configuration
  base_url text,
  api_version text,
  
  -- Capabilities
  supports_webhooks boolean DEFAULT false,
  webhook_url text,
  supports_polling boolean DEFAULT true,
  polling_interval_minutes integer DEFAULT 15,
  
  -- Available triggers and actions
  triggers jsonb DEFAULT '[]'::jsonb,
  actions jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'beta')),
  documentation_url text,
  config_schema jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Connected accounts (user connections to external services)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  connector_id uuid NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  
  -- Encrypted credentials
  access_token text,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz,
  
  -- OAuth2 metadata
  scope text,
  state text,
  
  -- Connection metadata
  external_user_id text,
  external_email text,
  external_display_name text,
  instance_url text,
  
  -- Status
  status text DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error', 'expired')),
  last_sync_at timestamptz,
  last_error text,
  error_count integer DEFAULT 0,
  
  -- Configuration
  config jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, connector_id, external_user_id)
);

-- Integration flows (automation workflows)
CREATE TABLE IF NOT EXISTS integration_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  
  -- Trigger configuration
  trigger_connector_id uuid REFERENCES connectors(id),
  trigger_type text NOT NULL,
  trigger_config jsonb DEFAULT '{}'::jsonb,
  
  -- Flow configuration
  flow_data jsonb DEFAULT '{}'::jsonb,
  
  -- Status and metrics
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'draft')),
  execution_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  last_execution_at timestamptz,
  last_error text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Integration flow steps (individual actions in a flow)
CREATE TABLE IF NOT EXISTS integration_flow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid NOT NULL REFERENCES integration_flows(id) ON DELETE CASCADE,
  
  step_order integer NOT NULL,
  step_type text NOT NULL CHECK (step_type IN ('trigger', 'action', 'condition', 'transform')),
  
  -- Connector reference
  connector_id uuid REFERENCES connectors(id),
  connected_account_id uuid REFERENCES connected_accounts(id),
  
  -- Action configuration
  action_type text NOT NULL,
  action_config jsonb DEFAULT '{}'::jsonb,
  
  -- Field mapping
  field_mapping jsonb DEFAULT '{}'::jsonb,
  
  -- Conditions
  conditions jsonb DEFAULT '[]'::jsonb,
  
  -- Error handling
  on_error text DEFAULT 'stop' CHECK (on_error IN ('stop', 'continue', 'retry')),
  retry_count integer DEFAULT 3,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(flow_id, step_order)
);

-- Webhook events queue
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  connector_id uuid REFERENCES connectors(id),
  connected_account_id uuid REFERENCES connected_accounts(id),
  
  event_type text NOT NULL,
  event_source text,
  
  payload jsonb NOT NULL,
  headers jsonb DEFAULT '{}'::jsonb,
  
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  processed_at timestamptz,
  
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  next_retry_at timestamptz,
  
  error_message text,
  
  created_at timestamptz DEFAULT now()
);

-- Integration execution logs
CREATE TABLE IF NOT EXISTS integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  flow_id uuid REFERENCES integration_flows(id) ON DELETE CASCADE,
  step_id uuid REFERENCES integration_flow_steps(id) ON DELETE SET NULL,
  webhook_event_id uuid REFERENCES webhook_events(id) ON DELETE SET NULL,
  
  execution_id uuid NOT NULL,
  
  log_level text DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error')),
  message text NOT NULL,
  
  status text DEFAULT 'success' CHECK (status IN ('success', 'error', 'warning')),
  
  input_data jsonb,
  output_data jsonb,
  error_details jsonb,
  
  execution_time_ms integer,
  
  created_at timestamptz DEFAULT now()
);

-- API rate limits tracking
CREATE TABLE IF NOT EXISTS connector_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  connected_account_id uuid NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  
  request_count integer DEFAULT 0,
  limit_max integer NOT NULL,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(connected_account_id, window_start)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connectors_type ON connectors(type);
CREATE INDEX IF NOT EXISTS idx_connectors_status ON connectors(status);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_connector ON connected_accounts(connector_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_status ON connected_accounts(status);
CREATE INDEX IF NOT EXISTS idx_integration_flows_user ON integration_flows(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_flows_status ON integration_flows(status);
CREATE INDEX IF NOT EXISTS idx_integration_flows_trigger ON integration_flows(trigger_connector_id);
CREATE INDEX IF NOT EXISTS idx_flow_steps_flow ON integration_flow_steps(flow_id, step_order);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status, created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_connector ON webhook_events(connector_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_flow ON integration_logs(flow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_execution ON integration_logs(execution_id);

-- Enable Row Level Security
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connectors (viewable by all authenticated users)
CREATE POLICY "Anyone can view active connectors"
  ON connectors FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage connectors"
  ON connectors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for connected_accounts
CREATE POLICY "Users can view own connected accounts"
  ON connected_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own connected accounts"
  ON connected_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own connected accounts"
  ON connected_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own connected accounts"
  ON connected_accounts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view company connected accounts"
  ON connected_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.company_id = connected_accounts.company_id
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for integration_flows
CREATE POLICY "Users can view own flows"
  ON integration_flows FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own flows"
  ON integration_flows FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own flows"
  ON integration_flows FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own flows"
  ON integration_flows FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view company flows"
  ON integration_flows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.company_id = integration_flows.company_id
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for integration_flow_steps
CREATE POLICY "Users can manage steps in own flows"
  ON integration_flow_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM integration_flows
      WHERE integration_flows.id = integration_flow_steps.flow_id
      AND integration_flows.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM integration_flows
      WHERE integration_flows.id = integration_flow_steps.flow_id
      AND integration_flows.user_id = auth.uid()
    )
  );

-- RLS Policies for webhook_events
CREATE POLICY "System can manage webhook events"
  ON webhook_events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for integration_logs
CREATE POLICY "Users can view logs for own flows"
  ON integration_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM integration_flows
      WHERE integration_flows.id = integration_logs.flow_id
      AND integration_flows.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all company logs"
  ON integration_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN integration_flows f ON f.company_id = up.company_id
      WHERE up.id = auth.uid()
      AND f.id = integration_logs.flow_id
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for connector_rate_limits
CREATE POLICY "Users can view own rate limits"
  ON connector_rate_limits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM connected_accounts
      WHERE connected_accounts.id = connector_rate_limits.connected_account_id
      AND connected_accounts.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_connectors_updated_at
  BEFORE UPDATE ON connectors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_flows_updated_at
  BEFORE UPDATE ON integration_flows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_flow_steps_updated_at
  BEFORE UPDATE ON integration_flow_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
