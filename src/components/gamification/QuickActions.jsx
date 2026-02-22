import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Phone, 
    Users, 
    FileText, 
    Mic, 
    Target,
    Zap,
    Clock,
    TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const quickActions = [
    {
        id: 'make_call',
        title: 'Make a Call',
        description: 'Connect with a prospect',
        icon: Phone,
        points: 25,
        url: 'effyLeads',
        gradient: 'from-blue-500 to-blue-600'
    },
    {
        id: 'practice_roleplay',
        title: 'AI Roleplay',
        description: 'Practice your pitch',
        icon: Mic,
        points: 30,
        url: 'AIRoleplay',
        gradient: 'from-purple-500 to-purple-600'
    },
    {
        id: 'create_proposal',
        title: 'Create Proposal',
        description: 'Send winning proposals',
        icon: FileText,
        points: 40,
        url: 'Documents',
        gradient: 'from-green-500 to-green-600'
    },
    {
        id: 'add_lead',
        title: 'Add New Lead',
        description: 'Grow your pipeline',
        icon: Users,
        points: 15,
        url: 'effyLeads',
        gradient: 'from-orange-500 to-orange-600'
    }
];

export default function QuickActions({ gameProfile }) {
    const [dailyProgress, setDailyProgress] = useState({
        calls: { current: 2, target: 10 },
        roleplay: { current: 1, target: 3 },
        proposals: { current: 0, target: 2 },
        leads: { current: 5, target: 15 }
    });

    return (
        <div className="space-y-6">
            {/* Daily Goals Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Today's Goals
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(dailyProgress).map(([key, progress]) => {
                        const percentage = Math.min((progress.current / progress.target) * 100, 100);
                        const isComplete = percentage >= 100;
                        
                        return (
                            <div key={key}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium capitalize">
                                        {key.replace('_', ' ')}
                                        {isComplete && <span className="text-green-600 ml-2">✓</span>}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        {progress.current}/{progress.target}
                                    </span>
                                </div>
                                <Progress 
                                    value={percentage} 
                                    className={`h-2 ${isComplete ? '[&>div]:bg-green-500' : ''}`} 
                                />
                            </div>
                        );
                    })}
                    
                    <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Daily Bonus:</span>
                            <Badge className="bg-yellow-100 text-yellow-800">
                                Complete all for +100 pts
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                        <Link key={action.id} to={createPageUrl(action.url)}>
                            <Card className={`bg-gradient-to-br ${action.gradient} text-white hover:shadow-lg transition-all duration-200 cursor-pointer group`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <IconComponent className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        <Badge className="bg-white/20 text-white text-xs">
                                            +{action.points} pts
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                                    <p className="text-xs opacity-90">{action.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Weekly Challenge Reminder */}
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm text-orange-900">
                                Weekly Challenge: Cold Call Champion
                            </h4>
                            <p className="text-xs text-orange-700">
                                Make 50 calls this week • 3 days left
                            </p>
                        </div>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                            View
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}