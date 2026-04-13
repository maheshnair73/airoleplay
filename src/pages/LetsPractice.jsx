import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Play, Plus, Loader2, Sparkles, Users, Target, Brain,
  ExternalLink, Zap, Star, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import BotSelectionModal from '@/components/roleplay/BotSelectionModal';

export default function LetsPractice() {
  const [bots, setBots] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBotModal, setShowBotModal] = useState(false);
  const [showCustomBotForm, setShowCustomBotForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [customBotData, setCustomBotData] = useState({
    bot_name: '',
    company_name: '',
    linkedin_url: '',
    scenario_bot_id: null
  });

  const [scenarioBots, setScenarioBots] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      await Promise.all([
        loadBots(user.id),
        loadScenarioBots()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBots = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('ai_clients')
        .select('*')
        .or(`created_by.eq.${userId},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      console.error('Error loading bots:', error);
      toast.error('Failed to load bots');
    }
  };

  const loadScenarioBots = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_clients')
        .select('*')
        .eq('is_scenario_template', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScenarioBots(data || []);
    } catch (error) {
      console.error('Error loading scenario bots:', error);
    }
  };

  const handleStartPractice = (bot) => {
    window.location.href = createPageUrl('AIRoleplay', { botId: bot.id });
  };

  const handleCreateCustomBot = async () => {
    if (!customBotData.bot_name.trim() || !customBotData.company_name.trim() || !customBotData.scenario_bot_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ai_clients')
        .insert([{
          name: customBotData.bot_name,
          company: customBotData.company_name,
          linkedin_profile_url: customBotData.linkedin_url,
          created_by: currentUser.id,
          parent_bot_id: customBotData.scenario_bot_id,
          is_public: false
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Custom bot created successfully!');
      setShowCustomBotForm(false);
      setCustomBotData({
        bot_name: '',
        company_name: '',
        linkedin_url: '',
        scenario_bot_id: null
      });
      loadBots(currentUser.id);
    } catch (error) {
      console.error('Error creating bot:', error);
      toast.error('Failed to create bot');
    }
  };

  const handleSelectExistingBot = async (bot) => {
    try {
      await supabase
        .from('user_bot_sessions')
        .insert([{
          user_id: currentUser.id,
          bot_id: bot.id,
          started_at: new Date().toISOString()
        }]);

      handleStartPractice(bot);
    } catch (error) {
      console.error('Error selecting bot:', error);
      toast.error('Failed to start session');
    }
  };

  const filteredBots = bots.filter(bot =>
    bot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-slate-300 font-medium">Loading practice bots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Let's Practice</h1>
              <p className="text-slate-300 text-lg">Master your sales skills with AI-powered roleplay scenarios</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={showCustomBotForm} onOpenChange={setShowCustomBotForm}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="w-5 h-5" />
                    Create Custom Bot
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Custom Bot</DialogTitle>
                    <DialogDescription>
                      Customize an existing scenario bot for your specific needs
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Select Scenario Template</label>
                      <select
                        value={customBotData.scenario_bot_id || ''}
                        onChange={(e) => setCustomBotData({ ...customBotData, scenario_bot_id: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Choose a template...</option>
                        {scenarioBots.map(bot => (
                          <option key={bot.id} value={bot.id}>
                            {bot.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Bot Name</label>
                      <Input
                        placeholder="e.g., Sarah Johnson - Tech Buyer"
                        value={customBotData.bot_name}
                        onChange={(e) => setCustomBotData({ ...customBotData, bot_name: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Company</label>
                      <Input
                        placeholder="e.g., Acme Corporation"
                        value={customBotData.company_name}
                        onChange={(e) => setCustomBotData({ ...customBotData, company_name: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">LinkedIn Profile (Optional)</label>
                      <Input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={customBotData.linkedin_url}
                        onChange={(e) => setCustomBotData({ ...customBotData, linkedin_url: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <Button onClick={handleCreateCustomBot} className="w-full bg-blue-600 hover:bg-blue-700">
                      Create Bot
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showBotModal} onOpenChange={setShowBotModal}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-700 gap-2">
                    <Users className="w-5 h-5" />
                    Browse Bots
                  </Button>
                </DialogTrigger>
                <BotSelectionModal
                  isOpen={showBotModal}
                  onClose={() => setShowBotModal(false)}
                  onSelectBot={handleSelectExistingBot}
                />
              </Dialog>
            </div>
          </div>

          {filteredBots.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search your bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {filteredBots.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full mb-6">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No bots yet</h3>
            <p className="text-slate-400 mb-6">Create your first custom bot or browse available scenario templates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBots.map((bot) => (
              <Card key={bot.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white">{bot.name}</CardTitle>
                      {bot.company && (
                        <CardDescription className="text-slate-400 text-sm mt-1">{bot.company}</CardDescription>
                      )}
                    </div>
                    {bot.linkedin_profile_url && (
                      <a
                        href={bot.linkedin_profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-400">
                    {bot.description || 'Practice scenario bot'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {bot.industry && (
                      <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-200">
                        {bot.industry}
                      </Badge>
                    )}
                    {bot.difficulty_level && (
                      <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-200">
                        {bot.difficulty_level}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-700">
                    <Button
                      onClick={() => handleSelectExistingBot(bot)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Search({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  );
}
