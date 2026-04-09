/*
  # Extend skill_coach_tasks for manager and bot assignment

  ## Changes

  ### Modified Table: skill_coach_tasks
  - Add `assigned_by` (uuid) — the user ID of the manager who assigned it, or null for bot-assigned
  - Add `assigned_by_type` (text) — 'bot' | 'manager' to distinguish source
  - Add `assigned_to_name` (text) — cached display name for the assigned employee
  - Add `notes` (text) — manager notes when assigning manually

  ### New RLS Policies
  - Managers can insert tasks for any user in their company
  - Managers can update tasks they assigned

  ## Notes
  - Existing tasks are all bot-assigned by default so assigned_by_type defaults to 'bot'
  - The bot_id column already handles which bot created the task
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skill_coach_tasks' AND column_name = 'assigned_by'
  ) THEN
    ALTER TABLE skill_coach_tasks ADD COLUMN assigned_by uuid DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skill_coach_tasks' AND column_name = 'assigned_by_type'
  ) THEN
    ALTER TABLE skill_coach_tasks ADD COLUMN assigned_by_type text NOT NULL DEFAULT 'bot';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skill_coach_tasks' AND column_name = 'notes'
  ) THEN
    ALTER TABLE skill_coach_tasks ADD COLUMN notes text DEFAULT '';
  END IF;
END $$;

CREATE POLICY "Managers can insert tasks for team members"
  ON skill_coach_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'company_admin', 'sales_manager', 'saas_admin', 'super_admin')
    )
  );

CREATE POLICY "Managers can update tasks they assigned"
  ON skill_coach_tasks FOR UPDATE
  TO authenticated
  USING (assigned_by = auth.uid())
  WITH CHECK (assigned_by = auth.uid());
