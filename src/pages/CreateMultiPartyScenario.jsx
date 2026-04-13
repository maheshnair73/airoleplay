import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MultiPartyScenario } from '@/api/entities';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import {
    Users, Plus, X, Loader2, ArrowLeft, Save,
    UserCheck, Settings, DollarSign, Target, TrendingUp, Shield,
    Briefcase, Headphones, Award, UserCog,
    Upload, BookOpen, CheckCircle2, Link as LinkIcon, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { ParticipantsSection } from '@/components/scenario/ParticipantsSection';
import { ConversationDynamicsSection } from '@/components/scenario/ConversationDynamicsSection';

const MATERIAL_CATEGORIES = [
    'Product Knowledge', 'Sales Methodology', 'Objection Handling',
    'Discovery Questions', 'Closing Techniques', 'Industry Knowledge',
    'Compliance', 'Case Studies', 'General Training'
];

export default function CreateMultiPartyScenario() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [personaGroupName, setPersonaGroupName] = useState('Sales Team');
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

    const [knowledgeMaterials, setKnowledgeMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadTab, setUploadTab] = useState('file');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [newMaterial, setNewMaterial] = useState({
        title: '', description: '', material_type: 'document',
        file_url: '', content_text: '', category: 'General Training'
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (editId) {
            loadScenario();
        }
        const loadMaterials = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
                const { data } = await supabase.from('roleplay_knowledge_materials').select('*').eq('is_active', true).order('created_date', { ascending: false });
                setKnowledgeMaterials(data || []);
            } catch (e) {}
        };
        loadMaterials();
    }, [editId]);

    const loadScenario = async () => {
        setIsLoading(true);
        try {
            const scenario = await MultiPartyScenario.get(editId);
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

    const toggleMaterial = (id) => setSelectedMaterials(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleFileUpload = async (file) => {
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) { toast.error('File size exceeds 50MB limit'); return; }
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `knowledge-materials/${currentUser?.company_id || 'public'}/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { cacheControl: '3600', upsert: false });
            if (uploadError) throw new Error(uploadError.message || 'Upload failed');
            const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
            const titleGuess = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            setNewMaterial(prev => ({
                ...prev, file_url: publicUrl, title: prev.title || titleGuess,
                material_type: ['mp4', 'mov', 'avi'].includes(fileExt) ? 'video' : ['mp3', 'wav', 'm4a'].includes(fileExt) ? 'audio' : 'document'
            }));
            toast.success('File uploaded — add a title and save');
        } catch (error) { toast.error(error.message || 'Failed to upload file'); }
        finally { setIsUploading(false); }
    };

    const handleSaveMaterial = async () => {
        if (!newMaterial.title.trim()) { toast.error('Please enter a title'); return; }
        if (newMaterial.material_type === 'text' && !newMaterial.content_text.trim()) { toast.error('Please enter the text content'); return; }
        if (newMaterial.material_type !== 'text' && !newMaterial.file_url.trim()) { toast.error('Please upload a file or enter a URL'); return; }
        try {
            const { data, error } = await supabase.from('roleplay_knowledge_materials').insert({
                ...newMaterial, uploaded_by: currentUser?.email || '', company_id: currentUser?.company_id, is_active: true
            }).select().single();
            if (error) throw error;
            setKnowledgeMaterials(prev => [data, ...prev]);
            setSelectedMaterials(prev => [...prev, data.id]);
            setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'General Training' });
            setUploadTab('file');
            setShowUploadModal(false);
            toast.success('Material added and selected');
        } catch (error) { toast.error('Failed to save material'); }
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
                await MultiPartyScenario.update(editId, scenarioData);
                toast.success('Scenario updated successfully');
            } else {
                await MultiPartyScenario.create(scenarioData);
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
        <>
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

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-6 mb-6">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="participants">Participants</TabsTrigger>
                        <TabsTrigger value="dynamics">Dynamics</TabsTrigger>
                        <TabsTrigger value="objectives">Objectives</TabsTrigger>
                        <TabsTrigger value="tags">Tags</TabsTrigger>
                        <TabsTrigger value="materials" className="flex items-center gap-1">
                            Materials
                            {selectedMaterials.length > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{selectedMaterials.length}</span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic">
                        <Card>
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
                    </TabsContent>

                    <TabsContent value="participants">
                        <ParticipantsSection
                            buyerPersonas={scenarioData.buyer_personas}
                            sellerPersonas={scenarioData.seller_personas}
                            groupName={personaGroupName}
                            onGroupNameChange={setPersonaGroupName}
                            onAddBuyer={(persona) => {
                                setScenarioData(prev => ({
                                    ...prev,
                                    buyer_personas: [...prev.buyer_personas, { ...persona, persona_id: Date.now().toString() }]
                                }));
                            }}
                            onAddSeller={(persona) => {
                                setScenarioData(prev => ({
                                    ...prev,
                                    seller_personas: [...prev.seller_personas, { ...persona, persona_id: Date.now().toString() }]
                                }));
                            }}
                            onRemoveBuyer={removeBuyerPersona}
                            onRemoveSeller={removeSellerPersona}
                        />
                    <TabsContent value="dynamics">
                        <ConversationDynamicsSection
                            dynamics={scenarioData.conversation_dynamics}
                            onChange={(dynamics) => setScenarioData(prev => ({ ...prev, conversation_dynamics: dynamics }))}
                        />
                    </TabsContent>

                        <Card>
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
                    </TabsContent>

                    <TabsContent value="objectives">
                        <Card>
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
                    </TabsContent>

                    <TabsContent value="tags">
                        <Card>
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
                    </TabsContent>
                    <TabsContent value="materials">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Training Materials</CardTitle>
                                        <CardDescription>Upload documents or content for the AI to learn from during this scenario</CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'General Training' });
                                            setUploadTab('file');
                                            setShowUploadModal(true);
                                        }}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Material
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {knowledgeMaterials.length > 0 ? (
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                        {knowledgeMaterials.map(material => (
                                            <div
                                                key={material.id}
                                                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedMaterials.includes(material.id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                                                onClick={() => toggleMaterial(material.id)}
                                            >
                                                <Checkbox checked={selectedMaterials.includes(material.id)} onCheckedChange={() => toggleMaterial(material.id)} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{material.title}</div>
                                                    <div className="text-sm text-muted-foreground">{material.material_type} • {material.category}</div>
                                                </div>
                                                {selectedMaterials.includes(material.id) && <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                        onClick={() => { setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'General Training' }); setUploadTab('file'); setShowUploadModal(true); }}
                                    >
                                        <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                        <p className="font-medium text-gray-700">No materials yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">Upload training content so the AI buyers are primed with the right context for this scenario</p>
                                        <Button type="button" variant="outline" size="sm" className="mt-4"><Upload className="w-4 h-4 mr-2" />Upload Material</Button>
                                    </div>
                                )}
                                {selectedMaterials.length > 0 && (
                                    <p className="text-sm text-blue-700 font-medium mt-3">{selectedMaterials.length} material{selectedMaterials.length !== 1 ? 's' : ''} selected</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex gap-3 justify-end mt-6">
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

        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Training Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Tabs value={uploadTab} onValueChange={setUploadTab}>
                        <TabsList className="grid grid-cols-3 w-full">
                            <TabsTrigger value="file"><Upload className="w-4 h-4 mr-1.5" />File</TabsTrigger>
                            <TabsTrigger value="url"><LinkIcon className="w-4 h-4 mr-1.5" />URL</TabsTrigger>
                            <TabsTrigger value="text"><FileText className="w-4 h-4 mr-1.5" />Text</TabsTrigger>
                        </TabsList>
                        <TabsContent value="file" className="mt-3">
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /><p className="text-sm text-muted-foreground">Uploading...</p></div>
                                ) : newMaterial.file_url && uploadTab === 'file' ? (
                                    <div className="flex flex-col items-center gap-2"><CheckCircle2 className="w-8 h-8 text-green-600" /><p className="text-sm font-medium text-green-700">Uploaded — click to replace</p></div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="font-medium text-gray-700">Drop file here or click to browse</p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT, MP4, MP3, WAV — up to 50MB</p>
                                    </>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.mp4,.mp3,.wav,.m4a,.mov" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                        </TabsContent>
                        <TabsContent value="url" className="mt-3">
                            <div className="space-y-2">
                                <Label>Document or Video URL</Label>
                                <Input placeholder="https://..." value={newMaterial.file_url} onChange={(e) => setNewMaterial(prev => ({ ...prev, file_url: e.target.value }))} />
                            </div>
                        </TabsContent>
                        <TabsContent value="text" className="mt-3">
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea placeholder="Paste scenario background, industry context, product info..." rows={5} value={newMaterial.content_text} onChange={(e) => setNewMaterial(prev => ({ ...prev, content_text: e.target.value, material_type: 'text' }))} />
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="space-y-3 pt-2 border-t">
                        <div>
                            <Label>Title *</Label>
                            <Input placeholder="e.g., Industry Background Brief" value={newMaterial.title} onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Category</Label>
                                <Select value={newMaterial.category} onValueChange={(v) => setNewMaterial(prev => ({ ...prev, category: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{MATERIAL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select value={newMaterial.material_type} onValueChange={(v) => setNewMaterial(prev => ({ ...prev, material_type: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="document">Document</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="audio">Audio</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                        <Button type="button" onClick={handleSaveMaterial} disabled={isUploading}>
                            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            Save & Add to Scenario
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}