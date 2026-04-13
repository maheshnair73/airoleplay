import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Users, Search as SearchIcon, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import CustomBotForm from '@/components/roleplay/CustomBotForm';
import BotCard from '@/components/roleplay/BotCard';
import BotSelectionModal from '@/components/roleplay/BotSelectionModal';

export default function LetsPractice() {
  const [bots, setBots] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBotModal, setShowBotModal] = useState(false);
  const [showCustomBotForm, setShowCustomBotForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSelectBot = async (bot) => {
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
    }
  };

  const handleBotCreated = () => {
    setShowCustomBotForm(false);
    loadBots(currentUser.id);
  };

  const filteredBots = bots.filter(bot =>
    bot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-slate-400 font-medium">Loading your practice hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300 font-medium">AI-Powered Training</span>
                </div>
              </div>
              <h1 className="text-6xl font-bold text-white mb-3 tracking-tight">
                Let's Practice
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl">
                Master your sales skills with realistic AI-powered roleplay scenarios. Practice discovery questions, objection handling, and closing techniques.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowCustomBotForm(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create Custom Bot
              </Button>
              <Button
                onClick={() => setShowBotModal(true)}
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-100 hover:bg-slate-800/50 gap-2 font-semibold"
              >
                <Users className="w-5 h-5" />
                Browse All Bots
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Bar */}
        {filteredBots.length > 0 && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Search your bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredBots.length === 0 ? (
          <div className="py-20">
            <div className="text-center space-y-6 max-w-xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 border border-slate-700 rounded-full">
                <Users className="w-10 h-10 text-slate-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">No bots yet</h2>
                <p className="text-slate-400">
                  Start by creating a custom bot from an existing scenario template, or browse all available practice bots.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={() => setShowCustomBotForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Bot
                </Button>
                <Button
                  onClick={() => setShowBotModal(true)}
                  variant="outline"
                  className="border-slate-600"
                >
                  Browse Bots
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Practice Bots</h2>
                <p className="text-slate-400 text-sm mt-1">{filteredBots.length} bot{filteredBots.length !== 1 ? 's' : ''} available</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  onSelect={() => handleSelectBot(bot)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomBotForm
        isOpen={showCustomBotForm}
        onClose={() => setShowCustomBotForm(false)}
        scenarioBots={scenarioBots}
        onBotCreated={handleBotCreated}
      />

      <BotSelectionModal
        isOpen={showBotModal}
        onClose={() => setShowBotModal(false)}
        onSelectBot={handleSelectBot}
      />
    </div>
  );
}
