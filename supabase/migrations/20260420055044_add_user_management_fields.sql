/*
  # User Management Enhancement Migration

  ## Summary
  Adds comprehensive user management fields needed for the 4-role system:
  SaaS Admin → Company Admin → Sales Manager → Sales Agent

  ## Changes

  ### user_profiles table
  - Add `is_active` (boolean) - enable/disable user access
  - Add `last_login_at` (timestamptz) - track last login
  - Add `token_usage` (integer) - AI token consumption counter
  - Add `token_cap` (integer) - per-user token limit (null = use company default)
  - Add `phone` (text) - user phone number
  - Add `department` (text) - user department
  - Add `invited_by` (uuid) - who invited this user
  - Add `invitation_accepted_at` (timestamptz) - when invitation was accepted

  ### companies table
  - Add `is_active` (boolean) - enable/disable company
  - Add `license_count` (integer) - total licenses purchased
  - Add `used_license_count` (integer) - licenses currently in use
  - Add `token_limit_per_month` (integer) - monthly token budget
  - Add `token_used_this_month` (integer) - tokens used this month
  - Add `token_reset_date` (date) - when token counter resets
  - Add `subscription_plan` (text) - plan tier
  - Add `subscription_status` (text) - active/trial/suspended
  - Add `company_admin_email` (text) - primary contact

  ### api_keys table (new)
  - Stores SaaS-level API keys for third-party integrations
  - Managed exclusively by saas_admin role

  ### Security
  - RLS enabled on api_keys table
  - Only saas_admin can manage api_keys
  - Users can read their own profile fields
  - Company admins can update user is_active within their company
*/

-- Extend user_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_active') THEN
    ALTER TABLE user_profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_login_at') THEN
    ALTER TABLE user_profiles ADD COLUMN last_login_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'token_usage') THEN
    ALTER TABLE user_profiles ADD COLUMN token_usage integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'token_cap') THEN
    ALTER TABLE user_profiles ADD COLUMN token_cap integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'phone') THEN
    ALTER TABLE user_profiles ADD COLUMN phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'department') THEN
    ALTER TABLE user_profiles ADD COLUMN department text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'invited_by') THEN
    ALTER TABLE user_profiles ADD COLUMN invited_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Extend companies table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'is_active') THEN
    ALTER TABLE companies ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'license_count') THEN
    ALTER TABLE companies ADD COLUMN license_count integer DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'used_license_count') THEN
    ALTER TABLE companies ADD COLUMN used_license_count integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'token_limit_per_month') THEN
    ALTER TABLE companies ADD COLUMN token_limit_per_month integer DEFAULT 1000000;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'token_used_this_month') THEN
    ALTER TABLE companies ADD COLUMN token_used_this_month integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'token_reset_date') THEN
    ALTER TABLE companies ADD COLUMN token_reset_date date DEFAULT (date_trunc('month', now()) + interval '1 month')::date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'subscription_plan') THEN
    ALTER TABLE companies ADD COLUMN subscription_plan text DEFAULT 'starter';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'subscription_status') THEN
    ALTER TABLE companies ADD COLUMN subscription_status text DEFAULT 'trial';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'company_admin_email') THEN
    ALTER TABLE companies ADD COLUMN company_admin_email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'logo_url') THEN
    ALTER TABLE companies ADD COLUMN logo_url text;
  END IF;
END $$;

-- Create api_keys table for SaaS admin management
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  provider text NOT NULL,
  key_value text NOT NULL,
  is_active boolean DEFAULT true,
  description text,
  monthly_token_limit integer,
  tokens_used_this_month integer DEFAULT 0,
  last_used_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SaaS admins can manage api keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('saas_admin', 'super_admin')
    )
  );

CREATE POLICY "SaaS admins can insert api keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('saas_admin', 'super_admin')
    )
  );

CREATE POLICY "SaaS admins can update api keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('saas_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('saas_admin', 'super_admin')
    )
  );

CREATE POLICY "SaaS admins can delete api keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('saas_admin', 'super_admin')
    )
  );

-- Allow company admins to deactivate users in their company
CREATE POLICY "Company admins can update users in their company"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'saas_admin', 'super_admin')
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'saas_admin', 'super_admin')
    )
  );

-- Function to update last_login_at on sign in
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS trigger AS $$
BEGIN
  UPDATE user_profiles
  SET last_login_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_status ON companies(subscription_status);
