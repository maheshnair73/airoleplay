
/*
  # Fix user_profiles RLS self-referencing policies

  ## Problem
  The "Company admins can update users in their company" policy uses subqueries 
  directly into user_profiles from within a user_profiles policy, causing infinite
  recursion even with SECURITY DEFINER functions, because the subquery itself
  triggers RLS evaluation again.

  ## Fix
  Replace all self-referencing subquery policies on user_profiles with versions
  that use the SECURITY DEFINER get_my_role() and get_my_company_id() functions,
  which bypass RLS entirely.
*/

DROP POLICY IF EXISTS "Company admins can update users in their company" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can view company users" ON user_profiles;
DROP POLICY IF EXISTS "Managers can view company users" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON user_profiles;

CREATE POLICY "Company admins can update users in their company"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    company_id = get_my_company_id()
    AND get_my_role() = ANY(ARRAY['company_admin', 'saas_admin', 'super_admin'])
  )
  WITH CHECK (
    company_id = get_my_company_id()
    AND get_my_role() = ANY(ARRAY['company_admin', 'saas_admin', 'super_admin'])
  );

CREATE POLICY "Company admins can view company users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'company_admin'
    AND company_id = get_my_company_id()
    AND get_my_company_id() IS NOT NULL
  );

CREATE POLICY "Managers can view company users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'sales_manager'
    AND company_id = get_my_company_id()
    AND get_my_company_id() IS NOT NULL
  );

CREATE POLICY "Super admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (get_my_role() = 'super_admin');

CREATE POLICY "Super admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY "SaaS admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (get_my_role() = 'saas_admin');
