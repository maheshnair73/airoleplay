/*
  # Fix User Profiles RLS Infinite Recursion

  1. Problem
    - Policies that check role by querying user_profiles cause infinite recursion
    - When checking if user can SELECT, it needs to SELECT to check the policy

  2. Solution
    - Create a SECURITY DEFINER function to get user role without RLS
    - Replace recursive policies with simpler ones using the function

  3. Security
    - Function only returns role for the current user
    - Maintains all access controls through simplified policies
*/

-- Create a function to get current user's role without triggering RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

-- Create a function to get current user's company_id without triggering RLS
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM public.user_profiles WHERE id = auth.uid();
$$;

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can view company users" ON user_profiles;
DROP POLICY IF EXISTS "Managers can view company users" ON user_profiles;

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON user_profiles;

-- Create new non-recursive SELECT policies
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (get_my_role() = 'super_admin');

CREATE POLICY "Company admins can view company users"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'company_admin' 
    AND company_id = get_my_company_id()
    AND get_my_company_id() IS NOT NULL
  );

CREATE POLICY "Managers can view company users"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'sales_manager' 
    AND company_id = get_my_company_id()
    AND get_my_company_id() IS NOT NULL
  );

-- Create new non-recursive UPDATE policies
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');
