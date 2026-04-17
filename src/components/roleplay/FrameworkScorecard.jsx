import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, DollarSign, ListChecks, HelpCircle, TrendingUp } from 'lucide-react';

const FRAMEWORK_ICONS = {
  'MEDDIC': Target,
  'BANT': DollarSign,
  'RUBRIC': ListChecks,
  'SPIN': HelpCircle
};

const FRAMEWORK_COLORS = {
  'MEDDIC': 'bg-blue-50 border-blue-200',
  'BANT': 'bg-green-50 border-green-200',
  'RUBRIC': 'bg-purple-50 border-purple-200',
  'SPIN': 'bg-orange-50 border-orange-200'
};

const CRITERIA_LABELS = {
  metrics: 'Metrics',
  economic_buyer: 'Economic Buyer',
  decision_criteria: 'Decision Criteria',
  decision_process: 'Decision Process',
  identify_pain: 'Identify Pain',
  champion: 'Champion',
  budget: 'Budget',
  authority: 'Authority',
  need: 'Need',
  timeline: 'Timeline',
  situation: 'Situation',
  problem: 'Problem',
  implication: 'Implication',
  need_payoff: 'Need-Payoff',
  communication: 'Communication',
  discovery: 'Discovery',
  objection_handling: 'Objection Handling',
  value_proposition: 'Value Proposition',
  next_steps: 'Next Steps'
};

function ScoreIndicator({ score }) {
  let color = 'bg-red-500';
  let label = 'Poor';

  if (score >= 80) {
    color = 'bg-emerald-600';
    label = 'Excellent';
  } else if (score >= 60) {
    color = 'bg-green-500';
    label = 'Good';
  } else if (score >= 40) {
    color = 'bg-yellow-500';
    label = 'Fair';
  } else if (score >= 20) {
    color = 'bg-orange-500';
    label = 'Needs Work';
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-sm font-medium">{score}%</span>
      <span className="text-xs text-slate-600">{label}</span>
    </div>
  );
}

export default function FrameworkScorecard({ analysis, framework }) {
  if (!analysis || !framework) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-slate-600">No analysis available</p>
        </CardContent>
      </Card>
    );
  }

  const Icon = FRAMEWORK_ICONS[framework.framework_type] || ListChecks;
  const bgColor = FRAMEWORK_COLORS[framework.framework_type] || 'bg-slate-50';

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${bgColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-lg">
                <Icon className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <CardTitle>{framework.name} Analysis</CardTitle>
                <CardDescription className="mt-1">
                  {framework.framework_type === 'MEDDIC' && 'Qualification methodology analysis'}
                  {framework.framework_type === 'BANT' && 'Sales qualification assessment'}
                  {framework.framework_type === 'SPIN' && 'Consultative selling analysis'}
                  {framework.framework_type === 'RUBRIC' && 'Holistic performance evaluation'}
                </CardDescription>
              </div>
            </div>
            <Badge className="text-lg px-4 py-2 bg-blue-600">
              {analysis.overall_score}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Overall Performance</span>
                <span className="text-sm text-slate-600">{analysis.overall_score}/100</span>
              </div>
              <Progress value={analysis.overall_score} className="h-2" />
            </div>

            <div className="pt-2 text-sm text-slate-600">
              <p>
                {analysis.overall_score >= 80 && 'Excellent performance! You demonstrated strong mastery of this framework.'}
                {analysis.overall_score >= 60 && analysis.overall_score < 80 && 'Good job! You covered most key areas. Focus on areas with lower scores.'}
                {analysis.overall_score >= 40 && analysis.overall_score < 60 && 'Fair performance. Review the lower-scoring areas for improvement.'}
                {analysis.overall_score < 40 && 'Keep practicing. Focus on the key areas highlighted below.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Criterion-by-Criterion Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.criteria_scores && Object.entries(analysis.criteria_scores).map(([key, criterion]) => (
            <Card key={key} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-slate-900">{CRITERIA_LABELS[key] || key}</h4>
                  </div>
                  <ScoreIndicator score={criterion.score} />
                  {criterion.evidence && criterion.evidence.length > 0 && (
                    <div className="bg-slate-50 rounded p-2 text-xs">
                      <p className="font-medium text-slate-700 mb-1">Evidence found:</p>
                      <ul className="space-y-1">
                        {criterion.evidence.map((ev, idx) => (
                          <li key={idx} className="text-slate-600">• {ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {analysis.timestamp && (
        <div className="text-xs text-slate-500 text-center pt-4 border-t">
          Analysis completed at {new Date(analysis.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
