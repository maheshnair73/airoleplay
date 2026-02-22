import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
    Phone, PhoneCall, Loader2, AlertCircle, CheckCircle2,
    User, Building, Mail, MapPin, Target
} from 'lucide-react';
import { toast } from 'sonner';
import { initiateVoiceCall } from '@/api/functions';

const CALL_SCRIPTS = {
    cold_outreach: {
        name: "Cold Outreach",
        description: "First-time call to introduce your solution",
        color: "bg-blue-100 text-blue-800"
    },
    follow_up: {
        name: "Follow-up Call", 
        description: "Continue previous conversation",
        color: "bg-green-100 text-green-800"
    },
    demo_booking: {
        name: "Demo Booking",
        description: "Schedule a product demonstration",
        color: "bg-purple-100 text-purple-800"
    },
    closing: {
        name: "Closing Call",
        description: "Get final commitment and close deal",
        color: "bg-orange-100 text-orange-800"
    }
};

export default function LiveVoiceCallModal({ lead, open, onOpenChange, onCallCompleted }) {
    const [callScript, setCallScript] = useState('cold_outreach');
    const [customInstructions, setCustomInstructions] = useState('');
    const [isInitiating, setIsInitiating] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(lead?.contact_phone || '');

    const handleInitiateCall = async () => {
        if (!phoneNumber.trim()) {
            toast.error("Please enter a phone number");
            return;
        }

        setIsInitiating(true);
        try {
            const { data } = await initiateVoiceCall({
                leadId: lead.id,
                callScript,
                customInstructions,
                phoneNumber: phoneNumber.trim()
            });

            toast.success("Voice call initiated successfully!");
            
            // Close modal and notify parent
            onOpenChange(false);
            if (onCallCompleted) {
                onCallCompleted(data);
            }

        } catch (error) {
            console.error('Error initiating call:', error);
            toast.error("Failed to initiate call. Please try again.");
        } finally {
            setIsInitiating(false);
        }
    };

    if (!lead) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <PhoneCall className="w-6 h-6 text-blue-600" />
                        AI Voice Call - {lead.contact_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Lead Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="font-semibold text-slate-900">{lead.contact_name}</p>
                                    <p className="text-sm text-slate-600">{lead.contact_title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="font-semibold text-slate-900">{lead.company_name}</p>
                                    <p className="text-sm text-slate-600">{lead.industry}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter phone number"
                        />
                    </div>

                    {/* Call Script Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Call Script
                        </label>
                        <Select value={callScript} onValueChange={setCallScript}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select call script" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(CALL_SCRIPTS).map(([key, script]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <Badge className={script.color}>
                                                {script.name}
                                            </Badge>
                                            <span className="text-sm text-slate-600">{script.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Instructions */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Custom Instructions (Optional)
                        </label>
                        <Textarea
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            placeholder="Add any specific talking points or instructions for this call..."
                            className="h-24"
                        />
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <h4 className="font-semibold text-amber-800">Important Notice</h4>
                        </div>
                        <p className="text-sm text-amber-700">
                            This will initiate a real phone call using AI voice technology. Make sure you have permission 
                            to contact this lead and comply with all applicable regulations.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleInitiateCall}
                            disabled={isInitiating || !phoneNumber.trim()}
                            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        >
                            {isInitiating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Initiating Call...
                                </>
                            ) : (
                                <>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Start AI Voice Call
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}