import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { CallRecord } from '@/api/entities';
import { User } from '@/api/entities';
import { analyzeCallRecording } from '@/api/functions';
import { createPageUrl } from '@/utils';
import { Upload, BarChart3, Loader2, FileAudio, Clock, TrendingUp, TrendingDown, Award, Lightbulb, MessageSquare, BookOpen, AlertCircle } from 'lucide-react';

export default function AICallAnalytics() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [analyzedCalls, setAnalyzedCalls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalyzedCalls();
    }, []);

    const fetchAnalyzedCalls = async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            const calls = await CallRecord.filter({
                caller_email: user.email,
                call_status: 'analyzed'
            }, '-created_date', 20);
            setAnalyzedCalls(calls);
            if (calls.length > 0) {
                setSelectedCall(calls[0]);
            }
        } catch (error) {
            console.error('Error fetching analyzed calls:', error);
            toast.error('Failed to load past call analyses.');
        }
        setIsLoading(false);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4'].includes(file.type)) {
            toast.error('Invalid file type. Please upload MP3, WAV, or M4A audio files.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(30);

        try {
            toast.info('Analyzing call... This may take a few minutes.');
            const { data, error } = await analyzeCallRecording({ audio: file });
            setUploadProgress(100);
            if (error) throw new Error(error.details || 'Analysis failed.');
            
            toast.success('Call analysis complete!');
            setAnalyzedCalls(prev => [data.callRecord, ...prev]);
            setSelectedCall(data.callRecord);
        } catch (error) {
            console.error('Error analyzing call:', error);
            toast.error(`Analysis failed: ${error.message}`);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };
    
    const handlePracticeWeakness = (weakness) => {
        const scenario = `Practice session to improve on: ${weakness.feedback}. The original call was about ${selectedCall.ai_analysis?.topics_discussed?.[0]?.topic || 'a recent sales discussion'}.`;
        const url = createPageUrl(`AIRoleplay?scenario=${encodeURIComponent(scenario)}&personality=Nice`);
        navigate(url);
    };

    const renderAnalysis = (call) => {
        if (!call?.ai_analysis) return <p>No analysis data available for this call.</p>;
        const analysis = call.ai_analysis;
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Call Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{analysis.summary || 'No summary available.'}</p>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4"/>Talk/Listen Ratio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{analysis.talk_ratio || 'N/A'}%</p>
                            <p className="text-xs text-slate-500">Rep talk time</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4"/>Sentiment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{analysis.sentiment_analysis?.overall?.toFixed(2) || 'N/A'}</p>
                            <p className="text-xs text-slate-500">Overall score (-1 to 1)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2"><Award className="w-4 h-4"/>Outcome</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-xl font-bold capitalize">{analysis.call_outcome?.replace(/_/g, ' ') || 'N/A'}</p>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500"/>Coaching Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {analysis.coaching_opportunities?.length > 0 ? (
                            analysis.coaching_opportunities.map((opp, index) => (
                                <Alert key={index}>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>{opp.category}</AlertTitle>
                                    <AlertDescription>
                                        {opp.feedback}
                                        <Button size="sm" className="ml-4" onClick={() => handlePracticeWeakness(opp)}>
                                            <MessageSquare className="w-4 h-4 mr-2"/> Practice This
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            ))
                        ) : (<p>No specific coaching opportunities identified. Great job!</p>)}
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900">AI Call Analytics</h1>
                <p className="text-slate-600 mt-1">Upload real call recordings to get AI-powered feedback and coaching.</p>
            </header>
            
            <div className="flex gap-8">
                <div className="w-1/3">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Upload New Call</CardTitle>
                            <CardDescription>Upload an audio file (MP3, WAV, M4A) for analysis.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <label htmlFor="audio-upload" className="w-full">
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-100">
                                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                    <p className="mt-2 text-sm text-slate-600">Click to upload or drag & drop</p>
                                    <input id="audio-upload" type="file" className="hidden" onChange={handleFileUpload} accept="audio/mpeg,audio/wav,audio/x-m4a,audio/mp4" disabled={isUploading} />
                                </div>
                            </label>
                            {isUploading && (
                                <div className="mt-4">
                                    <Progress value={uploadProgress} />
                                    <p className="text-center text-sm mt-2 text-slate-500">Analyzing call...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Analyzed Calls</CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-[500px] overflow-y-auto">
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto"/> : (
                                analyzedCalls.length > 0 ? (
                                    <div className="space-y-2">
                                        {analyzedCalls.map(call => (
                                            <div key={call.id} onClick={() => setSelectedCall(call)} className={`p-3 rounded-lg cursor-pointer ${selectedCall?.id === call.id ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
                                                <p className="font-semibold">{call.prospect_name || 'Unknown Prospect'}</p>
                                                <p className="text-sm text-slate-500">{new Date(call.created_date).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-slate-500 text-center">No calls analyzed yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="w-2/3">
                    {selectedCall ? (
                        <Card className="bg-white shadow-lg">
                           <CardHeader>
                               <CardTitle className="text-2xl">Analysis for call with {selectedCall.prospect_name || 'Unknown Prospect'}</CardTitle>
                               <CardDescription>{new Date(selectedCall.created_date).toLocaleString()}</CardDescription>
                           </CardHeader>
                           <CardContent>
                               {renderAnalysis(selectedCall)}
                           </CardContent>
                        </Card>
                    ) : (
                         <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg bg-slate-100">
                            <div className="text-center">
                                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4"/>
                                <p className="text-slate-500">Select a call to view analysis or upload a new one.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}