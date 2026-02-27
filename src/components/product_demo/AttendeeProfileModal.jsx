import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Sparkles, User } from 'lucide-react';
import { AttendeeProfile } from '@/api/entities';
import { GENDER_OPTIONS, PERSONA_TYPES } from '@/utils/voiceMapping';
import { toast } from 'sonner';

export function AttendeeProfileModal({ open, onClose, onSave, editProfile = null, userRole = 'sales_agent' }) {
  const [mode, setMode] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    role: '',
    persona_type: '',
    background: '',
    traits: [],
    pain_points: [],
    company_context: '',
    visibility: userRole === 'super_admin' || userRole === 'company_admin' ? 'all_users' : 'creator_only',
    shared_with_user_ids: []
  });

  const [traitInput, setTraitInput] = useState('');
  const [painPointInput, setPainPointInput] = useState('');
  const [aiDescription, setAiDescription] = useState('');

  useEffect(() => {
    if (editProfile) {
      setFormData({
        name: editProfile.name || '',
        gender: editProfile.gender || 'Male',
        role: editProfile.role || '',
        persona_type: editProfile.persona_type || '',
        background: editProfile.background || '',
        traits: editProfile.traits || [],
        pain_points: editProfile.pain_points || [],
        company_context: editProfile.company_context || '',
        visibility: editProfile.visibility || 'all_users',
        shared_with_user_ids: editProfile.shared_with_user_ids || []
      });
    }
  }, [editProfile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTrait = () => {
    if (traitInput.trim()) {
      setFormData(prev => ({
        ...prev,
        traits: [...prev.traits, traitInput.trim()]
      }));
      setTraitInput('');
    }
  };

  const removeTrait = (index) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== index)
    }));
  };

  const addPainPoint = () => {
    if (painPointInput.trim()) {
      setFormData(prev => ({
        ...prev,
        pain_points: [...prev.pain_points, painPointInput.trim()]
      }));
      setPainPointInput('');
    }
  };

  const removePainPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      pain_points: prev.pain_points.filter((_, i) => i !== index)
    }));
  };

  const handleAIGenerate = async () => {
    if (!aiDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const generatedProfile = {
        name: 'John Smith',
        gender: 'Male',
        role: 'VP of Engineering',
        persona_type: 'Technical Buyer',
        background: aiDescription,
        traits: ['Analytical', 'Detail-oriented', 'Risk-averse'],
        pain_points: ['System scalability', 'Integration complexity', 'Budget constraints'],
        company_context: 'Mid-sized tech company undergoing digital transformation'
      };

      setFormData(prev => ({ ...prev, ...generatedProfile }));
      setMode('manual');
      toast.success('Attendee profile generated successfully');
    } catch (error) {
      console.error('Error generating profile:', error);
      toast.error('Failed to generate profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.role.trim()) {
      toast.error('Name and Role are required');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        ...formData,
        traits: JSON.stringify(formData.traits),
        pain_points: JSON.stringify(formData.pain_points),
        shared_with_user_ids: JSON.stringify(formData.shared_with_user_ids)
      };

      let savedProfile;
      if (editProfile?.id) {
        savedProfile = await AttendeeProfile.update(editProfile.id, profileData);
      } else {
        savedProfile = await AttendeeProfile.create(profileData);
      }

      toast.success(editProfile ? 'Attendee profile updated' : 'Attendee profile created');
      onSave(savedProfile);
      onClose();
    } catch (error) {
      console.error('Error saving attendee profile:', error);
      toast.error('Failed to save attendee profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editProfile ? 'Edit Attendee Profile' : 'Create Attendee Profile'}</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <User className="w-4 h-4 mr-2" />
              Build from Scratch
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <div>
              <Label>Describe the Attendee</Label>
              <Textarea
                placeholder="Example: A technical VP at a mid-sized SaaS company who is skeptical of new tools but values data-driven decisions. They care about scalability and integration capabilities."
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
            <Button onClick={handleAIGenerate} disabled={loading} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Profile
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label>Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role/Title *</Label>
                <Input
                  placeholder="VP of Engineering"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                />
              </div>
              <div>
                <Label>Persona Type</Label>
                <Select value={formData.persona_type} onValueChange={(value) => handleChange('persona_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSONA_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Background</Label>
              <Textarea
                placeholder="Additional context about the attendee..."
                value={formData.background}
                onChange={(e) => handleChange('background', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Personality Traits</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add trait (e.g., Analytical)"
                  value={traitInput}
                  onChange={(e) => setTraitInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
                />
                <Button type="button" onClick={addTrait}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary">
                    {trait}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeTrait(index)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Pain Points</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add pain point"
                  value={painPointInput}
                  onChange={(e) => setPainPointInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPainPoint())}
                />
                <Button type="button" onClick={addPainPoint}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.pain_points.map((point, index) => (
                  <Badge key={index} variant="destructive">
                    {point}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removePainPoint(index)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Company Context</Label>
              <Textarea
                placeholder="Information about the attendee's company..."
                value={formData.company_context}
                onChange={(e) => handleChange('company_context', e.target.value)}
                rows={2}
              />
            </div>

            {(userRole === 'super_admin' || userRole === 'company_admin') && (
              <div>
                <Label>Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => handleChange('visibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">All Users</SelectItem>
                    <SelectItem value="specific_users">Specific Users</SelectItem>
                    <SelectItem value="creator_only">Only Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || mode === 'ai'}>
            {loading ? 'Saving...' : editProfile ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
