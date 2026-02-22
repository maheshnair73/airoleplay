
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { CoachingTask } from '@/api/entities';
import { TaskSubmission } from '@/api/entities';
import { Lead } from '@/api/entities';
import { Deal } from '@/api/entities/Deal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Loader2, Star, Target, Users, TrendingUp, BookCopy, Repeat, DollarSign, Mail, Phone, Building, User as UserIcon, CheckCircle, Clock, Award, MessageSquare, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "sonner";
import { format } from 'date-fns';

export default function UserPerformance() {
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [leads, setLeads] = useState([]);
    const [deals, setDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const userEmail = searchParams.get('email');

    useEffect(() => {
        if (!userEmail) {
            setIsLoading(false);
            return;
        }
        loadData();
    }, [userEmail]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersData, submissionsData, allTasks, leadData, dealData] = await Promise.all([
                User.list().catch(() => []),
                TaskSubmission.filter({ submitted_by: userEmail }).catch(() => []),
                CoachingTask.list().catch(() => []),
                Lead.filter({ assigned_to_email: userEmail }).catch(() => []),
                Deal.filter({ created_by: userEmail }).catch(() => [])
            ]);

            // Find user by email in the users list (more robust matching)
            const userData = Array.isArray(usersData) ? 
                usersData.find(u => u && u.email && u.email.toLowerCase() === userEmail.toLowerCase()) : null;
            
            // If user not found in the list, create a minimal user object
            const finalUser = userData || { email: userEmail, full_name: null, role: 'user' };
            
            setUser(finalUser);
            setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
            setTasks(Array.isArray(allTasks) ? allTasks : []);
            setLeads(Array.isArray(leadData) ? leadData : []);
            setDeals(Array.isArray(dealData) ? dealData : []);

        } catch (error) {
            toast.error("Failed to load user performance data.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const getTaskDetails = (taskId) => tasks.find(t => t.id === taskId);

    const handleRetakeTask = async (taskId) => {
        try {
            const originalTask = tasks.find(t => t.id === taskId);
            if (!originalTask) return;
            
            window.location.href = createPageUrl(`CreateCoachingTask?editTaskId=${taskId}&retakeUserEmail=${encodeURIComponent(userEmail)}`);
        } catch (error) {
            toast.error("Failed to create retake task.");
        }
    };

    const stats = {
        avgScore: submissions.length > 0 ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length) : 0,
        tasksCompleted: submissions.length,
        assignedLeads: leads.length,
        activeDeals: deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length,
        totalPipeline: deals.reduce((acc, d) => acc + (d.deal_value || 0), 0),
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    
    if (!user) {
        return (
            <div className="p-6 space-y-4">
                <Link to={createPageUrl('CoachingHub')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" /> Back to Coaching Hub
                </Link>
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-lg text-slate-700">User not found</p>
                        <p className="text-slate-500 mt-2">Email: {userEmail}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                 <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{user.full_name || user.email}'s Performance</h1>
                        <p className="text-slate-500">Detailed performance metrics and coaching history.</p>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{user.full_name || user.email}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </CardDescription>
                            <Badge className="mt-2 bg-blue-100 text-blue-800">{user.role || 'User'}</Badge>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100">Avg Score</p>
                                    <p className="text-3xl font-bold">{stats.avgScore}%</p>
                                </div>
                                <Star className="w-8 h-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100">Tasks Done</p>
                                    <p className="text-3xl font-bold">{stats.tasksCompleted}</p>
                                </div>
                                <BookCopy className="w-8 h-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100">Leads</p>
                                    <p className="text-3xl font-bold">{stats.assignedLeads}</p>
                                </div>
                                <Users className="w-8 h-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100">Active Deals</p>
                                    <p className="text-3xl font-bold">{stats.activeDeals}</p>
                                </div>
                                <Target className="w-8 h-8 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-teal-100">Pipeline</p>
                                    <p className="text-2xl font-bold">${(stats.totalPipeline / 1000).toFixed(0)}K</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-teal-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Coaching History</CardTitle>
                        <CardDescription>Track performance across all coaching tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submissions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((submission) => {
                                        const task = getTaskDetails(submission.task_id);
                                        return (
                                            <TableRow key={submission.id}>
                                                <TableCell className="font-medium">{task?.task_title || 'Unknown Task'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-blue-700 bg-blue-50">
                                                        {task?.task_type || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(submission.created_date), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-500" />
                                                        <span>{submission.score || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-green-100 text-green-800">
                                                        {submission.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleRetakeTask(submission.task_id)}
                                                        className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                                    >
                                                        <Repeat className="w-4 h-4 mr-1" />
                                                        Assign Retake
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <BookCopy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No coaching tasks completed yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Leads</CardTitle>
                            <CardDescription>Currently assigned prospects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {leads.length > 0 ? (
                                <div className="space-y-4">
                                    {leads.slice(0, 5).map(lead => (
                                        <div key={lead.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{lead.company_name}</p>
                                                <p className="text-sm text-slate-500">{lead.contact_name}</p>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-800">{lead.status}</Badge>
                                        </div>
                                    ))}
                                    {leads.length > 5 && (
                                        <Link to={createPageUrl('Leads')}>
                                            <Button variant="outline" size="sm" className="w-full">
                                                View All Leads ({leads.length})
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-8">No leads assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Deals</CardTitle>
                            <CardDescription>Deals currently in progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {deals.length > 0 ? (
                                <div className="space-y-4">
                                    {deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).slice(0, 5).map(deal => (
                                        <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{deal.deal_name}</p>
                                                <p className="text-sm text-slate-500">${(deal.deal_value || 0).toLocaleString()}</p>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800">{deal.stage}</Badge>
                                        </div>
                                    ))}
                                    <Link to={createPageUrl('Deals')}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            View All Deals ({deals.length})
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-8">No active deals</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
