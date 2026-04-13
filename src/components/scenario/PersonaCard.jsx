import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Edit2 } from 'lucide-react';
import {
  UserCheck, Settings, DollarSign, Target, TrendingUp, Shield, Award,
  Briefcase, Headphones, UserCog, Users
} from 'lucide-react';

const BUYER_ROLE_ICONS = {
  primary_decision_maker: UserCheck,
  technical_evaluator: Settings,
  financial_approver: DollarSign,
  end_user: Target,
  influencer: TrendingUp,
  blocker: Shield,
  champion: Award
};

const SELLER_ROLE_ICONS = {
  account_executive: Briefcase,
  sales_engineer: Settings,
  solutions_consultant: Headphones,
  sales_manager: UserCog,
  sdr: Target,
  customer_success: UserCheck,
  presales_specialist: Award
};

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PersonaCard({ persona, type = 'buyer', onRemove, onEdit }) {
  const icons = type === 'buyer' ? BUYER_ROLE_ICONS : SELLER_ROLE_ICONS;
  const roleKey = type === 'buyer' ? 'role_in_scenario' : 'sales_role';
  const RoleIcon = icons[persona[roleKey]] || Users;
  const bgColor = type === 'buyer' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
  const avatarBg = type === 'buyer' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800';
  const roleName = persona[roleKey]?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Card className={`${bgColor} border hover:shadow-md transition-shadow`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`${avatarBg} w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm`}>
              {getInitials(persona.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate">{persona.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {persona.is_ai ? 'AI' : 'Human'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 truncate">{persona.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <RoleIcon className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-600">{roleName}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(persona)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(persona.persona_id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {persona.personality}
          </Badge>
          {persona.gender && (
            <Badge variant="outline" className="text-xs">
              {persona.gender}
            </Badge>
          )}
        </div>

        {persona.agenda && (
          <div className="mt-3 pt-3 border-t text-xs text-slate-600 line-clamp-2">
            <span className="font-semibold block mb-1">Agenda:</span>
            {persona.agenda}
          </div>
        )}
        {persona.responsibilities && (
          <div className="mt-3 pt-3 border-t text-xs text-slate-600 line-clamp-2">
            <span className="font-semibold block mb-1">Responsibilities:</span>
            {persona.responsibilities}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
