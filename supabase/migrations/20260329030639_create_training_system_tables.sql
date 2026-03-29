/*
  # Training System and ROI Tracking Schema

  1. New Tables
    - `training_documents`
      - Core training content library with metadata
      - Fields: id, title, description, content, document_type, category, difficulty_level, estimated_time_minutes, passing_score, created_by, version, is_active, created_date, updated_date
    
    - `training_quiz_questions`
      - Quiz questions linked to training documents
      - Fields: id, document_id, question_text, question_type, options (jsonb), correct_answer, explanation, difficulty, order_index, is_active
    
    - `agent_training_attempts`
      - Individual training attempt records with scores
      - Fields: id, agent_email, document_id, quiz_score, time_spent_minutes, attempt_number, completed_at, passed, answers (jsonb), created_date
    
    - `agent_certifications`
      - Active certifications for agents
      - Fields: id, agent_email, document_id, certification_date, expiry_date, status, renewal_count, last_renewed_date
    
    - `personalized_training_assignments`
      - AI-triggered training recommendations based on performance
      - Fields: id, agent_email, document_id, reason, priority, assigned_by, assigned_date, due_date, completed_date, triggered_by_session_id, status
    
    - `training_performance_correlation`
      - ROI tracking linking training to performance improvements
      - Fields: id, agent_email, training_document_id, pre_training_avg_score, post_training_avg_score, improvement_percentage, calls_analyzed_pre, calls_analyzed_post, training_completed_date, measurement_date, created_date

  2. Security
    - Enable RLS on all tables
    - Authenticated users can view their own training data
    - Managers and admins can view all training data
    - Only admins can create/modify training documents
*/

-- Training Documents Table
CREATE TABLE IF NOT EXISTS training_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text NOT NULL,
  document_type text NOT NULL DEFAULT 'course',
  category text NOT NULL,
  difficulty_level text DEFAULT 'intermediate',
  estimated_time_minutes integer DEFAULT 30,
  passing_score integer DEFAULT 80,
  created_by text NOT NULL,
  version integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_date timestamptz DEFAULT now(),
  updated_date timestamptz DEFAULT now()
);

ALTER TABLE training_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view active training documents"
  ON training_documents FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can create training documents"
  ON training_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update training documents"
  ON training_documents FOR UPDATE
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

-- Training Quiz Questions Table
CREATE TABLE IF NOT EXISTS training_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES training_documents(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  explanation text,
  difficulty text DEFAULT 'medium',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_date timestamptz DEFAULT now()
);

ALTER TABLE training_quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view quiz questions"
  ON training_quiz_questions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage quiz questions"
  ON training_quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Agent Training Attempts Table
CREATE TABLE IF NOT EXISTS agent_training_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_email text NOT NULL,
  document_id uuid NOT NULL REFERENCES training_documents(id) ON DELETE CASCADE,
  quiz_score numeric(5,2) DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  attempt_number integer DEFAULT 1,
  completed_at timestamptz DEFAULT now(),
  passed boolean DEFAULT false,
  answers jsonb DEFAULT '{}'::jsonb,
  created_date timestamptz DEFAULT now()
);

ALTER TABLE agent_training_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training attempts"
  ON agent_training_attempts FOR SELECT
  TO authenticated
  USING (
    agent_email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "Users can create own training attempts"
  ON agent_training_attempts FOR INSERT
  TO authenticated
  WITH CHECK (agent_email = auth.jwt()->>'email');

-- Agent Certifications Table
CREATE TABLE IF NOT EXISTS agent_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_email text NOT NULL,
  document_id uuid NOT NULL REFERENCES training_documents(id) ON DELETE CASCADE,
  certification_date timestamptz DEFAULT now(),
  expiry_date timestamptz,
  status text DEFAULT 'active',
  renewal_count integer DEFAULT 0,
  last_renewed_date timestamptz,
  created_date timestamptz DEFAULT now(),
  UNIQUE(agent_email, document_id)
);

ALTER TABLE agent_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certifications"
  ON agent_certifications FOR SELECT
  TO authenticated
  USING (
    agent_email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "System can create certifications"
  ON agent_certifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update certifications"
  ON agent_certifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Personalized Training Assignments Table
CREATE TABLE IF NOT EXISTS personalized_training_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_email text NOT NULL,
  document_id uuid NOT NULL REFERENCES training_documents(id) ON DELETE CASCADE,
  reason text NOT NULL,
  priority text DEFAULT 'medium',
  assigned_by text,
  assigned_date timestamptz DEFAULT now(),
  due_date timestamptz,
  completed_date timestamptz,
  triggered_by_session_id uuid,
  status text DEFAULT 'pending',
  created_date timestamptz DEFAULT now()
);

ALTER TABLE personalized_training_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training assignments"
  ON personalized_training_assignments FOR SELECT
  TO authenticated
  USING (
    agent_email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "System can create training assignments"
  ON personalized_training_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own assignments"
  ON personalized_training_assignments FOR UPDATE
  TO authenticated
  USING (
    agent_email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'manager')
    )
  )
  WITH CHECK (
    agent_email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

-- Training Performance Correlation Table
CREATE TABLE IF NOT EXISTS training_performance_correlation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_email text NOT NULL,
  training_document_id uuid NOT NULL REFERENCES training_documents(id) ON DELETE CASCADE,
  pre_training_avg_score numeric(5,2) DEFAULT 0,
  post_training_avg_score numeric(5,2) DEFAULT 0,
  improvement_percentage numeric(5,2) DEFAULT 0,
  calls_analyzed_pre integer DEFAULT 0,
  calls_analyzed_post integer DEFAULT 0,
  training_completed_date timestamptz NOT NULL,
  measurement_date timestamptz DEFAULT now(),
  created_date timestamptz DEFAULT now()
);

ALTER TABLE training_performance_correlation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own performance correlation"
  ON training_performance_correlation FOR SELECT
  TO authenticated
  USING (
    agent_email = auth.jwt()->>'email'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.email = auth.jwt()->>'email'
      AND user_profiles.role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "System can manage performance correlation"
  ON training_performance_correlation FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_attempts_agent ON agent_training_attempts(agent_email);
CREATE INDEX IF NOT EXISTS idx_training_attempts_document ON agent_training_attempts(document_id);
CREATE INDEX IF NOT EXISTS idx_certifications_agent ON agent_certifications(agent_email);
CREATE INDEX IF NOT EXISTS idx_assignments_agent ON personalized_training_assignments(agent_email);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON personalized_training_assignments(status);
CREATE INDEX IF NOT EXISTS idx_performance_correlation_agent ON training_performance_correlation(agent_email);
