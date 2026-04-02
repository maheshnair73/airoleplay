
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CoachingTask } from '@/api/entities';
import { User } from '@/api/entities';
import { RoleplayBot } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Save, Users, Clock, Video, Mic, Monitor, Settings, Clipboard, BookOpen, Phone } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

export default function CreateCoachingTask() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [knowledgeMaterials, setKnowledgeMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [aiClients, setAiClients] = useState([]);
    const [task, setTask] = useState({
        task_title: '',
        task_type: 'audio',
        language: 'english',
        scenario: '',
        duration_seconds: 300,
        assigned_users: [],
        due_date: '',
        status: 'draft',
        requires_material_review: false,
        roleplay_bot_id: null,
        evaluation_criteria: [
            { name: 'Clarity', description: 'How clear and concise was the message?' },
            { name: 'Confidence', description: 'How confident and persuasive was the delivery?' },
            { name: 'Value Proposition', description: 'How well was the value proposition articulated?' }
        ]
    });

    useEffect(() => {
        fetchUsers();
        fetchKnowledgeMaterials();
        fetchAiClients();
    }, []);

    const fetchUsers = async () => {
        try {
            const userList = await User.list();
            setUsers(userList);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchKnowledgeMaterials = async () => {
        try {
            const { data, error } = await supabase
                .from('roleplay_knowledge_materials')
                .select('*')
                .eq('is_active', true)
                .order('created_date', { ascending: false });

            if (error) throw error;
            setKnowledgeMaterials(data || []);
        } catch (error) {
            console.error('Error fetching knowledge materials:', error);
        }
    };

    const fetchAiClients = async () => {
        try {
            const bots = await RoleplayBot.list();
            const botsWithName = bots.map(bot => ({
                ...bot,
                name: [bot.first_name, bot.last_name].filter(Boolean).join(' ') || 'Unknown Bot'
            }));
            setAiClients(botsWithName);
        } catch (error) {
            console.error('Error fetching AI clients:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setTask(prev => ({ ...prev, [field]: value }));
    };

    const handleDurationChange = (minutes) => {
        const seconds = parseInt(minutes) * 60;
        setTask(prev => ({ ...prev, duration_seconds: seconds }));
    };

    const getDurationInMinutes = () => {
        return Math.floor(task.duration_seconds / 60);
    };

    const handleAssignUser = (userEmail) => {
        if (!task.assigned_users.includes(userEmail)) {
            setTask(prev => ({
                ...prev,
                assigned_users: [...prev.assigned_users, userEmail]
            }));
        }
    };

    const handleRemoveUser = (userEmail) => {
        setTask(prev => ({
            ...prev,
            assigned_users: prev.assigned_users.filter(email => email !== userEmail)
        }));
    };

    const handleAddCriterion = () => {
        setTask(prev => ({
            ...prev,
            evaluation_criteria: [
                ...prev.evaluation_criteria,
                { name: '', description: '' }
            ]
        }));
    };

    const handleUpdateCriterion = (index, field, value) => {
        setTask(prev => ({
            ...prev,
            evaluation_criteria: prev.evaluation_criteria.map((criterion, i) =>
                i === index ? { ...criterion, [field]: value } : criterion
            )
        }));
    };

    const handleRemoveCriterion = (index) => {
        setTask(prev => ({
            ...prev,
            evaluation_criteria: prev.evaluation_criteria.filter((_, i) => i !== index)
        }));
    };

    const toggleMaterial = (materialId) => {
        setSelectedMaterials(prev =>
            prev.includes(materialId)
                ? prev.filter(id => id !== materialId)
                : [...prev, materialId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!task.task_title.trim() || !task.scenario.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (task.requires_material_review && selectedMaterials.length === 0) {
            toast.error('Please select at least one training material or disable "Require Material Review"');
            return;
        }

        setIsLoading(true);
        try {
            const createdTask = await CoachingTask.create(task);

            if (selectedMaterials.length > 0 && createdTask?.id) {
                for (let i = 0; i < selectedMaterials.length; i++) {
                    const materialId = selectedMaterials[i];
                    await supabase.from('coaching_task_materials').insert({
                        task_id: createdTask.id,
                        material_id: materialId,
                        is_required: task.requires_material_review,
                        reading_order: i + 1
                    });
                }
            }

            toast.success('Coaching task created successfully!');
            navigate(createPageUrl('CoachingHub'));
        } catch (error) {
            console.error('Error creating coaching task:', error);
            toast.error('Failed to create coaching task');
        } finally {
            setIsLoading(false);
        }
    };

    const taskTypeIcons = {
        audio: Mic,
        video: Video,
        screen_recording: Monitor
    };

    const TaskTypeIcon = taskTypeIcons[task.task_type] || Mic;

    const canProceedToNext = (tabName) => {
        switch(tabName) {
            case 'assignment':
                return task.task_title.trim() && task.scenario.trim();
            case 'criteria':
                return task.task_title.trim() && task.scenario.trim();
            default:
                return true;
        }
    };

    const handleNextTab = (nextTab) => {
        if (canProceedToNext(nextTab)) {
            setActiveTab(nextTab);
        } else {
            toast.error('Please complete required fields before proceeding');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link to={createPageUrl('CoachingHub')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Coaching Hub
                </Link>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Coaching Task</h1>
                    <p className="text-slate-600 mt-2">Design a practice exercise for your sales team</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-sm">
                            <TabsTrigger value="details" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                <Clipboard className="w-4 h-4" />
                                Task Details
                            </TabsTrigger>
                            <TabsTrigger value="training" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                <BookOpen className="w-4 h-4" />
                                Training
                            </TabsTrigger>
                            <TabsTrigger value="assignment" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                <Users className="w-4 h-4" />
                                Assignment
                            </TabsTrigger>
                            <TabsTrigger value="criteria" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                <Settings className="w-4 h-4" />
                                Evaluation
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Task Details */}
                        <TabsContent value="details" className="space-y-6">
                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <TaskTypeIcon className="w-5 h-5 text-blue-600" />
                                        Task Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div>
                                        <Label htmlFor="title" className="text-sm font-medium text-slate-700">Task Title *</Label>
                                        <Input
                                            id="title"
                                            value={task.task_title}
                                            onChange={(e) => handleInputChange('task_title', e.target.value)}
                                            placeholder="e.g., Discovery Call Practice"
                                            className="mt-1"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Task Type</Label>
                                            <Select value={task.task_type} onValueChange={(value) => handleInputChange('task_type', value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="audio">
                                                        <div className="flex items-center gap-2">
                                                            <Mic className="w-4 h-4" />
                                                            Audio Recording
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="video">
                                                        <div className="flex items-center gap-2">
                                                            <Video className="w-4 h-4" />
                                                            Video Recording
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="screen_recording">
                                                        <div className="flex items-center gap-2">
                                                            <Monitor className="w-4 h-4" />
                                                            Screen Recording
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Language</Label>
                                            <Select value={task.language} onValueChange={(value) => handleInputChange('language', value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="english">English</SelectItem>
                                                    <SelectItem value="spanish">Spanish</SelectItem>
                                                    <SelectItem value="french">French</SelectItem>
                                                    <SelectItem value="german">German</SelectItem>
                                                    <SelectItem value="portuguese">Portuguese</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Duration (minutes)</Label>
                                            <Input
                                                type="number"
                                                value={getDurationInMinutes()}
                                                onChange={(e) => handleDurationChange(e.target.value)}
                                                className="mt-1"
                                                min="1"
                                                max="30"
                                                placeholder="5"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Recommended: 3-10 minutes</p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="scenario" className="text-sm font-medium text-slate-700">Scenario Description *</Label>
                                        <Textarea
                                            id="scenario"
                                            value={task.scenario}
                                            onChange={(e) => handleInputChange('scenario', e.target.value)}
                                            placeholder="Describe the sales scenario in detail. Include context about the prospect, their pain points, and the objective of the call..."
                                            className="mt-1 h-32"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="due_date" className="text-sm font-medium text-slate-700">Due Date (Optional)</Label>
                                        <Input
                                            id="due_date"
                                            type="date"
                                            value={task.due_date}
                                            onChange={(e) => handleInputChange('due_date', e.target.value)}
                                            className="mt-1 w-fit"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={() => handleNextTab('training')}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                >
                                    Next: Training Materials
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Training Materials & Roleplay */}
                        <TabsContent value="training" className="space-y-6">
                            {/* Debug: Ensure tab is rendering */}
                            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded mb-4">
                                <p className="text-sm">Training Tab Loaded - Materials: {knowledgeMaterials.length}, AI Clients: {aiClients.length}</p>
                            </div>

                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Phone className="w-5 h-5 text-blue-600" />
                                        AI Roleplay Setup (Optional)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-slate-700">
                                            You can assign an AI client for sales reps to practice with after completing this task.
                                            This turns the coaching task into a complete training workflow: study materials, then practice with AI.
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Select AI Client (Optional)</Label>
                                        <Select value={task.roleplay_bot_id || ''} onValueChange={(value) => handleInputChange('roleplay_bot_id', value || null)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Choose an AI client for roleplay practice..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">No AI Roleplay</SelectItem>
                                                {aiClients.map(client => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.name} - {client.title} at {client.company_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-500 mt-1">
                                            If selected, reps will be prompted to practice with this AI client after submitting their task
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                        Training Materials
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                        <div className="flex-1">
                                            <Label className="text-sm font-semibold text-slate-900">Require Material Review Before Starting</Label>
                                            <p className="text-xs text-slate-600 mt-1">
                                                When enabled, sales reps must read all selected materials before they can start the roleplay or submit their task
                                            </p>
                                        </div>
                                        <Switch
                                            checked={task.requires_material_review}
                                            onCheckedChange={(checked) => handleInputChange('requires_material_review', checked)}
                                        />
                                    </div>

                                    {knowledgeMaterials.length === 0 ? (
                                        <div className="text-center py-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-dashed">
                                            <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                                            <p className="text-slate-600 mb-2">No training materials available</p>
                                            <p className="text-sm text-slate-500">Upload materials in the Roleplay Knowledge Hub first</p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="mt-4"
                                                onClick={() => window.open(createPageUrl('RoleplayKnowledgeHub'), '_blank')}
                                            >
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                Go to Knowledge Hub
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                                                    Select Materials for This Task
                                                </Label>
                                                <p className="text-xs text-slate-500 mb-3">
                                                    Choose which training materials sales reps should study for this task. The AI coach will reference these during roleplay.
                                                </p>
                                                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                                                    {knowledgeMaterials.map((material) => (
                                                        <div
                                                            key={material.id}
                                                            className="flex items-start gap-3 p-3 hover:bg-white rounded transition-colors border border-transparent hover:border-blue-200"
                                                        >
                                                            <Checkbox
                                                                id={`material-${material.id}`}
                                                                checked={selectedMaterials.includes(material.id)}
                                                                onCheckedChange={() => toggleMaterial(material.id)}
                                                            />
                                                            <label
                                                                htmlFor={`material-${material.id}`}
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <p className="font-medium text-sm text-slate-900">{material.title}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {material.category}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {material.material_type}
                                                                    </Badge>
                                                                </div>
                                                                {material.description && (
                                                                    <p className="text-xs text-slate-600 mt-1">{material.description}</p>
                                                                )}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {selectedMaterials.length > 0 && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <p className="text-sm font-medium text-green-900">
                                                        {selectedMaterials.length} material{selectedMaterials.length > 1 ? 's' : ''} selected
                                                    </p>
                                                    <p className="text-xs text-green-700 mt-1">
                                                        {task.requires_material_review
                                                            ? 'Sales reps must read these before starting'
                                                            : 'These materials will be available for reference'
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                                    Previous: Details
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleNextTab('assignment')}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                >
                                    Next: Assignment
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Assignment */}
                        <TabsContent value="assignment" className="space-y-6">
                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        Assign to Team Members
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Select Users to Assign</Label>
                                        <Select onValueChange={handleAssignUser}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Choose team members..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.filter(user => !task.assigned_users.includes(user.email)).map(user => (
                                                    <SelectItem key={user.id} value={user.email}>
                                                        {user.display_name || user.full_name || user.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-500 mt-1">Leave empty to assign to all team members</p>
                                    </div>

                                    {task.assigned_users.length > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Assigned Users ({task.assigned_users.length})</Label>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {task.assigned_users.map(email => {
                                                    const user = users.find(u => u.email === email);
                                                    return (
                                                        <Badge key={email} className="bg-blue-100 text-blue-800 flex items-center gap-2 px-3 py-1">
                                                            {user?.display_name || user?.full_name || email}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveUser(email)}
                                                                className="ml-1 text-blue-600 hover:text-blue-800 font-bold text-sm"
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {task.assigned_users.length === 0 && (
                                        <div className="text-center py-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-dashed">
                                            <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                                            <p className="text-slate-500">No specific users assigned</p>
                                            <p className="text-sm text-slate-400">This task will be available to all team members</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setActiveTab('training')}>
                                    Previous: Training
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleNextTab('criteria')}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                >
                                    Next: Evaluation
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Tab 4: Evaluation Criteria */}
                        <TabsContent value="criteria" className="space-y-6">
                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Settings className="w-5 h-5 text-blue-600" />
                                        Evaluation Criteria
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-sm text-slate-600 mb-4">
                                        Define what aspects reviewers should evaluate in the submissions.
                                    </p>

                                    {task.evaluation_criteria.map((criterion, index) => (
                                        <div key={index} className="flex gap-4 items-start p-4 border rounded-lg bg-gradient-to-r from-slate-50 to-blue-50">
                                            <div className="flex-1 space-y-3">
                                                <Input
                                                    placeholder="Criterion name (e.g., Clarity, Confidence)"
                                                    value={criterion.name}
                                                    onChange={(e) => handleUpdateCriterion(index, 'name', e.target.value)}
                                                />
                                                <Textarea
                                                    placeholder="Description of what to evaluate..."
                                                    value={criterion.description}
                                                    onChange={(e) => handleUpdateCriterion(index, 'description', e.target.value)}
                                                    className="h-20"
                                                />
                                            </div>
                                            {task.evaluation_criteria.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveCriterion(index)}
                                                    className="mt-1 border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddCriterion}
                                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                                    >
                                        + Add Another Criterion
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setActiveTab('assignment')}>
                                    Previous: Assignment
                                </Button>
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" asChild>
                                        <Link to={createPageUrl('CoachingHub')}>Cancel</Link>
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Create Task
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
        </div>
    );
}
