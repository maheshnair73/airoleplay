/*
  # Add Roleplay Bots and Gamification Tables

  1. New Tables
    - `roleplay_bots` - AI roleplay bot personas for sales training
      - Core identification: id, first_name, last_name, title, company_name
      - Persona settings: personality, emotional_state, gender, voice, language
      - Roleplay config: roleplay_type, roleplay_scenario, industry
      - Context: persona_details, priorities_and_objections, company_offerings_context
      - Arrays: buyer_opinions, common_objections, persona_tags, call_goal_tags, product_interest, traits, painPoints
      - Metadata: created_by, created_at, updated_at

    - `game_profiles` - User gamification profiles
      - Identification: id, user_email, user_id
      - Points: total_points, points_this_month, points_this_week
      - Progress: current_level, level_progress
      - Engagement: streak_days, last_activity_date
      - Ranking: rank_company
      - Status: title, is_active

    - `achievements` - Available achievements/badges
    - `user_achievements` - User earned achievements
    - `challenges` - Available challenges
    - `challenge_participations` - User challenge progress
    - `game_actions` - Individual gamified actions
    - `leaderboards` - Leaderboard entries

  2. Security
    - Enable RLS on all tables
    - Users can view own data
    - Super admins and managers can view company data
*/

-- Create roleplay_bots table
CREATE TABLE IF NOT EXISTS roleplay_bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  title text NOT NULL,
  company_name text NOT NULL,
  personality text NOT NULL DEFAULT 'Analytical',
  emotional_state text DEFAULT 'Neutral',
  gender text DEFAULT 'Female',
  voice text DEFAULT 'english_male',
  language text DEFAULT 'english',
  roleplay_type text NOT NULL,
  roleplay_scenario text,
  industry text,
  persona_details text,
  priorities_and_objections text,
  company_offerings_context text,
  initial_prompt text,
  buyer_opinions jsonb DEFAULT '[]'::jsonb,
  common_objections jsonb DEFAULT '[]'::jsonb,
  persona_tags jsonb DEFAULT '[]'::jsonb,
  call_goal_tags jsonb DEFAULT '[]'::jsonb,
  product_interest jsonb DEFAULT '[]'::jsonb,
  traits jsonb DEFAULT '[]'::jsonb,
  painPoints jsonb DEFAULT '[]'::jsonb,
  background text,
  difficulty text DEFAULT 'Medium',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_profiles table
CREATE TABLE IF NOT EXISTS game_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points numeric DEFAULT 0,
  points_this_month numeric DEFAULT 0,
  points_this_week numeric DEFAULT 0,
  current_level numeric DEFAULT 1,
  level_progress numeric DEFAULT 0,
  streak_days numeric DEFAULT 0,
  last_activity_date date,
  rank_company numeric,
  title text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_name text NOT NULL,
  description text,
  badge_icon text,
  points_reward numeric DEFAULT 0,
  difficulty text DEFAULT 'Medium',
  trigger_criteria jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  achievement_id uuid REFERENCES achievements(id),
  points_earned numeric DEFAULT 0,
  earned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_name text NOT NULL,
  description text,
  challenge_type text DEFAULT 'individual',
  status text DEFAULT 'active',
  start_date date,
  end_date date,
  goal_criteria jsonb DEFAULT '{}'::jsonb,
  rewards jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create challenge_participations table
CREATE TABLE IF NOT EXISTS challenge_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  progress numeric DEFAULT 0,
  status text DEFAULT 'active',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_actions table
CREATE TABLE IF NOT EXISTS game_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  action_type text NOT NULL,
  points_earned numeric DEFAULT 0,
  quality_score numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type text NOT NULL,
  period text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  user_name text,
  user_title text,
  team text,
  rank numeric,
  previous_rank numeric,
  value numeric DEFAULT 0,
  badge text,
  trend text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE roleplay_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roleplay_bots
CREATE POLICY "Anyone can view roleplay bots"
  ON roleplay_bots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create bots"
  ON roleplay_bots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own bots"
  ON roleplay_bots FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own bots"
  ON roleplay_bots FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for game_profiles
CREATE POLICY "Users can view own game profile"
  ON game_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Company managers can view company profiles"
  ON game_profiles FOR SELECT
  TO authenticated
  USING (
    get_my_role() IN ('sales_manager', 'company_admin', 'super_admin')
  );

CREATE POLICY "Users can insert own game profile"
  ON game_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game profile"
  ON game_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage achievements"
  ON achievements FOR ALL
  TO authenticated
  USING (get_my_role() IN ('super_admin', 'company_admin'))
  WITH CHECK (get_my_role() IN ('super_admin', 'company_admin'));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for challenges
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage challenges"
  ON challenges FOR ALL
  TO authenticated
  USING (get_my_role() IN ('super_admin', 'company_admin', 'sales_manager'))
  WITH CHECK (get_my_role() IN ('super_admin', 'company_admin', 'sales_manager'));

-- RLS Policies for challenge_participations
CREATE POLICY "Users can view own participations"
  ON challenge_participations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own participations"
  ON challenge_participations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participations"
  ON challenge_participations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for game_actions
CREATE POLICY "Users can view own actions"
  ON game_actions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert actions"
  ON game_actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for leaderboards
CREATE POLICY "Anyone can view leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage leaderboards"
  ON leaderboards FOR ALL
  TO authenticated
  USING (get_my_role() IN ('super_admin', 'company_admin'))
  WITH CHECK (get_my_role() IN ('super_admin', 'company_admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roleplay_bots_created_by ON roleplay_bots(created_by);
CREATE INDEX IF NOT EXISTS idx_roleplay_bots_industry ON roleplay_bots(industry);
CREATE INDEX IF NOT EXISTS idx_game_profiles_user_email ON game_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_game_profiles_user_id ON game_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_user_id ON challenge_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_challenge_id ON challenge_participations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_user_id ON game_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period);
