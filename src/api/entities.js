import { supabase } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';

async function getUserRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return profile?.role || 'sales_agent';
}

function createEntity(tableName) {
  return {
    async list(orderBy) {
      let query = supabase.from(tableName).select('*');

      if (orderBy) {
        const isDescending = orderBy.startsWith('-');
        const column = isDescending ? orderBy.slice(1) : orderBy;
        query = query.order(column, { ascending: !isDescending });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },

    async filter(filters) {
      const data = mockData[tableName] || [];
      let filtered = data;

      Object.entries(filters).forEach(([key, value]) => {
        filtered = filtered.filter(item => item[key] === value);
      });

      return filtered;
    },

    async create(data) {
      const { data: result, error } = await supabase.from(tableName).insert(data).select().single();
      if (error) throw error;
      return result;
    },

    async update(id, data) {
      const { data: result, error } = await supabase.from(tableName).update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  };
}

export const Lead = createEntity('leads');
export const AIInsight = createEntity('ai_insights');
export const DigitalSalesRoom = createEntity('digital_sales_rooms');
export const PitchSubmission = createEntity('pitch_submissions');
export const PerformanceReview = createEntity('performance_reviews');
export const CoachingTask = createEntity('coaching_tasks');
export const TaskSubmission = createEntity('task_submissions');
export const UserGroup = createEntity('user_groups');
export const Scorecard = createEntity('scorecards');
export const ScorecardResult = createEntity('scorecard_results');
export const SalesMethodology = createEntity('sales_methodologies');
export const LeadActivity = createEntity('lead_activities');
export const Document = createEntity('documents');
export const DocumentView = createEntity('document_views');
export const DocumentTemplate = createEntity('document_templates');
export const RFPRequest = createEntity('rfp_requests');
export const CallRecord = createEntity('call_records');
export const DialerIntegration = createEntity('dialer_integrations');
export const CallAnalysisTemplate = createEntity('call_analysis_templates');
export const SalesKnowledgeBase = createEntity('sales_knowledge_base');
export const SalesRoomMessage = createEntity('sales_room_messages');
export const SalesRoomEngagement = createEntity('sales_room_engagements');
export const RoleplaySession = createEntity('roleplay_sessions');
export const EmailComposition = createEntity('email_compositions');
export const EmailTemplate = createEntity('email_templates');
export const EmailConnection = createEntity('email_connections');
export const InboundEmail = createEntity('inbound_emails');
export const ModuleAccess = createEntity('module_access');
export const DocumentAnnotation = createEntity('document_annotations');
export const Company = createEntity('companies');
export const CompanyUser = createEntity('company_users');
export const Subscription = createEntity('subscriptions');
export const Payment = createEntity('payments');
export const PlanFeature = createEntity('plan_features');
export const Campaign = createEntity('campaigns');
export const Product = createEntity('products');
export const Competitor = createEntity('competitors');
export const DocumentVersion = createEntity('document_versions');
export const DocumentCollaborator = createEntity('document_collaborators');
export const DocumentActivity = createEntity('document_activities');
export const DocumentComment = createEntity('document_comments');
export const DocumentApproval = createEntity('document_approvals');
export const SharedPitch = createEntity('shared_pitches');
export const SharedQuestion = createEntity('shared_questions');
export const SharedObjection = createEntity('shared_objections');
export const AIAgentSubscription = createEntity('ai_agent_subscriptions');
export const AIAgentActivity = createEntity('ai_agent_activities');
export const RoleplayBot = createEntity('ai_clients');
export const AIClient = createEntity('ai_clients');
export const AttendeeProfile = createEntity('attendee_profiles');
export const GameProfile = createEntity('game_profiles');
export const Achievement = createEntity('achievements');
export const UserAchievement = createEntity('user_achievements');
export const Challenge = createEntity('challenges');
export const ChallengeParticipation = createEntity('challenge_participations');
export const Leaderboard = createEntity('leaderboards');
export const GameNotification = createEntity('game_notifications');
export const GameAction = createEntity('game_actions');
export const KPIDefinition = createEntity('kpi_definitions');
export const CalendarConnection = createEntity('calendar_connections');
export const CommunityProfile = createEntity('community_profiles');
export const Meeting = createEntity('meetings');
export const MultiPartyScenario = createEntity('multi_party_scenarios');
export const MultiPartySession = createEntity('multi_party_sessions');
export const Deal = createEntity('deals');
export const AnalysisFramework = createEntity('analysis_frameworks');
export const AnalysisConfiguration = createEntity('analysis_configurations');
export const SessionAnalysisResult = createEntity('session_analysis_results');

export const User = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (user) {
      const profile = mockData.user_profiles.find(p => p.id === user.id);

      return {
        ...user,
        ...profile,
        role: profile?.role || 'sales_agent'
      };
    }

    return user;
  },

  async list() {
    return mockData.user_profiles || [];
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async logout() {
    return this.signOut();
  }
};
