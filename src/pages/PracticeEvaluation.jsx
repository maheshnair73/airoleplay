import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PracticeSession, PracticeEvaluation, PracticeParticipant, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, CheckCircle, AlertCircle, TrendingUp, TrendingDown,
  User as UserIcon, Bot, Users, Award, Target, Shield, Eye
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabase';

export default function PracticeEvaluationPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [existingEvaluations, setExistingEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [canOverride, setCanOverride] = useState(false);

  const [evaluation, setEvaluation] = useState({
    overall_score: 75,
    criteria_scores: [],
    feedback: '',
    strengths: [''],
    improvements: [''],
    is_final: false,
    can_override: false
  });

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const { data: sessionData, error: sessionError } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          participants:practice_participants(*),
          evaluations:practice_evaluations(*),
          recordings:practice_recordings(*)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      setSession(sessionData);
      setParticipants(sessionData.participants || []);
      setExistingEvaluations(sessionData.evaluations || []);

      const isManager = user.role === 'manager' || user.role === 'super_admin';
      setCanOverride(isManager);

      if (sessionData.participants && sessionData.participants.length > 0) {
        setSelectedParticipant(sessionData.participants[0].id);
      }

      const criteriaScores = sessionData.evaluation_config?.criteria?.map(c => ({
        name: c.name,
        weight: c.weight,
        score: 75,
        description: c.description
      })) || [];

      setEvaluation(prev => ({
        ...prev,
        criteria_scores: criteriaScores,
        can_override: isManager
      }));

    } catch (error) {
      console.error('Error loading evaluation data:', error);
      toast.error('Failed to load evaluation data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCriteriaScoreChange = (index, score) => {
    setEvaluation(prev => ({
      ...prev,
      criteria_scores: prev.criteria_scores.map((c, i) =>
        i === index ? { ...c, score } : c
      )
    }));
  };

  const addStrength = () => {
    setEvaluation(prev => ({
      ...prev,
      strengths: [...prev.strengths, '']
    }));
  };

  const updateStrength = (index, value) => {
    setEvaluation(prev => ({
      ...prev,
      strengths: prev.strengths.map((s, i) => (i === index ? value : s))
    }));
  };

  const removeStrength = (index) => {
    setEvaluation(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index)
    }));
  };

  const addImprovement = () => {
    setEvaluation(prev => ({
      ...prev,
      improvements: [...prev.improvements, '']
    }));
  };

  const updateImprovement = (index, value) => {
    setEvaluation(prev => ({
      ...prev,
      improvements: prev.improvements.map((s, i) => (i === index ? value : s))
    }));
  };

  const removeImprovement = (index) => {
    setEvaluation(prev => ({
      ...prev,
      improvements: prev.improvements.filter((_, i) => i !== index)
    }));
  };

  const calculateOverallScore = () => {
    if (evaluation.criteria_scores.length === 0) return evaluation.overall_score;

    const weightedSum = evaluation.criteria_scores.reduce(
      (sum, criterion) => sum + (criterion.score * criterion.weight / 100),
      0
    );

    return Math.round(weightedSum);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedParticipant) {
      toast.error('Please select a participant to evaluate');
      return;
    }

    if (evaluation.feedback.trim().length < 20) {
      toast.error('Please provide more detailed feedback (at least 20 characters)');
      return;
    }

    setIsSaving(true);
    try {
      const overallScore = calculateOverallScore();

      const evaluationType = canOverride && evaluation.is_final ? 'manager' :
                            currentUser.role === 'manager' ? 'manager' :
                            'peer';

      const evaluationData = {
        session_id: sessionId,
        participant_id: selectedParticipant,
        evaluator_id: currentUser.id,
        evaluator_email: currentUser.email,
        evaluator_type: evaluationType,
        overall_score: overallScore,
        criteria_scores: evaluation.criteria_scores,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths.filter(s => s.trim()),
        improvements: evaluation.improvements.filter(i => i.trim()),
        is_final: evaluation.is_final && canOverride,
        can_override: canOverride,
        submitted_at: new Date().toISOString()
      };

      await PracticeEvaluation.create(evaluationData);

      if (evaluation.is_final) {
        await supabase
          .from('practice_sessions')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', sessionId);
      }

      toast.success('Evaluation submitted successfully!');
      navigate(createPageUrl('PracticeSessionDetail', { id: sessionId }));
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast.error('Failed to submit evaluation');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading evaluation...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The practice session you're trying to evaluate doesn't exist
          </p>
          <Button asChild>
            <Link to={createPageUrl('PracticeHub')}>Back to Practice Hub</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const overallScore = calculateOverallScore();
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link to={createPageUrl('PracticeSessionDetail', { id: sessionId })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Session
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Evaluate Practice Session</h1>
            <p className="text-muted-foreground mt-1">{session.session_name}</p>
          </div>
          {canOverride && (
            <Badge className="bg-purple-600">
              <Shield className="w-3 h-3 mr-1" />
              Manager Override Enabled
            </Badge>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Existing Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{existingEvaluations.length}</div>
            <div className="flex gap-1 mt-2">
              {existingEvaluations.map((e, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {e.evaluator_type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Participant</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedParticipant || ''}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
            >
              {participants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.user_email} ({p.role})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Criteria</CardTitle>
            <CardDescription>
              Score each criterion based on the participant's performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {evaluation.criteria_scores.map((criterion, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{criterion.name}</Label>
                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(criterion.score)}`}>
                      {criterion.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Weight: {criterion.weight}%
                    </div>
                  </div>
                </div>
                <Slider
                  value={[criterion.score]}
                  onValueChange={(value) => handleCriteriaScoreChange(index, value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
            <CardDescription>Provide comprehensive feedback on the performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="feedback">Overall Feedback *</Label>
              <Textarea
                id="feedback"
                value={evaluation.feedback}
                onChange={(e) => setEvaluation(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Provide detailed feedback on the practice session performance..."
                rows={6}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Strengths</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStrength}>
                  Add Strength
                </Button>
              </div>
              <div className="space-y-2">
                {evaluation.strengths.map((strength, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={strength}
                      onChange={(e) => updateStrength(index, e.target.value)}
                      placeholder="e.g., Strong value proposition delivery"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStrength(index)}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Areas for Improvement</Label>
                <Button type="button" variant="outline" size="sm" onClick={addImprovement}>
                  Add Improvement
                </Button>
              </div>
              <div className="space-y-2">
                {evaluation.improvements.map((improvement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={improvement}
                      onChange={(e) => updateImprovement(index, e.target.value)}
                      placeholder="e.g., Work on handling objections with more confidence"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImprovement(index)}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {canOverride && (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Manager Controls
              </CardTitle>
              <CardDescription>
                As a manager, you have additional evaluation controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_final"
                  checked={evaluation.is_final}
                  onCheckedChange={(checked) =>
                    setEvaluation(prev => ({ ...prev, is_final: checked }))
                  }
                />
                <Label htmlFor="is_final" className="font-medium">
                  Mark as Final Evaluation
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Final evaluations override all other evaluations and mark the session as complete
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Previous Evaluations</CardTitle>
            <CardDescription>View existing evaluations for this session</CardDescription>
          </CardHeader>
          <CardContent>
            {existingEvaluations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No evaluations yet. You're the first to evaluate this session!
              </p>
            ) : (
              <div className="space-y-4">
                {existingEvaluations.map((evalItem, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {evalItem.evaluator_type === 'ai' ? (
                            <Bot className="w-4 h-4 text-blue-600" />
                          ) : evalItem.evaluator_type === 'manager' ? (
                            <Shield className="w-4 h-4 text-purple-600" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-green-600" />
                          )}
                          <div>
                            <div className="font-medium text-sm">{evalItem.evaluator_email}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {evalItem.evaluator_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(evalItem.overall_score)}`}>
                            {evalItem.overall_score}
                          </div>
                          {evalItem.is_final && (
                            <Badge className="bg-purple-600 text-xs mt-1">Final</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{evalItem.feedback}</p>
                      {evalItem.strengths && evalItem.strengths.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-green-600 mb-1">Strengths:</div>
                          <ul className="text-xs space-y-1">
                            {evalItem.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <TrendingUp className="w-3 h-3 text-green-600 mt-0.5" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {evalItem.improvements && evalItem.improvements.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-orange-600 mb-1">Improvements:</div>
                          <ul className="text-xs space-y-1">
                            {evalItem.improvements.map((improvementItem, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <Target className="w-3 h-3 text-orange-600 mt-0.5" />
                                {improvementItem}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(createPageUrl('PracticeSessionDetail', { id: sessionId }))}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Submitting...' : 'Submit Evaluation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
