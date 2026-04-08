import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ListChecks, Plus, Edit2, Trash2, Save, X, GripVertical,
  ArrowLeft, Sparkles, Download, Upload as UploadIcon, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { createPageUrl } from '@/utils';

export default function ManageQuestions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('docId');

  const [document, setDocument] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [quizSets, setQuizSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 'A',
    explanation: '',
    difficulty: 'medium',
    points: 1,
    tags: []
  });

  useEffect(() => {
    if (documentId) {
      loadData();
    }
  }, [documentId]);

  useEffect(() => {
    if (selectedSetId) {
      loadQuestions(selectedSetId);
    }
  }, [selectedSetId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: docData, error: docError } = await supabase
        .from('training_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError) throw docError;
      setDocument(docData);

      const { data: setsData, error: setsError } = await supabase
        .from('training_quiz_sets')
        .select('*')
        .eq('document_id', documentId)
        .order('created_date', { ascending: false });

      if (setsError) throw setsError;
      setQuizSets(setsData || []);

      if (setsData && setsData.length > 0) {
        const defaultSet = setsData.find(s => s.is_default) || setsData[0];
        setSelectedSetId(defaultSet.id);
      }
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Failed to load training document');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = async (setId) => {
    try {
      const { data, error } = await supabase
        .from('training_quiz_questions')
        .select('*')
        .eq('quiz_set_id', setId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      const parsedQuestions = data.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        tags: typeof q.tags === 'string' ? JSON.parse(q.tags) : q.tags
      }));

      setQuestions(parsedQuestions);
    } catch (error) {
      console.error('Load questions error:', error);
      toast.error('Failed to load questions');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question_text || newQuestion.options.some(opt => !opt)) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('training_quiz_questions')
        .insert({
          document_id: documentId,
          quiz_set_id: selectedSetId,
          question_text: newQuestion.question_text,
          question_type: 'multiple_choice',
          options: JSON.stringify(newQuestion.options),
          correct_answer: newQuestion.correct_answer,
          explanation: newQuestion.explanation,
          difficulty: newQuestion.difficulty,
          points: newQuestion.points,
          tags: JSON.stringify(newQuestion.tags),
          order_index: questions.length,
          is_active: true
        });

      if (error) throw error;

      toast.success('Question added successfully');
      setShowAddModal(false);
      setNewQuestion({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 'A',
        explanation: '',
        difficulty: 'medium',
        points: 1,
        tags: []
      });
      loadQuestions(selectedSetId);
    } catch (error) {
      console.error('Add question error:', error);
      toast.error('Failed to add question');
    }
  };

  const handleUpdateQuestion = async (questionId, updates) => {
    try {
      const { error } = await supabase
        .from('training_quiz_questions')
        .update({
          ...updates,
          options: typeof updates.options === 'object' ? JSON.stringify(updates.options) : updates.options,
          tags: typeof updates.tags === 'object' ? JSON.stringify(updates.tags) : updates.tags
        })
        .eq('id', questionId);

      if (error) throw error;

      toast.success('Question updated');
      loadQuestions(selectedSetId);
    } catch (error) {
      console.error('Update question error:', error);
      toast.error('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('training_quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast.success('Question deleted');
      loadQuestions(selectedSetId);
    } catch (error) {
      console.error('Delete question error:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!document.content) {
      toast.error('No content available to generate quiz from');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-training-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: documentId,
          content: document.content,
          title: document.title,
          difficulty: document.difficulty_level,
          questionCount: 8
        })
      });

      const result = await response.json();

      if (result.success && result.questions) {
        const questionsToInsert = result.questions.map((q, index) => ({
          document_id: documentId,
          quiz_set_id: selectedSetId,
          question_text: q.question_text,
          question_type: q.question_type,
          options: JSON.stringify(q.options),
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          points: q.points || 1,
          tags: JSON.stringify(q.tags || []),
          order_index: questions.length + index,
          is_active: true
        }));

        const { error } = await supabase
          .from('training_quiz_questions')
          .insert(questionsToInsert);

        if (error) throw error;

        toast.success(`Generated ${result.questions.length} new questions`);
        loadQuestions(selectedSetId);
      } else {
        throw new Error(result.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Generate quiz error:', error);
      toast.error('Failed to generate quiz questions');
    }
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
        <div className="text-center">
          <p className="text-slate-600">Training document not found</p>
          <Button onClick={() => navigate(createPageUrl('TrainingLibrary'))} className="mt-4">
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('TrainingLibrary'))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <ListChecks className="w-8 h-8 text-blue-600" />
                Manage Questions
              </h1>
              <p className="text-slate-600 mt-1">{document.title}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerateQuiz}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate More
              </Button>
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={newQuestion.question_text}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                        placeholder="Enter your question..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Answer Options</Label>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm font-medium w-6">{String.fromCharCode(65 + index)}.</span>
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options];
                                newOptions[index] = e.target.value;
                                setNewQuestion({ ...newQuestion, options: newOptions });
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Correct Answer</Label>
                        <Select value={newQuestion.correct_answer} onValueChange={(val) => setNewQuestion({ ...newQuestion, correct_answer: val })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Difficulty</Label>
                        <Select value={newQuestion.difficulty} onValueChange={(val) => setNewQuestion({ ...newQuestion, difficulty: val })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Explanation</Label>
                      <Textarea
                        value={newQuestion.explanation}
                        onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                        placeholder="Explain why this answer is correct..."
                        rows={2}
                      />
                    </div>

                    <Button onClick={handleAddQuestion} className="w-full">
                      Add Question
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {quizSets.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Quiz Set</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quizSets.map(set => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.version_name} {set.is_default && '(Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-slate-500">
                <ListChecks className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">No questions yet</p>
                <p className="text-sm mt-1">Add questions manually or use AI to generate them</p>
                <div className="flex justify-center gap-2 mt-4">
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                  <Button variant="outline" onClick={handleGenerateQuiz}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <GripVertical className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-base font-medium flex-1">
                          {index + 1}. {question.question_text}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                          >
                            {editingIndex === index ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`flex items-start gap-2 text-sm p-2 rounded ${
                              question.correct_answer === String.fromCharCode(65 + optIndex)
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-slate-50'
                            }`}
                          >
                            {question.correct_answer === String.fromCharCode(65 + optIndex) && (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            )}
                            <span className="font-medium w-6">{String.fromCharCode(65 + optIndex)}.</span>
                            <span className="flex-1">{option}</span>
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm mb-3">
                          <p className="font-medium text-blue-900 mb-1">Explanation:</p>
                          <p className="text-blue-800">{question.explanation}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{question.difficulty}</Badge>
                        <Badge variant="outline">{question.points} point{question.points !== 1 && 's'}</Badge>
                        {question.tags && question.tags.length > 0 && question.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
