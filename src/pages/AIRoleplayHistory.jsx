
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RoleplaySession } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Search, Calendar, Clock, Target, TrendingUp,
    Play, BarChart3, Filter, ChevronRight, User, X, Plus,
    ArrowLeft, MessageSquare, Award, Bot, Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { Progress } from '@/components/ui/progress';

export default function AIRoleplayHistory() {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sessions');
    // Removed isUploading and fileInputRef as real call analytics are moved
    const navigate = useNavigate();

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await RoleplaySession.list('-created_date');
            setSessions(data);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const stats = useMemo(() => {
        if (!sessions.length) {
            return {
                totalSessions: 0,
                averageScore: 0,
                totalPracticeTime: 0,
                totalBots: 0,
            };
        }

        const totalSessions = sessions.length;
        const totalScore = sessions.reduce((sum, s) => sum + (s.analysis_results?.overall_score || 0), 0);
        const averageScore = (totalScore / totalSessions).toFixed(0);
        const totalPracticeTime = sessions.reduce((sum, s) => sum + (s.session_duration || 0), 0);
        const uniqueBots = new Set(sessions.map(s => s.bot_name)).size;

        return {
            totalSessions,
            averageScore,
            totalPracticeTime,
            totalBots: uniqueBots,
        };
    }, [sessions]);

    const skillAreas = useMemo(() => [
        { name: "Opening & Rapport Building", score: 85 },
        { name: "Discovery Questions", score: 78 },
        { name: "Value Proposition", score: 92 },
        { name: "Objection Handling", score: 70 },
        { name: "Closing Techniques", score: 74 }
    ], []);

    const botPerformance = useMemo(() => [
        { bot_name: "Kathy Wood", personality: "VP of Sales", sessions_count: 24, average_score: 87, avatar_color: "from-blue-500 to-purple-500" },
        { bot_name: "Mark Stevens", personality: "Customer Success Manager", sessions_count: 18, average_score: 75, avatar_color: "from-green-500 to-teal-500" },
        { bot_name: "Sarah Johnson", personality: "Product Manager", sessions_count: 10, average_score: 62, avatar_color: "from-orange-500 to-red-500" },
        { bot_name: "John Doe", personality: "CEO Startup", sessions_count: 5, average_score: 91, avatar_color: "from-pink-500 to-yellow-500" },
    ], []);

    // Removed handleUploadClick and handleFileChange as real call analytics are moved

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading session history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-6">
                <Link to={createPageUrl('AIRoleplay')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to AI Roleplay
                </Link>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Roleplay Analytics</h1>
                        <p className="text-slate-600">Track your progress and practice with AI prospects.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link to={createPageUrl('CallInsights')}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Real Call Analytics
                            </Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <Link to={createPageUrl('AIRoleplay')}>
                                <Play className="w-4 h-4 mr-2" />
                                Start New Session
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Sessions</CardTitle>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalSessions}</div>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Average Score</CardTitle>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Award className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.averageScore}%</div>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +5% improvement
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Practice Time</CardTitle>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Clock className="h-4 w-4 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{Math.round(stats.totalPracticeTime / 60)}min</div>
                            <p className="text-xs text-slate-500 mt-1">This month</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Active Bots</CardTitle>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Bot className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalBots}</div>
                            <p className="text-xs text-slate-500 mt-1">Available for practice</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
                    <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm"> {/* Changed to grid-cols-3 */}
                        <TabsTrigger value="sessions" className="text-slate-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            AI Practice Sessions
                        </TabsTrigger>
                        {/* Removed Real Call Analytics tab trigger */}
                        <TabsTrigger value="progress" className="text-slate-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            Progress Tracking
                        </TabsTrigger>
                        <TabsTrigger value="roleplay_bots" className="text-slate-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            Bot Performance
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="sessions" className="mt-6">
                        <Card className="bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-200 p-6">
                                <CardTitle className="text-xl text-slate-900">Recent Practice Sessions</CardTitle>
                                <CardDescription className="text-slate-600">
                                    Your latest roleplay sessions with AI prospects
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {sessions.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {sessions.map((session) => (
                                            <div key={session.id} className="p-6 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {session.bot_name?.charAt(0) || 'B'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">{session.bot_name || 'Unknown Bot'}</h4>
                                                            <p className="text-sm text-slate-600">{session.scenario || 'AI roleplay session completed'}</p>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatDuration(session.session_duration || 0)}
                                                                </span>
                                                                <span className="text-xs text-slate-500">
                                                                    {format(new Date(session.created_date), 'MMM d, yyyy')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className={`text-lg font-bold ${
                                                                (session.analysis_results?.overall_score || 0) >= 80 ? 'text-green-600' :
                                                                (session.analysis_results?.overall_score || 0) >= 60 ? 'text-yellow-600' :
                                                                'text-red-600'
                                                            }`}>
                                                                {session.analysis_results?.overall_score || 0}%
                                                            </div>
                                                            <div className="text-xs text-slate-500">Overall</div>
                                                        </div>
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Link to={createPageUrl(`AIRoleplayAnalysis?id=${session.id}`)}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-slate-600 mb-2">No sessions yet</h3>
                                        <p className="text-slate-500 mb-4">Start practicing with AI roleplay to see your sessions here</p>
                                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                            <Link to={createPageUrl('AIRoleplay')}>
                                                <Play className="w-4 h-4 mr-2" />
                                                Start First Session
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* Removed the 'real_calls' tab content entirely */}

                    <TabsContent value="progress" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-white shadow-sm">
                                <CardHeader className="border-b border-slate-200 p-6">
                                    <CardTitle className="text-lg text-slate-900">Score Trends</CardTitle>
                                    <CardDescription className="text-slate-600">Your performance over time</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="text-center py-8">
                                        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">Score tracking visualization coming soon</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white shadow-sm">
                                <CardHeader className="border-b border-slate-200 p-6">
                                    <CardTitle className="text-lg text-slate-900">Skill Breakdown</CardTitle>
                                    <CardDescription className="text-slate-600">Areas of strength and improvement</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {skillAreas.map((skill) => (
                                            <div key={skill.name}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slate-700">{skill.name}</span>
                                                    <span className="text-slate-600">{skill.score}%</span>
                                                </div>
                                                <Progress value={skill.score} className="h-2 bg-blue-100 [&>*]:bg-blue-600" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="roleplay_bots" className="mt-6">
                        <Card className="bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-200 p-6 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl text-slate-900">Bot Performance Analytics</CardTitle>
                                    <CardDescription className="text-slate-600">
                                        See how you perform with different AI prospects
                                    </CardDescription>
                                </div>
                                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                    <Link to={createPageUrl('CreateRoleplayBot')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create New Bot
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {botPerformance.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {botPerformance.map((bot) => (
                                            <div key={bot.bot_name} className="p-6 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 bg-gradient-to-br ${bot.avatar_color} rounded-full flex items-center justify-center text-white font-bold`}>
                                                            {bot.bot_name?.charAt(0) || 'B'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">{bot.bot_name}</h4>
                                                            <p className="text-sm text-slate-600">{bot.personality} • {bot.sessions_count} sessions</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-slate-900">{bot.average_score}%</div>
                                                            <div className="text-xs text-slate-500">Average Score</div>
                                                        </div>
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            {/* **CHANGE:** Link to the dedicated performance page */}
                                                            <Link to={createPageUrl(`BotPerformanceDetails?bot_name=${encodeURIComponent(bot.bot_name)}`)}>
                                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                                View Performance
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Bot className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-slate-600 mb-2">No bot performance data</h3>
                                        <p className="text-slate-500 mb-4">Practice with different bots to see performance comparisons</p>
                                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                            <Link to={createPageUrl('CreateRoleplayBot')}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Your First Bot
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
