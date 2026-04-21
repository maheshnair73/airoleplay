/*
  # Add audio_url to roleplay_sessions

  Adds a nullable audio_url column to store a signed URL pointing to the
  recorded call audio in the call-recordings storage bucket.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN audio_url text;
  END IF;
END $$;
