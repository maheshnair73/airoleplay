/*
  # Add Human Roleplay Fields to Roleplay Sessions

  1. Changes
    - Add fields for human-to-human roleplay sessions
    - Add session_type to differentiate AI vs human roleplay
    - Add lead_id for linking to specific leads
    - Add initiator_email for session creator
    - Add prospect_player_email for the person playing prospect
    - Add session_status for tracking invitation status
    - Add rep_notes and prospect_notes for session instructions
    - Add scheduled_for for scheduling sessions
    - Add meeting_details for meeting platform info
    - Add invitee_list for additional participants

  2. Notes
    - Uses IF NOT EXISTS to prevent errors on re-run
    - All new fields are nullable to maintain compatibility
*/

-- Add session_type field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'session_type'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN session_type text DEFAULT 'ai_roleplay';
  END IF;
END $$;

-- Add lead_id field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'lead_id'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN lead_id uuid REFERENCES leads(id);
  END IF;
END $$;

-- Add initiator_email field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'initiator_email'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN initiator_email text;
  END IF;
END $$;

-- Add prospect_player_email field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'prospect_player_email'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN prospect_player_email text;
  END IF;
END $$;

-- Add session_status field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'session_status'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN session_status text DEFAULT 'active';
  END IF;
END $$;

-- Add rep_notes field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'rep_notes'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN rep_notes text;
  END IF;
END $$;

-- Add prospect_notes field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'prospect_notes'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN prospect_notes text;
  END IF;
END $$;

-- Add scheduled_for field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'scheduled_for'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN scheduled_for timestamptz;
  END IF;
END $$;

-- Add meeting_details field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'meeting_details'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN meeting_details jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add invitee_list field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'invitee_list'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN invitee_list jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create index for lead_id lookups
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_lead_id ON roleplay_sessions(lead_id);

-- Create index for initiator_email lookups
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_initiator_email ON roleplay_sessions(initiator_email);

-- Create index for prospect_player_email lookups
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_prospect_player_email ON roleplay_sessions(prospect_player_email);
