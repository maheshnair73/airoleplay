
import React, { useState, useEffect, useCallback } from 'react';
import { RoleplaySession } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Search, Calendar, Clock, Users, Play, 
    BarChart3, Filter, ChevronRight, Eye,
    Video, MessageSquare, Star, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';

export default function RoleplaySessionHistory() {
    const [sessions, setSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sessionData, userData] = await Promise.all([
                RoleplaySession.list('-created_at'),
                User.me()
            ]);
            setSessions(sessionData);
            setCurrentUser(userData);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterSessions = useCallback(() => {
        let filtered = sessions;

        if (searchTerm) {
            filtered = filtered.filter(session =>
                session.session_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.scenario_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.initiator_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.prospect_player_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.transcript?.bot_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterBy === 'my_sessions') {
            filtered = filtered.filter(session =>
                session.initiator_email === currentUser?.email ||
                session.prospect_player_email === currentUser?.email
            );
        } else if (filterBy === 'completed') {
            filtered = filtered.filter(session => session.session_status === 'completed' || session.status === 'completed');
        } else if (filterBy === 'active') {
            filtered = filtered.filter(session => session.session_status === 'active' || session.status === 'active');
        } else if (filterBy === 'ai') {
            filtered = filtered.filter(session => session.session_type === 'human_ai');
        } else if (filterBy === 'human') {
            filtered = filtered.filter(session => session.session_type === 'human_human');
        }

        setFilteredSessions(filtered);
    }, [sessions, searchTerm, filterBy, currentUser?.email]);

    useEffect(() => {
        filterSessions();
    }, [filterSessions]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'pending_invite':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const SessionCard = ({ session }) => {
        const botName = session.transcript?.bot_name || 'AI Bot';
        const botPersonality = session.transcript?.bot_personality || '';
        const recordingUrl = session.transcript?.recording_url;
        const sessionDuration = session.duration;

        return (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-slate-900 mb-1">
                                {session.session_name || `Roleplay Session - ${session.scenario_type}`}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(session.created_at), 'MMM d, yyyy')}
                                </span>
                                {sessionDuration && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDuration(sessionDuration)}
                                    </span>
                                )}
                                {session.score && (
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500" />
                                        {session.score}%
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Users className="w-4 h-4" />
                                <span>{session.initiator_email}</span>
                                <span>vs</span>
                                <span>
                                    {session.session_type === 'human_ai'
                                        ? `${botName}${botPersonality ? ` (${botPersonality})` : ''}`
                                        : (session.prospect_player_email || 'Participant')}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(session.session_status || session.status)}>
                                {(session.session_status || session.status).replace('_', ' ')}
                            </Badge>
                            {session.session_status === 'completed' || session.status === 'completed' ? (
                                <Button size="sm" asChild>
                                    <Link to={createPageUrl(`AIRoleplayAnalysis?id=${session.id}`)}>
                                        <BarChart3 className="w-4 h-4 mr-1" />
                                        View Analysis
                                    </Link>
                                </Button>
                            ) : (
                                <Button size="sm" variant="outline" asChild>
                                    <Link to={createPageUrl(`RoleplaySession?sessionId=${session.id}`)}>
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                                {session.session_type === 'human_ai' ? 'AI Roleplay' : 'Human Roleplay'}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                                {session.scenario_type?.replace('_', ' ')}
                            </Badge>
                            {session.difficulty && (
                                <Badge variant="outline" className="text-xs capitalize">
                                    {session.difficulty}
                                </Badge>
                            )}
                            {recordingUrl && (
                                <Badge variant="outline" className="text-xs">
                                    <Video className="w-3 h-3 mr-1" />
                                    Recorded
                                </Badge>
                            )}
                            {session.feedback && (
                                <Badge variant="outline" className="text-xs">
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Feedback Available
                                </Badge>
                            )}
                        </div>
                        <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Roleplay Session History</h1>
                        <p className="text-slate-600 mt-1">Review past sessions, feedback, and improve your skills</p>
                    </div>
                    <Button asChild>
                        <Link to={createPageUrl('HumanRoleplay')}>
                            <Play className="w-4 h-4 mr-2" />
                            Start New Session
                        </Link>
                    </Button>
                </div>

                {/* Roleplay Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('AIRoleplay')}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Mic className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900">Single AI Roleplay</h3>
                                    <p className="text-sm text-slate-500">Practice with AI coach</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">
                                One-on-one practice sessions with an AI sales coach. Perfect for honing your pitch, handling objections, and mastering discovery calls.
                            </p>
                            <Button className="w-full" variant="outline">
                                Start Practice <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('MultiPartyRoleplay')}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900">Multi-Party AI</h3>
                                    <p className="text-sm text-slate-500">Complex deal scenarios</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">
                                Practice with multiple AI stakeholders in complex B2B scenarios. Navigate executive committees, technical buyers, and decision-makers.
                            </p>
                            <Button className="w-full" variant="outline">
                                Start Scenario <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('HumanRoleplay')}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Video className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900">Human-to-Human</h3>
                                    <p className="text-sm text-slate-500">Peer practice sessions</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">
                                Practice with team members via video call. Get real-time feedback from peers and managers while AI analyzes your conversation.
                            </p>
                            <Button className="w-full" variant="outline">
                                Start Session <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Overview */}
                {sessions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Total Sessions</p>
                                        <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Star className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Completed</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {sessions.filter(s => s.session_status === 'completed' || s.status === 'completed').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Total Time</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {Math.floor(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)}m
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Avg Duration</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {sessions.filter(s => s.duration).length > 0
                                                ? Math.floor(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.filter(s => s.duration).length / 60)
                                                : 0}m
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Tabs defaultValue="all" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <TabsList>
                            <TabsTrigger value="all" onClick={() => setFilterBy('all')}>All Sessions</TabsTrigger>
                            <TabsTrigger value="my" onClick={() => setFilterBy('my_sessions')}>My Sessions</TabsTrigger>
                            <TabsTrigger value="completed" onClick={() => setFilterBy('completed')}>Completed</TabsTrigger>
                            <TabsTrigger value="active" onClick={() => setFilterBy('active')}>Active</TabsTrigger>
                            <TabsTrigger value="ai" onClick={() => setFilterBy('ai')}>AI Roleplay</TabsTrigger>
                            <TabsTrigger value="human" onClick={() => setFilterBy('human')}>Human Roleplay</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Search sessions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                        </div>
                    </div>

                    <TabsContent value="all" className="space-y-4">
                        {filteredSessions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredSessions.map((session) => (
                                    <SessionCard key={session.id} session={session} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No sessions found</h3>
                                    <p className="text-slate-500 mb-4">
                                        {searchTerm || filterBy !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'Use one of the three options above to start your first roleplay session'
                                        }
                                    </p>
                                    <Button asChild>
                                        <Link to={createPageUrl('HumanRoleplay')}>Start First Session</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="my">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSessions.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="completed">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSessions.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="active">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSessions.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="ai">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSessions.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="human">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSessions.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
