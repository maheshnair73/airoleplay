import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RoleplaySession } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ArrowLeft, Search, Eye, Play, Clock, User as UserIcon, Bot, Star, TrendingUp, Award, BarChart3, Building2 } from 'lucide-react';

export default function BotPerformanceDetails() {
    const [sessions, setSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(null);
    const [botDetails, setBotDetails] = useState(null);
    
    const location = useLocation();
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(location.search);
    const botName = decodeURIComponent(urlParams.get('bot_name') || 'Kathy Wood');

    // Generate comprehensive dummy session data (remains the same)
    const generateDummySessionData = useCallback(() => [
        {
            id: '1',
            scenario: 'Discovery Call Practice',
            created_date: '2024-02-08T14:30:00Z',
            session_duration: 420,
            created_by: 'richard.morrison@company.com',
            creator_name: 'Richard Morrison',
            analysis_results: { overall_score: 87 },
            call_type: 'discovery',
            bot_configuration: JSON.stringify({
                name: "Kathy Wood",
                title: "Senior Account Manager",
                company_name: "Acme Corp",
            })
        },
        // ... (rest of the dummy data)
    ], []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser({ role: 'admin', email: 'demo@company.com', full_name: 'Demo User' });
            }
        };
        fetchUser();
    }, []);

    const loadSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const allSessions = await RoleplaySession.filter({ bot_name: botName }, '-created_date');
            const finalSessions = allSessions.length > 0 ? allSessions : generateDummySessionData();
            setSessions(finalSessions);

            if (finalSessions.length > 0 && finalSessions[0].bot_configuration) {
                try {
                    const config = JSON.parse(finalSessions[0].bot_configuration);
                    setBotDetails({ ...config, name: config.name || botName });
                } catch (e) {
                    console.error("Failed to parse bot_configuration", e);
                    setBotDetails({ name: botName, title: 'AI Prospect', company_name: 'Unknown Company' });
                }
            } else {
                 setBotDetails({ name: botName, title: 'AI Prospect', company_name: 'Unknown Company' });
            }

        } catch (error) {
            console.error('Error loading sessions for bot:', error);
            const dummyData = generateDummySessionData();
            setSessions(dummyData);
            setBotDetails({ name: botName, title: 'AI Prospect', company_name: 'Unknown Company' });
        } finally {
            setIsLoading(false);
        }
    }, [botName, generateDummySessionData]);
    
    useEffect(() => {
        if (botName && user) {
            loadSessions();
        }
    }, [botName, user, loadSessions]);

    // Filter sessions based on search term (remains the same)
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredSessions(sessions);
        } else {
            const filtered = sessions.filter(session => 
                session.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (session.creator_name && session.creator_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                session.call_type?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredSessions(filtered);
        }
    }, [sessions, searchTerm]);

    const stats = useMemo(() => {
        if (!filteredSessions.length) return { totalSessions: 0, averageScore: 0, totalPracticeTime: 0, activeUsers: 0 };
        const totalScore = filteredSessions.reduce((sum, s) => sum + (s.analysis_results?.overall_score || 0), 0);
        const uniqueUsers = new Set(filteredSessions.map(s => s.created_by)).size;
        const totalTime = filteredSessions.reduce((sum, s) => sum + (s.session_duration || 0), 0);
        return {
            totalSessions: filteredSessions.length,
            averageScore: Math.round(totalScore / filteredSessions.length),
            totalPracticeTime: Math.round(totalTime / 60),
            activeUsers: uniqueUsers
        };
    }, [filteredSessions]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getCallTypeDisplay = (type) => {
        const typeMap = { discovery: 'Discovery Call', cold_call: 'Cold Call', demo: 'Demo', follow_up: 'Follow-up', objection_handling: 'Objection Handling', pricing: 'Pricing', competitive: 'Competitive', closing: 'Closing', warm_call: 'Warm Call', negotiation: 'Negotiation' };
        return typeMap[type] || type;
    };

    const getScoreBadgeColor = (score) => {
        if (score >= 85) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 text-lg">Loading performance analytics for {botName}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="hover:bg-white shadow-sm">
                            <Link to={createPageUrl('AIRoleplayHistory')}>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-1">{botDetails?.name || botName}</h1>
                            <p className="text-slate-500">Performance Analytics & Session History</p>
                        </div>
                    </div>
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                        <Link to={createPageUrl(`AIRoleplay?auto_start=true&bot_data=${encodeURIComponent(JSON.stringify(botDetails))}`)}>
                            <Play className="w-4 h-4 mr-2" />
                            Practice with this Bot
                        </Link>
                    </Button>
                </div>
                
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* ... (Stat Cards remain the same) */}
                </div>

                {/* Session History Table */}
                <Card className="shadow-xl border-0 bg-white">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
                        {/* ... (CardHeader remains the same) */}
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                {/* ... (table content remains the same) */}
                            </table>
                            {filteredSessions.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bot className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-600 mb-2">No Sessions Found</h3>
                                    <p className="text-slate-500 text-lg">
                                        {searchTerm ? 'No sessions match your search criteria.' : `No practice sessions with ${botName} yet.`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}