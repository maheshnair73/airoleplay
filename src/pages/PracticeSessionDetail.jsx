import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PracticeSession, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Play, Users, Calendar, Clock, BookOpen, Trophy, Target,
  TrendingUp, CheckCircle, Edit, Trash2, Bot, UserIcon, Shield, Video, Mic
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function PracticeSessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const { data, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          participants:practice_participants(*),
          evaluations:practice_evaluations(*),
          recordings:practice_recordings(*),
          materials:practice_materials_junction(
            *,
            material:roleplay_knowledge_materials(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session details');
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    try {
      if (session.requires_material_review && !session.materials_reviewed) {
        toast.error('Please review all required materials before starting');
        return;
      }

      await supabase
        .from('practice_sessions')
        .update({ status: 'in_progress' })
        .eq('id', id);

      navigate(createPageUrl('PracticeSessionActive', { id }));
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  const deleteSession = async () => {
    if (!confirm('Are you sure you want to delete this practice session?')) return;

    try {
      await PracticeSession.delete(id);
      toast.success('Practice session deleted');
      navigate(createPageUrl('PracticeHub'));
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <Button asChild>
            <Link to={createPageUrl('PracticeHub')}>Back to Practice Hub</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      active: 'bg-green-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-purple-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const avgScore = session.evaluations?.length > 0
    ? Math.round(
        session.evaluations
          .map(e => e.overall_score)
          .filter(Boolean)
          .reduce((a, b) => a + b, 0) / session.evaluations.length
      )
    : null;

  const canEdit = session.created_by_email === currentUser?.email && session.status === 'draft';
  const canStart = session.status === 'draft' || session.status === 'scheduled';
  const canEvaluate = session.status === 'completed' || session.status === 'in_progress';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link to={createPageUrl('PracticeHub')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice Hub
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{session.session_name}</h1>
              <Badge className={`${getStatusColor(session.status)} text-white`}>
                {session.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{session.scenario}</p>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <>
                <Button asChild variant="outline">
                  <Link to={createPageUrl('CreatePracticeSession', { id: session.id })}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" onClick={deleteSession}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            {canStart && (
              <Button onClick={startSession} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            )}
            {canEvaluate && (
              <Button asChild>
                <Link to={createPageUrl('PracticeEvaluation', { sessionId: session.id })}>
                  <Target className="w-4 h-4 mr-2" />
                  Evaluate
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {Math.round(session.duration_seconds / 60)}
              </span>
              <span className="text-muted-foreground">min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{session.participants?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{session.materials?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            {avgScore !== null ? (
              <div>
                <div className="text-2xl font-bold text-green-600">{avgScore}</div>
                <Progress value={avgScore} className="mt-2" />
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Not evaluated yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Practice Mode</div>
                  <Badge variant="outline">{session.practice_mode}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Difficulty</div>
                  <Badge variant="outline">{session.difficulty}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Task Type</div>
                  <Badge variant="outline">{session.task_type}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Language</div>
                  <Badge variant="outline">{session.language}</Badge>
                </div>
              </div>

              {session.scheduled_for && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Scheduled For</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(session.scheduled_for).toLocaleString()}
                  </div>
                </div>
              )}

              {session.due_date && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Due Date</div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {new Date(session.due_date).toLocaleDateString()}
                  </div>
                </div>
              )}

              {session.gamification_config?.enabled && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Gamification</div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span>{session.gamification_config.points} points available</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          {session.participants && session.participants.length > 0 ? (
            session.participants.map((participant, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {participant.user_email?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{participant.user_email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {participant.role}
                          </Badge>
                          <Badge className={`text-xs ${
                            participant.status === 'completed' ? 'bg-green-600' :
                            participant.status === 'accepted' ? 'bg-blue-600' :
                            'bg-gray-500'
                          }`}>
                            {participant.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {participant.joined_at && (
                      <div className="text-sm text-muted-foreground">
                        Joined: {new Date(participant.joined_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No participants yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          {session.materials && session.materials.length > 0 ? (
            session.materials.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <div className="font-medium">{item.material.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {item.material.material_type} • {item.material.category}
                        </div>
                        {item.material.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {item.material.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.is_required && (
                      <Badge className="bg-orange-600">Required</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No materials attached</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-4">
          {session.evaluations && session.evaluations.length > 0 ? (
            session.evaluations.map((evaluation, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {evaluation.evaluator_type === 'ai' ? (
                        <Bot className="w-5 h-5 text-blue-600" />
                      ) : evaluation.evaluator_type === 'manager' ? (
                        <Shield className="w-5 h-5 text-purple-600" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <CardTitle className="text-base">{evaluation.evaluator_email}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {evaluation.evaluator_type}
                          </Badge>
                          {evaluation.is_final && (
                            <Badge className="bg-purple-600 text-xs">Final</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {evaluation.overall_score}
                      </div>
                      <Progress value={evaluation.overall_score} className="w-24 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{evaluation.feedback}</p>

                  {evaluation.strengths && evaluation.strengths.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-green-600 mb-2">Strengths:</div>
                      <ul className="space-y-1">
                        {evaluation.strengths.map((strength, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.improvements && evaluation.improvements.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-orange-600 mb-2">Improvements:</div>
                      <ul className="space-y-1">
                        {evaluation.improvements.map((improvement, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <Target className="w-4 h-4 text-orange-600 mt-0.5" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No evaluations yet</p>
              {canEvaluate && (
                <Button asChild>
                  <Link to={createPageUrl('PracticeEvaluation', { sessionId: session.id })}>
                    <Target className="w-4 h-4 mr-2" />
                    Be the First to Evaluate
                  </Link>
                </Button>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recordings" className="space-y-4">
          {session.recordings && session.recordings.length > 0 ? (
            session.recordings.map((recording, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {recording.recording_type === 'video' ? (
                        <Video className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Mic className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <div className="font-medium capitalize">{recording.recording_type} Recording</div>
                        <div className="text-sm text-muted-foreground">
                          Duration: {Math.round(recording.duration_seconds / 60)} minutes
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{recording.processing_status}</Badge>
                  </div>
                  {recording.transcript && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium mb-2">Transcript:</div>
                      <p className="text-sm">{recording.transcript}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recordings yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
