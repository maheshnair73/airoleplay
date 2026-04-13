import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TURN_TAKING_STYLES = [
  { value: 'organic', label: 'Organic', description: 'Natural conversation flow' },
  { value: 'structured', label: 'Structured', description: 'Formal turn-taking' },
  { value: 'competitive', label: 'Competitive', description: 'Participants interrupt each other' }
];

const CONFLICT_LEVELS = [
  { value: 'low', label: 'Low', description: 'Cooperative discussions' },
  { value: 'medium', label: 'Medium', description: 'Some disagreement' },
  { value: 'high', label: 'High', description: 'Significant conflict' }
];

function DynamicOption({ icon: Icon, label, description, value, onChange }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
      <Switch checked={value} onCheckedChange={onChange} className="mt-1" />
      <div className="flex-1 min-w-0">
        <Label className="font-semibold text-slate-900 block">{label}</Label>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

function SelectOption({ label, description, value, options, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="font-semibold text-slate-900">{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-slate-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Controls how the conversation flows between participants</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-slate-500">{option.description}</p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ConversationDynamicsSection({ dynamics, onChange }) {
  const handleToggle = (field, value) => {
    onChange({
      ...dynamics,
      [field]: value
    });
  };

  const handleSelectChange = (field, value) => {
    onChange({
      ...dynamics,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation Dynamics</CardTitle>
        <CardDescription>
          Configure how the AI participants will interact with each other during the roleplay
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            AI Behavior Settings
          </h4>

          <DynamicOption
            label="Allow AI Interruptions"
            description="AI participants can interrupt each other naturally, simulating real conversations"
            value={dynamics?.allow_ai_interruptions ?? true}
            onChange={(value) => handleToggle('allow_ai_interruptions', value)}
          />

          <DynamicOption
            label="Allow Internal Dialogue"
            description="AI participants can think aloud or show reasoning between responses"
            value={dynamics?.allow_ai_internal_dialogue ?? true}
            onChange={(value) => handleToggle('allow_ai_internal_dialogue', value)}
          />

          <DynamicOption
            label="Seller Collaboration"
            description="Sales team members can coordinate and build on each other's points"
            value={dynamics?.allow_seller_collaboration ?? true}
            onChange={(value) => handleToggle('allow_seller_collaboration', value)}
          />
        </div>

        <div className="border-t pt-6 space-y-6">
          <SelectOption
            label="Turn-Taking Style"
            description="How participants take turns in the conversation"
            value={dynamics?.turn_taking_style ?? 'organic'}
            options={TURN_TAKING_STYLES}
            onChange={(value) => handleSelectChange('turn_taking_style', value)}
          />

          <SelectOption
            label="Conflict Level"
            description="How much tension or disagreement exists between parties"
            value={dynamics?.conflict_level ?? 'medium'}
            options={CONFLICT_LEVELS}
            onChange={(value) => handleSelectChange('conflict_level', value)}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-slate-700">
          <p className="font-semibold mb-2">Tip:</p>
          <p>
            These settings shape the conversation flow without modifying individual persona personalities.
            Experiment with different combinations to match your desired scenario intensity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
