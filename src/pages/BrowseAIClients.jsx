import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RoleplayBot } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ArrowLeft, Bot, Search, Plus, Building2, Briefcase,
  User, Sparkles, Globe, TrendingUp
} from 'lucide-react';

const industries = [
  'All Industries', 'SaaS', 'Healthcare', 'Financial Services',
  'Manufacturing', 'Professional Services', 'Insurance'
];

const roleTypes = [
  'All Roles', 'Executive', 'Operations', 'Finance',
  'Sales', 'Marketing', 'IT/Technical'
];

export default function BrowseAIClients() {
  const navigate = useNavigate();
  const location = useLocation();
  const [aiClients, setAiClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClients, setSelectedClients] = useState([]);

  const isSelectionMode = location.state?.selectionMode || false;
  const returnPath = location.state?.returnPath || '/practice-hub';

  useEffect(() => {
    loadAIClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [aiClients, searchQuery, selectedIndustry, selectedRole]);

  const loadAIClients = async () => {
    try {
      const data = await RoleplayBot.list();
      const mappedClients = data.map(bot => ({
        ...bot,
        name: [bot.first_name, bot.last_name].filter(Boolean).join(' ') || 'AI Bot',
        job_title: bot.title,
        industry: bot.industry || 'Other'
      }));
      setAiClients(mappedClients);
    } catch (error) {
      console.error('Error loading AI clients:', error);
      toast.error('Failed to load AI clients');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...aiClients];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.job_title?.toLowerCase().includes(query) ||
        client.company_name?.toLowerCase().includes(query)
      );
    }

    if (selectedIndustry !== 'All Industries') {
      filtered = filtered.filter(client => client.industry === selectedIndustry);
    }

    if (selectedRole !== 'All Roles') {
      filtered = filtered.filter(client => {
        const title = client.job_title?.toLowerCase() || '';
        const roleMap = {
          'Executive': ['ceo', 'cto', 'cfo', 'coo', 'president', 'chief', 'executive'],
          'Operations': ['operations', 'ops', 'operating', 'administrator'],
          'Finance': ['finance', 'cfo', 'treasurer', 'controller', 'accounting'],
          'Sales': ['sales', 'revenue', 'business development', 'vp sales'],
          'Marketing': ['marketing', 'cmo', 'brand', 'communications'],
          'IT/Technical': ['technology', 'tech', 'it', 'cto', 'engineering', 'developer']
        };
        return roleMap[selectedRole]?.some(keyword => title.includes(keyword));
      });
    }

    setFilteredClients(filtered);
  };

  const toggleClientSelection = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleSelectClients = () => {
    if (selectedClients.length === 0) {
      toast.error('Please select at least one AI client');
      return;
    }

    navigate(returnPath, {
      state: { selectedBots: selectedClients }
    });
  };

  const getRoleCategory = (title) => {
    if (!title) return 'General';
    const t = title.toLowerCase();
    if (t.includes('ceo') || t.includes('president') || t.includes('chief')) return 'Executive';
    if (t.includes('vp') || t.includes('vice president')) return 'Leadership';
    if (t.includes('director')) return 'Management';
    if (t.includes('manager')) return 'Management';
    return 'Professional';
  };

  const getPersonalityColor = (personality) => {
    const colors = {
      'Nice': 'bg-green-100 text-green-800',
      'Analytical': 'bg-blue-100 text-blue-800',
      'Formal': 'bg-slate-100 text-slate-800',
      'Rude': 'bg-red-100 text-red-800',
      'Chatty': 'bg-purple-100 text-purple-800'
    };
    return colors[personality] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(returnPath)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-8 h-8 text-blue-600" />
                Browse AI Clients
              </h1>
              <p className="text-slate-600 mt-1">
                {isSelectionMode
                  ? 'Select AI clients for your practice session'
                  : 'Explore and create AI roleplay clients'}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/create-ai-client')}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Bot
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, title, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-4 py-2 border rounded-md bg-white"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border rounded-md bg-white"
              >
                {roleTypes.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {isSelectionMode && selectedClients.length > 0 && (
              <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
                </p>
                <Button onClick={handleSelectClients} size="sm">
                  Add Selected Clients
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bot className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
              <p className="text-slate-600">Loading AI clients...</p>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No AI clients found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => navigate('/create-ai-client')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <Card
                key={client.id}
                className={`relative hover:shadow-lg transition-all cursor-pointer ${
                  selectedClients.includes(client.id)
                    ? 'ring-2 ring-blue-600 bg-blue-50'
                    : ''
                }`}
                onClick={() => isSelectionMode && toggleClientSelection(client.id)}
              >
                {isSelectionMode && selectedClients.includes(client.id) && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Briefcase className="w-3 h-3" />
                        {client.job_title}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">{client.company_name || 'No company'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {client.industry && (
                      <Badge variant="outline" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        {client.industry}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getPersonalityColor(client.personality)}`}>
                      {client.personality}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getRoleCategory(client.job_title)}
                    </Badge>
                  </div>

                  {client.roleplay_scenario && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      Scenario: {client.roleplay_scenario}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/create-ai-client?id=${client.id}`);
                      }}
                    >
                      View Details
                    </Button>
                    {!isSelectionMode && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/ai-roleplay', { state: { selectedBot: client.id } });
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Practice
                      </Button>
                    )}
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
