/*
  # Create Remaining Application Tables

  1. New Tables
    - `ai_insights` - AI-generated insights for leads and opportunities
    - `digital_sales_rooms` - Digital sales room configurations
    - `pitch_submissions` - User pitch submissions for training
    - `performance_reviews` - Sales performance reviews
    - `user_groups` - User group assignments
    - `scorecards` - AI scorecard definitions
    - `scorecard_results` - Scorecard evaluation results
    - `sales_methodologies` - Sales methodology frameworks
    - `lead_activities` - Lead activity tracking
    - `document_views` - Document view analytics
    - `document_templates` - Document templates library
    - `rfp_requests` - RFP/proposal requests
    - `dialer_integrations` - Dialer integration configs
    - `call_analysis_templates` - Call analysis templates
    - `sales_knowledge_base` - Sales knowledge articles
    - `sales_room_messages` - Sales room chat messages
    - `sales_room_engagements` - Sales room engagement tracking
    - `email_compositions` - Email drafts and compositions
    - `email_templates` - Email template library
    - `email_connections` - Email integration connections
    - `inbound_emails` - Received emails
    - `module_access` - Module access permissions
    - `document_annotations` - Document annotations and notes
    - `company_users` - Company-user relationships
    - `subscriptions` - Subscription plans
    - `payments` - Payment records
    - `plan_features` - Plan feature definitions
    - `competitors` - Competitor intelligence
    - `document_versions` - Document version history
    - `document_collaborators` - Document collaborators
    - `document_activities` - Document activity log
    - `document_comments` - Document comments
    - `document_approvals` - Document approval workflow
    - `shared_pitches` - Community shared pitches
    - `shared_questions` - Community shared questions
    - `shared_objections` - Community shared objection handlers
    - `ai_agent_subscriptions` - AI agent subscriptions
    - `ai_agent_activities` - AI agent activity log
    - `game_notifications` - Gamification notifications
    - `kpi_definitions` - KPI definitions
    - `calendar_connections` - Calendar integration connections
    - `community_profiles` - Community user profiles
    - `meetings` - Meeting records
    - `multi_party_scenarios` - Multi-party roleplay scenarios
    - `multi_party_sessions` - Multi-party roleplay sessions

  2. Security
    - Enable RLS on all tables
    - Appropriate policies for authenticated users
*/

-- AI Insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  insight_text text NOT NULL,
  confidence_score numeric DEFAULT 0.8,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insights for their leads"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (true);

-- Digital Sales Rooms
CREATE TABLE IF NOT EXISTS digital_sales_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name text NOT NULL,
  room_slug text UNIQUE,
  lead_id uuid REFERENCES leads(id),
  created_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'active',
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE digital_sales_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales rooms"
  ON digital_sales_rooms FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create sales rooms"
  ON digital_sales_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own sales rooms"
  ON digital_sales_rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Pitch Submissions
CREATE TABLE IF NOT EXISTS pitch_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  pitch_type text,
  content text,
  recording_url text,
  score numeric,
  feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pitch_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pitch submissions"
  ON pitch_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create pitch submissions"
  ON pitch_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  reviewer_id uuid REFERENCES auth.users(id),
  review_period text,
  rating numeric,
  feedback text,
  goals jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews"
  ON performance_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = reviewer_id);

-- User Groups
CREATE TABLE IF NOT EXISTS user_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  description text,
  members jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view groups"
  ON user_groups FOR SELECT
  TO authenticated
  USING (true);

-- Scorecards
CREATE TABLE IF NOT EXISTS scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_name text NOT NULL,
  description text,
  criteria jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active scorecards"
  ON scorecards FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Scorecard Results
CREATE TABLE IF NOT EXISTS scorecard_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id uuid REFERENCES scorecards(id),
  session_id uuid,
  user_id uuid REFERENCES auth.users(id),
  scores jsonb DEFAULT '{}'::jsonb,
  total_score numeric,
  feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scorecard_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scorecard results"
  ON scorecard_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Sales Methodologies
CREATE TABLE IF NOT EXISTS sales_methodologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  methodology_name text NOT NULL,
  description text,
  framework jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales_methodologies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active methodologies"
  ON sales_methodologies FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Lead Activities
CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  activity_type text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lead activities"
  ON lead_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create lead activities"
  ON lead_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Document Views
CREATE TABLE IF NOT EXISTS document_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  viewer_email text,
  viewer_name text,
  duration numeric DEFAULT 0,
  pages_viewed jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log document views"
  ON document_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view document analytics"
  ON document_views FOR SELECT
  TO authenticated
  USING (true);

-- Document Templates
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  template_type text,
  content text,
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates"
  ON document_templates FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = created_by);

-- RFP Requests
CREATE TABLE IF NOT EXISTS rfp_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_name text NOT NULL,
  description text,
  requirements jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rfp_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own RFP requests"
  ON rfp_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create RFP requests"
  ON rfp_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Dialer Integrations
CREATE TABLE IF NOT EXISTS dialer_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name text NOT NULL,
  provider text,
  config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dialer_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations"
  ON dialer_integrations FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Call Analysis Templates
CREATE TABLE IF NOT EXISTS call_analysis_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  criteria jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE call_analysis_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
  ON call_analysis_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Sales Knowledge Base
CREATE TABLE IF NOT EXISTS sales_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  is_published boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sales_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view published articles"
  ON sales_knowledge_base FOR SELECT
  TO authenticated
  USING (is_published = true OR auth.uid() = created_by);

-- Sales Room Messages
CREATE TABLE IF NOT EXISTS sales_room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES digital_sales_rooms(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id),
  sender_email text,
  message_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales_room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view room messages"
  ON sales_room_messages FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can send messages"
  ON sales_room_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Sales Room Engagements
CREATE TABLE IF NOT EXISTS sales_room_engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES digital_sales_rooms(id) ON DELETE CASCADE,
  visitor_email text,
  engagement_type text,
  duration numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales_room_engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log engagements"
  ON sales_room_engagements FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view room engagements"
  ON sales_room_engagements FOR SELECT
  TO authenticated
  USING (true);

-- Email Compositions
CREATE TABLE IF NOT EXISTS email_compositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  lead_id uuid REFERENCES leads(id),
  subject text,
  body text,
  status text DEFAULT 'draft',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_compositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emails"
  ON email_compositions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create emails"
  ON email_compositions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  subject text,
  body text,
  category text,
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = created_by);

-- Email Connections
CREATE TABLE IF NOT EXISTS email_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  provider text,
  email_address text,
  config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email connections"
  ON email_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Inbound Emails
CREATE TABLE IF NOT EXISTS inbound_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  from_email text,
  subject text,
  body text,
  received_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inbound_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inbound emails"
  ON inbound_emails FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Module Access
CREATE TABLE IF NOT EXISTS module_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  module_name text NOT NULL,
  has_access boolean DEFAULT false,
  granted_at timestamptz DEFAULT now()
);

ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own module access"
  ON module_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Document Annotations
CREATE TABLE IF NOT EXISTS document_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  annotation_text text,
  position jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document annotations"
  ON document_annotations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create annotations"
  ON document_annotations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Company Users (relationship table)
CREATE TABLE IF NOT EXISTS company_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id)
);

ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company memberships"
  ON company_users FOR SELECT
  TO authenticated
  USING (true);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  plan_name text NOT NULL,
  status text DEFAULT 'active',
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (get_my_role() IN ('super_admin', 'company_admin'));

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id),
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (get_my_role() IN ('super_admin', 'company_admin'));

-- Plan Features
CREATE TABLE IF NOT EXISTS plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  feature_name text NOT NULL,
  feature_value text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plan features"
  ON plan_features FOR SELECT
  TO authenticated
  USING (true);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name text NOT NULL,
  website text,
  description text,
  strengths jsonb DEFAULT '[]'::jsonb,
  weaknesses jsonb DEFAULT '[]'::jsonb,
  products jsonb DEFAULT '[]'::jsonb,
  pricing_info text,
  battle_cards jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competitors"
  ON competitors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can manage competitors"
  ON competitors FOR ALL
  TO authenticated
  USING (get_my_role() IN ('super_admin', 'company_admin', 'sales_manager'))
  WITH CHECK (get_my_role() IN ('super_admin', 'company_admin', 'sales_manager'));

-- Document Versions
CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  version_number numeric NOT NULL,
  content text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document versions"
  ON document_versions FOR SELECT
  TO authenticated
  USING (true);

-- Document Collaborators
CREATE TABLE IF NOT EXISTS document_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text DEFAULT 'view',
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, user_id)
);

ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document collaborators"
  ON document_collaborators FOR SELECT
  TO authenticated
  USING (true);

-- Document Activities
CREATE TABLE IF NOT EXISTS document_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  activity_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document activities"
  ON document_activities FOR SELECT
  TO authenticated
  USING (true);

-- Document Comments
CREATE TABLE IF NOT EXISTS document_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  comment_text text NOT NULL,
  position jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document comments"
  ON document_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON document_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Document Approvals
CREATE TABLE IF NOT EXISTS document_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  approver_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',
  comments text,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz
);

ALTER TABLE document_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document approvals"
  ON document_approvals FOR SELECT
  TO authenticated
  USING (true);

-- Shared Pitches (community)
CREATE TABLE IF NOT EXISTS shared_pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  upvotes numeric DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shared_pitches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared pitches"
  ON shared_pitches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create shared pitches"
  ON shared_pitches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Shared Questions (community)
CREATE TABLE IF NOT EXISTS shared_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  answer_text text,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  upvotes numeric DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shared_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared questions"
  ON shared_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create shared questions"
  ON shared_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Shared Objections (community)
CREATE TABLE IF NOT EXISTS shared_objections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objection_text text NOT NULL,
  response_text text NOT NULL,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  upvotes numeric DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shared_objections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared objections"
  ON shared_objections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create shared objections"
  ON shared_objections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- AI Agent Subscriptions
CREATE TABLE IF NOT EXISTS ai_agent_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  agent_type text NOT NULL,
  status text DEFAULT 'active',
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_agent_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI subscriptions"
  ON ai_agent_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- AI Agent Activities
CREATE TABLE IF NOT EXISTS ai_agent_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  agent_type text NOT NULL,
  activity_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_agent_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI activities"
  ON ai_agent_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Game Notifications
CREATE TABLE IF NOT EXISTS game_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  notification_type text NOT NULL,
  title text,
  message text,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON game_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- KPI Definitions
CREATE TABLE IF NOT EXISTS kpi_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name text NOT NULL,
  description text,
  calculation_method text,
  target_value numeric,
  unit text,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active KPIs"
  ON kpi_definitions FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Calendar Connections
CREATE TABLE IF NOT EXISTS calendar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  provider text NOT NULL,
  email_address text,
  config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar connections"
  ON calendar_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Community Profiles
CREATE TABLE IF NOT EXISTS community_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  display_name text,
  bio text,
  avatar_url text,
  reputation_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community profiles"
  ON community_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON community_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Meetings
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_title text NOT NULL,
  meeting_type text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  attendees jsonb DEFAULT '[]'::jsonb,
  lead_id uuid REFERENCES leads(id),
  created_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'scheduled',
  meeting_link text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Multi-Party Scenarios
CREATE TABLE IF NOT EXISTS multi_party_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name text NOT NULL,
  description text,
  roles jsonb DEFAULT '[]'::jsonb,
  difficulty text DEFAULT 'Medium',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE multi_party_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view multi-party scenarios"
  ON multi_party_scenarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create scenarios"
  ON multi_party_scenarios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Multi-Party Sessions
CREATE TABLE IF NOT EXISTS multi_party_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES multi_party_scenarios(id),
  host_id uuid REFERENCES auth.users(id),
  participants jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  session_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE multi_party_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view sessions"
  ON multi_party_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Users can create sessions"
  ON multi_party_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_lead_id ON ai_insights(lead_id);
CREATE INDEX IF NOT EXISTS idx_digital_sales_rooms_created_by ON digital_sales_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_document_views_document_id ON document_views(document_id);
CREATE INDEX IF NOT EXISTS idx_sales_room_messages_room_id ON sales_room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_email_compositions_user_id ON email_compositions(user_id);
CREATE INDEX IF NOT EXISTS idx_competitors_created_by ON competitors(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
