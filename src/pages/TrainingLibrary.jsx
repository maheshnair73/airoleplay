import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrainingDocument, AgentTrainingAttempt, AgentCertification, User } from '@/api/entities';
import {
  BookOpen, Plus, Search, Clock, Award, TrendingUp, Users,
  CheckCircle, Target, Brain, Filter, Edit, Trash2, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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

export default function TrainingLibrary() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({});
  const [newDoc, setNewDoc] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Product Knowledge',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 30,
    passing_score: 80,
    document_type: 'course'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedCategory]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [user, docsData, attempts, certifications] = await Promise.all([
        User.me(),
        TrainingDocument.list('-created_date'),
        AgentTrainingAttempt.list(),
        AgentCertification.list()
      ]);

      setCurrentUser(user);
      setIsAdmin(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager');
      setDocuments(docsData || []);

      const statsMap = {};
      docsData.forEach(doc => {
        const docAttempts = attempts.filter(a => a.document_id === doc.id);
        const docCertifications = certifications.filter(c => c.document_id === doc.id);
        const uniqueUsers = new Set(docAttempts.map(a => a.agent_email)).size;
        const passedUsers = new Set(docCertifications.filter(c => c.status === 'active').map(c => c.agent_email)).size;
        const avgScore = docAttempts.length > 0
          ? docAttempts.reduce((sum, a) => sum + a.quiz_score, 0) / docAttempts.length
          : 0;

        statsMap[doc.id] = {
          totalAttempts: docAttempts.length,
          uniqueUsers,
          passedUsers,
          completionRate: uniqueUsers > 0 ? (passedUsers / uniqueUsers) * 100 : 0,
          avgScore: Math.round(avgScore)
        };
      });

      setStats(statsMap);
    } catch (error) {
      console.error('Failed to load training library:', error);
      toast.error('Failed to load training library');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query)
      );
    }

    setFilteredDocs(filtered);
  };

  const handleCreateDocument = async () => {
    if (!newDoc.title || !newDoc.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      await TrainingDocument.create({
        ...newDoc,
        created_by: currentUser?.email || 'admin@effyai.com'
      });
      toast.success('Training document created successfully');
      setShowCreateModal(false);
      setNewDoc({
        title: '',
        description: '',
        content: '',
        category: 'Product Knowledge',
        difficulty_level: 'intermediate',
        estimated_time_minutes: 30,
        passing_score: 80,
        document_type: 'course'
      });
      loadData();
    } catch (error) {
      console.error('Failed to create document:', error);
      toast.error('Failed to create training document');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this training document?')) return;

    try {
      await TrainingDocument.delete(docId);
      toast.success('Training document deleted');
      loadData();
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error('Failed to delete training document');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Product Knowledge': 'bg-blue-100 text-blue-800',
      'Objection Handling': 'bg-purple-100 text-purple-800',
      'Discovery Techniques': 'bg-green-100 text-green-800',
      'Closing Strategies': 'bg-orange-100 text-orange-800',
      'Competitor Intelligence': 'bg-red-100 text-red-800',
      'Compliance': 'bg-gray-100 text-gray-800',
      'Sales Methodology': 'bg-teal-100 text-teal-800',
      'Communication Skills': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  const getDifficultyColor = (level) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-700',
      'intermediate': 'bg-yellow-100 text-yellow-700',
      'advanced': 'bg-red-100 text-red-700'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Training Library
            </h1>
            <p className="text-slate-600 mt-1">
              Comprehensive sales training and certification programs
            </p>
          </div>
          {isAdmin && (
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Training
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Training Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                      placeholder="e.g., Advanced Objection Handling"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newDoc.description}
                      onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                      placeholder="Brief description of what this training covers"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={newDoc.content}
                      onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                      placeholder="Full training content in markdown format"
                      rows={8}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={newDoc.category} onValueChange={(val) => setNewDoc({ ...newDoc, category: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Difficulty Level</Label>
                      <Select value={newDoc.difficulty_level} onValueChange={(val) => setNewDoc({ ...newDoc, difficulty_level: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTY_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Estimated Time (minutes)</Label>
                      <Input
                        type="number"
                        value={newDoc.estimated_time_minutes}
                        onChange={(e) => setNewDoc({ ...newDoc, estimated_time_minutes: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Passing Score (%)</Label>
                      <Input
                        type="number"
                        value={newDoc.passing_score}
                        onChange={(e) => setNewDoc({ ...newDoc, passing_score: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateDocument} className="w-full">
                    Create Training Document
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Courses</p>
                <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Certifications</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Object.values(stats).reduce((sum, s) => sum + s.passedUsers, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Learners</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Set(Object.values(stats).flatMap(s => Array(s.uniqueUsers).fill(0))).size}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Completion</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(Object.values(stats).reduce((sum, s) => sum + s.completionRate, 0) / Math.max(Object.values(stats).length, 1))}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search training courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => {
            const docStats = stats[doc.id] || {};
            return (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {doc.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge className={getCategoryColor(doc.category)}>
                      {doc.category}
                    </Badge>
                    <Badge className={getDifficultyColor(doc.difficulty_level)}>
                      {doc.difficulty_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {doc.estimated_time_minutes} min
                      </span>
                      <span className="text-slate-600 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Pass: {doc.passing_score}%
                      </span>
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Completion Rate</span>
                        <span className="font-semibold text-slate-900">
                          {Math.round(docStats.completionRate || 0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Avg Score</span>
                        <span className="font-semibold text-slate-900">
                          {docStats.avgScore || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Learners</span>
                        <span className="font-semibold text-slate-900">
                          {docStats.uniqueUsers || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3">
                      <Link to={createPageUrl(`TrainerBot?docId=${doc.id}`)} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Brain className="w-4 h-4 mr-2" />
                          Start Training
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredDocs.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-slate-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No training courses found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
