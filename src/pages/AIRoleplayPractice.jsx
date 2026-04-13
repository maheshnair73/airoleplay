import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play, Bot, Zap } from 'lucide-react';
import {
  RoleplaySetupLayout,
  RoleplaySetupSection,
  InfoBanner
} from '@/components/roleplay/RoleplaySetupLayout';

export default function AIRoleplayPractice() {
    const [botData, setBotData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const botName = urlParams.get('bot_name');
    const sessionType = urlParams.get('session_type');
    const originalSessionId = urlParams.get('original_session');

    useEffect(() => {
        // Create bot data based on the bot name and session type
        const createBotData = () => {
            const bot = {
                name: botName || 'Practice Bot',
                title: 'AI Prospect',
                company_name: 'Practice Company',
                personality: 'Analytical',
                roleplay_type: 'discovery',
                voice: 'english_male',
                language: 'english',
                traits: ['Professional', 'Analytical'],
                painPoints: ['Business challenges', 'Process inefficiencies'],
                background: `${botName} is a professional you'll be practicing with.`,
                difficulty: 'Medium'
            };
            
            setBotData(bot);
            setIsLoading(false);
        };
        
        if (botName) {
            createBotData();
        } else {
            setIsLoading(false);
        }
    }, [botName]);

    const handleStartPractice = () => {
        // Start the actual practice session
        const practiceParams = new URLSearchParams({
            auto_start: 'true',
            bot_data: JSON.stringify(botData)
        });
        
        window.location.href = createPageUrl(`AIRoleplay?${practiceParams.toString()}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 text-lg">Loading practice session...</p>
                </div>
            </div>
        );
    }

    if (!botData) {
        return (
            <div className="p-6 bg-slate-50 min-h-screen">
                <div className="max-w-2xl mx-auto text-center py-12">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Practice Session Not Found</h1>
                    <p className="text-slate-600 mb-6">The practice session you're looking for could not be loaded.</p>
                    <Button asChild>
                        <Link to={createPageUrl('AIRoleplay')}>
                            Back to AI Roleplay
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <RoleplaySetupLayout
            title={sessionType === 'repeat' ? 'Practice Again' : 'Start Practice Session'}
            description={sessionType === 'repeat' ? `Repeat your practice session with ${botData.name}` : `Begin a new practice session with ${botData.name}`}
            icon={Bot}
            backPath={createPageUrl('AIRoleplay')}
            backLabel="Back to Practice"
        >
            <RoleplaySetupSection
                title="Your Practice Partner"
                description="Review the prospect you'll be practicing with"
            >
                <Card className="bg-slate-50 border-0 shadow-none">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                {botData.name?.charAt(0) || 'B'}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">{botData.name}</h3>
                                <p className="text-sm text-slate-600">{botData.title} at {botData.company_name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-white rounded-lg">
                                <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                    Personality Traits
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {botData.traits?.map((trait, index) => (
                                        <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                                            {trait}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg">
                                <h4 className="font-semibold text-slate-700 text-sm mb-3">Pain Points</h4>
                                <div className="flex flex-wrap gap-2">
                                    {botData.painPoints?.map((pain, index) => (
                                        <Badge key={index} variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                                            {pain}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg">
                                <h4 className="font-semibold text-slate-700 text-sm mb-3">Configuration</h4>
                                <div className="space-y-1 text-xs text-slate-600">
                                    <p><span className="font-medium">Language:</span> {botData.language}</p>
                                    <p><span className="font-medium">Difficulty:</span> {botData.difficulty}</p>
                                    <p><span className="font-medium">Type:</span> {botData.roleplay_type}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </RoleplaySetupSection>

            <RoleplaySetupSection
                title="Start Your Practice"
                highlight
            >
                <div className="text-center py-8">
                    <p className="text-slate-600 mb-6">
                        {sessionType === 'repeat' ?
                            'This will start a new practice session with the same bot configuration.' :
                            'You\'ll have a live conversation with an AI that will respond as this prospect.'
                        }
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" asChild>
                            <Link to={createPageUrl('AIRoleplay')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            onClick={handleStartPractice}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-white"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            {sessionType === 'repeat' ? 'Practice Again' : 'Start Practice'}
                        </Button>
                    </div>
                </div>
            </RoleplaySetupSection>
        </RoleplaySetupLayout>
    );
}