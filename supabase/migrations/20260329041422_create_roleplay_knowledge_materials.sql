/*
  # Roleplay Knowledge Materials System

  Creates tables and functionality for uploading training materials (PDFs, videos, audio)
  that can be used during AI roleplay sessions for knowledge-based practice.

  1. New Tables
    - `roleplay_knowledge_materials`
      - Stores uploaded training content (documents, videos, audio files)
      - Fields: id, company_id, title, description, material_type, file_url, content_text, uploaded_by, category, tags, is_active, created_date, updated_date
    
    - `roleplay_material_questions`
      - AI-generated or manual questions based on the materials
      - Fields: id, material_id, question_text, context, difficulty, is_active, created_date
    
    - `roleplay_session_materials`
      - Links materials to specific roleplay sessions for context-aware practice
      - Fields: id, session_id, material_id, questions_asked, questions_correct, added_date
    
    - `agent_material_progress`
      - Tracks individual agent progress through knowledge materials
      - Fields: id, user_email, material_id, times_practiced, total_questions_asked, total_questions_correct, last_practiced_date, mastery_level, created_date

  2. Security
    - Enable RLS on all tables
    - Company-scoped access (users can only see their company's materials)
    - Authenticated users can view and practice with materials
    - Admins can create and manage materials
*/

-- Roleplay Knowledge Materials Table
CREATE TABLE IF NOT EXISTS roleplay_knowledge_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  material_type text NOT NULL DEFAULT 'document',
  file_url text,
  content_text text,
  uploaded_by text NOT NULL,
  category text,
  tags text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE roleplay_knowledge_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view materials from their company"
  ON roleplay_knowledge_materials FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      company_id IN (
        SELECT company_id FROM user_profiles
        WHERE email = auth.jwt()->>'email'
      )
      OR company_id IS NULL
    )
  );

CREATE POLICY "Admins can create materials"
  ON roleplay_knowledge_materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  );

CREATE POLICY "Admins can update materials"
  ON roleplay_knowledge_materials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete materials"
  ON roleplay_knowledge_materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- Roleplay Material Questions Table
CREATE TABLE IF NOT EXISTS roleplay_material_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES roleplay_knowledge_materials(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  context text,
  difficulty text DEFAULT 'medium',
  is_active boolean DEFAULT true,
  created_date timestamptz DEFAULT now()
);

ALTER TABLE roleplay_material_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions for accessible materials"
  ON roleplay_material_questions FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    material_id IN (
      SELECT id FROM roleplay_knowledge_materials
      WHERE is_active = true AND (
        company_id IN (
          SELECT company_id FROM user_profiles
          WHERE email = auth.jwt()->>'email'
        )
        OR company_id IS NULL
      )
    )
  );

CREATE POLICY "Admins can manage material questions"
  ON roleplay_material_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  );

-- Roleplay Session Materials Table
CREATE TABLE IF NOT EXISTS roleplay_session_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES roleplay_sessions(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES roleplay_knowledge_materials(id) ON DELETE CASCADE,
  questions_asked integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  added_date timestamptz DEFAULT now(),
  UNIQUE(session_id, material_id)
);

ALTER TABLE roleplay_session_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view session materials for their sessions"
  ON roleplay_session_materials FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM roleplay_sessions
      WHERE user_email = auth.jwt()->>'email'
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  );

CREATE POLICY "Users can create session materials"
  ON roleplay_session_materials FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM roleplay_sessions
      WHERE user_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Users can update their session materials"
  ON roleplay_session_materials FOR UPDATE
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM roleplay_sessions
      WHERE user_email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM roleplay_sessions
      WHERE user_email = auth.jwt()->>'email'
    )
  );

-- Agent Material Progress Table
CREATE TABLE IF NOT EXISTS agent_material_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  material_id uuid NOT NULL REFERENCES roleplay_knowledge_materials(id) ON DELETE CASCADE,
  times_practiced integer DEFAULT 0,
  total_questions_asked integer DEFAULT 0,
  total_questions_correct integer DEFAULT 0,
  last_practiced_date timestamptz,
  mastery_level numeric(5,2) DEFAULT 0,
  created_date timestamptz DEFAULT now(),
  UNIQUE(user_email, material_id)
);

ALTER TABLE agent_material_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own material progress"
  ON agent_material_progress FOR SELECT
  TO authenticated
  USING (
    user_email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  );

CREATE POLICY "Users can create own material progress"
  ON agent_material_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can update own material progress"
  ON agent_material_progress FOR UPDATE
  TO authenticated
  USING (user_email = auth.jwt()->>'email')
  WITH CHECK (user_email = auth.jwt()->>'email');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_materials_company ON roleplay_knowledge_materials(company_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_materials_type ON roleplay_knowledge_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_material_questions_material ON roleplay_material_questions(material_id);
CREATE INDEX IF NOT EXISTS idx_session_materials_session ON roleplay_session_materials(session_id);
CREATE INDEX IF NOT EXISTS idx_session_materials_material ON roleplay_session_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_agent_material_progress_email ON agent_material_progress(user_email);
CREATE INDEX IF NOT EXISTS idx_agent_material_progress_material ON agent_material_progress(material_id);