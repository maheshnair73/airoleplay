import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, AlertTriangle, Clock, Target, Building } from 'lucide-react';
import VoiceCallManager from './VoiceCallManager';

export default function CallInitiationModal({ lead, open, onOpenChange }) {
    const [showCallManager, setShowCallManager] = useState(false);
    const [hasConsent, setHasConsent] = useState(false);

    const handleStartCall = () => {
        if (!hasConsent) {
            return;
        }
        setShowCallManager(true);
    };

    if (showCallManager) {
        return (
            <VoiceCallManager 
                lead={lead}
                open={showCallManager}
                onOpenChange={(open) => {
                    setShowCallManager(open);
                    if (!open) {
                        onOpenChange(false);
                    }
                }}
            />
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Initiate Voice Call
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Lead Info */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {lead.contact_name?.charAt(0) || 'L'}
                            </div>
                            <div>
                                <h3 className="font-semibold">{lead.contact_name}</h3>
                                <p className="text-sm text-slate-600">{lead.contact_title}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-slate-400" />
                                <span>{lead.company_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>{lead.contact_phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-slate-400" />
                                <Badge variant="outline">{lead.status}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Notice */}
                    <Alert className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            <strong>Important:</strong> This call will be recorded and analyzed for coaching purposes. 
                            Ensure you comply with local recording laws and have proper consent.
                        </AlertDescription>
                    </Alert>

                    {/* Consent Checkbox */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="consent"
                            checked={hasConsent}
                            onChange={(e) => setHasConsent(e.target.checked)}
                            className="mt-1"
                        />
                        <label htmlFor="consent" className="text-sm text-slate-700">
                            I confirm that I have the right to record this call and will obtain proper consent 
                            from the recipient as required by applicable laws.
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStartCall}
                            disabled={!hasConsent || !lead.contact_phone}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            Start Call
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}