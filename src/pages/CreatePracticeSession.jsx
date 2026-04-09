import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { PracticeSession, PracticeMaterial, PracticeParticipant, User, RoleplayBot, Challenge } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Users, Clock, Video, Mic, Monitor, Settings, BookOpen,
  Plus, X, Trophy, Target, Bot, UserPlus, Calendar, Sparkles,
  Upload, FileText, Link as LinkIcon, Loader2, CheckCircle2
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';

const MATERIAL_CATEGORIES = [
  'Product Knowledge', 'Sales Methodology', 'Objection Handling',
  'Discovery Questions', 'Closing Techniques', 'Industry Knowledge',
  'Compliance', 'Case Studies', 'General Training'
];

export default function CreatePracticeSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [aiClients, setAiClients] = useState([]);
  const [knowledgeMaterials, setKnowledgeMaterials] = useState([]);
  const [challenges, setChallenges] = useState([]);

  const [session, setSession] = useState({
    session_name: '',
    practice_mode: 'solo_ai',
    task_type: 'audio',
    scenario: '',
    difficulty: 'intermediate',
    duration_seconds: 600,
    language: 'english',
    status: 'draft',
    scheduled_for: '',
    due_date: '',
    requires_material_review: false,
    materials_reviewed: false,
    evaluation_config: {
      criteria: [
        { name: 'Communication Clarity', weight: 25, description: 'Clear and articulate communication' },
        { name: 'Value Proposition', weight: 25, description: 'Effectively articulated value' },
        { name: 'Objection Handling', weight: 25, description: 'Addressed concerns professionally' },
        { name: 'Closing Technique', weight: 25, description: 'Strong call to action' }
      ],
      ai_enabled: true,
      peer_enabled: false,
      manager_required: false,
      self_evaluation: true
    },
    gamification_config: {
      enabled: false,
      points: 0,
      challenge_id: null
    },
    ai_config: {
      bot_ids: [],
      voice_settings: {
        speed: 1.0,
        pitch: 1.0
      }
    },
    meeting_details: null,
    metadata: {}
  });

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    material_type: 'document',
    file_url: '',
    content_text: '',
    category: 'General Training'
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, [sessionId]);

  useEffect(() => {
    if (location.state?.selectedBots) {
      const newBotIds = location.state.selectedBots;
      setSession(prev => ({
        ...prev,
        ai_config: {
          ...prev.ai_config,
          bot_ids: [...new Set([...prev.ai_config.bot_ids, ...newBotIds])]
        }
      }));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const loadInitialData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [usersData, clientsData, materialsData, challengesData] = await Promise.all([
        User.list(),
        RoleplayBot.list(),
        supabase.from('roleplay_knowledge_materials').select('*').eq('is_active', true),
        Challenge.filter({ status: 'active' })
      ]);

      console.log('Loaded AI Clients:', clientsData);

      setUsers(usersData);
      const mappedClients = clientsData.map(bot => ({
        ...bot,
        name: [bot.first_name, bot.last_name].filter(Boolean).join(' ') || 'AI Bot',
        job_title: bot.title
      }));
      console.log('Mapped AI Clients:', mappedClients);
      setAiClients(mappedClients);
      setKnowledgeMaterials(materialsData.data || []);
      setChallenges(challengesData);

      if (sessionId) {
        await loadExistingSession(sessionId);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load form data');
    }
  };

  const loadExistingSession = async (id) => {
    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          participants:practice_participants(*),
          materials:practice_materials_junction(material_id, is_required, reading_order)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setSession(data);
      setSelectedMaterials(data.materials?.map(m => m.material_id) || []);
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    }
  };

  const handleInputChange = (field, value) => {
    setSession(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setSession(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleCriteriaChange = (index, field, value) => {
    setSession(prev => ({
      ...prev,
      evaluation_config: {
        ...prev.evaluation_config,
        criteria: prev.evaluation_config.criteria.map((c, i) =>
          i === index ? { ...c, [field]: value } : c
        )
      }
    }));
  };

  const addCriterion = () => {
    setSession(prev => ({
      ...prev,
      evaluation_config: {
        ...prev.evaluation_config,
        criteria: [
          ...prev.evaluation_config.criteria,
          { name: '', weight: 25, description: '' }
        ]
      }
    }));
  };

  const removeCriterion = (index) => {
    setSession(prev => ({
      ...prev,
      evaluation_config: {
        ...prev.evaluation_config,
        criteria: prev.evaluation_config.criteria.filter((_, i) => i !== index)
      }
    }));
  };

  const addParticipant = (email, role = 'observer') => {
    if (participants.some(p => p.user_email === email)) {
      toast.error('Participant already added');
      return;
    }

    setParticipants(prev => [
      ...prev,
      {
        user_email: email,
        role,
        status: 'invited',
        is_required: role !== 'observer'
      }
    ]);
  };

  const removeParticipant = (email) => {
    setParticipants(prev => prev.filter(p => p.user_email !== email));
  };

  const toggleMaterial = (materialId) => {
    setSelectedMaterials(prev =>
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const addAIBot = (botId) => {
    if (session.ai_config.bot_ids.includes(botId)) {
      toast.error('AI bot already added');
      return;
    }

    handleNestedChange('ai_config', 'bot_ids', [...session.ai_config.bot_ids, botId]);
  };

  const removeAIBot = (botId) => {
    handleNestedChange(
      'ai_config',
      'bot_ids',
      session.ai_config.bot_ids.filter(id => id !== botId)
    );
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 50MB limit');
      return;
    }
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `knowledge-materials/${currentUser?.company_id || 'public'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(uploadError.message || 'Upload failed');

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      const titleGuess = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewMaterial(prev => ({
        ...prev,
        file_url: publicUrl,
        title: prev.title || titleGuess,
        material_type: ['mp4', 'mov', 'avi'].includes(fileExt) ? 'video'
          : ['mp3', 'wav', 'm4a'].includes(fileExt) ? 'audio'
          : 'document'
      }));
      toast.success('File uploaded — add a title and save');
    } catch (error) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSaveMaterial = async () => {
    if (!newMaterial.title.trim()) {
      toast.error('Please enter a title for the material');
      return;
    }
    if (newMaterial.material_type === 'text' && !newMaterial.content_text.trim()) {
      toast.error('Please enter the text content');
      return;
    }
    if (newMaterial.material_type !== 'text' && !newMaterial.file_url.trim()) {
      toast.error('Please upload a file or enter a URL');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('roleplay_knowledge_materials')
        .insert({
          ...newMaterial,
          uploaded_by: currentUser?.email || '',
          company_id: currentUser?.company_id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setKnowledgeMaterials(prev => [data, ...prev]);
      setSelectedMaterials(prev => [...prev, data.id]);
      setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'General Training' });
      setUploadTab('file');
      setShowUploadModal(false);
      toast.success('Material added and selected for this session');
    } catch (error) {
      console.error('Failed to save material:', error);
      toast.error('Failed to save material');
    }
  };

  const validateSession = () => {
    if (!session.session_name.trim()) {
      toast.error('Please enter a session name');
      return false;
    }

    if (!session.scenario.trim()) {
      toast.error('Please enter a scenario description');
      return false;
    }

    if (session.practice_mode === 'solo_ai' && session.ai_config.bot_ids.length === 0) {
      toast.error('Please select at least one AI bot for solo practice');
      return false;
    }

    if (session.requires_material_review && selectedMaterials.length === 0) {
      toast.error('Please select training materials or disable material review requirement');
      return false;
    }

    const totalWeight = session.evaluation_config.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
    if (totalWeight !== 100) {
      toast.error(`Evaluation criteria weights must total 100% (currently ${totalWeight}%)`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateSession()) return;

    setIsLoading(true);
    try {
      const sessionData = {
        ...session,
        created_by: currentUser?.id,
        created_by_email: currentUser?.email
      };

      let savedSession;
      if (sessionId) {
        savedSession = await PracticeSession.update(sessionId, sessionData);
        await supabase.from('practice_participants').delete().eq('session_id', sessionId);
        await supabase.from('practice_materials_junction').delete().eq('session_id', sessionId);
      } else {
        savedSession = await PracticeSession.create(sessionData);
      }

      if (participants.length > 0) {
        await supabase.from('practice_participants').insert(
          participants.map(p => ({
            session_id: savedSession.id,
            ...p
          }))
        );
      }

      if (selectedMaterials.length > 0) {
        await supabase.from('practice_materials_junction').insert(
          selectedMaterials.map((materialId, index) => ({
            session_id: savedSession.id,
            material_id: materialId,
            is_required: session.requires_material_review,
            reading_order: index + 1
          }))
        );
      }

      toast.success(sessionId ? 'Practice session updated!' : 'Practice session created!');
      navigate(createPageUrl('PracticeHub'));
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save practice session');
    } finally {
      setIsLoading(false);
    }
  };

  const practiceModeOptions = [
    { value: 'solo_ai', label: 'Solo AI Practice', description: 'Practice with AI bot one-on-one', icon: Bot },
    { value: 'peer_practice', label: 'Peer Practice', description: 'Practice with another team member', icon: Users },
    { value: 'group_practice', label: 'Group Practice', description: 'Multi-participant practice session', icon: Users },
    { value: 'ai_multi_party', label: 'Multi-Party AI', description: 'Practice with multiple AI bots', icon: Bot },
    { value: 'product_demo', label: 'Product Demo', description: 'Product demonstration practice', icon: Monitor }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link to={createPageUrl('PracticeHub')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Practice Hub
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {sessionId ? 'Edit Practice Session' : 'Create Practice Session'}
          </h1>
          <p className="text-muted-foreground">
            Configure your practice session with AI, peers, or groups
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
            <TabsTrigger value="gamification">Gamification</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>Basic information about your practice session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="session_name">Session Name *</Label>
                  <Input
                    id="session_name"
                    value={session.session_name}
                    onChange={(e) => handleInputChange('session_name', e.target.value)}
                    placeholder="e.g., Cold Call Discovery Practice"
                    required
                  />
                </div>

                <div>
                  <Label>Practice Mode *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {practiceModeOptions.map(option => {
                      const Icon = option.icon;
                      return (
                        <Card
                          key={option.value}
                          className={`cursor-pointer transition-all ${
                            session.practice_mode === option.value
                              ? 'ring-2 ring-blue-600 bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleInputChange('practice_mode', option.value)}
                        >
                          <CardHeader className="p-4">
                            <div className="flex items-start gap-3">
                              <Icon className="w-5 h-5 text-blue-600 mt-1" />
                              <div>
                                <CardTitle className="text-base">{option.label}</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {option.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="task_type">Session Type</Label>
                    <Select value={session.task_type} onValueChange={(v) => handleInputChange('task_type', v)}>
                      <SelectTrigger id="task_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audio">Audio Only</SelectItem>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="screen_recording">Screen Recording</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={session.difficulty} onValueChange={(v) => handleInputChange('difficulty', v)}>
                      <SelectTrigger id="difficulty">
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

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="120"
                      value={Math.round(session.duration_seconds / 60)}
                      onChange={(e) => handleInputChange('duration_seconds', parseInt(e.target.value) * 60)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="scenario">Scenario Description *</Label>
                  <Textarea
                    id="scenario"
                    value={session.scenario}
                    onChange={(e) => handleInputChange('scenario', e.target.value)}
                    placeholder="Describe the practice scenario, objectives, and any specific challenges to focus on..."
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_for">Schedule For</Label>
                    <Input
                      id="scheduled_for"
                      type="datetime-local"
                      value={session.scheduled_for?.slice(0, 16) || ''}
                      onChange={(e) => handleInputChange('scheduled_for', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={session.due_date || ''}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {(session.practice_mode === 'solo_ai' || session.practice_mode === 'ai_multi_party') && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>AI Bots *</CardTitle>
                      <CardDescription>Select AI bots for your practice session</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigate('/browse-ai-clients', {
                          state: {
                            selectionMode: true,
                            returnPath: '/create-practice-session'
                          }
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Browse & Create Bots
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session.ai_config.bot_ids.map(botId => {
                      const bot = aiClients.find(b => b.id === botId);
                      return bot ? (
                        <div key={botId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Bot className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{bot.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {bot.job_title} at {bot.company_name}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAIBot(botId)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : null;
                    })}

                    <Select onValueChange={(value) => addAIBot(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add AI Bot..." />
                      </SelectTrigger>
                      <SelectContent>
                        {aiClients
                          .filter(bot => !session.ai_config.bot_ids.includes(bot.id))
                          .map(bot => (
                            <SelectItem key={bot.id} value={bot.id}>
                              {bot.name} - {bot.job_title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Bots</CardTitle>
                <CardDescription>Select AI bots for your practice session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.ai_config.bot_ids.map(botId => {
                    const bot = aiClients.find(b => b.id === botId);
                    return bot ? (
                      <div key={botId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bot className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{bot.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {bot.job_title} at {bot.company_name}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAIBot(botId)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : null;
                  })}

                  <Select onValueChange={(value) => addAIBot(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add AI Bot..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aiClients
                        .filter(bot => !session.ai_config.bot_ids.includes(bot.id))
                        .map(bot => (
                          <SelectItem key={bot.id} value={bot.id}>
                            {bot.name} - {bot.job_title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {(session.practice_mode === 'peer_practice' || session.practice_mode === 'group_practice') && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Participants</CardTitle>
                  <CardDescription>Add team members to this practice session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participants.map((participant, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium">{participant.user_email}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {participant.role}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(participant.user_email)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <Select onValueChange={(email) => addParticipant(email, 'rep')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add participant..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter(u => !participants.some(p => p.user_email === u.email))
                            .map(user => (
                              <SelectItem key={user.id} value={user.email}>
                                {user.full_name || user.email}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Training Materials for the AI</CardTitle>
                    <CardDescription>
                      Upload documents, files, or paste text so the AI bot learns the right context for this session
                    </CardDescription>
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
                    Upload New Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requires_material_review"
                    checked={session.requires_material_review}
                    onCheckedChange={(checked) => handleInputChange('requires_material_review', checked)}
                  />
                  <Label htmlFor="requires_material_review">
                    Require participants to review materials before starting
                  </Label>
                </div>

                {knowledgeMaterials.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {knowledgeMaterials.map(material => (
                      <div
                        key={material.id}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedMaterials.includes(material.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleMaterial(material.id)}
                      >
                        <Checkbox
                          checked={selectedMaterials.includes(material.id)}
                          onCheckedChange={() => toggleMaterial(material.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{material.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {material.material_type} • {material.category}
                          </div>
                          {material.description && (
                            <div className="text-xs text-muted-foreground mt-1 truncate">{material.description}</div>
                          )}
                        </div>
                        {selectedMaterials.includes(material.id) && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'General Training' });
                      setUploadTab('file');
                      setShowUploadModal(true);
                    }}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-700">No materials yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a document, video, audio file, or paste text to give the AI bot knowledge for this session
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-4">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload First Material
                    </Button>
                  </div>
                )}

                {selectedMaterials.length > 0 && (
                  <p className="text-sm text-blue-700 font-medium">
                    {selectedMaterials.length} material{selectedMaterials.length !== 1 ? 's' : ''} selected — the AI will use these during the session
                  </p>
                )}
              </CardContent>
            </Card>

            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Training Material</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <Tabs value={uploadTab} onValueChange={setUploadTab}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="file">
                        <Upload className="w-4 h-4 mr-2" />
                        File
                      </TabsTrigger>
                      <TabsTrigger value="url">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        URL
                      </TabsTrigger>
                      <TabsTrigger value="text">
                        <FileText className="w-4 h-4 mr-2" />
                        Text
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="file" className="mt-3">
                      <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ cursor: 'pointer' }}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                          </div>
                        ) : newMaterial.file_url ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                            <p className="text-sm font-medium text-green-700">File uploaded successfully</p>
                            <p className="text-xs text-muted-foreground">Click to replace</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="font-medium text-gray-700">Drop file here or click to browse</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT, MP4, MP3, WAV — up to 50MB</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.mp4,.mp3,.wav,.m4a,.mov"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </TabsContent>

                    <TabsContent value="url" className="mt-3">
                      <div className="space-y-2">
                        <Label>Document or Video URL</Label>
                        <Input
                          placeholder="https://..."
                          value={newMaterial.file_url}
                          onChange={(e) => setNewMaterial(prev => ({ ...prev, file_url: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">Link to a publicly accessible document, video, or audio file</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="text" className="mt-3">
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                          placeholder="Paste your training content, product information, scripts, FAQs, or any text the AI should know..."
                          rows={6}
                          value={newMaterial.content_text}
                          onChange={(e) => setNewMaterial(prev => ({
                            ...prev,
                            content_text: e.target.value,
                            material_type: 'text'
                          }))}
                        />
                        <p className="text-xs text-muted-foreground">The AI will use this text as its knowledge base during the session</p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        placeholder="e.g., Product Pricing Guide Q2"
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={newMaterial.category}
                          onValueChange={(v) => setNewMaterial(prev => ({ ...prev, category: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MATERIAL_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newMaterial.material_type}
                          onValueChange={(v) => setNewMaterial(prev => ({ ...prev, material_type: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description (optional)</Label>
                      <Input
                        placeholder="Brief description of what this material covers"
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleSaveMaterial} disabled={isUploading}>
                      {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Save & Add to Session
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="evaluation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Configuration</CardTitle>
                <CardDescription>Configure how this practice session will be evaluated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ai_enabled"
                      checked={session.evaluation_config.ai_enabled}
                      onCheckedChange={(checked) =>
                        setSession(prev => ({
                          ...prev,
                          evaluation_config: { ...prev.evaluation_config, ai_enabled: checked }
                        }))
                      }
                    />
                    <Label htmlFor="ai_enabled">AI Evaluation</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="peer_enabled"
                      checked={session.evaluation_config.peer_enabled}
                      onCheckedChange={(checked) =>
                        setSession(prev => ({
                          ...prev,
                          evaluation_config: { ...prev.evaluation_config, peer_enabled: checked }
                        }))
                      }
                    />
                    <Label htmlFor="peer_enabled">Peer Evaluation</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="manager_required"
                      checked={session.evaluation_config.manager_required}
                      onCheckedChange={(checked) =>
                        setSession(prev => ({
                          ...prev,
                          evaluation_config: { ...prev.evaluation_config, manager_required: checked }
                        }))
                      }
                    />
                    <Label htmlFor="manager_required">Manager Evaluation Required</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="self_evaluation"
                      checked={session.evaluation_config.self_evaluation}
                      onCheckedChange={(checked) =>
                        setSession(prev => ({
                          ...prev,
                          evaluation_config: { ...prev.evaluation_config, self_evaluation: checked }
                        }))
                      }
                    />
                    <Label htmlFor="self_evaluation">Self Evaluation</Label>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Evaluation Criteria (Total: 100%)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Criterion
                    </Button>
                  </div>

                  {session.evaluation_config.criteria.map((criterion, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex gap-3">
                          <div className="flex-1 space-y-3">
                            <Input
                              placeholder="Criterion name"
                              value={criterion.name}
                              onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                            />
                            <Input
                              placeholder="Description"
                              value={criterion.description}
                              onChange={(e) => handleCriteriaChange(index, 'description', e.target.value)}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Weight %"
                              value={criterion.weight}
                              onChange={(e) => handleCriteriaChange(index, 'weight', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCriterion(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gamification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gamification Settings</CardTitle>
                <CardDescription>Add points and connect to challenges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="gamification_enabled"
                    checked={session.gamification_config.enabled}
                    onCheckedChange={(checked) =>
                      setSession(prev => ({
                        ...prev,
                        gamification_config: { ...prev.gamification_config, enabled: checked }
                      }))
                    }
                  />
                  <Label htmlFor="gamification_enabled">Enable Gamification</Label>
                </div>

                {session.gamification_config.enabled && (
                  <>
                    <div>
                      <Label htmlFor="points">Points to Award</Label>
                      <Input
                        id="points"
                        type="number"
                        min="0"
                        value={session.gamification_config.points}
                        onChange={(e) =>
                          setSession(prev => ({
                            ...prev,
                            gamification_config: {
                              ...prev.gamification_config,
                              points: parseInt(e.target.value) || 0
                            }
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Points awarded upon completion
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="challenge">Link to Challenge (Optional)</Label>
                      <Select
                        value={session.gamification_config.challenge_id || ''}
                        onValueChange={(value) =>
                          setSession(prev => ({
                            ...prev,
                            gamification_config: {
                              ...prev.gamification_config,
                              challenge_id: value || null
                            }
                          }))
                        }
                      >
                        <SelectTrigger id="challenge">
                          <SelectValue placeholder="Select a challenge..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Challenge</SelectItem>
                          {challenges.map(challenge => (
                            <SelectItem key={challenge.id} value={challenge.id}>
                              {challenge.challenge_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('PracticeHub'))}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : sessionId ? 'Update Session' : 'Create Session'}
          </Button>
        </div>
      </form>
    </div>
  );
}
