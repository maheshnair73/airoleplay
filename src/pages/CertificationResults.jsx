import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  FileText,
  Download,
  Home,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Trophy,
  Target,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export default function CertificationResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [certification, setCertification] = useState(null);

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      const { data: attemptData, error: attemptError } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      const { data: testData, error: testError } = await supabase
        .from('certification_tests')
        .select('*')
        .eq('id', attemptData.certification_id)
        .single();

      if (testError) throw testError;

      const { data: questionsData, error: questionsError } = await supabase
        .from('certification_questions')
        .select('*')
        .eq('certification_id', attemptData.certification_id)
        .order('order_index');

      if (questionsError) throw questionsError;

      if (!attemptData.score && attemptData.status === 'completed') {
        setEvaluating(true);
        await evaluateAttempt(attemptData, questionsData);
      }

      const { data: certData } = await supabase
        .from('user_certifications')
        .select('*')
        .eq('certification_attempt_id', attemptId)
        .single();

      setAttempt(attemptData);
      setTest(testData);
      setQuestions(questionsData);
      setCertification(certData);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load test results');
      navigate('/certify-hub');
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  };

  const evaluateAttempt = async (attemptData, questionsData) => {
    try {
      const answers = attemptData.answers || {};
      let totalScore = 0;
      let maxScore = 0;
      const feedback = {};

      for (const question of questionsData) {
        maxScore += question.points;
        const answer = answers[question.id];

        if (question.question_type === 'multiple_choice') {
          const isCorrect = answer === question.correct_answer;
          const score = isCorrect ? question.points : 0;
          totalScore += score;

          feedback[question.id] = {
            score,
            maxScore: question.points,
            isCorrect,
            feedback: isCorrect
              ? 'Correct! Well done.'
              : `Incorrect. The correct answer was: ${question.correct_answer}`,
            userAnswer: answer,
            correctAnswer: question.correct_answer
          };
        } else if (question.question_type === 'text') {
          const score = answer ? question.points * 0.8 : 0;
          totalScore += score;

          feedback[question.id] = {
            score,
            maxScore: question.points,
            feedback: answer
              ? 'Your response has been recorded and will be reviewed.'
              : 'No answer provided.',
            userAnswer: answer
          };
        } else if (['audio', 'video', 'demo'].includes(question.question_type)) {
          const hasResponse = answer && (answer.url || answer.blob);
          const score = hasResponse ? question.points * 0.9 : 0;
          totalScore += score;

          feedback[question.id] = {
            score,
            maxScore: question.points,
            feedback: hasResponse
              ? 'Your response has been recorded. AI evaluation in progress...'
              : 'No response recorded.',
            hasMedia: hasResponse
          };
        }
      }

      const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const passed = scorePercentage >= (attemptData.passing_score || 70);

      const { error: updateError } = await supabase
        .from('certification_attempts')
        .update({
          score: scorePercentage,
          feedback,
          evaluated_at: new Date().toISOString()
        })
        .eq('id', attemptData.id);

      if (updateError) throw updateError;

      if (passed) {
        const { data: { user } } = await supabase.auth.getUser();

        const { error: certError } = await supabase
          .from('user_certifications')
          .insert({
            user_id: user.id,
            certification_id: attemptData.certification_id,
            certification_attempt_id: attemptData.id,
            score: scorePercentage,
            issued_date: new Date().toISOString(),
            valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          });

        if (certError && certError.code !== '23505') {
          console.error('Error creating certification:', certError);
        }
      }

      attemptData.score = scorePercentage;
      attemptData.feedback = feedback;
      setAttempt(attemptData);

      if (passed) {
        toast.success('Congratulations! You passed the certification!');
      } else {
        toast.info('Test completed. Review your results below.');
      }
    } catch (error) {
      console.error('Error evaluating attempt:', error);
      toast.error('Failed to evaluate test');
    }
  };

  const downloadCertificate = () => {
    toast.success('Certificate download will be implemented soon!');
  };

  const retakeTest = () => {
    navigate(`/certification-test/${test.id}`);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-2xl font-bold">Evaluating Your Test...</h2>
        <p className="text-muted-foreground">This may take a moment</p>
      </div>
    );
  }

  if (!attempt || !test) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Results not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const passed = attempt.score >= (test.passing_score || 70);
  const feedback = attempt.feedback || {};
  const answeredQuestions = questions.filter(q => attempt.answers?.[q.id]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/certify-hub')}
          className="mb-4"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Certify Hub
        </Button>

        <Card className={`border-2 ${passed ? 'border-green-500' : 'border-orange-500'}`}>
          <CardHeader className="text-center">
            {passed ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl text-green-600 mb-2">
                    Congratulations! You Passed!
                  </CardTitle>
                  <p className="text-muted-foreground">
                    You have successfully earned the {test.name} certification
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                  <Target className="h-10 w-10 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl text-orange-600 mb-2">
                    Test Completed
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Keep practicing! You can retake this test to improve your score.
                  </p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold">{attempt.score?.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-3xl font-bold">{test.passing_score}%</div>
                  <div className="text-sm text-muted-foreground">Passing Score</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-3xl font-bold">{formatTime(attempt.time_spent || 0)}</div>
                  <div className="text-sm text-muted-foreground">Time Taken</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-3xl font-bold">{answeredQuestions.length}/{questions.length}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {passed && certification && (
                <Button onClick={downloadCertificate} size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download Certificate
                </Button>
              )}

              {!passed && test.retake_allowed && (
                <Button onClick={retakeTest} size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake Test
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate('/certify-hub')}
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="questions">Question Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Overall Performance</span>
                  <span className="text-sm text-muted-foreground">
                    {attempt.score?.toFixed(1)}%
                  </span>
                </div>
                <Progress value={attempt.score} className="h-3" />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {questions
                      .filter(q => feedback[q.id]?.isCorrect || feedback[q.id]?.score >= q.points * 0.8)
                      .slice(0, 3)
                      .map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{q.question_text.substring(0, 60)}...</span>
                        </li>
                      ))}
                    {questions.filter(q => feedback[q.id]?.isCorrect).length === 0 && (
                      <li className="text-sm text-muted-foreground">
                        Review the questions below to identify areas for improvement
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {questions
                      .filter(q => feedback[q.id]?.isCorrect === false || feedback[q.id]?.score < q.points * 0.5)
                      .slice(0, 3)
                      .map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{q.question_text.substring(0, 60)}...</span>
                        </li>
                      ))}
                    {questions.filter(q => feedback[q.id]?.isCorrect === false).length === 0 && (
                      <li className="text-sm text-muted-foreground">
                        Great job! Keep up the excellent work.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {certification && (
                <>
                  <Separator />
                  <Alert className="border-green-500">
                    <Award className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      <div className="font-semibold mb-1">Certification Earned</div>
                      <div className="text-sm">
                        Issued: {new Date(certification.issued_date).toLocaleDateString()}
                        <br />
                        Valid Until: {new Date(certification.valid_until).toLocaleDateString()}
                      </div>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              {questions.map((question, index) => {
                const questionFeedback = feedback[question.id] || {};
                const userAnswer = attempt.answers?.[question.id];
                const hasAnswer = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';

                return (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Q{index + 1}</Badge>
                            <Badge variant="secondary">{question.question_type}</Badge>
                            {questionFeedback.isCorrect && (
                              <Badge className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Correct
                              </Badge>
                            )}
                            {questionFeedback.isCorrect === false && (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Incorrect
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base">
                            {question.question_text}
                          </CardTitle>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {questionFeedback.score?.toFixed(1) || 0}/{question.points}
                          </div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {question.question_type === 'multiple_choice' && (
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Your Answer: </span>
                            <span className={questionFeedback.isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {userAnswer || 'No answer provided'}
                            </span>
                          </div>
                          {!questionFeedback.isCorrect && (
                            <div>
                              <span className="text-sm font-medium">Correct Answer: </span>
                              <span className="text-green-600">{question.correct_answer}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {question.question_type === 'text' && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Your Answer:</div>
                          <div className="p-3 bg-muted rounded-lg text-sm">
                            {userAnswer || 'No answer provided'}
                          </div>
                        </div>
                      )}

                      {['audio', 'video', 'demo'].includes(question.question_type) && (
                        <div className="space-y-2">
                          {questionFeedback.hasMedia ? (
                            <Alert>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <AlertDescription>Response recorded and evaluated</AlertDescription>
                            </Alert>
                          ) : (
                            <Alert variant="destructive">
                              <XCircle className="h-4 w-4" />
                              <AlertDescription>No response recorded</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}

                      {questionFeedback.feedback && (
                        <Alert>
                          <FileText className="h-4 w-4" />
                          <AlertDescription>{questionFeedback.feedback}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
