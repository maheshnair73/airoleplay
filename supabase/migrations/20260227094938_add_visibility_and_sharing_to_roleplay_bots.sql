/*
  # Add Visibility and Sharing Controls to Roleplay Bots

  1. Changes to roleplay_bots Table
    - Add `company_id` (uuid) - Links bot to company for organization-level management
    - Add `is_active` (boolean) - Soft deletion flag, default true
    - Add `visibility` (text) - Controls who can see the bot: 'all_users', 'specific_users', 'creator_only'
    - Add `shared_with_user_ids` (jsonb) - Array of user IDs with access when visibility='specific_users'

  2. Indexes
    - Add index on company_id for performance
    - Add index on visibility for filtering

  3. Security Updates
    - Update RLS policies to respect visibility settings
    - Admin users (super_admin, company_admin) can share with all users
    - Regular users can only create creator_only bots
    - Users can view bots based on visibility rules
*/

-- Add new columns to roleplay_bots table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_bots' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE roleplay_bots ADD COLUMN company_id uuid REFERENCES companies(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_bots' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE roleplay_bots ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_bots' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE roleplay_bots ADD COLUMN visibility text DEFAULT 'all_users';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_bots' AND column_name = 'shared_with_user_ids'
  ) THEN
    ALTER TABLE roleplay_bots ADD COLUMN shared_with_user_ids jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add check constraint for visibility values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'roleplay_bots_visibility_check'
  ) THEN
    ALTER TABLE roleplay_bots
    ADD CONSTRAINT roleplay_bots_visibility_check
    CHECK (visibility IN ('all_users', 'specific_users', 'creator_only'));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roleplay_bots_company_id ON roleplay_bots(company_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_bots_visibility ON roleplay_bots(visibility);
CREATE INDEX IF NOT EXISTS idx_roleplay_bots_is_active ON roleplay_bots(is_active);

-- Drop existing RLS policies to recreate with visibility logic
DROP POLICY IF EXISTS "Anyone can view roleplay bots" ON roleplay_bots;
DROP POLICY IF EXISTS "Authenticated users can create bots" ON roleplay_bots;
DROP POLICY IF EXISTS "Users can update own bots" ON roleplay_bots;
DROP POLICY IF EXISTS "Users can delete own bots" ON roleplay_bots;

-- Create new RLS policies with visibility controls
CREATE POLICY "Users can view accessible roleplay bots"
  ON roleplay_bots FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      visibility = 'all_users'
      OR auth.uid() = created_by
      OR (
        visibility = 'specific_users'
        AND shared_with_user_ids ? auth.uid()::text
      )
    )
  );

CREATE POLICY "Authenticated users can create bots"
  ON roleplay_bots FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    (
      -- Regular users can only create creator_only bots
      (visibility = 'creator_only' AND get_my_role() NOT IN ('super_admin', 'company_admin'))
      OR
      -- Admins can create any visibility type
      (get_my_role() IN ('super_admin', 'company_admin'))
    )
  );

CREATE POLICY "Users can update accessible bots"
  ON roleplay_bots FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    get_my_role() IN ('super_admin', 'company_admin')
  )
  WITH CHECK (
    auth.uid() = created_by OR
    get_my_role() IN ('super_admin', 'company_admin')
  );

CREATE POLICY "Users can delete own bots"
  ON roleplay_bots FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    get_my_role() IN ('super_admin', 'company_admin')
  );