import { supabase } from '@/lib/supabase';

export const frameworkAnalyzer = {
  async getFrameworkDetails(frameworkId) {
    if (!frameworkId) return null;

    const { data: framework } = await supabase
      .from('evaluation_frameworks')
      .select('*')
      .eq('id', frameworkId)
      .single();

    if (!framework) return null;

    const { data: criteria } = await supabase
      .from('framework_criteria')
      .select('*, framework_scoring_rules(*)')
      .eq('framework_id', frameworkId)
      .order('display_order');

    return {
      ...framework,
      criteria: criteria || []
    };
  },

  analyzeMEDDIC(transcript) {
    const indicators = {
      metrics: { found: false, score: 0, evidence: [] },
      economic_buyer: { found: false, score: 0, evidence: [] },
      decision_criteria: { found: false, score: 0, evidence: [] },
      decision_process: { found: false, score: 0, evidence: [] },
      identify_pain: { found: false, score: 0, evidence: [] },
      champion: { found: false, score: 0, evidence: [] }
    };

    const patterns = {
      metrics: ['revenue', 'roi', 'savings', 'percentage', 'growth', 'numbers', 'metrics', 'goals'],
      economic_buyer: ['budget', 'authority', 'decision', 'approve', 'sign-off', 'cfo', 'ceo', 'financial'],
      decision_criteria: ['requirements', 'must have', 'important', 'need', 'criteria', 'evaluation', 'features'],
      decision_process: ['timeline', 'decision', 'process', 'stage', 'when', 'how long', 'next step'],
      identify_pain: ['problem', 'challenge', 'pain', 'issue', 'struggling', 'difficult', 'struggle', 'frustrated'],
      champion: ['internal', 'advocate', 'help', 'support', 'drive', 'push', 'champion', 'ally']
    };

    const normalizedTranscript = transcript.toLowerCase();

    Object.entries(patterns).forEach(([key, words]) => {
      const matches = words.filter(word => normalizedTranscript.includes(word));
      if (matches.length > 0) {
        indicators[key].found = true;
        indicators[key].score = Math.min(100, 20 + matches.length * 15);
        indicators[key].evidence = matches.slice(0, 3);
      }
    });

    const totalScore = Object.values(indicators).reduce((sum, ind) => sum + ind.score, 0) / 6;

    return {
      framework_type: 'MEDDIC',
      overall_score: Math.round(totalScore),
      criteria_scores: indicators,
      timestamp: new Date().toISOString()
    };
  },

  analyzeBANT(transcript) {
    const indicators = {
      budget: { found: false, score: 0, evidence: [] },
      authority: { found: false, score: 0, evidence: [] },
      need: { found: false, score: 0, evidence: [] },
      timeline: { found: false, score: 0, evidence: [] }
    };

    const patterns = {
      budget: ['budget', 'cost', 'price', 'investment', 'amount', 'approved', 'allocated', 'funding'],
      authority: ['decision', 'approve', 'authority', 'sign-off', 'stakeholder', 'team', 'vote', 'final say'],
      need: ['need', 'problem', 'challenge', 'issue', 'pain', 'requirement', 'must', 'necessary'],
      timeline: ['when', 'timeline', 'date', 'quarter', 'month', 'implement', 'deadline', 'schedule']
    };

    const normalizedTranscript = transcript.toLowerCase();

    Object.entries(patterns).forEach(([key, words]) => {
      const matches = words.filter(word => normalizedTranscript.includes(word));
      if (matches.length > 0) {
        indicators[key].found = true;
        indicators[key].score = Math.min(100, 25 + matches.length * 18);
        indicators[key].evidence = matches.slice(0, 2);
      }
    });

    const totalScore = Object.values(indicators).reduce((sum, ind) => sum + ind.score, 0) / 4;

    return {
      framework_type: 'BANT',
      overall_score: Math.round(totalScore),
      criteria_scores: indicators,
      timestamp: new Date().toISOString()
    };
  },

  analyzeSPIN(transcript) {
    const indicators = {
      situation: { found: false, score: 0, evidence: [] },
      problem: { found: false, score: 0, evidence: [] },
      implication: { found: false, score: 0, evidence: [] },
      need_payoff: { found: false, score: 0, evidence: [] }
    };

    const patterns = {
      situation: ['current', 'currently', 'today', 'right now', 'existing', 'setup', 'system', 'using'],
      problem: ['problem', 'difficult', 'challenge', 'struggle', 'pain', 'issue', 'concern', 'worry'],
      implication: ['if that continues', 'result', 'consequence', 'impact', 'affect', 'lead to', 'mean'],
      need_payoff: ['benefit', 'advantage', 'improve', 'help', 'solve', 'value', 'gain', 'achieve']
    };

    const normalizedTranscript = transcript.toLowerCase();

    Object.entries(patterns).forEach(([key, words]) => {
      const matches = words.filter(word => normalizedTranscript.includes(word));
      if (matches.length > 0) {
        indicators[key].found = true;
        indicators[key].score = Math.min(100, 25 + matches.length * 18);
        indicators[key].evidence = matches.slice(0, 2);
      }
    });

    const totalScore = Object.values(indicators).reduce((sum, ind) => sum + ind.score, 0) / 4;

    return {
      framework_type: 'SPIN',
      overall_score: Math.round(totalScore),
      criteria_scores: indicators,
      timestamp: new Date().toISOString()
    };
  },

  analyzeRUBRIC(transcript) {
    const indicators = {
      communication: { found: true, score: 65, evidence: ['Clear articulation', 'Listening demonstrated'] },
      discovery: { found: true, score: 70, evidence: ['Questions asked', 'Needs explored'] },
      objection_handling: { found: true, score: 55, evidence: ['Addressed concerns'] },
      value_proposition: { found: true, score: 60, evidence: ['Benefits mentioned'] },
      next_steps: { found: true, score: 50, evidence: ['Call to action'] }
    };

    const totalScore = Object.values(indicators).reduce((sum, ind) => sum + ind.score, 0) / 5;

    return {
      framework_type: 'RUBRIC',
      overall_score: Math.round(totalScore),
      criteria_scores: indicators,
      timestamp: new Date().toISOString()
    };
  },

  async analyzeTranscript(transcript, frameworkId) {
    const framework = await this.getFrameworkDetails(frameworkId);
    if (!framework) return null;

    let analysis = {};

    switch (framework.framework_type) {
      case 'MEDDIC':
        analysis = this.analyzeMEDDIC(transcript);
        break;
      case 'BANT':
        analysis = this.analyzeBANT(transcript);
        break;
      case 'SPIN':
        analysis = this.analyzeSPIN(transcript);
        break;
      case 'RUBRIC':
        analysis = this.analyzeRUBRIC(transcript);
        break;
      default:
        analysis = this.analyzeRUBRIC(transcript);
    }

    return {
      ...analysis,
      framework_id: frameworkId,
      framework_name: framework.name
    };
  },

  getScoreLevel(score) {
    if (score < 20) return { level: 1, label: 'Not Addressed', color: 'bg-red-500' };
    if (score < 40) return { level: 2, label: 'Mentioned', color: 'bg-orange-500' };
    if (score < 70) return { level: 3, label: 'Explored', color: 'bg-yellow-500' };
    if (score < 90) return { level: 4, label: 'Mastered', color: 'bg-green-500' };
    return { level: 5, label: 'Exemplary', color: 'bg-emerald-600' };
  },

  generateRecommendations(analysis) {
    const recommendations = [];

    if (!analysis.criteria_scores) return recommendations;

    Object.entries(analysis.criteria_scores).forEach(([key, criterion]) => {
      if (criterion.score < 50) {
        recommendations.push({
          criterion: key,
          score: criterion.score,
          recommendation: `Focus on improving ${key.replace(/_/g, ' ')}. This area needs more attention.`,
          priority: 'high'
        });
      } else if (criterion.score < 75) {
        recommendations.push({
          criterion: key,
          score: criterion.score,
          recommendation: `Continue developing ${key.replace(/_/g, ' ')}. Practice deeper engagement.`,
          priority: 'medium'
        });
      }
    });

    return recommendations.sort((a, b) => a.score - b.score);
  }
};
