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
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'mock-user-agent2-001',
      email: 'agent2@effysalespro.com',
      role: 'sales_agent',
      full_name: 'Agent Two',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],

  user_profiles: [
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
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'mock-user-agent2-001',
      email: 'agent2@effysalespro.com',
      role: 'sales_agent',
      full_name: 'Agent Two',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],

  leads: [
    {
      id: 'lead-001',
      company_name: 'Acme Corporation',
      contact_name: 'John Smith',
      email: 'john.smith@acme.com',
      phone: '+1 555-0123',
      status: 'qualified',
      stage: 'discovery',
      owner_id: 'mock-user-agent1-001',
      created_at: '2024-02-15T10:00:00Z',
      value: 50000
    },
    {
      id: 'lead-002',
      company_name: 'TechStart Inc',
      contact_name: 'Sarah Johnson',
      email: 'sarah.j@techstart.com',
      phone: '+1 555-0456',
      status: 'new',
      stage: 'prospecting',
      owner_id: 'mock-user-agent1-001',
      created_at: '2024-02-20T14:30:00Z',
      value: 35000
    },
    {
      id: 'lead-003',
      company_name: 'Global Solutions Ltd',
      contact_name: 'Michael Chen',
      email: 'mchen@globalsolutions.com',
      phone: '+1 555-0789',
      status: 'qualified',
      stage: 'proposal',
      owner_id: 'mock-user-agent2-001',
      created_at: '2024-02-18T09:15:00Z',
      value: 75000
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
      duration: 480
    },
    {
      id: 'session-002',
      user_id: 'mock-user-agent1-001',
      scenario_type: 'objection_handling',
      title: 'Price Objection Handling',
      status: 'completed',
      score: 78,
      created_at: '2024-02-23T14:30:00Z',
      duration: 360
    }
  ],

  documents: [
    {
      id: 'doc-001',
      title: 'Q1 Sales Proposal - Acme Corp',
      type: 'proposal',
      owner_id: 'mock-user-agent1-001',
      created_at: '2024-02-15T11:00:00Z',
      status: 'draft'
    },
    {
      id: 'doc-002',
      title: 'Product Overview 2024',
      type: 'presentation',
      owner_id: 'mock-user-manager-001',
      created_at: '2024-01-10T09:00:00Z',
      status: 'published'
    }
  ],

  coaching_tasks: [
    {
      id: 'task-001',
      title: 'Complete 3 Cold Call Roleplays',
      description: 'Practice cold calling scenarios with focus on opening statements',
      assigned_to: 'mock-user-agent1-001',
      assigned_by: 'mock-user-manager-001',
      due_date: '2024-03-01T00:00:00Z',
      status: 'in_progress',
      created_at: '2024-02-20T10:00:00Z'
    }
  ],

  digital_sales_rooms: [
    {
      id: 'room-001',
      name: 'Acme Corp Sales Room',
      lead_id: 'lead-001',
      owner_id: 'mock-user-agent1-001',
      status: 'active',
      created_at: '2024-02-15T12:00:00Z'
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
      name: 'EffySales Pro Basic',
      description: 'Essential sales tools for small teams',
      price: 49,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'product-002',
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
  roleplay_bots: [],
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
