/*
  # Add Media Fields to Training Documents

  ## Summary
  Extends the training_documents table to support multiple content types:
  text (markdown), video (URL-based), and audio (URL-based).

  ## Changes
  ### Modified Tables
  - `training_documents`
    - `content_type` (text) - 'text' | 'video' | 'audio', defaults to 'text'
    - `video_url` (text) - URL for video content
    - `audio_url` (text) - URL for audio content
    - `content_pages` (jsonb) - array of page objects for paginated text content
    - `min_read_seconds` (integer) - minimum seconds required before skip is allowed

  ## Notes
  - Existing rows default to content_type='text' preserving all existing content
  - min_read_seconds defaults to 30 seconds per page as a reasonable baseline
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN content_type text DEFAULT 'text';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN video_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN audio_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'content_pages'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN content_pages jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'min_read_seconds'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN min_read_seconds integer DEFAULT 30;
  END IF;
END $$;
