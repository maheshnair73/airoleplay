/*
  # Create Module Configuration Table

  1. Purpose
    - Create a table to store global module configuration
    - This is separate from per-user module access
    - Allows admins to enable/disable modules and control access
    
  2. New Table
    - `module_configuration`
      - `id` (uuid, primary key)
      - `module_id` (text, unique) - The module identifier
      - `module_name` (text) - Display name of the module
      - `is_enabled` (boolean) - Whether module is globally enabled
      - `access_type` (text) - 'all_users' or 'specific_users'
      - `allowed_users` (text[]) - Array of user emails with access (when specific_users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  3. Security
    - Enable RLS
    - All users can read module configuration
    - Only admins can modify
*/

CREATE TABLE IF NOT EXISTS module_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text UNIQUE NOT NULL,
  module_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  access_type text DEFAULT 'all_users' CHECK (access_type IN ('all_users', 'specific_users')),
  allowed_users text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE module_configuration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view module configuration"
  ON module_configuration
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert module configuration"
  ON module_configuration
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'saas_admin')
    )
  );

CREATE POLICY "Admins can update module configuration"
  ON module_configuration
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'saas_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'saas_admin')
    )
  );

CREATE POLICY "Admins can delete module configuration"
  ON module_configuration
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'saas_admin')
    )
  );

-- Seed default modules
INSERT INTO module_configuration (module_id, module_name, is_enabled, access_type, allowed_users)
VALUES
  ('Dashboard', 'Dashboard', true, 'all_users', '{}'),
  ('Leads', 'Leads', true, 'all_users', '{}'),
  ('Deals', 'Deals', true, 'all_users', '{}'),
  ('EmailHub', 'Email Hub', true, 'all_users', '{}'),
  ('Documents', 'Documents', true, 'all_users', '{}'),
  ('Playbooks', 'Playbooks', true, 'all_users', '{}'),
  ('DigitalSalesRooms', 'Digital Sales Rooms', true, 'all_users', '{}'),
  ('AISalesAgent', 'AI Sales Agent', true, 'all_users', '{}'),
  ('CoachingHub', 'AI Coaching Hub', true, 'all_users', '{}'),
  ('AIRoleplay', 'AI Roleplay', true, 'all_users', '{}'),
  ('CallAnalytics', 'Call Analytics', true, 'all_users', '{}'),
  ('Analytics', 'Performance Analytics', true, 'all_users', '{}'),
  ('VoiceAIDialer', 'AI Voice Dialer', true, 'all_users', '{}'),
  ('Dialer', 'Manual Dialer', true, 'all_users', '{}')
ON CONFLICT (module_id) DO NOTHING;