import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Users,
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Award,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { RoleplaySession } from '@/api/entities';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

const ScoreCard = ({ title, score, maxScore = 10, color = "blue" }) => {
  const percentage = (score / maxScore) * 100;
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-700">{title}</h4>
          <span className="text-2xl font-bold text-slate-900">{score}/{maxScore}</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </CardContent>
    </Card>
  );
};

export default function HumanRoleplayAnalysis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSessionAnalysis = async () => {
      if (!sessionId) {
        toast.error('No session ID provided');
        navigate(createPageUrl('LiveMeetings'));
        return;
      }

      setIsLoading(true);
      try {
        const sessionData = await RoleplaySession.get(sessionId);
        setSession(sessionData);

        const mockAnalysis = {
          overallScore: 8.2,
          scores: {
            opening: 8.5,
            discovery: 7.8,
            presentation: 8.0,
            objectionHandling: 8.5,
            closing: 8.0
          },
          strengths: [
            "Strong opening and rapport building",
            "Excellent active listening skills",
            "Effective use of open-ended questions",
            "Clear articulation of value proposition"
          ],
          improvements: [
            "Could explore pain points more deeply",
            "Consider using more specific examples",
            "Follow up on budget discussions earlier",
            "Strengthen urgency in closing"
          ],
          keyMoments: [
            {
              timestamp: "00:03:45",
              type: "success",
              description: "Excellent rapport building with personal connection"
            },
            {
              timestamp: "00:12:20",
              type: "opportunity",
              description: "Missed opportunity to address pricing concerns"
            },
            {
              timestamp: "00:18:55",
              type: "success",
              description: "Strong handling of technical objection"
            }
          ],
          transcript: sessionData.call_transcript || "Transcript not available yet.",
          participantFeedback: sessionData.prospect_feedback || "No feedback provided yet."
        };

        setAnalysis(mockAnalysis);
      } catch (error) {
        console.error('Error loading session analysis:', error);
        toast.error('Failed to load session analysis');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionAnalysis();
  }, [sessionId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-slate-600">Loading analysis...</p>
      </div>
    );
  }

  if (!session || !analysis) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Session Not Found</h2>
        <Button onClick={() => navigate(createPageUrl('LiveMeetings'))}>
          Back to Meetings
        </Button>
      </div>
    );
  }

  const callDuration = session.call_duration
    ? `${Math.floor(session.call_duration / 60)}m ${session.call_duration % 60}s`
    : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('LiveMeetings'))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meetings
        </Button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Roleplay Session Analysis</h1>
            <p className="text-slate-600">
              Session completed on {session.completed_at ? format(new Date(session.completed_at), 'PPp') : 'Unknown date'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Overall Score</p>
                  <p className="text-2xl font-bold text-slate-900">{analysis.overallScore}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Duration</p>
                  <p className="text-2xl font-bold text-slate-900">{callDuration}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Participants</p>
                  <p className="text-2xl font-bold text-slate-900">{session.invitee_list?.length || 2}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Key Moments</p>
                  <p className="text-2xl font-bold text-slate-900">{analysis.keyMoments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scores" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="scores">
              <BarChart3 className="w-4 h-4 mr-2" />
              Scores
            </TabsTrigger>
            <TabsTrigger value="strengths">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Strengths
            </TabsTrigger>
            <TabsTrigger value="improvements">
              <Lightbulb className="w-4 h-4 mr-2" />
              Improvements
            </TabsTrigger>
            <TabsTrigger value="moments">
              <Target className="w-4 h-4 mr-2" />
              Key Moments
            </TabsTrigger>
            <TabsTrigger value="transcript">
              <FileText className="w-4 h-4 mr-2" />
              Transcript
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scores" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>Detailed scores across key sales skills</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreCard title="Opening & Rapport" score={analysis.scores.opening} />
                <ScoreCard title="Discovery Questions" score={analysis.scores.discovery} />
                <ScoreCard title="Presentation" score={analysis.scores.presentation} />
                <ScoreCard title="Objection Handling" score={analysis.scores.objectionHandling} />
                <ScoreCard title="Closing" score={analysis.scores.closing} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strengths" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  What You Did Well
                </CardTitle>
                <CardDescription>Key strengths demonstrated in this session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improvements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Areas for Growth
                </CardTitle>
                <CardDescription>Actionable suggestions to improve your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700">{improvement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Key Moments
                </CardTitle>
                <CardDescription>Notable highlights and opportunities from the session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.keyMoments.map((moment, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        moment.type === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      {moment.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {moment.timestamp}
                          </Badge>
                          <Badge variant={moment.type === 'success' ? 'default' : 'secondary'} className="text-xs">
                            {moment.type === 'success' ? 'Success' : 'Opportunity'}
                          </Badge>
                        </div>
                        <p className="text-slate-700">{moment.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcript" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  Session Transcript
                </CardTitle>
                <CardDescription>Full transcript of the roleplay session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {analysis.transcript}
                  </pre>
                </div>

                {analysis.participantFeedback && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Participant Feedback</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-slate-700">{analysis.participantFeedback}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => navigate(createPageUrl('AIRoleplayHistory'))}
            variant="outline"
          >
            View All Sessions
          </Button>
          <Button
            onClick={() => navigate(createPageUrl('HumanRoleplay'))}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            Start New Session
          </Button>
        </div>
      </div>
    </div>
  );
}
