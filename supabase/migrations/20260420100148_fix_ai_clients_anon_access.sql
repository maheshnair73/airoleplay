/*
  # Fix ai_clients visibility for anon role

  ## Problem
  The app uses a local mock auth system that does not issue real Supabase JWTs.
  As a result, all Supabase DB queries run as the `anon` role, not `authenticated`.
  The existing SELECT policy on `ai_clients` is scoped to `authenticated` only,
  causing all bot queries to return 0 rows even for `visibility = 'all_users'` bots.

  ## Changes
  - Add a new SELECT policy allowing the `anon` role to read bots where
    `is_active = true` AND `visibility = 'all_users'`
  - This is safe because these bots are intentionally public to all users
*/

CREATE POLICY "Anon users can view public bots"
  ON ai_clients
  FOR SELECT
  TO anon
  USING (
    is_active = true
    AND visibility = 'all_users'
  );
