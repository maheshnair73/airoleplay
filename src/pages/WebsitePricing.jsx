
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, DollarSign, Clock, Users, TrendingUp, Zap, Mic, Building, Users as LeadsIcon, FileText, BarChart3, BrainCircuit, Loader2, X, Download, Trophy, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { User } from '@/api/entities';
import { toast } from 'sonner';
import { generateReimbursementLetter } from '@/api/functions';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils'; // Added createPageUrl import

// Utility function to generate page URLs - REMOVED since we now import createPageUrl

const SignupModal = ({ isOpen, onClose }) => {
    // This component is no longer used for direct signup, but kept in case it's needed later
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        jobTitle: '',
        workEmail: '',
        companySize: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Here you would typically save the form data and then redirect to signup
            // For this implementation, we directly redirect to the dashboard
            window.location.href = createPageUrl('Dashboard');
        } catch (error) {
            console.error("Signup process failed:", error);
            // Optionally show a toast error for signup failure
            toast.error("Failed to start free trial. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-2xl font-bold text-blue-600 mb-2">
                        Start your free trial!
                    </DialogTitle>
                    <p className="text-slate-600">
                        Enter your information to begin.
                    </p>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName">First Name*</Label>
                            <Input 
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name*</Label>
                            <Input 
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="jobTitle">Job Title*</Label>
                            <Input 
                                id="jobTitle"
                                value={formData.jobTitle}
                                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="workEmail">Work Email*</Label>
                            <Input 
                                id="workEmail"
                                type="email"
                                value={formData.workEmail}
                                onChange={(e) => handleInputChange('workEmail', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-3 block">Number of Employees*</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: '1-10', label: '1 - 10' },
                                { value: '11-50', label: '11 - 50' },
                                { value: '51-200', label: '51 - 200' },
                                { value: '201-1000', label: '201 - 1,000' },
                                { value: '1000+', label: '1,000+' }
                            ].map((option) => (
                                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="companySize"
                                        value={option.value}
                                        checked={formData.companySize === option.value}
                                        onChange={(e) => handleInputChange('companySize', e.target.value)}
                                        className="text-blue-600"
                                        required
                                    />
                                    <span className="text-sm">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            'Start Free Trial'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const ValueCallout = ({ icon, stat, description }) => (
    <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-2">{stat}</div>
        <div className="text-sm text-slate-600">{description}</div>
    </div>
);

const PricingCard = ({ plan, isFeatured, children }) => {
    // Simplified CTA to always be a link
    const ctaLink = plan.ctaAction === 'contact' ? createPageUrl('BookDemo') : createPageUrl('Register');
    
    return (
    <div className={`relative rounded-lg bg-white border p-8 flex flex-col h-full ${
        isFeatured 
            ? 'border-blue-200 ring-2 ring-blue-100' 
            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
    } transition-all duration-200`}>
        
        {isFeatured && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 text-xs font-medium">
                    Most Popular
                </Badge>
            </div>
        )}
        
        <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">{plan.name}</h3>
            <p className="text-slate-600 mb-6 min-h-[48px]">{plan.description}</p>
            
            {/* Pricing Display */}
            {plan.price === "FREE" ? (
                <div className="mb-6">
                    <div className="text-5xl font-bold text-slate-900 mb-1">Free</div>
                    <div className="text-sm text-slate-500">{plan.billing}</div>
                </div>
            ) : plan.price === "Custom" ? (
                <div className="mb-6">
                    <div className="text-5xl font-bold text-slate-900 mb-1">Custom</div>
                    <div className="text-sm text-slate-500">{plan.billing}</div>
                </div>
            ) : (
                <div className="mb-6">
                    <div className="text-5xl font-bold text-slate-900 mb-1">{plan.price}</div>
                    <div className="text-sm text-slate-500">{plan.billing}</div>
                    {plan.savings && (
                        <div className="text-sm text-green-600 mt-2 font-medium">
                            Save {plan.savings}
                        </div>
                    )}
                </div>
            )}
        </div>

        <Button 
            asChild
            size="lg" 
            className={`w-full mb-8 font-semibold py-3 text-base ${
                isFeatured 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg' 
                    : plan.price === 'FREE'
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                        : plan.price === 'Custom'
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
            }`}
        >
            <Link to={ctaLink}>{plan.ctaText}</Link>
        </Button>
        
        <div className="flex-grow">
            <h4 className="font-semibold text-slate-900 mb-4">What's included:</h4>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    </div>
    );
};

const ModuleFeature = ({ number, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1 z-10 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center font-bold text-sm text-blue-600">
            {number}
        </div>
        <div className="flex-1">
            <p className="font-semibold text-sm text-slate-900">
                {title}
            </p>
            <p className="text-xs text-slate-600 mt-1">
                {description}
            </p>
        </div>
    </div>
);

const CheckFeature = ({ title, description }) => (
     <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
            <Check className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1">
            <p className="font-medium text-sm text-slate-900">
                {title}
            </p>
            <p className="text-xs text-slate-600 mt-1">
                {description}
            </p>
        </div>
    </div>
);


export default function WebsitePricing() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [activeTab, setActiveTab] = useState('individual');
    // const [showSignupModal, setShowSignupModal] = useState(false); // No longer needed
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadLetter = async () => {
        setIsDownloading(true);
        const toastId = toast.loading("Generating your reimbursement letter...");

        try {
            const user = await User.me();
            if (!user) {
                toast.error("You must be logged in to download the letter.", { id: toastId });
                // Optional: trigger login flow if User.me() returns null
                // await User.login();
                setIsDownloading(false);
                return;
            }

            const response = await generateReimbursementLetter();

            if (response.status !== 200) {
                throw new Error('Failed to generate PDF.');
            }
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'effySales-Reimbursement-Letter.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success("Your letter has been downloaded!", { id: toastId });

        } catch (error) {
            console.error("Download failed", error);
            toast.error("Could not generate the letter. Please ensure you have an active subscription.", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };
    
    const businessPlans = [
        {
            name: "Professional",
            description: "Advanced features for growing sales teams with gamification & KPIs",
            price: isAnnual ? "$99" : "$119",
            billing: "per user/month",
            savings: isAnnual ? "$240/year" : null,
            ctaText: "Start Free Trial", // Changed ctaText
            ctaAction: "register",     // Changed ctaAction
            isFeatured: true,
            features: [
                { title: "AI Prospecting & Qualification", description: "Automate lead generation and qualification" },
                { title: "AI Roleplay: Unlimited", description: "On-demand practice against any scenario to create elite performers" },
                { title: "AI Meeting Assistant & Notetaker", description: "Automates note-taking and extracts key revenue intelligence" },
                { title: "Custom AI Scorecards", description: "Align AI feedback to your specific sales methodology" },
                { title: "Advanced Sales Rooms", description: "Full collaboration with mutual action plans" },
                { title: "Unlimited Proposals & E-signatures", description: "Smart documents with page-by-page analytics" },
                { title: "Unified Sales Analytics & KPIs", description: "Track performance metrics and key indicators across your sales process" },
                { title: "Gamification & Leaderboards", description: "Motivate your team with points, achievements, and competitive rankings" },
            ]
        },
        {
            name: "Enterprise",
            description: "Custom solutions with advanced gamification and team analytics",
            price: "Custom",
            billing: "Let's talk",
            ctaText: "Contact Sales", // Changed ctaText
            ctaAction: "contact",    // Changed ctaAction
            isFeatured: false,
            features: [
                { title: "Everything in Professional", description: "Full feature access plus enterprise-grade capabilities" },
                { title: "Automated CRM Updates via AI Assistant", description: "AI logs call notes and activities directly to your CRM" },
                { title: "Custom AI Training", description: "Train AI on your specific products, competitors, and methodologies" },
                { title: "Advanced Analytics & Reporting", description: "Custom dashboards and detailed performance insights" },
                { title: "Custom KPI Definitions", description: "Define and track your organization's unique success metrics" },
                { title: "Advanced Gamification", description: "Custom challenges, rewards, and team competitions" },
                { title: "Single Sign-On (SSO)", description: "Seamless integration with your existing identity management" },
                { title: "Dedicated Success Manager", description: "Personal onboarding and ongoing optimization support" },
                { title: "API Access & Custom Integrations", description: "Connect with your existing CRM and sales tools" },
            ]
        }
    ];

    const individualPlans = [
        {
            name: "Free",
            description: "A taste of our core AI coaching with basic gamification",
            price: "FREE",
            billing: "Experience the core",
            ctaText: "Start Free Trial",
            ctaAction: "register",
            isFeatured: false,
            features: [
                { title: "AI Roleplay: 10 minutes/month", description: "Practice with AI buyers to test our platform" },
                { title: "Basic AI Feedback", description: "Get instant performance insights after sessions" },
                { title: "Lead Tracking: Up to 10 leads", description: "Track a small number of leads" },
                { title: "Basic Gamification", description: "Earn points and see your progress with simple achievements" },
                { title: "1 Document Upload", description: "Test document sharing capabilities" },
                { title: "Community Support", description: "Access to help documentation and community" },
            ]
        },
        {
            name: "Starter",
            description: "Essential tools with full gamification and KPI tracking",
            price: isAnnual ? "$49" : "$59",
            billing: "per user/month",
            savings: isAnnual ? "$120/year" : null,
            ctaText: "Get Started", // Changed ctaText
            ctaAction: "register",     // Changed ctaAction
            isFeatured: true,
            features: [
                { title: "effyLeads: Unlimited leads", description: "AI finds & qualifies high-intent leads" },
                { title: "AI Roleplay: 150 minutes/month", description: "Practice with AI buyers to master objections" },
                { title: "AI Coaching Hub", description: "Get instant, data-driven feedback on practice sessions" },
                { title: "Sales Rooms: 3 active", description: "Collaborate with buyers in branded deal rooms" },
                { title: "effyDoc Proposals: 5 per month", description: "Create, send & track proposals with analytics" },
                { title: "Full Gamification Suite", description: "Points, levels, achievements, leaderboards, and challenges" },
                { title: "KPI Dashboard", description: "Track your key performance metrics and sales activities" },
            ]
        }
    ];

    const currentPlans = activeTab === 'business' ? businessPlans : individualPlans;

    return (
        <div className="bg-slate-50 py-20">
            <div className="container mx-auto px-6">
                
                {/* Header */}
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold text-slate-700 mb-6">
                        Simple, Powerful Plans for Every Sales Team
                    </h1>
                    <p className="text-xl text-slate-600 mb-8">
                        Join 500+ sales teams who chose one powerful platform over five separate tools.
                    </p>
                    <p className="text-slate-500 text-sm mb-12">No credit card required</p>
                </div>

                {/* Value Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    <ValueCallout
                        icon={<Trophy className="w-6 h-6 text-blue-600" />}
                        stat="3x"
                        description="Faster skill development with gamified learning"
                    />
                    <ValueCallout
                        icon={<BarChart3 className="w-6 h-6 text-green-600" />}
                        stat="25%"
                        description="Average increase in sales performance with KPI tracking"
                    />
                    <ValueCallout
                        icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                        stat="40%"
                        description="Improvement in team engagement through gamification"
                    />
                    <ValueCallout
                        icon={<Users className="w-6 h-6 text-orange-600" />}
                        stat="500+"
                        description="Sales teams already using our platform"
                    />
                </div>

                {/* Audience Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white rounded-lg p-1 border">
                        <button
                            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === 'individual'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                            onClick={() => setActiveTab('individual')}
                        >
                            For individuals & small teams
                        </button>
                        <button
                            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === 'business'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                            onClick={() => setActiveTab('business')}
                        >
                            For businesses & enterprises
                        </button>
                    </div>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={`text-sm font-medium ${isAnnual ? 'text-slate-700' : 'text-slate-500'}`}>
                        Annual (save 20%)
                    </span>
                    <Switch
                        checked={!isAnnual}
                        onCheckedChange={() => setIsAnnual(!isAnnual)}
                        aria-label="Toggle billing cycle"
                    />
                    <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-700' : 'text-slate-500'}`}>
                        Monthly
                    </span>
                </div>

                {/* Pricing Cards */}
                <div className={`grid gap-8 max-w-5xl mx-auto mb-20 ${
                    currentPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                    {currentPlans.map((plan, index) => (
                        <PricingCard key={index} plan={plan} isFeatured={plan.isFeatured}>
                            {plan.features.map((feature, featureIndex) => (
                                <CheckFeature 
                                    key={featureIndex}
                                    title={feature.title}
                                    description={feature.description}
                                />
                            ))}
                        </PricingCard>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto mt-20">
                    <h2 className="text-2xl font-bold text-center mb-8 text-slate-700">Frequently asked questions</h2>
                    <Accordion type="single" collapsible className="w-full bg-white p-6 rounded-lg border">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-left font-semibold">What's included in the free plan?</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-slate-600">The free plan includes 10 minutes of AI roleplay per month, basic AI feedback, tracking for up to 10 leads, 1 document upload, basic gamification with points and achievements, and community support. It's perfect for trying out our core features.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger className="text-left font-semibold">How does the gamification system work?</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-slate-600">Our gamification system rewards you with points for activities like creating leads, completing calls, finishing roleplay sessions, and more. You'll unlock achievements, climb leaderboards, and participate in team challenges. It's designed to make sales training and daily activities more engaging and motivating.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-7">
                            <AccordionTrigger className="text-left font-semibold">What KPIs can I track?</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-slate-600">You can track essential KPIs like call volume, conversion rates, pipeline value, win rates, and more. Enterprise customers can define custom KPIs specific to their business. All metrics are automatically calculated from your activities within the platform.</p>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-5">
                            <AccordionTrigger className="text-left font-semibold">How can I reimburse effySales Pro with my employer?</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-slate-600 mb-4">
                                    Over 90% of companies cover the cost of effySales Pro as part of professional development benefits. Submit the reimbursement letter along with your invoice (downloadable from your account) to your employer.
                                </p>
                                <Button
                                    onClick={handleDownloadLetter}
                                    disabled={isDownloading}
                                    variant="outline"
                                    size="sm"
                                >
                                    {isDownloading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                    )}
                                    Download Reimbursement Letter
                                </Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-left font-semibold">Can I upgrade or downgrade my plan?</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-slate-600">Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and you'll be billed or credited accordingly.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger className="text-left font-semibold">What payment methods do you accept?</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-slate-600">We accept all major credit cards. For annual Enterprise plans, we also offer invoice billing. All payments are processed securely through Stripe.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger className="text-left font-semibold">Is there a long-term contract?</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-slate-600">No long-term contracts are required for monthly plans. You can cancel your subscription at any time. Annual plans offer significant savings and are billed upfront for the year.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Final CTA */}
                <div className="bg-white rounded-lg border p-12 text-center mt-20 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4 text-slate-700">
                        Ready to gamify your sales success?
                    </h2>
                    <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
                        Join hundreds of sales teams who are already using effySales Pro to close more deals faster while having fun with gamified learning and KPI tracking.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3" asChild>
                            <Link to={createPageUrl('Register')}>Start Free Trial</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="px-8 py-3 border-slate-300 hover:bg-slate-50" asChild>
                            <Link to={createPageUrl('BookDemo')}>Contact Sales</Link>
                        </Button>
                    </div>
                    <p className="text-slate-500 mt-4 text-sm">
                        No credit card required • Cancel anytime • Setup in under 5 minutes
                    </p>
                </div>

                {/* Signup Modal is removed from direct use */}

            </div>
        </div>
    );
}
