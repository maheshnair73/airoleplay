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
    PhoneCall,
    Sparkles,
    Upload,
    Gauge,
    PieChart,
    UserCheck,
    LineChart,
    Key
} from 'lucide-react';

const ALL_ROLES = ['sales_agent', 'sales_manager', 'company_admin', 'admin', 'saas_admin', 'super_admin'];
const MANAGER_UP = ['sales_manager', 'company_admin', 'admin', 'saas_admin', 'super_admin'];
const ADMIN_UP = ['company_admin', 'admin', 'saas_admin', 'super_admin'];
const PLATFORM_ADMIN = ['saas_admin', 'super_admin'];

export const aiRoleplayStudioNav = [
    {
        title: 'AI Roleplay Studio',
        items: [
            {
                page: 'LetsPractice', title: 'Lets Practice', icon: Mic, roles: ALL_ROLES,
                submenu: [
                    { page: 'LetsPractice', title: 'Practice Hub', icon: Mic, roles: ALL_ROLES },
                    { page: 'AIRoleplay', title: 'Single AI Prospect', icon: Mic, roles: ALL_ROLES },
                    { page: 'MultiPartyRoleplay', title: 'Multi-Stakeholder', icon: Users, roles: ALL_ROLES },
                    { page: 'HumanRoleplay', title: 'Human-to-Human', icon: Video, roles: ALL_ROLES },
                    { page: 'ProductDemoSetup', title: 'Product Demo', icon: MonitorUp, roles: ALL_ROLES }
                ]
            },
            {
                page: 'AIRoleplayContentLibrary', title: 'My Materials', icon: FileText, roles: ALL_ROLES,
                submenu: [
                    { page: 'AIRoleplayContentLibrary', title: 'My Materials', icon: FileText, roles: ALL_ROLES },
                    { page: 'AIRoleplayContentUpload', title: 'Upload Materials', icon: Upload, roles: ALL_ROLES }
                ]
            },
            { page: 'AIRoleplayHistory', title: 'Session History', icon: History, roles: ALL_ROLES },
            { page: 'AIRoleplayAnalysisDetailed', title: 'Analytics', icon: BarChart3, roles: ALL_ROLES }
        ]
    }
];

export const navSections = [
    {
        title: 'Overview',
        items: [
            { page: 'Dashboard', title: 'Dashboard', icon: LayoutDashboard, roles: ALL_ROLES },
        ]
    },
    {
        title: 'My Pipeline',
        items: [
            { page: 'effyLeads', title: 'My Leads', icon: Users, roles: ALL_ROLES },
            { page: 'DigitalSalesRooms', title: 'Sales Rooms', icon: Building, roles: ALL_ROLES },
            { page: 'EffyDocProposals', title: 'Proposals', icon: FileText, roles: ALL_ROLES },
        ]
    },
    {
        title: 'Practice & Coaching',
        items: [
            {
                page: 'AIRoleplay',
                title: 'AI Roleplay',
                icon: Mic,
                roles: ALL_ROLES,
                submenu: [
                    { page: 'AIRoleplay', title: 'Single AI Prospect', icon: Mic, roles: ALL_ROLES },
                    { page: 'MultiPartyRoleplay', title: 'Multi-Stakeholder', icon: Users, roles: ALL_ROLES },
                    { page: 'HumanRoleplay', title: 'Human-to-Human', icon: Video, roles: ALL_ROLES },
                    { page: 'ProductDemoSetup', title: 'Product Demo', icon: MonitorUp, roles: ALL_ROLES }
                ]
            },
            { page: 'SkillCoach', title: 'SkillCoach AI', icon: Sparkles, roles: ALL_ROLES },
            { page: 'CoachingHub', title: 'My Coaching Tasks', icon: ClipboardList, roles: ALL_ROLES },
            { page: 'RoleplayKnowledgeHub', title: 'Practice Materials', icon: Brain, roles: ALL_ROLES },
        ]
    },
    {
        title: 'Call Intelligence',
        items: [
            { page: 'LiveMeetings', title: 'Meeting Assistant', icon: Video, roles: ALL_ROLES },
            { page: 'CallInsights', title: 'Call Recordings', icon: HardDrive, roles: ALL_ROLES },
        ]
    },
    {
        title: 'Training & Growth',
        items: [
            { page: 'TrainingLibrary', title: 'Training Library', icon: BookOpen, roles: ALL_ROLES },
            { page: 'AgentTrainingProfile', title: 'My Training Profile', icon: Brain, roles: ALL_ROLES },
            { page: 'CertifyHub', title: 'Certifications', icon: Award, roles: ALL_ROLES },
            { page: 'KPIDashboard', title: 'My KPIs', icon: BarChart3, roles: ALL_ROLES },
            { page: 'Leaderboard', title: 'Leaderboard', icon: Trophy, roles: ALL_ROLES },
        ]
    },
    {
        title: 'Knowledge',
        items: [
            { page: 'ProductManagement', title: 'Products', icon: Package, roles: ALL_ROLES },
            { page: 'CompetitorManagement', title: 'Competitor Intel', icon: Shield, roles: ALL_ROLES },
        ]
    },

    {
        title: 'Team Management',
        items: [
            { page: 'PracticeAnalytics', title: 'Team Practice Analytics', icon: BarChart3, roles: MANAGER_UP },
            { page: 'AIRoleplayHistory', title: 'Team Roleplay History', icon: History, roles: MANAGER_UP },
            { page: 'AIRoleplayAnalysisDetailed', title: 'Roleplay Analytics', icon: LineChart, roles: MANAGER_UP },
            { page: 'CreateCoachingTask', title: 'Assign Coaching Tasks', icon: ClipboardList, roles: MANAGER_UP },
            { page: 'ProductKnowledgeReview', title: 'Knowledge Review Queue', icon: CheckSquare, roles: MANAGER_UP },
            { page: 'TrainingROIAnalytics', title: 'Training ROI', icon: TrendingUp, roles: MANAGER_UP },
            { page: 'GamificationAdmin', title: 'Gamification Hub', icon: Trophy, roles: MANAGER_UP },
            { page: 'KPIManagement', title: 'Manage KPIs', icon: Settings, roles: MANAGER_UP },
        ]
    },
    {
        title: 'Company Settings',
        items: [
            { page: 'CreateCertification', title: 'Create Certification', icon: Award, roles: ADMIN_UP },
            { page: 'AchievementManagement', title: 'Manage Achievements', icon: Award, roles: ADMIN_UP },
            { page: 'ChallengeManagement', title: 'Manage Challenges', icon: ChallengeIcon, roles: ADMIN_UP },
        ]
    },
    {
        items: [
            { page: 'AIAssistant', title: 'Chat with Effy', icon: Bot, roles: ALL_ROLES },
        ]
    }
];

export const adminNavConfig = [
    { page: 'UserManagement', title: 'User & Module Management', icon: Users },
    { page: 'ManageBotTemplates', title: 'Manage Bot Templates', icon: Bot },
    { page: 'ModuleCreation', title: 'Create Modules', icon: Dumbbell },
    { page: 'FrameworkSettings', title: 'Evaluation Frameworks', icon: Gauge },
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
    { page: 'UserManagement', title: 'Users & Modules', icon: Users },
    { page: 'GlobalAnalytics', title: 'Global Analytics', icon: BarChart3 },
    { page: 'WebsiteHome', title: 'Edit Website', icon: Globe },
    { page: 'SuperAdminAIAgent', title: 'Platform AI Settings', icon: Bot },
    { page: 'APIKeysManagement', title: 'API Keys', icon: Key }
];
