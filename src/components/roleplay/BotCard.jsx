import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink, Star } from 'lucide-react';

export default function BotCard({ bot, onSelect }) {
  return (
    <div className="group relative bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-6 space-y-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
              {bot.name}
            </h3>
            {bot.company && (
              <p className="text-sm text-slate-400 truncate mt-1">{bot.company}</p>
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

        {/* Description */}
        {bot.description && (
          <p className="text-sm text-slate-400 line-clamp-2 flex-grow">
            {bot.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {bot.industry && (
            <Badge
              variant="secondary"
              className="bg-slate-700/50 text-slate-200 border-slate-600 text-xs"
            >
              {bot.industry}
            </Badge>
          )}
          {bot.difficulty_level && (
            <Badge
              variant="secondary"
              className="bg-slate-700/50 text-slate-200 border-slate-600 text-xs"
            >
              {bot.difficulty_level}
            </Badge>
          )}
        </div>

        {/* Footer - Button */}
        <div className="pt-2 border-t border-slate-700">
          <Button
            onClick={onSelect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 transition-all duration-300"
          >
            <Play className="w-4 h-4" />
            Start Practice
          </Button>
        </div>
      </div>
    </div>
  );
}
