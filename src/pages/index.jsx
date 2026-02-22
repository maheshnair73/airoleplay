import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import AIAssistant from "./AIAssistant";

import Analytics from "./Analytics";

import DigitalSalesRooms from "./DigitalSalesRooms";

import SalesRoomPublic from "./SalesRoomPublic";

import Users from "./Users";

import CoachingHub from "./CoachingHub";

import SalesCoaching from "./SalesCoaching";

import TrainingCenter from "./TrainingCenter";

import CreateCoachingTask from "./CreateCoachingTask";

import TaskReview from "./TaskReview";

import UserPerformance from "./UserPerformance";

import Documents from "./Documents";

import CreateDocument from "./CreateDocument";

import DocumentAnalytics from "./DocumentAnalytics";

import RFPAssistant from "./RFPAssistant";

import CallAnalytics from "./CallAnalytics";

import SalesKnowledge from "./SalesKnowledge";

import DialerSettings from "./DialerSettings";

import CreateDigitalSalesRoom from "./CreateDigitalSalesRoom";

import AIRoleplay from "./AIRoleplay";

import CallAnalysis from "./CallAnalysis";

import Integrations from "./Integrations";

import BackendSetup from "./BackendSetup";

import EmailSettings from "./EmailSettings";

import SentEmails from "./SentEmails";

import VoiceAITest from "./VoiceAITest";

import VoiceAIDialer from "./VoiceAIDialer";

import Dialer from "./Dialer";

import ProfileSettings from "./ProfileSettings";

import EffyVoiceSetup from "./EffyVoiceSetup";

import IntegratedModules from "./IntegratedModules";

import CostMonitoring from "./CostMonitoring";

import AISalesSDR from "./AISalesSDR";

import AIAgentTraining from "./AIAgentTraining";

import ModuleManagement from "./ModuleManagement";

import AIRoleplayHistory from "./AIRoleplayHistory";

import AISalesAgentSettings from "./AISalesAgentSettings";

import EffyUseCases from "./EffyUseCases";

import CallInsights from "./CallInsights";

import AIRoleplayAnalysis from "./AIRoleplayAnalysis";

import DocumentPublicView from "./DocumentPublicView";

import ContentLibrary from "./ContentLibrary";

import SuperAdmin from "./SuperAdmin";

import CompanyManagement from "./CompanyManagement";

import GlobalAnalytics from "./GlobalAnalytics";

import CompanyDetails from "./CompanyDetails";

import APIDocumentation from "./APIDocumentation";

import APIKeysManagement from "./APIKeysManagement";

import SuperAdminPromotion from "./SuperAdminPromotion";

import TechnicalDocumentation from "./TechnicalDocumentation";

import AIAgentHub from "./AIAgentHub";

import AIDialerSettings from "./AIDialerSettings";

import ProductManagement from "./ProductManagement";

import CompetitorManagement from "./CompetitorManagement";

import Welcome from "./Welcome";

import LeadDetail from "./LeadDetail";

import CallPrep from "./CallPrep";

import PitchLibrary from "./PitchLibrary";

import AICallAnalytics from "./AICallAnalytics";

import SMSIntegrations from "./SMSIntegrations";

import WhatsAppIntegrations from "./WhatsAppIntegrations";

import SocialIntegrations from "./SocialIntegrations";

import TaskSubmission from "./TaskSubmission";

import HumanRoleplay from "./HumanRoleplay";

import RoleplaySession from "./RoleplaySession";

import RoleplaySessionPage from "./RoleplaySessionPage";

import CallPreparation from "./CallPreparation";

import ProductContribution from "./ProductContribution";

import effyLeads from "./effyLeads";

import CreatePitch from "./CreatePitch";

import SalesRoomAnalytics from "./SalesRoomAnalytics";

import SuperAdminAIAgent from "./SuperAdminAIAgent";

import AIAgentSettings from "./AIAgentSettings";

import RoleplaySessionHistory from "./RoleplaySessionHistory";

import PublicRoleplaySession from "./PublicRoleplaySession";

import WebsiteHome from "./WebsiteHome";

import WebsitePricing from "./WebsitePricing";

import WebsiteAbout from "./WebsiteAbout";

import WebsiteProducts from "./WebsiteProducts";

import WebsiteSolutions from "./WebsiteSolutions";

import AISalesRoleplay from "./AISalesRoleplay";

import CustomAIScorecards from "./CustomAIScorecards";

import DigitalSalesRoomsProduct from "./DigitalSalesRoomsProduct";

import EffyLeadsProspecting from "./EffyLeadsProspecting";

import EffyDocProposals from "./EffyDocProposals";

import UnifiedSalesAnalytics from "./UnifiedSalesAnalytics";

import CreateRoleplayBot from "./CreateRoleplayBot";

import BotPerformanceDetails from "./BotPerformanceDetails";

import AIRoleplayPractice from "./AIRoleplayPractice";

import BotOverview from "./BotOverview";

import GamificationAdmin from "./GamificationAdmin";

import AchievementManagement from "./AchievementManagement";

import ChallengeManagement from "./ChallengeManagement";

import Leaderboard from "./Leaderboard";

import KPIDashboard from "./KPIDashboard";

import KPIManagement from "./KPIManagement";

import CalendarSettings from "./CalendarSettings";

import BookDemo from "./BookDemo";

import ProductDetail from "./ProductDetail";

import CommunityLanding from "./CommunityLanding";

import CommunityOnboarding from "./CommunityOnboarding";

import Register from "./Register";

import LiveMeetings from "./LiveMeetings";

import EffyDocProposalsProduct from "./EffyDocProposalsProduct";

import MultiPartyRoleplay from "./MultiPartyRoleplay";

import CreateMultiPartyScenario from "./CreateMultiPartyScenario";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    AIAssistant: AIAssistant,
    
    Analytics: Analytics,
    
    DigitalSalesRooms: DigitalSalesRooms,
    
    SalesRoomPublic: SalesRoomPublic,
    
    Users: Users,
    
    CoachingHub: CoachingHub,
    
    SalesCoaching: SalesCoaching,
    
    TrainingCenter: TrainingCenter,
    
    CreateCoachingTask: CreateCoachingTask,
    
    TaskReview: TaskReview,
    
    UserPerformance: UserPerformance,
    
    Documents: Documents,
    
    CreateDocument: CreateDocument,
    
    DocumentAnalytics: DocumentAnalytics,
    
    RFPAssistant: RFPAssistant,
    
    CallAnalytics: CallAnalytics,
    
    SalesKnowledge: SalesKnowledge,
    
    DialerSettings: DialerSettings,
    
    CreateDigitalSalesRoom: CreateDigitalSalesRoom,
    
    AIRoleplay: AIRoleplay,
    
    CallAnalysis: CallAnalysis,
    
    Integrations: Integrations,
    
    BackendSetup: BackendSetup,
    
    EmailSettings: EmailSettings,
    
    SentEmails: SentEmails,
    
    VoiceAITest: VoiceAITest,
    
    VoiceAIDialer: VoiceAIDialer,
    
    Dialer: Dialer,
    
    ProfileSettings: ProfileSettings,
    
    EffyVoiceSetup: EffyVoiceSetup,
    
    IntegratedModules: IntegratedModules,
    
    CostMonitoring: CostMonitoring,
    
    AISalesSDR: AISalesSDR,
    
    AIAgentTraining: AIAgentTraining,
    
    ModuleManagement: ModuleManagement,
    
    AIRoleplayHistory: AIRoleplayHistory,
    
    AISalesAgentSettings: AISalesAgentSettings,
    
    EffyUseCases: EffyUseCases,
    
    CallInsights: CallInsights,
    
    AIRoleplayAnalysis: AIRoleplayAnalysis,
    
    DocumentPublicView: DocumentPublicView,
    
    ContentLibrary: ContentLibrary,
    
    SuperAdmin: SuperAdmin,
    
    CompanyManagement: CompanyManagement,
    
    GlobalAnalytics: GlobalAnalytics,
    
    CompanyDetails: CompanyDetails,
    
    APIDocumentation: APIDocumentation,
    
    APIKeysManagement: APIKeysManagement,
    
    SuperAdminPromotion: SuperAdminPromotion,
    
    TechnicalDocumentation: TechnicalDocumentation,
    
    AIAgentHub: AIAgentHub,
    
    AIDialerSettings: AIDialerSettings,
    
    ProductManagement: ProductManagement,
    
    CompetitorManagement: CompetitorManagement,
    
    Welcome: Welcome,
    
    LeadDetail: LeadDetail,
    
    CallPrep: CallPrep,
    
    PitchLibrary: PitchLibrary,
    
    AICallAnalytics: AICallAnalytics,
    
    SMSIntegrations: SMSIntegrations,
    
    WhatsAppIntegrations: WhatsAppIntegrations,
    
    SocialIntegrations: SocialIntegrations,
    
    TaskSubmission: TaskSubmission,
    
    HumanRoleplay: HumanRoleplay,
    
    RoleplaySession: RoleplaySession,
    
    RoleplaySessionPage: RoleplaySessionPage,
    
    CallPreparation: CallPreparation,
    
    ProductContribution: ProductContribution,
    
    effyLeads: effyLeads,
    
    CreatePitch: CreatePitch,
    
    SalesRoomAnalytics: SalesRoomAnalytics,
    
    SuperAdminAIAgent: SuperAdminAIAgent,
    
    AIAgentSettings: AIAgentSettings,
    
    RoleplaySessionHistory: RoleplaySessionHistory,
    
    PublicRoleplaySession: PublicRoleplaySession,
    
    WebsiteHome: WebsiteHome,
    
    WebsitePricing: WebsitePricing,
    
    WebsiteAbout: WebsiteAbout,
    
    WebsiteProducts: WebsiteProducts,
    
    WebsiteSolutions: WebsiteSolutions,
    
    AISalesRoleplay: AISalesRoleplay,
    
    CustomAIScorecards: CustomAIScorecards,
    
    DigitalSalesRoomsProduct: DigitalSalesRoomsProduct,
    
    EffyLeadsProspecting: EffyLeadsProspecting,
    
    EffyDocProposals: EffyDocProposals,
    
    UnifiedSalesAnalytics: UnifiedSalesAnalytics,
    
    CreateRoleplayBot: CreateRoleplayBot,
    
    BotPerformanceDetails: BotPerformanceDetails,
    
    AIRoleplayPractice: AIRoleplayPractice,
    
    BotOverview: BotOverview,
    
    GamificationAdmin: GamificationAdmin,
    
    AchievementManagement: AchievementManagement,
    
    ChallengeManagement: ChallengeManagement,
    
    Leaderboard: Leaderboard,
    
    KPIDashboard: KPIDashboard,
    
    KPIManagement: KPIManagement,
    
    CalendarSettings: CalendarSettings,
    
    BookDemo: BookDemo,
    
    ProductDetail: ProductDetail,
    
    CommunityLanding: CommunityLanding,
    
    CommunityOnboarding: CommunityOnboarding,
    
    Register: Register,
    
    LiveMeetings: LiveMeetings,
    
    EffyDocProposalsProduct: EffyDocProposalsProduct,
    
    MultiPartyRoleplay: MultiPartyRoleplay,
    
    CreateMultiPartyScenario: CreateMultiPartyScenario,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/DigitalSalesRooms" element={<DigitalSalesRooms />} />
                
                <Route path="/SalesRoomPublic" element={<SalesRoomPublic />} />
                
                <Route path="/Users" element={<Users />} />
                
                <Route path="/CoachingHub" element={<CoachingHub />} />
                
                <Route path="/SalesCoaching" element={<SalesCoaching />} />
                
                <Route path="/TrainingCenter" element={<TrainingCenter />} />
                
                <Route path="/CreateCoachingTask" element={<CreateCoachingTask />} />
                
                <Route path="/TaskReview" element={<TaskReview />} />
                
                <Route path="/UserPerformance" element={<UserPerformance />} />
                
                <Route path="/Documents" element={<Documents />} />
                
                <Route path="/CreateDocument" element={<CreateDocument />} />
                
                <Route path="/DocumentAnalytics" element={<DocumentAnalytics />} />
                
                <Route path="/RFPAssistant" element={<RFPAssistant />} />
                
                <Route path="/CallAnalytics" element={<CallAnalytics />} />
                
                <Route path="/SalesKnowledge" element={<SalesKnowledge />} />
                
                <Route path="/DialerSettings" element={<DialerSettings />} />
                
                <Route path="/CreateDigitalSalesRoom" element={<CreateDigitalSalesRoom />} />
                
                <Route path="/AIRoleplay" element={<AIRoleplay />} />
                
                <Route path="/CallAnalysis" element={<CallAnalysis />} />
                
                <Route path="/Integrations" element={<Integrations />} />
                
                <Route path="/BackendSetup" element={<BackendSetup />} />
                
                <Route path="/EmailSettings" element={<EmailSettings />} />
                
                <Route path="/SentEmails" element={<SentEmails />} />
                
                <Route path="/VoiceAITest" element={<VoiceAITest />} />
                
                <Route path="/VoiceAIDialer" element={<VoiceAIDialer />} />
                
                <Route path="/Dialer" element={<Dialer />} />
                
                <Route path="/ProfileSettings" element={<ProfileSettings />} />
                
                <Route path="/EffyVoiceSetup" element={<EffyVoiceSetup />} />
                
                <Route path="/IntegratedModules" element={<IntegratedModules />} />
                
                <Route path="/CostMonitoring" element={<CostMonitoring />} />
                
                <Route path="/AISalesSDR" element={<AISalesSDR />} />
                
                <Route path="/AIAgentTraining" element={<AIAgentTraining />} />
                
                <Route path="/ModuleManagement" element={<ModuleManagement />} />
                
                <Route path="/AIRoleplayHistory" element={<AIRoleplayHistory />} />
                
                <Route path="/AISalesAgentSettings" element={<AISalesAgentSettings />} />
                
                <Route path="/EffyUseCases" element={<EffyUseCases />} />
                
                <Route path="/CallInsights" element={<CallInsights />} />
                
                <Route path="/AIRoleplayAnalysis" element={<AIRoleplayAnalysis />} />
                
                <Route path="/DocumentPublicView" element={<DocumentPublicView />} />
                
                <Route path="/ContentLibrary" element={<ContentLibrary />} />
                
                <Route path="/SuperAdmin" element={<SuperAdmin />} />
                
                <Route path="/CompanyManagement" element={<CompanyManagement />} />
                
                <Route path="/GlobalAnalytics" element={<GlobalAnalytics />} />
                
                <Route path="/CompanyDetails" element={<CompanyDetails />} />
                
                <Route path="/APIDocumentation" element={<APIDocumentation />} />
                
                <Route path="/APIKeysManagement" element={<APIKeysManagement />} />
                
                <Route path="/SuperAdminPromotion" element={<SuperAdminPromotion />} />
                
                <Route path="/TechnicalDocumentation" element={<TechnicalDocumentation />} />
                
                <Route path="/AIAgentHub" element={<AIAgentHub />} />
                
                <Route path="/AIDialerSettings" element={<AIDialerSettings />} />
                
                <Route path="/ProductManagement" element={<ProductManagement />} />
                
                <Route path="/CompetitorManagement" element={<CompetitorManagement />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/LeadDetail" element={<LeadDetail />} />
                
                <Route path="/CallPrep" element={<CallPrep />} />
                
                <Route path="/PitchLibrary" element={<PitchLibrary />} />
                
                <Route path="/AICallAnalytics" element={<AICallAnalytics />} />
                
                <Route path="/SMSIntegrations" element={<SMSIntegrations />} />
                
                <Route path="/WhatsAppIntegrations" element={<WhatsAppIntegrations />} />
                
                <Route path="/SocialIntegrations" element={<SocialIntegrations />} />
                
                <Route path="/TaskSubmission" element={<TaskSubmission />} />
                
                <Route path="/HumanRoleplay" element={<HumanRoleplay />} />
                
                <Route path="/RoleplaySession" element={<RoleplaySession />} />
                
                <Route path="/RoleplaySessionPage" element={<RoleplaySessionPage />} />
                
                <Route path="/CallPreparation" element={<CallPreparation />} />
                
                <Route path="/ProductContribution" element={<ProductContribution />} />
                
                <Route path="/effyLeads" element={<effyLeads />} />
                
                <Route path="/CreatePitch" element={<CreatePitch />} />
                
                <Route path="/SalesRoomAnalytics" element={<SalesRoomAnalytics />} />
                
                <Route path="/SuperAdminAIAgent" element={<SuperAdminAIAgent />} />
                
                <Route path="/AIAgentSettings" element={<AIAgentSettings />} />
                
                <Route path="/RoleplaySessionHistory" element={<RoleplaySessionHistory />} />
                
                <Route path="/PublicRoleplaySession" element={<PublicRoleplaySession />} />
                
                <Route path="/WebsiteHome" element={<WebsiteHome />} />
                
                <Route path="/WebsitePricing" element={<WebsitePricing />} />
                
                <Route path="/WebsiteAbout" element={<WebsiteAbout />} />
                
                <Route path="/WebsiteProducts" element={<WebsiteProducts />} />
                
                <Route path="/WebsiteSolutions" element={<WebsiteSolutions />} />
                
                <Route path="/AISalesRoleplay" element={<AISalesRoleplay />} />
                
                <Route path="/CustomAIScorecards" element={<CustomAIScorecards />} />
                
                <Route path="/DigitalSalesRoomsProduct" element={<DigitalSalesRoomsProduct />} />
                
                <Route path="/EffyLeadsProspecting" element={<EffyLeadsProspecting />} />
                
                <Route path="/EffyDocProposals" element={<EffyDocProposals />} />
                
                <Route path="/UnifiedSalesAnalytics" element={<UnifiedSalesAnalytics />} />
                
                <Route path="/CreateRoleplayBot" element={<CreateRoleplayBot />} />
                
                <Route path="/BotPerformanceDetails" element={<BotPerformanceDetails />} />
                
                <Route path="/AIRoleplayPractice" element={<AIRoleplayPractice />} />
                
                <Route path="/BotOverview" element={<BotOverview />} />
                
                <Route path="/GamificationAdmin" element={<GamificationAdmin />} />
                
                <Route path="/AchievementManagement" element={<AchievementManagement />} />
                
                <Route path="/ChallengeManagement" element={<ChallengeManagement />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/KPIDashboard" element={<KPIDashboard />} />
                
                <Route path="/KPIManagement" element={<KPIManagement />} />
                
                <Route path="/CalendarSettings" element={<CalendarSettings />} />
                
                <Route path="/BookDemo" element={<BookDemo />} />
                
                <Route path="/ProductDetail" element={<ProductDetail />} />
                
                <Route path="/CommunityLanding" element={<CommunityLanding />} />
                
                <Route path="/CommunityOnboarding" element={<CommunityOnboarding />} />
                
                <Route path="/Register" element={<Register />} />
                
                <Route path="/LiveMeetings" element={<LiveMeetings />} />
                
                <Route path="/EffyDocProposalsProduct" element={<EffyDocProposalsProduct />} />
                
                <Route path="/MultiPartyRoleplay" element={<MultiPartyRoleplay />} />
                
                <Route path="/CreateMultiPartyScenario" element={<CreateMultiPartyScenario />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}