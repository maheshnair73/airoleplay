import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrainingDocument,
  AgentTrainingAttempt,
  AgentCertification,
  PersonalizedTrainingAssignment,
  TrainingPerformanceCorrelation,
  RoleplaySession,
  User
} from '@/api/entities';
import {
  TrendingUp, Users, Clock, Award, Target, DollarSign,
  BarChart3, PieChart, Activity, CheckCircle, AlertCircle,
  ArrowUp, ArrowDown, Brain, Zap, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function TrainingROIAnalytics() {
  const [documents, setDocuments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [
        docsData,
        attemptsData,
        certsData,
        assignmentsData,
        correlationsData,
        sessionsData,
        usersData
      ] = await Promise.all([
        TrainingDocument.list(),
        AgentTrainingAttempt.list(),
        AgentCertification.list(),
        PersonalizedTrainingAssignment.list(),
        TrainingPerformanceCorrelation.list(),
        RoleplaySession.list(),
        User.list()
      ]);

      const daysBack = parseInt(timeRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      setDocuments(docsData || []);
      setAttempts((attemptsData || []).filter(a => new Date(a.created_date) >= cutoffDate));
      setCertifications((certsData || []).filter(c => new Date(c.certification_date) >= cutoffDate));
      setAssignments((assignmentsData || []).filter(a => new Date(a.assigned_date) >= cutoffDate));
      setCorrelations(correlationsData || []);
      setSessions((sessionsData || []).filter(s => new Date(s.created_date) >= cutoffDate));
      setUsers(usersData || []);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallMetrics = () => {
    const totalInvestmentMinutes = attempts.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0);
    const totalCertifications = certifications.filter(c => c.status === 'active').length;
    const uniqueLearners = new Set(attempts.map(a => a.agent_email)).size;
    const completionRate = assignments.length > 0
      ? (assignments.filter(a => a.status === 'completed').length / assignments.length) * 100
      : 0;

    const avgImprovement = correlations.length > 0
      ? correlations.reduce((sum, c) => sum + (c.improvement_percentage || 0), 0) / correlations.length
      : 0;

    const avgScore = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.quiz_score, 0) / attempts.length
      : 0;

    return {
      totalInvestmentHours: Math.round(totalInvestmentMinutes / 60),
      totalCertifications,
      uniqueLearners,
      completionRate: Math.round(completionRate),
      avgImprovement: Math.round(avgImprovement * 10) / 10,
      avgScore: Math.round(avgScore),
      totalAttempts: attempts.length
    };
  };

  const calculateTrainingEffectiveness = () => {
    return documents.map(doc => {
      const docAttempts = attempts.filter(a => a.document_id === doc.id);
      const docCorrelations = correlations.filter(c => c.training_document_id === doc.id);

      const avgTimeSpent = docAttempts.length > 0
        ? docAttempts.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0) / docAttempts.length
        : 0;

      const avgImprovement = docCorrelations.length > 0
        ? docCorrelations.reduce((sum, c) => sum + (c.improvement_percentage || 0), 0) / docCorrelations.length
        : 0;

      const roi = avgTimeSpent > 0 ? (avgImprovement / avgTimeSpent) * 100 : 0;

      return {
        name: doc.title,
        category: doc.category,
        avgTimeSpent: Math.round(avgTimeSpent),
        avgImprovement: Math.round(avgImprovement * 10) / 10,
        roi: Math.round(roi * 10) / 10,
        attempts: docAttempts.length,
        certifications: certifications.filter(c => c.document_id === doc.id && c.status === 'active').length
      };
    }).sort((a, b) => b.roi - a.roi);
  };

  const calculateCategoryDistribution = () => {
    const categoryMap = {};
    documents.forEach(doc => {
      const docAttempts = attempts.filter(a => a.document_id === doc.id);
      if (!categoryMap[doc.category]) {
        categoryMap[doc.category] = 0;
      }
      categoryMap[doc.category] += docAttempts.length;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / attempts.length) * 100)
    }));
  };

  const calculateCompletionTrend = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayAttempts = attempts.filter(a =>
        a.completed_at && a.completed_at.startsWith(date)
      );
      const dayPassed = dayAttempts.filter(a => a.passed).length;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attempts: dayAttempts.length,
        passed: dayPassed,
        passRate: dayAttempts.length > 0 ? Math.round((dayPassed / dayAttempts.length) * 100) : 0
      };
    });
  };

  const calculatePersonalizedTrainingImpact = () => {
    const personalizedAssignments = assignments.filter(a => a.triggered_by_session_id);
    const genericAttempts = attempts.filter(a =>
      !personalizedAssignments.find(pa => pa.agent_email === a.agent_email && pa.document_id === a.document_id)
    );

    const personalizedAttempts = attempts.filter(a =>
      personalizedAssignments.find(pa => pa.agent_email === a.agent_email && pa.document_id === a.document_id)
    );

    const personalizedAvgScore = personalizedAttempts.length > 0
      ? personalizedAttempts.reduce((sum, a) => sum + a.quiz_score, 0) / personalizedAttempts.length
      : 0;

    const genericAvgScore = genericAttempts.length > 0
      ? genericAttempts.reduce((sum, a) => sum + a.quiz_score, 0) / genericAttempts.length
      : 0;

    const personalizedCompletionRate = personalizedAssignments.length > 0
      ? (personalizedAssignments.filter(a => a.status === 'completed').length / personalizedAssignments.length) * 100
      : 0;

    return {
      personalizedCount: personalizedAssignments.length,
      genericCount: genericAttempts.length,
      personalizedAvgScore: Math.round(personalizedAvgScore),
      genericAvgScore: Math.round(genericAvgScore),
      personalizedCompletionRate: Math.round(personalizedCompletionRate),
      scoreDifference: Math.round(personalizedAvgScore - genericAvgScore)
    };
  };

  const calculateTopPerformers = () => {
    const userStats = {};

    users.forEach(user => {
      const userAttempts = attempts.filter(a => a.agent_email === user.email);
      const userCerts = certifications.filter(c => c.agent_email === user.email && c.status === 'active');
      const userCorrelations = correlations.filter(c => c.agent_email === user.email);

      if (userAttempts.length > 0) {
        const avgScore = userAttempts.reduce((sum, a) => sum + a.quiz_score, 0) / userAttempts.length;
        const avgImprovement = userCorrelations.length > 0
          ? userCorrelations.reduce((sum, c) => sum + (c.improvement_percentage || 0), 0) / userCorrelations.length
          : 0;

        userStats[user.email] = {
          name: user.full_name || user.email,
          email: user.email,
          avgScore: Math.round(avgScore),
          certifications: userCerts.length,
          improvement: Math.round(avgImprovement * 10) / 10,
          attempts: userAttempts.length
        };
      }
    });

    return Object.values(userStats)
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 5);
  };

  const metrics = calculateOverallMetrics();
  const trainingEffectiveness = calculateTrainingEffectiveness();
  const categoryDistribution = calculateCategoryDistribution();
  const completionTrend = calculateCompletionTrend();
  const personalizedImpact = calculatePersonalizedTrainingImpact();
  const topPerformers = calculateTopPerformers();

  const filteredTrainingData = selectedCategory === 'all'
    ? trainingEffectiveness
    : trainingEffectiveness.filter(t => t.category === selectedCategory);

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
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Training ROI Analytics
            </h1>
            <p className="text-slate-600 mt-1">
              Measure training effectiveness and performance impact
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Training Investment</p>
                  <p className="text-3xl font-bold text-slate-900">{metrics.totalInvestmentHours}h</p>
                  <p className="text-xs text-slate-500 mt-1">{metrics.totalAttempts} attempts</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Certifications</p>
                  <p className="text-3xl font-bold text-slate-900">{metrics.totalCertifications}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    Active learners: {metrics.uniqueLearners}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Improvement</p>
                  <p className="text-3xl font-bold text-slate-900">{metrics.avgImprovement}%</p>
                  <p className="text-xs text-slate-500 mt-1">Post-training gain</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-slate-900">{metrics.completionRate}%</p>
                  <p className="text-xs text-slate-500 mt-1">Avg score: {metrics.avgScore}%</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="effectiveness" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="effectiveness">Training Effectiveness</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="personalized">Personalized Impact</TabsTrigger>
            <TabsTrigger value="performers">Top Performers</TabsTrigger>
          </TabsList>

          <TabsContent value="effectiveness" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Training ROI by Course</CardTitle>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Product Knowledge">Product Knowledge</SelectItem>
                      <SelectItem value="Objection Handling">Objection Handling</SelectItem>
                      <SelectItem value="Discovery Techniques">Discovery Techniques</SelectItem>
                      <SelectItem value="Closing Strategies">Closing Strategies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  ROI calculated as performance improvement per minute of training
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredTrainingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgImprovement" fill="#3b82f6" name="Avg Improvement %" />
                    <Bar dataKey="avgTimeSpent" fill="#10b981" name="Avg Time (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training by Category</CardTitle>
                  <CardDescription>Distribution of training attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>High-ROI Training Courses</CardTitle>
                  <CardDescription>Most effective training per time invested</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainingEffectiveness.slice(0, 5).map((training, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{training.name}</p>
                          <p className="text-xs text-slate-600">{training.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">
                            ROI: {training.roi}
                          </Badge>
                          <p className="text-xs text-slate-600 mt-1">
                            {training.avgImprovement}% gain
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>7-Day Training Activity</CardTitle>
                <CardDescription>Daily training completion and pass rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={completionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="attempts" stroke="#3b82f6" name="Attempts" />
                    <Line type="monotone" dataKey="passed" stroke="#10b981" name="Passed" />
                    <Line type="monotone" dataKey="passRate" stroke="#f59e0b" name="Pass Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personalized" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Personalized Assignments</p>
                      <p className="text-2xl font-bold text-slate-900">{personalizedImpact.personalizedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-slate-900">{personalizedImpact.personalizedCompletionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Score Advantage</p>
                      <p className="text-2xl font-bold text-slate-900">+{personalizedImpact.scoreDifference}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Personalized vs Generic Training</CardTitle>
                <CardDescription>Comparison of training outcomes by assignment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-900">Personalized Training</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-800">Total Assignments</span>
                        <span className="font-bold text-purple-900">{personalizedImpact.personalizedCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-800">Avg Score</span>
                        <span className="font-bold text-purple-900">{personalizedImpact.personalizedAvgScore}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-800">Completion Rate</span>
                        <span className="font-bold text-purple-900">{personalizedImpact.personalizedCompletionRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-slate-600" />
                      <h3 className="font-semibold text-slate-900">Generic Training</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Total Attempts</span>
                        <span className="font-bold text-slate-900">{personalizedImpact.genericCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Avg Score</span>
                        <span className="font-bold text-slate-900">{personalizedImpact.genericAvgScore}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Baseline</span>
                        <span className="font-bold text-slate-900">Standard</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Key Insight</p>
                      <p className="text-sm text-green-800 mt-1">
                        Personalized training assignments triggered by performance analysis result in{' '}
                        <span className="font-bold">{personalizedImpact.scoreDifference}% higher scores</span>{' '}
                        compared to generic training, demonstrating the effectiveness of targeted learning interventions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers by Improvement</CardTitle>
                <CardDescription>Agents showing highest performance gains post-training</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{performer.name}</p>
                        <p className="text-sm text-slate-600">{performer.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +{performer.improvement}%
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">
                            <Award className="w-3 h-3 mr-1" />
                            {performer.certifications}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Avg Score: {performer.avgScore}% • {performer.attempts} attempts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
