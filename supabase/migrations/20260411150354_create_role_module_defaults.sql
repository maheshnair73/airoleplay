/*
  # Role Module Defaults

  ## Summary
  Stores default module access per user role. When a user with a given role
  is assigned modules, these defaults determine which modules they get automatically.

  ## New Table: role_module_defaults
  - role: the user role (sales_agent, sales_manager, company_admin, etc.)
  - module_id: the module identifier
  - is_enabled: whether this module is on by default for this role
  - company_id: optional — if null, applies globally; if set, company-specific overrides

  ## Security
  - Super admins can manage all role defaults
  - Company admins can manage role defaults for their own company
  - All authenticated users can read defaults
*/

CREATE TABLE IF NOT EXISTS role_module_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  module_id text NOT NULL,
  module_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role, module_id, company_id)
);

ALTER TABLE role_module_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read role module defaults"
  ON role_module_defaults
  FOR SELECT
  TO authenticated
  USING (
    company_id IS NULL
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.company_id = role_module_defaults.company_id
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
    )
  );

CREATE POLICY "Admins can insert role module defaults"
  ON role_module_defaults
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
          OR (
            user_profiles.role = 'company_admin'
            AND user_profiles.company_id = role_module_defaults.company_id
          )
        )
    )
  );

CREATE POLICY "Admins can update role module defaults"
  ON role_module_defaults
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
          OR (
            user_profiles.role = 'company_admin'
            AND user_profiles.company_id = role_module_defaults.company_id
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
          OR (
            user_profiles.role = 'company_admin'
            AND user_profiles.company_id = role_module_defaults.company_id
          )
        )
    )
  );

CREATE POLICY "Admins can delete role module defaults"
  ON role_module_defaults
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role IN ('super_admin', 'admin', 'saas_admin')
          OR (
            user_profiles.role = 'company_admin'
            AND user_profiles.company_id = role_module_defaults.company_id
          )
        )
    )
  );

CREATE INDEX IF NOT EXISTS idx_role_module_defaults_role ON role_module_defaults(role);
CREATE INDEX IF NOT EXISTS idx_role_module_defaults_company ON role_module_defaults(company_id);
