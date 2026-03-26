export const mockData = {
  users: [
    {
      id: 'mock-user-admin-001',
      email: 'admin@effysalespro.com',
      role: 'company_admin',
      full_name: 'Admin User',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'mock-user-manager-001',
      email: 'manager@effysalespro.com',
      role: 'sales_manager',
      full_name: 'Sales Manager',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'mock-user-agent1-001',
      email: 'agent1@effysalespro.com',
      role: 'sales_agent',
      full_name: 'Agent One',
      company_id: 'company-001',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'mock-user-agent2-001',
      email: 'agent2@effysalespro.com',
      role: 'sales_agent',
      full_name: 'Agent Two',
      company_id: 'company-001',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],

  user_profiles: [
    {
      id: 'mock-user-admin-001',
      email: 'admin@effysalespro.com',
      role: 'company_admin',
      full_name: 'Admin User',
      company_id: 'company-001',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'mock-user-manager-001',
      email: 'manager@effysalespro.com',
      role: 'sales_manager',
      full_name: 'Sales Manager',
      company_id: 'company-001',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'mock-user-agent1-001',
      email: 'agent1@effysalespro.com',
      role: 'sales_agent',
      full_name: 'Agent One',
      company_id: 'company-001',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'mock-user-agent2-001',
      email: 'agent2@effysalespro.com',
      role: 'sales_agent',
      full_name: 'Agent Two',
      company_id: 'company-001',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],

  leads: [
    {
      id: 'lead-001',
      company_name: 'Acme Corporation',
      contact_name: 'John Smith',
      contact_email: 'john.smith@acme.com',
      contact_phone: '+1 555-0123',
      status: 'qualified',
      stage: 'discovery',
      owner_id: 'mock-user-agent1-001',
      created_at: '2024-02-15T10:00:00Z',
      estimated_deal_value: 50000,
      source: 'website',
      lead_score: 85,
      disposition: 'interested',
      sub_disposition: 'wants_demo',
      next_call_date: '2024-02-28T14:00:00Z',
      last_activity_date: '2024-02-26T16:30:00Z'
    },
    {
      id: 'lead-002',
      company_name: 'TechStart Inc',
      contact_name: 'Sarah Johnson',
      contact_email: 'sarah.j@techstart.com',
      contact_phone: '+1 555-0456',
      status: 'new',
      stage: 'prospecting',
      owner_id: 'mock-user-agent1-001',
      created_at: '2024-02-20T14:30:00Z',
      estimated_deal_value: 35000,
      source: 'cold_call',
      lead_score: 62,
      disposition: 'callback_requested',
      sub_disposition: null,
      next_call_date: '2024-02-27T10:00:00Z',
      last_activity_date: '2024-02-25T11:00:00Z'
    },
    {
      id: 'lead-003',
      company_name: 'Global Solutions Ltd',
      contact_name: 'Michael Chen',
      contact_email: 'mchen@globalsolutions.com',
      contact_phone: '+1 555-0789',
      status: 'meeting_scheduled',
      stage: 'proposal',
      owner_id: 'mock-user-agent2-001',
      created_at: '2024-02-18T09:15:00Z',
      estimated_deal_value: 75000,
      source: 'referral',
      lead_score: 92,
      disposition: 'interested',
      sub_disposition: 'hot_lead',
      next_call_date: '2024-03-01T15:00:00Z',
      last_activity_date: '2024-02-27T09:00:00Z'
    },
    {
      id: 'lead-004',
      company_name: 'Innovation Labs',
      contact_name: 'Emily Rodriguez',
      contact_email: 'emily.r@innovationlabs.io',
      contact_phone: '+1 555-0321',
      status: 'contacted',
      stage: 'qualification',
      owner_id: 'mock-user-agent1-001',
      created_at: '2024-02-22T11:00:00Z',
      estimated_deal_value: 42000,
      source: 'event',
      lead_score: 73,
      disposition: 'voicemail',
      sub_disposition: null,
      next_call_date: null,
      last_activity_date: '2024-02-26T14:20:00Z'
    },
    {
      id: 'lead-005',
      company_name: 'Future Systems',
      contact_name: 'David Park',
      contact_email: 'dpark@futuresys.com',
      contact_phone: '+1 555-0654',
      status: 'proposal_sent',
      stage: 'negotiation',
      owner_id: 'mock-user-agent2-001',
      created_at: '2024-02-12T08:30:00Z',
      estimated_deal_value: 120000,
      source: 'social_media',
      lead_score: 88,
      disposition: 'interested',
      sub_disposition: 'reviewing_proposal',
      next_call_date: '2024-02-29T10:00:00Z',
      last_activity_date: '2024-02-26T17:45:00Z'
    }
  ],

  companies: [
    {
      id: 'company-001',
      name: 'EffySales Demo Company',
      domain: 'effysalespro.com',
      created_at: '2024-01-01T00:00:00Z',
      subscription_status: 'active'
    }
  ],

  roleplay_sessions: [
    {
      id: 'session-001',
      user_id: 'mock-user-agent1-001',
      scenario_type: 'cold_call',
      title: 'Cold Call Practice Session',
      status: 'completed',
      score: 85,
      created_at: '2024-02-22T10:00:00Z',
      completed_at: '2024-02-22T10:08:00Z',
      duration: 480,
      bot_name: 'Sarah - Gatekeeper',
      scenario_name: 'Cold Outreach to Tech Company'
    },
    {
      id: 'session-002',
      user_id: 'mock-user-agent1-001',
      scenario_type: 'objection_handling',
      title: 'Price Objection Handling',
      status: 'completed',
      score: 78,
      created_at: '2024-02-23T14:30:00Z',
      completed_at: '2024-02-23T14:36:00Z',
      duration: 360,
      bot_name: 'David - Budget-Conscious CFO',
      scenario_name: 'Handling Price Concerns'
    },
    {
      id: 'session-003',
      user_id: 'mock-user-agent2-001',
      scenario_type: 'discovery',
      title: 'Discovery Call Practice',
      status: 'completed',
      score: 91,
      created_at: '2024-02-24T09:00:00Z',
      completed_at: '2024-02-24T09:10:00Z',
      duration: 600,
      bot_name: 'Lisa - VP of Sales',
      scenario_name: 'Needs Assessment Discovery'
    }
  ],

  documents: [
    {
      id: 'doc-001',
      title: 'Q1 Sales Proposal - Acme Corp',
      document_name: 'Q1 Sales Proposal - Acme Corp',
      type: 'proposal',
      owner_id: 'mock-user-agent1-001',
      created_at: '2024-02-15T11:00:00Z',
      updated_at: '2024-02-26T14:00:00Z',
      status: 'draft',
      lead_id: 'lead-001',
      view_count: 12,
      unique_viewers: 3
    },
    {
      id: 'doc-002',
      title: 'Product Overview 2024',
      document_name: 'Product Overview 2024',
      type: 'presentation',
      owner_id: 'mock-user-manager-001',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-02-20T10:00:00Z',
      status: 'published',
      lead_id: null,
      view_count: 45,
      unique_viewers: 15
    },
    {
      id: 'doc-003',
      title: 'Enterprise Solution Pricing',
      document_name: 'Enterprise Solution Pricing',
      type: 'pricing',
      owner_id: 'mock-user-agent2-001',
      created_at: '2024-02-18T13:00:00Z',
      updated_at: '2024-02-25T16:00:00Z',
      status: 'published',
      lead_id: 'lead-003',
      view_count: 8,
      unique_viewers: 2
    }
  ],

  coaching_tasks: [
    {
      id: 'task-001',
      task_title: 'Cold Call Practice Session',
      title: 'Cold Call Practice Session',
      description: 'Practice cold calling scenarios with focus on opening statements',
      scenario: 'Practice making cold calls to prospects. Focus on creating a strong opening hook and qualifying the lead.',
      assigned_to: 'mock-user-agent1-001',
      assigned_by: 'mock-user-manager-001',
      due_date: '2024-03-01T00:00:00Z',
      status: 'active',
      task_type: 'audio',
      submission_type: 'audio',
      duration_seconds: 180,
      created_at: '2024-02-20T10:00:00Z',
      created_date: '2024-02-20T10:00:00Z',
      target_count: 3,
      completed_count: 1
    },
    {
      id: 'task-002',
      task_title: 'Product Demo Recording',
      title: 'Product Demo Recording',
      description: 'Record a complete product demonstration',
      scenario: 'Deliver a compelling product demo highlighting key features and benefits. Practice handling technical questions.',
      assigned_to: 'mock-user-agent2-001',
      assigned_by: 'mock-user-manager-001',
      due_date: '2024-03-05T00:00:00Z',
      status: 'active',
      task_type: 'video',
      submission_type: 'video',
      duration_seconds: 300,
      created_at: '2024-02-21T10:00:00Z',
      created_date: '2024-02-21T10:00:00Z',
      target_count: 1,
      completed_count: 0
    },
    {
      id: 'task-003',
      task_title: 'Objection Handling Practice',
      title: 'Objection Handling Practice',
      description: 'Practice handling common objections',
      scenario: 'Handle price objections and concerns about implementation timeline. Stay confident and focus on value.',
      assigned_to: 'mock-user-agent1-001',
      assigned_by: 'mock-user-manager-001',
      due_date: '2024-02-25T00:00:00Z',
      status: 'archived',
      task_type: 'audio',
      submission_type: 'audio',
      duration_seconds: 240,
      created_at: '2024-02-10T10:00:00Z',
      created_date: '2024-02-10T10:00:00Z',
      target_count: 2,
      completed_count: 2
    },
    {
      id: 'task-004',
      task_title: 'Discovery Call Template',
      title: 'Discovery Call Template',
      description: 'Draft discovery call template',
      scenario: 'Create a discovery call framework focusing on understanding customer pain points and business objectives.',
      assigned_to: 'mock-user-agent2-001',
      assigned_by: 'mock-user-manager-001',
      due_date: '2024-03-10T00:00:00Z',
      status: 'draft',
      task_type: 'screen_recording',
      submission_type: 'screen_recording',
      duration_seconds: 420,
      created_at: '2024-02-25T10:00:00Z',
      created_date: '2024-02-25T10:00:00Z',
      target_count: 1,
      completed_count: 0
    }
  ],

  digital_sales_rooms: [
    {
      id: 'room-001',
      room_name: 'Acme Corp Sales Room',
      company_name: 'Acme Corporation',
      lead_id: 'lead-001',
      owner_id: 'mock-user-agent1-001',
      status: 'active',
      created_date: '2024-02-15T12:00:00Z',
      updated_date: '2024-02-27T10:00:00Z',
      participants: [
        { name: 'John Smith', email: 'john.smith@acme.com', avatar_url: null },
        { name: 'Jane Doe', email: 'jane.doe@acme.com', avatar_url: null }
      ],
      analytics: {
        predicted_intent_percent: 78
      }
    },
    {
      id: 'room-002',
      room_name: 'TechStart Partnership',
      company_name: 'TechStart Inc',
      lead_id: 'lead-002',
      owner_id: 'mock-user-agent1-001',
      status: 'active',
      created_date: '2024-02-20T14:00:00Z',
      updated_date: '2024-02-26T16:00:00Z',
      participants: [
        { name: 'Sarah Johnson', email: 'sarah.j@techstart.com', avatar_url: null }
      ],
      analytics: {
        predicted_intent_percent: 65
      }
    },
    {
      id: 'room-003',
      room_name: 'Global Solutions Deal',
      company_name: 'Global Solutions Ltd',
      lead_id: 'lead-003',
      owner_id: 'mock-user-agent2-001',
      status: 'archived',
      created_date: '2024-02-10T09:00:00Z',
      updated_date: '2024-02-25T11:00:00Z',
      participants: [
        { name: 'Michael Chen', email: 'mchen@globalsolutions.com', avatar_url: null },
        { name: 'Lisa Wang', email: 'lwang@globalsolutions.com', avatar_url: null },
        { name: 'Tom Brown', email: 'tbrown@globalsolutions.com', avatar_url: null }
      ],
      analytics: {
        predicted_intent_percent: 92
      }
    }
  ],

  call_records: [
    {
      id: 'call-001',
      lead_id: 'lead-001',
      user_id: 'mock-user-agent1-001',
      direction: 'outbound',
      duration: 420,
      status: 'completed',
      created_at: '2024-02-21T15:30:00Z',
      notes: 'Great conversation, customer interested in enterprise plan'
    },
    {
      id: 'call-002',
      lead_id: 'lead-002',
      user_id: 'mock-user-agent1-001',
      direction: 'outbound',
      duration: 180,
      status: 'completed',
      created_at: '2024-02-22T10:15:00Z',
      notes: 'Left voicemail, will follow up tomorrow'
    }
  ],

  meetings: [
    {
      id: 'meeting-001',
      title: 'Demo Call - Acme Corp',
      lead_id: 'lead-001',
      user_id: 'mock-user-agent1-001',
      scheduled_at: '2024-02-28T14:00:00Z',
      duration: 60,
      status: 'scheduled',
      created_at: '2024-02-21T16:00:00Z'
    }
  ],

  products: [
    {
      id: 'product-001',
      company_id: 'company-001',
      name: 'EffySales Pro Basic',
      description: 'Essential sales tools for small teams',
      price: 49,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'product-002',
      company_id: 'company-001',
      name: 'EffySales Pro Enterprise',
      description: 'Complete sales intelligence platform for large organizations',
      price: 199,
      created_at: '2024-01-01T00:00:00Z'
    }
  ],

  game_profiles: [
    {
      id: 'game-001',
      user_id: 'mock-user-agent1-001',
      level: 5,
      xp: 2450,
      coins: 1200,
      streak: 7,
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'game-002',
      user_id: 'mock-user-agent2-001',
      level: 4,
      xp: 1890,
      coins: 950,
      streak: 3,
      created_at: '2024-01-15T00:00:00Z'
    }
  ],

  achievements: [
    {
      id: 'achievement-001',
      name: 'First Call',
      description: 'Complete your first sales call',
      icon: 'phone',
      xp_reward: 100,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'achievement-002',
      name: 'Roleplay Master',
      description: 'Complete 10 roleplay sessions',
      icon: 'trophy',
      xp_reward: 500,
      created_at: '2024-01-01T00:00:00Z'
    }
  ],

  campaigns: [
    {
      id: 'campaign-001',
      name: 'Q1 Outbound Campaign',
      status: 'active',
      owner_id: 'mock-user-manager-001',
      created_at: '2024-02-01T00:00:00Z',
      target_leads: 100,
      completed_leads: 45
    }
  ],

  ai_insights: [],
  pitch_submissions: [],
  performance_reviews: [],
  task_submissions: [],
  user_groups: [],
  scorecards: [],
  scorecard_results: [],
  sales_methodologies: [],
  lead_activities: [],
  document_views: [],
  document_templates: [],
  rfp_requests: [],
  dialer_integrations: [],
  call_analysis_templates: [],
  sales_knowledge_base: [],
  sales_room_messages: [],
  sales_room_engagements: [],
  email_compositions: [],
  email_templates: [],
  email_connections: [],
  inbound_emails: [],
  module_access: [],
  document_annotations: [],
  company_users: [],
  subscriptions: [],
  payments: [],
  plan_features: [],
  competitors: [],
  document_versions: [],
  document_collaborators: [],
  document_activities: [],
  document_comments: [],
  document_approvals: [],
  shared_pitches: [],
  shared_questions: [],
  shared_objections: [],
  ai_agent_subscriptions: [],
  ai_agent_activities: [],
  roleplay_bots: [
    {
      id: 'bot-001',
      company_id: 'company-001',
      bot_name: 'Sarah - Gatekeeper',
      persona_name: 'Sarah Johnson',
      name: 'Sarah - Gatekeeper',
      role: 'Executive Assistant',
      difficulty_level: 'medium',
      scenario_type: 'cold_call',
      description: 'Protective gatekeeper who needs to be convinced before passing you through to the decision maker',
      personality_traits: 'Professional, cautious, protective of boss\'s time',
      created_at: '2024-01-15T00:00:00Z',
      is_active: true
    },
    {
      id: 'bot-002',
      company_id: 'company-001',
      bot_name: 'David - Budget-Conscious CFO',
      persona_name: 'David Miller',
      name: 'David - Budget-Conscious CFO',
      role: 'Chief Financial Officer',
      difficulty_level: 'hard',
      scenario_type: 'objection_handling',
      description: 'Cost-focused executive who challenges every expense',
      personality_traits: 'Analytical, skeptical, focused on ROI',
      created_at: '2024-01-15T00:00:00Z',
      is_active: true
    },
    {
      id: 'bot-003',
      company_id: 'company-001',
      bot_name: 'Lisa - VP of Sales',
      persona_name: 'Lisa Chen',
      name: 'Lisa - VP of Sales',
      role: 'VP of Sales',
      difficulty_level: 'easy',
      scenario_type: 'discovery',
      description: 'Friendly prospect who is genuinely interested in solutions',
      personality_traits: 'Open, collaborative, solution-oriented',
      created_at: '2024-01-15T00:00:00Z',
      is_active: true
    }
  ],
  user_achievements: [],
  challenges: [],
  challenge_participations: [],
  leaderboards: [],
  game_notifications: [],
  game_actions: [],
  kpi_definitions: [],
  calendar_connections: [],
  community_profiles: [],
  multi_party_scenarios: [],
  multi_party_sessions: [],
  deals: [],
  analysis_frameworks: [],
  analysis_configurations: [],
  session_analysis_results: [],

  ai_clients: [
    {
      id: 'ai-client-001',
      first_name: 'Mike',
      last_name: 'Thompson',
      company_name: 'Global Manufacturing Corp',
      title: 'Operations Director',
      personality: 'Analytical',
      industry: 'Manufacturing',
      roleplay_type: 'Discovery Call',
      voice: 'english_male',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'ai-client-002',
      first_name: 'Rachel',
      last_name: 'Foster',
      company_name: 'HealthPlus Medical Group',
      title: 'Head of Procurement',
      personality: 'Friendly',
      industry: 'Healthcare',
      roleplay_type: 'Cold Call',
      voice: 'english_female',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-16T10:00:00Z'
    },
    {
      id: 'ai-client-003',
      first_name: 'Priya',
      last_name: 'Sharma',
      company_name: 'BengaluruTech Solutions',
      title: 'VP of Technology',
      personality: 'Professional',
      industry: 'Technology',
      roleplay_type: 'Demo',
      voice: 'indian_female',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-17T10:00:00Z'
    },
    {
      id: 'ai-client-004',
      first_name: 'Raj',
      last_name: 'Patel',
      company_name: 'Mumbai Financial Systems',
      title: 'Enterprise Sales Director',
      personality: 'Results-Focused',
      industry: 'Financial Services',
      roleplay_type: 'Discovery Call',
      voice: 'indian_male',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-18T10:00:00Z'
    },
    {
      id: 'ai-client-005',
      first_name: 'Amara',
      last_name: 'Okonkwo',
      company_name: 'Lagos Commerce Hub',
      title: 'CEO',
      personality: 'Strategic',
      industry: 'E-commerce',
      roleplay_type: 'Cold Call',
      voice: 'african_female',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-19T10:00:00Z'
    },
    {
      id: 'ai-client-006',
      first_name: 'Kwame',
      last_name: 'Mensah',
      company_name: 'Accra Mining Corporation',
      title: 'Operations Director',
      personality: 'Cautious',
      industry: 'Mining & Resources',
      roleplay_type: 'Discovery Call',
      voice: 'african_male',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-20T10:00:00Z'
    },
    {
      id: 'ai-client-007',
      first_name: 'Thabo',
      last_name: 'Ndlovu',
      company_name: 'Johannesburg Retail Group',
      title: 'CFO',
      personality: 'Detail-Oriented',
      industry: 'Retail',
      roleplay_type: 'Follow-up',
      voice: 'african_male',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-21T10:00:00Z'
    },
    {
      id: 'ai-client-008',
      first_name: 'Fatima',
      last_name: 'Al-Hassan',
      company_name: 'Dubai Investment Group',
      title: 'Executive Director',
      personality: 'Professional',
      industry: 'Investment & Finance',
      roleplay_type: 'Demo',
      voice: 'arabic_female',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-22T10:00:00Z'
    },
    {
      id: 'ai-client-009',
      first_name: 'Omar',
      last_name: 'Khalil',
      company_name: 'Cairo Medical Center',
      title: 'IT Manager',
      personality: 'Technical',
      industry: 'Healthcare',
      roleplay_type: 'Discovery Call',
      voice: 'arabic_male',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-23T10:00:00Z'
    },
    {
      id: 'ai-client-010',
      first_name: 'Zainab',
      last_name: 'Ahmed',
      company_name: 'Riyadh Logistics Corporation',
      title: 'Head of Procurement',
      personality: 'Analytical',
      industry: 'Logistics & Supply Chain',
      roleplay_type: 'Cold Call',
      voice: 'arabic_female',
      language: 'English',
      visibility: 'all_users',
      is_active: true,
      created_at: '2024-01-24T10:00:00Z'
    }
  ],

  connectors: [
    {
      id: 'connector-001',
      name: 'salesforce',
      display_name: 'Salesforce',
      description: 'Connect to Salesforce CRM for leads, contacts, opportunities, and accounts management',
      type: 'crm',
      auth_type: 'oauth2',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://developer.salesforce.com/docs/apis'
    },
    {
      id: 'connector-002',
      name: 'hubspot',
      display_name: 'HubSpot',
      description: 'Connect to HubSpot CRM for contacts, deals, companies, and marketing automation',
      type: 'crm',
      auth_type: 'oauth2',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://developers.hubspot.com/docs/api/overview'
    },
    {
      id: 'connector-003',
      name: 'zoho_crm',
      display_name: 'Zoho CRM',
      description: 'Connect to Zoho CRM for leads, contacts, deals, and accounts management',
      type: 'crm',
      auth_type: 'oauth2',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://www.zoho.com/crm/developer/docs/api/v3/'
    },
    {
      id: 'connector-004',
      name: 'microsoft_dynamics',
      display_name: 'Microsoft Dynamics 365',
      description: 'Connect to Microsoft Dynamics 365 CRM for comprehensive business management',
      type: 'crm',
      auth_type: 'oauth2',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://learn.microsoft.com/en-us/dynamics365/'
    },
    {
      id: 'connector-005',
      name: 'moodle',
      display_name: 'Moodle',
      description: 'Connect to Moodle LMS for course and user management',
      type: 'lms',
      auth_type: 'api_key',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://docs.moodle.org/dev/Web_services'
    },
    {
      id: 'connector-006',
      name: 'talentlms',
      display_name: 'TalentLMS',
      description: 'Connect to TalentLMS for training and course management',
      type: 'lms',
      auth_type: 'api_key',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://www.talentlms.com/pages/docs/'
    },
    {
      id: 'connector-007',
      name: 'learnworlds',
      display_name: 'LearnWorlds',
      description: 'Connect to LearnWorlds for online course creation and management',
      type: 'lms',
      auth_type: 'api_key',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://www.learnworlds.com/help/article/learnworlds-api/'
    },
    {
      id: 'connector-008',
      name: 'google_classroom',
      display_name: 'Google Classroom',
      description: 'Connect to Google Classroom for educational course management',
      type: 'lms',
      auth_type: 'oauth2',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://developers.google.com/classroom'
    },
    {
      id: 'connector-009',
      name: 'google',
      display_name: 'Google',
      description: 'Connect to Google services (Gmail, Calendar, Drive, etc.)',
      type: 'auth',
      auth_type: 'oauth2',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://developers.google.com/identity/protocols/oauth2'
    },
    {
      id: 'connector-010',
      name: 'microsoft',
      display_name: 'Microsoft',
      description: 'Connect to Microsoft services (Outlook, Teams, OneDrive, etc.)',
      type: 'auth',
      auth_type: 'oauth2',
      status: 'active',
      logo_url: null,
      documentation_url: 'https://learn.microsoft.com/en-us/graph/overview'
    }
  ],

  connected_accounts: [],

  integration_flows: []
};
