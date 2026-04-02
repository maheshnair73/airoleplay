import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { RoleplayBot } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowLeft, Bot, Building2, Briefcase, User, Globe, Brain,
  Target, MessageSquare, AlertCircle, Sparkles, Play, Edit,
  ShoppingBag, TrendingUp, Users, Lightbulb
} from 'lucide-react';

export default function AIClientDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const botId = searchParams.get('id');
  const [bot, setBot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const returnPath = location.state?.returnPath || '/browse-ai-clients';
  const selectionMode = location.state?.selectionMode || false;

  useEffect(() => {
    if (botId) {
      loadBotDetails();
    }
  }, [botId]);

  const loadBotDetails = async () => {
    try {
      const data = await RoleplayBot.get(botId);
      const mappedBot = {
        ...data,
        name: [data.first_name, data.last_name].filter(Boolean).join(' ') || 'AI Bot',
        job_title: data.title
      };
      setBot(mappedBot);
    } catch (error) {
      console.error('Error loading bot details:', error);
      toast.error('Failed to load bot details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBot = () => {
    if (selectionMode) {
      navigate(returnPath, {
        state: { selectedBots: [botId] }
      });
    } else {
      navigate('/ai-roleplay', { state: { selectedBot: botId } });
    }
  };

  const getPersonalityColor = (personality) => {
    const colors = {
      'Nice': 'bg-green-100 text-green-800 border-green-200',
      'Analytical': 'bg-blue-100 text-blue-800 border-blue-200',
      'Formal': 'bg-slate-100 text-slate-800 border-slate-200',
      'Rude': 'bg-red-100 text-red-800 border-red-200',
      'Chatty': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[personality] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPersonalityIcon = (personality) => {
    const icons = {
      'Nice': '😊',
      'Analytical': '📊',
      'Formal': '👔',
      'Rude': '😤',
      'Chatty': '💬'
    };
    return icons[personality] || '🤖';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading AI client details...</p>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Bot Not Found</h3>
            <p className="text-slate-600 mb-4">The AI client you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/browse-ai-clients')}>
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(returnPath, { state: location.state })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/create-ai-client?id=${botId}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Bot
            </Button>
            <Button onClick={handleSelectBot}>
              <Play className="w-4 h-4 mr-2" />
              {selectionMode ? 'Select This Bot' : 'Start Practice'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {bot.first_name?.[0]}{bot.last_name?.[0]}
                </div>
                <CardTitle className="text-2xl">{bot.name}</CardTitle>
                <CardDescription className="text-base">
                  {bot.job_title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700">
                  <Building2 className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Company</p>
                    <p className="font-medium">{bot.company_name || 'N/A'}</p>
                  </div>
                </div>

                {bot.industry && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Globe className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Industry</p>
                      <p className="font-medium">{bot.industry}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-slate-500 mb-2">Personality</p>
                  <Badge className={`text-sm px-3 py-1 ${getPersonalityColor(bot.personality)}`}>
                    <span className="mr-2">{getPersonalityIcon(bot.personality)}</span>
                    {bot.personality}
                  </Badge>
                </div>

                {bot.gender && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Voice</p>
                    <p className="text-slate-700">{bot.gender} Voice</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {bot.selling_context && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    What You're Selling to {bot.first_name || 'This Client'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{bot.selling_context}</p>
                </CardContent>
              </Card>
            )}

            {bot.roleplay_scenario && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Roleplay Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{bot.roleplay_scenario}</p>
                </CardContent>
              </Card>
            )}

            {bot.background && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Background & Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{bot.background}</p>
                </CardContent>
              </Card>
            )}

            {bot.persona_tags && bot.persona_tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    Persona Traits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {bot.persona_tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {bot.buyer_opinions && bot.buyer_opinions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Buyer Opinions & Perspectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {bot.buyer_opinions.map((opinion, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-slate-700">{opinion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {bot.common_objections && bot.common_objections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Common Objections
                  </CardTitle>
                  <CardDescription>
                    Challenges you might face during the conversation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {bot.common_objections.map((objection, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">⚠️</span>
                        <span className="text-slate-700">{objection}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {bot.call_goal && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Practice Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{bot.call_goal}</p>
                </CardContent>
              </Card>
            )}

            {bot.buyer_awareness_level && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Awareness Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-sm">
                    {bot.buyer_awareness_level}
                  </Badge>
                  <p className="text-sm text-slate-600 mt-2">
                    This indicates how familiar the prospect is with their problem and potential solutions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Ready to practice?</h3>
                  <p className="text-sm text-slate-600">
                    Start a roleplay session with {bot.first_name || bot.name} to improve your skills
                  </p>
                </div>
              </div>
              <Button size="lg" onClick={handleSelectBot}>
                <Play className="w-5 h-5 mr-2" />
                {selectionMode ? 'Select Bot' : 'Start Roleplay'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
