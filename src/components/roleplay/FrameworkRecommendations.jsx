import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, BookOpen } from 'lucide-react';

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

export default function FrameworkRecommendations({ analysis, framework }) {
  if (!analysis || !framework) {
    return null;
  }

  const recommendations = [];

  if (analysis.criteria_scores) {
    Object.entries(analysis.criteria_scores).forEach(([key, criterion]) => {
      if (criterion.score < 50) {
        recommendations.push({
          criterion: key,
          score: criterion.score,
          recommendation: `${CRITERIA_LABELS[key] || key} needs significant improvement. Focus on asking more targeted questions and exploring this area deeper.`,
          priority: 'high',
          tips: getTipsForCriterion(key, framework.framework_type)
        });
      } else if (criterion.score < 75) {
        recommendations.push({
          criterion: key,
          score: criterion.score,
          recommendation: `${CRITERIA_LABELS[key] || key} is progressing well. Continue building expertise in this area.`,
          priority: 'medium',
          tips: getTipsForCriterion(key, framework.framework_type)
        });
      }
    });
  }

  recommendations.sort((a, b) => a.score - b.score);

  if (recommendations.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Excellent Performance!</p>
              <p className="text-sm text-green-800 mt-1">
                You've demonstrated strong mastery across all criteria. Keep practicing to maintain and enhance your skills.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Coaching Recommendations</h3>

      {recommendations.map((rec, idx) => (
        <Card key={idx} className={rec.priority === 'high' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${rec.priority === 'high' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                  <AlertCircle className={`w-5 h-5 ${rec.priority === 'high' ? 'text-orange-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{CRITERIA_LABELS[rec.criterion] || rec.criterion}</CardTitle>
                  <p className="text-sm text-slate-700 mt-2">{rec.recommendation}</p>
                </div>
              </div>
              <Badge className={rec.priority === 'high' ? 'bg-orange-600' : 'bg-blue-600'}>
                {rec.score}/100
              </Badge>
            </div>
          </CardHeader>

          {rec.tips && rec.tips.length > 0 && (
            <CardContent>
              <div className="space-y-2 mt-2">
                <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Tips for improvement:
                </p>
                <ul className="space-y-1">
                  {rec.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} className="text-sm text-slate-700">
                      <span className="text-slate-400">→</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

function getTipsForCriterion(criterion, frameworkType) {
  const tips = {
    MEDDIC: {
      metrics: ['Ask about specific revenue or savings goals', 'Discuss ROI and quantifiable business outcomes', 'Explore performance metrics'],
      economic_buyer: ['Ask who controls the budget', 'Identify the final decision maker', 'Understand approval hierarchy'],
      decision_criteria: ['Ask what they evaluate vendors on', 'Explore must-have vs nice-to-have features', 'Understand success criteria'],
      decision_process: ['Ask how long decisions typically take', 'Understand the review and approval stages', 'Clarify next steps and timeline'],
      identify_pain: ['Ask open-ended questions about challenges', 'Listen for pain points and frustrations', 'Dig deeper into specific problems'],
      champion: ['Identify an internal advocate', 'Build a relationship with someone who supports your solution', 'Understand their influence']
    },
    BANT: {
      budget: ['Ask about allocated budget', 'Confirm if funds are approved', 'Understand budget constraints'],
      authority: ['Identify decision makers', 'Ask about approval authority', 'Understand stakeholder influence'],
      need: ['Ask about business problems', 'Understand priority and urgency', 'Explore specific needs'],
      timeline: ['Ask when they plan to decide', 'Understand implementation timeline', 'Identify key milestones']
    },
    SPIN: {
      situation: ['Ask about their current tools and processes', 'Understand their setup and systems', 'Ask open-ended questions'],
      problem: ['Ask about difficulties they face', 'Explore challenges in detail', 'Listen for frustrations'],
      implication: ['Ask about consequences of problems', 'Explore broader business impact', 'Help them see severity'],
      need_payoff: ['Ask about desired benefits', 'Build value around their needs', 'Let them state the value']
    },
    RUBRIC: {
      communication: ['Speak clearly and concisely', 'Demonstrate active listening', 'Tailor your message to the audience'],
      discovery: ['Ask probing questions', 'Go deeper on each topic', 'Explore needs thoroughly'],
      objection_handling: ['Address concerns directly', 'Provide evidence-based responses', 'Find win-win solutions'],
      value_proposition: ['Connect benefits to their needs', 'Speak to specific outcomes', 'Show clear ROI'],
      next_steps: ['Propose clear next actions', 'Confirm timeline and expectations', 'Get agreement on follow-up']
    }
  };

  return tips[frameworkType]?.[criterion] || [];
}
