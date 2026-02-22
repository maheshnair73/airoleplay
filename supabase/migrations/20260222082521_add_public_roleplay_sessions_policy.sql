/*
  # Add Public/Demo Roleplay Sessions Policy
  
  1. Changes
    - Add a policy to allow viewing of demo/public roleplay sessions
    - Add is_demo column to mark demo sessions
    - Update existing demo sessions
  
  2. Security
    - Demo sessions visible to all authenticated users
    - Personal sessions remain private
*/

-- Add is_demo column to roleplay_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN is_demo boolean DEFAULT false;
  END IF;
END $$;

-- Mark sessions without user_id or user_email as demo sessions
UPDATE roleplay_sessions
SET is_demo = true
WHERE user_id IS NULL AND user_email IS NULL;

-- Add policy for demo sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'roleplay_sessions' AND policyname = 'Anyone can view demo sessions'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view demo sessions"
      ON roleplay_sessions FOR SELECT
      TO authenticated
      USING (is_demo = true)';
  END IF;
END $$;
