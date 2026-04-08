import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Upload, FileText, Sparkles, CheckCircle, AlertCircle,
  ChevronRight, ChevronLeft, Loader2, Edit2, Trash2, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  'Product Knowledge',
  'Objection Handling',
  'Discovery Techniques',
  'Closing Strategies',
  'Competitor Intelligence',
  'Compliance',
  'Sales Methodology',
  'Communication Skills'
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const STEPS = ['upload', 'details', 'quiz', 'review', 'complete'];

export default function TrainingUploadWizard({ open, onClose, onSuccess, currentUser }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Product Knowledge',
    difficulty_level: 'intermediate',
    estimated_time_minutes: 30,
    passing_score: 80,
    document_type: 'course',
    file_url: '',
    file_type: '',
    file_size_bytes: 0
  });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizSetName, setQuizSetName] = useState('Default Quiz');
  const [questionCount, setQuestionCount] = useState(8);
  const [useAIGeneration, setUseAIGeneration] = useState(true);
  const [createdDocumentId, setCreatedDocumentId] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ];

      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
        setFilePreview(selectedFile.name);

        setDocumentData(prev => ({
          ...prev,
          title: prev.title || selectedFile.name.replace(/\.[^/.]+$/, ''),
          file_type: fileExtension,
          file_size_bytes: selectedFile.size
        }));
      } else {
        toast.error('Please upload a valid document (PDF, DOC, DOCX, PPT, PPTX, TXT)');
      }
    }
  };

  const uploadFileToStorage = async () => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const fileName = `training_${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const extractTextFromFile = async () => {
    if (!file) return '';

    if (file.type === 'text/plain') {
      return await file.text();
    }

    return `Training content extracted from ${file.name}. This is a placeholder for the actual content that would be extracted using a PDF/document parsing library.`;
  };

  const generateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-training-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: documentData.content,
          title: documentData.title,
          difficulty: documentData.difficulty_level,
          questionCount: questionCount
        })
      });

      const result = await response.json();

      if (result.success && result.questions) {
        setQuizQuestions(result.questions);
        toast.success(`Generated ${result.questions.length} quiz questions`);
      } else {
        throw new Error(result.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Failed to generate quiz questions');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleNext = async () => {
    const step = STEPS[currentStep];

    if (step === 'upload') {
      if (!file) {
        toast.error('Please select a file to upload');
        return;
      }

      const fileUrl = await uploadFileToStorage();
      if (!fileUrl) return;

      const content = await extractTextFromFile();
      setDocumentData(prev => ({ ...prev, file_url: fileUrl, content }));
      setCurrentStep(currentStep + 1);
    } else if (step === 'details') {
      if (!documentData.title || !documentData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { data, error } = await supabase
        .from('training_documents')
        .insert({
          ...documentData,
          created_by: currentUser?.email || 'admin@effyai.com'
        })
        .select()
        .single();

      if (error) {
        console.error('Create document error:', error);
        toast.error('Failed to create training document');
        return;
      }

      setCreatedDocumentId(data.id);
      setCurrentStep(currentStep + 1);
    } else if (step === 'quiz') {
      if (useAIGeneration && quizQuestions.length === 0) {
        await generateQuiz();
      }
      setCurrentStep(currentStep + 1);
    } else if (step === 'review') {
      await saveQuizQuestions();
      setCurrentStep(currentStep + 1);
    }
  };

  const saveQuizQuestions = async () => {
    if (quizQuestions.length === 0) {
      toast.info('No quiz questions to save');
      return;
    }

    try {
      const { data: quizSet, error: setError } = await supabase
        .from('training_quiz_sets')
        .insert({
          document_id: createdDocumentId,
          version_name: quizSetName,
          description: `Quiz set for ${documentData.title}`,
          is_default: true,
          created_by: currentUser?.email || 'admin@effyai.com'
        })
        .select()
        .single();

      if (setError) throw setError;

      const questionsToInsert = quizQuestions.map((q, index) => ({
        document_id: createdDocumentId,
        quiz_set_id: quizSet.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: JSON.stringify(q.options),
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: q.points || 1,
        tags: JSON.stringify(q.tags || []),
        order_index: index,
        is_active: true
      }));

      const { error: questionsError } = await supabase
        .from('training_quiz_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast.success(`Saved ${quizQuestions.length} quiz questions`);
    } catch (error) {
      console.error('Save quiz error:', error);
      toast.error('Failed to save quiz questions');
    }
  };

  const handleComplete = () => {
    if (onSuccess) onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFile(null);
    setFilePreview('');
    setQuizQuestions([]);
    setCreatedDocumentId(null);
    setDocumentData({
      title: '',
      description: '',
      content: '',
      category: 'Product Knowledge',
      difficulty_level: 'intermediate',
      estimated_time_minutes: 30,
      passing_score: 80,
      document_type: 'course',
      file_url: '',
      file_type: '',
      file_size_bytes: 0
    });
    if (onClose) onClose();
  };

  const removeQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const editQuestion = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizQuestions(updated);
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Create Training Document
          </DialogTitle>
        </DialogHeader>

        <div className="mb-6">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-slate-600">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
        </div>

        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Upload Training Document</h3>
              <p className="text-sm text-slate-600">Upload a PDF, DOC, PPT, or text file containing your training material</p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileChange}
              />
              <label htmlFor="fileUpload" className="cursor-pointer">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                {filePreview ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">{filePreview}</p>
                    <p className="text-xs text-slate-500">{(documentData.file_size_bytes / 1024).toFixed(2)} KB</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Click to upload file</p>
                    <p className="text-xs text-slate-500">Supports PDF, DOC, DOCX, PPT, PPTX, TXT</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Training Details</h3>
              <p className="text-sm text-slate-600">Provide information about this training module</p>
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                value={documentData.title}
                onChange={(e) => setDocumentData({ ...documentData, title: e.target.value })}
                placeholder="e.g., Advanced Objection Handling Techniques"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={documentData.description}
                onChange={(e) => setDocumentData({ ...documentData, description: e.target.value })}
                placeholder="Brief description of what this training covers"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={documentData.category} onValueChange={(val) => setDocumentData({ ...documentData, category: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Difficulty Level</Label>
                <Select value={documentData.difficulty_level} onValueChange={(val) => setDocumentData({ ...documentData, difficulty_level: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map(level => (
                      <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimated Time (minutes)</Label>
                <Input
                  type="number"
                  value={documentData.estimated_time_minutes}
                  onChange={(e) => setDocumentData({ ...documentData, estimated_time_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>Passing Score (%)</Label>
                <Input
                  type="number"
                  value={documentData.passing_score}
                  onChange={(e) => setDocumentData({ ...documentData, passing_score: parseInt(e.target.value) || 80 })}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Quiz Creation</h3>
              <p className="text-sm text-slate-600">Choose how to create quiz questions for this training</p>
            </div>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={useAIGeneration}
                  onCheckedChange={setUseAIGeneration}
                  id="aiGeneration"
                />
                <div className="flex-1">
                  <label htmlFor="aiGeneration" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Generate Quiz with AI
                  </label>
                  <p className="text-xs text-slate-600 mt-1">
                    Automatically create quiz questions based on your training content
                  </p>
                </div>
              </div>
            </Card>

            {useAIGeneration && (
              <div>
                <Label>Number of Questions</Label>
                <Select value={questionCount.toString()} onValueChange={(val) => setQuestionCount(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 8, 10, 12, 15].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} Questions</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Quiz Set Name</Label>
              <Input
                value={quizSetName}
                onChange={(e) => setQuizSetName(e.target.value)}
                placeholder="e.g., Default Quiz, Version A"
              />
            </div>

            {isGeneratingQuiz && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-slate-600">Generating quiz questions...</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Review Quiz Questions</h3>
              <p className="text-sm text-slate-600">Review and edit the generated questions before saving</p>
            </div>

            {quizQuestions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No quiz questions generated. You can add questions manually later.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {quizQuestions.map((question, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium flex-1">
                        {index + 1}. {question.question_text}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-xs">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className={`pl-2 ${question.correct_answer === String.fromCharCode(65 + optIndex) ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
                      <Badge variant="outline" className="text-xs">{question.points} pt</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">Training Document Created!</h3>
            <p className="text-sm text-slate-600 mb-4">
              Your training document has been created successfully with {quizQuestions.length} quiz questions.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleComplete}>
                Done
              </Button>
              <Button variant="outline" onClick={() => window.location.href = `/TrainerBot?docId=${createdDocumentId}`}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Training
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || currentStep === 4}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < 4 && (
            <Button
              onClick={handleNext}
              disabled={isUploading || isGeneratingQuiz}
            >
              {isUploading || isGeneratingQuiz ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : currentStep === STEPS.length - 2 ? (
                <>Finish <ChevronRight className="w-4 h-4 ml-2" /></>
              ) : (
                <>Next <ChevronRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
