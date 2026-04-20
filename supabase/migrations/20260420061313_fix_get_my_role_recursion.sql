
/*
  # Fix RLS infinite recursion in get_my_role and get_my_company_id

  ## Problem
  The functions get_my_role() and get_my_company_id() query the user_profiles table.
  RLS policies on user_profiles call these same functions, causing infinite recursion
  which results in "Database error querying schema" during sign-in.

  ## Fix
  Recreate both functions as SECURITY DEFINER so they run as the function owner
  (bypassing RLS), breaking the recursion cycle.
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
