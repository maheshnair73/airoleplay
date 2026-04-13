/*
  # Create AI Roleplay Content Management System

  1. New Tables
    - `roleplay_content_materials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - Owner of the material
      - `company_id` (uuid, foreign key) - Company ownership
      - `file_name` (text) - Original file name
      - `file_type` (text) - PDF, DOCX, PPTX, MP4, MP3
      - `category` (text) - product_knowledge, objection_handling, discovery_questions, sales_methodology, case_studies, other
      - `tags` (text[]) - Custom tags for organization
      - `storage_path` (text) - Path in Supabase Storage
      - `file_size_kb` (int) - File size in KB
      - `visibility` (text) - personal, team, company_wide
      - `description` (text) - Optional description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `roleplay_session_content_links`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key) - Reference to roleplay session
      - `content_material_id` (uuid, foreign key) - Reference to content material
      - `added_at` (timestamptz)

    - `content_usage_analytics`
      - `id` (uuid, primary key)
      - `content_material_id` (uuid, foreign key)
      - `session_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `used_at` (timestamptz)
      - `session_duration_minutes` (int)

  2. Security
    - Enable RLS on all tables
    - Users can view/manage their own materials
    - Company-wide materials have appropriate access policies
    - Admins can manage any materials

  3. Notes
    - Materials are stored in Supabase Storage bucket "roleplay-content"
    - File size limit: 100MB enforced at application level
    - Storage cleanup on deletion handled at application level
*/

CREATE TABLE IF NOT EXISTS roleplay_content_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('pdf', 'docx', 'pptx', 'mp4', 'mp3')),
  category text DEFAULT 'other' CHECK (category IN ('product_knowledge', 'objection_handling', 'discovery_questions', 'sales_methodology', 'case_studies', 'other')),
  tags text[] DEFAULT '{}',
  storage_path text NOT NULL UNIQUE,
  file_size_kb int NOT NULL CHECK (file_size_kb > 0),
  visibility text DEFAULT 'personal' CHECK (visibility IN ('personal', 'company_wide')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE roleplay_content_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own materials and company-wide materials"
  ON roleplay_content_materials
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (visibility = 'company_wide' AND company_id = (SELECT company_id FROM user_profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Users can insert own materials"
  ON roleplay_content_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own materials"
  ON roleplay_content_materials
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own materials"
  ON roleplay_content_materials
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage any materials"
  ON roleplay_content_materials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'saas_admin')
    )
  );

CREATE INDEX idx_roleplay_content_user_id ON roleplay_content_materials(user_id);
CREATE INDEX idx_roleplay_content_company_id ON roleplay_content_materials(company_id);
CREATE INDEX idx_roleplay_content_category ON roleplay_content_materials(category);
CREATE INDEX idx_roleplay_content_visibility ON roleplay_content_materials(visibility);
CREATE INDEX idx_roleplay_content_created_at ON roleplay_content_materials(created_at DESC);

CREATE TABLE IF NOT EXISTS roleplay_session_content_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES roleplay_sessions(id) ON DELETE CASCADE,
  content_material_id uuid NOT NULL REFERENCES roleplay_content_materials(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(session_id, content_material_id)
);

ALTER TABLE roleplay_session_content_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view content links for their sessions"
  ON roleplay_session_content_links
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roleplay_sessions
      WHERE roleplay_sessions.id = session_id
      AND roleplay_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert content links for their sessions"
  ON roleplay_session_content_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roleplay_sessions
      WHERE roleplay_sessions.id = session_id
      AND roleplay_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete content links from their sessions"
  ON roleplay_session_content_links
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roleplay_sessions
      WHERE roleplay_sessions.id = session_id
      AND roleplay_sessions.user_id = auth.uid()
    )
  );

CREATE INDEX idx_roleplay_session_links_session ON roleplay_session_content_links(session_id);
CREATE INDEX idx_roleplay_session_links_material ON roleplay_session_content_links(content_material_id);

CREATE TABLE IF NOT EXISTS content_usage_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_material_id uuid NOT NULL REFERENCES roleplay_content_materials(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES roleplay_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at timestamptz DEFAULT now(),
  session_duration_minutes int
);

ALTER TABLE content_usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view usage analytics for their materials"
  ON content_usage_analytics
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM roleplay_content_materials
      WHERE roleplay_content_materials.id = content_material_id
      AND roleplay_content_materials.user_id = auth.uid()
    )
  );

CREATE POLICY "Analytics events recorded on insert"
  ON content_usage_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_content_analytics_material ON content_usage_analytics(content_material_id);
CREATE INDEX idx_content_analytics_session ON content_usage_analytics(session_id);
CREATE INDEX idx_content_analytics_user ON content_usage_analytics(user_id);
CREATE INDEX idx_content_analytics_used_at ON content_usage_analytics(used_at DESC);

-- Add AI Roleplay Studio as standalone module
INSERT INTO module_configuration (module_id, module_name, is_enabled, access_type, allowed_users)
VALUES ('AIRoleplayStudio', 'AI Roleplay Studio', true, 'all_users', '{}')
ON CONFLICT (module_id) DO NOTHING;
