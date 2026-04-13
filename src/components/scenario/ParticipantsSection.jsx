import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';
import { PersonaFormCard } from './PersonaFormCard';
import { PersonaCard } from './PersonaCard';

export function ParticipantsSection({
  buyerPersonas = [],
  sellerPersonas = [],
  groupName = 'Sales Team',
  onAddBuyer,
  onAddSeller,
  onRemoveBuyer,
  onRemoveSeller,
  onGroupNameChange
}) {
  const [showBuyerForm, setShowBuyerForm] = useState(false);
  const [showSellerForm, setShowSellerForm] = useState(false);

  const totalPersonas = (buyerPersonas?.length || 0) + (sellerPersonas?.length || 0);

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div>
            <CardTitle>Scenario Participants</CardTitle>
            <CardDescription>Add buyer and seller personas for your multi-party scenario</CardDescription>
          </div>

          <div>
            <Label className="text-sm font-semibold">Participant Group Name</Label>
            <Input
              value={groupName}
              onChange={(e) => onGroupNameChange(e.target.value)}
              placeholder="e.g., Sales Team, Procurement Committee"
              className="mt-2"
              maxLength={80}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {totalPersonas > 0 && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {buyerPersonas?.map((persona) => (
              <PersonaCard
                key={persona.persona_id}
                persona={persona}
                type="buyer"
                onRemove={onRemoveBuyer}
              />
            ))}
            {sellerPersonas?.map((persona) => (
              <PersonaCard
                key={persona.persona_id}
                persona={persona}
                type="seller"
                onRemove={onRemoveSeller}
              />
            ))}
          </div>
        )}

        {totalPersonas === 0 && !showBuyerForm && !showSellerForm && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium mb-4">Add participants to your scenario</p>
            <p className="text-sm text-slate-500 mb-6">You need at least 2 personas (buyers and/or sellers)</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setShowBuyerForm(true)}
                className="gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Add Buyer Persona
              </Button>
              <Button
                onClick={() => setShowSellerForm(true)}
                className="gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Add Seller Persona
              </Button>
            </div>
          </div>
        )}

        <div className="border-t pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">Buyer Personas ({buyerPersonas?.length || 0})</h4>
            {!showBuyerForm && (
              <Button
                onClick={() => setShowBuyerForm(true)}
                size="sm"
                variant="outline"
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Buyer
              </Button>
            )}
          </div>

          {showBuyerForm && (
            <PersonaFormCard
              personaType="buyer"
              onAdd={(persona) => {
                onAddBuyer(persona);
                setShowBuyerForm(false);
              }}
              onCancel={() => setShowBuyerForm(false)}
            />
          )}

          {buyerPersonas?.length === 0 && !showBuyerForm && (
            <div className="text-center py-6 bg-blue-50 rounded-lg border border-blue-200 border-dashed">
              <p className="text-sm text-slate-600">No buyer personas added yet</p>
            </div>
          )}
        </div>

        <div className="border-t pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">Sales Team ({sellerPersonas?.length || 0})</h4>
            {!showSellerForm && (
              <Button
                onClick={() => setShowSellerForm(true)}
                size="sm"
                variant="outline"
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </Button>
            )}
          </div>

          {showSellerForm && (
            <PersonaFormCard
              personaType="seller"
              onAdd={(persona) => {
                onAddSeller(persona);
                setShowSellerForm(false);
              }}
              onCancel={() => setShowSellerForm(false)}
            />
          )}

          {sellerPersonas?.length === 0 && !showSellerForm && (
            <div className="text-center py-6 bg-green-50 rounded-lg border border-green-200 border-dashed">
              <p className="text-sm text-slate-600">No sales team members added yet</p>
            </div>
          )}
        </div>

        {totalPersonas > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">{totalPersonas} personas</span> in this scenario
              {buyerPersonas?.length > 0 && <span> • {buyerPersonas.length} buyer(s)</span>}
              {sellerPersonas?.length > 0 && <span> • {sellerPersonas.length} seller(s)</span>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
