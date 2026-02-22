/*
  # Fix User Profiles Insert Policy

  1. Changes
    - Add INSERT policy for user_profiles table to allow profile creation during signup
    - This allows the trigger function to insert profiles when new users are created

  2. Security
    - Policy allows inserts only when the user_id matches the authenticated user
    - Also allows service role to insert (for triggers)
*/

-- Add INSERT policy for user profiles
CREATE POLICY "Allow profile creation on signup"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add a more permissive policy for the trigger/service role
CREATE POLICY "Service role can insert profiles"
  ON user_profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
