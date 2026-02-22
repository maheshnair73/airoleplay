
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '@/api/entities';
import { Product } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    ArrowLeft,
    BrainCircuit,
    Building,
    User,
    Package,
    Loader2,
    Sparkles,
    Copy,
    Globe,
    Search,
    Users as UsersIcon,
    MessageSquare,
    Phone,
    Mic,
    ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

// LeadSelector component to choose which lead to prep for
const LeadSelector = ({ leads, onSelectLead, onSearch }) => {
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <UsersIcon className="w-6 h-6 text-blue-600" />
                    Select a Lead for AI Call Preparation
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Search leads by name or company..."
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {leads.length > 0 ? leads.map(lead => (
                        <div
                            key={lead.id}
                            onClick={() => onSelectLead(lead.id)}
                            className="flex justify-between items-center p-3 bg-slate-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        >
                            <div>
                                <p className="font-semibold text-slate-800">{lead.contact_name}</p>
                                <p className="text-sm text-slate-500">{lead.company_name}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {lead.status || 'new'}
                            </Badge>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-slate-500">
                            <p>No leads found.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function CallPreparation() {
    const navigate = useNavigate();
    
    // Simplified state management
    const [pageState, setPageState] = useState('loading'); // 'loading', 'selectLead', 'prepForm', 'error'
    const [lead, setLead] = useState(null);
    const [products, setProducts] = useState([]);
    const [allLeads, setAllLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
    const [generatedPitch, setGeneratedPitch] = useState(null);

    // Form data for pitch generation
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        companySize: '',
        website: '',
        recentNews: '',
        contactName: '',
        jobTitle: '',
        yearsExperience: '',
        painPoints: '',
        priorities: '',
        productInterest: '',
        currentSolution: '',
        budget: '',
        timeline: ''
    });

    // Initialize the page
    useEffect(() => {
        const initializePage = async () => {
            try {
                setPageState('loading');
                
                const urlParams = new URLSearchParams(window.location.search);
                const leadId = urlParams.get('leadId');

                if (leadId) {
                    // Load specific lead
                    const [leadData, productData] = await Promise.all([
                        Lead.get(leadId),
                        Product.filter({ is_active: true })
                    ]);

                    setLead(leadData);
                    setProducts(productData);

                    // Auto-populate form with lead data
                    setFormData({
                        companyName: leadData.company_name || '',
                        industry: leadData.industry || '',
                        companySize: leadData.company_size || '',
                        website: leadData.company_website || '',
                        recentNews: '',
                        contactName: leadData.contact_name || '',
                        jobTitle: leadData.contact_title || '',
                        yearsExperience: '',
                        painPoints: leadData.pain_points?.join(', ') || '',
                        priorities: '',
                        productInterest: leadData.product_interest || '',
                        currentSolution: '',
                        budget: leadData.budget_range || '',
                        timeline: leadData.timeline || ''
                    });

                    setPageState('prepForm');
                } else {
                    // Load leads for selection
                    const leadsData = await Lead.list('-created_at');
                    setAllLeads(leadsData);
                    setFilteredLeads(leadsData);
                    setPageState('selectLead');
                }
            } catch (err) {
                console.error('Error initializing page:', err);
                setError('Failed to load data. Please try again.');
                setPageState('error');
            }
        };

        initializePage();
    }, []); // No dependencies to avoid loops

    // Handle search filtering
    useEffect(() => {
        if (!searchTerm) {
            setFilteredLeads(allLeads);
        } else {
            const filtered = allLeads.filter(lead =>
                (lead.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLeads(filtered);
        }
    }, [searchTerm, allLeads]);

    // Load existing pitch if available when the lead changes
    useEffect(() => {
        if (lead && lead.ai_generated_intel) {
            setGeneratedPitch(lead.ai_generated_intel);
        } else {
            setGeneratedPitch(null); // Clear pitch if lead changes or has no intel
        }
    }, [lead]);

    const handleSelectLead = async (leadId) => {
        try {
            setPageState('loading');
            const [leadData, productData] = await Promise.all([
                Lead.get(leadId),
                Product.filter({ is_active: true })
            ]);

            setLead(leadData);
            setProducts(productData);
            // setGeneratedPitch(null); // This is now handled by the useEffect above reacting to `setLead(leadData)`

            // Auto-populate form
            setFormData({
                companyName: leadData.company_name || '',
                industry: leadData.industry || '',
                companySize: leadData.company_size || '',
                website: leadData.company_website || '',
                recentNews: '',
                contactName: leadData.contact_name || '',
                jobTitle: leadData.contact_title || '',
                yearsExperience: '',
                painPoints: leadData.pain_points?.join(', ') || '',
                priorities: '',
                productInterest: leadData.product_interest || '',
                currentSolution: '',
                budget: leadData.budget_range || '',
                timeline: leadData.timeline || ''
            });

            navigate(createPageUrl(`CallPreparation?leadId=${leadId}`), { replace: true });
            setPageState('prepForm');
        } catch (err) {
            console.error('Error loading lead:', err);
            setError('Failed to load lead data');
            setPageState('error');
        }
    };

    const handleBackToLeadSelection = () => {
        setLead(null);
        setGeneratedPitch(null);
        navigate(createPageUrl('CallPreparation'), { replace: true });
        setPageState('selectLead');
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateCustomPitch = async () => {
        setIsGeneratingPitch(true);
        try {
            const prompt = `You are an expert B2B sales professional. Create a highly personalized 30-second elevator pitch for the following prospect.

PROSPECT INFORMATION:
- Name: ${formData.contactName}
- Title: ${formData.jobTitle}
- Years of Experience: ${formData.yearsExperience || 'Not specified'}
- Company: ${formData.companyName}
- Industry: ${formData.industry}
- Company Size: ${formData.companySize}
- Website: ${formData.website}
- Recent Company News: ${formData.recentNews || 'None provided'}

PROSPECT CHALLENGES & CONTEXT:
- Known Pain Points: ${formData.painPoints}
- Business Priorities: ${formData.priorities || 'Not specified'}
- Current Solution: ${formData.currentSolution || 'Unknown'}
- Budget Range: ${formData.budget || 'Not disclosed'}
- Timeline: ${formData.timeline || 'Not specified'}

PRODUCT/SERVICE INTEREST:
${formData.productInterest || 'General interest in our solutions'}

AVAILABLE PRODUCTS/SERVICES:
${products.map(p => `- ${p.name}: ${p.description}`).join('\n')}

INSTRUCTIONS:
1. Use web research to find additional context about their company, industry trends, and potential challenges
2. Reference something specific about their role or company to show you've done your homework
3. Connect their likely challenges to our solution in a natural way
4. Keep it conversational and avoid being too salesy
5. End with a soft ask for their time or input
6. Make it feel authentic and personalized, not templated

Please create a comprehensive pitch package that includes:
- The main elevator pitch (30-40 seconds when spoken)
- 3-5 key talking points to elaborate if they're interested
- 2-3 discovery questions to ask after the pitch
- Potential objections they might raise and how to handle them
- A compelling reason why they should take the next step with you`;

            const response = await InvokeLLM({
                prompt: prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        elevator_pitch: {
                            type: "string",
                            description: "The main 30-40 second elevator pitch"
                        },
                        key_talking_points: {
                            type: "array",
                            items: { type: "string" },
                            description: "3-5 key points to elaborate on if prospect is interested"
                        },
                        discovery_questions: {
                            type: "array",
                            items: { type: "string" },
                            description: "2-3 strategic discovery questions to ask"
                        },
                        potential_objections: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    objection: { type: "string" },
                                    response: { type: "string" }
                                }
                            },
                            description: "Likely objections and responses"
                        },
                        next_step_reason: {
                            type: "string",
                            description: "Compelling reason for them to take next step"
                        },
                        personalization_notes: {
                            type: "string",
                            description: "Key insights used to personalize this pitch"
                        }
                    },
                    required: ["elevator_pitch", "key_talking_points", "discovery_questions"]
                }
            });

            // Save the generated pitch to the lead entity
            const updatedLead = await Lead.update(lead.id, {
                ai_generated_pitch: response.elevator_pitch,
                // Save the full pitch data as JSON in ai_generated_intel field
                ai_generated_intel: {
                    ...response,
                    generated_at: new Date().toISOString(),
                    form_data_used: formData
                }
            });

            // Update local state
            setLead(updatedLead);
            setGeneratedPitch(response);
            toast.success("Custom pitch generated and saved successfully!");

        } catch (error) {
            console.error('Error generating pitch:', error);
            toast.error('Failed to generate pitch. Please try again.');
        } finally {
            setIsGeneratingPitch(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    // Render different states
    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Always-visible header */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">AI Call Preparation</h1>
                        {lead ? (
                             <p className="text-sm text-slate-600">
                                Preparing for call with <span className="font-semibold text-slate-800">{lead.contact_name}</span> at <span className="font-semibold text-slate-800">{lead.company_name}</span>
                            </p>
                        ) : (
                            <p className="text-sm text-slate-600">Prepare for your sales calls with AI assistance</p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {pageState === 'loading' && (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-slate-600 mb-4">Loading...</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPageState('error')}
                            className="mt-2"
                        >
                            Stop Loading
                        </Button>
                    </div>
                </div>
            )}

            {pageState === 'error' && (
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4">⚠️ Error</div>
                    <p className="text-slate-600 mb-4">{error || 'Something went wrong'}</p>
                    <div className="space-x-2">
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Retry
                        </Button>
                        <Button onClick={() => navigate(createPageUrl('effyLeads'))} className="bg-blue-600 hover:bg-blue-700">
                            Go to Leads
                        </Button>
                    </div>
                </div>
            )}

            {pageState === 'selectLead' && (
                <LeadSelector
                    leads={filteredLeads}
                    onSelectLead={handleSelectLead}
                    onSearch={setSearchTerm}
                />
            )}

            {pageState === 'prepForm' && lead && (
                <>
                    <Tabs defaultValue="preparation" value={generatedPitch ? "script" : "preparation"} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="preparation" className="flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                Lead Information & Preparation
                            </TabsTrigger>
                            <TabsTrigger 
                                value="script" 
                                disabled={!generatedPitch}
                                className="flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Generated AI Script & Call Actions
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="preparation">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Input Form */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Building className="w-5 h-5 text-blue-600" />
                                                Company Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Company Name</label>
                                                    <Input
                                                        value={formData.companyName}
                                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                                        placeholder="Enter company name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Industry</label>
                                                    <Input
                                                        value={formData.industry}
                                                        onChange={(e) => handleInputChange('industry', e.target.value)}
                                                        placeholder="e.g., Technology, Healthcare"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Company Size</label>
                                                    <Input
                                                        value={formData.companySize}
                                                        onChange={(e) => handleInputChange('companySize', e.target.value)}
                                                        placeholder="e.g., 50-200 employees"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Website</label>
                                                    <Input
                                                        value={formData.website}
                                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                                        placeholder="company.com"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 mb-2 block">Recent Company News</label>
                                                <Textarea
                                                    value={formData.recentNews}
                                                    onChange={(e) => handleInputChange('recentNews', e.target.value)}
                                                    placeholder="Any recent funding, acquisitions, product launches, etc."
                                                    className="h-20"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-purple-600" />
                                                Contact Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Contact Name</label>
                                                    <Input
                                                        value={formData.contactName}
                                                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                                                        placeholder="Full name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Job Title</label>
                                                    <Input
                                                        value={formData.jobTitle}
                                                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                                        placeholder="e.g., VP of Sales, CTO"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 mb-2 block">Years of Experience (optional)</label>
                                                <Input
                                                        value={formData.yearsExperience}
                                                        onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                                                        placeholder="Approximate years in current role or industry"
                                                    />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 mb-2 block">Known Pain Points</label>
                                                <Textarea
                                                    value={formData.painPoints}
                                                    onChange={(e) => handleInputChange('painPoints', e.target.value)}
                                                    placeholder="What challenges are they facing? What keeps them up at night?"
                                                    className="h-20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 mb-2 block">Business Priorities</label>
                                                <Textarea
                                                    value={formData.priorities}
                                                    onChange={(e) => handleInputChange('priorities', e.target.value)}
                                                    placeholder="What are their key goals and objectives this year?"
                                                    className="h-20"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Package className="w-5 h-5 text-green-600" />
                                                Sales Context
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 mb-2 block">Product/Service Interest</label>
                                                <Textarea
                                                    value={formData.productInterest}
                                                    onChange={(e) => handleInputChange('productInterest', e.target.value)}
                                                    placeholder="What specific products or services are they interested in?"
                                                    className="h-20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 mb-2 block">Current Solution</label>
                                                <Input
                                                    value={formData.currentSolution}
                                                    onChange={(e) => handleInputChange('currentSolution', e.target.value)}
                                                    placeholder="What are they currently using? (competitors, manual processes, etc.)"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Budget Range</label>
                                                    <Input
                                                        value={formData.budget}
                                                        onChange={(e) => handleInputChange('budget', e.target.value)}
                                                        placeholder="e.g., $10K-$50K annually"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Timeline</label>
                                                    <Input
                                                        value={formData.timeline}
                                                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                                                        placeholder="e.g., Next quarter, Q2 2024"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Button
                                        onClick={generateCustomPitch}
                                        disabled={isGeneratingPitch || !formData.companyName || !formData.contactName}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold"
                                    >
                                        {isGeneratingPitch ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Generating Custom Pitch with AI Intelligence...
                                            </>
                                        ) : (
                                            <>
                                                <BrainCircuit className="w-5 h-5 mr-2" />
                                                <Globe className="w-4 h-4 mr-1" />
                                                Generate AI-Powered Custom Pitch
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Preview/Help section */}
                                <div className="space-y-6">
                                    <Card className="border-slate-200">
                                        <CardContent className="text-center py-12">
                                            <BrainCircuit className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-slate-600 mb-2">
                                                AI-Powered Pitch Generator Ready
                                            </h3>
                                            <p className="text-slate-500 mb-4">
                                                Fill in the prospect details and click generate to create a personalized sales pitch using AI intelligence and web research.
                                            </p>
                                            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                                                <Globe className="w-4 h-4" />
                                                <span>Powered by internet research + LLM intelligence</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="script">
                            {generatedPitch && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Generated Pitch Display - Takes up 2/3 of the space */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Sparkles className="w-5 h-5 text-blue-600" />
                                                            Your Custom Sales Script
                                                        </CardTitle>
                                                        {generatedPitch.personalization_notes && (
                                                            <p className="text-sm text-slate-600 mt-2">
                                                                <strong>AI Insights:</strong> {generatedPitch.personalization_notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Call Dropdown Button */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 gap-2">
                                                                <Phone className="w-4 h-4" />
                                                                Call
                                                                <ChevronDown className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem className="gap-2 py-3">
                                                                <Phone className="w-4 h-4" />
                                                                Call Now
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2 py-3">
                                                                <Mic className="w-4 h-4" />
                                                                Practice Pitch
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <Tabs defaultValue="pitch" className="w-full">
                                                    <TabsList className="grid w-full grid-cols-4">
                                                        <TabsTrigger value="pitch">Main Script</TabsTrigger>
                                                        <TabsTrigger value="talking-points">Key Points</TabsTrigger>
                                                        <TabsTrigger value="questions">Questions</TabsTrigger>
                                                        <TabsTrigger value="objections">Objections</TabsTrigger>
                                                    </TabsList>

                                                    <TabsContent value="pitch" className="space-y-4">
                                                        <div className="relative">
                                                            <div className="bg-white p-6 rounded-lg border">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                                                                        30-Second Elevator Pitch
                                                                    </Badge>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => copyToClipboard(generatedPitch.elevator_pitch)}
                                                                    >
                                                                        <Copy className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                                <p className="text-slate-800 leading-relaxed text-lg font-medium italic">
                                                                    "{generatedPitch.elevator_pitch}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TabsContent>

                                                    <TabsContent value="talking-points" className="space-y-4">
                                                        <div className="bg-white p-6 rounded-lg border">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h4 className="font-semibold text-slate-800">Key Talking Points</h4>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => copyToClipboard(generatedPitch.key_talking_points.join('\n\n'))}
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {generatedPitch.key_talking_points.map((point, index) => (
                                                                    <div key={index} className="flex items-start gap-3">
                                                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center flex-shrink-0">
                                                                            {index + 1}
                                                                        </div>
                                                                        <p className="text-slate-700">{point}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TabsContent>

                                                    <TabsContent value="questions" className="space-y-4">
                                                        <div className="bg-white p-6 rounded-lg border">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h4 className="font-semibold text-slate-800">Discovery Questions</h4>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => copyToClipboard(generatedPitch.discovery_questions.join('\n\n'))}
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {generatedPitch.discovery_questions.map((question, index) => (
                                                                    <div key={index} className="flex items-start gap-3">
                                                                        <MessageSquare className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                                        <p className="text-slate-700 font-medium">"{question}"</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TabsContent>

                                                    <TabsContent value="objections" className="space-y-4">
                                                        <div className="bg-white p-6 rounded-lg border">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h4 className="font-semibold text-slate-800">Potential Objections & Responses</h4>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => copyToClipboard(
                                                                        generatedPitch.potential_objections?.map(obj =>
                                                                            `Objection: ${obj.objection}\nResponse: ${obj.response}`
                                                                        ).join('\n\n') || ''
                                                                    )}
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-4">
                                                                {generatedPitch.potential_objections?.map((item, index) => (
                                                                    <div key={index} className="border-l-4 border-orange-200 pl-4 py-2">
                                                                        <p className="font-medium text-orange-800 mb-2">
                                                                            🚫 "{item.objection}"
                                                                        </p>
                                                                        <p className="text-slate-700">
                                                                            💡 {item.response}
                                                                        </p>
                                                                    </div>
                                                                )) || (
                                                                    <p className="text-slate-500">No specific objections predicted for this prospect.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TabsContent>
                                                </Tabs>

                                                {generatedPitch.next_step_reason && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                                        <h4 className="font-semibold text-green-800 mb-2">💡 Next Step Strategy</h4>
                                                        <p className="text-green-700">{generatedPitch.next_step_reason}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Empty space where sidebar was - now removed */}
                                    <div className="space-y-6">
                                        {/* Sidebar content removed as requested */}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}
