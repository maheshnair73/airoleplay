/*
  # Update Multi-Party Scenarios Schema
  
  1. Schema Changes
    - Add `scenario_type` column for categorizing scenarios (panel_interview, team_negotiation, etc.)
    - Add `difficulty_level` column (standardize from 'difficulty')
    - Add `buyer_personas` jsonb column for buyer stakeholder definitions
    - Add `seller_personas` jsonb column for sales team member definitions
    - Add `conversation_dynamics` jsonb column for AI interaction controls
    - Add `team_selling_objectives` text array for team-specific learning goals
    - Add `learning_objectives` text array for general skill objectives
    - Add `success_criteria` text array for session success metrics
    - Add `estimated_duration_minutes` integer for time estimation
    - Add `industry` text for industry classification
    - Add `tags` text array for categorization
    - Add `is_template` boolean for template scenarios
    - Add `average_rating` numeric for user ratings
    - Add `times_used` integer for usage tracking
    - Add `updated_at` timestamp for last modification tracking
    
  2. Data Migration
    - Rename 'difficulty' to 'difficulty_level' with value mapping
    - Rename 'roles' to 'buyer_personas' for clarity
    
  3. Security
    - Update RLS policies for new columns
*/

-- Add new columns to multi_party_scenarios
DO $$
BEGIN
  -- Add scenario_type if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'scenario_type'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN scenario_type text DEFAULT 'panel_interview';
  END IF;

  -- Add difficulty_level if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN difficulty_level text DEFAULT 'intermediate';
  END IF;

  -- Add buyer_personas if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'buyer_personas'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN buyer_personas jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add seller_personas if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'seller_personas'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN seller_personas jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add conversation_dynamics if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'conversation_dynamics'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN conversation_dynamics jsonb DEFAULT '{
      "allow_ai_interruptions": true,
      "allow_ai_internal_dialogue": true,
      "allow_seller_collaboration": true,
      "turn_taking_style": "organic",
      "conflict_level": "medium"
    }'::jsonb;
  END IF;

  -- Add team_selling_objectives if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'team_selling_objectives'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN team_selling_objectives text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Add learning_objectives if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'learning_objectives'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN learning_objectives text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Add success_criteria if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'success_criteria'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN success_criteria text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Add estimated_duration_minutes if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'estimated_duration_minutes'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN estimated_duration_minutes integer DEFAULT 30;
  END IF;

  -- Add industry if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'industry'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN industry text DEFAULT '';
  END IF;

  -- Add tags if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'tags'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Add is_template if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'is_template'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN is_template boolean DEFAULT false;
  END IF;

  -- Add average_rating if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'average_rating'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN average_rating numeric(3,2) DEFAULT 0.0;
  END IF;

  -- Add times_used if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'times_used'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN times_used integer DEFAULT 0;
  END IF;

  -- Add updated_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE multi_party_scenarios ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Migrate existing data from 'roles' to 'buyer_personas' if roles column exists and has data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'roles'
  ) THEN
    UPDATE multi_party_scenarios
    SET buyer_personas = roles
    WHERE roles IS NOT NULL AND roles != '[]'::jsonb;
  END IF;
END $$;

-- Migrate difficulty to difficulty_level with value normalization
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'multi_party_scenarios' AND column_name = 'difficulty'
  ) THEN
    UPDATE multi_party_scenarios
    SET difficulty_level = CASE
      WHEN LOWER(difficulty) = 'easy' THEN 'beginner'
      WHEN LOWER(difficulty) = 'medium' THEN 'intermediate'
      WHEN LOWER(difficulty) = 'hard' THEN 'advanced'
      ELSE LOWER(difficulty)
    END
    WHERE difficulty IS NOT NULL;
  END IF;
END $$;

-- Add update policies for scenarios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'multi_party_scenarios' AND policyname = 'Users can update own scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own scenarios"
      ON multi_party_scenarios FOR UPDATE
      TO authenticated
      USING (auth.uid() = created_by)
      WITH CHECK (auth.uid() = created_by)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'multi_party_scenarios' AND policyname = 'Users can delete own scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own scenarios"
      ON multi_party_scenarios FOR DELETE
      TO authenticated
      USING (auth.uid() = created_by)';
  END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_multi_party_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_multi_party_scenarios_updated_at_trigger ON multi_party_scenarios;

CREATE TRIGGER update_multi_party_scenarios_updated_at_trigger
  BEFORE UPDATE ON multi_party_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_multi_party_scenarios_updated_at();
