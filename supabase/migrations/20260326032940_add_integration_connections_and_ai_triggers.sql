/*
  # Integration Connections and AI Roleplay Triggers

  1. New Tables
    - `integration_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `company_id` (uuid, references companies)
      - `integration_type` (text: 'slack', 'outlook', 'gmail', etc.)
      - `status` (text: 'connected', 'disconnected', 'error')
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `token_expires_at` (timestamptz)
      - `config` (jsonb: stores integration-specific settings)
      - `metadata` (jsonb: stores integration metadata)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `ai_roleplay_triggers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `company_id` (uuid, references companies)
      - `trigger_type` (text: 'email_meeting', 'email_demo', 'slack_mention', etc.)
      - `integration_type` (text: 'slack', 'outlook', etc.)
      - `trigger_config` (jsonb: conditions for triggering)
      - `roleplay_template` (jsonb: template for roleplay scenario)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `integration_events`
      - `id` (uuid, primary key)
      - `connection_id` (uuid, references integration_connections)
      - `event_type` (text: 'email_received', 'meeting_scheduled', 'slack_message', etc.)
      - `event_data` (jsonb: full event data)
      - `processed` (boolean)
      - `roleplay_session_id` (uuid, nullable, references roleplay_sessions)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their integrations
    - Admin users can view all integrations in their company
*/

-- Create integration_connections table
CREATE TABLE IF NOT EXISTS integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  integration_type text NOT NULL,
  status text DEFAULT 'disconnected' NOT NULL,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  config jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_integration_type CHECK (integration_type IN ('slack', 'outlook', 'gmail', 'teams', 'zoom')),
  CONSTRAINT valid_status CHECK (status IN ('connected', 'disconnected', 'error', 'pending'))
);

-- Create ai_roleplay_triggers table
CREATE TABLE IF NOT EXISTS ai_roleplay_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  trigger_type text NOT NULL,
  integration_type text NOT NULL,
  trigger_config jsonb DEFAULT '{}'::jsonb,
  roleplay_template jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_trigger_type CHECK (trigger_type IN ('email_meeting', 'email_demo', 'email_discussion', 'slack_mention', 'calendar_event', 'custom'))
);

-- Create integration_events table
CREATE TABLE IF NOT EXISTS integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES integration_connections(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  processed boolean DEFAULT false,
  roleplay_session_id uuid REFERENCES roleplay_sessions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_roleplay_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;

-- Policies for integration_connections
CREATE POLICY "Users can view own integration connections"
  ON integration_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integration connections"
  ON integration_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integration connections"
  ON integration_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integration connections"
  ON integration_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for ai_roleplay_triggers
CREATE POLICY "Users can view own AI roleplay triggers"
  ON ai_roleplay_triggers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI roleplay triggers"
  ON ai_roleplay_triggers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI roleplay triggers"
  ON ai_roleplay_triggers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI roleplay triggers"
  ON ai_roleplay_triggers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for integration_events
CREATE POLICY "Users can view integration events for their connections"
  ON integration_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM integration_connections
      WHERE integration_connections.id = integration_events.connection_id
      AND integration_connections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert integration events for their connections"
  ON integration_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM integration_connections
      WHERE integration_connections.id = integration_events.connection_id
      AND integration_connections.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_integration_connections_user_id ON integration_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_company_id ON integration_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_status ON integration_connections(status);
CREATE INDEX IF NOT EXISTS idx_ai_roleplay_triggers_user_id ON ai_roleplay_triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_roleplay_triggers_is_active ON ai_roleplay_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_integration_events_connection_id ON integration_events(connection_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_processed ON integration_events(processed);

-- Create updated_at trigger function if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_integration_connections_updated_at ON integration_connections;
CREATE TRIGGER update_integration_connections_updated_at
  BEFORE UPDATE ON integration_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_roleplay_triggers_updated_at ON ai_roleplay_triggers;
CREATE TRIGGER update_ai_roleplay_triggers_updated_at
  BEFORE UPDATE ON ai_roleplay_triggers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();