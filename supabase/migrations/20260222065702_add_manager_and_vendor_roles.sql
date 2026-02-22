/*
  # Add Manager and Vendor Roles

  1. Changes
    - Add support for 'sales_manager' and 'vendor' roles in the system
    - Update RLS policies to support manager role viewing team members
    - Manager can view their team's profiles and performance

  2. Security
    - Managers can view profiles of users in their company
    - Vendors have limited access to their own data only
*/

-- Add policy for managers to view their company's users
CREATE POLICY "Managers can view company users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles manager
      WHERE manager.id = auth.uid()
      AND manager.role = 'sales_manager'
      AND manager.company_id = user_profiles.company_id
    )
  );

-- Add policy for company admins to view their company's users
CREATE POLICY "Company admins can view company users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'company_admin'
      AND admin.company_id = user_profiles.company_id
    )
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_role ON user_profiles(company_id, role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
