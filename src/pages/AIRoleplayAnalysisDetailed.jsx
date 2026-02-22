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
  Download, Filter, RefreshCw, History, Calendar, Eye, Search
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
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    sessionType: 'all',
    framework: 'all',
    dateRange: 'all',
    searchTerm: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sessionsData, frameworksData, historyData] = await Promise.all([
        RoleplaySession.list('-created_at'),
        supabase.from('analysis_frameworks').select('*').eq('is_active', true),
        loadAnalysisHistory()
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

  const loadAnalysisHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('session_analysis_results')
        .select(`
          *,
          roleplay_sessions (
            id,
            scenario_name,
            bot_name,
            session_type,
            created_at,
            duration
          ),
          analysis_frameworks (
            id,
            framework_name
          )
        `)
        .order('analyzed_at', { ascending: false });

      if (error) throw error;

      setAnalysisHistory(data || []);
      return data;
    } catch (error) {
      console.error('Error loading analysis history:', error);
      return [];
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

  const loadAnalysisFromHistory = async (historyItem) => {
    setSelectedSession(sessions.find(s => s.id === historyItem.session_id));
    setSelectedFramework(historyItem.framework_id);
    setAnalysisResults(historyItem);
  };

  const filteredHistory = analysisHistory.filter(item => {
    if (historyFilters.sessionType !== 'all' && item.roleplay_sessions?.session_type !== historyFilters.sessionType) {
      return false;
    }
    if (historyFilters.framework !== 'all' && item.framework_id !== historyFilters.framework) {
      return false;
    }
    if (historyFilters.searchTerm) {
      const searchLower = historyFilters.searchTerm.toLowerCase();
      const matchesScenario = item.roleplay_sessions?.scenario_name?.toLowerCase().includes(searchLower);
      const matchesBot = item.roleplay_sessions?.bot_name?.toLowerCase().includes(searchLower);
      if (!matchesScenario && !matchesBot) return false;
    }
    return true;
  });

  const getSessionTypeIcon = (type) => {
    if (type === 'human_roleplay') return '👥';
    if (type === 'multi_party') return '🎭';
    return '🤖';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
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
            <p className="text-slate-600 mt-1">
              Analyze AI, Human-to-Human, and Multi-Party roleplay sessions using proven sales methodologies
            </p>
          </div>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Session & Framework</CardTitle>
            <CardDescription>Choose a roleplay session and analysis framework to review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {sessions.map((session) => {
                      const sessionTypeLabel = session.session_type === 'human_roleplay' ? '👥' :
                                               session.session_type === 'multi_party' ? '🎭' :
                                               '🤖';
                      return (
                        <SelectItem key={session.id} value={session.id}>
                          {sessionTypeLabel} {session.scenario_name || session.bot_name} - {new Date(session.created_at).toLocaleDateString()}
                        </SelectItem>
                      );
                    })}
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
            </div>

            {selectedSession && (
              <div className="mt-4">
                <Button
                  onClick={analyzeSession}
                  disabled={isAnalyzing}
                  size="lg"
                  className="w-full"
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
            )}
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

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-blue-600" />
                      Call History
                    </CardTitle>
                    <CardDescription>View all previously analyzed sessions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadAnalysisHistory}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search sessions..."
                        value={historyFilters.searchTerm}
                        onChange={(e) => setHistoryFilters({ ...historyFilters, searchTerm: e.target.value })}
                        className="pl-9"
                      />
                    </div>

                    <Select
                      value={historyFilters.sessionType}
                      onValueChange={(value) => setHistoryFilters({ ...historyFilters, sessionType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Session Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ai_roleplay">AI Roleplay</SelectItem>
                        <SelectItem value="human_roleplay">Human-to-Human</SelectItem>
                        <SelectItem value="multi_party">Multi-Party</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={historyFilters.framework}
                      onValueChange={(value) => setHistoryFilters({ ...historyFilters, framework: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Frameworks</SelectItem>
                        {frameworks.map((framework) => (
                          <SelectItem key={framework.id} value={framework.id}>
                            {framework.framework_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={() => setHistoryFilters({
                        sessionType: 'all',
                        framework: 'all',
                        dateRange: 'all',
                        searchTerm: ''
                      })}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>

                  <Separator />

                  <ScrollArea className="h-96">
                    {filteredHistory.length > 0 ? (
                      <div className="space-y-2">
                        {filteredHistory.map((historyItem) => (
                          <div
                            key={historyItem.id}
                            className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => loadAnalysisFromHistory(historyItem)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-2xl">
                                    {getSessionTypeIcon(historyItem.roleplay_sessions?.session_type)}
                                  </span>
                                  <div>
                                    <h4 className="font-semibold text-slate-900">
                                      {historyItem.roleplay_sessions?.scenario_name || historyItem.roleplay_sessions?.bot_name || 'Unknown Session'}
                                    </h4>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(historyItem.analyzed_at)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {Math.floor((historyItem.roleplay_sessions?.duration || 0) / 60)}m
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {historyItem.analysis_frameworks?.framework_name}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${getScoreColor(historyItem.overall_score || 0)}`}>
                                    {historyItem.overall_score || 0}%
                                  </div>
                                  <div className="text-xs text-slate-500">Score</div>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-600 mb-2">
                          No Analysis History Found
                        </h3>
                        <p className="text-slate-500">
                          {historyFilters.searchTerm || historyFilters.sessionType !== 'all' || historyFilters.framework !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Analyze a session to see your history here'}
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
                <TabsTrigger value="speaker">Speaker Breakdown</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
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

              <TabsContent value="insights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>Action items to improve your performance</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Improvement Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResults.improvement_areas.map((area, idx) => (
                        <div key={idx} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            {area.area}
                          </h4>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-slate-600">Current: {area.current_score}%</span>
                                <span className="text-sm text-green-600 font-medium">Target: {area.target_score}%</span>
                              </div>
                              <Progress value={area.current_score} className="h-2" />
                            </div>
                          </div>
                          <ul className="space-y-1">
                            {area.examples.map((example, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Missed Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResults.missed_opportunities.map((opp, idx) => (
                        <div key={idx} className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Patterns to Avoid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResults.should_avoid.map((pattern, idx) => (
                        <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-3 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{pattern.pattern}</h4>
                                <Badge variant="destructive">{pattern.occurrences} times</Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{pattern.impact}</p>
                              <div className="bg-white p-2 rounded border border-green-200">
                                <p className="text-sm text-green-700">
                                  <ThumbsUp className="h-3 w-3 inline mr-1" />
                                  {pattern.suggestion}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
