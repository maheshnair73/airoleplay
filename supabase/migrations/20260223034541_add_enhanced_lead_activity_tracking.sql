/*
  # Enhanced Lead Activity Tracking for Conversational CRM

  1. Updates to Existing Tables
    - Enhanced `lead_activities` table with additional fields for post-call tracking
    - Added fields: outcome, next_steps, follow_up_date, call_sentiment, key_talking_points

  2. New Features
    - Support for conversational post-call assistant data
    - Better tracking of call outcomes and next steps
    - Integration with AI-driven insights

  3. Security
    - Maintains existing RLS policies
    - Ensures data is accessible only to authenticated users
*/

-- Enhance lead_activities table with additional fields for post-call assistant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_activities' AND column_name = 'outcome'
  ) THEN
    ALTER TABLE lead_activities ADD COLUMN outcome text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_activities' AND column_name = 'next_steps'
  ) THEN
    ALTER TABLE lead_activities ADD COLUMN next_steps text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_activities' AND column_name = 'follow_up_date'
  ) THEN
    ALTER TABLE lead_activities ADD COLUMN follow_up_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_activities' AND column_name = 'call_sentiment'
  ) THEN
    ALTER TABLE lead_activities ADD COLUMN call_sentiment text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_activities' AND column_name = 'key_talking_points'
  ) THEN
    ALTER TABLE lead_activities ADD COLUMN key_talking_points text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_activities' AND column_name = 'pain_points_discussed'
  ) THEN
    ALTER TABLE lead_activities ADD COLUMN pain_points_discussed text;
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id_created ON lead_activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_activity_type ON lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_follow_up ON lead_activities(follow_up_date) WHERE follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_activities_outcome ON lead_activities(outcome) WHERE outcome IS NOT NULL;

-- Enhance leads table to track elevator pitch usage
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'last_pitch_generated_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN last_pitch_generated_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'pitch_practice_count'
  ) THEN
    ALTER TABLE leads ADD COLUMN pitch_practice_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'last_call_date'
  ) THEN
    ALTER TABLE leads ADD COLUMN last_call_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'total_call_count'
  ) THEN
    ALTER TABLE leads ADD COLUMN total_call_count integer DEFAULT 0;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN lead_activities.outcome IS 'Call outcome: connected_positive, connected_neutral, connected_negative, voicemail, no_answer';
COMMENT ON COLUMN lead_activities.next_steps IS 'Next action to take: schedule_meeting, send_proposal, follow_up_call, no_action';
COMMENT ON COLUMN lead_activities.call_sentiment IS 'Overall sentiment from the call: positive, neutral, negative';
COMMENT ON COLUMN lead_activities.key_talking_points IS 'Main topics and points discussed during the call';
COMMENT ON COLUMN lead_activities.pain_points_discussed IS 'Pain points and challenges mentioned by the prospect';
