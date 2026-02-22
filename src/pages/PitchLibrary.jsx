
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TaskSubmission } from '@/api/entities';
import { CoachingTask } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Search, Star, Play, Filter, Award, Clock, Target, User as UserIcon, ArrowLeft, Loader2, GraduationCap, Plus, Eye, FileText, MessageSquare, Users, Bot, Mic, Lightbulb, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PitchLibrary() {
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [tasks, setTasks] = useState({});
    const [users, setUsers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedScoreRange, setSelectedScoreRange] = useState('all');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        loadLibrary();
    }, []);

    // Categorize submissions based on task titles and scenarios
    const categorizeSubmission = useCallback((submission) => {
        const task = tasks[submission.task_id];
        if (!task) return 'General';
        
        const title = task.task_title.toLowerCase();
        const scenario = task.scenario.toLowerCase();

        if (title.includes('discovery') || scenario.includes('discovery')) {
            return 'Discovery Calls';
        } else if (title.includes('demo') || scenario.includes('demo')) {
            return 'Product Demos';
        } else if (title.includes('objection') || scenario.includes('objection')) {
            return 'Objection Handling';
        } else if (title.includes('closing') || scenario.includes('closing')) {
            return 'Closing Techniques';
        } else if (title.includes('cold') || scenario.includes('cold')) {
            return 'Cold Outreach';
        } else if (title.includes('follow') || scenario.includes('follow')) {
            return 'Follow-up';
        }
        
        return 'General';
    }, [tasks]); // Dependency array for useCallback

    const filterSubmissions = useCallback(() => {
        let filtered = submissions;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(submission => {
                const task = tasks[submission.task_id];
                const user = users[submission.submitted_by];
                const searchLower = searchTerm.toLowerCase();
                
                return (
                    task?.task_title?.toLowerCase().includes(searchLower) ||
                    task?.scenario?.toLowerCase().includes(searchLower) ||
                    user?.full_name?.toLowerCase().includes(searchLower) ||
                    categorizeSubmission(submission).toLowerCase().includes(searchLower)
                );
            });
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(submission => 
                categorizeSubmission(submission) === selectedCategory
            );
        }

        // Score range filter
        if (selectedScoreRange !== 'all') {
            const [min, max] = selectedScoreRange.split('-').map(Number);
            filtered = filtered.filter(submission => {
                const score = submission.score || 0;
                return max ? score >= min && score <= max : score >= min;
            });
        }

        setFilteredSubmissions(filtered);
    }, [submissions, searchTerm, selectedCategory, selectedScoreRange, tasks, users, categorizeSubmission]); // Dependency array for useCallback

    useEffect(() => {
        filterSubmissions();
    }, [filterSubmissions]); // Depend on the memoized function

    const loadLibrary = async () => {
        try {
            console.log('Starting to load pitch library...');
            
            // Try to get all submissions first, then filter for library items
            let librarySubmissions = [];
            try {
                // Try getting submissions marked as library items
                librarySubmissions = await TaskSubmission.filter({ is_in_library: true });
                console.log('Found library submissions:', librarySubmissions.length);
            } catch (error) {
                console.warn('Could not filter by is_in_library, trying to get all submissions:', error);
                // Fallback: get all submissions and manually filter
                const allSubmissions = await TaskSubmission.list();
                librarySubmissions = allSubmissions.filter(s => s.is_in_library === true);
                console.log('Fallback: found library submissions:', librarySubmissions.length);
            }

            // If no library submissions found, create some sample data for demo
            if (librarySubmissions.length === 0) {
                console.log('No library submissions found, creating sample data...');
                toast.info('No pitches found, displaying sample data.');
                librarySubmissions = [
                    {
                        id: 'sample-1',
                        task_id: 'sample-task-1',
                        submitted_by: 'demo@example.com',
                        transcript: 'Hi [Prospect Name], I noticed your company has been growing rapidly. We help companies like yours streamline operations and reduce costs by up to 30%. Would you be interested in a brief conversation about how this could benefit your team?',
                        score: 92,
                        created_date: new Date().toISOString(),
                        duration_actual: 45,
                        is_in_library: true,
                        submission_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Example audio URL
                    },
                    {
                        id: 'sample-2',
                        task_id: 'sample-task-2',
                        submitted_by: 'demo@example.com',
                        transcript: 'Good morning [Name]. I understand you\'re looking for solutions to improve your team\'s productivity. Let me share how we\'ve helped similar companies achieve 40% efficiency gains in just 3 months...',
                        score: 88,
                        created_date: new Date().toISOString(),
                        duration_actual: 52,
                        is_in_library: true,
                        submission_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' // Example audio URL
                    },
                    {
                        id: 'sample-3',
                        task_id: 'sample-task-3',
                        submitted_by: 'demo@example.com',
                        transcript: 'I know you\'re busy, so I\'ll be brief. We specialize in helping companies overcome the exact challenges you mentioned in your recent interview. Could we schedule a quick 15-minute call to explore how this applies to your situation?',
                        score: 94,
                        created_date: new Date().toISOString(),
                        duration_actual: 38,
                        is_in_library: true,
                        submission_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' // Example audio URL
                    }
                ];
            }

            setSubmissions(librarySubmissions);

            // Create sample tasks for the demo data
            const sampleTasks = {
                'sample-task-1': {
                    id: 'sample-task-1',
                    task_title: 'Cold Outreach Mastery',
                    scenario: 'Cold outreach to a tech startup CEO about productivity challenges'
                },
                'sample-task-2': {
                    id: 'sample-task-2',
                    task_title: 'Discovery Call Excellence',
                    scenario: 'Discovery call with a mid-market company looking to improve efficiency'
                },
                'sample-task-3': {
                    id: 'sample-task-3',
                    task_title: 'Executive Follow-up',
                    scenario: 'Follow-up with a C-level executive after initial contact'
                }
            };

            // Try to load real task details for valid submissions
            const taskIds = [...new Set(librarySubmissions.map(s => s.task_id))];
            const validTaskIds = taskIds.filter(id => id && !isNaN(Number(id)));
            
            let taskMap = { ...sampleTasks }; // Start with sample tasks
            
            if (validTaskIds.length > 0) {
                try {
                    const taskPromises = validTaskIds.map(id => CoachingTask.get(id).catch(() => null));
                    const taskResults = await Promise.all(taskPromises);
                    taskResults.forEach(task => {
                        if (task) taskMap[task.id] = task;
                    });
                } catch (error) {
                    console.warn('Could not load some tasks:', error);
                }
            }
            
            setTasks(taskMap);

            // Create sample user data
            const sampleUsers = {
                'demo@example.com': {
                    email: 'demo@example.com',
                    full_name: 'Demo User',
                    display_name: 'Demo User'
                }
            };

            // Try to load real user details
            const userEmails = [...new Set(librarySubmissions.map(s => s.submitted_by))];
            let userMap = { ...sampleUsers };
            
            if (userEmails.length > 0) {
                try {
                    const userList = await User.filter({ email: { $in: userEmails } });
                    userList.forEach(user => {
                        userMap[user.email] = user;
                    });
                } catch (error) {
                    console.warn('Could not load user details:', error);
                }
            }
            
            setUsers(userMap);

            console.log('Pitch library loaded successfully');
        } catch (error) {
            console.error('Error loading pitch library:', error);
            toast.error('Failed to load pitch library. Please try again later.');
            
            // Set empty state on complete failure if sample data also fails or is not desired
            setSubmissions([]);
            setTasks({});
            setUsers({});
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewSubmission = (submission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    const handleStartPractice = (submission, practiceType) => {
        const task = tasks[submission.task_id];
        
        // Set session storage to remember we came from Pitch Library
        sessionStorage.setItem('returnToPitchLibrary', 'true');
        
        switch (practiceType) {
            case 'self':
                // Navigate to self practice recording page
                navigate(createPageUrl(`TaskSubmission?taskId=${submission.task_id}&practice=self&referenceSubmissionId=${submission.id}`));
                break;
            case 'ai':
                // Navigate to AI Roleplay with the scenario details
                const scenario = task?.scenario || 'Practice scenario from Pitch Library';
                const title = task?.task_title || 'Practice Session';
                navigate(createPageUrl(`AIRoleplay?scenario=${encodeURIComponent(scenario)}&scenarioTitle=${encodeURIComponent(title)}&referenceSubmissionId=${submission.id}`));
                break;
            case 'human':
                // Navigate to Human Roleplay setup
                const humanScenario = task?.scenario || 'Practice scenario from Pitch Library';
                const humanTitle = task?.task_title || 'Practice Session';
                navigate(createPageUrl(`HumanRoleplay?scenario=${encodeURIComponent(humanScenario)}&scenarioTitle=${encodeURIComponent(humanTitle)}&referenceSubmissionId=${submission.id}`));
                break;
            default:
                break;
        }
        setIsModalOpen(false);
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'bg-green-600 text-white';
        if (score >= 80) return 'bg-green-500 text-white';
        if (score >= 70) return 'bg-yellow-500 text-white';
        if (score >= 60) return 'bg-orange-500 text-white';
        return 'bg-red-500 text-white';
    };

    // Get unique categories for filter
    // Use a memoized version of categorizeSubmission here as well for consistency
    const categories = ['all', ...new Set(submissions.map(s => categorizeSubmission(s)))];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500">Loading pitch library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Add back button */}
            <div className="mb-6">
                <Link to={createPageUrl('Dashboard')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <BookOpen className="w-8 h-8 text-purple-600" />
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Pitch Library
                                </h1>
                            </div>
                            <p className="text-slate-600 text-lg">
                                Learn from the best submissions and improve your skills
                            </p>
                            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    <span>{submissions.length} Best Practices</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Target className="w-4 h-4" />
                                    <span>{categories.length - 1} Categories</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Fixed Add New Pitch Button */}
                        <Button 
                            onClick={() => navigate(createPageUrl('CreatePitch'))}
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add New Pitch
                        </Button>
                    </div>
                </header>

                {/* Filters */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search pitches, scenarios, or contributors..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.slice(1).map(category => (
                                            <SelectItem key={category} value={category}>
                                                {category} ({submissions.filter(s => categorizeSubmission(s) === category).length})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select value={selectedScoreRange} onValueChange={setSelectedScoreRange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Scores" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Scores</SelectItem>
                                        <SelectItem value="90-100">Excellent (90-100)</SelectItem>
                                        <SelectItem value="80-89">Great (80-89)</SelectItem>
                                        <SelectItem value="70-79">Good (70-79)</SelectItem>
                                        <SelectItem value="60-69">Average (60-69)</SelectItem>
                                        <SelectItem value="0-59">Needs Work (&lt;60)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions Grid */}
                {filteredSubmissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSubmissions.map(submission => {
                            const task = tasks[submission.task_id];
                            const user = users[submission.submitted_by];
                            const category = categorizeSubmission(submission);
                            
                            return (
                                <Card key={submission.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => handleViewSubmission(submission)}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                                                {category}
                                            </Badge>
                                            <Badge className={`${getScoreColor(submission.score || 0)} text-xs font-bold`}>
                                                {submission.score || 0}%
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                                            {task?.task_title || 'Discovery Call Practice'}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {task?.scenario || 'Cold outreach to a tech startup CEO about productivity challenges'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Transcript Preview */}
                                        <div className="mb-4 p-3 bg-slate-50 rounded-lg border-l-4 border-purple-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm font-medium text-purple-800">Pitch Transcript</span>
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-3 italic">
                                                "{submission.transcript || 'Hi [Prospect Name], I noticed your company has been growing rapidly. We help companies like yours streamline operations and reduce costs by up to 30%. Would you be interested in a brief conversation about how this could benefit your team?'}"
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-4 h-4" />
                                                <span>{user?.display_name || user?.full_name || 'Anonymous Contributor'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{format(new Date(submission.created_date), 'MMM d')}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <Star className="w-3 h-3" />
                                                <span>Best Practice</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button size="sm" variant="outline" className="group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Listen
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-16">
                            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">
                                {submissions.length === 0 ? 'No pitches in library yet' : 'No matches found'}
                            </h3>
                            <p className="text-slate-500 mb-6">
                                {submissions.length === 0 
                                    ? 'Great submissions will appear here as they get added to the library.'
                                    : 'Try adjusting your search or filter criteria.'
                                }
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Link to={createPageUrl('CoachingHub')}>
                                    <Button>
                                        <GraduationCap className="w-4 h-4 mr-2" />
                                        Visit Coaching Hub
                                    </Button>
                                </Link>
                                <Button variant="outline" onClick={() => navigate(createPageUrl('CreatePitch'))}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Pitch
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submission Detail Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        {selectedSubmission && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className="bg-purple-100 text-purple-800">
                                            {categorizeSubmission(selectedSubmission)}
                                        </Badge>
                                        <Badge className={`${getScoreColor(selectedSubmission.score || 0)} font-bold`}>
                                            {selectedSubmission.score || 0}% Score
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-2xl">
                                        {tasks[selectedSubmission.task_id]?.task_title || 'Untitled Pitch'}
                                    </DialogTitle>
                                    <DialogDescription className="text-base">
                                        <strong>Scenario:</strong> {tasks[selectedSubmission.task_id]?.scenario || 'No scenario provided'}
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <Tabs defaultValue="recording" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="recording" className="flex items-center justify-center gap-2">
                                            <Play className="w-4 h-4" />
                                            Recording & Analysis
                                        </TabsTrigger>
                                        <TabsTrigger value="practice" className="flex items-center justify-center gap-2">
                                            <Target className="w-4 h-4" />
                                            Practice This Scenario
                                        </TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="recording" className="mt-6 space-y-6">
                                        {/* Audio Player */}
                                        {selectedSubmission.submission_url && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <Play className="w-5 h-5" />
                                                        Recording
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <audio controls className="w-full" src={selectedSubmission.submission_url}>
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                    <div className="mt-2 text-sm text-slate-500">
                                                        Duration: {Math.floor((selectedSubmission.duration_actual || 0) / 60)}:{((selectedSubmission.duration_actual || 0) % 60).toString().padStart(2, '0')} minutes
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Full Transcript Display */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-blue-500" />
                                                    Full Pitch Transcript
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-200">
                                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                        "{selectedSubmission.transcript || 'Transcript not available'}"
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* AI Analysis */}
                                        {selectedSubmission.ai_analysis && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <Star className="w-5 h-5 text-yellow-500" />
                                                        AI Analysis
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <pre className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap overflow-x-auto">
                                                        {JSON.stringify(JSON.parse(selectedSubmission.ai_analysis), null, 2)}
                                                    </pre>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Manager Feedback */}
                                        {selectedSubmission.manager_feedback && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <UserIcon className="w-5 h-5 text-blue-500" />
                                                        Manager Feedback
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <pre className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap overflow-x-auto">
                                                        {JSON.stringify(JSON.parse(selectedSubmission.manager_feedback), null, 2)}
                                                    </pre>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Contributor Info */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Contributor</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <UserIcon className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {users[selectedSubmission.submitted_by]?.display_name || 
                                                            users[selectedSubmission.submitted_by]?.full_name || 
                                                            'Anonymous'}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            Submitted on {format(new Date(selectedSubmission.created_date), 'MMMM d, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="practice" className="mt-6 space-y-6">
                                        {/* Practice This Scenario Section */}
                                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                                            <CardHeader>
                                                <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                                                    <Target className="w-6 h-6" />
                                                    Practice This Scenario
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <p className="text-sm text-blue-700 mb-4">
                                                    Use this pitch as inspiration for your own practice session. Choose your preferred practice method:
                                                </p>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer" 
                                                          onClick={() => handleStartPractice(selectedSubmission, 'self')}>
                                                        <CardContent className="p-4 text-center">
                                                            <Mic className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                                                            <h4 className="font-medium text-purple-800 mb-1">Self Practice</h4>
                                                            <p className="text-xs text-purple-600">Record yourself and get AI feedback</p>
                                                        </CardContent>
                                                    </Card>
                                                    
                                                    <Card className="border-2 border-indigo-200 hover:border-indigo-400 transition-colors cursor-pointer" 
                                                          onClick={() => handleStartPractice(selectedSubmission, 'ai')}>
                                                        <CardContent className="p-4 text-center">
                                                            <Bot className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                                                            <h4 className="font-medium text-indigo-800 mb-1">AI Roleplay</h4>
                                                            <p className="text-xs text-indigo-600">Practice with an AI prospect</p>
                                                        </CardContent>
                                                    </Card>
                                                    
                                                    <Card className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer" 
                                                          onClick={() => handleStartPractice(selectedSubmission, 'human')}>
                                                        <CardContent className="p-4 text-center">
                                                            <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                                            <h4 className="font-medium text-green-800 mb-1">Human Roleplay</h4>
                                                            <p className="text-xs text-green-600">Practice with a colleague</p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Enhanced Scenario Instructions for Human Roleplay */}
                                        {tasks[selectedSubmission.task_id] && tasks[selectedSubmission.task_id].scenario && (
                                            <Card className="bg-amber-50 border-amber-200">
                                                <CardHeader>
                                                    <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                                                        <Users className="w-5 h-5" />
                                                        Human Roleplay Instructions
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="text-sm text-amber-700">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <strong>For the Sales Rep:</strong>
                                                            <p>Your role is to deliver this pitch scenario. Use the example above as inspiration but make it your own.</p>
                                                        </div>
                                                        <div>
                                                            <strong>For the Prospect (Roleplay Partner):</strong>
                                                            <p className="bg-amber-100 p-3 rounded-lg mt-2">
                                                                {tasks[selectedSubmission.task_id].scenario.toLowerCase().includes('ceo') && 
                                                                    "You are a busy CEO who gets many sales calls. You're skeptical but will listen if the value is clear and relevant to your business challenges."
                                                                }
                                                                {tasks[selectedSubmission.task_id].scenario.toLowerCase().includes('vp') && 
                                                                    "You are a VP-level decision maker. You're analytical and want to see concrete benefits and ROI. Ask tough questions about implementation and results."
                                                                }
                                                                {tasks[selectedSubmission.task_id].scenario.toLowerCase().includes('director') && 
                                                                    "You are a department director focused on operational efficiency. You need solutions that won't disrupt your team's workflow."
                                                                }
                                                                {!tasks[selectedSubmission.task_id].scenario.toLowerCase().includes('ceo') && 
                                                                !tasks[selectedSubmission.task_id].scenario.toLowerCase().includes('vp') && 
                                                                !tasks[selectedSubmission.task_id].scenario.toLowerCase().includes('director') && 
                                                                    "Act as the prospect described in the scenario. Be realistic - show interest if the value proposition is compelling, but ask questions and raise objections as a real prospect would."
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Practice Tips */}
                                        <Card className="bg-green-50 border-green-200">
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                                                    <Lightbulb className="w-5 h-5" />
                                                    Practice Tips
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-sm text-green-700">
                                                <ul className="space-y-2">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                                                        <span>Study the transcript and note the key phrases and structure</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                                                        <span>Focus on the opening, value proposition, and call-to-action</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                                                        <span>Practice multiple times with different approaches</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
                                                        <span>Compare your performance to this benchmark</span>
                                                    </li>
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
