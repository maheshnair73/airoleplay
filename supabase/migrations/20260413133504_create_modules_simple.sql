CREATE TABLE IF NOT EXISTS practice_modules_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  module_name text NOT NULL,
  description text,
  module_type text DEFAULT 'roleplay',
  difficulty_level text DEFAULT 'intermediate',
  icon_url text,
  is_published boolean DEFAULT false,
  created_by_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS module_sharing_rules_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL,
  share_type text NOT NULL,
  target_role text,
  target_email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_module_assignments_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  module_id uuid NOT NULL,
  company_id uuid,
  assignment_date timestamptz DEFAULT now(),
  status text DEFAULT 'assigned',
  completion_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS module_feedback_submissions_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  module_id uuid NOT NULL,
  activity_id text NOT NULL,
  feedback_type text NOT NULL,
  submitted_by_email text NOT NULL,
  feedback_content jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
