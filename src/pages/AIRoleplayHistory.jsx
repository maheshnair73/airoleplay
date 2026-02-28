
import React, { useState, useEffect, useMemo } from 'react';
import { RoleplaySession } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search, Calendar, Clock, Target, TrendingUp,
    Play, BarChart3, Filter, ChevronRight, User, Users,
    ArrowLeft, MessageSquare, Award, Bot, Eye, Video, Mic
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

export default function AIRoleplayHistory() {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await RoleplaySession.list('-created_at');

            if (data && data.length > 0) {
                setSessions(data);
            } else {
                setSessions(getDummyData());
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
            setSessions(getDummyData());
        } finally {
            setIsLoading(false);
        }
    };

    const getDummyData = () => {
        const now = new Date();
        return [
            {
                id: 'dummy-1',
                session_type: 'ai_roleplay',
                bot_name: 'Sarah Johnson',
                scenario: 'Cold outreach to VP of Sales at TechCorp - Discovery call focused on pain points',
                created_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 420,
                analysis_results: { overall_score: 87 }
            },
            {
                id: 'dummy-2',
                session_type: 'multi_party',
                bot_name: 'Executive Panel',
                scenario: 'Multi-stakeholder demo with CTO, CFO, and VP of Operations',
                created_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 1800,
                analysis_results: { overall_score: 72 }
            },
            {
                id: 'dummy-3',
                session_type: 'human_roleplay',
                bot_name: null,
                initiator_email: 'john.rep@company.com',
                prospect_player_email: 'mentor@company.com',
                scenario: 'Handling pricing objections - Manager coaching session',
                created_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 900,
                analysis_results: { overall_score: 91 }
            },
            {
                id: 'dummy-4',
                session_type: 'ai_roleplay',
                bot_name: 'Mark Chen',
                scenario: 'Follow-up call after demo - Addressing technical concerns',
                created_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 600,
                analysis_results: { overall_score: 65 }
            },
            {
                id: 'dummy-5',
                session_type: 'multi_party',
                bot_name: 'Procurement Team',
                scenario: 'Negotiation with procurement team - Multiple decision makers',
                created_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 2100,
                analysis_results: { overall_score: 78 }
            },
            {
                id: 'dummy-6',
                session_type: 'ai_roleplay',
                bot_name: 'Emily Rodriguez',
                scenario: 'Product demo for SMB customer - Feature walkthrough',
                created_date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 1200,
                analysis_results: { overall_score: 94 }
            },
            {
                id: 'dummy-7',
                session_type: 'human_roleplay',
                bot_name: null,
                initiator_email: 'sarah.rep@company.com',
                prospect_player_email: 'team.lead@company.com',
                scenario: 'Enterprise deal closing - C-level stakeholder engagement',
                created_date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 1500,
                analysis_results: { overall_score: 82 }
            },
            {
                id: 'dummy-8',
                session_type: 'ai_roleplay',
                bot_name: 'David Park',
                scenario: 'Objection handling - Budget and timing concerns',
                created_date: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 480,
                analysis_results: { overall_score: 58 }
            },
            {
                id: 'dummy-9',
                session_type: 'multi_party',
                bot_name: 'Security Review Panel',
                scenario: 'Security and compliance discussion with IT and Legal teams',
                created_date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 1680,
                analysis_results: { overall_score: 85 }
            },
            {
                id: 'dummy-10',
                session_type: 'ai_roleplay',
                bot_name: 'Lisa Thompson',
                scenario: 'Discovery call with startup founder - Understanding growth challenges',
                created_date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 720,
                analysis_results: { overall_score: 76 }
            },
            {
                id: 'dummy-11',
                session_type: 'human_roleplay',
                bot_name: null,
                initiator_email: 'mike.rep@company.com',
                prospect_player_email: 'coach@company.com',
                scenario: 'Value proposition refinement - Peer practice session',
                created_date: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 840,
                analysis_results: { overall_score: 88 }
            },
            {
                id: 'dummy-12',
                session_type: 'ai_roleplay',
                bot_name: 'Rachel Green',
                scenario: 'Competitive situation - Defending against competitor comparison',
                created_date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 660,
                analysis_results: { overall_score: 69 }
            },
            {
                id: 'dummy-13',
                session_type: 'product_demo',
                bot_name: 'Alex Martinez - CTO',
                scenario: 'Product Demo: Enterprise Platform Features Walkthrough',
                created_date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 2400,
                analysis_results: { overall_score: 89 }
            },
            {
                id: 'dummy-14',
                session_type: 'product_demo',
                bot_name: 'Jennifer Lee - VP Product',
                scenario: 'Product Demo: Analytics Dashboard Deep Dive',
                created_date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                session_duration: 1800,
                analysis_results: { overall_score: 92 }
            }
        ];
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

    const roleplayTypes = [
        { id: 'all', label: 'All Types', icon: MessageSquare, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
        { id: 'ai_roleplay', label: 'Single AI Roleplay', icon: Mic, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
        { id: 'multi_party', label: 'Multi-Party AI', icon: Users, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
        { id: 'human_roleplay', label: 'Human-to-Human', icon: Video, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
        { id: 'product_demo', label: 'Product Demo', icon: Bot, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    ];

    const filteredSessions = useMemo(() => {
        let filtered = sessions;

        if (selectedType !== 'all') {
            filtered = filtered.filter(s => s.session_type === selectedType);
        }

        if (searchQuery) {
            filtered = filtered.filter(s =>
                s.bot_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.scenario?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.initiator_email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [sessions, selectedType, searchQuery]);

    const stats = useMemo(() => {
        if (!sessions.length) {
            return {
                totalSessions: 0,
                aiSessions: 0,
                multiPartySessions: 0,
                humanSessions: 0,
                productDemoSessions: 0,
                averageScore: 0,
                totalPracticeTime: 0,
            };
        }

        const totalSessions = sessions.length;
        const aiSessions = sessions.filter(s => s.session_type === 'ai_roleplay').length;
        const multiPartySessions = sessions.filter(s => s.session_type === 'multi_party').length;
        const humanSessions = sessions.filter(s => s.session_type === 'human_roleplay').length;
        const productDemoSessions = sessions.filter(s => s.session_type === 'product_demo').length;
        const totalScore = sessions.reduce((sum, s) => sum + (s.analysis_results?.overall_score || 0), 0);
        const averageScore = (totalScore / totalSessions).toFixed(0);
        const totalPracticeTime = sessions.reduce((sum, s) => sum + (s.session_duration || 0), 0);

        return {
            totalSessions,
            aiSessions,
            multiPartySessions,
            humanSessions,
            productDemoSessions,
            averageScore,
            totalPracticeTime,
        };
    }, [sessions]);

    const getSessionTypeLabel = (type) => {
        switch(type) {
            case 'ai_roleplay': return 'Single AI';
            case 'multi_party': return 'Multi-Party';
            case 'human_roleplay': return 'Human-to-Human';
            case 'product_demo': return 'Product Demo';
            default: return 'Unknown';
        }
    };

    const getSessionTypeBadge = (type) => {
        switch(type) {
            case 'ai_roleplay': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'multi_party': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'human_roleplay': return 'bg-green-100 text-green-700 border-green-200';
            case 'product_demo': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

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
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Roleplay History</h1>
                        <p className="text-slate-600">View and analyze all your roleplay sessions across different modes</p>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link to={createPageUrl('AIRoleplayAnalysisDetailed')}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                View Analytics
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Sessions</CardTitle>
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <MessageSquare className="h-4 w-4 text-slate-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalSessions}</div>
                            <p className="text-xs text-slate-500 mt-1">All types</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Single AI</CardTitle>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Mic className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.aiSessions}</div>
                            <p className="text-xs text-slate-500 mt-1">AI roleplay sessions</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Multi-Party</CardTitle>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="h-4 w-4 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.multiPartySessions}</div>
                            <p className="text-xs text-slate-500 mt-1">Multi-party sessions</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Human-to-Human</CardTitle>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Video className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.humanSessions}</div>
                            <p className="text-xs text-slate-500 mt-1">Human roleplay sessions</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Product Demos</CardTitle>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Bot className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.productDemoSessions}</div>
                            <p className="text-xs text-slate-500 mt-1">Demo practice sessions</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Average Score</CardTitle>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Award className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.averageScore}%</div>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Overall performance
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white shadow-sm">
                    <CardHeader className="border-b border-slate-200 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl text-slate-900 mb-2">Session History</CardTitle>
                                <CardDescription className="text-slate-600">
                                    Filter and view your roleplay sessions by type
                                </CardDescription>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search sessions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-full md:w-64"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {roleplayTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <Button
                                        key={type.id}
                                        variant={selectedType === type.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedType(type.id)}
                                        className={selectedType === type.id ? type.color : 'border-slate-200 hover:bg-slate-50'}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {type.label}
                                        <Badge variant="secondary" className="ml-2 bg-white/50">
                                            {type.id === 'all' ? stats.totalSessions :
                                             type.id === 'ai_roleplay' ? stats.aiSessions :
                                             type.id === 'multi_party' ? stats.multiPartySessions :
                                             type.id === 'human_roleplay' ? stats.humanSessions :
                                             stats.productDemoSessions}
                                        </Badge>
                                    </Button>
                                );
                            })}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {filteredSessions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="font-semibold">Participant / Bot</TableHead>
                                        <TableHead className="font-semibold">Scenario</TableHead>
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Duration</TableHead>
                                        <TableHead className="font-semibold text-center">Score</TableHead>
                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSessions.map((session) => (
                                        <TableRow key={session.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <Badge variant="outline" className={`${getSessionTypeBadge(session.session_type)} border`}>
                                                    {getSessionTypeLabel(session.session_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        {session.bot_name?.charAt(0) || session.initiator_email?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">
                                                            {session.bot_name || session.prospect_player_email || 'Unknown'}
                                                        </div>
                                                        {session.session_type === 'human_roleplay' && (
                                                            <div className="text-xs text-slate-500">
                                                                with {session.initiator_email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate text-slate-700">
                                                    {session.scenario || 'No scenario description'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(session.created_date), 'MMM d, yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDuration(session.session_duration || 0)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${
                                                    (session.analysis_results?.overall_score || 0) >= 80 ? 'bg-green-100 text-green-700' :
                                                    (session.analysis_results?.overall_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {session.analysis_results?.overall_score || 0}%
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Link to={
                                                        session.session_type === 'product_demo'
                                                            ? createPageUrl(`ProductDemoAnalysis/${session.id}`)
                                                            : createPageUrl(`AIRoleplayAnalysis?id=${session.id}`)
                                                    }>
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-600 mb-2">
                                    {searchQuery ? 'No sessions found' : 'No sessions yet'}
                                </h3>
                                <p className="text-slate-500 mb-4">
                                    {searchQuery
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'Start practicing with roleplay to see your sessions here'}
                                </p>
                                {!searchQuery && (
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                        <Link to={createPageUrl('AIRoleplay')}>
                                            <Play className="w-4 h-4 mr-2" />
                                            Start First Session
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
