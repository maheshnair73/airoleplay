
/*
  # Fix "Database error querying schema" on auth sign-in

  ## Problem
  Foreign key constraints from public tables pointing to auth.users
  can cause the Supabase Auth server to fail with "Database error querying schema"
  when it introspects the schema during token generation.

  ## Fix
  Drop the foreign key constraint on invited_by that references auth.users.
  Keep the column but remove the FK constraint.
*/

ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_invited_by_fkey;
ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_created_by_fkey;
