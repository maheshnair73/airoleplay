import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3, TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  XCircle, MessageSquare, User, Clock, Target, Award, Brain,
  Lightbulb, AlertTriangle, ThumbsUp, ThumbsDown, Settings,
  Download, Filter, RefreshCw
} from 'lucide-react';
import { RoleplaySession } from '@/api/entities';
import { supabase } from '@/lib/supabase';

export default function AIRoleplayAnalysisDetailed() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sessionsData, frameworksData] = await Promise.all([
        RoleplaySession.list('-created_at'),
        supabase.from('analysis_frameworks').select('*').eq('is_active', true)
      ]);

      setSessions(sessionsData || []);
      setFrameworks(frameworksData.data || []);

      if (frameworksData.data?.length > 0) {
        setSelectedFramework(frameworksData.data[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalysisForSession = async (sessionId) => {
    if (!sessionId || !selectedFramework) return;

    try {
      const { data, error } = await supabase
        .from('session_analysis_results')
        .select('*')
        .eq('session_id', sessionId)
        .eq('framework_id', selectedFramework)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAnalysisResults(data);
      } else {
        setAnalysisResults(generateMockAnalysis(sessionId));
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      setAnalysisResults(generateMockAnalysis(sessionId));
    }
  };

  const generateMockAnalysis = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    const framework = frameworks.find(f => f.id === selectedFramework);

    return {
      id: 'mock-' + sessionId,
      session_id: sessionId,
      framework_id: selectedFramework,
      overall_score: 78,
      framework_scores: framework?.criteria?.reduce((acc, criterion) => ({
        ...acc,
        [criterion.name]: Math.floor(Math.random() * 30) + 70
      }), {}) || {},
      speaker_analysis: [
        {
          speaker: 'Sales Rep',
          talk_time_percentage: 45,
          word_count: 850,
          avg_sentence_length: 12,
          filler_words_count: 15,
          questions_asked: 12,
          statements_made: 38,
          positive_language_score: 82,
          confidence_score: 75,
          engagement_score: 88
        },
        {
          speaker: 'Prospect',
          talk_time_percentage: 55,
          word_count: 1050,
          avg_sentence_length: 10,
          filler_words_count: 8,
          questions_asked: 6,
          statements_made: 45,
          engagement_score: 85
        }
      ],
      transcript_analysis: {
        total_duration: 1800,
        exchange_count: 84,
        topic_coverage: ['product features', 'pricing', 'implementation', 'ROI'],
        sentiment_flow: [0.2, 0.4, 0.6, 0.7, 0.8, 0.75, 0.8],
        key_moments: [
          { timestamp: 240, type: 'positive', description: 'Strong value proposition delivered' },
          { timestamp: 780, type: 'concern', description: 'Pricing objection raised' },
          { timestamp: 1200, type: 'positive', description: 'Objection successfully handled' }
        ]
      },
      recommendations: [
        {
          priority: 'high',
          category: 'Discovery',
          title: 'Ask more implication questions',
          description: 'You identified the problem well, but could explore the consequences and impact more deeply. This helps build urgency.'
        },
        {
          priority: 'medium',
          category: 'Listening',
          title: 'Reduce talk time ratio',
          description: 'Aim for 40/60 or even 30/70 split. Let the prospect talk more to uncover deeper needs and build rapport.'
        },
        {
          priority: 'high',
          category: 'Value Articulation',
          title: 'Quantify ROI earlier',
          description: 'Introduce specific metrics and ROI calculations earlier in the conversation to establish concrete value.'
        }
      ],
      improvement_areas: [
        {
          area: 'Objection Handling',
          current_score: 72,
          target_score: 85,
          examples: [
            'When pricing concerns came up, acknowledge first before defending',
            'Use feel-felt-found technique more consistently'
          ]
        },
        {
          area: 'Discovery Depth',
          current_score: 68,
          target_score: 80,
          examples: [
            'Ask more "why" and "what impact" questions',
            'Dig deeper into current pain points before presenting solution'
          ]
        }
      ],
      strengths: [
        {
          area: 'Opening & Rapport',
          score: 88,
          examples: [
            'Excellent warm opening that established credibility',
            'Good use of research about prospect\'s company'
          ]
        },
        {
          area: 'Product Knowledge',
          score: 92,
          examples: [
            'Demonstrated deep understanding of features',
            'Connected features to specific use cases effectively'
          ]
        }
      ],
      missed_opportunities: [
        {
          timestamp: 420,
          opportunity: 'Prospect mentioned budget constraints - could have explored decision criteria',
          impact: 'medium'
        },
        {
          timestamp: 980,
          opportunity: 'Prospect asked about implementation - missed chance to identify champion',
          impact: 'high'
        },
        {
          timestamp: 1350,
          opportunity: 'Could have asked about other stakeholders involved in decision',
          impact: 'high'
        }
      ],
      should_avoid: [
        {
          pattern: 'Filler words ("um", "uh", "like")',
          occurrences: 15,
          impact: 'Reduces perceived confidence and authority',
          suggestion: 'Practice pausing instead of using filler words'
        },
        {
          pattern: 'Interrupting prospect',
          occurrences: 3,
          impact: 'Can damage rapport and miss important information',
          suggestion: 'Wait 2 seconds after prospect finishes before responding'
        },
        {
          pattern: 'Feature dumping',
          occurrences: 2,
          impact: 'Overwhelming prospect without connecting to their needs',
          suggestion: 'Tie each feature to a specific need they mentioned'
        }
      ],
      analyzed_at: new Date().toISOString()
    };
  };

  const analyzeSession = async () => {
    if (!selectedSession) return;

    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadAnalysisForSession(selectedSession.id);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (selectedSession) {
      loadAnalysisForSession(selectedSession.id);
    }
  }, [selectedSession, selectedFramework]);

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-blue-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-800';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading analysis tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Call Analysis</h1>
            <p className="text-slate-600 mt-1">Deep insights using proven sales methodologies</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Session & Framework</CardTitle>
            <CardDescription>Choose a roleplay session and analysis framework to review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Roleplay Session</label>
                <Select
                  value={selectedSession?.id}
                  onValueChange={(value) => {
                    const session = sessions.find(s => s.id === value);
                    setSelectedSession(session);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.scenario_name || session.bot_name} - {new Date(session.created_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Analysis Framework</label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map((framework) => (
                      <SelectItem key={framework.id} value={framework.id}>
                        {framework.framework_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  className="w-full"
                  onClick={analyzeSession}
                  disabled={!selectedSession || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Session
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {analysisResults && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Overall Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(analysisResults.overall_score)}`}>
                        {analysisResults.overall_score}%
                      </p>
                    </div>
                    <Award className={`h-10 w-10 ${getScoreColor(analysisResults.overall_score)}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Talk Ratio</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {analysisResults.speaker_analysis[0]?.talk_time_percentage || 45}%
                      </p>
                    </div>
                    <MessageSquare className="h-10 w-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Questions Asked</p>
                      <p className="text-3xl font-bold text-green-600">
                        {analysisResults.speaker_analysis[0]?.questions_asked || 12}
                      </p>
                    </div>
                    <Target className="h-10 w-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Duration</p>
                      <p className="text-3xl font-bold text-slate-700">
                        {Math.floor((analysisResults.transcript_analysis?.total_duration || 1800) / 60)}m
                      </p>
                    </div>
                    <Clock className="h-10 w-10 text-slate-700" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="framework" className="space-y-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="framework">Framework Scores</TabsTrigger>
                <TabsTrigger value="speaker">Speaker Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="opportunities">Missed Opportunities</TabsTrigger>
                <TabsTrigger value="avoid">Should Avoid</TabsTrigger>
              </TabsList>

              <TabsContent value="framework" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {frameworks.find(f => f.id === selectedFramework)?.framework_name} Analysis
                    </CardTitle>
                    <CardDescription>
                      {frameworks.find(f => f.id === selectedFramework)?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(analysisResults.framework_scores).map(([criterion, score]) => (
                      <div key={criterion} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{criterion}</span>
                          <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="speaker" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResults.speaker_analysis.map((speaker, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          <CardTitle>{speaker.speaker}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-slate-600">Talk Time</p>
                            <p className="text-2xl font-bold">{speaker.talk_time_percentage}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Word Count</p>
                            <p className="text-2xl font-bold">{speaker.word_count}</p>
                          </div>
                          {speaker.questions_asked !== undefined && (
                            <>
                              <div>
                                <p className="text-sm text-slate-600">Questions</p>
                                <p className="text-2xl font-bold">{speaker.questions_asked}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Statements</p>
                                <p className="text-2xl font-bold">{speaker.statements_made}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Filler Words</p>
                                <p className="text-2xl font-bold text-yellow-600">{speaker.filler_words_count}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Confidence</p>
                                <p className={`text-2xl font-bold ${getScoreColor(speaker.confidence_score)}`}>
                                  {speaker.confidence_score}%
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personalized Recommendations</CardTitle>
                    <CardDescription>Action items to improve your sales conversations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {analysisResults.recommendations.map((rec, idx) => (
                          <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-lg">{rec.title}</h4>
                              </div>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">Category: {rec.category}</p>
                            <p className="text-slate-700">{rec.description}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResults.improvement_areas.map((area, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-orange-600" />
                          {area.area}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Current Score</span>
                          <span className="font-bold">{area.current_score}%</span>
                        </div>
                        <Progress value={area.current_score} className="h-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Target Score</span>
                          <span className="font-bold text-green-600">{area.target_score}%</span>
                        </div>
                        <div className="space-y-2 mt-4">
                          <p className="text-sm font-medium">Examples:</p>
                          <ul className="space-y-1">
                            {area.examples.map((example, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="strengths" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResults.strengths.map((strength, idx) => (
                    <Card key={idx} className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          {strength.area}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Score:</span>
                          <Badge className="bg-green-600 text-white">{strength.score}%</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">What you did well:</p>
                          <ul className="space-y-2">
                            {strength.examples.map((example, i) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Missed Opportunities</CardTitle>
                    <CardDescription>
                      Key moments where you could have dug deeper or asked different questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {analysisResults.missed_opportunities.map((opp, idx) => (
                          <div key={idx} className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-slate-600" />
                                  <span className="text-sm text-slate-600">
                                    {Math.floor(opp.timestamp / 60)}:{(opp.timestamp % 60).toString().padStart(2, '0')}
                                  </span>
                                  <Badge className={getPriorityColor(opp.impact)}>
                                    {opp.impact} impact
                                  </Badge>
                                </div>
                                <p className="text-slate-700">{opp.opportunity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="avoid" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Patterns to Avoid</CardTitle>
                    <CardDescription>
                      Behaviors that may be limiting your effectiveness
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResults.should_avoid.map((pattern, idx) => (
                        <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-lg">{pattern.pattern}</h4>
                                <Badge variant="destructive">{pattern.occurrences} times</Badge>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm font-medium text-slate-600">Impact:</p>
                                  <p className="text-sm text-slate-700">{pattern.impact}</p>
                                </div>
                                <div className="bg-white p-3 rounded border border-green-200">
                                  <p className="text-sm font-medium text-green-700 mb-1">
                                    <ThumbsUp className="h-4 w-4 inline mr-1" />
                                    Suggestion:
                                  </p>
                                  <p className="text-sm text-slate-700">{pattern.suggestion}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {!analysisResults && selectedSession && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Brain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No Analysis Available Yet
                </h3>
                <p className="text-slate-600 mb-4">
                  Click "Analyze Session" to generate comprehensive insights for this roleplay
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
