import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Mic, Video, Monitor, User, Calendar } from 'lucide-react';

export default function TaskCard({ task, onViewDetails, onStartSubmission, userSubmissions = [] }) {
    const getTaskIcon = () => {
        switch (task.task_type) {
            case 'audio': return <Mic className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case 'screen_recording': return <Monitor className="w-5 h-5" />;
            default: return <Mic className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const userSubmission = userSubmissions.find(sub => sub.task_id === task.id);
    const hasSubmitted = !!userSubmission;

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        {getTaskIcon()}
                        {task.task_title}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Badge className={getStatusColor(task.status)}>
                            {task.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                            {task.task_type.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>
                
                {/* Task Creator and Date */}
                <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                    {task.created_by && (
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Created by: {task.created_by}</span>
                        </div>
                    )}
                    {task.created_date && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(task.created_date).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-4">
                    <p className="text-slate-600 text-sm line-clamp-2">
                        {task.scenario}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-slate-600">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(task.duration_seconds)} max</span>
                            </div>
                            
                            {task.assigned_users && task.assigned_users.length > 0 && (
                                <div className="flex items-center gap-1 text-slate-600">
                                    <Users className="w-4 h-4" />
                                    <span>{task.assigned_users.length} assigned</span>
                                </div>
                            )}
                            
                            {task.due_date && (
                                <div className="text-slate-600">
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submission Status */}
                    {hasSubmitted && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-800">
                                        Status: <span className="capitalize">{userSubmission.status}</span>
                                    </p>
                                    {userSubmission.score && (
                                        <p className="text-sm text-blue-600">
                                            Score: {userSubmission.score}/100
                                        </p>
                                    )}
                                </div>
                                {userSubmission.status === 'reviewed' && userSubmission.score && (
                                    <Badge className={
                                        userSubmission.score >= 80 ? 'bg-green-100 text-green-800' :
                                        userSubmission.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }>
                                        {userSubmission.score >= 80 ? 'Excellent' :
                                         userSubmission.score >= 60 ? 'Good' : 'Needs Work'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => onViewDetails(task)}
                            className="flex-1"
                        >
                            View Details
                        </Button>
                        
                        {task.status === 'active' && (
                            <Button
                                onClick={() => onStartSubmission(task)}
                                className="flex-1"
                            >
                                {hasSubmitted ? 'Resubmit' : 'Start Task'}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}