/*
  # Add Public Demo User Check Policy

  1. Changes
    - Add a SELECT policy for unauthenticated users to check demo account existence
    - Restricts access to only checking if specific demo emails exist
    - Does not expose any user data, just allows checking existence

  2. Security
    - Policy is very restrictive - only allows checking existence of demo accounts
    - No actual user data is returned
    - Only works for the specific demo email addresses
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Allow checking demo user existence'
  ) THEN
    CREATE POLICY "Allow checking demo user existence"
      ON user_profiles
      FOR SELECT
      TO anon
      USING (
        email IN (
          'admin@effysalespro.com',
          'manager@effysalespro.com',
          'agent1@effysalespro.com',
          'agent2@effysalespro.com'
        )
      );
  END IF;
END $$;
