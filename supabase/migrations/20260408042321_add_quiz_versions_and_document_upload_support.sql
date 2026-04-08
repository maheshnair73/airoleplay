/*
  # Add Quiz Versions and Document Upload Support

  ## Overview
  This migration extends the training system to support multiple quiz versions for the same training document
  and adds file upload capabilities for training materials.

  ## Changes Made

  1. New Tables
    - `training_quiz_sets`
      - Organizes different quiz variations for the same training document
      - Fields: id, document_id, version_name, description, is_default, created_by, created_date, updated_date
      - Allows admins to create multiple quiz versions (e.g., "Version A", "Retake Quiz", "Advanced Level")
    
  2. Schema Updates
    - `training_documents` table - Added fields:
      - `file_url` (text): URL to uploaded document file (PDF, DOCX, PPT, etc.)
      - `file_type` (text): File type/extension (pdf, docx, pptx, etc.)
      - `file_size_bytes` (integer): File size for storage tracking
      - `thumbnail_url` (text): Preview thumbnail URL
      - `question_count` (integer): Cached count of associated quiz questions
      - `last_question_update` (timestamptz): Timestamp of last question modification
    
    - `training_quiz_questions` table - Added fields:
      - `quiz_set_id` (uuid): Links question to specific quiz version/set
      - `points` (integer): Point value for this question (default 1)
      - `tags` (jsonb): Array of tags for question categorization and filtering
    
    - `agent_training_attempts` table - Added fields:
      - `quiz_set_id` (uuid): Tracks which quiz version was used in this attempt
      - `question_responses` (jsonb): Detailed response data per question
  
  3. Security
    - Enable RLS on training_quiz_sets table
    - Authenticated users can view quiz sets for active training documents
    - Only admins can create, update, or delete quiz sets
    - All policies follow existing training system security patterns

  4. Indexes
    - Added indexes for quiz_set_id foreign keys to optimize query performance
    - Added index on training_documents.file_type for filtering uploaded content

  ## Notes
  - Default quiz set can be marked using is_default flag
  - Multiple quiz sets can exist for one document, but only one should be default
  - File uploads are stored in Supabase storage, URLs stored in database
  - Question count is cached for performance, should be updated via trigger or application logic
*/

-- Create training_quiz_sets table
CREATE TABLE IF NOT EXISTS training_quiz_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES training_documents(id) ON DELETE CASCADE,
  version_name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_by text NOT NULL,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now(),
  UNIQUE(document_id, version_name)
);

ALTER TABLE training_quiz_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view quiz sets"
  ON training_quiz_sets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_documents
      WHERE training_documents.id = training_quiz_sets.document_id
      AND training_documents.is_active = true
    )
  );

CREATE POLICY "Admins can create quiz sets"
  ON training_quiz_sets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update quiz sets"
  ON training_quiz_sets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete quiz sets"
  ON training_quiz_sets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add new columns to training_documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN file_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN file_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'file_size_bytes'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN file_size_bytes integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN thumbnail_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'question_count'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN question_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_documents' AND column_name = 'last_question_update'
  ) THEN
    ALTER TABLE training_documents ADD COLUMN last_question_update timestamptz;
  END IF;
END $$;

-- Add new columns to training_quiz_questions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_quiz_questions' AND column_name = 'quiz_set_id'
  ) THEN
    ALTER TABLE training_quiz_questions ADD COLUMN quiz_set_id uuid REFERENCES training_quiz_sets(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_quiz_questions' AND column_name = 'points'
  ) THEN
    ALTER TABLE training_quiz_questions ADD COLUMN points integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_quiz_questions' AND column_name = 'tags'
  ) THEN
    ALTER TABLE training_quiz_questions ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add new columns to agent_training_attempts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_training_attempts' AND column_name = 'quiz_set_id'
  ) THEN
    ALTER TABLE agent_training_attempts ADD COLUMN quiz_set_id uuid REFERENCES training_quiz_sets(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_training_attempts' AND column_name = 'question_responses'
  ) THEN
    ALTER TABLE agent_training_attempts ADD COLUMN question_responses jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_sets_document ON training_quiz_sets(document_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sets_default ON training_quiz_sets(document_id, is_default);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_set ON training_quiz_questions(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_training_attempts_quiz_set ON agent_training_attempts(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_training_documents_file_type ON training_documents(file_type);

-- Create function to update question count
CREATE OR REPLACE FUNCTION update_training_document_question_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE training_documents
  SET 
    question_count = (
      SELECT COUNT(*)
      FROM training_quiz_questions
      WHERE document_id = COALESCE(NEW.document_id, OLD.document_id)
      AND is_active = true
    ),
    last_question_update = now()
  WHERE id = COALESCE(NEW.document_id, OLD.document_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update question count
DROP TRIGGER IF EXISTS trigger_update_question_count ON training_quiz_questions;
CREATE TRIGGER trigger_update_question_count
  AFTER INSERT OR UPDATE OR DELETE ON training_quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_training_document_question_count();