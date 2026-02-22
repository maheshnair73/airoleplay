/*
  # Add Analysis Frameworks and Configuration Tables

  ## New Tables
  
  1. `analysis_frameworks`
     - Stores different evaluation frameworks (SPIN, MEDIC, MEDDPIC, etc.)
     - Includes framework criteria and scoring rules
     - Admin can enable/disable frameworks per company
  
  2. `analysis_configurations`
     - Company-level settings for which frameworks to use
     - Customizable weights and thresholds
  
  3. `session_analysis_results`
     - Detailed analysis results for each session
     - Speaker-wise breakdown
     - Framework-specific scores
     - Recommendations and improvement areas
  
  ## Security
  - RLS enabled on all tables
  - Framework configurations restricted to admins
  - Analysis results viewable by session participants and admins
*/

-- Analysis Frameworks table
CREATE TABLE IF NOT EXISTS analysis_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_name text NOT NULL,
  framework_type text NOT NULL,
  description text,
  criteria jsonb DEFAULT '[]'::jsonb,
  scoring_rules jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE analysis_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active frameworks"
  ON analysis_frameworks FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage frameworks"
  ON analysis_frameworks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Analysis Configurations (company-level)
CREATE TABLE IF NOT EXISTS analysis_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  framework_id uuid REFERENCES analysis_frameworks(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true,
  custom_weights jsonb DEFAULT '{}'::jsonb,
  thresholds jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, framework_id)
);

ALTER TABLE analysis_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company configurations"
  ON analysis_configurations FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage configurations"
  ON analysis_configurations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.company_id = analysis_configurations.company_id
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Session Analysis Results
CREATE TABLE IF NOT EXISTS session_analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES roleplay_sessions(id) ON DELETE CASCADE,
  framework_id uuid REFERENCES analysis_frameworks(id) ON DELETE CASCADE,
  overall_score numeric DEFAULT 0,
  framework_scores jsonb DEFAULT '{}'::jsonb,
  speaker_analysis jsonb DEFAULT '[]'::jsonb,
  transcript_analysis jsonb DEFAULT '{}'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  improvement_areas jsonb DEFAULT '[]'::jsonb,
  strengths jsonb DEFAULT '[]'::jsonb,
  missed_opportunities jsonb DEFAULT '[]'::jsonb,
  should_avoid jsonb DEFAULT '[]'::jsonb,
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE session_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their session analysis"
  ON session_analysis_results FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM roleplay_sessions
      WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "System can insert analysis results"
  ON session_analysis_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update analysis results"
  ON session_analysis_results FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert default frameworks
INSERT INTO analysis_frameworks (framework_name, framework_type, description, criteria, scoring_rules) VALUES
(
  'SPIN Selling',
  'SPIN',
  'Situation, Problem, Implication, Need-payoff questioning framework',
  '[
    {"name": "Situation Questions", "weight": 0.2, "description": "Questions to understand current situation"},
    {"name": "Problem Questions", "weight": 0.25, "description": "Questions to identify problems or difficulties"},
    {"name": "Implication Questions", "weight": 0.3, "description": "Questions about consequences of problems"},
    {"name": "Need-Payoff Questions", "weight": 0.25, "description": "Questions about value of solving the problem"}
  ]'::jsonb,
  '{"passing_score": 70, "excellent_score": 85}'::jsonb
),
(
  'MEDIC',
  'MEDIC',
  'Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion',
  '[
    {"name": "Metrics", "weight": 0.15, "description": "Quantifiable business impact"},
    {"name": "Economic Buyer", "weight": 0.2, "description": "Identified decision maker with budget"},
    {"name": "Decision Criteria", "weight": 0.15, "description": "Understanding evaluation criteria"},
    {"name": "Decision Process", "weight": 0.15, "description": "Understanding buying process"},
    {"name": "Identify Pain", "weight": 0.2, "description": "Clear pain points identified"},
    {"name": "Champion", "weight": 0.15, "description": "Internal advocate identified"}
  ]'::jsonb,
  '{"passing_score": 65, "excellent_score": 80}'::jsonb
),
(
  'MEDDPIC',
  'MEDDPIC',
  'Metrics, Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identify Pain, Champion',
  '[
    {"name": "Metrics", "weight": 0.15, "description": "Quantified business value"},
    {"name": "Economic Buyer", "weight": 0.15, "description": "Budget holder identified"},
    {"name": "Decision Criteria", "weight": 0.15, "description": "Evaluation criteria understood"},
    {"name": "Decision Process", "weight": 0.1, "description": "Buying process mapped"},
    {"name": "Paper Process", "weight": 0.1, "description": "Legal and procurement process"},
    {"name": "Identify Pain", "weight": 0.2, "description": "Pain points clearly defined"},
    {"name": "Champion", "weight": 0.15, "description": "Internal champion secured"}
  ]'::jsonb,
  '{"passing_score": 70, "excellent_score": 85}'::jsonb
),
(
  'BANT',
  'BANT',
  'Budget, Authority, Need, Timeline qualification framework',
  '[
    {"name": "Budget", "weight": 0.25, "description": "Budget availability confirmed"},
    {"name": "Authority", "weight": 0.25, "description": "Decision maker identified"},
    {"name": "Need", "weight": 0.3, "description": "Clear need established"},
    {"name": "Timeline", "weight": 0.2, "description": "Purchase timeline defined"}
  ]'::jsonb,
  '{"passing_score": 65, "excellent_score": 80}'::jsonb
),
(
  'Challenger Sale',
  'CHALLENGER',
  'Teach, Tailor, Take Control methodology',
  '[
    {"name": "Teach for Differentiation", "weight": 0.35, "description": "Teaching customer something new"},
    {"name": "Tailor for Resonance", "weight": 0.3, "description": "Customized to customer needs"},
    {"name": "Take Control", "weight": 0.35, "description": "Assertively driving the conversation"}
  ]'::jsonb,
  '{"passing_score": 70, "excellent_score": 85}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_results_session ON session_analysis_results(session_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_framework ON session_analysis_results(framework_id);
CREATE INDEX IF NOT EXISTS idx_analysis_configs_company ON analysis_configurations(company_id);
