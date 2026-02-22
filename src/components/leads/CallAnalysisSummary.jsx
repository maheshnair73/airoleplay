import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, MessageSquare, Star } from 'lucide-react';

export default function CallAnalysisSummary({ analysis }) {
    if (!analysis || !analysis.sentiment_analysis) return null;

    const sentimentScore = Math.round((analysis.sentiment_analysis.overall || 0) * 100);
    const talkRatio = analysis.talk_ratio || 0;
    const rapportScore = analysis.rapport_building || 0;

    const getSentimentColor = (score) => {
        if (score > 30) return 'bg-green-100 text-green-800';
        if (score < -10) return 'bg-red-100 text-red-800';
        return 'bg-yellow-100 text-yellow-800';
    };
    
    return (
        <Card className="my-2 bg-slate-50 border-slate-200">
            <CardContent className="p-3 space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p className="text-xs text-slate-500">Sentiment</p>
                        <Badge className={`text-sm ${getSentimentColor(sentimentScore)}`}>
                            {sentimentScore > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            {sentimentScore}%
                        </Badge>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Rep Talk Ratio</p>
                        <p className="font-bold text-slate-800 text-lg flex items-center justify-center gap-1">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            {talkRatio}%
                        </p>
                    </div>
                     <div>
                        <p className="text-xs text-slate-500">Rapport</p>
                         <p className="font-bold text-slate-800 text-lg flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-orange-500" />
                            {rapportScore}%
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}