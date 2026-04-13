import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, ExternalLink } from 'lucide-react';
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Browse Available Bots</DialogTitle>
          <DialogDescription>
            Select from professionally crafted AI scenario bots
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-300">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus:outline-none focus:ring-0"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : filteredBots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No bots found matching your search</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredBots.map((bot) => (
                <Card key={bot.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{bot.name}</h4>
                        {bot.company && (
                          <p className="text-sm text-slate-600">{bot.company}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {bot.linkedin_profile_url && (
                          <a
                            href={bot.linkedin_profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {bot.description && (
                      <p className="text-sm text-slate-700 mb-3">{bot.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {bot.industry && (
                          <Badge variant="outline" className="text-xs">{bot.industry}</Badge>
                        )}
                        {bot.difficulty_level && (
                          <Badge variant="outline" className="text-xs">{bot.difficulty_level}</Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelectBot(bot);
                          onClose();
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
