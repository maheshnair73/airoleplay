
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Phone, 
    PhoneCall, 
    PhoneMissed, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    MessageSquare,
    User,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { CallRecord } from '@/api/entities';
import { toast } from 'sonner';

const CallStatusModal = ({ open, onOpenChange, callData, onComplete }) => {
    const [callOutcome, setCallOutcome] = useState('');
    const [disposition, setDisposition] = useState('');
    const [subDisposition, setSubDisposition] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentCallStatus, setCurrentCallStatus] = useState(null);

    useEffect(() => {
        if (open && callData) {
            // Reset state when modal opens
            setCurrentCallStatus(callData.callStatus || 'connecting');
            setCallOutcome('');
            setDisposition('');
            setSubDisposition('');
            setNotes('');
        }
    }, [open, callData]);
    
    const handleRefreshStatus = async () => {
        if (!callData?.callRecordId) return;
        setIsRefreshing(true);
        try {
            // Assuming CallRecord.get can fetch a record by ID and it contains 'call_status'
            const updatedRecord = await CallRecord.get(callData.callRecordId);
            if (updatedRecord && updatedRecord.call_status) {
                if(updatedRecord.call_status !== currentCallStatus) {
                    setCurrentCallStatus(updatedRecord.call_status);
                    toast.success(`Status updated: ${updatedRecord.call_status}`);
                    
                    const outcomeMap = {
                        'completed': 'connected',
                        'no_answer': 'no_answer',
                        'busy': 'busy',
                        'failed': 'failed',
                        'cancelled': 'failed', // Map cancelled to failed outcome
                        'ringing': null, // No specific outcome for ringing
                        'connecting': null // No specific outcome for connecting
                    };
                    const newOutcome = outcomeMap[updatedRecord.call_status];
                    if (newOutcome) {
                        setCallOutcome(newOutcome);
                    }
                } else {
                    toast.info("No status change detected.");
                }
            }
        } catch (error) {
            console.error('Failed to refresh call status', error);
            toast.error('Could not refresh call status.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const callOutcomes = [
        { value: 'connected', label: 'Connected & Spoke', icon: PhoneCall, color: 'bg-green-500' },
        { value: 'voicemail', label: 'Left Voicemail', icon: MessageSquare, color: 'bg-blue-500' },
        { value: 'no_answer', label: 'No Answer', icon: PhoneMissed, color: 'bg-yellow-500' },
        { value: 'busy', label: 'Busy Signal', icon: Phone, color: 'bg-orange-500' },
        { value: 'wrong_number', label: 'Wrong Number', icon: XCircle, color: 'bg-red-500' },
        { value: 'failed', label: 'Call Failed', icon: AlertTriangle, color: 'bg-red-500' }
    ];

    const dispositionOptions = {
        'connected': ['Interested', 'Not Interested', 'Needs Follow-up', 'Meeting Scheduled', 'Demo Requested'],
        'voicemail': ['Left Message', 'Mailbox Full', 'No Greeting'],
        'no_answer': ['No Answer', 'Rang Multiple Times'],
        'busy': ['Busy Signal', 'Call Waiting'],
        'wrong_number': ['Wrong Number', 'Disconnected'],
        'failed': ['Technical Issue', 'Network Error']
    };

    const subDispositionOptions = {
        'Interested': ['Very Interested', 'Somewhat Interested', 'Wants Information'],
        'Not Interested': ['Not a Fit', 'Bad Timing', 'Already Has Solution'],
        'Needs Follow-up': ['Call Back Later', 'Send Information', 'Follow up Next Week'],
        'Meeting Scheduled': ['Demo Booked', 'Discovery Call Set', 'Proposal Meeting'],
        'Demo Requested': ['Product Demo', 'Technical Demo', 'Executive Demo']
    };

    const handleSubmit = async () => {
        if (!callOutcome || !disposition) {
            toast.error("Please select both call outcome and disposition.");
            return;
        }

        setIsLoading(true);
        
        try {
            const dispositionData = {
                outcome: callOutcome,
                disposition: disposition,
                sub_disposition: subDisposition,
                notes: notes || `Call ${callOutcome}${disposition ? ` - ${disposition}` : ''}${subDisposition ? ` (${subDisposition})` : ''}`
            };

            await onComplete(dispositionData);
            
            // Reset form
            setCallOutcome('');
            setDisposition('');
            setSubDisposition('');
            setNotes('');
            
            onOpenChange(false);
            toast.success("Call disposition saved successfully!");
        } catch (error) {
            console.error('Error saving call disposition:', error);
            toast.error('Failed to save call disposition. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!callData) return null;

    const selectedOutcome = callOutcomes.find(outcome => outcome.value === callOutcome);
    const availableDispositions = dispositionOptions[callOutcome] || [];
    const availableSubDispositions = subDispositionOptions[disposition] || [];
    const statusColor = currentCallStatus === 'connecting' || currentCallStatus === 'ringing' ? 'bg-yellow-500' : 
                        currentCallStatus === 'completed' ? 'bg-green-500' : 'bg-red-500';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PhoneCall className="w-5 h-5 text-blue-500" />
                        Call Status Update
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Call Information */}
                    <Card className="bg-slate-50">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-500 mt-0.5" />
                                    <span className="font-medium">{callData.leadName}</span>
                                </div>
                                <Badge variant="outline">{callData.leadPhone}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${statusColor} ${currentCallStatus === 'connecting' || currentCallStatus === 'ringing' ? 'animate-ping' : ''}`}></div>
                                    <span>Status: <span className="font-medium capitalize">{currentCallStatus ? currentCallStatus.replace('_', ' ') : 'Connecting...'}</span></span>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleRefreshStatus} disabled={isRefreshing}>
                                    {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                    Refresh
                                </Button>
                            </div>
                            {callData.apiResponses?.dialResponse?.fullResponse && (
                                <details className="pt-2">
                                    <summary className="text-xs text-slate-600 cursor-pointer">API Response Details</summary>
                                    <pre className="text-xs text-slate-500 mt-1 overflow-auto max-h-20 bg-white p-2 rounded">
                                        {JSON.stringify(callData.apiResponses.dialResponse.fullResponse, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </CardContent>
                    </Card>

                    {/* Outcome Selection */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-slate-700">How did the call go?</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {callOutcomes.map((outcome) => (
                                <Button
                                    key={outcome.value}
                                    variant={callOutcome === outcome.value ? "default" : "outline"}
                                    onClick={() => {
                                        setCallOutcome(outcome.value);
                                        setDisposition('');
                                        setSubDisposition('');
                                    }}
                                    className={`justify-start h-12 text-base ${callOutcome === outcome.value ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    <outcome.icon className="w-5 h-5 mr-3" />
                                    {outcome.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Disposition and Notes */}
                    {callOutcome && (
                        <div className="space-y-4 pt-2 border-t">
                            <h3 className="text-sm font-medium text-slate-700">Add Call Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select value={disposition} onValueChange={(value) => {
                                    setDisposition(value);
                                    setSubDisposition('');
                                }} disabled={!availableDispositions.length}>
                                    <SelectTrigger><SelectValue placeholder="Select Disposition..." /></SelectTrigger>
                                    <SelectContent>
                                        {availableDispositions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={subDisposition} onValueChange={setSubDisposition} disabled={!availableSubDispositions.length}>
                                    <SelectTrigger><SelectValue placeholder="Select Sub-Disposition..." /></SelectTrigger>
                                    <SelectContent>
                                        {availableSubDispositions.map(sd => <SelectItem key={sd} value={sd}>{sd}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Textarea
                                placeholder="Add any additional notes about the call..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter className="pt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !callOutcome || !disposition}
                        className="w-full"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Save Call Disposition
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CallStatusModal;
