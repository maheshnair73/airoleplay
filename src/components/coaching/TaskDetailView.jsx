import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, Mic, Monitor, User as UserIcon, CheckCircle, Clock, Eye, AlertCircle, Calendar, Info, BookOpen, Phone, ExternalLink } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { createPageUrl } from '@/utils';

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
    const [materials, setMaterials] = useState([]);
    const [roleplayBot, setRoleplayBot] = useState(null);
    const [loadingMaterials, setLoadingMaterials] = useState(true);

    if (!task) return null;

    const safeSubmissions = Array.isArray(submissions) ? submissions : [];
    const safeAssignedUsers = Array.isArray(assignedUsers) ? assignedUsers : [];

    const submissionsByUserId = safeSubmissions.reduce((acc, sub) => {
        if (sub?.submitted_by) acc[sub.submitted_by] = sub;
        return acc;
    }, {});

    useEffect(() => {
        const fetchTaskMaterials = async () => {
            if (!task?.id) return;

            try {
                const { data: taskMaterials, error: materialsError } = await supabase
                    .from('coaching_task_materials')
                    .select(`
                        *,
                        material:roleplay_knowledge_materials (*)
                    `)
                    .eq('task_id', task.id)
                    .order('reading_order', { ascending: true });

                if (!materialsError && taskMaterials) {
                    setMaterials(taskMaterials.map(tm => tm.material).filter(Boolean));
                }

                if (task.roleplay_bot_id) {
                    const { data: bot, error: botError } = await supabase
                        .from('ai_clients')
                        .select('*')
                        .eq('id', task.roleplay_bot_id)
                        .single();

                    if (!botError && bot) {
                        setRoleplayBot({
                            ...bot,
                            name: [bot.first_name, bot.last_name].filter(Boolean).join(' ') || 'AI Client'
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching task materials:', error);
            } finally {
                setLoadingMaterials(false);
            }
        };

        fetchTaskMaterials();
    }, [task?.id, task?.roleplay_bot_id]);

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
                <TabsList className={`grid w-full ${materials.length > 0 || roleplayBot ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <TabsTrigger value="submissions">Submissions & Progress</TabsTrigger>
                    <TabsTrigger value="details">Task Details</TabsTrigger>
                    {(materials.length > 0 || roleplayBot) && (
                        <TabsTrigger value="training">Training Materials</TabsTrigger>
                    )}
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

                {(materials.length > 0 || roleplayBot) && (
                    <TabsContent value="training" className="mt-6">
                        <div className="space-y-6">
                            {roleplayBot && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-blue-600" />
                                            AI Roleplay Practice
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                    {roleplayBot.name?.charAt(0) || 'A'}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900">{roleplayBot.name}</h4>
                                                    <p className="text-sm text-slate-600">
                                                        {roleplayBot.title} at {roleplayBot.company_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        After completing this task, practice your skills with this AI client
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-3"
                                                        onClick={() => window.open(createPageUrl(`AIRoleplay?bot_id=${roleplayBot.id}`), '_blank')}
                                                    >
                                                        <Phone className="w-4 h-4 mr-2" />
                                                        Start AI Roleplay
                                                        <ExternalLink className="w-3 h-3 ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {materials.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-blue-600" />
                                            Required Training Materials
                                            {task.requires_material_review && (
                                                <Badge variant="destructive" className="ml-2">Required</Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {task.requires_material_review && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-amber-900 font-medium">
                                                    You must review all training materials before starting this task
                                                </p>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            {materials.map((material, index) => (
                                                <div
                                                    key={material.id}
                                                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-semibold text-slate-900">{material.title}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {material.category}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="text-xs capitalize">
                                                                        {material.material_type}
                                                                    </Badge>
                                                                    <span className="text-xs text-slate-500">Reading order: {index + 1}</span>
                                                                </div>
                                                                {material.description && (
                                                                    <p className="text-sm text-slate-600 mt-2">{material.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-900">
                                                <strong>Note:</strong> These materials will be referenced by the AI coach during your roleplay practice
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}