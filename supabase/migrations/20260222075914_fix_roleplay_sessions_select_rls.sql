/*
  # Fix Roleplay Sessions SELECT RLS Policy

  1. Changes
    - Drop existing restrictive SELECT policy
    - Create new policy allowing both session participants to view
    - Allow viewing by initiator, prospect player, or user_id match

  2. Security
    - Maintains authentication requirement
    - Only allows participants in the session to view it
*/

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view own roleplay sessions" ON roleplay_sessions;

-- Create new policy allowing both participants to view
CREATE POLICY "Session participants can view"
  ON roleplay_sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) = initiator_email OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) = prospect_player_email
  );
