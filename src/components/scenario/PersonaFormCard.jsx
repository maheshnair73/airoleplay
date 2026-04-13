import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, ChevronDown, X } from 'lucide-react';

const BUYER_ROLES = [
  { value: 'primary_decision_maker', label: 'Primary Decision Maker' },
  { value: 'technical_evaluator', label: 'Technical Evaluator' },
  { value: 'financial_approver', label: 'Financial Approver' },
  { value: 'end_user', label: 'End User' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'blocker', label: 'Blocker' },
  { value: 'champion', label: 'Champion' }
];

const SELLER_ROLES = [
  { value: 'account_executive', label: 'Account Executive' },
  { value: 'sales_engineer', label: 'Sales Engineer' },
  { value: 'solutions_consultant', label: 'Solutions Consultant' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'sdr', label: 'SDR' },
  { value: 'customer_success', label: 'Customer Success' },
  { value: 'presales_specialist', label: 'Presales Specialist' }
];

const PERSONALITIES = [
  'Nice', 'Rude', 'Analytical', 'Formal', 'Chatty', 'Skeptical', 'Enthusiastic'
];

const GENDERS = ['Female', 'Male'];

export function PersonaFormCard({ personaType = 'buyer', onAdd, onCancel }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [persona, setPersona] = useState(
    personaType === 'buyer' ? {
      name: '', title: '', company_name: '', personality: 'Nice', gender: 'Female',
      role_in_scenario: 'primary_decision_maker', key_concerns: [], pain_points: [],
      agenda: '', likely_objections: [], interaction_style: '', is_ai: true
    } : {
      name: '', sales_role: 'account_executive', title: '', personality: 'Consultative',
      gender: 'Male', expertise_areas: [], responsibilities: '', interaction_style: '', is_ai: true
    }
  );

  const handleAdd = () => {
    if (!persona.name || !persona.title) {
      return;
    }
    onAdd(persona);
  };

  const roles = personaType === 'buyer' ? BUYER_ROLES : SELLER_ROLES;
  const roleKey = personaType === 'buyer' ? 'role_in_scenario' : 'sales_role';

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-transparent">
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold">Name *</Label>
            <Input
              value={persona.name}
              onChange={(e) => setPersona(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Sarah Chen"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Title *</Label>
            <Input
              value={persona.title}
              onChange={(e) => setPersona(prev => ({ ...prev, title: e.target.value }))}
              placeholder={personaType === 'buyer' ? 'e.g., CFO' : 'e.g., Senior AE'}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-semibold">{personaType === 'buyer' ? 'Role' : 'Sales Role'}</Label>
            <Select value={persona[roleKey]} onValueChange={(value) => setPersona(prev => ({ ...prev, [roleKey]: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Personality</Label>
            <Select value={persona.personality} onValueChange={(value) => setPersona(prev => ({ ...prev, personality: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERSONALITIES.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Gender</Label>
            <Select value={persona.gender} onValueChange={(value) => setPersona(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Switch checked={persona.is_ai} onCheckedChange={(checked) => setPersona(prev => ({ ...prev, is_ai: checked }))} />
          <Label className="text-sm">AI-controlled</Label>
        </div>

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-2">
            <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            Additional Details
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4 border-t mt-4">
            <div>
              <Label className="text-sm font-semibold">
                {personaType === 'buyer' ? 'Agenda' : 'Responsibilities'}
              </Label>
              <Textarea
                value={personaType === 'buyer' ? persona.agenda : persona.responsibilities}
                onChange={(e) => setPersona(prev => ({ ...prev, [personaType === 'buyer' ? 'agenda' : 'responsibilities']: e.target.value }))}
                placeholder={personaType === 'buyer' ? 'What do they want to achieve?' : 'What will they manage in this call?'}
                rows={2}
                className="mt-1"
              />
            </div>

            {personaType === 'buyer' && (
              <div>
                <Label className="text-sm font-semibold">Key Concerns</Label>
                <Textarea
                  value={persona.key_concerns?.join('\n')}
                  onChange={(e) => setPersona(prev => ({ ...prev, key_concerns: e.target.value.split('\n').filter(x => x) }))}
                  placeholder="One per line..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold">Interaction Style</Label>
              <Input
                value={persona.interaction_style}
                onChange={(e) => setPersona(prev => ({ ...prev, interaction_style: e.target.value }))}
                placeholder="e.g., Direct, Collaborative, Formal"
                className="mt-1"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleAdd} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add {personaType === 'buyer' ? 'Buyer' : 'Seller'}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
