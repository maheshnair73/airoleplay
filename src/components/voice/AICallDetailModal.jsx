import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Clock, BarChart, Smile, Frown, Percent } from 'lucide-react';

const AICallDetailModal = ({ call, open, onOpenChange }) => {
    if (!call) return null;

    const analysis = call.ai_analysis || {};
    const transcript = call.transcript || [];
    const sentimentScore = analysis.sentiment_score || 0;

    const MetricCard = ({ icon: Icon, title, value, color }) => (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="font-semibold text-slate-800">{value}</p>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>AI Call Analysis: {call.prospect_name}</DialogTitle>
                    <DialogDescription>
                        {new Date(call.created_date).toLocaleString()}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Left Column - Analysis */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700">{analysis.summary || 'No summary available.'}</p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Key Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <MetricCard icon={Clock} title="Duration" value={`${Math.round(call.call_duration / 60)} min`} color="bg-blue-500" />
                                <MetricCard 
                                    icon={sentimentScore > 0 ? Smile : Frown} 
                                    title="Sentiment" 
                                    value={sentimentScore.toFixed(2)}
                                    color={sentimentScore > 0 ? "bg-green-500" : "bg-red-500"}
                                />
                                <MetricCard icon={Percent} title="Talk Ratio" value={`${analysis.talk_ratio || 0}%`} color="bg-purple-500" />
                                <MetricCard icon={BarChart} title="Topics" value={analysis.key_topics?.length || 0} color="bg-orange-500" />
                            </CardContent>
                        </Card>

                        {call.recording_url && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Call Recording</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <audio controls className="w-full">
                                        <source src={call.recording_url} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Transcript */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Call Transcript</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-4">
                                    {transcript.length > 0 ? transcript.map((item, index) => (
                                        <div key={index} className={`flex gap-3 ${item.speaker === 'Speaker 0' ? '' : 'justify-end'}`}>
                                            {item.speaker === 'Speaker 0' && (
                                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                                                    <Bot className="w-4 h-4" />
                                                </div>
                                            )}
                                            <div className={`max-w-xs p-3 rounded-lg ${item.speaker === 'Speaker 0' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                                <p className="text-sm text-slate-800">{item.text || item.transcript}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {item.speaker === 'Speaker 0' ? 'AI Agent' : 'Prospect'}
                                                </p>
                                            </div>
                                            {item.speaker !== 'Speaker 0' && (
                                                <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500 text-center py-8">No transcript available for this call.</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AICallDetailModal;