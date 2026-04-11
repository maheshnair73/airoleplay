/*
  # Allow company_admin to manage their own company's module assignments

  ## Problem
  The INSERT and UPDATE RLS policies on company_module_assignments only
  allowed super_admin/admin/saas_admin roles, blocking company_admin users
  from enabling or disabling modules for their own company.

  ## Changes
  - Drop existing INSERT, UPDATE, DELETE policies
  - Re-create them to also allow company_admin for their own company_id
*/

DROP POLICY IF EXISTS "Super admins can insert company modules" ON company_module_assignments;
DROP POLICY IF EXISTS "Super admins can update company modules" ON company_module_assignments;
DROP POLICY IF EXISTS "Super admins can delete company modules" ON company_module_assignments;

CREATE POLICY "Admins can insert company modules"
  ON company_module_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role = ANY (ARRAY['super_admin','admin','saas_admin'])
          OR (
            user_profiles.role = 'company_admin'
            AND user_profiles.company_id = company_module_assignments.company_id
          )
        )
    )
  );

CREATE POLICY "Admins can update company modules"
  ON company_module_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role = ANY (ARRAY['super_admin','admin','saas_admin'])
          OR (
            user_profiles.role = 'company_admin'
            AND user_profiles.company_id = company_module_assignments.company_id
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role = ANY (ARRAY['super_admin','admin','saas_admin'])
          OR (
            user_profiles.role = 'company_admin'
            AND user_profiles.company_id = company_module_assignments.company_id
          )
        )
    )
  );

CREATE POLICY "Admins can delete company modules"
  ON company_module_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (
          user_profiles.role = ANY (ARRAY['super_admin','admin','saas_admin'])
          OR (
            user_profiles.role = 'company_admin'
            AND user_profiles.company_id = company_module_assignments.company_id
          )
        )
    )
  );
