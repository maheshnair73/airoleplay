import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  AlertTriangle,
  Mic,
  Video,
  Monitor,
  Send,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function CertificationTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadTestAndAttempt();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopMediaRecording();
    };
  }, [id]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [timeRemaining]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (attempt && Object.keys(answers).length > 0) {
        autoSaveAnswers();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [answers, attempt]);

  const loadTestAndAttempt = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: testData, error: testError } = await supabase
        .from('certification_tests')
        .select('*')
        .eq('id', id)
        .single();

      if (testError) throw testError;

      const { data: questionsData, error: questionsError } = await supabase
        .from('certification_questions')
        .select('*')
        .eq('certification_id', id)
        .order('order_index');

      if (questionsError) throw questionsError;

      const { data: existingAttempt, error: attemptCheckError } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('certification_id', id)
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .single();

      let attemptData;
      if (existingAttempt) {
        attemptData = existingAttempt;
        setAnswers(existingAttempt.answers || {});
        if (existingAttempt.time_spent && testData.time_limit_minutes) {
          const remainingSeconds = (testData.time_limit_minutes * 60) - existingAttempt.time_spent;
          setTimeRemaining(Math.max(0, remainingSeconds));
        }
      } else {
        const { data: newAttempt, error: createError } = await supabase
          .from('certification_attempts')
          .insert({
            certification_id: id,
            user_id: user.id,
            status: 'in_progress',
            answers: {},
            time_spent: 0,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        attemptData = newAttempt;

        if (testData.time_limit_minutes) {
          setTimeRemaining(testData.time_limit_minutes * 60);
        }
      }

      setTest(testData);
      setQuestions(questionsData);
      setAttempt(attemptData);
    } catch (error) {
      console.error('Error loading test:', error);
      toast.error('Failed to load certification test');
      navigate('/certify-hub');
    } finally {
      setLoading(false);
    }
  };

  const autoSaveAnswers = async () => {
    if (!attempt || autoSaving) return;

    setAutoSaving(true);
    try {
      const timeSpent = test.time_limit_minutes
        ? (test.time_limit_minutes * 60 - timeRemaining)
        : Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);

      const { error } = await supabase
        .from('certification_attempts')
        .update({
          answers,
          time_spent: timeSpent,
          updated_at: new Date().toISOString()
        })
        .eq('id', attempt.id);

      if (error) throw error;
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const startAudioRecording = async (questionId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        handleAnswerChange(questionId, { type: 'audio', url: audioUrl, blob });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordedChunks(chunks);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      toast.error('Failed to start audio recording');
    }
  };

  const startVideoRecording = async (questionId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        handleAnswerChange(questionId, { type: 'video', url: videoUrl, blob });
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordedChunks(chunks);
    } catch (error) {
      console.error('Error starting video recording:', error);
      toast.error('Failed to start video recording');
    }
  };

  const startScreenRecording = async (questionId) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        handleAnswerChange(questionId, { type: 'screen', url: videoUrl, blob });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordedChunks(chunks);
    } catch (error) {
      console.error('Error starting screen recording:', error);
      toast.error('Failed to start screen recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const stopMediaRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const handleAutoSubmit = async () => {
    toast.warning('Time is up! Submitting your test...');
    await submitTest();
  };

  const submitTest = async () => {
    try {
      setLoading(true);
      await autoSaveAnswers();

      const timeSpent = test.time_limit_minutes
        ? (test.time_limit_minutes * 60 - timeRemaining)
        : Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);

      const { error } = await supabase
        .from('certification_attempts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          time_spent: timeSpent
        })
        .eq('id', attempt.id);

      if (error) throw error;

      toast.success('Test submitted successfully!');
      navigate(`/certification-results/${attempt.id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Failed to submit test');
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Test not found or has no questions</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{test.name}</h1>
          <p className="text-muted-foreground">{test.description}</p>
        </div>
        {timeRemaining !== null && (
          <Card className={timeRemaining < 300 ? 'border-red-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${timeRemaining < 300 ? 'text-red-500' : 'text-primary'}`} />
                <span className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {answeredCount} answered
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {autoSaving && (
        <Alert className="mb-4">
          <Save className="h-4 w-4" />
          <AlertDescription>Auto-saving your progress...</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">
                {currentQuestion.question_text}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={currentAnswer ? 'default' : 'outline'}>
                  {currentQuestion.question_type}
                </Badge>
                <Badge variant="secondary">
                  {currentQuestion.points} points
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.question_type === 'multiple_choice' && (
            <RadioGroup
              value={currentAnswer}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.question_type === 'text' && (
            <Textarea
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Type your answer here..."
              rows={8}
              className="resize-none"
            />
          )}

          {currentQuestion.question_type === 'audio' && (
            <div className="space-y-4">
              {!currentAnswer && !recording && (
                <Button
                  onClick={() => startAudioRecording(currentQuestion.id)}
                  className="w-full"
                  size="lg"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Audio Recording
                </Button>
              )}

              {recording && (
                <div className="space-y-4">
                  <Alert>
                    <Mic className="h-4 w-4 animate-pulse" />
                    <AlertDescription>Recording in progress...</AlertDescription>
                  </Alert>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    Stop Recording
                  </Button>
                </div>
              )}

              {currentAnswer?.type === 'audio' && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>Audio response recorded</AlertDescription>
                  </Alert>
                  <audio controls src={currentAnswer.url} className="w-full" />
                  <Button
                    onClick={() => {
                      handleAnswerChange(currentQuestion.id, null);
                      setRecording(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Re-record
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentQuestion.question_type === 'video' && (
            <div className="space-y-4">
              {recording && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full rounded-lg border"
                />
              )}

              {!currentAnswer && !recording && (
                <Button
                  onClick={() => startVideoRecording(currentQuestion.id)}
                  className="w-full"
                  size="lg"
                >
                  <Video className="mr-2 h-5 w-5" />
                  Start Video Recording
                </Button>
              )}

              {recording && (
                <div className="space-y-4">
                  <Alert>
                    <Video className="h-4 w-4 animate-pulse" />
                    <AlertDescription>Recording in progress...</AlertDescription>
                  </Alert>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    Stop Recording
                  </Button>
                </div>
              )}

              {currentAnswer?.type === 'video' && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>Video response recorded</AlertDescription>
                  </Alert>
                  <video controls src={currentAnswer.url} className="w-full rounded-lg border" />
                  <Button
                    onClick={() => {
                      handleAnswerChange(currentQuestion.id, null);
                      setRecording(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Re-record
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentQuestion.question_type === 'demo' && (
            <div className="space-y-4">
              {!currentAnswer && !recording && (
                <Button
                  onClick={() => startScreenRecording(currentQuestion.id)}
                  className="w-full"
                  size="lg"
                >
                  <Monitor className="mr-2 h-5 w-5" />
                  Start Screen Recording
                </Button>
              )}

              {recording && (
                <div className="space-y-4">
                  <Alert>
                    <Monitor className="h-4 w-4 animate-pulse" />
                    <AlertDescription>Screen recording in progress...</AlertDescription>
                  </Alert>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    Stop Recording
                  </Button>
                </div>
              )}

              {currentAnswer?.type === 'screen' && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>Screen recording completed</AlertDescription>
                  </Alert>
                  <video controls src={currentAnswer.url} className="w-full rounded-lg border" />
                  <Button
                    onClick={() => {
                      handleAnswerChange(currentQuestion.id, null);
                      setRecording(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Re-record
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {questions.map((q, index) => (
            <Button
              key={q.id}
              variant={index === currentQuestionIndex ? 'default' : answers[q.id] ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setCurrentQuestionIndex(index)}
              className="w-10"
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={submitTest}
            disabled={answeredCount < questions.length}
            size="lg"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Test
          </Button>
        )}
      </div>

      {answeredCount < questions.length && currentQuestionIndex === questions.length - 1 && (
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {questions.length - answeredCount} unanswered question(s).
            Please answer all questions before submitting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
