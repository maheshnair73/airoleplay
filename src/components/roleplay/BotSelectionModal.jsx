import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search as SearchIcon, ExternalLink, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function BotSelectionModal({ isOpen, onClose, onSelectBot }) {
  const [availableBots, setAvailableBots] = useState([]);
  const [filteredBots, setFilteredBots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAvailableBots();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = availableBots.filter(bot =>
      bot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBots(filtered);
  }, [searchQuery, availableBots]);

  const loadAvailableBots = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_clients')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableBots(data || []);
    } catch (error) {
      console.error('Error loading available bots:', error);
      toast.error('Failed to load available bots');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Browse Available Bots</DialogTitle>
          <DialogDescription className="text-slate-400">
            Select from professional AI-powered scenario templates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Search by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
          </div>

          {/* Bot List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredBots.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-center">
              <div>
                <p className="text-slate-400 font-medium">No bots found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your search terms</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1">
              {filteredBots.map((bot) => (
                <div
                  key={bot.id}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-blue-500/50 hover:bg-slate-700 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                        {bot.name}
                      </h4>
                      {bot.company && (
                        <p className="text-sm text-slate-400 truncate">{bot.company}</p>
                      )}
                    </div>
                    {bot.linkedin_profile_url && (
                      <a
                        href={bot.linkedin_profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-slate-500 hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  {bot.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{bot.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {bot.industry && (
                        <Badge
                          variant="secondary"
                          className="bg-slate-600/50 text-slate-200 border-slate-600 text-xs"
                        >
                          {bot.industry}
                        </Badge>
                      )}
                      {bot.difficulty_level && (
                        <Badge
                          variant="secondary"
                          className="bg-slate-600/50 text-slate-200 border-slate-600 text-xs"
                        >
                          {bot.difficulty_level}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onSelectBot(bot);
                        onClose();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
