import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Users, Clock, Video, Mic, Monitor, Settings, BookOpen,
  Plus, X, Trophy, Target, Bot, UserPlus, Calendar, Sparkles
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';

export default function CreatePracticeSession() {
  const navigate = useNavigate();
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

  useEffect(() => {
    loadInitialData();
  }, [sessionId]);

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

      setUsers(usersData);
      setAiClients(clientsData.map(bot => ({
        ...bot,
        name: [bot.first_name, bot.last_name].filter(Boolean).join(' ') || 'AI Bot'
      })));
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
                <CardTitle>Practice Materials</CardTitle>
                <CardDescription>
                  Select materials participants should review before the practice session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requires_material_review"
                    checked={session.requires_material_review}
                    onCheckedChange={(checked) => handleInputChange('requires_material_review', checked)}
                  />
                  <Label htmlFor="requires_material_review">
                    Require material review before practice
                  </Label>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {knowledgeMaterials.map(material => (
                    <div
                      key={material.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleMaterial(material.id)}
                    >
                      <Checkbox
                        checked={selectedMaterials.includes(material.id)}
                        onCheckedChange={() => toggleMaterial(material.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{material.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {material.material_type} • {material.category}
                        </div>
                      </div>
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>

                {knowledgeMaterials.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No materials available. Create materials in the Knowledge Hub first.
                  </div>
                )}
              </CardContent>
            </Card>
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
