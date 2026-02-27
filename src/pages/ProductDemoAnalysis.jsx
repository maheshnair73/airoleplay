import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Clock,
  Award,
  Lightbulb,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';

const ProductDemoAnalysis = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [demoSession, setDemoSession] = useState(null);
  const [validationLogs, setValidationLogs] = useState([]);
  const [usps, setUsps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysisData();
  }, [sessionId]);

  const loadAnalysisData = async () => {
    try {
      const { data: roleplayData, error: roleplayError } = await supabase
        .from('roleplay_sessions')
        .select(`
          *,
          roleplay_bots(*)
        `)
        .eq('id', sessionId)
        .single();

      if (roleplayError) throw roleplayError;
      setSession(roleplayData);

      const { data: demoData } = await supabase
        .from('product_demo_sessions')
        .select('*')
        .eq('roleplay_session_id', sessionId)
        .single();

      setDemoSession(demoData);

      const { data: logsData } = await supabase
        .from('demo_validation_logs')
        .select(`
          *,
          product_usps(*)
        `)
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      setValidationLogs(logsData || []);

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('product_usps')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('is_approved', true);

      if (demoData?.product_id) {
        query = query.eq('product_id', demoData.product_id);
      }

      const { data: uspsData } = await query;
      setUsps(uspsData || []);

    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your demo...</p>
        </div>
      </div>
    );
  }

  const stats = {
    correct: validationLogs.filter(l => l.validation_type === 'correct' || l.validation_type === 'excellent').length,
    incorrect: validationLogs.filter(l => l.validation_type === 'incorrect').length,
    missed: validationLogs.filter(l => l.validation_type === 'missed_opportunity').length,
    unsure: validationLogs.filter(l => l.validation_type === 'unsure').length,
    total: validationLogs.length
  };

  const coveredUSPIds = new Set(
    validationLogs
      .filter(l => l.matched_usp_id && (l.validation_type === 'correct' || l.validation_type === 'excellent'))
      .map(l => l.matched_usp_id)
  );

  const coveragePercentage = usps.length > 0 ? (coveredUSPIds.size / usps.length) * 100 : 0;
  const accuracyPercentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;

  const duration = session?.started_at && session?.ended_at
    ? Math.round((new Date(session.ended_at) - new Date(session.started_at)) / 1000 / 60)
    : 0;

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 90) return { label: 'Excellent', variant: 'default' };
    if (percentage >= 75) return { label: 'Good', variant: 'default' };
    if (percentage >= 60) return { label: 'Fair', variant: 'secondary' };
    return { label: 'Needs Improvement', variant: 'destructive' };
  };

  const uspsByCategory = usps.reduce((acc, usp) => {
    if (!acc[usp.category]) acc[usp.category] = [];
    acc[usp.category].push(usp);
    return acc;
  }, {});

  const overallScore = Math.round((accuracyPercentage * 0.6) + (coveragePercentage * 0.4));
  const scoreBadge = getScoreBadge(overallScore);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/ai-roleplay')}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roleplay
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Demo Analysis</h1>
              <p className="text-gray-600 mt-1">
                Session with {session?.roleplay_bots?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <Badge variant={scoreBadge.variant} className="mt-2">
                {scoreBadge.label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getScoreColor(accuracyPercentage)}`}>
                {Math.round(accuracyPercentage)}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.correct} of {stats.total} statements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getScoreColor(coveragePercentage)}`}>
                {Math.round(coveragePercentage)}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {coveredUSPIds.size} of {usps.length} USPs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">{duration}</div>
              <p className="text-sm text-gray-600 mt-2">minutes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Correct</span>
                  </div>
                  <span className="text-sm font-bold">{stats.correct}</span>
                </div>
                <Progress value={(stats.correct / stats.total) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">Incorrect</span>
                  </div>
                  <span className="text-sm font-bold">{stats.incorrect}</span>
                </div>
                <Progress value={(stats.incorrect / stats.total) * 100} className="h-2 bg-red-100" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium">Missed Opportunities</span>
                  </div>
                  <span className="text-sm font-bold">{stats.missed}</span>
                </div>
                <Progress value={(stats.missed / stats.total) * 100} className="h-2 bg-yellow-100" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Needs Review</span>
                  </div>
                  <span className="text-sm font-bold">{stats.unsure}</span>
                </div>
                <Progress value={(stats.unsure / stats.total) * 100} className="h-2 bg-gray-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Key Strengths & Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Strengths
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {accuracyPercentage >= 75 && (
                      <li>• High accuracy in presenting product information</li>
                    )}
                    {coveragePercentage >= 75 && (
                      <li>• Good coverage of key product features</li>
                    )}
                    {stats.incorrect === 0 && (
                      <li>• No incorrect statements detected</li>
                    )}
                    {accuracyPercentage < 75 && coveragePercentage < 75 && stats.incorrect > 0 && (
                      <li className="text-gray-500 italic">Keep practicing to identify strengths</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {accuracyPercentage < 75 && (
                      <li>• Focus on accuracy of product information</li>
                    )}
                    {coveragePercentage < 75 && (
                      <li>• Cover more key product features in your demos</li>
                    )}
                    {stats.incorrect > 0 && (
                      <li>• Review and correct the {stats.incorrect} incorrect statement{stats.incorrect > 1 ? 's' : ''}</li>
                    )}
                    {stats.missed > 3 && (
                      <li>• Reduce missed opportunities by being more proactive</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="coverage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="coverage">Feature Coverage</TabsTrigger>
            <TabsTrigger value="timeline">Demo Timeline</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="coverage">
            <Card>
              <CardHeader>
                <CardTitle>Feature Coverage by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(uspsByCategory).map(([category, categoryUSPs]) => {
                  const covered = categoryUSPs.filter(u => coveredUSPIds.has(u.id)).length;
                  const percentage = (covered / categoryUSPs.length) * 100;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold capitalize">{category.replace('_', ' ')}</h3>
                        <span className="text-sm text-gray-600">
                          {covered} / {categoryUSPs.length}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2 mb-3" />
                      <div className="space-y-2">
                        {categoryUSPs.map((usp) => (
                          <div
                            key={usp.id}
                            className={`flex items-start gap-2 p-2 rounded-lg ${
                              coveredUSPIds.has(usp.id)
                                ? 'bg-green-50'
                                : 'bg-gray-50'
                            }`}
                          >
                            {coveredUSPIds.has(usp.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{usp.usp_title}</p>
                              <p className="text-xs text-gray-600">{usp.usp_description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Demo Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {validationLogs.map((log, index) => (
                    <div key={log.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.validation_type === 'correct' || log.validation_type === 'excellent'
                              ? 'bg-green-100'
                              : log.validation_type === 'incorrect'
                              ? 'bg-red-100'
                              : 'bg-yellow-100'
                          }`}
                        >
                          {log.validation_type === 'correct' || log.validation_type === 'excellent' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : log.validation_type === 'incorrect' ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        {index < validationLogs.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 flex-1 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-900 mb-1">{log.spoken_text}</p>
                        {log.product_usps && (
                          <p className="text-xs text-blue-600">
                            Matched: {log.product_usps.usp_title}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(log.confidence_score * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coveragePercentage < 100 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Uncovered Features</h3>
                      <p className="text-sm text-blue-800 mb-3">
                        You missed {usps.length - coveredUSPIds.size} key feature{usps.length - coveredUSPIds.size > 1 ? 's' : ''}. Consider practicing these:
                      </p>
                      <ul className="space-y-1 text-sm text-blue-900">
                        {usps
                          .filter(u => !coveredUSPIds.has(u.id))
                          .slice(0, 5)
                          .map((usp) => (
                            <li key={usp.id}>• {usp.usp_title}</li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {stats.incorrect > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-2">Incorrect Statements</h3>
                      <p className="text-sm text-red-800 mb-3">
                        Review these statements that were flagged as incorrect:
                      </p>
                      <ul className="space-y-2 text-sm text-red-900">
                        {validationLogs
                          .filter(l => l.validation_type === 'incorrect')
                          .map((log) => (
                            <li key={log.id} className="italic">"{log.spoken_text}"</li>
                          ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Next Steps</h3>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li>• Schedule another demo practice session</li>
                      <li>• Review the product knowledge base</li>
                      <li>• Practice with a different buyer persona</li>
                      <li>• Share this analysis with your manager</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDemoAnalysis;
