import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { Target, DollarSign, ListChecks, HelpCircle, Check, X, ChevronRight, Star } from 'lucide-react';

const FRAMEWORK_ICONS = {
  'MEDDIC': Target,
  'BANT': DollarSign,
  'RUBRIC': ListChecks,
  'SPIN': HelpCircle
};

const FRAMEWORK_COLORS = {
  'MEDDIC': 'bg-blue-500',
  'BANT': 'bg-emerald-500',
  'RUBRIC': 'bg-amber-500',
  'SPIN': 'bg-violet-500'
};

const FRAMEWORK_DESCRIPTIONS = {
  'MEDDIC': 'Enterprise sales qualification focusing on Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, and Champion',
  'BANT': 'SMB sales qualification framework addressing Budget, Authority, Need, and Timeline',
  'SPIN': 'Strategic questioning methodology using Situation, Problem, Implication, and Need-payoff questions',
  'RUBRIC': 'Flexible scoring system with customizable performance categories and levels'
};

export default function FrameworkSettings() {
  const [frameworks, setFrameworks] = useState([]);
  const [criteria, setCriteria] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [defaultFramework, setDefaultFramework] = useState(null);
  const [savingDefault, setSavingDefault] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user.company_id) {
          setCompanyId(user.company_id);
        }
      } catch (e) {
        console.error('Error fetching user:', e);
        toast.error('Failed to load user information');
      }
      fetchFrameworks();
    };
    initPage();
  }, []);

  const fetchFrameworks = async () => {
    try {
      const { data: frameworksData, error } = await supabase
        .from('evaluation_frameworks')
        .select('*')
        .order('name');

      if (error) throw error;
      setFrameworks(frameworksData || []);

      const criteriaMap = {};
      for (const framework of frameworksData || []) {
        const { data: criteriaData } = await supabase
          .from('framework_criteria')
          .select('*, framework_scoring_rules(*)')
          .eq('framework_id', framework.id)
          .order('display_order');
        criteriaMap[framework.id] = criteriaData || [];
      }
      setCriteria(criteriaMap);

      if (companyId) {
        fetchCompanyFrameworkDefault();
      }
    } catch (error) {
      console.error('Error fetching frameworks:', error);
      toast.error('Failed to load frameworks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyFrameworkDefault = async () => {
    if (!companyId) return;
    try {
      const { data } = await supabase
        .from('company_framework_settings')
        .select('default_framework_id')
        .eq('company_id', companyId)
        .maybeSingle();
      if (data) {
        setDefaultFramework(data.default_framework_id);
      }
    } catch (error) {
      console.error('Error fetching company framework settings:', error);
    }
  };

  const handleSetDefaultFramework = async (frameworkId) => {
    if (!companyId) {
      toast.error('Company information not available');
      return;
    }

    setSavingDefault(true);
    try {
      const { data: existing } = await supabase
        .from('company_framework_settings')
        .select('id')
        .eq('company_id', companyId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('company_framework_settings')
          .update({ default_framework_id: frameworkId })
          .eq('company_id', companyId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_framework_settings')
          .insert([{ company_id: companyId, default_framework_id: frameworkId }]);
        if (error) throw error;
      }

      setDefaultFramework(frameworkId);
      toast.success('Default framework updated');
    } catch (error) {
      console.error('Error updating framework:', error);
      toast.error('Failed to update default framework');
    } finally {
      setSavingDefault(false);
    }
  };

  const toggleFrameworkActive = async (frameworkId, isActive) => {
    try {
      const { error } = await supabase
        .from('evaluation_frameworks')
        .update({ is_active: !isActive })
        .eq('id', frameworkId);
      if (error) throw error;

      setFrameworks(prev =>
        prev.map(f => f.id === frameworkId ? { ...f, is_active: !isActive } : f)
      );
      toast.success(isActive ? 'Framework disabled' : 'Framework enabled');
    } catch (error) {
      console.error('Error updating framework:', error);
      toast.error('Failed to update framework');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedFrameworkObj = selectedFramework ? frameworks.find(f => f.id === selectedFramework) : null;
  const selectedFrameworkCriteria = selectedFramework ? (criteria[selectedFramework] || []) : [];
  const canManage = currentUser?.role === 'company_admin' || currentUser?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Evaluation Frameworks</h1>
          <p className="text-slate-600">Configure and manage evaluation frameworks for your team's practice sessions</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="mb-6 border-b border-slate-200">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-transparent p-0 h-auto">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3 font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="default"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3 font-medium"
              >
                Default Setting
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {frameworks.map(framework => {
                const Icon = FRAMEWORK_ICONS[framework.framework_type] || ListChecks;
                const colorClass = FRAMEWORK_COLORS[framework.framework_type] || 'bg-slate-500';
                const isDefault = defaultFramework === framework.id;
                const criteriaCount = criteria[framework.id]?.length || 0;

                return (
                  <Card
                    key={framework.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer border-0 group"
                    onClick={() => {
                      setSelectedFramework(framework.id);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className={`${colorClass} h-24 flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-lg">{framework.name}</h3>
                          {isDefault && (
                            <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                              <Star className="w-3 h-3 fill-amber-600 text-amber-600" />
                              <span className="text-xs font-semibold text-amber-700">Default</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{framework.framework_type}</p>
                      </div>

                      <div className="space-y-2 py-3 border-t border-b border-slate-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Status</span>
                          <Badge variant={framework.is_active ? 'default' : 'secondary'} className="text-xs font-medium">
                            {framework.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Criteria</span>
                          <span className="font-bold text-slate-900">{criteriaCount}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant={framework.is_active ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFrameworkActive(framework.id, framework.is_active);
                          }}
                        >
                          {framework.is_active ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Disabled
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFramework(framework.id);
                            setShowDetailsModal(true);
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="default" className="space-y-6 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Set Default Framework</CardTitle>
                <CardDescription className="text-base">
                  {canManage
                    ? 'Choose which framework will be selected by default for your team'
                    : 'Only company admins can change this setting'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {canManage ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {frameworks.filter(f => f.is_active).map(framework => {
                      const Icon = FRAMEWORK_ICONS[framework.framework_type] || ListChecks;
                      const isSelected = defaultFramework === framework.id;
                      const colorClass = FRAMEWORK_COLORS[framework.framework_type] || 'bg-slate-500';

                      return (
                        <button
                          key={framework.id}
                          onClick={() => handleSetDefaultFramework(framework.id)}
                          disabled={savingDefault}
                          className={`relative overflow-hidden rounded-lg border-2 p-4 text-left transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`${colorClass} rounded-lg p-2 text-white flex-shrink-0`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900">{framework.name}</h4>
                              <p className="text-sm text-slate-600">{framework.framework_type}</p>
                            </div>
                            {isSelected && (
                              <div className="flex-shrink-0 ml-2">
                                <Check className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center space-y-2">
                    <p className="text-sm font-medium text-blue-900">Access Restricted</p>
                    <p className="text-sm text-blue-700">Contact your company admin to change the default framework</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedFrameworkObj && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {React.createElement(FRAMEWORK_ICONS[selectedFrameworkObj.framework_type] || ListChecks, {
                    className: 'w-6 h-6'
                  })}
                  {selectedFrameworkObj.name}
                </DialogTitle>
                <DialogDescription>
                  {FRAMEWORK_DESCRIPTIONS[selectedFrameworkObj.framework_type] || selectedFrameworkObj.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Evaluation Criteria ({selectedFrameworkCriteria.length})</h4>
                  {selectedFrameworkCriteria.length > 0 ? (
                    <div className="space-y-4">
                      {selectedFrameworkCriteria.map((criterion, idx) => (
                        <div key={criterion.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="font-semibold text-slate-900">{criterion.name}</h5>
                              <Badge variant="secondary" className="text-xs">{criterion.criterion_key}</Badge>
                            </div>
                            <p className="text-sm text-slate-600">{criterion.description}</p>
                            <div className="mt-2 text-xs text-slate-500">Weight: <span className="font-medium">{criterion.weight}</span></div>
                          </div>

                          {criterion.framework_scoring_rules && criterion.framework_scoring_rules.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                              <p className="text-xs font-semibold text-slate-700 uppercase">Scoring Levels</p>
                              <div className="grid grid-cols-2 gap-2">
                                {criterion.framework_scoring_rules
                                  .sort((a, b) => a.score_level - b.score_level)
                                  .map(rule => (
                                    <div key={rule.id} className="bg-slate-50 rounded p-3 text-xs space-y-1">
                                      <p className="font-semibold text-slate-900">Level {rule.score_level}: {rule.label}</p>
                                      <p className="text-slate-600">{rule.description}</p>
                                      <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200">
                                        <span>{rule.min_score}%</span>
                                        <span>-</span>
                                        <span>{rule.max_score}%</span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">No criteria found for this framework</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
