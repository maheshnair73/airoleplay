import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  TrainingDocument,
  TrainingQuizQuestion,
  AgentTrainingAttempt,
  AgentCertification,
  PersonalizedTrainingAssignment,
  User
} from '@/api/entities';
import {
  Brain, CheckCircle, XCircle, ArrowRight, ArrowLeft,
  Clock, Award, MessageSquare, Volume2, Trophy, Target,
  BookOpen, Repeat, Home
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

export default function TrainerBot() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const docId = searchParams.get('docId');
  const assignmentId = searchParams.get('assignmentId');
  const isDemo = searchParams.get('demo') === 'true';
  const demoCategory = searchParams.get('category') || 'Product Knowledge';
  const demoTitle = searchParams.get('title') || 'Training Session';

  const [currentUser, setCurrentUser] = useState(null);
  const [document, setDocument] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  const [mode, setMode] = useState('study');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrainingData();
  }, [docId, isDemo]);

  const loadTrainingData = async () => {
    setIsLoading(true);
    try {
      if (isDemo) {
        const demoDoc = {
          id: `demo-${demoCategory}`,
          title: demoTitle,
          category: demoCategory,
          passing_score: 75,
          document_type: 'course'
        };
        setDocument(demoDoc);
        setQuestions(generateMockQuestions(demoDoc));
        setStartTime(Date.now());
        setIsLoading(false);
        return;
      }

      const [user, doc, attempts] = await Promise.all([
        User.me(),
        TrainingDocument.get(docId),
        AgentTrainingAttempt.list()
      ]);

      setCurrentUser(user);
      setDocument(doc);

      const userAttempts = attempts.filter(
        a => a.document_id === docId && a.agent_email === user?.email
      );
      setAttemptNumber(userAttempts.length + 1);

      if (assignmentId) {
        const assignments = await PersonalizedTrainingAssignment.list();
        const foundAssignment = assignments.find(a => a.id === assignmentId);
        setAssignment(foundAssignment);
      }

      const quizQuestions = await generateQuizQuestions(doc);
      setQuestions(quizQuestions);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load training data:', error);
      toast.error('Failed to load training data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuizQuestions = async (doc) => {
    const existingQuestions = await TrainingQuizQuestion.list();
    const docQuestions = existingQuestions.filter(q => q.document_id === doc.id && q.is_active);

    if (docQuestions.length > 0) {
      return docQuestions.sort((a, b) => a.order_index - b.order_index);
    }

    return generateMockQuestions(doc);
  };

  const generateMockQuestions = (doc) => {
    const questionSets = {
      'Product Knowledge': [
        {
          question_text: 'What is the primary value proposition of our product?',
          options: [
            'Lowest price in the market',
            'Increases productivity by 40% on average',
            'Most features available',
            'Fastest implementation time'
          ],
          correct_answer: 'Increases productivity by 40% on average',
          explanation: 'Our primary value proposition focuses on measurable productivity gains, which is what resonates most with enterprise customers.'
        },
        {
          question_text: 'Which integration is most commonly requested by enterprise customers?',
          options: ['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho'],
          correct_answer: 'Salesforce',
          explanation: 'Salesforce integration is requested by 80% of enterprise customers as it is the most widely used CRM in the enterprise segment.'
        }
      ],
      'Objection Handling': [
        {
          question_text: 'When a prospect says "It\'s too expensive", what should you do first?',
          options: [
            'Immediately offer a discount',
            'Ask what they are comparing it to',
            'List all the features',
            'End the conversation'
          ],
          correct_answer: 'Ask what they are comparing it to',
          explanation: 'Understanding their frame of reference helps you address the real concern and reframe value versus cost.'
        },
        {
          question_text: 'How should you handle "We\'re happy with our current solution"?',
          options: [
            'Criticize their current solution',
            'Give up and move on',
            'Ask what they like about it and probe for potential gaps',
            'Offer a free trial immediately'
          ],
          correct_answer: 'Ask what they like about it and probe for potential gaps',
          explanation: 'Acknowledging their satisfaction while exploring potential unmet needs builds trust and opens opportunities.'
        }
      ],
      'Discovery Techniques': [
        {
          question_text: 'What is the most effective discovery question pattern?',
          options: [
            'Closed yes/no questions',
            'Leading questions',
            'Open-ended questions starting with what/how/tell me',
            'Multiple choice questions'
          ],
          correct_answer: 'Open-ended questions starting with what/how/tell me',
          explanation: 'Open-ended questions encourage prospects to share more information and help uncover deeper needs.'
        },
        {
          question_text: 'When should you present your solution during discovery?',
          options: [
            'Immediately at the start',
            'After understanding their challenges and goals',
            'Never during discovery',
            'Only if they ask'
          ],
          correct_answer: 'After understanding their challenges and goals',
          explanation: 'Effective discovery requires understanding before presenting. This ensures your solution is positioned against their specific needs.'
        }
      ]
    };

    const categoryQuestions = questionSets[doc.category] || questionSets['Product Knowledge'];

    return categoryQuestions.map((q, index) => ({
      id: `mock-${index}`,
      document_id: doc.id,
      question_text: q.question_text,
      question_type: 'multiple_choice',
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: 'medium',
      order_index: index,
      is_active: true
    }));
  };

  const handleAnswerSelect = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: answer
    });
    setShowExplanation(false);
  };

  const handleCheckAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];

    if (!userAnswer) {
      toast.error('Please select an answer');
      return;
    }

    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    } else {
      completeTraining();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const completeTraining = async () => {
    const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);
    let correctAnswers = 0;

    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const finalScore = (correctAnswers / questions.length) * 100;
    const passed = finalScore >= document.passing_score;

    setScore(finalScore);
    setIsComplete(true);

    if (isDemo) {
      if (passed) toast.success('Great work! You passed this demo training.');
      else toast.error(`Score: ${Math.round(finalScore)}%. You need ${document.passing_score}% to pass.`);
      return;
    }

    try {
      await AgentTrainingAttempt.create({
        agent_email: currentUser?.email,
        document_id: document.id,
        quiz_score: finalScore,
        time_spent_minutes: timeSpentMinutes,
        attempt_number: attemptNumber,
        completed_at: new Date().toISOString(),
        passed: passed,
        answers: userAnswers
      });

      if (passed) {
        const existingCerts = await AgentCertification.list();
        const existingCert = existingCerts.find(
          c => c.agent_email === currentUser?.email && c.document_id === document.id
        );

        if (existingCert) {
          await AgentCertification.update(existingCert.id, {
            certification_date: new Date().toISOString(),
            status: 'active',
            renewal_count: (existingCert.renewal_count || 0) + 1,
            last_renewed_date: new Date().toISOString()
          });
        } else {
          await AgentCertification.create({
            agent_email: currentUser?.email,
            document_id: document.id,
            certification_date: new Date().toISOString(),
            status: 'active',
            renewal_count: 0
          });
        }

        if (assignment) {
          await PersonalizedTrainingAssignment.update(assignment.id, {
            completed_date: new Date().toISOString(),
            status: 'completed'
          });
        }

        toast.success('Congratulations! You have earned certification!');
      } else {
        toast.error(`Score: ${Math.round(finalScore)}%. You need ${document.passing_score}% to pass.`);
      }
    } catch (error) {
      console.error('Failed to save training attempt:', error);
      toast.error('Failed to save training results');
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
    setIsComplete(false);
    setScore(0);
    setAttemptNumber(attemptNumber + 1);
    setStartTime(Date.now());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">Training document not found</p>
            <Button onClick={() => navigate(createPageUrl('TrainingLibrary'))} className="mt-4">
              <Home className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (mode === 'study') {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{document.title}</CardTitle>
                  <CardDescription className="mt-2">{document.description}</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {document.category}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {assignment && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900">Personalized Training Assignment</p>
                    <p className="text-sm text-orange-800 mt-1">{assignment.reason}</p>
                    <Badge className="mt-2 bg-orange-200 text-orange-900">
                      Priority: {assignment.priority}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Training Content
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ReactMarkdown>{document.content}</ReactMarkdown>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('TrainingLibrary'))}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
            <Button
              onClick={() => setMode('quiz')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Quiz
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const passed = score >= document.passing_score;
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                {passed ? (
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-green-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                    <Target className="w-10 h-10 text-orange-600" />
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl">
                {passed ? 'Congratulations!' : 'Keep Practicing!'}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {passed
                  ? 'You have successfully completed the training and earned certification'
                  : `You need ${document.passing_score}% to pass. Review the material and try again.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Your Score</p>
                  <p className="text-3xl font-bold text-slate-900">{Math.round(score)}%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Passing Score</p>
                  <p className="text-3xl font-bold text-slate-900">{document.passing_score}%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Questions</p>
                  <p className="text-3xl font-bold text-slate-900">{questions.length}</p>
                </div>
              </div>

              <div className="space-y-3">
                {passed ? (
                  <>
                    <Button
                      onClick={() => navigate(createPageUrl('AgentTrainingProfile'))}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      View My Certifications
                    </Button>
                    <Button
                      onClick={() => navigate(createPageUrl('TrainingLibrary'))}
                      variant="outline"
                      className="w-full"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Back to Training Library
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleRetake}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Repeat className="w-4 h-4 mr-2" />
                      Retake Quiz
                    </Button>
                    <Button
                      onClick={() => setMode('study')}
                      variant="outline"
                      className="w-full"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Review Content
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestionIndex];
  const isCorrect = userAnswer === currentQuestion?.correct_answer;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-slate-600">
              Attempt #{attemptNumber}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{currentQuestion?.question_text}</CardTitle>
                <Badge className="mt-2">{currentQuestion?.difficulty}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={userAnswer} onValueChange={handleAnswerSelect}>
              <div className="space-y-3">
                {currentQuestion?.options?.map((option, index) => {
                  const isSelected = userAnswer === option;
                  const isCorrectOption = option === currentQuestion.correct_answer;
                  const showResult = showExplanation;

                  let optionClass = 'border-2 p-4 rounded-lg cursor-pointer transition-all hover:border-blue-300';

                  if (showResult) {
                    if (isCorrectOption) {
                      optionClass = 'border-2 border-green-500 bg-green-50 p-4 rounded-lg';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'border-2 border-red-500 bg-red-50 p-4 rounded-lg';
                    } else {
                      optionClass = 'border-2 border-slate-200 p-4 rounded-lg opacity-60';
                    }
                  } else if (isSelected) {
                    optionClass = 'border-2 border-blue-500 bg-blue-50 p-4 rounded-lg cursor-pointer';
                  }

                  return (
                    <div key={index} className={optionClass}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <RadioGroupItem value={option} id={`option-${index}`} disabled={showExplanation} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                        {showResult && isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>

            {showExplanation && (
              <Card className={isCorrect ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-orange-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-semibold ${isCorrect ? 'text-green-900' : 'text-orange-900'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite right'}
                      </p>
                      <p className={`text-sm mt-1 ${isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {!showExplanation ? (
                <Button onClick={handleCheckAnswer} className="bg-blue-600 hover:bg-blue-700">
                  Check Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Complete Training
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
