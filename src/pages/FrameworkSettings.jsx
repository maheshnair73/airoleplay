import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { Target, DollarSign, ListChecks, HelpCircle, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const FRAMEWORK_ICONS = {
  'MEDDIC': Target,
  'BANT': DollarSign,
  'RUBRIC': ListChecks,
  'SPIN': HelpCircle
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
  const [showCriteriaDialog, setShowCriteriaDialog] = useState(false);

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
      const { data, error } = await supabase
        .from('evaluation_frameworks')
        .select('*')
        .order('name');

      if (error) throw error;
      setFrameworks(data || []);

      for (const framework of data || []) {
        const { data: criteriaData } = await supabase
          .from('framework_criteria')
          .select('*, framework_scoring_rules(*)')
          .eq('framework_id', framework.id)
          .order('display_order');

        setCriteria(prev => ({
          ...prev,
          [framework.id]: criteriaData || []
        }));
      }

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
          .insert([{
            company_id: companyId,
            default_framework_id: frameworkId
          }]);

        if (error) throw error;
      }

      setDefaultFramework(frameworkId);
      toast.success('Default framework updated successfully');
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

  const frameworkObj = selectedFramework ? frameworks.find(f => f.id === selectedFramework) : null;
  const frameworkCriteria = selectedFramework ? (criteria[selectedFramework] || []) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Evaluation Frameworks</h1>
          <p className="text-slate-600">
            Manage evaluation frameworks for roleplay training and practice sessions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Frameworks List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle>Available Frameworks</CardTitle>
                <CardDescription>
                  Select a framework to view details and criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {frameworks.map(framework => {
                    const Icon = FRAMEWORK_ICONS[framework.framework_type] || ListChecks;
                    const isSelected = selectedFramework === framework.id;
                    const isDefault = defaultFramework === framework.id;

                    return (
                      <div
                        key={framework.id}
                        onClick={() => setSelectedFramework(framework.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-slate-900">{framework.name}</h4>
                                {isDefault && (
                                  <Badge className="bg-green-600">Default</Badge>
                                )}
                                {!framework.is_active && (
                                  <Badge variant="secondary">Disabled</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">{framework.framework_type}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isSelected && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCriteriaDialog(true);
                                }}
                              >
                                View Details
                              </Button>
                            )}
                            <Button
                              variant={framework.is_active ? 'default' : 'outline'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFrameworkActive(framework.id, framework.is_active);
                              }}
                            >
                              {framework.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Framework Details & Default Setting */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Company Default</CardTitle>
                <CardDescription>
                  Set the default framework for your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentUser?.role === 'company_admin' || currentUser?.role === 'super_admin' ? (
                  <>
                    {frameworks.filter(f => f.is_active).length > 0 ? (
                      <div className="space-y-3">
                        {frameworks.filter(f => f.is_active).map(framework => (
                          <Button
                            key={framework.id}
                            variant={defaultFramework === framework.id ? 'default' : 'outline'}
                            className="w-full justify-start"
                            onClick={() => handleSetDefaultFramework(framework.id)}
                            disabled={savingDefault}
                          >
                            {defaultFramework === framework.id && (
                              <Check className="w-4 h-4 mr-2" />
                            )}
                            {framework.name}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">No active frameworks available</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-600">
                    Only company admins can change framework settings
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Framework Summary */}
            {selectedFramework && frameworkObj && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{frameworkObj.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Description</p>
                    <p className="text-sm text-slate-600">
                      {frameworkObj.description || 'No description available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Type</p>
                    <Badge className="bg-blue-600">{frameworkObj.framework_type}</Badge>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Criteria Count</p>
                    <p className="text-sm font-medium">{frameworkCriteria.length} criteria</p>
                  </div>
                  <Button
                    onClick={() => setShowCriteriaDialog(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    View All Criteria
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Criteria Dialog */}
      <Dialog open={showCriteriaDialog} onOpenChange={setShowCriteriaDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{frameworkObj?.name} - Evaluation Criteria</DialogTitle>
            <DialogDescription>
              Complete breakdown of all criteria and scoring levels for this framework
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {frameworkCriteria.length > 0 ? (
              frameworkCriteria.map((criterion, idx) => (
                <div key={criterion.id} className="space-y-3 pb-6 border-b last:border-b-0">
                  <div>
                    <h4 className="font-semibold text-slate-900">{criterion.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{criterion.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">{criterion.criterion_key}</Badge>
                      <span className="text-xs text-slate-500">Weight: {criterion.weight}</span>
                    </div>
                  </div>

                  {criterion.framework_scoring_rules && criterion.framework_scoring_rules.length > 0 && (
                    <div className="ml-2 space-y-2">
                      <p className="text-xs font-semibold text-slate-700 uppercase">Scoring Levels:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {criterion.framework_scoring_rules
                          .sort((a, b) => a.score_level - b.score_level)
                          .map(rule => (
                            <div key={rule.id} className="bg-slate-50 rounded p-2 text-xs">
                              <p className="font-medium text-slate-900">Level {rule.score_level}: {rule.label}</p>
                              <p className="text-slate-600">{rule.description}</p>
                              <p className="text-slate-500 mt-1">{rule.min_score}-{rule.max_score}%</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-600">No criteria found for this framework</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
