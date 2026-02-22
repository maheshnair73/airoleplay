
import React, { useState, useEffect, useRef } from 'react';
import { CallRecord } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Search, Calendar, Clock, Target, TrendingUp, Phone, Users,
    Play, BarChart3, Filter, ChevronRight, User, Upload, RadioTower, 
    Loader2, MessageSquare, Award, Bot, Eye, ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { processCallRecording } from '@/api/functions';
import { toast } from 'sonner';

export default function CallInsights() {
    const [callRecords, setCallRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('recent_calls'); // Changed initial activeTab
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadCallRecords();
    }, []);

    const loadCallRecords = async () => {
        try {
            const data = await CallRecord.list('-created_at');
            setCallRecords(data);
        } catch (error) {
            console.error('Error loading call records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        event.target.value = null; // Clear the input so the same file can be selected again

        if (file.size > 25 * 1024 * 1024) {
            toast.error("File is too large. Please upload files under 25MB.");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading("Uploading and analyzing your call... This may take a few minutes.");

        try {
            const formData = new FormData();
            formData.append('audio', file);
            formData.append('prospectName', 'Uploaded Call');
            formData.append('callType', 'uploaded');

            const { data } = await processCallRecording(formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success && data.callRecord) {
                toast.success("Analysis complete!", {
                    id: toastId,
                    description: "Redirecting to call analysis...",
                });
                navigate(createPageUrl(`CallAnalysis?id=${data.callRecord.id}`));
            } else {
                throw new Error(data.details || "Analysis failed to return a valid record.");
            }
        } catch (error) {
            console.error("Error processing call recording:", error);
            toast.error("Call analysis failed.", {
                id: toastId,
                description: error.message || "Please try again later.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const stats = {
        totalCalls: callRecords.length,
        averageScore: callRecords.length > 0 ? 
            Math.round(callRecords.reduce((sum, call) => sum + (call.ai_analysis?.sentiment_score || 0.5), 0) * 100 / callRecords.length) : 0,
        totalCallTime: callRecords.reduce((sum, call) => sum + (call.call_duration || 0), 0),
        successfulCalls: callRecords.filter(call => call.call_status === 'completed').length
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500">Loading call analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Call Analytics & Insights</h1>
                        <p className="text-slate-600">Analyze your real sales conversations with AI-powered insights.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Calls</CardTitle>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Phone className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalCalls}</div>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +15% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Avg Sentiment</CardTitle>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Award className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.averageScore}%</div>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +8% improvement
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Call Time</CardTitle>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Clock className="h-4 w-4 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{Math.round(stats.totalCallTime / 60)}min</div>
                            <p className="text-xs text-slate-500 mt-1">Total this month</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Target className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {stats.totalCalls > 0 ? Math.round((stats.successfulCalls / stats.totalCalls) * 100) : 0}%
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Completed calls</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm"> {/* Changed grid-cols-3 to grid-cols-2 */}
                        <TabsTrigger value="recent_calls" className="text-slate-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            Recent Calls
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="text-slate-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            AI Insights
                        </TabsTrigger>
                    </TabsList>

                    {/* Removed TabsContent value="overview" entirely */}

                    <TabsContent value="recent_calls" className="mt-6">
                        <Card className="bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-200 p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl text-slate-900">Recent Call Recordings</CardTitle>
                                        <CardDescription className="text-slate-600">
                                            Your analyzed sales conversations
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button asChild variant="outline">
                                            <Link to={createPageUrl('DialerSettings')}>
                                                <RadioTower className="w-4 h-4 mr-2" />
                                                Sync from Dialer
                                            </Link>
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="audio/mpeg, audio/mp4, audio/wav, audio/m4a"
                                        />
                                        <Button onClick={handleUploadClick} disabled={isUploading}>
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Recording
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {callRecords.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {callRecords.map((call) => (
                                            <div key={call.id} className="p-6 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            <Phone className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">{call.prospect_name || 'Unknown Prospect'}</h4>
                                                            <p className="text-sm text-slate-600">{call.call_type || 'Sales Call'} • {Math.round(call.call_duration / 60)} minutes</p>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {format(new Date(call.created_date), 'MMM d, yyyy')}
                                                                </span>
                                                                <Badge className={
                                                                    call.call_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    call.call_status === 'no_answer' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }>
                                                                    {call.call_status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-slate-900">
                                                                {call.ai_analysis?.sentiment_score ? 
                                                                    Math.round(call.ai_analysis.sentiment_score * 100) : 'N/A'}%
                                                            </div>
                                                            <div className="text-xs text-slate-500">Sentiment</div>
                                                        </div>
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Link to={createPageUrl(`CallAnalysis?id=${call.id}`)}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Analysis
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Phone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-slate-600 mb-2">No call recordings yet</h3>
                                        <p className="text-slate-500 mb-4">Upload a call recording or sync from your dialer to get started</p>
                                        <div className="flex justify-center gap-3">
                                            <Button asChild variant="outline">
                                                <Link to={createPageUrl('DialerSettings')}>
                                                    <RadioTower className="w-4 h-4 mr-2" />
                                                    Sync from Dialer
                                                </Link>
                                            </Button>
                                            <Button onClick={handleUploadClick} disabled={isUploading}>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Recording
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="insights" className="mt-6">
                        <Card className="bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-200 p-6">
                                <CardTitle className="text-lg text-slate-900">AI-Powered Insights</CardTitle>
                                <CardDescription className="text-slate-600">Trends and patterns from your calls</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-8">
                                    <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">Advanced insights available with more call data</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
