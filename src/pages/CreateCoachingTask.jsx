
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CoachingTask } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Save, Users, Clock, Video, Mic, Monitor, Settings, Clipboard } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function CreateCoachingTask() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [task, setTask] = useState({
        task_title: '',
        task_type: 'audio',
        language: 'english',
        scenario: '',
        duration_seconds: 300, // We'll convert from minutes in the UI
        assigned_users: [],
        due_date: '',
        status: 'draft',
        evaluation_criteria: [
            { name: 'Clarity', description: 'How clear and concise was the message?' },
            { name: 'Confidence', description: 'How confident and persuasive was the delivery?' },
            { name: 'Value Proposition', description: 'How well was the value proposition articulated?' }
        ]
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const userList = await User.list();
            setUsers(userList);
        } catch (error) {
            console.error('Error fetching users:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!task.task_title.trim() || !task.scenario.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            await CoachingTask.create(task);
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
                        <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-sm">
                            <TabsTrigger value="details" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                <Clipboard className="w-4 h-4" />
                                Task Details
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
                                <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                                    Previous: Details
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

                        {/* Tab 3: Evaluation Criteria */}
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
