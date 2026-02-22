
import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, Shield, Briefcase, Bot, Target, TrendingUp, Zap, BarChart3, Building, Users, GraduationCap, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SolutionCard = ({ icon, title, description, features }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-full flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600 mb-4 flex-grow">{description}</p>
        <ul className="space-y-3">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0 ring-2 ring-blue-100"></div>
                    <span className="text-sm text-slate-700">{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

const roleBasedSolutions = {
    reps: {
        title: "For Sales Reps",
        subtitle: "Hit quota faster with tools purpose-built for practice, prospecting, and closing deals efficiently.",
        solutions: [
            { icon: <Bot className="w-6 h-6" />, title: "AI Sales Roleplay", description: "Practice your pitch against realistic AI buyers that challenge you with real objections.", features: ["Practice difficult conversations", "Get instant feedback", "Build confidence before big calls"] },
            { icon: <Users className="w-6 h-6" />, title: "effyLeads Prospecting", description: "Find and qualify high-intent leads faster with AI-powered research and outreach.", features: ["Automated lead research", "Personalized outreach", "Higher response rates"] },
            { icon: <Building className="w-6 h-6" />, title: "Digital Sales Rooms", description: "Impress buyers and accelerate deals with collaborative, trackable sales environments.", features: ["Branded deal rooms", "Track buyer engagement", "Streamline the buying process"] }
        ]
    },
    managers: {
        title: "For Sales Managers",
        subtitle: "Coach effectively, scale best practices, and drive team performance with data-driven insights and analytics.",
        solutions: [
            { icon: <BarChart3 className="w-6 h-6" />, title: "AI Coaching Analytics", description: "Get objective insights into each rep's performance and coaching needs.", features: ["Call analysis and scoring", "Identify coaching opportunities", "Track improvement over time"] },
            { icon: <Target className="w-6 h-6" />, title: "Performance Scorecards", description: "Use AI to score calls against your methodology - MEDDIC, BANT, or custom frameworks.", features: ["Consistent evaluation criteria", "Automated scoring", "Methodology alignment"] },
            { icon: <TrendingUp className="w-6 h-6" />, title: "Team Performance Insights", description: "See which reps are excelling and which need support, with actionable recommendations.", features: ["Individual performance tracking", "Team benchmarking", "Coaching recommendations"] }
        ]
    },
    leaders: {
        title: "For Sales Leaders",
        subtitle: "Drive predictable revenue and optimize your entire sales motion with full-funnel performance tracking.",
        solutions: [
            { icon: <BarChart3 className="w-6 h-6" />, title: "Revenue Analytics", description: "Get complete visibility into your sales pipeline and forecast with confidence.", features: ["Pipeline analytics", "Revenue forecasting", "Deal progression tracking"] },
            { icon: <Shield className="w-6 h-6" />, title: "Sales Process Optimization", description: "Identify bottlenecks and optimize your sales process with data-driven insights.", features: ["Process analytics", "Conversion optimization", "Best practice identification"] },
            { icon: <Briefcase className="w-6 h-6" />, title: "Strategic Reporting", description: "Executive-level reporting on sales performance, team productivity, and ROI.", features: ["Executive dashboards", "ROI tracking", "Strategic insights"] }
        ]
    }
};

const businessSolutions = {
    gtm: {
        title: "Fuel GTM Success with AI Roleplays",
        subtitle: "Enable your Go-To-Market teams to launch, pitch, and close faster with realistic AI roleplays.",
        solutions: [
            { icon: <Bot className="w-6 h-6" />, title: "AI Sales Roleplay for Reps", description: "Practice your pitch against realistic AI buyers that adapt to your style.", features: ["Personalized objection handling", "Real-time feedback", "Progress tracking"] },
            { icon: <BarChart3 className="w-6 h-6" />, title: "AI-Powered Coaching for Managers", description: "Scale your coaching with AI that provides personalized feedback to each rep.", features: ["Call analysis and scoring", "Automated coaching recommendations", "Custom methodology alignment"] },
            { icon: <TrendingUp className="w-6 h-6" />, title: "Strategic Insights for Leaders", description: "Get the strategic insights you need to make data-driven decisions.", features: ["Revenue forecasting", "Team performance metrics", "Market trend analysis"] }
        ]
    },
    partners: {
        title: "Supercharge Partner Enablement",
        subtitle: "Your partners are your extended salesforce—equip them to win with our AI-driven roleplay platform.",
        solutions: [
            { icon: <Zap className="w-6 h-6" />, title: "Onboard Partners Faster", description: "Get new partners certified and selling your product in record time with scalable roleplay scenarios.", features: ["Standardized onboarding paths", "Certification tracking", "Reduce time-to-first-deal"] },
            { icon: <Shield className="w-6 h-6" />, title: "Ensure Message Consistency", description: "Train partners on your exact messaging, value proposition, and objection handling.", features: ["Centralized content library", "Version-controlled talk tracks", "Brand message compliance"] },
            { icon: <Target className="w-6 h-6" />, title: "Measure Partner Readiness", description: "Use AI scorecards to objectively measure which partners are ready for live deals.", features: ["AI-based performance scoring", "Identify skill gaps", "Data-driven partner tiering"] }
        ]
    },
    ld: {
        title: "Empower Your Workforce with Communication Coaching",
        subtitle: "Scale soft-skill training across the organization, from new managers to senior leaders.",
        solutions: [
            { icon: <Users className="w-6 h-6" />, title: "Develop Confident Managers", description: "Allow managers to practice crucial conversations like performance reviews and conflict resolution.", features: ["Simulate difficult conversations", "Provide objective feedback", "Build leadership confidence"] },
            { icon: <GraduationCap className="w-6 h-6" />, title: "Improve Presentation Skills", description: "Help any employee deliver impactful presentations for internal or external audiences.", features: ["Practice for all-hands meetings", "Prepare for customer-facing presentations", "Track clarity and filler words"] },
            { icon: <Building className="w-6 h-6" />, title: "Standardize Corporate Training", description: "Deliver consistent, scalable, and engaging training on any communication-based skill.", features: ["Create custom training modules", "Track completion and proficiency", "Measure training ROI"] }
        ]
    },
    corporate: {
        title: "Master High-Stakes Communication",
        subtitle: "Prepare your leaders and key spokespeople for any public-facing or critical internal conversation.",
        solutions: [
            { icon: <Megaphone className="w-6 h-6" />, title: "Media & PR Training", description: "Simulate tough journalist questions, press conferences, and crisis communications.", features: ["Practice staying on message", "Handle rapid-fire questions", "Refine body language and tone"] },
            { icon: <Briefcase className="w-6 h-6" />, title: "Investor & Board Relations", description: "Practice for earnings calls, investor pitches, and high-stakes board meetings.", features: ["Refine financial storytelling", "Anticipate difficult questions", "Ensure clarity and confidence"] },
            { icon: <User className="w-6 h-6" />, title: "Develop Executive Presence", description: "Coach leaders on delivering clear, confident, and inspiring messages to the entire company.", features: ["Practice town-hall speeches", "Improve clarity and conciseness", "Refine non-verbal communication"] }
        ]
    }
};

const ContentSection = ({ data }) => {
    const { title, subtitle, solutions } = data;
    return (
        <div className="animate-fade-in">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                    {title}
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    {subtitle}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {solutions.map((solution, index) => (
                    <SolutionCard key={index} {...solution} />
                ))}
            </div>
        </div>
    );
};


export default function WebsiteSolutions() {
    const location = useLocation();
    const defaultView = new URLSearchParams(location.search).get('view') || 'by-role';
    const defaultRoleTab = new URLSearchParams(location.search).get('tab') || 'reps';
    const defaultFunctionTab = new URLSearchParams(location.search).get('tab') || 'gtm';

    return (
        <div className="py-12 bg-gradient-to-b from-slate-50 to-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tighter mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Solutions for Every Team
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Whether you're looking by role or business function, we have the tools to transform your team's performance and drive revenue.
                    </p>
                </div>

                <Tabs defaultValue={defaultView} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto mb-16 h-auto bg-slate-100 p-2 rounded-xl">
                        <TabsTrigger value="by-role" className="py-3 text-base rounded-lg">By Role</TabsTrigger>
                        <TabsTrigger value="by-function" className="py-3 text-base rounded-lg">By Business Function</TabsTrigger>
                    </TabsList>

                    <TabsContent value="by-role">
                        <Tabs defaultValue={defaultRoleTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 max-w-2xl mx-auto mb-16 h-auto bg-slate-100 p-2 rounded-xl">
                                <TabsTrigger value="reps" className="py-2.5 rounded-lg">Sales Reps</TabsTrigger>
                                <TabsTrigger value="managers" className="py-2.5 rounded-lg">Sales Managers</TabsTrigger>
                                <TabsTrigger value="leaders" className="py-2.5 rounded-lg">Sales Leaders</TabsTrigger>
                            </TabsList>
                            <TabsContent value="reps"><ContentSection data={roleBasedSolutions.reps} /></TabsContent>
                            <TabsContent value="managers"><ContentSection data={roleBasedSolutions.managers} /></TabsContent>
                            <TabsContent value="leaders"><ContentSection data={roleBasedSolutions.leaders} /></TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="by-function">
                        <Tabs defaultValue={defaultFunctionTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 max-w-4xl mx-auto mb-16 h-auto bg-slate-100 p-2 rounded-xl">
                                <TabsTrigger value="gtm" className="py-2.5 rounded-lg">GTM Enablement</TabsTrigger>
                                <TabsTrigger value="partners" className="py-2.5 rounded-lg">Partner Enablement</TabsTrigger>
                                <TabsTrigger value="ld" className="py-2.5 rounded-lg">Learning & Development</TabsTrigger>
                                <TabsTrigger value="corporate" className="py-2.5 rounded-lg">Corporate Communications</TabsTrigger>
                            </TabsList>
                            <TabsContent value="gtm"><ContentSection data={businessSolutions.gtm} /></TabsContent>
                            <TabsContent value="partners"><ContentSection data={businessSolutions.partners} /></TabsContent>
                            <TabsContent value="ld"><ContentSection data={businessSolutions.ld} /></TabsContent>
                            <TabsContent value="corporate"><ContentSection data={businessSolutions.corporate} /></TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>

                <div className="text-center mt-24">
                     <h2 className="text-3xl font-bold text-slate-800 mb-4">Ready to See It in Action?</h2>
                    <p className="text-slate-600 mb-8 max-w-xl mx-auto">See how effySales can transform your sales process.</p>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg">
                        Request a Demo
                    </Button>
                </div>
            </div>
        </div>
    );
}
