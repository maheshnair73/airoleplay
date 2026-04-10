import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Award, Clock, TrendingUp, Trophy, CheckCircle, PlayCircle,
  RotateCcw, Search, Download, Target, Star, Plus, Lock,
  ChevronRight, Zap, GraduationCap, Shield, BookOpen, Users,
  BarChart2, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const DUMMY_CERTS = [
  {
    id: 'cert-1',
    name: 'Sales Fundamentals Certification',
    description: 'Master the core principles of modern sales, including prospecting, qualification, and closing techniques.',
    category: 'Sales Skills',
    difficulty: 'Beginner',
    passing_score: 70,
    time_limit_minutes: 30,
    question_count: 20,
    enrolled: 312,
    color: 'blue',
    icon: 'zap',
    popular: true,
  },
  {
    id: 'cert-2',
    name: 'Product Knowledge Expert',
    description: 'Comprehensive certification covering all product features, use cases, and competitive positioning.',
    category: 'Product Knowledge',
    difficulty: 'Intermediate',
    passing_score: 80,
    time_limit_minutes: 45,
    question_count: 30,
    enrolled: 198,
    color: 'teal',
    icon: 'book',
    popular: false,
  },
  {
    id: 'cert-3',
    name: 'Advanced Negotiation Tactics',
    description: 'Learn advanced negotiation strategies, objection handling, and deal structuring for complex sales.',
    category: 'Sales Skills',
    difficulty: 'Advanced',
    passing_score: 85,
    time_limit_minutes: 60,
    question_count: 25,
    enrolled: 134,
    color: 'amber',
    icon: 'star',
    popular: true,
  },
  {
    id: 'cert-4',
    name: 'Customer Success Certification',
    description: 'Certification in customer onboarding, retention strategies, and driving product adoption.',
    category: 'Customer Success',
    difficulty: 'Intermediate',
    passing_score: 75,
    time_limit_minutes: 40,
    question_count: 22,
    enrolled: 89,
    color: 'green',
    icon: 'check',
    popular: false,
  },
  {
    id: 'cert-5',
    name: 'Sales Leadership Certification',
    description: 'Essential skills for sales managers: coaching, forecasting, pipeline management, and team development.',
    category: 'Leadership',
    difficulty: 'Advanced',
    passing_score: 80,
    time_limit_minutes: 50,
    question_count: 28,
    enrolled: 67,
    color: 'rose',
    icon: 'trophy',
    popular: false,
  },
  {
    id: 'cert-6',
    name: 'CRM & Sales Tools Mastery',
    description: 'Get certified in CRM best practices, pipeline hygiene, and modern sales tech stack management.',
    category: 'Sales Tools',
    difficulty: 'Beginner',
    passing_score: 70,
    time_limit_minutes: 25,
    question_count: 18,
    enrolled: 245,
    color: 'slate',
    icon: 'bar',
    popular: true,
  },
];

const EARNED_CERTS = [
  {
    id: 'earned-1',
    cert_id: 'cert-1',
    name: 'Sales Fundamentals Certification',
    score: 88,
    issued_date: '2026-01-15',
    valid_until: '2027-01-15',
    status: 'active',
    category: 'Sales Skills',
    color: 'blue',
  },
  {
    id: 'earned-2',
    cert_id: 'cert-6',
    name: 'CRM & Sales Tools Mastery',
    score: 92,
    issued_date: '2026-02-08',
    valid_until: '2027-02-08',
    status: 'active',
    category: 'Sales Tools',
    color: 'slate',
  },
  {
    id: 'earned-3',
    cert_id: 'cert-old',
    name: 'Legacy Certification (2024)',
    score: 76,
    issued_date: '2024-03-01',
    valid_until: '2025-03-01',
    status: 'expired',
    category: 'Sales Skills',
    color: 'slate',
  },
];

const DIFFICULTY_CONFIG = {
  Beginner: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Intermediate: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  Advanced: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const CERT_COLORS = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'bg-teal-600', badge: 'bg-teal-100 text-teal-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-600', badge: 'bg-green-100 text-green-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'bg-rose-600', badge: 'bg-rose-100 text-rose-700' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'bg-slate-700', badge: 'bg-slate-100 text-slate-700' },
};

const CERT_ICONS = {
  zap: Zap, book: BookOpen, star: Star, check: CheckCircle, trophy: Trophy, bar: BarChart2
};

function CertCard({ cert, onStart, isEarned }) {
  const style = CERT_COLORS[cert.color] || CERT_COLORS.blue;
  const diff = DIFFICULTY_CONFIG[cert.difficulty] || DIFFICULTY_CONFIG.Beginner;
  const CertIcon = CERT_ICONS[cert.icon] || Trophy;

  return (
    <div className={`bg-white rounded-2xl border ${style.border} hover:shadow-lg transition-all duration-200 group flex flex-col overflow-hidden`}>
      <div className={`${style.bg} px-5 pt-5 pb-4`}>
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className={`w-10 h-10 rounded-xl ${style.icon} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
            <CertIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex gap-1.5">
            {cert.popular && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-full">Popular</span>
            )}
            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${diff.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
              {cert.difficulty}
            </span>
          </div>
        </div>
        <h3 className="font-bold text-slate-900 text-sm leading-snug">{cert.name}</h3>
        <p className="text-xs text-slate-500 mt-1">{cert.category}</p>
      </div>

      <div className="px-5 py-4 flex flex-col flex-1">
        <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{cert.description}</p>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-xs font-bold text-slate-800">{cert.question_count}</p>
            <p className="text-xs text-slate-400">Questions</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-xs font-bold text-slate-800">{cert.time_limit_minutes}m</p>
            <p className="text-xs text-slate-400">Time Limit</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-xs font-bold text-slate-800">{cert.passing_score}%</p>
            <p className="text-xs text-slate-400">To Pass</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />{cert.enrolled?.toLocaleString()} enrolled
          </span>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 h-8 shadow-sm"
            onClick={() => onStart?.(cert)}
          >
            <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
            Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CertifyHub() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiff, setFilterDiff] = useState('all');
  const [myCertifications, setMyCertifications] = useState([]);
  const [inProgressTests, setInProgressTests] = useState([]);
  const [dbTests, setDbTests] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [testsRes, certsRes, attemptsRes] = await Promise.all([
        supabase.from('certification_tests').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('user_certifications').select('*, certification_tests(name, description, badge_icon, badge_color)').eq('user_id', user.id).order('issued_date', { ascending: false }),
        supabase.from('certification_attempts').select('*').eq('user_id', user.id).eq('status', 'in_progress'),
      ]);

      setDbTests(testsRes.data || []);
      setMyCertifications(certsRes.data || []);
      setInProgressTests(attemptsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const allAvailableTests = [...DUMMY_CERTS, ...dbTests.map(t => ({
    id: t.id, name: t.name, description: t.description, category: t.category || 'Sales',
    difficulty: t.difficulty || 'Intermediate', passing_score: t.passing_score, time_limit_minutes: t.time_limit_minutes,
    question_count: 0, enrolled: 0, color: 'blue', icon: 'trophy', popular: false, isDb: true,
  }))];

  const allEarned = [...EARNED_CERTS, ...myCertifications.map(c => ({
    id: c.id, cert_id: c.certification_test_id, name: c.certification_tests?.name || 'Certification',
    score: c.score, issued_date: c.issued_date, valid_until: c.valid_until,
    status: new Date(c.valid_until) > new Date() ? 'active' : 'expired',
    category: c.certification_tests?.badge_color || 'Sales', color: 'blue',
  }))];

  const filteredTests = allAvailableTests.filter(t => {
    const matchSearch = !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDiff = filterDiff === 'all' || t.difficulty === filterDiff;
    return matchSearch && matchDiff;
  });

  const activeCerts = allEarned.filter(c => c.status === 'active');
  const expiredCerts = allEarned.filter(c => c.status === 'expired');
  const avgScore = allEarned.length > 0 ? Math.round(allEarned.reduce((s, c) => s + (c.score || 0), 0) / allEarned.length) : 0;

  const handleStart = (cert) => {
    if (cert.isDb) { navigate(`/certification-test/${cert.id}`); return; }
    toast.info('Demo certifications — create a real test to get started!');
  };

  const TABS = [
    { id: 'available', label: 'Available Tests', count: filteredTests.length },
    { id: 'earned', label: 'My Certifications', count: allEarned.length },
    { id: 'in-progress', label: 'In Progress', count: inProgressTests.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Certify Hub</h1>
                <p className="text-sm text-slate-500 mt-0.5">Earn certifications and validate your expertise</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toast.success('Export coming soon!')} className="border-slate-300 h-9">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Link to={createPageUrl('CreateCertification')}>
                <Button className="bg-amber-500 hover:bg-amber-600 h-9 shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Available Tests', value: allAvailableTests.length, icon: Trophy, iconClass: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Earned', value: activeCerts.length, icon: CheckCircle, iconClass: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp, iconClass: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'In Progress', value: inProgressTests.length, icon: RotateCcw, iconClass: 'text-teal-600', bg: 'bg-teal-50' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.iconClass}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.id ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {activeTab === 'available' && (
          <>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search certifications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white border-slate-200 h-10" />
              </div>
              <div className="flex gap-2">
                {['all', 'Beginner', 'Intermediate', 'Advanced'].map(d => (
                  <button
                    key={d}
                    onClick={() => setFilterDiff(d)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                      filterDiff === d
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {d === 'all' ? 'All Levels' : d}
                  </button>
                ))}
              </div>
            </div>

            {filteredTests.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No certifications found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTests.map(cert => (
                  <CertCard key={cert.id} cert={cert} onStart={handleStart} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'earned' && (
          <div className="space-y-6">
            {activeCerts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Active Certifications ({activeCerts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCerts.map(cert => {
                    const style = CERT_COLORS[cert.color] || CERT_COLORS.blue;
                    return (
                      <div key={cert.id} className={`bg-white rounded-2xl border-2 border-green-200 overflow-hidden`}>
                        <div className="bg-green-50 px-5 pt-4 pb-3 flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{cert.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{cert.category}</p>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                          <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Score</span>
                              <span className="font-semibold text-slate-800">{cert.score}%</span>
                            </div>
                            <Progress value={cert.score} className="h-1.5" />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Valid until</span>
                            <span className="font-medium text-green-600">{new Date(cert.valid_until).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <span className="flex-1 text-center py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                              Certified
                            </span>
                            <Button size="sm" variant="outline" className="h-8 text-xs">
                              View Certificate
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {expiredCerts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-400" />
                  Expired ({expiredCerts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expiredCerts.map(cert => (
                    <div key={cert.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden opacity-70">
                      <div className="bg-slate-50 px-5 pt-4 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-700 text-sm">{cert.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{cert.category}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-400 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Expired</span>
                          <span className="font-medium text-red-500">{new Date(cert.valid_until).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="flex-1 text-center py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">
                            Expired
                          </span>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setActiveTab('available')}>
                            Renew
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allEarned.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
                <p className="font-semibold text-slate-700">No certifications yet</p>
                <p className="text-sm text-slate-400 mt-1 mb-4">Start a test to earn your first certification</p>
                <Button onClick={() => setActiveTab('available')} className="bg-amber-500 hover:bg-amber-600">
                  Browse Tests
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'in-progress' && (
          <div>
            {inProgressTests.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-8 h-8 text-blue-400" />
                </div>
                <p className="font-semibold text-slate-700">No tests in progress</p>
                <p className="text-sm text-slate-400 mt-1 mb-4">Start a certification test to see it here</p>
                <Button onClick={() => setActiveTab('available')} className="bg-blue-600 hover:bg-blue-700">
                  Browse Tests
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressTests.map(attempt => (
                  <div key={attempt.id} className="bg-white rounded-2xl border border-blue-200 overflow-hidden">
                    <div className="bg-blue-50 px-5 pt-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Test in Progress</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Started {new Date(attempt.started_at).toLocaleDateString()}</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
                          <RotateCcw className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Time spent</span>
                        <span className="font-medium text-slate-800">{Math.floor((attempt.time_spent || 0) / 60)} min</span>
                      </div>
                      <Button onClick={() => navigate(`/certification-test/${attempt.id}`)} className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Resume Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
