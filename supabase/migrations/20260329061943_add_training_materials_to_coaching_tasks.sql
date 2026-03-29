/*
  # Add Training Materials to Coaching Tasks

  1. New Tables
    - `coaching_task_materials`
      - Links training materials to coaching tasks
      - Tracks if material must be read before starting the roleplay
      - Fields: id, task_id, material_id, is_required, reading_order, created_date

    - `agent_material_reading_progress`
      - Tracks which materials agents have read for specific tasks
      - Fields: id, user_email, task_id, material_id, started_at, completed_at, time_spent_seconds

  2. Changes
    - Add `requires_material_review` boolean to coaching_tasks
    - Add `roleplay_bot_id` to link tasks to specific AI clients

  3. Security
    - Enable RLS on new tables
    - Users can view their assigned task materials
    - Users can track their own reading progress
    - Managers can assign materials to tasks
*/

-- Add new columns to coaching_tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coaching_tasks' AND column_name = 'requires_material_review'
  ) THEN
    ALTER TABLE coaching_tasks ADD COLUMN requires_material_review boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coaching_tasks' AND column_name = 'roleplay_bot_id'
  ) THEN
    ALTER TABLE coaching_tasks ADD COLUMN roleplay_bot_id uuid REFERENCES ai_clients(id);
  END IF;
END $$;

-- Create coaching task materials table
CREATE TABLE IF NOT EXISTS coaching_task_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES coaching_tasks(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES roleplay_knowledge_materials(id) ON DELETE CASCADE,
  is_required boolean DEFAULT true,
  reading_order integer DEFAULT 1,
  created_date timestamptz DEFAULT now(),
  UNIQUE(task_id, material_id)
);

ALTER TABLE coaching_task_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view materials for their tasks"
  ON coaching_task_materials FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM coaching_tasks
      WHERE assigned_to_email = auth.jwt()->>'email'
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  );

CREATE POLICY "Managers can create task materials"
  ON coaching_task_materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  );

CREATE POLICY "Managers can update task materials"
  ON coaching_task_materials FOR UPDATE
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

CREATE POLICY "Managers can delete task materials"
  ON coaching_task_materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  );

-- Create agent material reading progress table
CREATE TABLE IF NOT EXISTS agent_material_reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  task_id uuid NOT NULL REFERENCES coaching_tasks(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES roleplay_knowledge_materials(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  time_spent_seconds integer DEFAULT 0,
  created_date timestamptz DEFAULT now(),
  UNIQUE(user_email, task_id, material_id)
);

ALTER TABLE agent_material_reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading progress"
  ON agent_material_reading_progress FOR SELECT
  TO authenticated
  USING (
    user_email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'company_admin', 'manager')
    )
  );

CREATE POLICY "Users can create own reading progress"
  ON agent_material_reading_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.jwt()->>'email');

CREATE POLICY "Users can update own reading progress"
  ON agent_material_reading_progress FOR UPDATE
  TO authenticated
  USING (user_email = auth.jwt()->>'email')
  WITH CHECK (user_email = auth.jwt()->>'email');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coaching_task_materials_task ON coaching_task_materials(task_id);
CREATE INDEX IF NOT EXISTS idx_coaching_task_materials_material ON coaching_task_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_task ON agent_material_reading_progress(user_email, task_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_material ON agent_material_reading_progress(material_id);
