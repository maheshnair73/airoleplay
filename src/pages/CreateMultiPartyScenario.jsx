import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    Users, Plus, X, Loader2, ArrowLeft, Save,
    UserCheck, Settings, DollarSign, Target, TrendingUp, Shield,
    Briefcase, Headphones, Award, UserCog
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateMultiPartyScenario() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [scenarioData, setScenarioData] = useState({
        scenario_name: '',
        scenario_description: '',
        scenario_type: 'panel_interview',
        difficulty_level: 'intermediate',
        buyer_personas: [],
        seller_personas: [],
        conversation_dynamics: {
            allow_ai_interruptions: true,
            allow_ai_internal_dialogue: true,
            allow_seller_collaboration: true,
            turn_taking_style: 'organic',
            conflict_level: 'medium'
        },
        team_selling_objectives: [],
        learning_objectives: [],
        success_criteria: [],
        estimated_duration_minutes: 30,
        industry: '',
        tags: [],
        is_template: false
    });

    const [newBuyerPersona, setNewBuyerPersona] = useState({
        name: '',
        title: '',
        company_name: '',
        personality: 'Nice',
        gender: 'Female',
        role_in_scenario: 'primary_decision_maker',
        key_concerns: [],
        pain_points: [],
        agenda: '',
        likely_objections: [],
        interaction_style: '',
        is_ai: true
    });

    const [newSellerPersona, setNewSellerPersona] = useState({
        name: '',
        sales_role: 'account_executive',
        title: '',
        personality: 'Consultative',
        gender: 'Male',
        expertise_areas: [],
        responsibilities: '',
        interaction_style: '',
        is_ai: true
    });

    const [newObjective, setNewObjective] = useState('');
    const [newTeamObjective, setNewTeamObjective] = useState('');
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (editId) {
            loadScenario();
        }
    }, [editId]);

    const loadScenario = async () => {
        setIsLoading(true);
        try {
            const scenario = await base44.entities.MultiPartyScenario.get(editId);
            setScenarioData({
                ...scenario,
                buyer_personas: scenario.buyer_personas || [],
                seller_personas: scenario.seller_personas || [],
                conversation_dynamics: {
                    allow_ai_interruptions: true,
                    allow_ai_internal_dialogue: true,
                    allow_seller_collaboration: true,
                    turn_taking_style: 'organic',
                    conflict_level: 'medium',
                    ...scenario.conversation_dynamics
                },
                learning_objectives: scenario.learning_objectives || [],
                team_selling_objectives: scenario.team_selling_objectives || [],
                tags: scenario.tags || []
            });
        } catch (error) {
            console.error('Error loading scenario:', error);
            toast.error('Failed to load scenario');
        } finally {
            setIsLoading(false);
        }
    };

    const addBuyerPersona = () => {
        if (!newBuyerPersona.name || !newBuyerPersona.title) {
            toast.error('Please enter buyer persona name and title');
            return;
        }

        setScenarioData(prev => ({
            ...prev,
            buyer_personas: [...prev.buyer_personas, { ...newBuyerPersona, persona_id: Date.now().toString() }]
        }));

        setNewBuyerPersona({
            name: '',
            title: '',
            company_name: '',
            personality: 'Nice',
            gender: 'Female',
            role_in_scenario: 'primary_decision_maker',
            key_concerns: [],
            pain_points: [],
            agenda: '',
            likely_objections: [],
            interaction_style: '',
            is_ai: true
        });
    };

    const addSellerPersona = () => {
        if (!newSellerPersona.name) {
            toast.error('Please enter seller persona name');
            return;
        }

        setScenarioData(prev => ({
            ...prev,
            seller_personas: [...prev.seller_personas, { ...newSellerPersona, persona_id: Date.now().toString() }]
        }));

        setNewSellerPersona({
            name: '',
            sales_role: 'account_executive',
            title: '',
            personality: 'Consultative',
            gender: 'Male',
            expertise_areas: [],
            responsibilities: '',
            interaction_style: '',
            is_ai: true
        });
    };

    const removeBuyerPersona = (personaId) => {
        setScenarioData(prev => ({
            ...prev,
            buyer_personas: prev.buyer_personas.filter(p => p.persona_id !== personaId)
        }));
    };

    const removeSellerPersona = (personaId) => {
        setScenarioData(prev => ({
            ...prev,
            seller_personas: prev.seller_personas.filter(p => p.persona_id !== personaId)
        }));
    };

    const addLearningObjective = () => {
        if (!newObjective.trim()) return;
        setScenarioData(prev => ({
            ...prev,
            learning_objectives: [...prev.learning_objectives, newObjective.trim()]
        }));
        setNewObjective('');
    };

    const addTeamObjective = () => {
        if (!newTeamObjective.trim()) return;
        setScenarioData(prev => ({
            ...prev,
            team_selling_objectives: [...(prev.team_selling_objectives || []), newTeamObjective.trim()]
        }));
        setNewTeamObjective('');
    };

    const removeLearningObjective = (index) => {
        setScenarioData(prev => ({
            ...prev,
            learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
        }));
    };

    const removeTeamObjective = (index) => {
        setScenarioData(prev => ({
            ...prev,
            team_selling_objectives: (prev.team_selling_objectives || []).filter((_, i) => i !== index)
        }));
    };

    const addTag = () => {
        if (!newTag.trim()) return;
        setScenarioData(prev => ({
            ...prev,
            tags: [...prev.tags, newTag.trim()]
        }));
        setNewTag('');
    };

    const removeTag = (index) => {
        setScenarioData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (!scenarioData.scenario_name) {
            toast.error('Please enter a scenario name');
            return;
        }

        const totalPersonas = (scenarioData.buyer_personas?.length || 0) + (scenarioData.seller_personas?.length || 0);
        if (totalPersonas < 2) {
            toast.error('Please add at least 2 personas (buyers and/or sellers) for multi-party roleplay');
            return;
        }

        setIsSaving(true);
        try {
            if (editId) {
                await base44.entities.MultiPartyScenario.update(editId, scenarioData);
                toast.success('Scenario updated successfully');
            } else {
                await base44.entities.MultiPartyScenario.create(scenarioData);
                toast.success('Scenario created successfully');
            }
            navigate(createPageUrl('MultiPartyRoleplay'));
        } catch (error) {
            console.error('Error saving scenario:', error);
            toast.error('Failed to save scenario');
        } finally {
            setIsSaving(false);
        }
    };

    const getBuyerRoleIcon = (role) => {
        const icons = {
            primary_decision_maker: <UserCheck className="w-4 h-4" />,
            technical_evaluator: <Settings className="w-4 h-4" />,
            financial_approver: <DollarSign className="w-4 h-4" />,
            end_user: <Target className="w-4 h-4" />,
            influencer: <TrendingUp className="w-4 h-4" />,
            blocker: <Shield className="w-4 h-4" />,
            champion: <Award className="w-4 h-4" />
        };
        return icons[role] || <Users className="w-4 h-4" />;
    };

    const getSellerRoleIcon = (role) => {
        const icons = {
            account_executive: <Briefcase className="w-4 h-4" />,
            sales_engineer: <Settings className="w-4 h-4" />,
            solutions_consultant: <Headphones className="w-4 h-4" />,
            sales_manager: <UserCog className="w-4 h-4" />,
            sdr: <Target className="w-4 h-4" />,
            customer_success: <UserCheck className="w-4 h-4" />,
            presales_specialist: <Award className="w-4 h-4" />
        };
        return icons[role] || <Users className="w-4 h-4" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(createPageUrl('MultiPartyRoleplay'))}
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Multi-Party Roleplay
                    </button>
                    
                    <h1 className="text-4xl font-bold text-slate-900">
                        {editId ? 'Edit' : 'Create'} Multi-Party Scenario
                    </h1>
                    <p className="text-slate-600 mt-2">Design a complex team selling scenario with multiple stakeholders</p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Scenario Name *</Label>
                            <Input
                                value={scenarioData.scenario_name}
                                onChange={(e) => setScenarioData(prev => ({ ...prev, scenario_name: e.target.value }))}
                                placeholder="e.g., Enterprise Panel Interview with Sales Team"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={scenarioData.scenario_description}
                                onChange={(e) => setScenarioData(prev => ({ ...prev, scenario_description: e.target.value }))}
                                placeholder="Describe what this scenario simulates..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Scenario Type</Label>
                                <Select
                                    value={scenarioData.scenario_type}
                                    onValueChange={(value) => setScenarioData(prev => ({ ...prev, scenario_type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="panel_interview">Panel Interview</SelectItem>
                                        <SelectItem value="team_negotiation">Team Negotiation</SelectItem>
                                        <SelectItem value="executive_meeting">Executive Meeting</SelectItem>
                                        <SelectItem value="group_demo">Group Demo</SelectItem>
                                        <SelectItem value="discovery_call">Discovery Call</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Difficulty Level</Label>
                                <Select
                                    value={scenarioData.difficulty_level}
                                    onValueChange={(value) => setScenarioData(prev => ({ ...prev, difficulty_level: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Industry</Label>
                                <Input
                                    value={scenarioData.industry}
                                    onChange={(e) => setScenarioData(prev => ({ ...prev, industry: e.target.value }))}
                                    placeholder="e.g., Healthcare, SaaS"
                                />
                            </div>

                            <div>
                                <Label>Estimated Duration (minutes)</Label>
                                <Input
                                    type="number"
                                    value={scenarioData.estimated_duration_minutes}
                                    onChange={(e) => setScenarioData(prev => ({ ...prev, estimated_duration_minutes: parseInt(e.target.value) }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Scenario Participants *</CardTitle>
                        <CardDescription>Add buyer personas (prospects/clients) and seller personas (your sales team)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="buyers" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="buyers">
                                    Buyer Personas ({scenarioData.buyer_personas?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="sellers">
                                    Sales Team ({scenarioData.seller_personas?.length || 0})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="buyers">
                                {scenarioData.buyer_personas?.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        {scenarioData.buyer_personas.map((persona) => (
                                            <div key={persona.persona_id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded">
                                                        {getBuyerRoleIcon(persona.role_in_scenario)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold">{persona.name}</p>
                                                            <Badge variant="outline" className="text-xs">
                                                                {persona.is_ai ? 'AI' : 'Human'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-600">{persona.title} | {persona.personality}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeBuyerPersona(persona.persona_id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t pt-6 space-y-4">
                                    <h4 className="font-semibold text-slate-700">Add Buyer Persona</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Name *</Label>
                                            <Input
                                                value={newBuyerPersona.name}
                                                onChange={(e) => setNewBuyerPersona(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="e.g., Sarah Chen"
                                            />
                                        </div>

                                        <div>
                                            <Label>Title *</Label>
                                            <Input
                                                value={newBuyerPersona.title}
                                                onChange={(e) => setNewBuyerPersona(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="e.g., Chief Financial Officer"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Role in Scenario</Label>
                                            <Select
                                                value={newBuyerPersona.role_in_scenario}
                                                onValueChange={(value) => setNewBuyerPersona(prev => ({ ...prev, role_in_scenario: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="primary_decision_maker">Primary Decision Maker</SelectItem>
                                                    <SelectItem value="technical_evaluator">Technical Evaluator</SelectItem>
                                                    <SelectItem value="financial_approver">Financial Approver</SelectItem>
                                                    <SelectItem value="end_user">End User</SelectItem>
                                                    <SelectItem value="influencer">Influencer</SelectItem>
                                                    <SelectItem value="blocker">Blocker</SelectItem>
                                                    <SelectItem value="champion">Champion</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Personality</Label>
                                            <Select
                                                value={newBuyerPersona.personality}
                                                onValueChange={(value) => setNewBuyerPersona(prev => ({ ...prev, personality: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Nice">Nice</SelectItem>
                                                    <SelectItem value="Rude">Rude</SelectItem>
                                                    <SelectItem value="Analytical">Analytical</SelectItem>
                                                    <SelectItem value="Formal">Formal</SelectItem>
                                                    <SelectItem value="Chatty">Chatty</SelectItem>
                                                    <SelectItem value="Skeptical">Skeptical</SelectItem>
                                                    <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Gender</Label>
                                            <Select
                                                value={newBuyerPersona.gender}
                                                onValueChange={(value) => setNewBuyerPersona(prev => ({ ...prev, gender: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Agenda / What They Care About</Label>
                                        <Textarea
                                            value={newBuyerPersona.agenda}
                                            onChange={(e) => setNewBuyerPersona(prev => ({ ...prev, agenda: e.target.value }))}
                                            placeholder="e.g., Ensure the solution fits within Q3 budget and shows clear ROI within 6 months"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={newBuyerPersona.is_ai}
                                            onCheckedChange={(checked) => setNewBuyerPersona(prev => ({ ...prev, is_ai: checked }))}
                                        />
                                        <Label>AI-controlled (uncheck if human participant will play this role)</Label>
                                    </div>

                                    <Button onClick={addBuyerPersona} className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Buyer Persona
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="sellers">
                                {scenarioData.seller_personas?.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        {scenarioData.seller_personas.map((persona) => (
                                            <div key={persona.persona_id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-100 rounded">
                                                        {getSellerRoleIcon(persona.sales_role)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold">{persona.name}</p>
                                                            <Badge variant="outline" className="text-xs">
                                                                {persona.is_ai ? 'AI' : 'Human'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-600">
                                                            {persona.sales_role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} | {persona.personality}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSellerPersona(persona.persona_id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t pt-6 space-y-4">
                                    <h4 className="font-semibold text-slate-700">Add Sales Team Member</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Name *</Label>
                                            <Input
                                                value={newSellerPersona.name}
                                                onChange={(e) => setNewSellerPersona(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="e.g., Mike Johnson"
                                            />
                                        </div>

                                        <div>
                                            <Label>Title</Label>
                                            <Input
                                                value={newSellerPersona.title}
                                                onChange={(e) => setNewSellerPersona(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="e.g., Senior Account Executive"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Sales Role</Label>
                                            <Select
                                                value={newSellerPersona.sales_role}
                                                onValueChange={(value) => setNewSellerPersona(prev => ({ ...prev, sales_role: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="account_executive">Account Executive</SelectItem>
                                                    <SelectItem value="sales_engineer">Sales Engineer</SelectItem>
                                                    <SelectItem value="solutions_consultant">Solutions Consultant</SelectItem>
                                                    <SelectItem value="sales_manager">Sales Manager</SelectItem>
                                                    <SelectItem value="sdr">SDR</SelectItem>
                                                    <SelectItem value="customer_success">Customer Success</SelectItem>
                                                    <SelectItem value="presales_specialist">Presales Specialist</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Style</Label>
                                            <Select
                                                value={newSellerPersona.personality}
                                                onValueChange={(value) => setNewSellerPersona(prev => ({ ...prev, personality: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Consultative">Consultative</SelectItem>
                                                    <SelectItem value="Aggressive">Aggressive</SelectItem>
                                                    <SelectItem value="Technical">Technical</SelectItem>
                                                    <SelectItem value="Relationship-focused">Relationship-focused</SelectItem>
                                                    <SelectItem value="Data-driven">Data-driven</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Gender</Label>
                                            <Select
                                                value={newSellerPersona.gender}
                                                onValueChange={(value) => setNewSellerPersona(prev => ({ ...prev, gender: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Responsibilities in This Meeting</Label>
                                        <Textarea
                                            value={newSellerPersona.responsibilities}
                                            onChange={(e) => setNewSellerPersona(prev => ({ ...prev, responsibilities: e.target.value }))}
                                            placeholder="e.g., Lead the discovery phase, then hand off to Sales Engineer for technical questions"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={newSellerPersona.is_ai}
                                            onCheckedChange={(checked) => setNewSellerPersona(prev => ({ ...prev, is_ai: checked }))}
                                        />
                                        <Label>AI teammate (uncheck if human participant will play this role)</Label>
                                    </div>

                                    <Button onClick={addSellerPersona} className="w-full bg-green-600 hover:bg-green-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Sales Team Member
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Conversation Dynamics</CardTitle>
                        <CardDescription>Control how AI personas interact</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Allow AI Interruptions</Label>
                                <p className="text-sm text-slate-500">AI personas can interrupt each other or humans</p>
                            </div>
                            <Switch
                                checked={scenarioData.conversation_dynamics.allow_ai_interruptions}
                                onCheckedChange={(checked) => setScenarioData(prev => ({
                                    ...prev,
                                    conversation_dynamics: { ...prev.conversation_dynamics, allow_ai_interruptions: checked }
                                }))}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Allow Seller Collaboration</Label>
                                <p className="text-sm text-slate-500">Sales team members can coordinate with each other during the call</p>
                            </div>
                            <Switch
                                checked={scenarioData.conversation_dynamics.allow_seller_collaboration}
                                onCheckedChange={(checked) => setScenarioData(prev => ({
                                    ...prev,
                                    conversation_dynamics: { ...prev.conversation_dynamics, allow_seller_collaboration: checked }
                                }))}
                            />
                        </div>

                        <div>
                            <Label>Turn-Taking Style</Label>
                            <Select
                                value={scenarioData.conversation_dynamics.turn_taking_style}
                                onValueChange={(value) => setScenarioData(prev => ({
                                    ...prev,
                                    conversation_dynamics: { ...prev.conversation_dynamics, turn_taking_style: value }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="structured">Structured (Takes turns)</SelectItem>
                                    <SelectItem value="organic">Organic (Natural flow)</SelectItem>
                                    <SelectItem value="chaotic">Chaotic (Everyone talks at once)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Conflict Level</Label>
                            <Select
                                value={scenarioData.conversation_dynamics.conflict_level}
                                onValueChange={(value) => setScenarioData(prev => ({
                                    ...prev,
                                    conversation_dynamics: { ...prev.conversation_dynamics, conflict_level: value }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low (Aligned stakeholders)</SelectItem>
                                    <SelectItem value="medium">Medium (Some disagreement)</SelectItem>
                                    <SelectItem value="high">High (Conflicting priorities)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Learning Objectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="general">General Skills</TabsTrigger>
                                <TabsTrigger value="team">Team Selling</TabsTrigger>
                            </TabsList>

                            <TabsContent value="general">
                                {scenarioData.learning_objectives?.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {scenarioData.learning_objectives.map((objective, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <p className="text-sm">{objective}</p>
                                                <Button variant="ghost" size="sm" onClick={() => removeLearningObjective(idx)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input
                                        value={newObjective}
                                        onChange={(e) => setNewObjective(e.target.value)}
                                        placeholder="e.g., Practice addressing multiple stakeholder concerns"
                                        onKeyPress={(e) => e.key === 'Enter' && addLearningObjective()}
                                    />
                                    <Button onClick={addLearningObjective}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="team">
                                {scenarioData.team_selling_objectives?.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {scenarioData.team_selling_objectives.map((objective, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <p className="text-sm">{objective}</p>
                                                <Button variant="ghost" size="sm" onClick={() => removeTeamObjective(idx)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input
                                        value={newTeamObjective}
                                        onChange={(e) => setNewTeamObjective(e.target.value)}
                                        placeholder="e.g., Practice smooth hand-offs between AE and Sales Engineer"
                                        onKeyPress={(e) => e.key === 'Enter' && addTeamObjective()}
                                    />
                                    <Button onClick={addTeamObjective}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {scenarioData.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {scenarioData.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="gap-2">
                                        {tag}
                                        <button onClick={() => removeTag(idx)}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add tag (e.g., team-selling, enterprise)"
                                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            />
                            <Button onClick={addTag}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => navigate(createPageUrl('MultiPartyRoleplay'))}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {editId ? 'Update' : 'Create'} Scenario
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}