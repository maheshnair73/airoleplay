import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PracticeSession, PracticeParticipant, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Plus, Users, Calendar, Trophy, BookOpen, Video, Mic, Monitor,
  Clock, Target, TrendingUp, AlertCircle, CheckCircle, Play, Filter,
  Zap, ArrowRight, MonitorPlay, UserCheck
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function PracticeHub() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    scheduled: 0,
    inProgress: 0,
    avgScore: 0
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filterMode, setFilterMode] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const { data: sessionsData, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          participants:practice_participants(*),
          evaluations:practice_evaluations(*),
          materials:practice_materials_junction(
            *,
            material:roleplay_knowledge_materials(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userSessions = sessionsData.filter(session =>
        session.created_by_email === user.email ||
        session.participants?.some(p => p.user_email === user.email)
      );

      setSessions(userSessions);

      const completed = userSessions.filter(s => s.status === 'completed').length;
      const scheduled = userSessions.filter(s => s.status === 'scheduled').length;
      const inProgress = userSessions.filter(s => s.status === 'in_progress' || s.status === 'active').length;

      const completedWithScores = userSessions.filter(s =>
        s.status === 'completed' && s.evaluations?.length > 0
      );

      const avgScore = completedWithScores.length > 0
        ? completedWithScores.reduce((sum, s) => {
            const scores = s.evaluations.map(e => e.overall_score).filter(Boolean);
            return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
          }, 0) / completedWithScores.length
        : 0;

      setStats({
        total: userSessions.length,
        completed,
        scheduled,
        inProgress,
        avgScore: Math.round(avgScore)
      });

    } catch (error) {
      console.error('Error loading practice hub:', error);
      toast.error('Failed to load practice sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredSessions = () => {
    let filtered = sessions;

    if (activeTab !== 'all') {
      filtered = filtered.filter(s => s.status === activeTab);
    }

    if (filterMode !== 'all') {
      filtered = filtered.filter(s => s.practice_mode === filterMode);
    }

    return filtered;
  };

  const getPracticeModeIcon = (mode) => {
    const icons = {
      solo_ai: Mic,
      peer_practice: Users,
      group_practice: Users,
      ai_multi_party: Video,
      product_demo: Monitor
    };
    return icons[mode] || Mic;
  };

  const getPracticeModeLabel = (mode) => {
    const labels = {
      solo_ai: 'Solo AI Practice',
      peer_practice: 'Peer Practice',
      group_practice: 'Group Practice',
      ai_multi_party: 'Multi-Party AI',
      product_demo: 'Product Demo'
    };
    return labels[mode] || mode;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      active: 'bg-green-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-purple-500',
      cancelled: 'bg-red-500',
      paused: 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: AlertCircle,
      scheduled: Calendar,
      active: Play,
      in_progress: Play,
      completed: CheckCircle,
      cancelled: AlertCircle,
      paused: Clock
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="w-3 h-3" />;
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
        {trend && (
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const PracticeSessionCard = ({ session }) => {
    const ModeIcon = getPracticeModeIcon(session.practice_mode);
    const participantCount = session.participants?.length || 0;
    const materialsCount = session.materials?.length || 0;
    const avgEvaluation = session.evaluations?.length > 0
      ? Math.round(
          session.evaluations
            .map(e => e.overall_score)
            .filter(Boolean)
            .reduce((a, b) => a + b, 0) / session.evaluations.length
        )
      : null;

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ModeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{session.session_name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getPracticeModeLabel(session.practice_mode)}
                  </Badge>
                  <Badge className={`${getStatusColor(session.status)} text-white text-xs`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(session.status)}
                      {session.status}
                    </span>
                  </Badge>
                </CardDescription>
              </div>
            </div>
            {avgEvaluation && (
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-green-600">{avgEvaluation}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {session.scenario}
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.round(session.duration_seconds / 60)} min
            </div>
            {participantCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </div>
            )}
            {materialsCount > 0 && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {materialsCount} material{materialsCount !== 1 ? 's' : ''}
              </div>
            )}
            {session.gamification_config?.enabled && (
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-600" />
                {session.gamification_config.points} pts
              </div>
            )}
          </div>

          {session.due_date && (
            <div className="text-xs text-orange-600 flex items-center gap-1 mb-3">
              <Target className="w-3 h-3" />
              Due: {new Date(session.due_date).toLocaleDateString()}
            </div>
          )}

          {session.participants && session.participants.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-2">
                {session.participants.slice(0, 3).map((p, idx) => (
                  <Avatar key={idx} className="w-6 h-6 border-2 border-white">
                    <AvatarFallback className="text-xs">
                      {p.user_email?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {session.participants.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{session.participants.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              className="flex-1"
              variant={session.status === 'completed' ? 'outline' : 'default'}
            >
              <Link to={createPageUrl('PracticeSessionDetail', { id: session.id })}>
                {session.status === 'completed' ? 'View Results' : 'Continue'}
              </Link>
            </Button>
            {session.status === 'draft' && (
              <Button asChild size="sm" variant="outline">
                <Link to={createPageUrl('CreatePracticeSession', { id: session.id })}>
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const filteredSessions = getFilteredSessions();

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Practice & Coaching</h1>
          <p className="text-muted-foreground">
            Master your sales skills with AI roleplay, coaching tasks, and tracked practice sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={createPageUrl('RoleplayKnowledgeHub')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Practice Materials
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={createPageUrl('PracticeAnalytics')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to={createPageUrl('CreatePracticeSession')}>
              <Plus className="w-4 h-4 mr-2" />
              New Practice
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard
          title="Total Sessions"
          value={stats.total}
          icon={Target}
          description="All practice sessions"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          description={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate`}
        />
        <StatCard
          title="Average Score"
          value={`${stats.avgScore}%`}
          icon={Trophy}
          description="Across all evaluations"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          icon={Calendar}
          description="Upcoming sessions"
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Quick Start</h2>
          <p className="text-sm text-muted-foreground">Jump straight into a live practice session</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={createPageUrl('AIRoleplay')} className="group">
            <Card className="border-2 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-start gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <Mic className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">AI Prospect Call</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Practice with a single AI buyer</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('MultiPartyRoleplay')} className="group">
            <Card className="border-2 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-start gap-3">
                <div className="p-2.5 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Multi-Stakeholder</p>
                  <p className="text-xs text-muted-foreground mt-0.5">CEO, CFO, CTO panel scenarios</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all mt-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('ProductDemoSetup')} className="group">
            <Card className="border-2 hover:border-green-500 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-start gap-3">
                <div className="p-2.5 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                  <MonitorPlay className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Product Demo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Practice your live product pitch</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-green-600 group-hover:translate-x-1 transition-all mt-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('HumanRoleplay')} className="group">
            <Card className="border-2 hover:border-slate-500 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-start gap-3">
                <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                  <UserCheck className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Human-to-Human</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Practice with a real colleague</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-slate-600 group-hover:translate-x-1 transition-all mt-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="mb-3">
        <h2 className="text-lg font-semibold text-slate-800">My Practice Sessions</h2>
        <p className="text-sm text-muted-foreground">Scheduled and tracked sessions with notes, participants, and evaluations</p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Modes</option>
            <option value="solo_ai">Solo AI Practice</option>
            <option value="peer_practice">Peer Practice</option>
            <option value="group_practice">Group Practice</option>
            <option value="ai_multi_party">Multi-Party AI</option>
            <option value="product_demo">Product Demo</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <Target className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No practice sessions yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your journey by creating your first practice session
              </p>
              <Button asChild>
                <Link to={createPageUrl('CreatePracticeSession')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Practice
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map(session => (
            <PracticeSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
