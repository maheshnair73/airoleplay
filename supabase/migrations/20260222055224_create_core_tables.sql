/*
  # Create Core Sales Application Tables

  1. New Tables
    - `leads` - Store lead/prospect information
    - `companies` - Store company information
    - `products` - Store product catalog
    - `deals` - Store deal/opportunity information
    - `coaching_tasks` - Store coaching and training tasks
    - `task_submissions` - Store user submissions for coaching tasks
    - `roleplay_sessions` - Store AI roleplay session data
    - `documents` - Store document metadata
    - `campaigns` - Store campaign information
    - `call_records` - Store call recording metadata

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated user access
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  industry text,
  website text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  description text,
  price decimal,
  category text,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_name text NOT NULL,
  company_id uuid REFERENCES companies(id),
  email text,
  phone text,
  stage text DEFAULT 'new',
  status text DEFAULT 'active',
  assigned_to uuid REFERENCES auth.users(id),
  assigned_to_email text,
  source text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (true);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_name text NOT NULL,
  lead_id uuid REFERENCES leads(id),
  company_id uuid REFERENCES companies(id),
  deal_value decimal DEFAULT 0,
  stage text DEFAULT 'prospecting',
  probability integer DEFAULT 0,
  close_date date,
  created_by uuid REFERENCES auth.users(id),
  assigned_to uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deals"
  ON deals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Coaching tasks table
CREATE TABLE IF NOT EXISTS coaching_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name text NOT NULL,
  description text,
  task_type text DEFAULT 'pitch',
  assigned_to uuid REFERENCES auth.users(id),
  assigned_to_email text,
  due_date date,
  status text DEFAULT 'pending',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE coaching_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view coaching tasks"
  ON coaching_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create coaching tasks"
  ON coaching_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update coaching tasks"
  ON coaching_tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Task submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES coaching_tasks(id),
  submitted_by uuid REFERENCES auth.users(id),
  submitted_by_email text,
  submission_type text,
  content text,
  file_url text,
  status text DEFAULT 'submitted',
  feedback text,
  score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task submissions"
  ON task_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create task submissions"
  ON task_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update task submissions"
  ON task_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Roleplay sessions table
CREATE TABLE IF NOT EXISTS roleplay_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name text,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  scenario_type text,
  difficulty text DEFAULT 'medium',
  duration integer DEFAULT 0,
  score integer,
  transcript jsonb DEFAULT '[]'::jsonb,
  feedback text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE roleplay_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roleplay sessions"
  ON roleplay_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create roleplay sessions"
  ON roleplay_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roleplay sessions"
  ON roleplay_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text UNIQUE,
  document_name text NOT NULL,
  document_type text,
  file_url text,
  content text,
  created_by uuid REFERENCES auth.users(id),
  shared_with text[],
  expires_at timestamptz,
  require_email boolean DEFAULT false,
  password text,
  allow_download boolean DEFAULT true,
  security_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  campaign_type text,
  status text DEFAULT 'draft',
  start_date date,
  end_date date,
  target_audience text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Call records table
CREATE TABLE IF NOT EXISTS call_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  user_id uuid REFERENCES auth.users(id),
  call_type text,
  duration integer DEFAULT 0,
  recording_url text,
  transcript text,
  sentiment text,
  notes text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view call records"
  ON call_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create call records"
  ON call_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update call records"
  ON call_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_coaching_tasks_assigned_to ON coaching_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_user_id ON roleplay_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_call_records_lead_id ON call_records(lead_id);
