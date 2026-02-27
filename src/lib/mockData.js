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
  session_analysis_results: []
};
