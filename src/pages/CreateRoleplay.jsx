import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { ArrowLeft, Upload, Plus, X, CheckCircle2, Zap, BookOpen, FileText, Target, Users, Settings, Save } from 'lucide-react';
import { createPageUrl } from '@/utils';

const steps = [
  { id: 'basic', label: 'Basic Info', icon: Zap },
  { id: 'scenario', label: 'Scenario', icon: Target },
  { id: 'personas', label: 'Personas', icon: Users },
  { id: 'materials', label: 'Materials', icon: BookOpen },
  { id: 'review', label: 'Review', icon: CheckCircle2 }
];

const PERSONALITY_TRAITS = [
  'Assertive', 'Collaborative', 'Cautious', 'Optimistic', 'Skeptical',
  'Technical', 'Non-Technical', 'Busy', 'Detailed', 'Direct',
  'Friendly', 'Formal', 'Curious', 'Risk-Averse', 'Growth-Focused'
];

const BUYING_STAGES = [
  'Problem Unaware',
  'Problem Aware',
  'Solution Aware',
  'Product Aware',
  'Ready to Buy',
  'Negotiation Phase'
];

export default function CreateRoleplay() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    difficulty: 'intermediate',
    company: '',
    context: '',
    objections: [],
    personas: [
      { name: '', title: '', traits: [], buyingStage: '', details: '' }
    ],
    materials: [],
    is_public: false
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (e) {
        console.error('Error fetching user:', e);
      }
    };
    fetchUser();
  }, []);

  const handleBasicChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonaChange = (index, field, value) => {
    const newPersonas = [...formData.personas];
    if (field === 'traits') {
      newPersonas[index][field] = value;
    } else {
      newPersonas[index][field] = value;
    }
    setFormData(prev => ({ ...prev, personas: newPersonas }));
  };

  const addPersona = () => {
    setFormData(prev => ({
      ...prev,
      personas: [...prev.personas, { name: '', title: '', traits: [], buyingStage: '', details: '' }]
    }));
  };

  const removePersona = (index) => {
    setFormData(prev => ({
      ...prev,
      personas: prev.personas.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('roleplay_materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const newFile = {
        id: Date.now(),
        name: file.name,
        storagePath: fileName,
        type: file.type,
        size: file.size
      };

      setUploadedFiles(prev => [...prev, newFile]);
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, newFile]
      }));

      toast.success('Material uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  const removeMaterial = (id) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== id)
    }));
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.personas.some(p => !p.name.trim())) {
      toast.error('Please fill in all persona names');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_clients')
        .insert([{
          name: formData.name,
          description: formData.description,
          industry: formData.industry,
          difficulty_level: formData.difficulty,
          company: formData.company,
          context: formData.context,
          objections: formData.objections,
          personas_config: formData.personas,
          materials: formData.materials,
          user_id: user.id,
          is_public: formData.is_public,
          is_scenario_template: false
        }])
        .select();

      if (error) throw error;

      toast.success('Roleplay scenario created successfully!');
      setTimeout(() => {
        navigate(createPageUrl('LetsPractice'));
      }, 1000);
    } catch (error) {
      console.error('Error saving roleplay:', error);
      toast.error('Failed to create roleplay');
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl('LetsPractice'))}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Roleplay Scenario</h1>
            <p className="text-slate-600">Build a custom scenario to practice with AI prospects</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-slate-700">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Steps */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-2">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : isCompleted
                        ? 'bg-green-100 text-green-900 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                    <span className="font-medium">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4 border-b border-slate-200">
                <CardTitle>{steps[currentStep].label}</CardTitle>
              </CardHeader>

              <CardContent className="pt-8">
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-semibold">Scenario Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Discovery Call with Tech Buyer"
                        value={formData.name}
                        onChange={(e) => handleBasicChange('name', e.target.value)}
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-semibold">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the roleplay scenario..."
                        value={formData.description}
                        onChange={(e) => handleBasicChange('description', e.target.value)}
                        rows={4}
                        className="text-base"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="font-semibold">Industry</Label>
                        <Input
                          id="industry"
                          placeholder="e.g., Technology, Finance"
                          value={formData.industry}
                          onChange={(e) => handleBasicChange('industry', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty" className="font-semibold">Difficulty Level</Label>
                        <select
                          id="difficulty"
                          value={formData.difficulty}
                          onChange={(e) => handleBasicChange('difficulty', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="font-semibold">Company Name</Label>
                      <Input
                        id="company"
                        placeholder="Prospect's company"
                        value={formData.company}
                        onChange={(e) => handleBasicChange('company', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Scenario Context */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="context" className="font-semibold">Scenario Context *</Label>
                      <p className="text-sm text-slate-600 mb-2">
                        Describe the situation. What is the conversation about? What should the AI know about the prospect?
                      </p>
                      <Textarea
                        id="context"
                        placeholder="e.g., You are calling Sarah Johnson, CTO at TechCorp. She recently attended your webinar on AI automation..."
                        value={formData.context}
                        onChange={(e) => handleBasicChange('context', e.target.value)}
                        rows={6}
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objections" className="font-semibold">Common Objections</Label>
                      <p className="text-sm text-slate-600 mb-2">
                        Enter objections (one per line) that the AI might raise
                      </p>
                      <Textarea
                        id="objections"
                        placeholder="We already have a solution in place
Our budget is frozen
We need to evaluate more options
Can you send me information?"
                        value={formData.objections.join('\n')}
                        onChange={(e) => handleBasicChange('objections', e.target.value.split('\n').filter(o => o.trim()))}
                        rows={5}
                        className="text-base font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Personas */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-600 mb-4">
                      Create the personas that users will practice with
                    </p>

                    {formData.personas.map((persona, idx) => (
                      <Card key={idx} className="border border-slate-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Persona {idx + 1}</h4>
                            {formData.personas.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePersona(idx)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="font-medium">Name *</Label>
                              <Input
                                placeholder="e.g., Sarah Johnson"
                                value={persona.name}
                                onChange={(e) => handlePersonaChange(idx, 'name', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-medium">Title</Label>
                              <Input
                                placeholder="e.g., CTO"
                                value={persona.title}
                                onChange={(e) => handlePersonaChange(idx, 'title', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="font-medium">Personality Traits</Label>
                            <div className="flex flex-wrap gap-2">
                              {PERSONALITY_TRAITS.map(trait => (
                                <Badge
                                  key={trait}
                                  variant={persona.traits.includes(trait) ? 'default' : 'outline'}
                                  onClick={() => {
                                    const newTraits = persona.traits.includes(trait)
                                      ? persona.traits.filter(t => t !== trait)
                                      : [...persona.traits, trait];
                                    handlePersonaChange(idx, 'traits', newTraits);
                                  }}
                                  className="cursor-pointer"
                                >
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="font-medium">Buying Stage</Label>
                            <select
                              value={persona.buyingStage}
                              onChange={(e) => handlePersonaChange(idx, 'buyingStage', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select a stage...</option>
                              {BUYING_STAGES.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label className="font-medium">Additional Details</Label>
                            <Textarea
                              placeholder="Any additional details about this persona..."
                              value={persona.details}
                              onChange={(e) => handlePersonaChange(idx, 'details', e.target.value)}
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      onClick={addPersona}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Persona
                    </Button>
                  </div>
                )}

                {/* Step 4: Materials */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Upload Learning Materials (Optional)</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Add documents, presentations, or guides. Users can review before practicing.
                      </p>

                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('file-upload').click()}>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="font-medium text-slate-700">Click to upload materials</p>
                        <p className="text-sm text-slate-600">PDF, DOC, PPT (max 10MB)</p>
                      </div>

                      <input
                        id="file-upload"
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                        onChange={handleFileUpload}
                        disabled={loading}
                      />
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Uploaded Materials</h4>
                        {uploadedFiles.map(file => (
                          <Card key={file.id} className="border-slate-200">
                            <CardContent className="flex items-center justify-between py-3">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-sm">{file.name}</p>
                                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMaterial(file.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Review Your Scenario</h3>

                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <p className="text-sm font-medium text-slate-700">Scenario Name</p>
                          <p className="text-lg font-bold text-slate-900">{formData.name}</p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium text-slate-700">Description</p>
                          <p className="text-slate-700">{formData.description}</p>
                        </div>

                        {formData.industry && (
                          <div className="border rounded-lg p-4">
                            <p className="text-sm font-medium text-slate-700">Industry</p>
                            <p className="text-slate-700">{formData.industry}</p>
                          </div>
                        )}

                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium text-slate-700 mb-2">Personas ({formData.personas.length})</p>
                          <div className="space-y-2">
                            {formData.personas.map((p, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">{p.name}</span> - {p.title || 'Unknown Title'}
                              </div>
                            ))}
                          </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                          <div className="border rounded-lg p-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">Materials ({uploadedFiles.length})</p>
                            <div className="space-y-1">
                              {uploadedFiles.map(f => (
                                <p key={f.id} className="text-sm text-slate-600">• {f.name}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex-1"
              >
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Scenario'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
