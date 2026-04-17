import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import {
  Target, DollarSign, ListChecks, HelpCircle, Check, X,
  ChevronRight, Star, Sparkles, Users, Building2, TrendingUp,
  ArrowRight, ArrowLeft, Zap, Award, BarChart2, RefreshCw
} from 'lucide-react';

const FRAMEWORKS = {
  MEDDIC: {
    color: 'from-blue-600 to-blue-800',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    iconBg: 'bg-blue-600',
    badge: 'bg-blue-100 text-blue-800',
    Icon: Target,
    tagline: 'Enterprise Sales Qualification',
    bestFor: ['Complex B2B deals', 'Long sales cycles', 'Multiple stakeholders'],
    metrics: { complexity: 90, structure: 95, flexibility: 40 },
    usedBy: 'Fortune 500 enterprise sales teams',
    criteria: ['Metrics', 'Economic Buyer', 'Decision Criteria', 'Decision Process', 'Identify Pain', 'Champion'],
    description: 'The gold standard for enterprise sales qualification. Ensures every deal is rigorously evaluated before investing resources.',
    sampleConvo: '"What measurable business outcomes are you trying to achieve, and how would you quantify success?"',
  },
  BANT: {
    color: 'from-emerald-600 to-emerald-800',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    iconBg: 'bg-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800',
    Icon: DollarSign,
    tagline: 'Fast & Efficient Qualification',
    bestFor: ['SMB / Mid-market', 'Short sales cycles', 'Transactional sales'],
    metrics: { complexity: 40, structure: 70, flexibility: 75 },
    usedBy: 'High-velocity inside sales teams',
    criteria: ['Budget', 'Authority', 'Need', 'Timeline'],
    description: 'Simple and battle-tested. Quickly determines whether a prospect is worth pursuing based on four core factors.',
    sampleConvo: '"Do you have budget allocated for this? Who else is involved in the decision?"',
  },
  SPIN: {
    color: 'from-sky-600 to-sky-800',
    lightBg: 'bg-sky-50',
    border: 'border-sky-200',
    accent: 'text-sky-700',
    iconBg: 'bg-sky-600',
    badge: 'bg-sky-100 text-sky-800',
    Icon: HelpCircle,
    tagline: 'Consultative Selling Method',
    bestFor: ['Consultative sales', 'Problem-focused selling', 'Creating urgency'],
    metrics: { complexity: 65, structure: 80, flexibility: 85 },
    usedBy: 'Consultative and solutions sales reps',
    criteria: ['Situation', 'Problem', 'Implication', 'Need-Payoff'],
    description: 'Uses strategic questioning to guide buyers to recognize their pain and the value of your solution.',
    sampleConvo: '"What happens to your team if this problem isn\'t solved in the next quarter?"',
  },
  RUBRIC: {
    color: 'from-amber-600 to-amber-800',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    iconBg: 'bg-amber-600',
    badge: 'bg-amber-100 text-amber-800',
    Icon: ListChecks,
    tagline: 'Flexible Custom Scoring',
    bestFor: ['Custom performance scoring', 'Team-specific standards', 'Training assessment'],
    metrics: { complexity: 50, structure: 60, flexibility: 98 },
    usedBy: 'Teams with unique evaluation criteria',
    criteria: ['Custom Categories', 'Performance Levels', 'Weighted Scoring', 'Flexible Rubric'],
    description: 'Fully customizable scoring system. Define your own categories, weights, and performance levels.',
    sampleConvo: '"Rate the rep\'s objection handling on a 1–5 scale based on your custom criteria."',
  },
};

const QUIZ_STEPS = [
  {
    id: 'role',
    question: 'What is your primary sales role?',
    options: [
      { value: 'ae', label: 'Account Executive', icon: Users, desc: 'Closing deals' },
      { value: 'sdr', label: 'SDR / BDR', icon: Zap, desc: 'Prospecting & qualifying' },
      { value: 'manager', label: 'Sales Manager', icon: Award, desc: 'Coaching & oversight' },
      { value: 'enablement', label: 'Sales Enablement', icon: BarChart2, desc: 'Training & metrics' },
    ]
  },
  {
    id: 'market',
    question: 'What market segment do you primarily sell to?',
    options: [
      { value: 'smb', label: 'SMB', icon: Building2, desc: 'Small & mid-sized businesses' },
      { value: 'midmarket', label: 'Mid-Market', icon: TrendingUp, desc: '100–1,000 employees' },
      { value: 'enterprise', label: 'Enterprise', icon: Target, desc: '1,000+ employees' },
      { value: 'mixed', label: 'Mixed', icon: ListChecks, desc: 'All segments' },
    ]
  },
  {
    id: 'cycle',
    question: 'What is your typical sales cycle length?',
    options: [
      { value: 'fast', label: 'Under 2 weeks', icon: Zap, desc: 'High-velocity / transactional' },
      { value: 'medium', label: '1–3 months', icon: TrendingUp, desc: 'Mid-cycle deals' },
      { value: 'long', label: '3–12 months', icon: Award, desc: 'Complex enterprise cycles' },
      { value: 'varies', label: 'It varies', icon: RefreshCw, desc: 'Depends on the deal' },
    ]
  },
  {
    id: 'goal',
    question: 'What is your main coaching goal?',
    options: [
      { value: 'qualify', label: 'Better Qualification', icon: Check, desc: 'Filter out bad deals early' },
      { value: 'discovery', label: 'Deeper Discovery', icon: HelpCircle, desc: 'Uncover real pain points' },
      { value: 'structure', label: 'Process Consistency', icon: ListChecks, desc: 'Standardize the team' },
      { value: 'custom', label: 'Custom Standards', icon: Sparkles, desc: 'My own scoring system' },
    ]
  },
];

function getRecommendation(answers) {
  const { market, cycle, goal } = answers;

  if (goal === 'custom') return 'RUBRIC';
  if (goal === 'discovery') return 'SPIN';
  if (market === 'enterprise' || cycle === 'long') return 'MEDDIC';
  if (market === 'smb' || cycle === 'fast') return 'BANT';
  if (goal === 'qualify') return 'BANT';
  if (goal === 'structure') return 'MEDDIC';
  return 'SPIN';
}

function MetricBar({ label, value, color = 'bg-blue-500' }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function FrameworkCard({ framework, meta, isDefault, isActive, onSelect, onToggle, onSetDefault, canManage }) {
  const { Icon, color, lightBg, border, accent, iconBg, badge, tagline, bestFor, metrics, description } = meta;

  return (
    <div
      className={`group relative bg-white rounded-2xl border ${border} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col`}
      onClick={onSelect}
    >
      <div className={`bg-gradient-to-br ${color} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white" />
          <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-xl mb-3">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{framework.name}</h3>
            <p className="text-sm text-white text-opacity-80 mt-0.5">{tagline}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {isDefault && (
              <div className="flex items-center gap-1 bg-white bg-opacity-20 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span className="text-xs font-semibold text-white">Default</span>
              </div>
            )}
            {!isActive && (
              <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full">
                <span className="text-xs font-semibold text-white">Disabled</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

        <div className="space-y-1.5">
          {bestFor.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
              <Check className={`w-3.5 h-3.5 flex-shrink-0 ${accent}`} />
              {item}
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <MetricBar label="Structure" value={metrics.structure} color={iconBg} />
          <MetricBar label="Flexibility" value={metrics.flexibility} color={iconBg} />
          <MetricBar label="Complexity" value={metrics.complexity} color={iconBg} />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs font-medium"
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
          {canManage && (
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
            >
              {isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationQuiz({ frameworks, onRecommend, onSetDefault, canManage, savingDefault, defaultFramework }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < QUIZ_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      const recommended = getRecommendation(newAnswers);
      setResult(recommended);
      onRecommend(recommended);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    onRecommend(null);
  };

  if (result) {
    const meta = FRAMEWORKS[result];
    const fw = frameworks.find(f => f.framework_type === result);
    const isCurrentDefault = fw && defaultFramework === fw.id;

    return (
      <div className="space-y-6">
        <div className={`bg-gradient-to-br ${meta.color} rounded-2xl p-8 text-white text-center relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-8 top-4 w-32 h-32 rounded-full bg-white" />
            <div className="absolute left-0 bottom-0 w-24 h-24 rounded-full bg-white" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-2xl mb-4">
              <meta.Icon className="w-8 h-8 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-semibold">Best Match for You</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{fw?.name}</h2>
            <p className="text-white text-opacity-85 text-base max-w-md mx-auto">{meta.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(meta.metrics).map(([key, val]) => (
            <div key={key} className={`${meta.lightBg} ${meta.border} border rounded-xl p-4 text-center`}>
              <div className={`text-2xl font-bold ${meta.accent}`}>{val}%</div>
              <div className="text-xs text-slate-600 capitalize mt-0.5">{key}</div>
            </div>
          ))}
        </div>

        <div className={`${meta.lightBg} ${meta.border} border rounded-xl p-5`}>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Sample Discovery Question</p>
          <p className={`text-sm font-medium ${meta.accent} italic`}>{meta.sampleConvo}</p>
        </div>

        <div className="flex gap-3">
          {canManage && fw && !isCurrentDefault && (
            <Button
              className={`flex-1 bg-gradient-to-r ${meta.color} text-white font-semibold border-0`}
              onClick={() => onSetDefault(fw.id)}
              disabled={savingDefault}
            >
              <Star className="w-4 h-4 mr-2" />
              Set as Default Framework
            </Button>
          )}
          {isCurrentDefault && (
            <div className={`flex-1 flex items-center justify-center gap-2 ${meta.lightBg} ${meta.border} border rounded-lg py-2 px-4`}>
              <Star className={`w-4 h-4 fill-amber-500 text-amber-500`} />
              <span className={`text-sm font-semibold ${meta.accent}`}>Already your default!</span>
            </div>
          )}
          <Button variant="outline" onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retake
          </Button>
        </div>
      </div>
    );
  }

  const current = QUIZ_STEPS[step];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Step {step + 1} of {QUIZ_STEPS.length}
          </span>
          <span className="text-xs text-slate-400">{Math.round(((step) / QUIZ_STEPS.length) * 100)}% complete</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${(step / QUIZ_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">{current.question}</h3>
        <p className="text-sm text-slate-500">Choose the option that best describes you</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {current.options.map(opt => {
          const OptIcon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => handleAnswer(current.id, opt.value)}
              className="group p-4 rounded-xl border-2 border-slate-200 bg-white text-left hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <OptIcon className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{opt.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}
    </div>
  );
}

export default function FrameworkSettings() {
  const [frameworks, setFrameworks] = useState([]);
  const [criteria, setCriteria] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [defaultFramework, setDefaultFramework] = useState(null);
  const [savingDefault, setSavingDefault] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [recommendedType, setRecommendedType] = useState(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user.company_id) setCompanyId(user.company_id);
      } catch (e) {
        console.error('Error fetching user:', e);
      }
      fetchFrameworks();
    };
    initPage();
  }, []);

  useEffect(() => {
    if (companyId) fetchCompanyFrameworkDefault();
  }, [companyId]);

  const fetchFrameworks = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluation_frameworks')
        .select('*')
        .order('name');
      if (error) throw error;
      setFrameworks(data || []);

      const criteriaMap = {};
      for (const fw of data || []) {
        const { data: cd } = await supabase
          .from('framework_criteria')
          .select('*, framework_scoring_rules(*)')
          .eq('framework_id', fw.id)
          .order('display_order');
        criteriaMap[fw.id] = cd || [];
      }
      setCriteria(criteriaMap);
    } catch (err) {
      toast.error('Failed to load frameworks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyFrameworkDefault = async () => {
    if (!companyId) return;
    try {
      const { data } = await supabase
        .from('company_framework_settings')
        .select('default_framework_id')
        .eq('company_id', companyId)
        .maybeSingle();
      if (data) setDefaultFramework(data.default_framework_id);
    } catch (err) {}
  };

  const handleSetDefault = async (frameworkId) => {
    if (!companyId) { toast.error('Company info not available'); return; }
    setSavingDefault(true);
    try {
      const { data: existing } = await supabase
        .from('company_framework_settings')
        .select('id')
        .eq('company_id', companyId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('company_framework_settings')
          .update({ default_framework_id: frameworkId })
          .eq('company_id', companyId);
      } else {
        await supabase
          .from('company_framework_settings')
          .insert([{ company_id: companyId, default_framework_id: frameworkId }]);
      }
      setDefaultFramework(frameworkId);
      toast.success('Default framework updated');
    } catch (err) {
      toast.error('Failed to update default framework');
    } finally {
      setSavingDefault(false);
    }
  };

  const toggleActive = async (frameworkId, isActive) => {
    try {
      await supabase
        .from('evaluation_frameworks')
        .update({ is_active: !isActive })
        .eq('id', frameworkId);
      setFrameworks(prev => prev.map(f => f.id === frameworkId ? { ...f, is_active: !isActive } : f));
      toast.success(isActive ? 'Framework disabled' : 'Framework enabled');
    } catch (err) {
      toast.error('Failed to update framework');
    }
  };

  const canManage = currentUser?.role === 'company_admin' || currentUser?.role === 'super_admin';
  const selectedFw = selectedFramework ? frameworks.find(f => f.id === selectedFramework) : null;
  const selectedMeta = selectedFw ? FRAMEWORKS[selectedFw.framework_type] : null;
  const selectedCriteria = selectedFramework ? (criteria[selectedFramework] || []) : [];

  const TABS = [
    { id: 'browse', label: 'Browse Frameworks' },
    { id: 'recommend', label: 'Get a Recommendation' },
    ...(canManage ? [{ id: 'manage', label: 'Manage & Set Default' }] : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full mb-4">
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">Evaluation System</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Evaluation Frameworks</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Choose the right scoring framework for your team's practice sessions. Not sure which one fits? Take our quick quiz.
          </p>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {frameworks.map(fw => {
              const meta = FRAMEWORKS[fw.framework_type];
              if (!meta) return null;
              return (
                <FrameworkCard
                  key={fw.id}
                  framework={fw}
                  meta={meta}
                  isDefault={defaultFramework === fw.id}
                  isActive={fw.is_active}
                  canManage={canManage}
                  onSelect={() => { setSelectedFramework(fw.id); setShowDetailsModal(true); }}
                  onToggle={() => toggleActive(fw.id, fw.is_active)}
                  onSetDefault={() => handleSetDefault(fw.id)}
                />
              );
            })}
          </div>
        )}

        {activeTab === 'recommend' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Framework Recommender</h2>
                  <p className="text-sm text-slate-500">Answer 4 quick questions to find your match</p>
                </div>
              </div>
              <RecommendationQuiz
                frameworks={frameworks}
                onRecommend={setRecommendedType}
                onSetDefault={handleSetDefault}
                canManage={canManage}
                savingDefault={savingDefault}
                defaultFramework={defaultFramework}
              />
            </div>
          </div>
        )}

        {activeTab === 'manage' && canManage && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-lg">Set Default Framework</h2>
                <p className="text-sm text-slate-500 mt-1">The default framework is pre-selected when your team starts a practice session</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {frameworks.filter(f => f.is_active).map(fw => {
                  const meta = FRAMEWORKS[fw.framework_type];
                  if (!meta) return null;
                  const isSelected = defaultFramework === fw.id;
                  return (
                    <button
                      key={fw.id}
                      onClick={() => handleSetDefault(fw.id)}
                      disabled={savingDefault}
                      className={`group p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? `border-blue-500 bg-blue-50`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      } disabled:opacity-50`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0`}>
                          <meta.Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm">{fw.name}</p>
                          <p className="text-xs text-slate-500">{meta.tagline}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-lg">Enable / Disable Frameworks</h2>
                <p className="text-sm text-slate-500 mt-1">Only enabled frameworks appear in practice session setup</p>
              </div>
              <div className="divide-y divide-slate-100">
                {frameworks.map(fw => {
                  const meta = FRAMEWORKS[fw.framework_type];
                  if (!meta) return null;
                  return (
                    <div key={fw.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
                          <meta.Icon className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{fw.name}</p>
                          <p className="text-xs text-slate-500">{meta.tagline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {defaultFramework === fw.id && (
                          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Default</span>
                        )}
                        <button
                          onClick={() => toggleActive(fw.id, fw.is_active)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${fw.is_active ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${fw.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {selectedFw && selectedMeta && (
            <>
              <div className={`bg-gradient-to-br ${selectedMeta.color} p-8 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white" />
                  <div className="absolute -left-8 bottom-0 w-32 h-32 rounded-full bg-white" />
                </div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 rounded-2xl mb-4">
                    <selectedMeta.Icon className="w-7 h-7 text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-bold text-white mb-1">{selectedFw.name}</DialogTitle>
                  <DialogDescription className="text-white text-opacity-85 text-base">{selectedMeta.tagline}</DialogDescription>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">About This Framework</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedMeta.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Core Pillars</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMeta.criteria.map((c, i) => (
                      <div key={i} className={`${selectedMeta.lightBg} ${selectedMeta.border} border rounded-lg px-3 py-2 text-sm font-medium ${selectedMeta.accent}`}>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <MetricBar label="Structure" value={selectedMeta.metrics.structure} color={selectedMeta.iconBg} />
                    <MetricBar label="Flexibility" value={selectedMeta.metrics.flexibility} color={selectedMeta.iconBg} />
                    <MetricBar label="Complexity" value={selectedMeta.metrics.complexity} color={selectedMeta.iconBg} />
                  </div>
                </div>

                <div className={`${selectedMeta.lightBg} ${selectedMeta.border} border rounded-xl p-5`}>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Sample Discovery Question</p>
                  <p className={`text-sm font-medium ${selectedMeta.accent} italic`}>{selectedMeta.sampleConvo}</p>
                </div>

                {selectedCriteria.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                      Evaluation Criteria ({selectedCriteria.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedCriteria.map(criterion => (
                        <div key={criterion.id} className="border border-slate-200 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h5 className="font-semibold text-slate-900 text-sm">{criterion.name}</h5>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selectedMeta.badge}`}>{criterion.criterion_key}</span>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{criterion.description}</p>
                          <p className="text-xs text-slate-400">Weight: <span className="font-semibold text-slate-600">{criterion.weight}</span></p>
                          {criterion.framework_scoring_rules?.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {criterion.framework_scoring_rules
                                .sort((a, b) => a.score_level - b.score_level)
                                .map(rule => (
                                  <div key={rule.id} className="bg-slate-50 rounded-lg p-2.5 text-xs">
                                    <p className="font-semibold text-slate-900">Level {rule.score_level}: {rule.label}</p>
                                    <p className="text-slate-500 mt-0.5">{rule.min_score}%–{rule.max_score}%</p>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {canManage && (
                  <div className="flex gap-3 pt-2">
                    {defaultFramework !== selectedFw.id && (
                      <Button
                        className={`flex-1 bg-gradient-to-r ${selectedMeta.color} text-white border-0`}
                        onClick={() => { handleSetDefault(selectedFw.id); setShowDetailsModal(false); }}
                        disabled={savingDefault}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => { toggleActive(selectedFw.id, selectedFw.is_active); setShowDetailsModal(false); }}
                    >
                      {selectedFw.is_active ? 'Disable Framework' : 'Enable Framework'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
