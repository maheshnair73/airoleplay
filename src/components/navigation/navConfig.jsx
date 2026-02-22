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
    Target as ChallengeIcon,
    UserCog,
    Radio,
    FileText
} from 'lucide-react';

export const navSections = [
    {
        title: 'Manage Leads',
        items: [
            { page: 'Dashboard', title: 'Dashboard', icon: LayoutDashboard, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'super_admin'] },
            { page: 'effyLeads', title: 'effyLeads', icon: Users, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'super_admin'] }
        ]
    },
    {
        title: 'Sales Execution',
        items: [
            { page: 'DigitalSalesRooms', title: 'Digital Sales Rooms', icon: Building, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'super_admin'] },
            { page: 'EffyDocProposals', title: 'effyDoc (Proposals)', icon: FileText, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'super_admin'] }
        ]
    },
    {
        title: 'AI Sales Coach',
        items: [
            { page: 'AIRoleplay', title: 'AI Roleplay', icon: Mic, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'super_admin'] },
            { page: 'CoachingHub', title: 'Coaching Hub', icon: GraduationCap, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'super_admin'] },
            { page: 'LiveMeetings', title: 'effyMeeting Assistant', icon: Video, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'super_admin'] },
            { page: 'CallInsights', title: 'Call Recordings', icon: HardDrive, roles: ['user', 'admin', 'saas_admin', 'super_admin', 'sales_agent', 'company_admin', 'super_admin'] },
        ]
    },
    {
        title: 'Knowledge Hub',
        items: [
            { page: 'ProductManagement', title: 'My Products', icon: Package },
            { page: 'CompetitorManagement', title: 'Competitor Intel', icon: Shield },
        ]
    },
    {
        title: 'Gamification & Rewards',
        items: [
            { page: 'Leaderboard', title: 'Leaderboard', icon: Trophy },
            { page: 'GamificationAdmin', title: 'Gamification Hub', icon: Trophy, roles: ['admin', 'saas_admin'] },
            { page: 'AchievementManagement', title: 'Manage Achievements', icon: Award, roles: ['admin', 'saas_admin'] },
            { page: 'ChallengeManagement', title: 'Manage Challenges', icon: ChallengeIcon, roles: ['admin', 'saas_admin'] },
        ]
    },
    {
        title: 'KPIs & Analytics',
        items: [
            { page: 'KPIDashboard', title: 'My KPIs', icon: BarChart3 },
            { page: 'KPIManagement', title: 'Manage KPIs', icon: Settings, roles: ['admin', 'saas_admin'] },
        ]
    },
    {
        items: [
             { page: 'AIAssistant', title: 'Chat with Effy', icon: Bot },
        ]
    }
];

export const adminNavConfig = [
    { page: 'Users', title: 'User Management', icon: Users },
    { page: 'ModuleManagement', title: 'Module Management', icon: HardDrive },
    { page: 'DialerSettings', title: 'Dialer Settings', icon: Settings },
    { page: 'AISalesAgentSettings', title: 'AI Agent Settings', icon: UserCog },
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