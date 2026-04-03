import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Award,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateCertification() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [testData, setTestData] = useState({
    name: '',
    description: '',
    category: 'sales',
    difficulty: 'intermediate',
    time_limit_minutes: 60,
    passing_score: 70,
    retake_allowed: true,
    badge_icon: 'trophy',
    badge_color: 'blue',
    is_active: true
  });
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 10,
        evaluation_criteria: {},
        order_index: questions.length
      }
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const saveTest = async () => {
    if (!testData.name) {
      toast.error('Please enter a test name');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    const invalidQuestions = questions.filter(q => !q.question_text || q.points <= 0);
    if (invalidQuestions.length > 0) {
      toast.error('Please complete all question details');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: test, error: testError } = await supabase
        .from('certification_tests')
        .insert({
          ...testData,
          created_by: user.id
        })
        .select()
        .single();

      if (testError) throw testError;

      const questionsToInsert = questions.map((q, index) => ({
        ...q,
        certification_id: test.id,
        order_index: index
      }));

      const { error: questionsError } = await supabase
        .from('certification_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast.success('Certification test created successfully!');
      navigate('/certify-hub');
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error('Failed to save certification test');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/certify-hub')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Certify Hub
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Create Certification Test</h1>
          <p className="text-muted-foreground">
            Build a comprehensive certification test for your team
          </p>
        </div>
        <Award className="h-12 w-12 text-blue-500" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Test Name *</Label>
            <Input
              value={testData.name}
              onChange={(e) => setTestData({ ...testData, name: e.target.value })}
              placeholder="e.g., Sales Professional Certification"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={testData.description}
              onChange={(e) => setTestData({ ...testData, description: e.target.value })}
              placeholder="Describe what this certification covers..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={testData.category}
                onValueChange={(value) => setTestData({ ...testData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="product">Product Knowledge</SelectItem>
                  <SelectItem value="customer_service">Customer Service</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={testData.difficulty}
                onValueChange={(value) => setTestData({ ...testData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Limit (minutes)</Label>
              <Input
                type="number"
                value={testData.time_limit_minutes}
                onChange={(e) => setTestData({ ...testData, time_limit_minutes: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Passing Score (%)</Label>
              <Input
                type="number"
                value={testData.passing_score}
                onChange={(e) => setTestData({ ...testData, passing_score: parseInt(e.target.value) })}
                min="0"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions ({questions.length})</CardTitle>
            <Button onClick={addQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Badge>Question {index + 1}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Question Text *</Label>
                <Textarea
                  value={question.question_text}
                  onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                  placeholder="Enter your question..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={question.question_type}
                    onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="text">Text Response</SelectItem>
                      <SelectItem value="audio">Audio Response</SelectItem>
                      <SelectItem value="video">Video Response</SelectItem>
                      <SelectItem value="demo">Product Demo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={question.points}
                    onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              {question.question_type === 'multiple_choice' && (
                <div className="space-y-4">
                  <Label>Options</Label>
                  {question.options.map((option, optionIndex) => (
                    <Input
                      key={optionIndex}
                      value={option}
                      onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                  ))}

                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select
                      value={question.correct_answer}
                      onValueChange={(value) => updateQuestion(index, 'correct_answer', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.filter(opt => opt).map((option, i) => (
                          <SelectItem key={i} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {(question.question_type !== 'multiple_choice') && (
                <div className="space-y-2">
                  <Label>Evaluation Criteria</Label>
                  <Textarea
                    value={question.evaluation_criteria?.description || ''}
                    onChange={(e) => updateQuestion(index, 'evaluation_criteria', {
                      ...question.evaluation_criteria,
                      description: e.target.value
                    })}
                    placeholder="What should the evaluator look for in the response?"
                    rows={2}
                  />
                </div>
              )}

              <Separator />
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No questions added yet</p>
              <Button onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/certify-hub')}
        >
          Cancel
        </Button>
        <Button onClick={saveTest} disabled={saving}>
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Certification Test
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
