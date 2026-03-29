import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Award, Clock, TrendingUp, Target, Brain, BookOpen,
  CheckCircle, AlertCircle, Calendar, Zap, Trophy,
  BarChart3, ArrowRight, Star, LineChart
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AgentTrainingProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrainingProfile();
  }, []);

  const loadTrainingProfile = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [
        docsData,
        attemptsData,
        certsData,
        assignmentsData,
        correlationsData,
        sessionsData
      ] = await Promise.all([
        TrainingDocument.list(),
        AgentTrainingAttempt.list(),
        AgentCertification.list(),
        PersonalizedTrainingAssignment.list(),
        TrainingPerformanceCorrelation.list(),
        RoleplaySession.list()
      ]);

      setDocuments(docsData || []);
      setAttempts((attemptsData || []).filter(a => a.agent_email === user?.email));
      setCertifications((certsData || []).filter(c => c.agent_email === user?.email));
      setAssignments((assignmentsData || []).filter(a => a.agent_email === user?.email));
      setCorrelations((correlationsData || []).filter(c => c.agent_email === user?.email));
      setSessions((sessionsData || []).filter(s => s.user_email === user?.email));
    } catch (error) {
      console.error('Failed to load training profile:', error);
      toast.error('Failed to load training profile');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfileMetrics = () => {
    const activeCerts = certifications.filter(c => c.status === 'active').length;
    const totalTimeMinutes = attempts.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0);
    const avgScore = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.quiz_score, 0) / attempts.length
      : 0;
    const avgImprovement = correlations.length > 0
      ? correlations.reduce((sum, c) => sum + (c.improvement_percentage || 0), 0) / correlations.length
      : 0;

    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    const completedTrainings = new Set(attempts.filter(a => a.passed).map(a => a.document_id)).size;

    return {
      activeCerts,
      totalTimeHours: Math.round(totalTimeMinutes / 60),
      avgScore: Math.round(avgScore),
      avgImprovement: Math.round(avgImprovement * 10) / 10,
      pendingAssignments,
      completedTrainings,
      totalAttempts: attempts.length
    };
  };

  const getTrainingTimeline = () => {
    const timeline = attempts
      .map(attempt => {
        const doc = documents.find(d => d.id === attempt.document_id);
        const assignment = assignments.find(a => a.document_id === attempt.document_id);
        return {
          date: attempt.completed_at,
          title: doc?.title || 'Unknown Training',
          score: attempt.quiz_score,
          passed: attempt.passed,
          type: assignment?.triggered_by_session_id ? 'personalized' : 'generic',
          timeSpent: attempt.time_spent_minutes
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return timeline;
  };

  const getPerformanceTrend = () => {
    const last10Sessions = sessions
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10)
      .reverse();

    return last10Sessions.map((session, index) => {
      const sessionDate = new Date(session.created_date);
      const relevantCorrelation = correlations.find(c => {
        const corrDate = new Date(c.training_completed_date);
        return corrDate <= sessionDate;
      });

      return {
        session: `S${index + 1}`,
        date: format(sessionDate, 'MM/dd'),
        score: session.overall_score || session.analysis_results?.overall_score || 0,
        hasTraining: !!relevantCorrelation
      };
    });
  };

  const getSkillProgression = () => {
    const categoryMap = {};

    documents.forEach(doc => {
      if (!categoryMap[doc.category]) {
        categoryMap[doc.category] = {
          category: doc.category,
          attempts: 0,
          avgScore: 0,
          certified: false
        };
      }

      const docAttempts = attempts.filter(a => a.document_id === doc.id);
      const docCert = certifications.find(c => c.document_id === doc.id && c.status === 'active');

      if (docAttempts.length > 0) {
        const categoryScore = docAttempts.reduce((sum, a) => sum + a.quiz_score, 0) / docAttempts.length;
        categoryMap[doc.category].attempts += docAttempts.length;
        categoryMap[doc.category].avgScore = Math.round(categoryScore);
        categoryMap[doc.category].certified = categoryMap[doc.category].certified || !!docCert;
      }
    });

    return Object.values(categoryMap);
  };

  const getOutcomeTracking = () => {
    return assignments
      .filter(a => a.triggered_by_session_id && a.status === 'completed')
      .map(assignment => {
        const doc = documents.find(d => d.id === assignment.document_id);
        const completionDate = new Date(assignment.completed_date);

        const nextSessions = sessions
          .filter(s => new Date(s.created_date) > completionDate)
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
          .slice(0, 5);

        const preTrainingSession = sessions.find(s => s.id === assignment.triggered_by_session_id);
        const preScore = preTrainingSession?.overall_score || preTrainingSession?.analysis_results?.overall_score || 0;

        const avgPostScore = nextSessions.length > 0
          ? nextSessions.reduce((sum, s) => sum + (s.overall_score || s.analysis_results?.overall_score || 0), 0) / nextSessions.length
          : 0;

        return {
          trainingTitle: doc?.title || 'Unknown Training',
          reason: assignment.reason,
          completedDate: assignment.completed_date,
          preScore: Math.round(preScore),
          postScore: Math.round(avgPostScore),
          improvement: Math.round(avgPostScore - preScore),
          sessionsAnalyzed: nextSessions.length
        };
      })
      .filter(outcome => outcome.sessionsAnalyzed > 0);
  };

  const metrics = calculateProfileMetrics();
  const timeline = getTrainingTimeline();
  const performanceTrend = getPerformanceTrend();
  const skillProgression = getSkillProgression();
  const outcomeTracking = getOutcomeTracking();

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
              <Trophy className="w-8 h-8 text-blue-600" />
              My Training & Development
            </h1>
            <p className="text-slate-600 mt-1">
              Track your learning progress and performance improvements
            </p>
          </div>
          <Link to={createPageUrl('TrainingLibrary')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Training
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Certifications</p>
                  <p className="text-4xl font-bold">{metrics.activeCerts}</p>
                </div>
                <Award className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Training Time</p>
                  <p className="text-3xl font-bold text-slate-900">{metrics.totalTimeHours}h</p>
                  <p className="text-xs text-slate-500 mt-1">{metrics.totalAttempts} attempts</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Avg Score</p>
                  <p className="text-3xl font-bold text-slate-900">{metrics.avgScore}%</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{metrics.avgImprovement}% gain
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Pending Tasks</p>
                  <p className="text-3xl font-bold text-slate-900">{metrics.pendingAssignments}</p>
                  <p className="text-xs text-slate-500 mt-1">Assigned to you</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {metrics.pendingAssignments > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Recommended Training
              </CardTitle>
              <CardDescription className="text-orange-800">
                Complete these personalized training assignments to improve your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments
                  .filter(a => a.status === 'pending')
                  .map(assignment => {
                    const doc = documents.find(d => d.id === assignment.document_id);
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{doc?.title}</p>
                          <p className="text-sm text-slate-600 mt-1">{assignment.reason}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-orange-200 text-orange-900">
                              {assignment.priority}
                            </Badge>
                            {assignment.due_date && (
                              <span className="text-xs text-slate-600">
                                Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link to={createPageUrl(`TrainerBot?docId=${doc?.id}&assignmentId=${assignment.id}`)}>
                          <Button className="bg-orange-600 hover:bg-orange-700">
                            <Brain className="w-4 h-4 mr-2" />
                            Start Now
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="certifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          </TabsList>

          <TabsContent value="certifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Certifications</CardTitle>
                <CardDescription>Active training certifications</CardDescription>
              </CardHeader>
              <CardContent>
                {certifications.filter(c => c.status === 'active').length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certifications
                      .filter(c => c.status === 'active')
                      .map(cert => {
                        const doc = documents.find(d => d.id === cert.document_id);
                        return (
                          <div key={cert.id} className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
                            <div className="flex items-start justify-between mb-4">
                              <Award className="w-10 h-10 text-blue-600" />
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Certified
                              </Badge>
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{doc?.title}</h3>
                            <p className="text-sm text-slate-600 mb-3">{doc?.category}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">
                                Earned: {format(new Date(cert.certification_date), 'MMM dd, yyyy')}
                              </span>
                              {cert.renewal_count > 0 && (
                                <Badge variant="outline">Renewed {cert.renewal_count}x</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600">No certifications yet</p>
                    <Link to={createPageUrl('TrainingLibrary')}>
                      <Button className="mt-4">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Start Training
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training History</CardTitle>
                <CardDescription>Your complete training timeline</CardDescription>
              </CardHeader>
              <CardContent>
                {timeline.length > 0 ? (
                  <div className="space-y-4">
                    {timeline.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.passed ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            {item.passed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                          {index < timeline.length - 1 && (
                            <div className="w-0.5 h-8 bg-slate-200 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900">{item.title}</h4>
                              <p className="text-sm text-slate-600 mt-1">
                                Score: {Math.round(item.score)}% • {item.timeSpent} min
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={item.type === 'personalized' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                                {item.type === 'personalized' ? 'Recommended' : 'Self-directed'}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">
                                {format(new Date(item.date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600">No training history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Your roleplay scores over time with training markers</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ReLineChart data={performanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="session" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Performance Score" strokeWidth={2} />
                    </ReLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-slate-600">
                    No performance data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Impact Summary</CardTitle>
                <CardDescription>Overall performance improvement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-green-800">Avg Improvement</p>
                    <p className="text-3xl font-bold text-green-900">+{metrics.avgImprovement}%</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-800">Completed Trainings</p>
                    <p className="text-3xl font-bold text-blue-900">{metrics.completedTrainings}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-sm text-purple-800">Success Rate</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {attempts.length > 0 ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Competency Matrix</CardTitle>
                <CardDescription>Your proficiency across different training categories</CardDescription>
              </CardHeader>
              <CardContent>
                {skillProgression.length > 0 ? (
                  <div className="space-y-4">
                    {skillProgression.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{skill.category}</span>
                            {skill.certified && (
                              <Badge className="bg-green-100 text-green-800">
                                <Award className="w-3 h-3 mr-1" />
                                Certified
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{skill.avgScore}%</span>
                        </div>
                        <Progress value={skill.avgScore} className="h-2" />
                        <p className="text-xs text-slate-500">{skill.attempts} training attempts</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-600">
                    No skill data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Outcomes</CardTitle>
                <CardDescription>Impact of personalized training on subsequent performance</CardDescription>
              </CardHeader>
              <CardContent>
                {outcomeTracking.length > 0 ? (
                  <div className="space-y-4">
                    {outcomeTracking.map((outcome, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">{outcome.trainingTitle}</h4>
                            <p className="text-sm text-slate-600 mt-1">{outcome.reason}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Completed: {format(new Date(outcome.completedDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Badge className={outcome.improvement > 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {outcome.improvement > 0 ? '+' : ''}{outcome.improvement}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center p-3 bg-slate-50 rounded">
                            <p className="text-xs text-slate-600">Pre-Training</p>
                            <p className="text-xl font-bold text-slate-900">{outcome.preScore}%</p>
                          </div>
                          <div className="flex items-center justify-center">
                            <ArrowRight className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded">
                            <p className="text-xs text-green-800">Post-Training</p>
                            <p className="text-xl font-bold text-green-900">{outcome.postScore}%</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 text-center">
                          Based on {outcome.sessionsAnalyzed} subsequent roleplay sessions
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600">No outcome data available yet</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Complete personalized training assignments and practice with roleplay bots to see your progress
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
