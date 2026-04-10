import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Award,
  FileText,
  Mic,
  Video,
  Monitor,
  CheckSquare,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
  { value: 'sales', label: 'Sales', color: 'bg-blue-100 text-blue-700' },
  { value: 'product', label: 'Product Knowledge', color: 'bg-teal-100 text-teal-700' },
  { value: 'customer_service', label: 'Customer Service', color: 'bg-green-100 text-green-700' },
  { value: 'technical', label: 'Technical', color: 'bg-slate-100 text-slate-700' },
  { value: 'leadership', label: 'Leadership', color: 'bg-amber-100 text-amber-700' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-amber-100 text-amber-700' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-700' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-700' },
];

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare, desc: 'Select one correct answer' },
  { value: 'text', label: 'Text Response', icon: FileText, desc: 'Written answer' },
  { value: 'audio', label: 'Audio Response', icon: Mic, desc: 'Spoken answer' },
  { value: 'video', label: 'Video Response', icon: Video, desc: 'Video presentation' },
  { value: 'demo', label: 'Product Demo', icon: Monitor, desc: 'Live product walkthrough' },
];

function QuestionTypeIcon({ type, className = '' }) {
  const found = QUESTION_TYPES.find(t => t.value === type);
  const Icon = found?.icon || FileText;
  return <Icon className={className} />;
}

function StepBadge({ step, label, active, done }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'opacity-100' : done ? 'opacity-60' : 'opacity-30'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-amber-500 text-white' : done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
        {done ? '✓' : step}
      </div>
      <span className={`text-sm font-medium hidden sm:block ${active ? 'text-slate-800' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}

export default function CreateCertification() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
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
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const addQuestion = () => {
    const newQ = {
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 10,
      evaluation_criteria: {},
      order_index: questions.length
    };
    setQuestions([...questions, newQ]);
    setExpandedQuestion(questions.length);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (expandedQuestion === index) setExpandedQuestion(null);
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

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

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
        .insert({ ...testData, created_by: user.id })
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

  const selectedCategory = CATEGORY_OPTIONS.find(c => c.value === testData.category);
  const selectedDifficulty = DIFFICULTY_OPTIONS.find(d => d.value === testData.difficulty);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/certify-hub')}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-5 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-800">Create Certification Test</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3">
                <StepBadge step={1} label="Configuration" active={activeStep === 1} done={activeStep > 1} />
                <div className="w-8 h-px bg-slate-300" />
                <StepBadge step={2} label="Questions" active={activeStep === 2} done={activeStep > 2} />
                <div className="w-8 h-px bg-slate-300" />
                <StepBadge step={3} label="Review" active={activeStep === 3} done={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
                    <h2 className="font-semibold text-slate-800 text-lg">Test Configuration</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Define the basics of your certification test</p>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">Test Name <span className="text-red-400">*</span></Label>
                      <Input
                        value={testData.name}
                        onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                        placeholder="e.g., Sales Professional Certification"
                        className="border-slate-200 focus:border-amber-400 focus:ring-amber-400/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">Description</Label>
                      <Textarea
                        value={testData.description}
                        onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                        placeholder="Describe what this certification covers and who it's for..."
                        rows={3}
                        className="border-slate-200 focus:border-amber-400 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700">Category</Label>
                        <Select
                          value={testData.category}
                          onValueChange={(value) => setTestData({ ...testData, category: value })}
                        >
                          <SelectTrigger className="border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700">Difficulty</Label>
                        <Select
                          value={testData.difficulty}
                          onValueChange={(value) => setTestData({ ...testData, difficulty: value })}
                        >
                          <SelectTrigger className="border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTY_OPTIONS.map(d => (
                              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Scoring & Rules</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          Time Limit (minutes)
                        </Label>
                        <Input
                          type="number"
                          value={testData.time_limit_minutes}
                          onChange={(e) => setTestData({ ...testData, time_limit_minutes: parseInt(e.target.value) })}
                          className="border-slate-200"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-slate-400" />
                          Passing Score (%)
                        </Label>
                        <Input
                          type="number"
                          value={testData.passing_score}
                          onChange={(e) => setTestData({ ...testData, passing_score: parseInt(e.target.value) })}
                          min="0"
                          max="100"
                          className="border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-slate-100">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => setTestData({ ...testData, retake_allowed: !testData.retake_allowed })}
                          className={`w-10 h-6 rounded-full transition-colors relative ${testData.retake_allowed ? 'bg-amber-500' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${testData.retake_allowed ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Allow Retakes</p>
                          <p className="text-xs text-slate-400">Users can retake this test if they fail</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setActiveStep(2)}
                    disabled={!testData.name}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                  >
                    Continue to Questions
                    <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg]" />
                  </Button>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-800 text-lg">Questions</h2>
                      <p className="text-sm text-slate-500 mt-0.5">{questions.length} question{questions.length !== 1 ? 's' : ''} · {totalPoints} total points</p>
                    </div>
                    <button
                      onClick={addQuestion}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Question
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {questions.map((question, index) => (
                      <div key={index} className="group">
                        <div
                          className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                        >
                          <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${question.question_text ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${question.question_text ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                              {question.question_text || 'Untitled question — click to edit'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <QuestionTypeIcon type={question.question_type} className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-400">{QUESTION_TYPES.find(t => t.value === question.question_type)?.label}</span>
                              <span className="text-xs text-slate-300">·</span>
                              <span className="text-xs text-slate-400">{question.points} pts</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); removeQuestion(index); }}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {expandedQuestion === index ? <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />}
                        </div>

                        {expandedQuestion === index && (
                          <div className="px-6 pb-6 bg-slate-50/50 space-y-4 border-t border-slate-100">
                            <div className="pt-4 space-y-1.5">
                              <Label className="text-sm font-medium text-slate-700">Question Text <span className="text-red-400">*</span></Label>
                              <Textarea
                                value={question.question_text}
                                onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                                placeholder="Enter your question..."
                                rows={2}
                                className="border-slate-200 resize-none bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700">Question Type</Label>
                                <Select
                                  value={question.question_type}
                                  onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                                >
                                  <SelectTrigger className="border-slate-200 bg-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {QUESTION_TYPES.map(t => (
                                      <SelectItem key={t.value} value={t.value}>
                                        <div className="flex items-center gap-2">
                                          <t.icon className="h-3.5 w-3.5" />
                                          {t.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700">Points</Label>
                                <Input
                                  type="number"
                                  value={question.points}
                                  onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                                  min="1"
                                  className="border-slate-200 bg-white"
                                />
                              </div>
                            </div>

                            {question.question_type === 'multiple_choice' && (
                              <div className="space-y-3">
                                <Label className="text-sm font-medium text-slate-700">Answer Options</Label>
                                <div className="space-y-2">
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-500 flex-shrink-0">
                                        {String.fromCharCode(65 + optionIndex)}
                                      </div>
                                      <Input
                                        value={option}
                                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                        className={`border-slate-200 bg-white text-sm ${option === question.correct_answer ? 'border-green-400 bg-green-50' : ''}`}
                                      />
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-sm font-medium text-slate-700">Correct Answer</Label>
                                  <Select
                                    value={question.correct_answer}
                                    onValueChange={(value) => updateQuestion(index, 'correct_answer', value)}
                                  >
                                    <SelectTrigger className="border-slate-200 bg-white">
                                      <SelectValue placeholder="Select the correct answer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {question.options.filter(opt => opt).map((option, i) => (
                                        <SelectItem key={i} value={option}>{option}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}

                            {question.question_type !== 'multiple_choice' && (
                              <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-slate-700">Evaluation Criteria</Label>
                                <Textarea
                                  value={question.evaluation_criteria?.description || ''}
                                  onChange={(e) => updateQuestion(index, 'evaluation_criteria', {
                                    ...question.evaluation_criteria,
                                    description: e.target.value
                                  })}
                                  placeholder="What should the evaluator look for in the response?"
                                  rows={2}
                                  className="border-slate-200 resize-none bg-white"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {questions.length === 0 && (
                      <div className="py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-600 mb-1">No questions yet</p>
                        <p className="text-sm text-slate-400 mb-5">Add questions to build your certification test</p>
                        <button
                          onClick={addQuestion}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Your First Question
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Configuration
                  </button>
                  <Button
                    onClick={() => setActiveStep(3)}
                    disabled={questions.length === 0}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                  >
                    Review & Publish
                    <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg]" />
                  </Button>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-green-50 to-white">
                    <h2 className="font-semibold text-slate-800 text-lg">Review & Publish</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Confirm your test details before publishing</p>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Test Name</p>
                        <p className="font-semibold text-slate-800">{testData.name || '—'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Category</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${selectedCategory?.color}`}>
                          {selectedCategory?.label}
                        </span>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Questions</p>
                        <p className="font-semibold text-slate-800">{questions.length} questions · {totalPoints} pts total</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Passing Score</p>
                        <p className="font-semibold text-slate-800">{testData.passing_score}% minimum</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Time Limit</p>
                        <p className="font-semibold text-slate-800">{testData.time_limit_minutes} minutes</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Difficulty</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${selectedDifficulty?.color}`}>
                          {selectedDifficulty?.label}
                        </span>
                      </div>
                    </div>

                    {testData.description && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Description</p>
                        <p className="text-sm text-slate-700">{testData.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Questions
                  </button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/certify-hub')}
                      className="border-slate-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveTest}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Publishing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Publish Test
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
              <h3 className="font-semibold text-slate-800 mb-4 text-sm">Test Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Questions</span>
                  <span className="font-semibold text-slate-800">{questions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total Points</span>
                  <span className="font-semibold text-slate-800">{totalPoints}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Passing Score</span>
                  <span className="font-semibold text-slate-800">{testData.passing_score}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Time Limit</span>
                  <span className="font-semibold text-slate-800">{testData.time_limit_minutes}m</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Category</span>
                    {selectedCategory && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedCategory.color}`}>
                        {selectedCategory.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Difficulty</span>
                  {selectedDifficulty && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedDifficulty.color}`}>
                      {selectedDifficulty.label}
                    </span>
                  )}
                </div>
              </div>

              {questions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Question Types</p>
                  <div className="space-y-1">
                    {Object.entries(
                      questions.reduce((acc, q) => {
                        acc[q.question_type] = (acc[q.question_type] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <QuestionTypeIcon type={type} className="h-3 w-3" />
                          {QUESTION_TYPES.find(t => t.value === type)?.label}
                        </div>
                        <span className="font-medium text-slate-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className={`w-2 h-2 rounded-full ${testData.name ? 'bg-green-400' : 'bg-slate-300'}`} />
                  Test name set
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                  <div className={`w-2 h-2 rounded-full ${questions.length > 0 ? 'bg-green-400' : 'bg-slate-300'}`} />
                  At least 1 question
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                  <div className={`w-2 h-2 rounded-full ${questions.every(q => q.question_text) && questions.length > 0 ? 'bg-green-400' : 'bg-slate-300'}`} />
                  All questions complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
