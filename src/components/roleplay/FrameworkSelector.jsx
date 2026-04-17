import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const FRAMEWORK_DESCRIPTIONS = {
  'MEDDIC': 'Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion',
  'BANT': 'Budget, Authority, Need, Timeline',
  'RUBRIC': 'Custom scoring rubric with flexible categories and performance levels',
  'SPIN': 'Situation, Problem, Implication, Need-payoff questioning'
};

export default function FrameworkSelector({ value, onChange, className = '' }) {
  const [frameworks, setFrameworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState({});

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluation_frameworks')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFrameworks(data || []);

      // Fetch criteria for each framework
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Info className="w-5 h-5 text-blue-600" />
        <p className="text-sm text-slate-600">
          Select an evaluation framework. This determines how practice sessions will be analyzed and scored.
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frameworks.map(framework => {
            const Icon = FRAMEWORK_ICONS[framework.framework_type] || ListChecks;
            const frameworkCriteria = criteria[framework.id] || [];

            return (
              <div key={framework.id} className="relative">
                <div className="absolute inset-0 pointer-events-none">
                  <input
                    type="radio"
                    id={`framework-${framework.id}`}
                    name="framework"
                    value={framework.id}
                    className="sr-only"
                  />
                </div>
                <Label
                  htmlFor={`framework-${framework.id}`}
                  className="cursor-pointer"
                >
                  <Card
                    className={`transition-all hover:shadow-md ${
                      value === framework.id
                        ? 'ring-2 ring-blue-600 border-blue-600'
                        : 'hover:border-slate-300'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{framework.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {framework.framework_type}
                            </CardDescription>
                          </div>
                        </div>
                        <RadioGroupItem
                          value={framework.id}
                          id={`radio-${framework.id}`}
                          className="mt-1"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-600">
                        {FRAMEWORK_DESCRIPTIONS[framework.framework_type]}
                      </p>
                      {frameworkCriteria.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-2">Key Criteria:</p>
                          <div className="flex flex-wrap gap-2">
                            {frameworkCriteria.slice(0, 3).map(c => (
                              <Badge key={c.criterion_key} variant="secondary" className="text-xs">
                                {c.name}
                              </Badge>
                            ))}
                            {frameworkCriteria.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{frameworkCriteria.length - 3} more
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
    </div>
  );
}
