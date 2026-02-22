import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Video, Mic, Monitor, User as UserIcon, CheckCircle, Clock, Eye, AlertCircle, Calendar, Info } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const TaskIcon = ({ type, className }) => {
    const icons = { video: Video, audio: Mic, screen_recording: Monitor };
    const Icon = icons[type] || Video;
    return <Icon className={className} />;
};

const SubmissionStatusIcon = ({ status }) => {
    const config = {
        submitted: { icon: <Clock className="w-4 h-4 text-blue-500" />, text: "Submitted" },
        under_review: { icon: <Clock className="w-4 h-4 text-yellow-500" />, text: "In Review" },
        reviewed: { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: "Reviewed" },
        needs_revision: { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: "Needs Revision" },
    };
    const { icon, text } = config[status] || config.submitted;
    return <div title={text}>{icon}</div>;
};

export default function TaskDetailView({ task, submissions = [], assignedUsers = [], onBack, onReview }) {
    if (!task) return null;

    const safeSubmissions = Array.isArray(submissions) ? submissions : [];
    const safeAssignedUsers = Array.isArray(assignedUsers) ? assignedUsers : [];

    const submissionsByUserId = safeSubmissions.reduce((acc, sub) => {
        if (sub?.submitted_by) acc[sub.submitted_by] = sub;
        return acc;
    }, {});

    return (
        <div className="p-6 space-y-8">
            <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2"/> Back to All Tasks</Button>
            
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <TaskIcon type={task.task_type} className="w-8 h-8 text-slate-700"/>
                    <h1 className="text-4xl font-bold text-slate-900">{task.task_title || "Untitled Task"}</h1>
                </div>
                <p className="text-slate-600 text-lg">{task.scenario || "No scenario provided."}</p>
            </header>

            <Tabs defaultValue="submissions">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="submissions">Submissions & Progress</TabsTrigger>
                    <TabsTrigger value="details">Task Details</TabsTrigger>
                </TabsList>
                <TabsContent value="submissions" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Participant Progress</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {safeAssignedUsers.length > 0 ? safeAssignedUsers.map(user => {
                                    if (!user || !user.id) return null;
                                    const submission = submissionsByUserId[user.email];
                                    return (
                                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                                            <div className="flex items-center gap-3"><UserIcon className="w-5 h-5 text-slate-400" /><span className="font-medium">{user.full_name || user.email}</span></div>
                                            <div className="flex items-center gap-4">
                                                {submission ? (
                                                    <>
                                                        <SubmissionStatusIcon status={submission.status} />
                                                        <span className="text-sm text-slate-500">{formatDistanceToNow(new Date(submission.created_date), { addSuffix: true })}</span>
                                                        <Button variant="outline" size="sm" onClick={() => onReview(submission)}><Eye className="w-4 h-4 mr-2" /> Review</Button>
                                                    </>
                                                ) : (<span className="text-sm text-slate-400">Not started</span>)}
                                            </div>
                                        </div>
                                    );
                                }) : <p className="text-slate-500 text-center py-4">No users have been assigned to this task.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="details" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Task Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-slate-800">Instructions</h3>
                                <p className="text-slate-600 whitespace-pre-wrap">{task.description || "No instructions provided."}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <p className="flex items-center gap-2 text-slate-600"><Clock className="w-4 h-4 text-slate-400"/> Max Duration: {task.duration_seconds || 'N/A'} seconds</p>
                                {task.due_date && <p className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-slate-400"/> Due Date: {format(new Date(task.due_date), 'PPP')}</p>}
                                <p className="flex items-center gap-2 text-slate-600"><Info className="w-4 h-4 text-slate-400"/> Task Type: <span className="capitalize">{task.task_type?.replace('_', ' ') || 'N/A'}</span></p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}