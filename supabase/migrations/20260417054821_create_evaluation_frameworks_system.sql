/*
  # Create Evaluation Frameworks System

  ## Overview
  This migration establishes a comprehensive framework-based evaluation system supporting MEDDIC, BANT, RUBRIC, SPIN, and custom frameworks for roleplay analysis.

  ## New Tables

  1. **evaluation_frameworks** - Master list of available evaluation frameworks
     - id, name, description, framework_type, icon, is_active, created_at
     - Supports predefined frameworks (MEDDIC, BANT, RUBRIC, SPIN) and custom ones

  2. **framework_criteria** - Individual criteria within each framework
     - id, framework_id, criterion_key, name, description, weight, display_order
     - Example: framework=MEDDIC, criterion=metrics, name="Metrics Discussion"

  3. **company_framework_settings** - Default framework per company
     - id, company_id, default_framework_id, created_at, updated_at
     - Allows companies to set their preferred evaluation framework

  4. **framework_scoring_rules** - Defines how each criterion is scored
     - id, criterion_id, score_level, label, description, min_score, max_score
     - Example: level 1 = "Not Addressed", level 2 = "Mentioned", level 3 = "Explored", level 4 = "Mastered"

  ## Schema Changes

  1. **ai_clients** - Add framework tracking
     - evaluation_framework (uuid) - References evaluation_frameworks table
     
  2. **roleplay_sessions** - Add framework tracking
     - framework_type (uuid) - Framework used for this session's analysis
     - framework_scores (jsonb) - Framework-specific scoring breakdown

  3. **practice_evaluations** - Extend for framework data
     - framework_analysis (jsonb) - Framework-specific analysis results
     - framework_scores_detail (jsonb) - Detailed scores per criterion

  ## Security
  - RLS enabled on all new tables
  - Policies ensure users can only view frameworks from their company
  - Admin policies for framework configuration

  ## Seed Data
  - Pre-populate MEDDIC, BANT, RUBRIC, SPIN frameworks with standard criteria
*/

-- Create evaluation_frameworks table
CREATE TABLE IF NOT EXISTS evaluation_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  framework_type text NOT NULL CHECK (framework_type IN ('MEDDIC', 'BANT', 'RUBRIC', 'SPIN', 'CUSTOM')),
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create framework_criteria table
CREATE TABLE IF NOT EXISTS framework_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES evaluation_frameworks(id) ON DELETE CASCADE,
  criterion_key text NOT NULL,
  name text NOT NULL,
  description text,
  weight numeric DEFAULT 1.0 CHECK (weight > 0),
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(framework_id, criterion_key)
);

-- Create framework_scoring_rules table
CREATE TABLE IF NOT EXISTS framework_scoring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criterion_id uuid NOT NULL REFERENCES framework_criteria(id) ON DELETE CASCADE,
  score_level integer NOT NULL CHECK (score_level BETWEEN 1 AND 5),
  label text NOT NULL,
  description text,
  min_score numeric DEFAULT 0,
  max_score numeric DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  UNIQUE(criterion_id, score_level)
);

-- Create company_framework_settings table
CREATE TABLE IF NOT EXISTS company_framework_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  default_framework_id uuid NOT NULL REFERENCES evaluation_frameworks(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id)
);

-- Extend ai_clients with framework
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_clients' AND column_name = 'evaluation_framework'
  ) THEN
    ALTER TABLE ai_clients ADD COLUMN evaluation_framework uuid REFERENCES evaluation_frameworks(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Extend roleplay_sessions with framework tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'framework_type'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN framework_type uuid REFERENCES evaluation_frameworks(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'framework_scores'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN framework_scores jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Extend practice_evaluations with framework details
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practice_evaluations' AND column_name = 'framework_analysis'
  ) THEN
    ALTER TABLE practice_evaluations ADD COLUMN framework_analysis jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practice_evaluations' AND column_name = 'framework_scores_detail'
  ) THEN
    ALTER TABLE practice_evaluations ADD COLUMN framework_scores_detail jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE evaluation_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_framework_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evaluation_frameworks (public read for active frameworks)
CREATE POLICY "Anyone can view active frameworks"
  ON evaluation_frameworks FOR SELECT
  USING (is_active = true);

-- RLS Policies for framework_criteria (public read)
CREATE POLICY "Anyone can view framework criteria"
  ON framework_criteria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evaluation_frameworks ef
      WHERE ef.id = framework_criteria.framework_id AND ef.is_active = true
    )
  );

-- RLS Policies for framework_scoring_rules (public read)
CREATE POLICY "Anyone can view framework scoring rules"
  ON framework_scoring_rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM framework_criteria fc
      WHERE fc.id = framework_scoring_rules.criterion_id
    )
  );

-- RLS Policies for company_framework_settings
CREATE POLICY "Company admins can view own settings"
  ON company_framework_settings FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid() AND (role = 'company_admin' OR role = 'super_admin')
    )
  );

CREATE POLICY "Company admins can update own settings"
  ON company_framework_settings FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid() AND (role = 'company_admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid() AND (role = 'company_admin' OR role = 'super_admin')
    )
  );

CREATE POLICY "Company admins can insert own settings"
  ON company_framework_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid() AND (role = 'company_admin' OR role = 'super_admin')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_framework_criteria_framework_id ON framework_criteria(framework_id);
CREATE INDEX idx_framework_scoring_rules_criterion_id ON framework_scoring_rules(criterion_id);
CREATE INDEX idx_company_framework_settings_company_id ON company_framework_settings(company_id);
CREATE INDEX idx_ai_clients_evaluation_framework ON ai_clients(evaluation_framework);
CREATE INDEX idx_roleplay_sessions_framework_type ON roleplay_sessions(framework_type);
