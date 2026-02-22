
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CoachingTask } from '@/api/entities';
import { TaskSubmission } from '@/api/entities'; // Added import for TaskSubmission
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription import
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, GraduationCap, Video, Mic, Monitor, Clock, Target, Loader2, Inbox, UserCheck, ArrowLeft } from 'lucide-react'; // Added Inbox, UserCheck, ArrowLeft icons
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Categorize tasks function
const categorizeTask = (task) => {
    const title = task.task_title.toLowerCase();
    const scenario = task.scenario.toLowerCase();

    if (title.includes('discovery') || scenario.includes('discovery') || scenario.includes('questions')) {
        return 'Discovery Calls';
    } else if (title.includes('demo') || scenario.includes('demo') || scenario.includes('presentation')) {
        return 'Product Demos';
    } else if (title.includes('objection') || scenario.includes('objection') || scenario.includes('concern')) {
        return 'Objection Handling';
    } else if (title.includes('closing') || scenario.includes('close') || scenario.includes('proposal')) {
        return 'Closing Techniques';
    } else if (title.includes('cold') || scenario.includes('cold') || scenario.includes('prospecting')) {
        return 'Cold Outreach';
    } else if (title.includes('followup') || title.includes('follow-up') || scenario.includes('follow')) {
        return 'Follow-up';
    } else {
        return 'General Skills';
    }
};

const TaskCard = ({ task, isSelected, onClick }) => {
    const navigate = useNavigate();

    const typeIcons = {
        video: <Video className="w-5 h-5 text-blue-500" />,
        audio: <Mic className="w-5 h-5 text-green-500" />,
        screen_recording: <Monitor className="w-5 h-5 text-purple-500" />,
    };

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        draft: 'bg-yellow-100 text-yellow-800',
        paused: 'bg-orange-100 text-orange-800',
        archived: 'bg-gray-100 text-gray-800',
    };

    const handleCTAClick = (e) => {
        e.stopPropagation();

        if (task.status === 'active') {
            navigate(createPageUrl(`TaskSubmission?taskId=${task.id}`));
        } else if (task.status === 'draft') {
            navigate(createPageUrl(`CreateCoachingTask?edit=${task.id}`));
        } else if (task.status === 'archived') {
            // For archived tasks, if it's a submission, navigate to review, otherwise just view results.
            // Assuming task.id here refers to the task template, not a specific submission.
            // If the intent is to view past submissions for this task, further logic would be needed.
            // For now, consistent with original behavior for archived tasks.
            navigate(createPageUrl(`TaskReview?taskId=${task.id}`));
        }
    };

    const getCTAButton = () => {
        switch (task.status) {
            case 'active':
                return (
                    <Button
                        onClick={handleCTAClick}
                        size="sm"
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                        Start Recording
                    </Button>
                );
            case 'draft':
                return (
                    <Button
                        onClick={handleCTAClick}
                        size="sm"
                        variant="outline"
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                        Edit Task
                    </Button>
                );
            case 'paused':
                return (
                    <Button
                        onClick={handleCTAClick}
                        size="sm"
                        variant="outline"
                        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                        Resume Task
                    </Button>
                );
            case 'archived':
                return (
                    <Button
                        onClick={handleCTAClick}
                        size="sm"
                        variant="outline"
                        className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
                    >
                        View Results
                    </Button>
                );
            default:
                return (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled
                    >
                        Not Available
                    </Button>
                );
        }
    };

    return (
        <Card
            onClick={() => onClick(task)}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${isSelected ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50' : 'bg-white'}`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {typeIcons[task.task_type]}
                        <Badge variant="outline" className="text-xs capitalize">
                            {task.task_type.replace('_', ' ')}
                        </Badge>
                    </div>
                    <Badge className={`text-xs capitalize ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                        {task.status}
                    </Badge>
                </div>
                <CardTitle className="text-lg capitalize leading-tight">
                    {task.task_title.replace(/_/g, ' ')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-slate-600 line-clamp-2">{task.scenario}</p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.duration_seconds}s max</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span className="text-xs">{categorizeTask(task)}</span>
                    </div>
                </div>

                {task.due_date && (
                    <div className="text-xs text-slate-400">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                )}

                <div className="pt-2">
                    {getCTAButton()}
                </div>
            </CardContent>
        </Card>
    );
};

const ReviewCard = ({ submission }) => {
    const navigate = useNavigate();

    const handleReviewClick = () => {
        navigate(createPageUrl(`TaskReview?submissionId=${submission.id}`));
    };

    return (
        <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <CardTitle className="text-lg">Review Request</CardTitle>
                <CardDescription>
                    From: {submission.submitted_by_details?.full_name || submission.submitted_by}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                    A new pitch submission is ready for your feedback.
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Submitted: {new Date(submission.created_date).toLocaleDateString()}</span>
                    </div>
                </div>
                <Button onClick={handleReviewClick} className="w-full">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Review Now
                </Button>
            </CardContent>
        </Card>
    );
};

export default function CoachingHub() {
    const [tasks, setTasks] = useState([]);
    const [reviewSubmissions, setReviewSubmissions] = useState([]); // New state for review submissions
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filters, setFilters] = useState({ category: 'all', status: 'all' });
    const [activeTab, setActiveTab] = useState('assigned_to_me');
    const [currentUser, setCurrentUser] = useState(null); // New state for current user
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const user = await User.me();
                setCurrentUser(user);
                await loadData(user.email);
            } catch(e) {
                console.error("Failed to load user or data", e);
                // Optionally set tasks/submissions to empty arrays on error
                setTasks([]);
                setReviewSubmissions([]);
            }
            setIsLoading(false);
        };
        init();
    }, []); // Run once on mount

    const loadData = async (userEmail) => {
        if (!userEmail) return;

        setIsLoading(true); // Set loading true for any data fetch
        try {
            const [taskData, submissionData] = await Promise.all([
                CoachingTask.list('-created_at'),
                TaskSubmission.filter({
                    reviewer_email: userEmail,
                    status: 'pending_peer_review'
                }, '-created_at')
            ]);

            // Fetch user details for submissions
            const userEmails = [...new Set(submissionData.map(s => s.submitted_by))];
            const users = userEmails.length > 0 ? await User.filter({ email: { $in: userEmails } }) : [];
            const userMap = new Map(users.map(u => [u.email, u]));

            const submissionsWithDetails = submissionData.map(s => ({
                ...s,
                submitted_by_details: userMap.get(s.submitted_by)
            }));

            setTasks(taskData);
            setReviewSubmissions(submissionsWithDetails);
        } catch (error) {
            console.error('Error loading coaching data:', error);
            setTasks([]);
            setReviewSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTaskSelect = (task) => {
        setSelectedTask(task);
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setSelectedTask(null); // Clear selected task when tab changes

        // If switching to review queue, re-fetch data to ensure it's up-to-date
        if (newTab === 'review_queue' && currentUser) {
            loadData(currentUser.email);
        }
        // If switching to other tabs, the filteredTasks memo will re-evaluate with existing 'tasks' state.
        // A full reload of tasks might be desired here too, but the outline suggests it only for review_queue.
    };

    // Memoized filtered tasks based on tab and filters
    const filteredTasks = useMemo(() => {
        let currentTasks = tasks;

        // If the active tab is 'review_queue', no tasks should be displayed, so return an empty array.
        if (activeTab === 'review_queue') {
            return [];
        }

        // Apply tab filtering first
        switch (activeTab) {
            case 'assigned_to_me': // Now "My Tasks"
                currentTasks = tasks.filter(task => task.status === 'active');
                break;
            case 'assigned_by_me':
                currentTasks = tasks.filter(task => task.status === 'draft');
                break;
            case 'completed': // Now "History"
                currentTasks = tasks.filter(task => task.status === 'archived');
                break;
            default:
                break;
        }

        // Apply category and status filters on top of tab-filtered tasks
        return currentTasks.filter(task => {
            const categoryMatch = filters.category === 'all' || categorizeTask(task) === filters.category;

            let statusMatch = true;
            if (filters.status !== 'all') {
                if (filters.status === 'completed') { // 'completed' filter matches 'archived' task status
                    statusMatch = task.status === 'archived';
                } else {
                    statusMatch = task.status === filters.status;
                }
            }
            return categoryMatch && statusMatch;
        });
    }, [tasks, filters, activeTab]);

    // Effect to update selected task when tasks or activeTab change
    useEffect(() => {
        // Only attempt to select a task if not on 'review_queue' tab and there are filtered tasks
        if (activeTab !== 'review_queue') {
            if (!selectedTask || !filteredTasks.some(task => task.id === selectedTask.id)) {
                setSelectedTask(filteredTasks.length > 0 ? filteredTasks[0] : null);
            }
        } else {
            // Ensure selected task is null when on review queue tab
            setSelectedTask(null);
        }
    }, [filteredTasks, selectedTask, activeTab]);


    // Recalculate categories based on the CURRENTLY SELECTED TAB's filtered tasks
    // This will correctly show counts for 'tasks' only, and '0' for review queue tab.
    const categories = useMemo(() => {
        const allCategories = new Set();
        filteredTasks.forEach(task => {
            allCategories.add(categorizeTask(task));
        });
        return ['all', ...Array.from(allCategories)].sort();
    }, [filteredTasks]);

    // Helper function to render the task list
    const renderTaskList = (tasksToRender, loading, currentSelectedTask, onSelectTask) => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500">Loading tasks...</p>
                </div>
            );
        }

        if (tasksToRender.length === 0) {
            return (
                <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No tasks found</h3>
                    <p className="text-slate-500">Try adjusting your filters or create a new task.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasksToRender.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        isSelected={currentSelectedTask?.id === task.id}
                        onClick={onSelectTask}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Add back button */}
            <div className="mb-6">
                <Link to={createPageUrl('Dashboard')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>

            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Coaching Hub</h1>
                        <p className="text-slate-600 mt-1">Practice, get feedback, and level up your sales skills.</p>
                    </div>
                </div>
                <Link to={createPageUrl('CreateCoachingTask')}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Task
                    </Button>
                </Link>
            </header>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0">
                    <TabsTrigger
                        value="assigned_to_me"
                        className="text-lg px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-slate-900 data-[state=active]:shadow-none text-slate-500 font-medium"
                    >
                        My Tasks {/* Renamed */}
                    </TabsTrigger>
                     <TabsTrigger
                        value="review_queue"
                        className="text-lg px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-slate-900 data-[state=active]:shadow-none text-slate-500 font-medium"
                    >
                        <div className="flex items-center gap-2">
                           Review Queue
                           {reviewSubmissions.length > 0 && <Badge className="bg-red-500 text-white">{reviewSubmissions.length}</Badge>}
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="assigned_by_me"
                        className="text-lg px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-slate-900 data-[state=active]:shadow-none text-slate-500 font-medium"
                    >
                        Assigned by Me
                    </TabsTrigger>
                    <TabsTrigger
                        value="completed"
                        className="text-lg px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-slate-900 data-[state=active]:shadow-none text-slate-500 font-medium"
                    >
                        History {/* Renamed */}
                    </TabsTrigger>
                </TabsList>

                {/* Filter section visible for all tabs, but counts will reflect `filteredTasks` */}
                <div className="flex gap-4 my-6">
                    <div className="w-1/3">
                        <label className="text-sm font-medium text-slate-700">Category</label>
                        <Select value={filters.category} onValueChange={(value) => setFilters(f => ({ ...f, category: value }))}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories ({filteredTasks.length})</SelectItem>
                                {categories.slice(1).map(cat => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat} ({filteredTasks.filter(task => categorizeTask(task) === cat).length})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-1/3">
                        <label className="text-sm font-medium text-slate-700">Status</label>
                        <Select value={filters.status} onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem> {/* Filter for archived tasks */}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <TabsContent value="assigned_to_me">
                    {renderTaskList(filteredTasks, isLoading, selectedTask, handleTaskSelect)}
                </TabsContent>
                <TabsContent value="assigned_by_me">
                    {renderTaskList(filteredTasks, isLoading, selectedTask, handleTaskSelect)}
                </TabsContent>
                <TabsContent value="completed">
                    {renderTaskList(filteredTasks, isLoading, selectedTask, handleTaskSelect)}
                </TabsContent>

                <TabsContent value="review_queue">
                    {isLoading ? (
                         <div className="text-center py-12">
                             <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
                             <p className="text-slate-500 mt-4">Loading review requests...</p>
                         </div>
                    ) : reviewSubmissions.length === 0 ? (
                        <div className="text-center py-16">
                            <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-600">Your review queue is empty</h3>
                            <p className="text-slate-500">Submissions from your team will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {reviewSubmissions.map(sub => <ReviewCard key={sub.id} submission={sub} />)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
