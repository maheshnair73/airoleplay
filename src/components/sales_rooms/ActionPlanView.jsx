import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Circle, Upload, Download, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ActionItem = ({ item }) => {
    const isCompleted = item.status === 'completed';

    return (
        <div className="flex items-start gap-4 p-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors">
            <div className="mt-1">
                {isCompleted ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-slate-300" />}
            </div>
            <div className="flex-1">
                <h4 className={`font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{item.title}</h4>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
                    <div className="flex -space-x-2 overflow-hidden">
                        {item.assigned_to?.slice(0, 3).map((assignee, i) => (
                           <Avatar key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white">
                                <AvatarFallback>{assignee.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        ))}
                         {item.assigned_to?.length > 3 && <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-white"><AvatarFallback>+{item.assigned_to.length - 3}</AvatarFallback></Avatar>}
                    </div>
                    {item.due_date && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3"/>
                            Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3"/>
                        {item.comments_count || 0} Comments
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {item.resource_count > 0 && (
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        {item.resource_count} Resources
                    </Button>
                )}
                <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                </Button>
            </div>
        </div>
    );
}

export default function ActionPlanView({ sections }) {
    const actionPlanSection = sections.find(s => s.type === 'mutual_action_plan');
    if (!actionPlanSection || !actionPlanSection.action_items) {
        return <p>No action plan has been defined for this room.</p>;
    }

    const actionItems = actionPlanSection.action_items || [];
    const completedCount = actionItems.filter(item => item.status === 'completed').length;
    const progress = actionItems.length > 0 ? (completedCount / actionItems.length) * 100 : 0;
    
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">{actionPlanSection.title}</h2>
                <p className="text-slate-500">This will give you a clear picture of our entire process.</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">{completedCount} / {actionItems.length} Completed</h3>
                            <div className="w-1/3">
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        {actionItems.map((item, index) => (
                            <ActionItem key={item.id || index} item={item} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}