/*
  # Product Demo Knowledge System

  1. New Tables
    - `product_usps`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `product_id` (uuid, foreign key to products, nullable)
      - `usp_title` (text) - Short title for the USP
      - `usp_description` (text) - Detailed description
      - `category` (text) - feature, benefit, use_case, differentiator, pricing, integration
      - `is_approved` (boolean) - Whether admin approved this USP
      - `source` (text) - admin, ai_suggested, user_contributed
      - `created_by` (uuid, foreign key to user_profiles)
      - `approved_by` (uuid, foreign key to user_profiles, nullable)
      - `keywords` (text[]) - Array of keywords for matching
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `demo_validation_logs`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to roleplay_sessions)
      - `company_id` (uuid, foreign key to companies)
      - `timestamp` (timestamptz) - When the statement was made
      - `spoken_text` (text) - What the user actually said
      - `matched_usp_id` (uuid, foreign key to product_usps, nullable)
      - `is_correct` (boolean) - Whether the information was accurate
      - `confidence_score` (numeric) - AI confidence in the validation (0-1)
      - `validation_type` (text) - correct, incorrect, missed_opportunity, unsure
      - `needs_admin_review` (boolean) - Flag for admin review queue
      - `created_at` (timestamptz)

    - `knowledge_correction_requests`
      - `id` (uuid, primary key)
      - `validation_log_id` (uuid, foreign key to demo_validation_logs)
      - `company_id` (uuid, foreign key to companies)
      - `user_id` (uuid, foreign key to user_profiles)
      - `spoken_text` (text) - Original statement
      - `suggested_usp_title` (text) - User/AI suggested title
      - `suggested_usp_description` (text) - User/AI suggested description
      - `category` (text) - Suggested category
      - `admin_decision` (text) - pending, approved, rejected, modified
      - `admin_notes` (text) - Admin feedback
      - `reviewed_by` (uuid, foreign key to user_profiles, nullable)
      - `reviewed_at` (timestamptz, nullable)
      - `created_usp_id` (uuid, foreign key to product_usps, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `product_demo_sessions`
      - `id` (uuid, primary key)
      - `roleplay_session_id` (uuid, foreign key to roleplay_sessions)
      - `product_id` (uuid, foreign key to products, nullable)
      - `screen_share_enabled` (boolean)
      - `demo_type` (text) - full_demo, feature_focus, objection_handling
      - `target_duration_minutes` (integer)
      - `key_features_to_cover` (text[]) - Array of feature IDs or titles
      - `buyer_persona` (text) - technical, business, executive, procurement
      - `industry_context` (text) - Optional industry for the scenario
      - `created_at` (timestamptz)

  2. Schema Changes
    - Add `roleplay_type` column to `roleplay_sessions` table
    - Add `product_demo_session_id` column to `roleplay_sessions` table

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their company's data
    - Add policies for admins to manage knowledge base
    - Add policies for users to submit correction requests
*/

-- Create product_usps table
CREATE TABLE IF NOT EXISTS product_usps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  usp_title text NOT NULL,
  usp_description text NOT NULL,
  category text NOT NULL CHECK (category IN ('feature', 'benefit', 'use_case', 'differentiator', 'pricing', 'integration', 'technical', 'compliance')),
  is_approved boolean DEFAULT false,
  source text NOT NULL CHECK (source IN ('admin', 'ai_suggested', 'user_contributed')),
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  keywords text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create demo_validation_logs table
CREATE TABLE IF NOT EXISTS demo_validation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES roleplay_sessions(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  timestamp timestamptz DEFAULT now(),
  spoken_text text NOT NULL,
  matched_usp_id uuid REFERENCES product_usps(id) ON DELETE SET NULL,
  is_correct boolean DEFAULT true,
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  validation_type text NOT NULL CHECK (validation_type IN ('correct', 'incorrect', 'missed_opportunity', 'unsure', 'excellent')),
  needs_admin_review boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create knowledge_correction_requests table
CREATE TABLE IF NOT EXISTS knowledge_correction_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_log_id uuid REFERENCES demo_validation_logs(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  spoken_text text NOT NULL,
  suggested_usp_title text NOT NULL,
  suggested_usp_description text NOT NULL,
  category text NOT NULL CHECK (category IN ('feature', 'benefit', 'use_case', 'differentiator', 'pricing', 'integration', 'technical', 'compliance')),
  admin_decision text DEFAULT 'pending' CHECK (admin_decision IN ('pending', 'approved', 'rejected', 'modified')),
  admin_notes text,
  reviewed_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_usp_id uuid REFERENCES product_usps(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_demo_sessions table
CREATE TABLE IF NOT EXISTS product_demo_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roleplay_session_id uuid REFERENCES roleplay_sessions(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  screen_share_enabled boolean DEFAULT false,
  demo_type text DEFAULT 'full_demo' CHECK (demo_type IN ('full_demo', 'feature_focus', 'objection_handling', 'technical_deep_dive')),
  target_duration_minutes integer DEFAULT 15,
  key_features_to_cover text[] DEFAULT ARRAY[]::text[],
  buyer_persona text DEFAULT 'business' CHECK (buyer_persona IN ('technical', 'business', 'executive', 'procurement', 'end_user')),
  industry_context text,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to roleplay_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'roleplay_type'
  ) THEN
    ALTER TABLE roleplay_sessions ADD COLUMN roleplay_type text DEFAULT 'voice_call' CHECK (roleplay_type IN ('voice_call', 'product_demo', 'objection_handling', 'discovery_call'));
  END IF;
END $$;

-- Enable RLS
ALTER TABLE product_usps ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_demo_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_usps
CREATE POLICY "Users can view approved USPs in their company"
  ON product_usps FOR SELECT
  TO authenticated
  USING (
    is_approved = true AND
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all USPs in their company"
  ON product_usps FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "Admins can insert USPs"
  ON product_usps FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "Admins can update USPs"
  ON product_usps FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'manager')
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "Admins can delete USPs"
  ON product_usps FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'manager')
    )
  );

-- RLS Policies for demo_validation_logs
CREATE POLICY "Users can view validation logs for their sessions"
  ON demo_validation_logs FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM roleplay_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view all validation logs in their company"
  ON demo_validation_logs FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "System can insert validation logs"
  ON demo_validation_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for knowledge_correction_requests
CREATE POLICY "Users can view their own correction requests"
  ON knowledge_correction_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all correction requests in their company"
  ON knowledge_correction_requests FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'manager')
    )
  );

CREATE POLICY "Users can insert correction requests"
  ON knowledge_correction_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update correction requests"
  ON knowledge_correction_requests FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'manager')
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'manager')
    )
  );

-- RLS Policies for product_demo_sessions
CREATE POLICY "Users can view their own demo sessions"
  ON product_demo_sessions FOR SELECT
  TO authenticated
  USING (
    roleplay_session_id IN (
      SELECT id FROM roleplay_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own demo sessions"
  ON product_demo_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    roleplay_session_id IN (
      SELECT id FROM roleplay_sessions WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_usps_company_id ON product_usps(company_id);
CREATE INDEX IF NOT EXISTS idx_product_usps_product_id ON product_usps(product_id);
CREATE INDEX IF NOT EXISTS idx_product_usps_approved ON product_usps(is_approved);
CREATE INDEX IF NOT EXISTS idx_demo_validation_logs_session_id ON demo_validation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_demo_validation_logs_company_id ON demo_validation_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_correction_requests_company_id ON knowledge_correction_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_correction_requests_admin_decision ON knowledge_correction_requests(admin_decision);
CREATE INDEX IF NOT EXISTS idx_product_demo_sessions_roleplay_id ON product_demo_sessions(roleplay_session_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_product_usps_updated_at ON product_usps;
CREATE TRIGGER update_product_usps_updated_at
  BEFORE UPDATE ON product_usps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_correction_requests_updated_at ON knowledge_correction_requests;
CREATE TRIGGER update_knowledge_correction_requests_updated_at
  BEFORE UPDATE ON knowledge_correction_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
