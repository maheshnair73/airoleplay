/*
  # Add Call Transcriptions Support

  1. New Tables
    - `call_transcriptions` - Store transcription data for roleplay calls
      - `id` (uuid, primary key)
      - `session_id` (uuid) - References the roleplay/call session
      - `video_url` (text) - URL to the recorded video
      - `duration` (integer) - Total duration in seconds
      - `created_by` (uuid) - User who created the transcription
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `transcription_segments` - Store individual speaker segments
      - `id` (uuid, primary key)
      - `transcription_id` (uuid, references call_transcriptions)
      - `speaker_name` (text) - Name of the speaker
      - `speaker_type` (text) - 'user' or 'participant'
      - `start_time` (numeric) - Start time in seconds
      - `end_time` (numeric) - End time in seconds
      - `text` (text) - Transcribed text
      - `confidence` (numeric) - Confidence score (0-1)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can view transcriptions for their own sessions
    - Managers and admins can view team transcriptions

  3. Indexes
    - Index on transcription_id for fast segment lookups
    - Index on session_id for fast transcription lookups
    - Index on start_time for timeline queries
*/

-- Create call_transcriptions table
CREATE TABLE IF NOT EXISTS call_transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  video_url text,
  duration integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transcription_segments table
CREATE TABLE IF NOT EXISTS transcription_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id uuid NOT NULL REFERENCES call_transcriptions(id) ON DELETE CASCADE,
  speaker_name text NOT NULL,
  speaker_type text NOT NULL DEFAULT 'user',
  start_time numeric NOT NULL,
  end_time numeric NOT NULL,
  text text NOT NULL,
  confidence numeric DEFAULT 0.95,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE call_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_segments ENABLE ROW LEVEL SECURITY;

-- Policies for call_transcriptions
CREATE POLICY "Users can view own transcriptions"
  ON call_transcriptions FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Managers can view team transcriptions"
  ON call_transcriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON up1.company_id = up2.company_id
      WHERE up1.id = auth.uid()
      AND up1.role IN ('sales_manager', 'company_admin', 'super_admin')
      AND up2.id = call_transcriptions.created_by
    )
  );

CREATE POLICY "Users can create transcriptions"
  ON call_transcriptions FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own transcriptions"
  ON call_transcriptions FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policies for transcription_segments
CREATE POLICY "Users can view segments of accessible transcriptions"
  ON transcription_segments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM call_transcriptions
      WHERE call_transcriptions.id = transcription_segments.transcription_id
      AND (
        call_transcriptions.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles up1
          JOIN user_profiles up2 ON up1.company_id = up2.company_id
          WHERE up1.id = auth.uid()
          AND up1.role IN ('sales_manager', 'company_admin', 'super_admin')
          AND up2.id = call_transcriptions.created_by
        )
      )
    )
  );

CREATE POLICY "Users can create segments"
  ON transcription_segments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM call_transcriptions
      WHERE call_transcriptions.id = transcription_segments.transcription_id
      AND call_transcriptions.created_by = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_transcriptions_session ON call_transcriptions(session_id);
CREATE INDEX IF NOT EXISTS idx_call_transcriptions_created_by ON call_transcriptions(created_by);
CREATE INDEX IF NOT EXISTS idx_transcription_segments_transcription ON transcription_segments(transcription_id);
CREATE INDEX IF NOT EXISTS idx_transcription_segments_start_time ON transcription_segments(transcription_id, start_time);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transcription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_call_transcriptions_updated_at
  BEFORE UPDATE ON call_transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_transcription_updated_at();
