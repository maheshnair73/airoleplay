import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';

export default function CustomBotForm({ isOpen, onClose, scenarioBots, onBotCreated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    linkedin_url: '',
    scenario_bot_id: ''
  });

  React.useEffect(() => {
    if (isOpen && !currentUser) {
      User.me().then(user => setCurrentUser(user));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.company.trim() || !formData.scenario_bot_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('ai_clients')
        .insert([{
          name: formData.name,
          company: formData.company,
          linkedin_profile_url: formData.linkedin_url,
          created_by: currentUser.id,
          parent_bot_id: formData.scenario_bot_id,
          is_public: false
        }]);

      if (error) throw error;

      toast.success('Custom bot created successfully!');
      setFormData({
        name: '',
        company: '',
        linkedin_url: '',
        scenario_bot_id: ''
      });
      onClose();
      onBotCreated();
    } catch (error) {
      console.error('Error creating bot:', error);
      toast.error('Failed to create bot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create Custom Bot</DialogTitle>
          <DialogDescription className="text-slate-400">
            Customize an existing scenario template with your prospect details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Scenario Template */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-slate-200 font-medium">
              Select Scenario Template
            </Label>
            <select
              id="template"
              value={formData.scenario_bot_id}
              onChange={(e) => setFormData({ ...formData, scenario_bot_id: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <option value="">Choose a template...</option>
              {scenarioBots.map(bot => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bot Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200 font-medium">
              Bot Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Sarah Johnson - Tech Buyer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
            />
            <p className="text-xs text-slate-500">Make it descriptive so you remember the prospect</p>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-slate-200 font-medium">
              Company
            </Label>
            <Input
              id="company"
              placeholder="e.g., Acme Corporation"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
            />
            <p className="text-xs text-slate-500">Where does your prospect work?</p>
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-slate-200 font-medium">
              LinkedIn Profile (Optional)
            </Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
            />
            <p className="text-xs text-slate-500">Link to their LinkedIn profile to research background</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-100 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Bot
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
