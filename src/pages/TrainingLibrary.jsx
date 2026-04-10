import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrainingDocument, AgentTrainingAttempt, AgentCertification, User } from '@/api/entities';
import {
  BookOpen, Plus, Search, Clock, Award, TrendingUp, Users,
  CheckCircle, Target, Filter, Upload, Star, Play,
  FileText, Video, Headphones, GraduationCap, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';
import TrainingUploadWizard from '@/components/training/TrainingUploadWizard';
import TrainingDocumentCard from '@/components/training/TrainingDocumentCard';

const CATEGORIES = [
  'Product Knowledge',
  'Objection Handling',
  'Discovery Techniques',
  'Closing Strategies',
  'Competitor Intelligence',
  'Compliance',
  'Sales Methodology',
  'Communication Skills'
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const DUMMY_COURSES = [
  {
    id: 'dummy-1',
    title: 'Mastering Discovery Calls',
    description: 'Learn how to run high-impact discovery calls that uncover real pain points and build trust with prospects.',
    category: 'Discovery Techniques',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 45,
    passing_score: 80,
    document_type: 'course',
    is_active: true,
    format: 'video',
    completions: 124,
    rating: 4.8,
    isNew: false,
    featured: true,
  },
  {
    id: 'dummy-2',
    title: 'Handling Price Objections',
    description: "A practical playbook for responding to 'It's too expensive' and other price-based objections without discounting.",
    category: 'Objection Handling',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 30,
    passing_score: 75,
    document_type: 'course',
    is_active: true,
    format: 'reading',
    completions: 89,
    rating: 4.6,
    isNew: false,
    featured: false,
  },
  {
    id: 'dummy-3',
    title: 'Product Deep Dive: Core Features',
    description: 'A comprehensive walkthrough of all core platform features, use cases, and how to position them to different buyer personas.',
    category: 'Product Knowledge',
    difficulty_level: 'beginner',
    estimated_time_minutes: 60,
    passing_score: 85,
    document_type: 'course',
    is_active: true,
    format: 'video',
    completions: 203,
    rating: 4.9,
    isNew: true,
    featured: true,
  },
  {
    id: 'dummy-4',
    title: 'MEDDIC Sales Methodology',
    description: 'Master the MEDDIC qualification framework to improve deal quality and forecast accuracy.',
    category: 'Sales Methodology',
    difficulty_level: 'advanced',
    estimated_time_minutes: 90,
    passing_score: 80,
    document_type: 'course',
    is_active: true,
    format: 'reading',
    completions: 67,
    rating: 4.7,
    isNew: false,
    featured: false,
  },
  {
    id: 'dummy-5',
    title: 'Competitive Battlecards',
    description: 'Head-to-head comparisons with top competitors. Know their weaknesses and how to position against them.',
    category: 'Competitor Intelligence',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 35,
    passing_score: 70,
    document_type: 'course',
    is_active: true,
    format: 'reading',
    completions: 145,
    rating: 4.5,
    isNew: true,
    featured: false,
  },
  {
    id: 'dummy-6',
    title: 'Executive Communication Skills',
    description: 'How to communicate with C-suite executives — what they care about, how to prep, and how to lead an executive meeting.',
    category: 'Communication Skills',
    difficulty_level: 'advanced',
    estimated_time_minutes: 50,
    passing_score: 80,
    document_type: 'course',
    is_active: true,
    format: 'video',
    completions: 58,
    rating: 4.9,
    isNew: false,
    featured: true,
  },
  {
    id: 'dummy-7',
    title: 'Closing Techniques That Work',
    description: 'Proven closing strategies including the assumptive close, urgency close, and how to navigate the final 20% of a deal.',
    category: 'Closing Strategies',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 40,
    passing_score: 75,
    document_type: 'course',
    is_active: true,
    format: 'video',
    completions: 112,
    rating: 4.7,
    isNew: false,
    featured: false,
  },
  {
    id: 'dummy-8',
    title: 'GDPR & Data Privacy for Sales',
    description: 'Essential compliance training covering GDPR, CCPA, and data handling best practices for sales teams.',
    category: 'Compliance',
    difficulty_level: 'beginner',
    estimated_time_minutes: 25,
    passing_score: 90,
    document_type: 'course',
    is_active: true,
    format: 'reading',
    completions: 310,
    rating: 4.3,
    isNew: false,
    featured: false,
  },
  {
    id: 'dummy-9',
    title: 'Pricing & Packaging Mastery',
    description: 'Understand every pricing tier, packaging option, and how to match deals to the right package without leaving money on the table.',
    category: 'Product Knowledge',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 35,
    passing_score: 85,
    document_type: 'course',
    is_active: true,
    format: 'reading',
    completions: 176,
    rating: 4.8,
    isNew: true,
    featured: false,
  },
  {
    id: 'dummy-10',
    title: 'Prospecting & Cold Outreach',
    description: 'Build a repeatable system for filling your pipeline — from ICP definition to multi-touch outreach sequences.',
    category: 'Sales Methodology',
    difficulty_level: 'beginner',
    estimated_time_minutes: 55,
    passing_score: 70,
    document_type: 'course',
    is_active: true,
    format: 'video',
    completions: 231,
    rating: 4.6,
    isNew: false,
    featured: true,
  },
  {
    id: 'dummy-11',
    title: 'Active Listening in Sales',
    description: 'Develop active listening skills that help you catch what prospects really mean, not just what they say.',
    category: 'Communication Skills',
    difficulty_level: 'beginner',
    estimated_time_minutes: 20,
    passing_score: 70,
    document_type: 'course',
    is_active: true,
    format: 'audio',
    completions: 189,
    rating: 4.5,
    isNew: false,
    featured: false,
  },
  {
    id: 'dummy-12',
    title: 'Multi-Threading Complex Deals',
    description: 'How to build relationships with multiple stakeholders in a complex enterprise deal to prevent single-threaded risk.',
    category: 'Closing Strategies',
    difficulty_level: 'advanced',
    estimated_time_minutes: 70,
    passing_score: 80,
    document_type: 'course',
    is_active: true,
    format: 'reading',
    completions: 43,
    rating: 4.9,
    isNew: true,
    featured: true,
  },
];

const FORMAT_ICONS = { video: Video, reading: FileText, audio: Headphones };
const FORMAT_COLORS = {
  video: 'bg-blue-100 text-blue-700',
  reading: 'bg-green-100 text-green-700',
  audio: 'bg-amber-100 text-amber-700',
};
const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  advanced: { label: 'Advanced', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};
const CATEGORY_STYLES = {
  'Product Knowledge': { border: 'border-blue-200', top: 'bg-blue-50', text: 'text-blue-700' },
  'Objection Handling': { border: 'border-orange-200', top: 'bg-orange-50', text: 'text-orange-700' },
  'Discovery Techniques': { border: 'border-green-200', top: 'bg-green-50', text: 'text-green-700' },
  'Closing Strategies': { border: 'border-rose-200', top: 'bg-rose-50', text: 'text-rose-700' },
  'Competitor Intelligence': { border: 'border-red-200', top: 'bg-red-50', text: 'text-red-700' },
  'Compliance': { border: 'border-slate-200', top: 'bg-slate-100', text: 'text-slate-700' },
  'Sales Methodology': { border: 'border-teal-200', top: 'bg-teal-50', text: 'text-teal-700' },
  'Communication Skills': { border: 'border-pink-200', top: 'bg-pink-50', text: 'text-pink-700' },
};

function CourseCard({ course, onStart }) {
  const FormatIcon = FORMAT_ICONS[course.format] || FileText;
  const diff = DIFFICULTY_CONFIG[course.difficulty_level] || DIFFICULTY_CONFIG.beginner;
  const style = CATEGORY_STYLES[course.category] || { border: 'border-slate-200', top: 'bg-slate-50', text: 'text-slate-700' };

  return (
    <div className={`bg-white rounded-2xl border ${style.border} hover:shadow-lg transition-all duration-200 group flex flex-col overflow-hidden`}>
      <div className={`${style.top} px-5 pt-5 pb-4`}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex gap-1.5 flex-wrap">
            {course.isNew && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">New</span>
            )}
            {course.featured && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${FORMAT_COLORS[course.format] || 'bg-slate-100 text-slate-600'}`}>
            <FormatIcon className="w-3 h-3" />
            {course.format}
          </span>
        </div>
        <h3 className={`font-bold text-slate-900 text-base leading-snug group-hover:${style.text} transition-colors`}>{course.title}</h3>
      </div>

      <div className="px-5 py-4 flex flex-col flex-1">
        <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{course.description}</p>

        <div className="flex items-center gap-3 mb-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />{course.estimated_time_minutes}m
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />{course.completions?.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{course.rating}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${diff.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {diff.label}
          </span>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 h-8 shadow-sm" onClick={() => onStart?.(course)}>
            <Play className="w-3 h-3 mr-1.5" />
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TrainingLibrary() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [newDoc, setNewDoc] = useState({
    title: '', description: '', content: '', category: 'Product Knowledge',
    difficulty_level: 'intermediate', estimated_time_minutes: 30, passing_score: 80, document_type: 'course'
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [user, docsData, attempts, certifications] = await Promise.all([
        User.me(), TrainingDocument.list('-created_date'), AgentTrainingAttempt.list(), AgentCertification.list()
      ]);
      setCurrentUser(user);
      setIsAdmin(['admin', 'super_admin', 'manager'].includes(user?.role));
      setDocuments(docsData || []);

      const statsMap = {};
      (docsData || []).forEach(doc => {
        const docAttempts = attempts.filter(a => a.document_id === doc.id);
        const uniqueUsers = new Set(docAttempts.map(a => a.agent_email)).size;
        const passedUsers = new Set(certifications.filter(c => c.document_id === doc.id && c.status === 'active').map(c => c.agent_email)).size;
        const avgScore = docAttempts.length > 0 ? docAttempts.reduce((s, a) => s + a.quiz_score, 0) / docAttempts.length : 0;
        statsMap[doc.id] = { totalAttempts: docAttempts.length, uniqueUsers, passedUsers, completionRate: uniqueUsers > 0 ? (passedUsers / uniqueUsers) * 100 : 0, avgScore: Math.round(avgScore) };
      });
      setStats(statsMap);
    } catch (error) {
      console.error('Failed to load training library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDoc.title || !newDoc.content) { toast.error('Title and content are required'); return; }
    try {
      await TrainingDocument.create({ ...newDoc, created_by: currentUser?.email || 'admin@effyai.com' });
      toast.success('Training document created successfully');
      setShowCreateModal(false);
      setNewDoc({ title: '', description: '', content: '', category: 'Product Knowledge', difficulty_level: 'intermediate', estimated_time_minutes: 30, passing_score: 80, document_type: 'course' });
      loadData();
    } catch { toast.error('Failed to create training document'); }
  };

  const handleDeleteDocument = async (doc) => {
    if (!confirm('Are you sure you want to delete this training document?')) return;
    try { await TrainingDocument.delete(doc.id); toast.success('Deleted'); loadData(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleManageQuestions = (doc) => navigate(createPageUrl(`ManageQuestions?docId=${doc.id}`));

  const handleGenerateQuiz = async (doc) => {
    if (!doc.content) { toast.error('No content available'); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-training-quiz`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id, content: doc.content, title: doc.title, difficulty: doc.difficulty_level, questionCount: 8 })
      });
      const result = await res.json();
      if (result.success) { toast.success(`Generated ${result.questions.length} questions`); navigate(createPageUrl(`ManageQuestions?docId=${doc.id}`)); }
      else throw new Error(result.error);
    } catch { toast.error('Failed to generate quiz'); }
  };

  const handleDuplicateDocument = async (doc) => {
    try {
      const { error } = await supabase.from('training_documents').insert({ ...doc, id: undefined, title: `${doc.title} (Copy)`, created_by: currentUser?.email, created_date: undefined, updated_date: undefined }).select().single();
      if (error) throw error;
      toast.success('Duplicated'); loadData();
    } catch { toast.error('Failed to duplicate'); }
  };

  const handleArchiveDocument = async (doc) => {
    try {
      const { error } = await supabase.from('training_documents').update({ is_active: !doc.is_active }).eq('id', doc.id);
      if (error) throw error;
      toast.success(doc.is_active ? 'Archived' : 'Activated'); loadData();
    } catch { toast.error('Failed to update'); }
  };

  const handleStartCourse = (course) => {
    if (course.id?.startsWith('dummy-')) { toast.info('Upload your own courses to get started!'); return; }
    navigate(createPageUrl(`CertificationTest?id=${course.id}`));
  };

  const allCourses = [
    ...DUMMY_COURSES,
    ...documents.map(d => ({ ...d, format: d.document_type === 'video' ? 'video' : 'reading', completions: stats[d.id]?.uniqueUsers || 0, rating: 4.5, isNew: false, featured: false }))
  ];

  const filteredCourses = allCourses.filter(c => {
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchTab = activeTab === 'all' || (activeTab === 'featured' && c.featured) || (activeTab === 'new' && c.isNew);
    return matchSearch && matchCat && matchTab;
  });

  const totalCompletions = DUMMY_COURSES.reduce((s, c) => s + c.completions, 0) + Object.values(stats).reduce((s, v) => s + (v.uniqueUsers || 0), 0);
  const avgRating = (DUMMY_COURSES.reduce((s, c) => s + c.rating, 0) / DUMMY_COURSES.length).toFixed(1);

  const TABS = [
    { id: 'all', label: 'All Courses', count: allCourses.length },
    { id: 'featured', label: 'Featured', count: allCourses.filter(c => c.featured).length },
    { id: 'new', label: 'New', count: allCourses.filter(c => c.isNew).length },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Training Library</h1>
                <p className="text-sm text-slate-500 mt-0.5">Sharpen your skills with curated sales training</p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowUploadWizard(true)} className="border-slate-300 h-9">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 h-9 shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Training Course</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label className="text-sm font-medium">Title</Label>
                        <Input value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} placeholder="e.g., Advanced Objection Handling" className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <Textarea value={newDoc.description} onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })} placeholder="Brief description of what this training covers" rows={2} className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content</Label>
                        <Textarea value={newDoc.content} onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })} placeholder="Full training content in markdown format" rows={8} className="mt-1.5" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Category</Label>
                          <Select value={newDoc.category} onValueChange={(v) => setNewDoc({ ...newDoc, category: v })}>
                            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Difficulty</Label>
                          <Select value={newDoc.difficulty_level} onValueChange={(v) => setNewDoc({ ...newDoc, difficulty_level: v })}>
                            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                            <SelectContent>{DIFFICULTY_LEVELS.map(l => <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Estimated Time (min)</Label>
                          <Input type="number" value={newDoc.estimated_time_minutes} onChange={(e) => setNewDoc({ ...newDoc, estimated_time_minutes: parseInt(e.target.value) })} className="mt-1.5" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Passing Score (%)</Label>
                          <Input type="number" value={newDoc.passing_score} onChange={(e) => setNewDoc({ ...newDoc, passing_score: parseInt(e.target.value) })} className="mt-1.5" />
                        </div>
                      </div>
                      <Button onClick={handleCreateDocument} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Course
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Total Courses', value: allCourses.length, icon: BookOpen, iconClass: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Completions', value: totalCompletions.toLocaleString(), icon: CheckCircle, iconClass: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Avg Rating', value: avgRating, icon: Star, iconClass: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Categories', value: CATEGORIES.length, icon: Layers, iconClass: 'text-teal-600', bg: 'bg-teal-50' },
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
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search courses, topics, skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white border-slate-200 h-10" />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[220px] bg-white border-slate-200 h-10">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedCategory('all'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id && selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.id && selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{tab.count}</span>
            </button>
          ))}

          <div className="w-px bg-slate-200 mx-1 flex-shrink-0" />

          {CATEGORIES.map(cat => {
            const count = allCourses.filter(c => c.category === cat).length;
            const s = CATEGORY_STYLES[cat] || {};
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(isActive ? 'all' : cat); setActiveTab('all'); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
                  isActive ? `${s.top} ${s.border} ${s.text}` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
                <span className={`font-semibold ${isActive ? s.text : 'text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No courses found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCourses.map(course =>
              course.id?.startsWith('dummy-') ? (
                <CourseCard key={course.id} course={course} onStart={handleStartCourse} />
              ) : (
                <TrainingDocumentCard
                  key={course.id}
                  document={course}
                  stats={stats[course.id] || {}}
                  isAdmin={isAdmin}
                  onEdit={() => toast.info('Edit functionality coming soon')}
                  onDelete={handleDeleteDocument}
                  onManageQuestions={handleManageQuestions}
                  onGenerateQuiz={handleGenerateQuiz}
                  onDuplicate={handleDuplicateDocument}
                  onArchive={handleArchiveDocument}
                  onViewStats={() => toast.info('Statistics view coming soon')}
                />
              )
            )}
          </div>
        )}
      </div>

      <TrainingUploadWizard
        open={showUploadWizard}
        onClose={() => setShowUploadWizard(false)}
        onSuccess={loadData}
        currentUser={currentUser}
      />
    </div>
  );
}
