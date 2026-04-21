
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AIClient, User as UserAPI } from '@/api/entities';
import { Product } from '@/api/entities';
import { getDefaultVoiceForGender, getVoicesByGender, GENDER_OPTIONS, NATIONALITY_OPTIONS, getVoiceDescription } from '@/utils/voiceMapping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, User, Building2, BrainCircuit, Mic, ShieldAlert, Target, Sparkles, Wand2, Bot, Linkedin, Snowflake, Search, Flame, Check, RefreshCw, Settings, PenSquare, Plus, X, Package, ShoppingBag } from 'lucide-react'; // Add Package icon
import { createPageUrl } from '@/utils';

const steps = [
    { id: 'start', name: 'Start', icon: Sparkles },
    { id: 'industry', name: 'Industry', icon: Building2 }, // New step
    { id: 'persona', name: 'Persona', icon: User },
    { id: 'scenario', name: 'Scenario', icon: Target },
    { id: 'details', name: 'Details', icon: BrainCircuit },
    { id: 'advanced', name: 'Advanced', icon: Settings },
];

const roleplayTypes = [
    { name: 'Cold Call', description: "Call prospects who don't expect it.", icon: Snowflake, color: 'text-blue-500' },
    { name: 'Discovery Call', description: "Learn about a lead's problems and needs.", icon: Search, color: 'text-purple-500' },
    { name: 'Warm Call', description: 'Contact prospects already familiar with you.', icon: Flame, color: 'text-orange-500' },
    { name: 'Check-in Call', description: 'Talk to existing customers to check in.', icon: Check, color: 'text-green-500' },
    { name: 'Renewal Call', description: 'Call customers before their subscription ends.', icon: RefreshCw, color: 'text-teal-500' },
    { name: 'Negotiation', description: 'Practice negotiating terms and price.', icon: PenSquare, color: 'text-indigo-500' },
    { name: 'Custom', description: 'Create a custom scenario for your industry.', icon: Settings, color: 'text-slate-500' }
];

const roleplayScenarios = [
    "Is Aware of Problem",
    "Is Aware of Problem & Solution",
    "Is Pre-existing Champion",
    "None",
    "Problem Aware, Not Solution Aware",
    "Product Aware, Not Ready to Buy",
    "Solution Aware, Not Product Aware"
];

// Options for new multi-select fields
const personaTags = ["Decision Maker", "Influencer", "Budget Holder", "Gatekeeper", "Tech Savvy", "Cautious", "Growth-Focused", "Cost-Conscious", "Early Adopter", "Risk Averse", "Skeptical", "Optimistic", "Busy", "Collaborative"];

// Common call goals for quick selection
const callGoalTags = [
    "Book a Discovery Meeting",
    "Schedule a Demo",
    "Qualify the Lead",
    "Present Solution",
    "Close the Deal",
    "Overcome Objections",
    "Build Rapport",
    "Gather Requirements",
    "Discuss Pricing",
    "Set Next Steps"
];

// Industry-specific data
const industryProfiles = {
    'Healthcare': {
        icon: '🏥',
        description: 'Healthcare professionals focus on patient outcomes, compliance, and efficiency.',
        commonTitles: ['Chief Medical Officer', 'Practice Administrator', 'Hospital CEO', 'Nursing Director'],
        commonPainPoints: ['Patient wait times', 'Staff burnout', 'Regulatory compliance', 'Electronic health records'],
        commonObjections: ['Patient privacy concerns', 'Staff training requirements', 'Budget constraints', 'Integration with existing systems'],
        sampleCompanies: ['Johns Hopkins Hospital', 'Mayo Clinic', 'Kaiser Permanente', 'Cleveland Clinic']
    },
    'Legal': {
        icon: '⚖️',
        description: 'Legal professionals prioritize accuracy, security, and time efficiency.',
        commonTitles: ['Managing Partner', 'General Counsel', 'Paralegal Manager', 'Legal Operations Director'],
        commonPainPoints: ['Document management', 'Billable hours tracking', 'Case research time', 'Client communication'],
        commonObjections: ['Data security concerns', 'Bar compliance requirements', 'Cost per case', 'Learning curve for staff'],
        sampleCompanies: ['Baker McKenzie', 'Latham & Watkins', 'DLA Piper', 'Skadden Arps']
    },
    'HR': {
        icon: '👥',
        description: 'HR professionals focus on employee experience, compliance, and organizational efficiency.',
        commonTitles: ['Chief People Officer', 'HR Director', 'Talent Acquisition Manager', 'HR Business Partner'],
        commonPainPoints: ['Employee retention', 'Recruitment efficiency', 'Performance management', 'Compliance tracking'],
        commonObjections: ['Employee privacy concerns', 'Change management challenges', 'Training time required', 'ROI measurement'],
        sampleCompanies: ['Google', 'Microsoft', 'Amazon', 'Apple']
    },
    'Finance': {
        icon: '💼',
        description: 'Finance professionals prioritize accuracy, compliance, and operational efficiency.',
        commonTitles: ['CFO', 'Finance Director', 'Controller', 'Financial Analyst'],
        commonPainPoints: ['Month-end closing', 'Financial reporting accuracy', 'Audit preparation', 'Cash flow management'],
        commonObjections: ['Audit trail requirements', 'Integration complexity', 'Cost justification', 'Security concerns'],
        sampleCompanies: ['JP Morgan', 'Goldman Sachs', 'Wells Fargo', 'Bank of America']
    },
    'Technology': {
        icon: '💻',
        description: 'Tech professionals focus on innovation, scalability, and technical excellence.',
        commonTitles: ['CTO', 'Engineering Manager', 'DevOps Director', 'Product Manager'],
        commonPainPoints: ['Technical debt', 'Team productivity', 'System scalability', 'Security vulnerabilities'],
        commonObjections: ['Technical feasibility', 'Integration challenges', 'Performance impact', 'Vendor lock-in concerns'],
        sampleCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta']
    },
    'Manufacturing': {
        icon: '🏭',
        description: 'Manufacturing professionals prioritize efficiency, safety, and cost reduction.',
        commonTitles: ['Plant Manager', 'Operations Director', 'Quality Manager', 'Production Supervisor'],
        commonPainPoints: ['Production downtime', 'Quality control', 'Supply chain issues', 'Safety compliance'],
        commonObjections: ['Implementation downtime', 'Worker training needs', 'Equipment compatibility', 'ROI timeline'],
        sampleCompanies: ['General Electric', 'Toyota', 'Ford', '3M']
    }
};

const MultiSelectTag = ({ children, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            isSelected
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
        }`}
    >
        {children}
    </button>
);


export default function CreateAIClient() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [products, setProducts] = useState([]);
    const [userRole, setUserRole] = useState('sales_agent');

    const prefilledData = location.state?.prefilledData || {};

    const [formData, setFormData] = useState({
        first_name: prefilledData.first_name || '',
        last_name: prefilledData.last_name || '',
        title: prefilledData.title || '',
        company_name: prefilledData.company_name || '',
        personality: prefilledData.personality || 'Analytical',
        emotional_state: 'Neutral',
        gender: prefilledData.gender || 'Female',
        voice: prefilledData.voice || getDefaultVoiceForGender(prefilledData.gender || 'Female'),
        roleplay_type: prefilledData.roleplay_type || 'Cold Call',
        roleplay_scenario: 'Is Aware of Problem',
        persona_details: '',
        company_offerings_context: '',
        priorities_and_objections: '',
        initial_prompt: '',
        buyer_opinions: [''],
        common_objections: [''],
        industry: '',
        product_interest: [],
        persona_tags: [],
        call_goal_tags: [],
        visibility: 'creator_only',
        shared_with_user_ids: [],
        selling_context: '',
        call_goal: '',
        buyer_awareness_level: 'Is Aware of Problem',
        background: '',
        nationality: 'US'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [customRoleplayType, setCustomRoleplayType] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = await UserAPI.me();
                setUserRole(user?.role || 'sales_agent');

                const isAdmin = user?.role === 'super_admin' || user?.role === 'company_admin';
                setFormData(prev => ({
                    ...prev,
                    visibility: isAdmin ? 'all_users' : 'creator_only'
                }));
            } catch (error) {
                console.error('Error loading user:', error);
            }
        };
        loadUserData();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const activeProducts = await Product.filter({ is_active: true });
                setProducts(activeProducts);
            } catch (error) {
                console.error('Error loading products:', error);
                setProducts([
                    { id: '1', name: 'AI Sales Roleplay' },
                    { id: '2', name: 'Custom AI Scorecards' },
                    { id: '3', name: 'Digital Sales Rooms' },
                    { id: '4', name: 'EffyLeads Prospecting' },
                    { id: '5', name: 'EffyDoc Proposals' },
                    { id: '6', name: 'Unified Sales Analytics' }
                ]);
                toast.error("Failed to load products. Using fallback data.");
            }
        };
        loadProducts();
    }, []);

    useEffect(() => {
        const newVoice = getDefaultVoiceForGender(formData.gender);
        setFormData(prev => ({ ...prev, voice: newVoice }));
    }, [formData.gender]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (field, value) => {
        setFormData(prev => {
            const currentValues = prev[field] || [];
            if (currentValues.includes(value)) {
                return { ...prev, [field]: currentValues.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...currentValues, value] };
            }
        });
    };

    const addBuyerOpinion = () => {
        setFormData(prev => ({
            ...prev,
            buyer_opinions: [...prev.buyer_opinions, '']
        }));
    };

    const removeBuyerOpinion = (index) => {
        setFormData(prev => ({
            ...prev,
            buyer_opinions: prev.buyer_opinions.filter((_, i) => i !== index)
        }));
    };

    const updateBuyerOpinion = (index, value) => {
        setFormData(prev => ({
            ...prev,
            buyer_opinions: prev.buyer_opinions.map((opinion, i) => i === index ? value : opinion)
        }));
    };

    const addCommonObjection = () => {
        setFormData(prev => ({
            ...prev,
            common_objections: [...prev.common_objections, '']
        }));
    };

    const removeCommonObjection = (index) => {
        setFormData(prev => ({
            ...prev,
            common_objections: prev.common_objections.filter((_, i) => i !== index)
        }));
    };

    const updateCommonObjection = (index, value) => {
        setFormData(prev => ({
            ...prev,
            common_objections: prev.common_objections.map((objection, i) => i === index ? value : objection)
        }));
    };

    const handleGenerateFromPrompt = async () => {
        if (!formData.initial_prompt) {
            toast.error("Please enter a prompt first.");
            return;
        }
        setIsLoading(true);
        toast.info("Generating bot details from your prompt...");
        // In a real scenario, you'd call an LLM here.
        // For now, we'll simulate it with dummy data.
        setTimeout(() => {
            const isLinkedIn = formData.initial_prompt.includes("linkedin.com");
            setFormData(prev => ({
                ...prev,
                first_name: isLinkedIn ? "Jim" : "Kathy",
                last_name: isLinkedIn ? "Chehanske" : "Wood",
                title: isLinkedIn ? "VP, Sales Ops" : "Sales VP",
                company_name: isLinkedIn ? "Samsara" : "Alderwest Tech",
                persona_details: "Generated based on prompt: Analytical, cautious, and data-driven. Skeptical but open to solutions that show clear ROI.",
                priorities_and_objections: "Main priorities are improving forecast accuracy and reducing sales team turnover. Will object based on price and implementation complexity.",
                buyer_opinions: ["Believes in the importance of continuous sales training.", "Thinks current systems are adequate but could be improved."],
                common_objections: ["Budget constraints.", "Not a priority right now.", "We're happy with our current solution."],
                // Add generated tags - using strings matching fallback products if any
                industry: isLinkedIn ? "Technology" : "Manufacturing", // Updated to match industryProfiles keys
                persona_tags: isLinkedIn ? ["Decision Maker", "Tech Savvy", "Growth-Focused"] : ["Budget Holder", "Cautious", "Risk Averse"],
                product_interest: ["AI Sales Roleplay", "Unified Sales Analytics"], // These should ideally come from products state if dynamically chosen
                call_goal_tags: ["Book a Discovery Meeting"]
            }));
            setIsLoading(false);
            setCurrentStep(1); // Navigates to Industry selection, or potentially Persona if skipped.
            toast.success("Bot details generated! Please review.");
        }, 1500);
    };

    const handleCreateBot = async () => {
        setIsLoading(true);
        try {
            const botDataToCreate = { ...formData };
            if (botDataToCreate.roleplay_type === 'Custom') {
                if (!customRoleplayType) {
                    toast.error("Please specify a custom roleplay type.");
                    setIsLoading(false);
                    return;
                }
                botDataToCreate.roleplay_type = customRoleplayType;
            }

            // Filter out empty buyer opinions and objections
            botDataToCreate.buyer_opinions = botDataToCreate.buyer_opinions.filter(opinion => opinion.trim() !== '');
            botDataToCreate.common_objections = botDataToCreate.common_objections.filter(objection => objection.trim() !== '');

            // The new fields (industry, product_interest, persona_tags, call_goal_tags) are already part of botDataToCreate

            await AIClient.create(botDataToCreate);
            toast.success("AI Client created successfully!");
            navigate(createPageUrl('AIRoleplay'));
        } catch (error) {
            console.error("Error creating bot:", error);
            toast.error("Failed to create bot. Please check all fields.");
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Start with Prompt or Template
                return (
                    <CardContent className="p-6 text-center">
                        <Wand2 className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Create a New Roleplay Bot</h3>
                        <p className="text-slate-600 mb-6">Start with a simple prompt and let AI do the heavy lifting.</p>
                        <div className="text-left space-y-4">
                             <div>
                                <Label htmlFor="initial_prompt" className="font-semibold">Describe the Prospect</Label>
                                <Textarea
                                    id="initial_prompt"
                                    placeholder="e.g., Create a cold call bot for Jim who is VP of Sales Ops at Samsara. He is focused on improving forecast accuracy. Or, paste a LinkedIn URL."
                                    value={formData.initial_prompt}
                                    onChange={(e) => handleInputChange('initial_prompt', e.target.value)}
                                    className="h-32 mt-1"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Include name, title, company, and key focus areas. The more detail, the better the bot.
                                </p>
                            </div>
                            <Button
                                onClick={handleGenerateFromPrompt}
                                disabled={isLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                size="lg"
                            >
                                {isLoading ? <Sparkles className="w-5 h-5 mr-2 animate-pulse" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                Generate with AI
                            </Button>
                        </div>
                         <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-2 text-sm text-gray-500">Or</span>
                            </div>
                        </div>
                        <Button variant="secondary" className="w-full" onClick={() => setCurrentStep(1)}>
                            <Bot className="w-5 h-5 mr-2" />
                            Create Manually from Scratch
                        </Button>
                    </CardContent>
                );

            case 1: // Industry Selection
                return (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="text-blue-600" />
                                Choose Industry Focus
                            </CardTitle>
                            <CardDescription>Select the industry for this roleplay bot. This will customize the persona, pain points, and objections to be more realistic for that sector.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(industryProfiles).map(([industry, profile]) => (
                                    <button
                                        key={industry}
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, industry }));
                                        }}
                                        className={`p-4 border rounded-lg text-center transition-all duration-200 ${
                                            formData.industry === industry
                                                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                                                : 'bg-white hover:border-blue-400 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="text-3xl mb-2">{profile.icon}</div>
                                        <p className="font-semibold text-slate-800">{industry}</p>
                                        <p className="text-xs text-slate-500 mt-1">{profile.description}</p>
                                    </button>
                                ))}
                            </div>

                            {formData.industry && industryProfiles[formData.industry] && (
                                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                    <h4 className="font-semibold mb-2">Industry Insights: {formData.industry}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-medium text-slate-700 mb-1">Common Titles:</p>
                                            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                                {industryProfiles[formData.industry]?.commonTitles.slice(0, 3).map((title, idx) => (
                                                    <li key={idx}>{title}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-700 mb-1">Common Pain Points:</p>
                                            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                                {industryProfiles[formData.industry]?.commonPainPoints.slice(0, 3).map((pain, idx) => (
                                                    <li key={idx}>{pain}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </>
                );

            case 2: // Persona (updated step number)
                return (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="text-blue-600" /> Basic Persona</CardTitle>
                            <CardDescription>Define who the AI prospect is. {formData.industry && `This will be a ${formData.industry} professional.`}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            {formData.industry && industryProfiles[formData.industry] && (
                                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Quick Fill:</strong> Use these common {formData.industry} titles and companies:
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {industryProfiles[formData.industry]?.commonTitles.slice(0, 4).map((title, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, title }))}
                                                className="px-2 py-1 text-xs bg-white border border-blue-300 rounded hover:bg-blue-100"
                                            >
                                                {title}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {industryProfiles[formData.industry]?.sampleCompanies.slice(0, 4).map((company, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, company_name: company }))}
                                                className="px-2 py-1 text-xs bg-white border border-green-300 rounded hover:bg-green-100"
                                            >
                                                {company}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input id="first_name" placeholder="e.g., Sarah" value={formData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input id="last_name" placeholder="e.g., Connor" value={formData.last_name} onChange={(e) => handleInputChange('last_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Job Title</Label>
                                    <Input id="title" placeholder="e.g., VP of Operations" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Company Name</Label>
                                    <Input id="company_name" placeholder="e.g., Cyberdyne Systems" value={formData.company_name} onChange={(e) => handleInputChange('company_name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Personality</Label>
                                    <Select value={formData.personality} onValueChange={(v) => handleInputChange('personality', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Nice">Nice & Friendly</SelectItem>
                                            <SelectItem value="Analytical">Analytical & Data-Driven</SelectItem>
                                            <SelectItem value="Formal">Formal & Professional</SelectItem>
                                            <SelectItem value="Rude">Direct & Impatient</SelectItem>
                                            <SelectItem value="Chatty">Chatty & Conversational</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender (for voice selection)</Label>
                                    <Select value={formData.gender} onValueChange={(v) => handleInputChange('gender', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Female">Female Voice</SelectItem>
                                            <SelectItem value="Male">Male Voice</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Nationality / Accent selector */}
                            <div className="space-y-2">
                                <Label>Nationality / Accent Region</Label>
                                <Select value={formData.nationality} onValueChange={(v) => handleInputChange('nationality', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select region…" /></SelectTrigger>
                                    <SelectContent>
                                        {NATIONALITY_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500 mt-1">
                                    Sets the accent and regional speech style for this persona's AI voice.
                                </p>
                            </div>

                            {/* Voice Preview Section */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mic className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">Voice Preview</span>
                                </div>
                                <p className="text-sm text-blue-700 capitalize">
                                    {getVoiceDescription(formData)}
                                </p>
                                <p className="text-xs text-blue-500 mt-1">
                                    Voice is automatically matched to nationality, gender, and personality.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Label className="font-semibold text-base">Persona Tags</Label>
                                <p className="text-sm text-slate-600">Select tags that best describe the prospect's role and mindset.</p>
                                <div className="flex flex-wrap gap-2">
                                    {personaTags.map(tag => (
                                        <MultiSelectTag
                                            key={tag}
                                            isSelected={formData.persona_tags.includes(tag)}
                                            onClick={() => handleMultiSelectChange('persona_tags', tag)}
                                        >
                                            {tag}
                                        </MultiSelectTag>
                                    ))}
                                </div>
                            </div>

                        </CardContent>
                    </>
                );
            case 3: // Scenario (updated step number)
                return (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Target className="text-blue-600" /> Roleplay Configuration</CardTitle>
                            <CardDescription>Configure the roleplay scenario and buyer awareness level.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {roleplayTypes.map((type) => (
                                    <button
                                        key={type.name}
                                        onClick={() => handleInputChange('roleplay_type', type.name)}
                                        className={`p-4 border rounded-lg text-center transition-all duration-200 ${
                                            formData.roleplay_type === type.name
                                                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                                                : 'bg-white hover:border-blue-400 hover:shadow-md'
                                        }`}
                                    >
                                        <type.icon className={`w-8 h-8 mx-auto mb-2 ${type.color}`} />
                                        <p className="font-semibold text-slate-800">{type.name}</p>
                                        <p className="text-xs text-slate-500">{type.description}</p>
                                    </button>
                                ))}
                            </div>

                            {formData.roleplay_type === 'Custom' && (
                                <div className="pt-4">
                                    <Label htmlFor="custom_roleplay_type" className="font-semibold text-lg">Define Custom Type</Label>
                                    <Input
                                        id="custom_roleplay_type"
                                        placeholder="e.g., Patient Intake, Dealer Onboarding, Support Escalation"
                                        value={customRoleplayType}
                                        onChange={(e) => setCustomRoleplayType(e.target.value)}
                                        className="mt-2 text-base"
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="buyer_awareness_level" className="font-semibold">Buyer Awareness Level</Label>
                                <p className="text-sm text-slate-600 mb-2">Define the buyer's current scenario — are they just aware of the problem, solution-aware, exploring options, or ready to buy?</p>
                                <Select value={formData.buyer_awareness_level} onValueChange={(v) => {
                                    handleInputChange('buyer_awareness_level', v);
                                    handleInputChange('roleplay_scenario', v);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Awareness Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleplayScenarios.map((scenario) => (
                                            <SelectItem key={scenario} value={scenario}>{scenario}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="selling_context" className="font-semibold text-base flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    What You're Selling to {formData.first_name || 'This Client'}
                                </Label>
                                <p className="text-sm text-slate-600 mb-3">
                                    Describe your company's offering and value proposition for this specific prospect.
                                </p>
                                <Textarea
                                    id="selling_context"
                                    placeholder="e.g., 'TechFlow provides a B2B SaaS platform for real-time data pipelines, serving mid-market to enterprise customers in fintech and marketplaces.'"
                                    value={formData.selling_context}
                                    onChange={(e) => handleInputChange('selling_context', e.target.value)}
                                    className="h-24"
                                />
                            </div>

                            <div>
                                <Label className="font-semibold text-base">Your Goal for This Call</Label>
                                <p className="text-sm text-slate-600 mb-3">Select common goals or describe your specific objective.</p>

                                {/* Quick select goal tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {callGoalTags.map(goal => (
                                        <MultiSelectTag
                                            key={goal}
                                            isSelected={formData.call_goal_tags.includes(goal)}
                                            onClick={() => handleMultiSelectChange('call_goal_tags', goal)}
                                        >
                                            {goal}
                                        </MultiSelectTag>
                                    ))}
                                </div>

                                {/* Description field */}
                                <Textarea
                                    id="call_goal"
                                    placeholder="Describe your primary objective for this practice call. e.g., 'My goal is to book a 15-minute discovery meeting by highlighting our value proposition for marketing teams.'"
                                    value={formData.call_goal}
                                    onChange={(e) => handleInputChange('call_goal', e.target.value)}
                                    className="h-24"
                                />
                            </div>
                        </CardContent>
                    </>
                );
            case 4: // Details (updated step number)
                return (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-blue-600" /> Bot Intelligence</CardTitle>
                            <CardDescription>Flesh out the bot's knowledge and behavior to ensure a realistic conversation. {formData.industry && `Focus on ${formData.industry}-specific challenges.`}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                             {formData.industry && industryProfiles[formData.industry] && (
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <h4 className="font-semibold text-amber-800 mb-2">Industry-Specific Suggestions</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-medium text-amber-700 mb-1">Common Pain Points:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {industryProfiles[formData.industry]?.commonPainPoints.map((pain, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = formData.priorities_and_objections;
                                                            const addition = current && current.trim() !== '' ? `\n• ${pain}` : `• ${pain}`;
                                                            setFormData(prev => ({ ...prev, priorities_and_objections: current + addition }));
                                                        }}
                                                        className="px-2 py-1 text-xs bg-white border border-amber-300 rounded hover:bg-amber-100"
                                                    >
                                                        + {pain}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-amber-700 mb-1">Typical Objections:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {industryProfiles[formData.industry]?.commonObjections.map((objection, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => {
                                                                const filteredObjections = prev.common_objections.filter(o => o.trim() !== '');
                                                                // Add only if not already present
                                                                if (!filteredObjections.includes(objection)) {
                                                                    return {
                                                                        ...prev,
                                                                        common_objections: [...filteredObjections, objection]
                                                                    };
                                                                }
                                                                return prev;
                                                            });
                                                        }}
                                                        className="px-2 py-1 text-xs bg-white border border-red-300 rounded hover:bg-red-100"
                                                    >
                                                        + {objection}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                             <div className="space-y-3">
                                <Label className="font-semibold text-base">Product Interest</Label>
                                <p className="text-sm text-slate-600">Select products the prospect might be interested in.</p>

                                {/* Pre-defined Products */}
                                <div className="flex flex-wrap gap-2">
                                    {products.map(product => (
                                        <MultiSelectTag
                                            key={product.id || product.name}
                                            isSelected={formData.product_interest.includes(product.name)}
                                            onClick={() => handleMultiSelectChange('product_interest', product.name)}
                                        >
                                            {product.name}
                                        </MultiSelectTag>
                                    ))}
                                </div>

                                {/* Custom Product Interest Input */}
                                <div className="space-y-2 mt-4">
                                    <Label className="text-sm font-medium text-slate-700">Add Custom Product/Feature Interest</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="custom_product_input" // Added an ID for easier referencing
                                            placeholder="e.g., Advanced Analytics, Custom Integrations, Mobile App..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const value = e.target.value.trim();
                                                    if (value && !formData.product_interest.includes(value)) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            product_interest: [...prev.product_interest, value]
                                                        }));
                                                        e.target.value = ''; // Clear input
                                                    }
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                const inputElement = document.getElementById('custom_product_input'); // Use ID to get input
                                                if (inputElement) {
                                                    const value = inputElement.value.trim();
                                                    if (value && !formData.product_interest.includes(value)) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            product_interest: [...prev.product_interest, value]
                                                        }));
                                                        inputElement.value = ''; // Clear input
                                                    }
                                                }
                                            }}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500">Press Enter or click + to add. Useful for specific features or custom solutions.</p>
                                </div>

                                {/* Selected Interests Display */}
                                {formData.product_interest.length > 0 && (
                                    <div className="space-y-2 mt-4"> {/* Added mt-4 for spacing */}
                                        <Label className="text-sm font-medium text-slate-700">Selected Interests:</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.product_interest.map((interest) => ( // Removed index, using interest as key for uniqueness
                                                <div key={interest} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                                                    <span>{interest}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                product_interest: prev.product_interest.filter(item => item !== interest)
                                                            }));
                                                        }}
                                                        className="ml-1 text-blue-500 hover:text-blue-700"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {products.length === 0 && (
                                    <div className="text-center py-4 text-slate-500">
                                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p className="text-sm">No products found.</p>
                                        <p className="text-xs">Add products in <Link to={createPageUrl('ProductManagement')} className="text-blue-600 hover:underline">Product Management</Link> first.</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="priorities_and_objections">Describe More: Prospect's Priorities & Pain Points</Label>
                                <Textarea
                                    id="priorities_and_objections"
                                    placeholder="Add any specific details. e.g., 'Priority: Reduce manual data entry. Pain Point: Inaccurate sales forecasting...'"
                                    value={formData.priorities_and_objections}
                                    onChange={(e) => handleInputChange('priorities_and_objections', e.target.value)}
                                    className="h-32"
                                />
                            </div>
                            <div>
                                <Label htmlFor="company_offerings_context">Describe More: Context About Your Company & Product</Label>
                                <Textarea
                                    id="company_offerings_context"
                                    placeholder="Provide brief context about your product so the bot can react realistically. e.g., 'We sell a CRM automation tool called 'ConnectSphere'...'"
                                    value={formData.company_offerings_context}
                                    onChange={(e) => handleInputChange('company_offerings_context', e.target.value)}
                                    className="h-32"
                                />
                            </div>
                        </CardContent>
                    </>
                );
            case 5: // Advanced Configuration (updated step number)
                return (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings className="text-blue-600" /> Advanced Configuration</CardTitle>
                            <CardDescription>Define buyer opinions and common objections for more realistic interactions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="font-semibold text-lg">Buyer Opinions</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addBuyerOpinion}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        ADD MORE
                                    </Button>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">List the specific problems the buyer agrees exist — one per line (e.g., pricing, timeline, lack of urgency, security concerns).</p>
                                <div className="space-y-3">
                                    {formData.buyer_opinions.map((opinion, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Textarea
                                                placeholder="e.g., Believes in the importance of continuous sales training."
                                                value={opinion}
                                                onChange={(e) => updateBuyerOpinion(index, e.target.value)}
                                                className="flex-1 h-16"
                                            />
                                            {formData.buyer_opinions.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeBuyerOpinion(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="font-semibold text-lg">Common Objections</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addCommonObjection}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        ADD MORE
                                    </Button>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">List objections you expect from the buyer — one per line (e.g., pricing, timeline, lack of urgency, security concerns).</p>
                                <div className="space-y-3">
                                    {formData.common_objections.map((objection, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Textarea
                                                placeholder="e.g., Concerned about the effectiveness of new sales tools."
                                                value={objection}
                                                onChange={(e) => updateCommonObjection(index, e.target.value)}
                                                className="flex-1 h-16"
                                            />
                                            {formData.common_objections.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeCommonObjection(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {(userRole === 'super_admin' || userRole === 'company_admin') && (
                                <div className="border-t pt-6">
                                    <Label className="font-semibold text-lg mb-3 block">Sharing Settings</Label>
                                    <p className="text-sm text-slate-600 mb-4">Control who can see and use this AI Client in your organization.</p>
                                    <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_users">All Users - Everyone in the organization can use this AI Client</SelectItem>
                                            <SelectItem value="specific_users">Specific Users - Select individual users who can access</SelectItem>
                                            <SelectItem value="creator_only">Only Me - Private, only you can use this AI Client</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardContent>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to={createPageUrl('AIRoleplayHistory')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Roleplay Analytics
                    </Link>
                    <h1 className="text-4xl font-bold text-slate-900">Create AI Client</h1>
                    <p className="text-slate-600 mt-1">Design a new AI Client tailored to your target industry and use case.</p>
                </div>

                {/* Stepper */}
                <div className="flex justify-between items-center mb-8 p-2 bg-slate-100 rounded-full">
                    {steps.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(index)}
                            className={`flex-1 flex justify-center items-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-colors cursor-pointer hover:bg-white/50 ${
                                currentStep === index ? 'bg-white text-blue-600 shadow' : 'text-slate-500 hover:text-slate-700'
                            } ${currentStep > index ? 'text-blue-700' : ''}`}
                        >
                            <step.icon className={`w-5 h-5 ${currentStep === index || currentStep > index ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="hidden sm:inline">{step.name}</span>
                        </button>
                    ))}
                </div>

                <Card className="shadow-xl border-t-4 border-blue-600">
                    {renderStepContent()}
                    {currentStep > 0 && (
                        <CardFooter className="flex justify-between p-6 bg-slate-50/70 border-t">
                            <Button variant="outline" onClick={prevStep}>Back</Button>
                            {currentStep < steps.length - 1 ? (
                                <Button onClick={nextStep} disabled={currentStep === 1 && !formData.industry}>Next</Button>
                            ) : (
                                <Button onClick={handleCreateBot} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                                    {isLoading ? 'Creating...' : 'Create Bot'}
                                </Button>
                            )}
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}
