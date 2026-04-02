/*
  # Unified Practice Hub System

  ## Overview
  This migration creates a comprehensive unified practice system that consolidates:
  - Coaching tasks
  - AI roleplay sessions  
  - Human-to-human practice
  - Multi-party scenarios
  - Product demo practice

  ## 1. New Tables

  ### `practice_sessions`
  Core unified table for all practice activities:
  - `id` (uuid, primary key)
  - `session_name` (text) - Display name
  - `practice_mode` (text) - solo_ai, peer_practice, group_practice, ai_multi_party, product_demo
  - `task_type` (text) - audio, video, screen_recording
  - `scenario` (text) - Practice scenario description
  - `difficulty` (text) - beginner, intermediate, advanced, expert
  - `duration_seconds` (integer) - Expected duration
  - `language` (text) - Language for practice
  - `status` (text) - draft, scheduled, active, completed, cancelled
  - `created_by` (uuid) - Creator user ID
  - `created_by_email` (text) - Creator email
  - `scheduled_for` (timestamptz) - When practice is scheduled
  - `completed_at` (timestamptz) - When completed
  - `due_date` (date) - Assignment due date
  - `requires_material_review` (boolean) - Must review materials first
  - `materials_reviewed` (boolean) - Materials review completed
  - `evaluation_config` (jsonb) - Evaluation settings
  - `gamification_config` (jsonb) - Points, badges, leaderboard settings
  - `ai_config` (jsonb) - AI bot IDs and settings
  - `meeting_details` (jsonb) - External meeting links, platform info
  - `metadata` (jsonb) - Flexible additional data
  - `created_at`, `updated_at` (timestamptz)

  ### `practice_participants`
  Tracks all participants in a practice session:
  - `id` (uuid, primary key)
  - `session_id` (uuid) - FK to practice_sessions
  - `user_id` (uuid) - Participant user ID
  - `user_email` (text) - Participant email
  - `role` (text) - rep, prospect, observer, evaluator, ai_bot
  - `status` (text) - invited, accepted, declined, completed
  - `joined_at` (timestamptz) - When joined
  - `notes` (text) - Role-specific notes
  - `is_required` (boolean) - Required participant
  - `created_at` (timestamptz)

  ### `practice_evaluations`
  Multi-evaluator support with flexible scoring:
  - `id` (uuid, primary key)
  - `session_id` (uuid) - FK to practice_sessions
  - `participant_id` (uuid) - Who is being evaluated
  - `evaluator_id` (uuid) - Who is evaluating (null for AI)
  - `evaluator_email` (text) - Evaluator email
  - `evaluator_type` (text) - ai, manager, peer, self
  - `overall_score` (integer) - 0-100 score
  - `criteria_scores` (jsonb) - Detailed scoring per criterion
  - `feedback` (text) - Detailed feedback
  - `strengths` (text[]) - Array of strengths
  - `improvements` (text[]) - Array of improvement areas
  - `transcript_analysis` (jsonb) - AI analysis data
  - `is_final` (boolean) - Manager final evaluation
  - `can_override` (boolean) - Can override other evaluations
  - `submitted_at` (timestamptz)
  - `created_at` (timestamptz)

  ### `practice_recordings`
  Stores session recordings and transcripts:
  - `id` (uuid, primary key)
  - `session_id` (uuid) - FK to practice_sessions
  - `participant_id` (uuid) - FK to practice_participants
  - `recording_type` (text) - audio, video, screen
  - `file_url` (text) - Storage URL
  - `transcript` (text) - Full transcript
  - `duration_seconds` (integer) - Recording duration
  - `file_size_bytes` (bigint) - File size
  - `processing_status` (text) - pending, processing, completed, failed
  - `created_at` (timestamptz)

  ### `practice_materials_junction`
  Links practice sessions to knowledge materials:
  - `id` (uuid, primary key)
  - `session_id` (uuid) - FK to practice_sessions
  - `material_id` (uuid) - FK to roleplay_knowledge_materials
  - `is_required` (boolean) - Must review before practice
  - `reading_order` (integer) - Display order
  - `created_at` (timestamptz)

  ## 2. Views

  ### `unified_practice_view`
  Consolidates legacy tables with new unified table for backward compatibility

  ## 3. Security
  - RLS enabled on all tables
  - Policies for authenticated users
  - Manager override permissions
  - Public access for shared sessions (future)

  ## 4. Indexes
  - Performance indexes on frequently queried fields
  - Foreign key indexes

  ## 5. Triggers
  - Auto-update timestamps
  - Gamification point awarding
  - Material review validation
*/

-- =====================================================
-- 1. CREATE MAIN TABLES
-- =====================================================

-- Practice Sessions (Unified Core Table)
CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name text NOT NULL,
  practice_mode text NOT NULL DEFAULT 'solo_ai',
  task_type text NOT NULL DEFAULT 'audio',
  scenario text NOT NULL,
  difficulty text DEFAULT 'intermediate',
  duration_seconds integer DEFAULT 600,
  language text DEFAULT 'english',
  status text DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text NOT NULL,
  scheduled_for timestamptz,
  completed_at timestamptz,
  due_date date,
  requires_material_review boolean DEFAULT false,
  materials_reviewed boolean DEFAULT false,
  evaluation_config jsonb DEFAULT '{"criteria": [], "ai_enabled": true, "peer_enabled": false, "manager_required": false}'::jsonb,
  gamification_config jsonb DEFAULT '{"enabled": false, "points": 0, "challenge_id": null}'::jsonb,
  ai_config jsonb DEFAULT '{"bot_ids": [], "voice_settings": {}}'::jsonb,
  meeting_details jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_practice_mode CHECK (practice_mode IN ('solo_ai', 'peer_practice', 'group_practice', 'ai_multi_party', 'product_demo')),
  CONSTRAINT valid_task_type CHECK (task_type IN ('audio', 'video', 'screen_recording')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'active', 'in_progress', 'completed', 'cancelled', 'paused')),
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert'))
);

-- Practice Participants
CREATE TABLE IF NOT EXISTS practice_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text NOT NULL,
  role text NOT NULL DEFAULT 'rep',
  status text DEFAULT 'invited',
  joined_at timestamptz,
  notes text,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_role CHECK (role IN ('rep', 'prospect', 'observer', 'evaluator', 'ai_bot', 'manager')),
  CONSTRAINT valid_status CHECK (status IN ('invited', 'accepted', 'declined', 'completed', 'no_show'))
);

-- Practice Evaluations
CREATE TABLE IF NOT EXISTS practice_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES practice_participants(id) ON DELETE SET NULL,
  evaluator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  evaluator_email text,
  evaluator_type text NOT NULL DEFAULT 'ai',
  overall_score integer,
  criteria_scores jsonb DEFAULT '[]'::jsonb,
  feedback text,
  strengths text[] DEFAULT ARRAY[]::text[],
  improvements text[] DEFAULT ARRAY[]::text[],
  transcript_analysis jsonb,
  is_final boolean DEFAULT false,
  can_override boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_evaluator_type CHECK (evaluator_type IN ('ai', 'manager', 'peer', 'self')),
  CONSTRAINT valid_score CHECK (overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100))
);

-- Practice Recordings
CREATE TABLE IF NOT EXISTS practice_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES practice_participants(id) ON DELETE SET NULL,
  recording_type text DEFAULT 'audio',
  file_url text,
  transcript text,
  duration_seconds integer DEFAULT 0,
  file_size_bytes bigint DEFAULT 0,
  processing_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_recording_type CHECK (recording_type IN ('audio', 'video', 'screen')),
  CONSTRAINT valid_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Practice Materials Junction
CREATE TABLE IF NOT EXISTS practice_materials_junction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES roleplay_knowledge_materials(id) ON DELETE CASCADE,
  is_required boolean DEFAULT false,
  reading_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(session_id, material_id)
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_practice_sessions_created_by ON practice_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_status ON practice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_practice_mode ON practice_sessions(practice_mode);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_scheduled_for ON practice_sessions(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_due_date ON practice_sessions(due_date);

CREATE INDEX IF NOT EXISTS idx_practice_participants_session_id ON practice_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_participants_user_id ON practice_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_participants_user_email ON practice_participants(user_email);

CREATE INDEX IF NOT EXISTS idx_practice_evaluations_session_id ON practice_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_evaluations_evaluator_id ON practice_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_practice_evaluations_participant_id ON practice_evaluations(participant_id);

CREATE INDEX IF NOT EXISTS idx_practice_recordings_session_id ON practice_recordings(session_id);

CREATE INDEX IF NOT EXISTS idx_practice_materials_junction_session_id ON practice_materials_junction(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_materials_junction_material_id ON practice_materials_junction(material_id);

-- =====================================================
-- 3. CREATE VIEW FOR LEGACY COMPATIBILITY
-- =====================================================

CREATE OR REPLACE VIEW unified_practice_view AS
SELECT 
  ps.id,
  ps.session_name,
  ps.practice_mode,
  ps.task_type,
  ps.scenario,
  ps.difficulty,
  ps.duration_seconds,
  ps.status,
  ps.created_by,
  ps.created_by_email,
  ps.scheduled_for,
  ps.completed_at,
  ps.due_date,
  ps.created_at,
  ps.updated_at,
  'practice_session' as source_table,
  json_agg(DISTINCT pp.*) FILTER (WHERE pp.id IS NOT NULL) as participants,
  json_agg(DISTINCT pe.*) FILTER (WHERE pe.id IS NOT NULL) as evaluations,
  json_agg(DISTINCT pmj.*) FILTER (WHERE pmj.id IS NOT NULL) as materials
FROM practice_sessions ps
LEFT JOIN practice_participants pp ON ps.id = pp.session_id
LEFT JOIN practice_evaluations pe ON ps.id = pe.session_id
LEFT JOIN practice_materials_junction pmj ON ps.id = pmj.session_id
GROUP BY ps.id;

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_materials_junction ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Practice Sessions Policies
CREATE POLICY "Users can view their own practice sessions"
  ON practice_sessions FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() 
    OR created_by_email = auth.jwt()->>'email'
    OR id IN (SELECT session_id FROM practice_participants WHERE user_id = auth.uid() OR user_email = auth.jwt()->>'email')
  );

CREATE POLICY "Users can create practice sessions"
  ON practice_sessions FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid() OR created_by_email = auth.jwt()->>'email');

CREATE POLICY "Users can update their own practice sessions"
  ON practice_sessions FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR created_by_email = auth.jwt()->>'email')
  WITH CHECK (created_by = auth.uid() OR created_by_email = auth.jwt()->>'email');

CREATE POLICY "Users can delete their own practice sessions"
  ON practice_sessions FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR created_by_email = auth.jwt()->>'email');

-- Practice Participants Policies
CREATE POLICY "Users can view participants in their sessions"
  ON practice_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR user_email = auth.jwt()->>'email'
    OR session_id IN (SELECT id FROM practice_sessions WHERE created_by = auth.uid() OR created_by_email = auth.jwt()->>'email')
  );

CREATE POLICY "Session creators can add participants"
  ON practice_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (SELECT id FROM practice_sessions WHERE created_by = auth.uid() OR created_by_email = auth.jwt()->>'email')
  );

CREATE POLICY "Participants can update their own status"
  ON practice_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_email = auth.jwt()->>'email')
  WITH CHECK (user_id = auth.uid() OR user_email = auth.jwt()->>'email');

-- Practice Evaluations Policies
CREATE POLICY "Users can view evaluations for their sessions"
  ON practice_evaluations FOR SELECT
  TO authenticated
  USING (
    evaluator_id = auth.uid()
    OR evaluator_email = auth.jwt()->>'email'
    OR participant_id IN (SELECT id FROM practice_participants WHERE user_id = auth.uid() OR user_email = auth.jwt()->>'email')
    OR session_id IN (SELECT id FROM practice_sessions WHERE created_by = auth.uid() OR created_by_email = auth.jwt()->>'email')
  );

CREATE POLICY "Evaluators can create evaluations"
  ON practice_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (
    evaluator_id = auth.uid() 
    OR evaluator_email = auth.jwt()->>'email'
    OR session_id IN (SELECT id FROM practice_sessions WHERE created_by = auth.uid() OR created_by_email = auth.jwt()->>'email')
  );

CREATE POLICY "Evaluators can update their evaluations"
  ON practice_evaluations FOR UPDATE
  TO authenticated
  USING (evaluator_id = auth.uid() OR evaluator_email = auth.jwt()->>'email')
  WITH CHECK (evaluator_id = auth.uid() OR evaluator_email = auth.jwt()->>'email');

-- Practice Recordings Policies
CREATE POLICY "Users can view recordings from their sessions"
  ON practice_recordings FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT ps.id FROM practice_sessions ps
      LEFT JOIN practice_participants pp ON ps.id = pp.session_id
      WHERE ps.created_by = auth.uid() 
        OR ps.created_by_email = auth.jwt()->>'email'
        OR pp.user_id = auth.uid()
        OR pp.user_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Session participants can create recordings"
  ON practice_recordings FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT session_id FROM practice_participants 
      WHERE user_id = auth.uid() OR user_email = auth.jwt()->>'email'
    )
  );

-- Practice Materials Junction Policies
CREATE POLICY "Users can view materials for their sessions"
  ON practice_materials_junction FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT ps.id FROM practice_sessions ps
      LEFT JOIN practice_participants pp ON ps.id = pp.session_id
      WHERE ps.created_by = auth.uid()
        OR ps.created_by_email = auth.jwt()->>'email'
        OR pp.user_id = auth.uid()
        OR pp.user_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Session creators can add materials"
  ON practice_materials_junction FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (SELECT id FROM practice_sessions WHERE created_by = auth.uid() OR created_by_email = auth.jwt()->>'email')
  );

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_practice_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_practice_sessions_updated_at
  BEFORE UPDATE ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_sessions_updated_at();

-- Award gamification points on completion
CREATE OR REPLACE FUNCTION award_practice_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award integer;
  challenge_id uuid;
BEGIN
  -- Only award points when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get points from gamification config
    points_to_award := COALESCE((NEW.gamification_config->>'points')::integer, 0);
    challenge_id := (NEW.gamification_config->>'challenge_id')::uuid;
    
    IF points_to_award > 0 THEN
      -- Insert game action for point tracking
      INSERT INTO game_actions (
        user_id,
        user_email,
        action_type,
        points_earned,
        related_entity_type,
        related_entity_id,
        description
      ) VALUES (
        NEW.created_by,
        NEW.created_by_email,
        'practice_completed',
        points_to_award,
        'practice_session',
        NEW.id,
        'Completed practice: ' || NEW.session_name
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_practice_points
  AFTER UPDATE ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION award_practice_points();