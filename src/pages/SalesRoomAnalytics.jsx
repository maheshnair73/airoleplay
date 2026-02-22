import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { DigitalSalesRoom } from '@/api/entities';
import { SalesRoomEngagement } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, BarChartBig, Users, Clock, Eye, FileText, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const generateAvatarFallback = (name) => {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

export default function SalesRoomAnalytics() {
    const [room, setRoom] = useState(null);
    const [engagements, setEngagements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const roomId = new URLSearchParams(location.search).get('roomId');

    useEffect(() => {
        if (!roomId) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [roomData, engagementData] = await Promise.all([
                    DigitalSalesRoom.get(roomId),
                    SalesRoomEngagement.filter({ room_id: roomId }, '-created_date', 500)
                ]);
                setRoom(roomData);
                setEngagements(engagementData);
            } catch (error) {
                console.error("Failed to load analytics data:", error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [roomId]);

    const analyticsSummary = useMemo(() => {
        const uniqueVisitors = [...new Set(engagements.map(e => e.visitor_email || e.session_id))];
        const totalVisits = [...new Set(engagements.map(e => e.session_id))].length;
        const totalEngagementScore = room?.analytics?.engagement_score || 0;
        
        const visitors = room?.participants?.map(p => ({
            name: p.name,
            email: p.email,
            role: p.role,
            avatar_url: p.avatar_url,
            lastSeen: p.last_seen ? formatDistanceToNow(new Date(p.last_seen), { addSuffix: true }) : 'Never',
            timeSpent: Math.round((p.total_time_spent || 0) / 60)
        })) || [];
        
        return {
            totalVisits,
            uniqueVisitors: uniqueVisitors.length,
            predictedIntent: room?.analytics?.predicted_intent_percent || 0,
            totalEngagementScore,
            visitors
        };
    }, [engagements, room]);

    if (isLoading) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    if (!room) {
        return <div className="p-8 text-center">Room not found.</div>;
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl('DigitalSalesRooms'))} className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to All Rooms
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900">{room.room_name} - Analytics</h1>
                        <p className="text-slate-500">Engagement insights for {room.company_name}</p>
                    </div>
                    <Link to={createPageUrl(`SalesRoomPublic?url=${room.room_url}`)} target="_blank">
                        <Button variant="outline">View Public Room <Eye className="w-4 h-4 ml-2" /></Button>
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader><CardTitle>Predicted Intent</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-blue-600">{analyticsSummary.predictedIntent}%</p>
                            <p className="text-sm text-slate-500">Likelihood to proceed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Engagement Score</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{analyticsSummary.totalEngagementScore}</p>
                            <p className="text-sm text-slate-500">Based on all interactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Total Visits</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{analyticsSummary.totalVisits}</p>
                            <p className="text-sm text-slate-500">Total sessions started</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Unique Visitors</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{analyticsSummary.uniqueVisitors}</p>
                            <p className="text-sm text-slate-500">People who viewed the room</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Visitor Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="text-blue-600" />Visitors & Attendees</CardTitle>
                        <CardDescription>See who has viewed the sales room and their engagement level.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Role</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Time Spent (min)</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-600">Last Seen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analyticsSummary.visitors.length > 0 ? analyticsSummary.visitors.map(v => (
                                        <tr key={v.email} className="border-b">
                                            <td className="px-4 py-3 flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={v.avatar_url} />
                                                    <AvatarFallback>{generateAvatarFallback(v.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{v.name}</p>
                                                    <p className="text-slate-500">{v.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 capitalize"><Badge variant="outline">{v.role}</Badge></td>
                                            <td className="px-4 py-3 font-medium">{v.timeSpent}</td>
                                            <td className="px-4 py-3 text-slate-500">{v.lastSeen}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-8 text-slate-500">No visitor data yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}