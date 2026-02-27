import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink } from 'lucide-react';
import { AIClient } from '@/api/entities';
import { GENDER_OPTIONS, PERSONALITY_TYPES, ROLEPLAY_TYPES, getDefaultVoiceForGender, getVoicesByGender } from '@/utils/voiceMapping';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function QuickCreateAIClientModal({ open, onClose, onSave, prefilledGender = null, userRole = 'sales_agent' }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    title: '',
    company_name: '',
    gender: prefilledGender || 'Male',
    voice: '',
    personality: 'Analytical',
    roleplay_type: 'Demo Call',
    visibility: userRole === 'super_admin' || userRole === 'company_admin' ? 'all_users' : 'creator_only'
  });

  useEffect(() => {
    if (prefilledGender) {
      const defaultVoice = getDefaultVoiceForGender(prefilledGender);
      setFormData(prev => ({
        ...prev,
        gender: prefilledGender,
        voice: defaultVoice
      }));
    }
  }, [prefilledGender]);

  useEffect(() => {
    const defaultVoice = getDefaultVoiceForGender(formData.gender);
    setFormData(prev => ({
      ...prev,
      voice: defaultVoice
    }));
  }, [formData.gender]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.title.trim() || !formData.company_name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const aiClientData = {
        ...formData,
        emotional_state: 'Neutral',
        language: 'english',
        difficulty: 'Medium',
        buyer_opinions: JSON.stringify([]),
        common_objections: JSON.stringify([]),
        persona_tags: JSON.stringify([]),
        call_goal_tags: JSON.stringify([]),
        product_interest: JSON.stringify([]),
        traits: JSON.stringify([]),
        painPoints: JSON.stringify([])
      };

      const savedClient = await AIClient.create(aiClientData);
      toast.success('AI Client created successfully');
      onSave(savedClient);
      onClose();
    } catch (error) {
      console.error('Error creating AI client:', error);
      toast.error('Failed to create AI client');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedCreation = () => {
    onClose();
    navigate('/create-ai-client', { state: { prefilledData: formData } });
  };

  const availableVoices = getVoicesByGender(formData.gender);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Quick Create AI Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input
                placeholder="Sarah"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                placeholder="Johnson"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input
                placeholder="CTO"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label>Company Name *</Label>
              <Input
                placeholder="TechCorp Inc."
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <Label>Voice</Label>
              <Select value={formData.voice} onValueChange={(value) => handleChange('voice', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map(voice => (
                    <SelectItem key={voice.value} value={voice.value}>
                      {voice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Auto-selected based on gender</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Personality</Label>
              <Select value={formData.personality} onValueChange={(value) => handleChange('personality', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSONALITY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Roleplay Type</Label>
              <Select value={formData.roleplay_type} onValueChange={(value) => handleChange('roleplay_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLEPLAY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          <Button variant="link" onClick={handleAdvancedCreation} className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to Advanced Creation
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Creating...' : 'Create AI Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
