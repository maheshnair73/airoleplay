/*
  # Company & User Module Assignment System

  ## Summary
  Creates a two-tier modular access control system:
  1. Super admins assign which modules a company can access
  2. Company admins then assign those modules to individual users

  ## New Tables

  ### company_module_assignments
  - Which modules are enabled for each company
  - Controlled by super_admin only
  - Columns: company_id, module_id, is_enabled, created_by, created_at

  ### user_module_assignments
  - Which modules each user within a company has access to
  - Controlled by company_admin (within their company_module_assignments)
  - Columns: user_id, company_id, module_id, is_enabled, assigned_by, created_at

  ## Security
  - RLS enabled on both tables
  - Super admins can manage company_module_assignments
  - Company admins can manage user_module_assignments for their own company
  - Users can read their own user_module_assignments
*/

CREATE TABLE IF NOT EXISTS company_module_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  module_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, module_id)
);

ALTER TABLE company_module_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage company modules"
  ON company_module_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.company_id = company_module_assignments.company_id
      AND user_profiles.role IN ('company_admin')
    )
  );

CREATE POLICY "Super admins can insert company modules"
  ON company_module_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
    )
  );

CREATE POLICY "Super admins can update company modules"
  ON company_module_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
    )
  );

CREATE POLICY "Super admins can delete company modules"
  ON company_module_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
    )
  );

CREATE TABLE IF NOT EXISTS user_module_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  module_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  assigned_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE user_module_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own module assignments"
  ON user_module_assignments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.company_id = user_module_assignments.company_id
      AND user_profiles.role IN ('company_admin', 'admin', 'saas_admin', 'super_admin')
    )
  );

CREATE POLICY "Company admins can insert user module assignments"
  ON user_module_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.company_id = user_module_assignments.company_id
      AND user_profiles.role IN ('company_admin', 'admin', 'saas_admin', 'super_admin')
    )
  );

CREATE POLICY "Company admins can update user module assignments"
  ON user_module_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.company_id = user_module_assignments.company_id
      AND user_profiles.role IN ('company_admin', 'admin', 'saas_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.company_id = user_module_assignments.company_id
      AND user_profiles.role IN ('company_admin', 'admin', 'saas_admin', 'super_admin')
    )
  );

CREATE POLICY "Company admins can delete user module assignments"
  ON user_module_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.company_id = user_module_assignments.company_id
      AND user_profiles.role IN ('company_admin', 'admin', 'saas_admin', 'super_admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_company_module_assignments_company ON company_module_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_user_module_assignments_user ON user_module_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_assignments_company ON user_module_assignments(company_id);
