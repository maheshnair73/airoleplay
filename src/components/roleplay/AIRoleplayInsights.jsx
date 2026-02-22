import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Target, TrendingUp, Sparkles } from 'lucide-react';

const AIRoleplayInsights = ({ prospects, onSelectProspect }) => {
    // Generate insights based on available prospects
    const insights = [
        {
            id: 'skill-gap',
            title: 'Coach Suggests: Focus on Objections',
            description: 'Your last session showed difficulty with price objections. Challenge yourself with a prospect who is highly ROI-focused.',
            prospectName: prospects.find(p => p.personality === 'Analytical')?.name || prospects[0]?.name,
            icon: Target,
            color: 'border-red-200 bg-red-50',
            badgeColor: 'bg-red-500',
        },
        {
            id: 'persona-practice',
            title: 'New Challenge: Formal Personality',
            description: "You haven't practiced with a 'Formal' personality yet. Try a call to work on your professional tone and conciseness.",
            prospectName: prospects.find(p => p.personality === 'Formal')?.name || prospects[1]?.name,
            icon: Lightbulb,
            color: 'border-blue-200 bg-blue-50',
            badgeColor: 'bg-blue-500',
        },
        {
            id: 'positive-reinforcement',
            title: 'Strength to Build On: Talk Ratio',
            description: 'Your talk-to-listen ratio was excellent in your last call. Apply that skill to a "Nice" but busy prospect.',
            prospectName: prospects.find(p => p.personality === 'Nice')?.name || prospects[2]?.name,
            icon: TrendingUp,
            color: 'border-green-200 bg-green-50',
            badgeColor: 'bg-green-500',
        }
    ].filter(insight => insight.prospectName); // Only show insights for available prospects
    
    const handleActionClick = (prospectName) => {
        const prospect = prospects.find(p => p.name === prospectName);
        if (prospect) {
            onSelectProspect(prospect);
        }
    };

    // Only show if we have prospects and insights
    if (prospects.length === 0 || insights.length === 0) {
        return null;
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    AI Coach's Corner
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insights.map((insight) => (
                        <Card 
                            key={insight.id} 
                            className={`${insight.color} border-2 hover:shadow-md transition-shadow`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <insight.icon className="w-5 h-5 text-slate-600" />
                                    <h3 className="font-semibold text-slate-800 text-sm">{insight.title}</h3>
                                </div>
                                <p className="text-xs text-slate-600 mb-4">{insight.description}</p>
                                <Button 
                                    size="sm"
                                    variant="outline"
                                    className="w-full bg-white"
                                    onClick={() => handleActionClick(insight.prospectName)}
                                >
                                    Practice with {insight.prospectName}
                                    <ArrowRight className="w-3 h-3 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AIRoleplayInsights;