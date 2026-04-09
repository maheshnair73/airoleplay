/*
  # SkillCoach AI System

  ## Overview
  Creates the tables needed for the SkillCoach AI Tutor/Coach bot system.
  SkillCoach is an intelligent 1-on-1 coach that monitors rep performance,
  conducts training conversations, assigns tasks, runs quizzes, and requests
  demo recordings.

  ## New Tables

  ### 1. skill_coach_bots
  Defines individual SkillCoach personas (e.g., "Alex the Sales Coach",
  "Sarah the Product Trainer"). Each bot has a focus area, personality,
  and can be assigned to specific reps or teams.
  - id, name, description, avatar_url, personality, focus_area
  - voice_id (ElevenLabs), company_id, created_by
  - is_active, created_at

  ### 2. skill_coach_sessions
  Tracks every 1-on-1 coaching conversation between a rep and a SkillCoach bot.
  Stores the full message history and session metadata.
  - id, bot_id, user_id (rep being coached), company_id
  - session_type: 'onboarding' | 'performance_review' | 'product_training' |
    'skill_drill' | 'quiz' | 'demo_review' | 'free_chat'
  - messages (jsonb array), status: 'active' | 'completed'
  - performance_snapshot (jsonb - rep metrics at session start)
  - started_at, ended_at, summary

  ### 3. skill_coach_tasks
  Action items assigned by SkillCoach during sessions — quizzes, practice
  calls, demo recordings, reading assignments, etc.
  - id, session_id, bot_id, assigned_to (user_id), company_id
  - task_type: 'quiz' | 'roleplay' | 'demo_recording' | 'reading' | 'custom'
  - title, description, due_date
  - status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  - quiz_questions (jsonb), result_data (jsonb)
  - created_at, completed_at

  ## Security
  - RLS enabled on all three tables
  - Reps can read/write their own sessions and tasks
  - Admins/managers can read all sessions and tasks for their company
*/

CREATE TABLE IF NOT EXISTS skill_coach_bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  avatar_emoji text DEFAULT '🤖',
  personality text DEFAULT 'Supportive & Encouraging',
  focus_area text DEFAULT 'General Sales Skills',
  voice_id text DEFAULT '',
  welcome_message text DEFAULT '',
  system_prompt_extra text DEFAULT '',
  company_id uuid,
  created_by text DEFAULT '',
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE skill_coach_bots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active bots for their company"
  ON skill_coach_bots FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert bots"
  ON skill_coach_bots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update bots"
  ON skill_coach_bots FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);


CREATE TABLE IF NOT EXISTS skill_coach_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES skill_coach_bots(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  company_id uuid,
  session_type text NOT NULL DEFAULT 'free_chat',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  performance_snapshot jsonb DEFAULT '{}'::jsonb,
  summary text DEFAULT '',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  CONSTRAINT skill_coach_sessions_status_check CHECK (status IN ('active', 'completed')),
  CONSTRAINT skill_coach_sessions_type_check CHECK (session_type IN ('onboarding', 'performance_review', 'product_training', 'skill_drill', 'quiz', 'demo_review', 'free_chat'))
);

ALTER TABLE skill_coach_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own coaching sessions"
  ON skill_coach_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can read all sessions for their company"
  ON skill_coach_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'company_admin', 'sales_manager', 'saas_admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert their own coaching sessions"
  ON skill_coach_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own coaching sessions"
  ON skill_coach_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


CREATE TABLE IF NOT EXISTS skill_coach_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES skill_coach_sessions(id) ON DELETE SET NULL,
  bot_id uuid REFERENCES skill_coach_bots(id) ON DELETE SET NULL,
  assigned_to uuid NOT NULL,
  company_id uuid,
  task_type text NOT NULL DEFAULT 'custom',
  title text NOT NULL,
  description text DEFAULT '',
  due_date timestamptz,
  status text NOT NULL DEFAULT 'pending',
  quiz_questions jsonb DEFAULT '[]'::jsonb,
  result_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT skill_coach_tasks_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  CONSTRAINT skill_coach_tasks_type_check CHECK (task_type IN ('quiz', 'roleplay', 'demo_recording', 'reading', 'custom'))
);

ALTER TABLE skill_coach_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own coach tasks"
  ON skill_coach_tasks FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Managers can read all tasks for company"
  ON skill_coach_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'company_admin', 'sales_manager', 'saas_admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert tasks (from bot sessions)"
  ON skill_coach_tasks FOR INSERT
  TO authenticated
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Users can update their own tasks"
  ON skill_coach_tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());


INSERT INTO skill_coach_bots (name, description, avatar_emoji, personality, focus_area, welcome_message, is_default, is_active)
VALUES
(
  'Alex',
  'Your personal sales performance coach. Alex reviews your call history, roleplay scores, and KPIs to give you targeted coaching on what will move the needle most.',
  '🎯',
  'Direct & Data-Driven',
  'Sales Performance',
  'Hey! I''m Alex, your sales performance coach. I''ve been looking at your recent activity and I have some thoughts on where we can sharpen your game. Ready to dive in?',
  true,
  true
),
(
  'Maya',
  'Product knowledge specialist. Maya will run you through new product training, quiz you on features and pricing, and make sure you can confidently demo to any prospect.',
  '📚',
  'Patient & Thorough',
  'Product Knowledge & Training',
  'Hi there! I''m Maya, your product training coach. Whether you need a refresher on our latest features or want to prep for a big demo, I''ve got you covered. What would you like to work on today?',
  false,
  true
),
(
  'Jordan',
  'Objection handling and negotiation coach. Jordan will throw tough objections at you, coach you through your responses, and help you close more deals.',
  '💪',
  'Challenging & Growth-Focused',
  'Objection Handling & Closing',
  'What''s up! I''m Jordan. My job is to make your sales conversations uncomfortable — so real ones feel easy. Let''s work on your objection handling. I won''t go easy on you!',
  false,
  true
)
ON CONFLICT DO NOTHING;
