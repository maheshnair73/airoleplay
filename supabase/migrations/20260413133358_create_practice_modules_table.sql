/*
  # Create Practice Modules Table

  Creates the core table for managing practice modules that admins can create
  and share with users by role or individual assignment.
*/

CREATE TABLE IF NOT EXISTS practice_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  module_name text NOT NULL,
  description text,
  module_type text NOT NULL CHECK (module_type IN ('roleplay', 'scenario', 'certification', 'skill')),
  difficulty_level text DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  icon_url text,
  is_published boolean DEFAULT false,
  created_by_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE practice_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can create modules"
  ON practice_modules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.email()
      AND user_profiles.company_id = practice_modules.company_id
      AND user_profiles.role IN ('admin', 'company_admin', 'sales_manager')
    )
  );

CREATE POLICY "Users can view own modules"
  ON practice_modules FOR SELECT
  TO authenticated
  USING (created_by_email = auth.email());

CREATE POLICY "Module creators update modules"
  ON practice_modules FOR UPDATE
  TO authenticated
  USING (created_by_email = auth.email())
  WITH CHECK (created_by_email = auth.email());

CREATE INDEX IF NOT EXISTS idx_practice_modules_company ON practice_modules(company_id);
CREATE INDEX IF NOT EXISTS idx_practice_modules_created_by ON practice_modules(created_by_email);
