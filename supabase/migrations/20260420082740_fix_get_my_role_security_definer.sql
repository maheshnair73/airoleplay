/*
  # Fix get_my_role() infinite recursion

  The get_my_role() function queries user_profiles which has RLS enabled.
  RLS policies on user_profiles call get_my_role(), creating infinite recursion.
  Fix: use SECURITY DEFINER so the function bypasses RLS when reading the role.
*/

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.user_profiles WHERE id = auth.uid();
$$;
