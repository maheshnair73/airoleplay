import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/api/entities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, TrendingUp, TrendingDown, Trophy, Target, Clock,
  CheckCircle, BarChart2, Users, Bot, Award, Calendar
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function PracticeAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    avgScore: 0,
    totalMinutes: 0,
    improvementRate: 0,
    streakDays: 0
  });
  const [scoresByMode, setScoresByMode] = useState([]);
  const [scoresTrend, setScoresTrend] = useState([]);
  const [criteriaPerformance, setCriteriaPerformance] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const { data: sessions, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          evaluations:practice_evaluations(*)
        `)
        .or(`created_by_email.eq.${user.email},id.in.(select session_id from practice_participants where user_email='${user.email}')`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const completed = sessions.filter(s => s.status === 'completed');
      const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_seconds / 60), 0);

      const sessionsWithScores = completed.filter(s =>
        s.evaluations && s.evaluations.length > 0
      );

      const avgScore = sessionsWithScores.length > 0
        ? sessionsWithScores.reduce((sum, s) => {
            const scores = s.evaluations.map(e => e.overall_score).filter(Boolean);
            return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
          }, 0) / sessionsWithScores.length
        : 0;

      const firstScore = sessionsWithScores[0]?.evaluations?.[0]?.overall_score || 0;
      const lastScore = sessionsWithScores[sessionsWithScores.length - 1]?.evaluations?.[0]?.overall_score || 0;
      const improvementRate = firstScore > 0 ? ((lastScore - firstScore) / firstScore) * 100 : 0;

      setStats({
        totalSessions: sessions.length,
        completedSessions: completed.length,
        avgScore: Math.round(avgScore),
        totalMinutes: Math.round(totalMinutes),
        improvementRate: Math.round(improvementRate),
        streakDays: calculateStreak(completed)
      });

      const modeScores = calculateScoresByMode(completed);
      setScoresByMode(modeScores);

      const trend = calculateScoresTrend(sessionsWithScores);
      setScoresTrend(trend);

      const criteriaPerf = calculateCriteriaPerformance(completed);
      setCriteriaPerformance(criteriaPerf);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateScoresByMode = (sessions) => {
    const modeGroups = {};

    sessions.forEach(session => {
      if (!session.evaluations || session.evaluations.length === 0) return;

      const mode = session.practice_mode;
      if (!modeGroups[mode]) {
        modeGroups[mode] = { scores: [], count: 0 };
      }

      const avgScore = session.evaluations
        .map(e => e.overall_score)
        .filter(Boolean)
        .reduce((a, b) => a + b, 0) / session.evaluations.length;

      modeGroups[mode].scores.push(avgScore);
      modeGroups[mode].count++;
    });

    return Object.entries(modeGroups).map(([mode, data]) => ({
      mode: mode.replace(/_/g, ' '),
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      count: data.count
    }));
  };

  const calculateScoresTrend = (sessions) => {
    return sessions.slice(-10).map((session, index) => {
      const scores = session.evaluations?.map(e => e.overall_score).filter(Boolean) || [];
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      return {
        session: `Session ${index + 1}`,
        score: Math.round(avgScore),
        date: new Date(session.completed_at).toLocaleDateString()
      };
    });
  };

  const calculateCriteriaPerformance = (sessions) => {
    const criteriaMap = {};

    sessions.forEach(session => {
      session.evaluations?.forEach(evaluation => {
        if (!evaluation.criteria_scores) return;

        evaluation.criteria_scores.forEach(criterion => {
          if (!criteriaMap[criterion.name]) {
            criteriaMap[criterion.name] = { scores: [], total: 0 };
          }
          criteriaMap[criterion.name].scores.push(criterion.score);
          criteriaMap[criterion.name].total++;
        });
      });
    });

    return Object.entries(criteriaMap).map(([name, data]) => ({
      name,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      count: data.total
    }));
  };

  const calculateStreak = (sessions) => {
    if (sessions.length === 0) return 0;

    const sortedSessions = [...sessions].sort((a, b) =>
      new Date(b.completed_at) - new Date(a.completed_at)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completed_at);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const StatCard = ({ title, value, icon: Icon, description, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend !== undefined && (
          <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(trend)}% from first session
          </div>
        )}
      </CardContent>
    </Card>
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link to={createPageUrl('PracticeHub')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Practice Hub
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Practice Analytics</h1>
          <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={Target}
          description="All time"
        />
        <StatCard
          title="Completed"
          value={stats.completedSessions}
          icon={CheckCircle}
          description={`${stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}% completion`}
        />
        <StatCard
          title="Avg Score"
          value={`${stats.avgScore}%`}
          icon={Trophy}
          trend={stats.improvementRate}
        />
        <StatCard
          title="Practice Time"
          value={`${stats.totalMinutes}m`}
          icon={Clock}
          description="Total minutes"
        />
        <StatCard
          title="Streak"
          value={`${stats.streakDays} days`}
          icon={Award}
          description="Current streak"
        />
        <StatCard
          title="Improvement"
          value={`${stats.improvementRate > 0 ? '+' : ''}${stats.improvementRate}%`}
          icon={TrendingUp}
          description="Since first session"
        />
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Score Trends</TabsTrigger>
          <TabsTrigger value="modes">By Practice Mode</TabsTrigger>
          <TabsTrigger value="criteria">Criteria Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Score Progression</CardTitle>
              <CardDescription>Your scores over the last 10 practice sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {scoresTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={scoresTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Complete more practice sessions to see your progress
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Practice Mode</CardTitle>
              <CardDescription>Compare your scores across different practice modes</CardDescription>
            </CardHeader>
            <CardContent>
              {scoresByMode.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={scoresByMode}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mode" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#3b82f6" name="Average Score" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Complete practice sessions to see mode-specific performance
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {scoresByMode.map((mode, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base capitalize">{mode.mode}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Average Score</span>
                        <span className="text-2xl font-bold">{mode.avgScore}</span>
                      </div>
                      <Progress value={mode.avgScore} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {mode.count} session{mode.count !== 1 ? 's' : ''} completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Criteria Breakdown</CardTitle>
              <CardDescription>Your performance across different evaluation criteria</CardDescription>
            </CardHeader>
            <CardContent>
              {criteriaPerformance.length > 0 ? (
                <div className="space-y-4">
                  {criteriaPerformance.map((criterion, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{criterion.name}</span>
                        <span className="text-xl font-bold">{criterion.avgScore}</span>
                      </div>
                      <Progress value={criterion.avgScore} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Evaluated {criterion.count} time{criterion.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Complete evaluated sessions to see criteria-specific performance
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
