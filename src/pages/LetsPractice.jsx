import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Sparkles, ArrowRight, Mic, Users as UsersIcon, Search as SearchIcon, BookOpen, Trophy, Play } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

const DUMMY_BOTS = [
  {
    id: 'dummy_cold_call_tech',
    name: 'Cold Call - Tech Decision Maker',
    description: 'Practice cold calling a CTO at a SaaS company who hasn\'t heard of your product',
    industry: 'Technology',
    difficulty_level: 'intermediate',
    company: 'TechCorp Inc',
    is_public: true,
    personas_config: [
      { name: 'Sarah Johnson', title: 'CTO', traits: ['Technical', 'Skeptical', 'Busy'], buyingStage: 'Problem Unaware', details: 'Recently promoted, responsible for infrastructure' }
    ]
  },
  {
    id: 'dummy_discovery_finance',
    name: 'Discovery Call - Finance Director',
    description: 'Discover pain points with a Finance Director facing budget constraints',
    industry: 'Financial Services',
    difficulty_level: 'beginner',
    company: 'GlobalFinance Solutions',
    is_public: true,
    personas_config: [
      { name: 'Michael Chen', title: 'Finance Director', traits: ['Cost-Conscious', 'Collaborative', 'Detail-Oriented'], buyingStage: 'Problem Aware', details: 'Cost reduction is key priority this year' }
    ]
  },
  {
    id: 'dummy_warm_call_ecommerce',
    name: 'Warm Call - E-commerce Manager',
    description: 'Follow up with an e-commerce manager who attended your webinar',
    industry: 'Retail/E-commerce',
    difficulty_level: 'beginner',
    company: 'ShopHub Co',
    is_public: true,
    personas_config: [
      { name: 'Rachel Martinez', title: 'E-commerce Manager', traits: ['Growth-Focused', 'Enthusiastic', 'Early Adopter'], buyingStage: 'Problem Aware', details: 'Very interested in automation solutions' }
    ]
  },
  {
    id: 'dummy_objection_healthcare',
    name: 'Objection Handling - Healthcare IT',
    description: 'Handle common objections from a healthcare organization evaluating your solution',
    industry: 'Healthcare',
    difficulty_level: 'advanced',
    company: 'MediTech Solutions',
    is_public: true,
    personas_config: [
      { name: 'Dr. James Wilson', title: 'IT Director', traits: ['Cautious', 'Assertive', 'Formal'], buyingStage: 'Solution Aware', details: 'Compliance requirements are critical' }
    ]
  },
  {
    id: 'dummy_renewal_call_mfg',
    name: 'Renewal Call - Manufacturing VP',
    description: 'Renew relationship with a VP of Operations at a manufacturing plant',
    industry: 'Manufacturing',
    difficulty_level: 'intermediate',
    company: 'Industrial Solutions Inc',
    is_public: true,
    personas_config: [
      { name: 'David Kumar', title: 'VP Operations', traits: ['Direct', 'Practical', 'Risk-Averse'], buyingStage: 'Product Aware', details: 'Looking to expand implementation' }
    ]
  },
  {
    id: 'dummy_negotiation_enterprise',
    name: 'Negotiation - Enterprise Account',
    description: 'Negotiate terms and pricing with an enterprise buyer',
    industry: 'Enterprise Software',
    difficulty_level: 'advanced',
    company: 'Fortune500 Corp',
    is_public: true,
    personas_config: [
      { name: 'Patricia Adams', title: 'VP Procurement', traits: ['Assertive', 'Direct', 'Budget Holder'], buyingStage: 'Ready to Buy', details: 'Has multiple competing bids' }
    ]
  },
  {
    id: 'dummy_multistakeholder_deal',
    name: 'Multi-Stakeholder Sales Call',
    description: 'Navigate a call with multiple decision-makers with different priorities',
    industry: 'Technology',
    difficulty_level: 'advanced',
    company: 'BigTech Solutions',
    is_public: true,
    personas_config: [
      { name: 'Lisa Thompson', title: 'Head of IT', traits: ['Technical', 'Cautious'], buyingStage: 'Problem Aware' },
      { name: 'Mark Sullivan', title: 'CFO', traits: ['Cost-Conscious', 'Formal'], buyingStage: 'Solution Aware' },
      { name: 'Emma Davis', title: 'Business Owner', traits: ['Growth-Focused', 'Collaborative'], buyingStage: 'Ready to Buy' }
    ]
  },
  {
    id: 'dummy_executive_brief',
    name: 'Executive Briefing',
    description: 'Present to C-level executives with limited time and high expectations',
    industry: 'Consulting',
    difficulty_level: 'advanced',
    company: 'McKinsey Advisory',
    is_public: true,
    personas_config: [
      { name: 'Richard Blackwell', title: 'CEO', traits: ['Assertive', 'Direct', 'Busy'], buyingStage: 'Solution Aware', details: 'Only has 15 minutes to meet' }
    ]
  },
  {
    id: 'dummy_value_based_selling',
    name: 'Value-Based Selling',
    description: 'Focus on business outcomes rather than features',
    industry: 'Professional Services',
    difficulty_level: 'intermediate',
    company: 'Accenture Services',
    is_public: true,
    personas_config: [
      { name: 'Angela Foster', title: 'Operations Director', traits: ['Detail-Oriented', 'Practical'], buyingStage: 'Problem Aware', details: 'Focused on ROI and business metrics' }
    ]
  },
  {
    id: 'dummy_complex_sale',
    name: 'Complex Enterprise Sale',
    description: 'Navigate a complex deal with competing priorities and long sales cycle',
    industry: 'Financial Services',
    difficulty_level: 'advanced',
    company: 'Goldman Sachs',
    is_public: true,
    personas_config: [
      { name: 'Jennifer Park', title: 'Chief Risk Officer', traits: ['Cautious', 'Formal', 'Risk-Averse'], buyingStage: 'Problem Aware', details: 'Compliance is non-negotiable' }
    ]
  }
];

export default function LetsPractice() {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [myBots, setMyBots] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      await loadBots(user.id);
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
        .eq('is_scenario_template', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userBots = data?.filter(b => b.created_by === userId) || [];
      const publicBots = data?.filter(b => b.is_public && b.created_by !== userId) || [];

      setMyBots(userBots);
      setBots([...DUMMY_BOTS, ...publicBots]);
    } catch (error) {
      console.error('Error loading bots:', error);
      setBots(DUMMY_BOTS);
    }
  };

  const handleStartPractice = async (bot) => {
    try {
      await supabase
        .from('user_bot_sessions')
        .insert([{
          user_id: currentUser.id,
          bot_id: bot.id,
          started_at: new Date().toISOString()
        }]);

      window.location.href = `/AIRoleplay?botId=${bot.id}`;
    } catch (error) {
      console.error('Error starting practice:', error);
      toast.error('Failed to start practice session');
    }
  };

  const handleCreateNew = () => {
    navigate(createPageUrl('CreateRoleplay'));
  };

  const filteredBots = bots.filter(bot =>
    bot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyBots = myBots.filter(bot =>
    bot.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 font-medium">Loading practice scenarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">AI-Powered Training</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Let's Practice</h1>
          <p className="text-blue-100 text-lg mb-6">Master sales conversations with AI roleplay partners. Practice different scenarios, industries, and objection handling.</p>
          <Button
            onClick={handleCreateNew}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Your Own Scenario
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="discover">Discover Scenarios</TabsTrigger>
              <TabsTrigger value="my-bots">
                My Scenarios
                {myBots.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{myBots.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64 bg-white border-slate-300"
              />
            </div>
          </div>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {filteredBots.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mic className="w-12 h-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No scenarios found</h3>
                  <p className="text-slate-600">Try adjusting your search filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBots.map(bot => (
                  <Card key={bot.id} className="hover:shadow-lg transition-all overflow-hidden group">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg line-clamp-2">{bot.name}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2">{bot.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {bot.industry && (
                          <Badge variant="secondary" className="text-xs">{bot.industry}</Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            bot.difficulty_level === 'beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                            bot.difficulty_level === 'intermediate' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {bot.difficulty_level?.charAt(0).toUpperCase() + bot.difficulty_level?.slice(1)}
                        </Badge>
                      </div>

                      {bot.personas_config && bot.personas_config.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <UsersIcon className="w-4 h-4" />
                            <span>{bot.personas_config.length} {bot.personas_config.length === 1 ? 'persona' : 'personas'}</span>
                          </div>
                          <div className="space-y-1">
                            {bot.personas_config.map((persona, idx) => (
                              <div key={idx} className="text-sm text-slate-700">
                                <span className="font-medium">{persona.name}</span> - {persona.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => handleStartPractice(bot)}
                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Practice
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Scenarios Tab */}
          <TabsContent value="my-bots" className="space-y-6">
            {filteredMyBots.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No custom scenarios yet</h3>
                  <p className="text-slate-600 mb-6">Create your first scenario to get started</p>
                  <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="w-4 h-4" />
                    Create Scenario
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMyBots.map(bot => (
                  <Card key={bot.id} className="hover:shadow-lg transition-all">
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2">{bot.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{bot.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {bot.industry && (
                          <Badge variant="secondary" className="text-xs">{bot.industry}</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {bot.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => handleStartPractice(bot)}
                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Practice
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
