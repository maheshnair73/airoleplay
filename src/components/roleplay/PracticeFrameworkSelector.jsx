import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Target, DollarSign, ListChecks, HelpCircle, Info } from 'lucide-react';

const FRAMEWORK_ICONS = {
  'MEDDIC': Target,
  'BANT': DollarSign,
  'RUBRIC': ListChecks,
  'SPIN': HelpCircle
};

export default function PracticeFrameworkSelector({ isOpen, onClose, defaultFramework, onFrameworkSelect }) {
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState(defaultFramework);
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchFrameworks();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedFramework(defaultFramework);
  }, [defaultFramework]);

  const fetchFrameworks = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluation_frameworks')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFrameworks(data || []);

      for (const framework of data || []) {
        const { data: criteriaData } = await supabase
          .from('framework_criteria')
          .select('criterion_key, name')
          .eq('framework_id', framework.id)
          .order('display_order');

        setCriteria(prev => ({
          ...prev,
          [framework.id]: criteriaData || []
        }));
      }
    } catch (error) {
      console.error('Error fetching frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedFramework) {
      onFrameworkSelect(selectedFramework);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Evaluation Framework</DialogTitle>
          <DialogDescription>
            Choose which framework will be used to evaluate and score this practice session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <RadioGroup value={selectedFramework} onValueChange={setSelectedFramework}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frameworks.map(framework => {
                  const Icon = FRAMEWORK_ICONS[framework.framework_type] || ListChecks;
                  const frameworkCriteria = criteria[framework.id] || [];

                  return (
                    <div key={framework.id} className="relative">
                      <Label
                        htmlFor={`framework-${framework.id}`}
                        className="cursor-pointer"
                      >
                        <Card
                          className={`transition-all hover:shadow-md ${
                            selectedFramework === framework.id
                              ? 'ring-2 ring-blue-600 border-blue-600'
                              : 'hover:border-slate-300'
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{framework.name}</CardTitle>
                                </div>
                              </div>
                              <RadioGroupItem
                                value={framework.id}
                                id={`framework-${framework.id}`}
                                className="mt-1"
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {frameworkCriteria.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-700 mb-2">Key Criteria:</p>
                                <div className="flex flex-wrap gap-2">
                                  {frameworkCriteria.slice(0, 2).map(c => (
                                    <Badge key={c.criterion_key} variant="secondary" className="text-xs">
                                      {c.name}
                                    </Badge>
                                  ))}
                                  {frameworkCriteria.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{frameworkCriteria.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedFramework}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue with {frameworks.find(f => f.id === selectedFramework)?.name || 'Framework'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
