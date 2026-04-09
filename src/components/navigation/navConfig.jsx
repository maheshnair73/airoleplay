import {
    LayoutDashboard,
    Users,
    Settings,
    BarChart3,
    Bot,
    Building,
    Globe,
    GraduationCap,
    HardDrive,
    Mic,
    Video,
    Package,
    Shield,
    Trophy,
    Award,
    Target,
    Target as ChallengeIcon,
    UserCog,
    Radio,
    FileText,
    History,
    MonitorUp,
    CheckSquare,
    Database,
    Zap,
    BookOpen,
    Brain,
    TrendingUp,
    Dumbbell,
    ClipboardList,
    PhoneCall
} from 'lucide-react';

export const navSections = [
    {
        title: 'Manage Leads',
        items: [
            { page: 'Dashboard', title: 'Dashboard', icon: LayoutDashboard, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'effyLeads', title: 'effyLeads', icon: Users, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] }
        ]
    },
    {
        title: 'Sales Execution',
        items: [
            { page: 'DigitalSalesRooms', title: 'Digital Sales Rooms', icon: Building, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'EffyDocProposals', title: 'effyDoc (Proposals)', icon: FileText, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] }
        ]
    },
    {
        title: 'Practice & Coaching',
        items: [
            { page: 'PracticeHub', title: 'My Practice Sessions', icon: Target, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'CreatePracticeSession', title: 'New Practice Session', icon: Dumbbell, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            {
                page: 'AIRoleplay',
                title: 'AI Roleplay',
                icon: Mic,
                roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'],
                submenu: [
                    { page: 'AIRoleplay', title: 'Single AI Prospect', icon: Mic, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
                    { page: 'MultiPartyRoleplay', title: 'Multi-Stakeholder', icon: Users, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
                    { page: 'HumanRoleplay', title: 'Human-to-Human', icon: Video, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
                    { page: 'ProductDemoSetup', title: 'Product Demo', icon: MonitorUp, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] }
                ]
            },
            { page: 'CoachingHub', title: 'Coaching Tasks', icon: ClipboardList, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'PracticeAnalytics', title: 'Practice Analytics', icon: BarChart3, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
        ]
    },
    {
        title: 'Call Intelligence',
        items: [
            { page: 'LiveMeetings', title: 'Meeting Assistant', icon: Video, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'CallInsights', title: 'Call Recordings', icon: HardDrive, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            {
                page: 'AIRoleplayHistory',
                title: 'Performance Reports',
                icon: BarChart3,
                roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'],
                submenu: [
                    { page: 'AIRoleplayHistory', title: 'Roleplay History', icon: History, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
                    { page: 'AIRoleplayAnalysisDetailed', title: 'Roleplay Analytics', icon: BarChart3, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] }
                ]
            }
        ]
    },
    {
        title: 'Knowledge Hub',
        items: [
            { page: 'RoleplayKnowledgeHub', title: 'Practice Materials', icon: Brain, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'ProductManagement', title: 'My Products', icon: Package, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'CompetitorManagement', title: 'Competitor Intel', icon: Shield, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'ProductKnowledgeReview', title: 'Knowledge Review Queue', icon: CheckSquare, roles: ['admin', 'saas_admin', 'company_admin', 'sales_manager'] },
        ]
    },
    {
        title: 'Training & Certification',
        items: [
            { page: 'TrainingLibrary', title: 'Training Library', icon: BookOpen, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'AgentTrainingProfile', title: 'My Training Profile', icon: Brain, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'CertifyHub', title: 'Certify Hub', icon: Award, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'CreateCertification', title: 'Create Certification', icon: Award, roles: ['admin', 'saas_admin', 'company_admin', 'sales_manager'] },
            { page: 'TrainingROIAnalytics', title: 'Training ROI Analytics', icon: TrendingUp, roles: ['admin', 'saas_admin', 'company_admin', 'sales_manager'] },
        ]
    },
    {
        title: 'Gamification & Rewards',
        items: [
            { page: 'Leaderboard', title: 'Leaderboard', icon: Trophy, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'GamificationAdmin', title: 'Gamification Hub', icon: Trophy, roles: ['admin', 'saas_admin', 'company_admin', 'sales_manager'] },
            { page: 'AchievementManagement', title: 'Manage Achievements', icon: Award, roles: ['admin', 'saas_admin', 'company_admin'] },
            { page: 'ChallengeManagement', title: 'Manage Challenges', icon: ChallengeIcon, roles: ['admin', 'saas_admin', 'company_admin'] },
        ]
    },
    {
        title: 'KPIs & Analytics',
        items: [
            { page: 'KPIDashboard', title: 'My KPIs', icon: BarChart3, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
            { page: 'KPIManagement', title: 'Manage KPIs', icon: Settings, roles: ['admin', 'saas_admin', 'company_admin', 'sales_manager'] },
        ]
    },
    {
        items: [
             { page: 'AIAssistant', title: 'Chat with Effy', icon: Bot, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'sales_manager'] },
        ]
    }
];

export const adminNavConfig = [
    { page: 'Users', title: 'User Management', icon: Users },
    { page: 'ModuleManagement', title: 'Module Management', icon: HardDrive },
    { page: 'DialerSettings', title: 'Dialer Settings', icon: Settings },
    { page: 'AISalesAgentSettings', title: 'AI Agent Settings', icon: UserCog },
    { page: 'IntegrationManagement', title: 'Integration Management', icon: Zap },
    { page: 'IntegrationPlatform', title: 'Integration Platform', icon: Zap, path: '/integrations/platform' },
    { page: 'DatabaseSchema', title: 'Database Schema', icon: Database },
    { page: 'SystemDocumentation', title: 'Documentation', icon: BookOpen },
];

export const effyAíCallsNavConfig = [
    { page: 'AIDialerSettings', title: 'AI Call Campaigns', icon: Radio },
    { page: 'CallAnalytics', title: 'AI Call Analytics', icon: BarChart3 },
];

export const superAdminNavConfig = [
    { page: 'CompanyManagement', title: 'Manage Companies', icon: Building },
    { page: 'GlobalAnalytics', title: 'Global Analytics', icon: BarChart3 },
    { page: 'WebsiteHome', title: 'Edit Website', icon: Globe },
    { page: 'SuperAdminAIAgent', title: 'Platform AI Settings', icon: Bot }
];
