
/*
  # Drop functions that query auth schema from public schema

  In newer versions of GoTrue (20260302+), functions in the public schema
  that query auth.users directly cause "Database error querying schema"
  during the token endpoint because GoTrue validates all public functions
  that reference auth schema objects.

  The check_demo_users_exist function queries auth.users and is not needed
  for core functionality - it was only used for setup validation.
*/

DROP FUNCTION IF EXISTS public.check_demo_users_exist();
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
