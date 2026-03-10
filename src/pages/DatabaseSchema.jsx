import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Table, Key, Shield, Link2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const DatabaseSchema = () => {
  const coreSchemas = [
    {
      name: 'roleplay_sessions',
      description: 'Main table for tracking all roleplay practice sessions',
      icon: '🎭',
      fields: [
        { name: 'id', type: 'uuid', pk: true, description: 'Primary key' },
        { name: 'session_name', type: 'text', description: 'Session name' },
        { name: 'user_id', type: 'uuid', fk: 'auth.users', description: 'User who created the session' },
        { name: 'session_type', type: 'text', default: 'ai_roleplay', description: 'ai_roleplay, human_roleplay, multi_party, product_demo' },
        { name: 'roleplay_type', type: 'text', default: 'voice_call', description: 'Type of roleplay' },
        { name: 'scenario_type', type: 'text', description: 'Scenario identifier' },
        { name: 'difficulty', type: 'text', default: 'medium', description: 'Difficulty level' },
        { name: 'duration', type: 'integer', default: '0', description: 'Session duration in seconds' },
        { name: 'score', type: 'integer', description: 'Overall session score' },
        { name: 'transcript', type: 'jsonb', default: '[]', description: 'Array of conversation exchanges' },
        { name: 'feedback', type: 'text', description: 'AI-generated feedback' },
        { name: 'status', type: 'text', default: 'active', description: 'Session status' },
        { name: 'lead_id', type: 'uuid', fk: 'leads', description: 'Associated lead' },
        { name: 'is_demo', type: 'boolean', default: 'false', description: 'Demo session flag' },
        { name: 'created_at', type: 'timestamptz', description: 'Creation timestamp' },
        { name: 'completed_at', type: 'timestamptz', description: 'Completion timestamp' }
      ]
    },
    {
      name: 'ai_clients',
      description: 'AI personas/bots for roleplay practice',
      icon: '🤖',
      fields: [
        { name: 'id', type: 'uuid', pk: true, description: 'Primary key' },
        { name: 'first_name', type: 'text', required: true, description: 'First name' },
        { name: 'last_name', type: 'text', required: true, description: 'Last name' },
        { name: 'title', type: 'text', required: true, description: 'Job title' },
        { name: 'company_name', type: 'text', required: true, description: 'Company name' },
        { name: 'personality', type: 'text', default: 'Analytical', description: 'Personality type' },
        { name: 'emotional_state', type: 'text', default: 'Neutral', description: 'Current emotional state' },
        { name: 'gender', type: 'text', default: 'Female', description: 'Gender for voice selection' },
        { name: 'voice', type: 'text', default: 'english_male', description: 'Voice identifier' },
        { name: 'language', type: 'text', default: 'english', description: 'Language preference' },
        { name: 'roleplay_type', type: 'text', required: true, description: 'Type of roleplay' },
        { name: 'roleplay_scenario', type: 'text', description: 'Detailed scenario' },
        { name: 'industry', type: 'text', description: 'Industry sector' },
        { name: 'persona_details', type: 'text', description: 'Detailed persona information' },
        { name: 'priorities_and_objections', type: 'text', description: 'Key priorities and common objections' },
        { name: 'background', type: 'text', description: 'Background story' },
        { name: 'difficulty', type: 'text', default: 'Medium', description: 'Difficulty level' },
        { name: 'visibility', type: 'text', default: 'all_users', description: 'Sharing scope' },
        { name: 'shared_with_user_ids', type: 'jsonb', default: '[]', description: 'Array of user IDs with access' },
        { name: 'buyer_opinions', type: 'jsonb', default: '[]', description: 'Array of buyer opinions' },
        { name: 'common_objections', type: 'jsonb', default: '[]', description: 'Array of common objections' },
        { name: 'persona_tags', type: 'jsonb', default: '[]', description: 'Tags for categorization' },
        { name: 'is_active', type: 'boolean', default: 'true', description: 'Active status' },
        { name: 'created_by', type: 'uuid', fk: 'auth.users', description: 'Creator user ID' },
        { name: 'created_at', type: 'timestamptz', description: 'Creation timestamp' }
      ]
    },
    {
      name: 'leads',
      description: 'Lead/prospect information and tracking',
      icon: '👤',
      fields: [
        { name: 'id', type: 'uuid', pk: true, description: 'Primary key' },
        { name: 'lead_name', type: 'text', required: true, description: 'Lead full name' },
        { name: 'company_name', type: 'text', description: 'Company name' },
        { name: 'company_id', type: 'uuid', fk: 'companies', description: 'Associated company' },
        { name: 'email', type: 'text', description: 'Email address' },
        { name: 'phone', type: 'text', description: 'Phone number' },
        { name: 'stage', type: 'text', default: 'new', description: 'Pipeline stage' },
        { name: 'status', type: 'text', default: 'active', description: 'Lead status' },
        { name: 'disposition', type: 'text', description: 'Call disposition' },
        { name: 'sub_disposition', type: 'text', description: 'Sub-disposition detail' },
        { name: 'assigned_to', type: 'uuid', fk: 'auth.users', description: 'Assigned sales rep' },
        { name: 'assigned_to_email', type: 'text', description: 'Assigned rep email' },
        { name: 'source', type: 'text', description: 'Lead source' },
        { name: 'notes', type: 'text', description: 'Additional notes' },
        { name: 'last_call_date', type: 'timestamptz', description: 'Last call timestamp' },
        { name: 'next_call_date', type: 'timestamptz', description: 'Scheduled next call' },
        { name: 'total_call_count', type: 'integer', default: '0', description: 'Total number of calls' },
        { name: 'pitch_practice_count', type: 'integer', default: '0', description: 'Number of practice sessions' },
        { name: 'created_at', type: 'timestamptz', description: 'Creation timestamp' }
      ]
    },
    {
      name: 'companies',
      description: 'Company information and details',
      icon: '🏢',
      fields: [
        { name: 'id', type: 'uuid', pk: true, description: 'Primary key' },
        { name: 'company_name', type: 'text', required: true, description: 'Company name' },
        { name: 'industry', type: 'text', description: 'Industry sector' },
        { name: 'website', type: 'text', description: 'Company website' },
        { name: 'description', type: 'text', description: 'Company description' },
        { name: 'created_at', type: 'timestamptz', description: 'Creation timestamp' }
      ]
    },
    {
      name: 'products',
      description: 'Product catalog and features',
      icon: '📦',
      fields: [
        { name: 'id', type: 'uuid', pk: true, description: 'Primary key' },
        { name: 'product_name', type: 'text', required: true, description: 'Product name' },
        { name: 'description', type: 'text', description: 'Product description' },
        { name: 'price', type: 'numeric', description: 'Product price' },
        { name: 'category', type: 'text', description: 'Product category' },
        { name: 'features', type: 'jsonb', default: '[]', description: 'Array of features' },
        { name: 'created_at', type: 'timestamptz', description: 'Creation timestamp' }
      ]
    },
    {
      name: 'deals',
      description: 'Sales opportunities and pipeline',
      icon: '💰',
      fields: [
        { name: 'id', type: 'uuid', pk: true, description: 'Primary key' },
        { name: 'deal_name', type: 'text', required: true, description: 'Deal name' },
        { name: 'lead_id', type: 'uuid', fk: 'leads', description: 'Associated lead' },
        { name: 'company_id', type: 'uuid', fk: 'companies', description: 'Associated company' },
        { name: 'deal_value', type: 'numeric', default: '0', description: 'Deal value' },
        { name: 'stage', type: 'text', default: 'prospecting', description: 'Deal stage' },
        { name: 'probability', type: 'integer', default: '0', description: 'Win probability %' },
        { name: 'close_date', type: 'date', description: 'Expected close date' },
        { name: 'assigned_to', type: 'uuid', fk: 'auth.users', description: 'Assigned sales rep' },
        { name: 'notes', type: 'text', description: 'Deal notes' },
        { name: 'created_at', type: 'timestamptz', description: 'Creation timestamp' }
      ]
    },
    {
      name: 'coaching_tasks',
      description: 'Training and coaching assignments',
      icon: '📚',
      fields: [
        { name: 'id', type: 'uuid', pk: true, description: 'Primary key' },
        { name: 'task_name', type: 'text', required: true, description: 'Task name' },
        { name: 'description', type: 'text', description: 'Task description' },
        { name: 'task_type', type: 'text', default: 'pitch', description: 'Type of task' },
        { name: 'assigned_to', type: 'uuid', fk: 'auth.users', description: 'Assigned user' },
        { name: 'due_date', type: 'date', description: 'Due date' },
        { name: 'status', type: 'text', default: 'pending', description: 'Task status' },
        { name: 'created_by', type: 'uuid', fk: 'auth.users', description: 'Creator' },
        { name: 'created_at', type: 'timestamptz', description: 'Creation timestamp' }
      ]
    },
    {
      name: 'documents',
      description: 'Document management and sharing',
      icon: '📄',
      fields: [
        { name: 'id', type: 'uuid', pk: true, description: 'Primary key' },
        { name: 'public_id', type: 'text', description: 'Public sharing ID' },
        { name: 'document_name', type: 'text', required: true, description: 'Document name' },
        { name: 'document_type', type: 'text', description: 'Document type' },
        { name: 'file_url', type: 'text', description: 'File storage URL' },
        { name: 'content', type: 'text', description: 'Document content' },
        { name: 'created_by', type: 'uuid', fk: 'auth.users', description: 'Creator' },
        { name: 'shared_with', type: 'text[]', description: 'Array of emails' },
        { name: 'require_email', type: 'boolean', default: 'false', description: 'Email gate' },
        { name: 'allow_download', type: 'boolean', default: 'true', description: 'Download permission' },
        { name: 'created_at', type: 'timestamptz', description: 'Creation timestamp' }
      ]
    },
    {
      name: 'call_records',
      description: 'Call tracking and recordings',
      icon: '📞',
      fields: [
        { name: 'id', type: 'uuid', pk: true, description: 'Primary key' },
        { name: 'lead_id', type: 'uuid', fk: 'leads', description: 'Associated lead' },
        { name: 'user_id', type: 'uuid', fk: 'auth.users', description: 'User who made call' },
        { name: 'call_type', type: 'text', description: 'Type of call' },
        { name: 'duration', type: 'integer', default: '0', description: 'Call duration in seconds' },
        { name: 'recording_url', type: 'text', description: 'Recording URL' },
        { name: 'transcript', type: 'text', description: 'Call transcript' },
        { name: 'sentiment', type: 'text', description: 'Sentiment analysis' },
        { name: 'notes', type: 'text', description: 'Call notes' },
        { name: 'status', type: 'text', default: 'completed', description: 'Call status' },
        { name: 'created_at', type: 'timestamptz', description: 'Creation timestamp' }
      ]
    }
  ];

  const additionalTables = [
    { name: 'ai_insights', description: 'AI-generated insights for leads and opportunities', category: 'Analytics' },
    { name: 'digital_sales_rooms', description: 'Digital sales room configurations', category: 'Sales Execution' },
    { name: 'pitch_submissions', description: 'User pitch submissions for training', category: 'Training' },
    { name: 'performance_reviews', description: 'Sales performance reviews', category: 'Training' },
    { name: 'user_groups', description: 'User group assignments', category: 'User Management' },
    { name: 'scorecards', description: 'AI scorecard definitions', category: 'Analytics' },
    { name: 'scorecard_results', description: 'Scorecard evaluation results', category: 'Analytics' },
    { name: 'sales_methodologies', description: 'Sales methodology frameworks', category: 'Training' },
    { name: 'lead_activities', description: 'Lead activity tracking', category: 'Sales Execution' },
    { name: 'document_views', description: 'Document view analytics', category: 'Analytics' },
    { name: 'document_templates', description: 'Document templates library', category: 'Sales Execution' },
    { name: 'rfp_requests', description: 'RFP/proposal requests', category: 'Sales Execution' },
    { name: 'dialer_integrations', description: 'Dialer integration configs', category: 'Integrations' },
    { name: 'call_analysis_templates', description: 'Call analysis templates', category: 'Analytics' },
    { name: 'sales_knowledge_base', description: 'Sales knowledge articles', category: 'Training' },
    { name: 'sales_room_messages', description: 'Sales room chat messages', category: 'Sales Execution' },
    { name: 'sales_room_engagements', description: 'Sales room engagement tracking', category: 'Analytics' },
    { name: 'email_compositions', description: 'Email drafts and compositions', category: 'Sales Execution' },
    { name: 'email_templates', description: 'Email template library', category: 'Sales Execution' },
    { name: 'module_access', description: 'Module access permissions', category: 'User Management' },
    { name: 'company_users', description: 'Company-user relationships', category: 'User Management' },
    { name: 'subscriptions', description: 'Subscription plans', category: 'Billing' },
    { name: 'payments', description: 'Payment records', category: 'Billing' },
    { name: 'competitors', description: 'Competitor intelligence', category: 'Knowledge' },
    { name: 'document_versions', description: 'Document version history', category: 'Sales Execution' },
    { name: 'shared_pitches', description: 'Community shared pitches', category: 'Community' },
    { name: 'ai_agent_subscriptions', description: 'AI agent subscriptions', category: 'AI' },
    { name: 'game_notifications', description: 'Gamification notifications', category: 'Gamification' },
    { name: 'achievements', description: 'Achievement definitions', category: 'Gamification' },
    { name: 'challenges', description: 'Challenge definitions', category: 'Gamification' },
    { name: 'user_achievements', description: 'User achievement unlocks', category: 'Gamification' },
    { name: 'leaderboard_entries', description: 'Leaderboard rankings', category: 'Gamification' },
    { name: 'kpi_definitions', description: 'KPI definitions', category: 'Analytics' },
    { name: 'calendar_connections', description: 'Calendar integration connections', category: 'Integrations' },
    { name: 'meetings', description: 'Meeting records', category: 'Sales Execution' },
    { name: 'multi_party_scenarios', description: 'Multi-party roleplay scenarios', category: 'Training' },
    { name: 'product_features', description: 'Product feature details', category: 'Knowledge' },
    { name: 'feature_demonstrations', description: 'Feature demonstration guides', category: 'Knowledge' },
    { name: 'attendee_profiles', description: 'Meeting attendee profiles', category: 'Sales Execution' }
  ];

  const categories = [...new Set(additionalTables.map(t => t.category))].sort();

  const FieldBadge = ({ field }) => (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {field.pk && <Key className="w-3 h-3 text-yellow-500" />}
          {field.fk && <Link2 className="w-3 h-3 text-blue-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-semibold text-foreground">{field.name}</code>
            <Badge variant="outline" className="text-xs">{field.type}</Badge>
            {field.required && <Badge className="text-xs bg-red-500">required</Badge>}
            {field.default && <Badge variant="secondary" className="text-xs">default: {field.default}</Badge>}
            {field.fk && <Badge variant="outline" className="text-xs text-blue-600">FK → {field.fk}</Badge>}
          </div>
          {field.description && (
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Database Schema</h1>
          <p className="text-muted-foreground">Complete database schema documentation for EffySales Pro</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & RLS
          </CardTitle>
          <CardDescription>
            All tables have Row Level Security (RLS) enabled with policies that enforce authenticated access,
            ownership checks, and proper data isolation between users and organizations.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="core" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="core">Core Tables</TabsTrigger>
          <TabsTrigger value="additional">Additional Tables</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4">
          {coreSchemas.map((schema) => (
            <Card key={schema.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{schema.icon}</span>
                  <Table className="w-5 h-5" />
                  <code className="text-lg">{schema.name}</code>
                </CardTitle>
                <CardDescription>{schema.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {schema.fields.map((field, idx) => (
                    <FieldBadge key={idx} field={field} />
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="additional" className="space-y-4">
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {additionalTables
                    .filter(t => t.category === category)
                    .map((table) => (
                      <div key={table.name} className="flex items-start gap-2 p-3 border rounded-lg">
                        <Table className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <code className="text-sm font-semibold block truncate">{table.name}</code>
                          <p className="text-xs text-muted-foreground mt-1">{table.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Schema Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{coreSchemas.length}</div>
              <div className="text-sm text-muted-foreground">Core Tables</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{additionalTables.length}</div>
              <div className="text-sm text-muted-foreground">Additional Tables</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{coreSchemas.length + additionalTables.length}</div>
              <div className="text-sm text-muted-foreground">Total Tables</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold">Key Features</h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>All tables use UUID primary keys for distributed systems compatibility</li>
              <li>Timestamps (created_at, updated_at) for audit trails</li>
              <li>Foreign key relationships for data integrity</li>
              <li>JSONB fields for flexible schema extensions</li>
              <li>Proper indexes on frequently queried columns</li>
              <li>Comprehensive RLS policies on all tables</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSchema;
