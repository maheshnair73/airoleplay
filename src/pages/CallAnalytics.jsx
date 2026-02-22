
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CallRecord } from '@/api/entities';
import { User } from '@/api/entities';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Phone, Users, TrendingUp, Clock, ThumbsUp, ThumbsDown, Award, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // New import for table components

const MetricCard = ({ title, value, icon: Icon, color, trend, onClick, isActive }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-lg p-6 shadow-sm border border-slate-200 transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-600">{title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">{trend}</span>
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const RepLeaderboardItem = ({ rep, metric, rank }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
        <div className="flex items-center gap-3">
            <span className="font-bold text-slate-600 w-6 text-center">{rank}</span>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {(rep.name || 'U').charAt(0)}
            </div>
            <p className="font-medium text-slate-800">{rep.name}</p>
        </div>
        <p className="font-semibold text-lg text-slate-900">{metric}</p>
    </div>
);

export default function CallAnalytics() {
    const [calls, setCalls] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [callData, userData] = await Promise.all([
                CallRecord.list('-created_date', 100),
                User.list()
            ]);
            setCalls(callData);
            setUsers(userData);
        } catch (error) {
            console.error("Error loading analytics data:", error);
        }
        setIsLoading(false);
    };

    const handleFilterClick = (filter) => {
        setActiveFilter(prev => prev === filter ? 'all' : filter);
    };

    const filteredCalls = useMemo(() => {
        if (activeFilter === 'all') return calls;
        if (activeFilter === 'positive') {
            return calls.filter(c => (c.ai_analysis?.sentiment_score || 0) > 0.3);
        }
        if (activeFilter === 'negative') {
            return calls.filter(c => (c.ai_analysis?.sentiment_score || 0) < -0.1);
        }
        return calls;
    }, [calls, activeFilter]);

    // Process data for charts and leaderboards
    const processedData = filteredCalls.reduce((acc, call) => {
        const date = new Date(call.created_date).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { date, calls: 0, totalDuration: 0, sentimentSum: 0, talkRatioSum: 0 };
        }
        acc[date].calls++;
        acc[date].totalDuration += call.call_duration || 0;
        acc[date].sentimentSum += call.ai_analysis?.sentiment_score || 0;
        acc[date].talkRatioSum += call.ai_analysis?.talk_ratio || 0;
        return acc;
    }, {});

    const chartData = Object.values(processedData).map(d => ({
        ...d,
        avgSentiment: d.calls > 0 ? (d.sentimentSum / d.calls) * 100 : 0,
        avgTalkRatio: d.calls > 0 ? (d.talkRatioSum / d.calls) * 100 : 0,
    })).sort((a,b) => new Date(a.date) - new Date(b.date));

    const repStats = users.map(user => {
        const userCalls = filteredCalls.filter(c => c.caller_email === user.email);
        const totalCalls = userCalls.length;
        const avgDuration = totalCalls > 0 ? userCalls.reduce((sum, c) => sum + (c.call_duration || 0), 0) / totalCalls : 0;
        const avgSentiment = totalCalls > 0 ? userCalls.reduce((sum, c) => sum + (c.ai_analysis?.sentiment_score || 0), 0) / totalCalls : 0;
        return {
            name: user.full_name || user.email,
            email: user.email,
            totalCalls,
            avgDuration: Math.round(avgDuration / 60),
            avgSentiment: Math.round(avgSentiment * 100)
        };
    });

    // These metrics are for display in the MetricCards and should reflect ALL calls, not filtered ones.
    const totalCalls = calls.length;
    const positiveCalls = calls.filter(c => (c.ai_analysis?.sentiment_score || 0) > 0.3).length;
    const negativeCalls = calls.filter(c => (c.ai_analysis?.sentiment_score || 0) < -0.1).length;

    return (
        <div className="p-6 bg-slate-50/50 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Call Analytics</h1>
                    <p className="text-slate-600 mt-2">Review team performance and conversation metrics</p>
                </div>
                <Button onClick={loadData} disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <MetricCard title="Total Calls" value={calls.length} icon={Phone} color="bg-blue-500" onClick={() => handleFilterClick('all')} isActive={activeFilter === 'all'} />
                <MetricCard title="Avg Call Duration" value={`${Math.round(calls.reduce((sum, c) => sum + (c.call_duration || 0), 0) / (calls.length || 1) / 60)} min`} icon={Clock} color="bg-green-500" />
                <MetricCard title="Positive Sentiment" value={`${Math.round(positiveCalls / (totalCalls || 1) * 100)}%`} icon={ThumbsUp} color="bg-purple-500" onClick={() => handleFilterClick('positive')} isActive={activeFilter === 'positive'} />
                <MetricCard title="Negative Sentiment" value={`${Math.round(negativeCalls / (totalCalls || 1) * 100)}%`} icon={ThumbsDown} color="bg-orange-500" onClick={() => handleFilterClick('negative')} isActive={activeFilter === 'negative'} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Call Volume & Sentiment Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="calls" stroke="#8884d8" name="Call Volume" />
                                <Line yAxisId="right" type="monotone" dataKey="avgSentiment" stroke="#82ca9d" name="Avg Sentiment (%)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Average Talk Ratio Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="avgTalkRatio" fill="#ffc658" name="Rep Talk Ratio (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500"/> Most Calls</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {repStats.sort((a,b) => b.totalCalls - a.totalCalls).slice(0, 5).map((rep, index) => (
                                <RepLeaderboardItem key={rep.email} rep={rep} metric={`${rep.totalCalls} calls`} rank={index + 1} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500"/> Highest Sentiment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             {repStats.sort((a,b) => b.avgSentiment - a.avgSentiment).slice(0, 5).map((rep, index) => (
                                <RepLeaderboardItem key={rep.email} rep={rep} metric={`${rep.avgSentiment}%`} rank={index + 1} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Calls Table (newly added section) */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Calls</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Rep</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Sentiment</TableHead>
                                        <TableHead>Talk Ratio</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCalls.slice(0, 10).map((call) => { // Displaying latest 10 calls for brevity
                                        const rep = users.find(u => u.email === call.caller_email);
                                        const callDate = new Date(call.created_date).toLocaleString();
                                        const duration = call.call_duration ? `${Math.round(call.call_duration / 60)} min` : 'N/A';
                                        const sentiment = call.ai_analysis?.sentiment_score !== undefined
                                            ? `${Math.round(call.ai_analysis.sentiment_score * 100)}%`
                                            : 'N/A';
                                        const talkRatio = call.ai_analysis?.talk_ratio !== undefined
                                            ? `${Math.round(call.ai_analysis.talk_ratio * 100)}%`
                                            : 'N/A';

                                        return (
                                            <TableRow key={call.id || call.created_date || Math.random()}> {/* Added Math.random() fallback for key robustness */}
                                                <TableCell className="whitespace-nowrap">{callDate}</TableCell>
                                                <TableCell className="whitespace-nowrap">{rep ? rep.full_name || rep.email : 'Unknown'}</TableCell>
                                                <TableCell>{duration}</TableCell>
                                                <TableCell>{sentiment}</TableCell>
                                                <TableCell>{talkRatio}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredCalls.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                                                No calls found for the selected filter.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
