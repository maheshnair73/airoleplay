import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    CheckCircle2, AlertCircle, TrendingUp, Clock, Brain,
    MessageSquare, Target, Star, BarChart3, Award
} from 'lucide-react';

export default function CallResultsModal({ callResults, open, onOpenChange }) {
    if (!callResults || !open) return null;

    const { analysis, callRecord } = callResults;
    
    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600"; 
        return "text-red-600";
    };

    const getScoreBg = (score) => {
        if (score >= 80) return "bg-green-100";
        if (score >= 60) return "bg-yellow-100";
        return "bg-red-100";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Call Analysis Results
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Call Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Call Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-slate-900">
                                        {Math.floor(callRecord.call_duration / 60)}:{(callRecord.call_duration % 60).toString().padStart(2, '0')}
                                    </p>
                                    <p className="text-sm text-slate-600">Duration</p>
                                </div>
                                <div className="text-center">
                                    <MessageSquare className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-slate-900">
                                        {analysis.questions_asked?.length || 0}
                                    </p>
                                    <p className="text-sm text-slate-600">Questions Asked</p>
                                </div>
                                <div className="text-center">
                                    <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-slate-900">
                                        {Math.round(analysis.talk_ratio * 100)}%
                                    </p>
                                    <p className="text-sm text-slate-600">Talk Time</p>
                                </div>
                                <div className="text-center">
                                    <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${
                                        analysis.sentiment_score > 0 ? 'text-green-500' : 
                                        analysis.sentiment_score < 0 ? 'text-red-500' : 'text-yellow-500'
                                    }`} />
                                    <p className="text-2xl font-bold text-slate-900">
                                        {analysis.sentiment_score > 0 ? 'Positive' : 
                                         analysis.sentiment_score < 0 ? 'Negative' : 'Neutral'}
                                    </p>
                                    <p className="text-sm text-slate-600">Sentiment</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="font-medium mb-2">AI Summary</h4>
                                <p className="text-slate-700">{analysis.summary}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Performance Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Discovery Questions</span>
                                        <span className="text-sm text-slate-600">
                                            {analysis.questions_asked?.length || 0}/10
                                        </span>
                                    </div>
                                    <Progress 
                                        value={Math.min((analysis.questions_asked?.length || 0) * 10, 100)} 
                                        className="h-2"
                                    />
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Talk/Listen Ratio</span>
                                        <span className={`text-sm font-medium ${
                                            analysis.talk_ratio <= 0.7 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {Math.round(analysis.talk_ratio * 100)}%
                                        </span>
                                    </div>
                                    <Progress 
                                        value={analysis.talk_ratio * 100} 
                                        className="h-2"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        {analysis.talk_ratio <= 0.7 ? 'Good balance' : 'Talked too much'}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Objection Handling</span>
                                        <span className="text-sm text-slate-600">
                                            {analysis.objections_raised?.length || 0} handled
                                        </span>
                                    </div>
                                    <Progress 
                                        value={Math.min((analysis.objections_raised?.length || 0) * 25, 100)} 
                                        className="h-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Key Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysis.buying_signals?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                                            <Star className="w-4 h-4" />
                                            Buying Signals Detected
                                        </h4>
                                        <ul className="space-y-1">
                                            {analysis.buying_signals.slice(0, 3).map((signal, index) => (
                                                <li key={index} className="text-sm text-slate-700 bg-green-50 p-2 rounded">
                                                    "{signal}"
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.pain_points?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-blue-700 mb-2">Pain Points Identified</h4>
                                        <ul className="space-y-1">
                                            {analysis.pain_points.slice(0, 3).map((pain, index) => (
                                                <li key={index} className="text-sm text-slate-700 bg-blue-50 p-2 rounded">
                                                    {pain}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.competitor_mentions?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-orange-700 mb-2">Competitors Mentioned</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.competitor_mentions.map((competitor, index) => (
                                                <Badge key={index} variant="outline" className="bg-orange-50">
                                                    {competitor}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Next Steps & Coaching */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analysis.next_steps?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {analysis.next_steps.map((step, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-slate-700">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-slate-500 text-sm">No specific next steps identified.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Coaching Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analysis.coaching_recommendations?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {analysis.coaching_recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-slate-700">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-slate-500 text-sm">Great job! No major areas for improvement identified.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            View Full Analysis
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}