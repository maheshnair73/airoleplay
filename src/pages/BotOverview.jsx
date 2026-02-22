
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RoleplaySession } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Play, User as UserIcon, BookOpen, Mail, Phone, Globe, Building2, AlertTriangle, Target } from 'lucide-react';

const BotOverviewComponent = ({ botName, botDetails }) => {
    const defaultBot = {
        name: botName,
        title: botDetails?.title || 'AI Prospect',
        company_name: botDetails?.company_name || 'TechFlow Industries',
        industry: botDetails?.industry || 'Technology',
        personality: botDetails?.personality || 'Analytical',
        background: botDetails?.background || `${botName} is a ${botDetails?.title || 'decision maker'} at ${botDetails?.company_name || 'their company'}. They are focused on driving business results and evaluating new solutions.`,
        painPoints: botDetails?.painPoints || [
            'Managing multiple vendor relationships',
            'Ensuring ROI on technology investments', 
            'Scaling operations efficiently',
            'Meeting quarterly targets'
        ],
        traits: botDetails?.traits || [
            'Data-driven decision maker',
            'Values clear ROI and metrics',
            'Appreciates well-prepared presentations',
            'Focused on business outcomes'
        ]
    };

    const bot = { ...defaultBot, ...botDetails };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                        Contact Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                            {bot.name?.toLowerCase().replace(/\s+/g, '.')}@{bot.company_name?.toLowerCase().replace(/\s+/g, '')}.com
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                            www.{bot.company_name?.toLowerCase().replace(/\s+/g, '')}.com
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        Company Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <p className="text-sm font-medium text-slate-700">Industry:</p>
                        <p className="text-sm text-slate-600">{bot.industry}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">Size:</p>
                        <p className="text-sm text-slate-600">201-1000 employees</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">Communication Style:</p>
                        <Badge variant="outline" className="text-xs">{bot.personality}</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <BookOpen className="w-5 h-5 text-green-600" />
                        Background & Context
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed">{bot.background}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        Current Challenges
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {bot.painPoints.map((challenge, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                {challenge}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <Target className="w-5 h-5 text-green-600" />
                        Goals & Objectives
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {bot.traits.map((trait, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                {trait}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default function BotOverviewPage() {
    const [botDetails, setBotDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const botName = urlParams.get('bot_name');

    useEffect(() => {
        const loadBotDetails = async () => {
            if (!botName) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                // Find the first session for this bot to extract its configuration
                const sessions = await RoleplaySession.filter({ bot_name: botName }, '-created_date', 1);
                if (sessions.length > 0 && sessions[0].bot_configuration) {
                    const config = JSON.parse(sessions[0].bot_configuration);
                    setBotDetails({ ...config, name: config.name || botName });
                } else {
                     setBotDetails({ name: botName, title: 'AI Prospect', company_name: 'Unknown Company' });
                }
            } catch (error) {
                console.error('Error loading bot details:', error);
                setBotDetails({ name: botName, title: 'AI Prospect', company_name: 'Unknown Company' });
            } finally {
                setIsLoading(false);
            }
        };
        
        loadBotDetails();
    }, [botName]);

    const handleStartPractice = () => {
        if (!botDetails) return; // Prevent navigation if botDetails isn't loaded yet
        const practiceParams = new URLSearchParams({
            auto_start: 'true',
            bot_data: JSON.stringify(botDetails)
        });
        // Use navigate for SPA-friendly navigation
        navigate(createPageUrl(`AIRoleplay?${practiceParams.toString()}`));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 text-lg">Loading bot details...</p>
                </div>
            </div>
        );
    }
    
    // If not loading and botDetails is null (e.g., botName was missing or an error occurred),
    // we still display the page with default or partial info based on how BotOverviewComponent handles it.
    // The current BotOverviewComponent handles null/undefined botDetails gracefully.

    return (
        <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="hover:bg-white shadow-sm">
                            <Link to={createPageUrl('AIRoleplay')}>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-1">{botDetails?.name || botName}</h1>
                            <p className="text-slate-500">Bot Overview & Pre-call Brief</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleStartPractice}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Practice with this Bot
                    </Button>
                </div>
                <BotOverviewComponent botName={botName} botDetails={botDetails} />
            </div>
        </div>
    );
}
