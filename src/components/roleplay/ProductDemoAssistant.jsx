import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Lightbulb,
  Target,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

const ProductDemoAssistant = ({ sessionId, demoSession, isActive, transcript }) => {
  const [usps, setUsps] = useState([]);
  const [validationLogs, setValidationLogs] = useState([]);
  const [coveredUSPs, setCoveredUSPs] = useState(new Set());
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    missed: 0,
    total: 0
  });

  useEffect(() => {
    loadProductUSPs();

    if (isActive) {
      const subscription = supabase
        .channel(`demo-validation-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'demo_validation_logs',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            handleNewValidation(payload.new);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [sessionId, isActive]);

  const loadProductUSPs = async () => {
    try {
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
        .eq('is_approved', true)
        .order('category', { ascending: true });

      if (demoSession?.product_id) {
        query = query.eq('product_id', demoSession.product_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsps(data || []);
    } catch (error) {
      console.error('Error loading USPs:', error);
    }
  };

  const handleNewValidation = (validation) => {
    setValidationLogs(prev => [...prev, validation]);

    if (validation.matched_usp_id) {
      setCoveredUSPs(prev => new Set([...prev, validation.matched_usp_id]));
    }

    setStats(prev => ({
      correct: validation.validation_type === 'correct' ? prev.correct + 1 : prev.correct,
      incorrect: validation.validation_type === 'incorrect' ? prev.incorrect + 1 : prev.incorrect,
      missed: validation.validation_type === 'missed_opportunity' ? prev.missed + 1 : prev.missed,
      total: prev.total + 1
    }));
  };

  const uncoveredUSPs = usps.filter(usp => !coveredUSPs.has(usp.id));
  const uspsByCategory = usps.reduce((acc, usp) => {
    if (!acc[usp.category]) acc[usp.category] = [];
    acc[usp.category].push(usp);
    return acc;
  }, {});

  const getValidationIcon = (validationType) => {
    switch (validationType) {
      case 'correct':
      case 'excellent':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'incorrect':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'missed_opportunity':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const getValidationColor = (validationType) => {
    switch (validationType) {
      case 'correct':
      case 'excellent':
        return 'bg-green-50 border-green-200';
      case 'incorrect':
        return 'bg-red-50 border-red-200';
      case 'missed_opportunity':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-96 bg-white border-l overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-blue-50">
        <h2 className="font-semibold text-lg mb-3">Live Coaching Assistant</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
            <div className="text-xs text-gray-600">Incorrect</div>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.missed}</div>
            <div className="text-xs text-gray-600">Missed</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="suggestions" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4 space-y-4">
              {uncoveredUSPs.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Target className="w-4 h-4" />
                    Key Points to Cover ({uncoveredUSPs.length})
                  </div>
                  {uncoveredUSPs.slice(0, 5).map((usp) => (
                    <Card key={usp.id} className="border-blue-200">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="text-xs mt-0.5">
                            {usp.category}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{usp.usp_title}</p>
                            <p className="text-xs text-gray-600 mt-1">{usp.usp_description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {uncoveredUSPs.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{uncoveredUSPs.length - 5} more to cover
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
                  <p className="text-sm">All key points covered!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="validation" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4 space-y-3">
              {validationLogs.length > 0 ? (
                validationLogs.slice().reverse().map((log, index) => (
                  <div
                    key={log.id || index}
                    className={`p-3 rounded-lg border ${getValidationColor(log.validation_type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getValidationIcon(log.validation_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 mb-1">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-sm">{log.spoken_text}</p>
                        {log.confidence_score && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Confidence</span>
                              <span>{Math.round(log.confidence_score * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${log.confidence_score * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">No validations yet</p>
                  <p className="text-xs mt-1">Start talking to see live feedback</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="coverage" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4 space-y-4">
              {Object.entries(uspsByCategory).map(([category, categoryUSPs]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize flex items-center gap-2">
                    {category.replace('_', ' ')}
                    <Badge variant="secondary" className="text-xs">
                      {categoryUSPs.filter(u => coveredUSPs.has(u.id)).length}/{categoryUSPs.length}
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    {categoryUSPs.map((usp) => (
                      <div
                        key={usp.id}
                        className={`p-2 rounded-lg border text-sm ${
                          coveredUSPs.has(usp.id)
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {coveredUSPs.has(usp.id) ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full mt-0.5 flex-shrink-0" />
                          )}
                          <span className="text-xs">{usp.usp_title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDemoAssistant;
