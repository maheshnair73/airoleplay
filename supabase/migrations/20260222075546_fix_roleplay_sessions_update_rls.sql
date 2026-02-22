/*
  # Fix Roleplay Sessions Update RLS Policy

  1. Changes
    - Drop existing restrictive update policy
    - Create new policy allowing both session participants to update
    - Allow updates by initiator or prospect player based on email match

  2. Security
    - Maintains authentication requirement
    - Only allows participants in the session to update it
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own roleplay sessions" ON roleplay_sessions;

-- Create new policy allowing both participants to update
CREATE POLICY "Session participants can update"
  ON roleplay_sessions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) = initiator_email OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) = prospect_player_email
  )
  WITH CHECK (
    auth.uid() = user_id OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) = initiator_email OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) = prospect_player_email
  );
