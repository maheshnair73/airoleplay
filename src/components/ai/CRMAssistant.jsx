
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    Bot, 
    Phone, 
    Mail, 
    Calendar, 
    Bell, 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    Eye,
    Send,
    Sparkles,
    BrainCircuit,
    Zap
} from 'lucide-react';
import { LeadActivity } from '@/api/entities';
import { Lead } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { sendEmail as sendEmailFunction } from '@/api/functions'; // Use the custom function
import { format } from 'date-fns';
import { toast } from 'sonner';
import eventBus from '@/components/utils/eventBus'; // Corrected import for eventBus

export default function CRMAssistant({ lead, onLeadUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('disposition');
    const [isProcessing, setIsProcessing] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    
    // Disposition tracking
    const [disposition, setDisposition] = useState('');
    const [subDisposition, setSubDisposition] = useState('');
    const [callNotes, setCallNotes] = useState('');
    const [nextAction, setNextAction] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');

    // AI suggestions
    const [aiSuggestions, setAiSuggestions] = useState({
        disposition: '',
        nextAction: '',
        emailDraft: '',
        followUpDate: '',
        priority: ''
    });

    const dispositionOptions = {
        'Connected': ['Interested', 'Not Interested', 'Callback Requested', 'Decision Maker Not Available'],
        'Voicemail': ['Left Detailed Message', 'Left Brief Message', 'Mailbox Full'],
        'No Answer': ['Rang Multiple Times', 'Straight to Voicemail', 'Line Busy'],
        'Not Available': ['In Meeting', 'Out of Office', 'Wrong Number'],
        'Meeting Held': ['Excellent', 'Good', 'Average', 'Poor', 'No Show']
    };

    // AI Analysis based on lead data
    const analyzeLeadContext = useCallback(async () => {
        if (!lead) return;
        
        setIsProcessing(true);
        try {
            const prompt = `
            Analyze this lead and provide intelligent CRM suggestions:
            
            Lead: ${lead.contact_name} at ${lead.company_name}
            Status: ${lead.status}
            Industry: ${lead.industry}
            Company Size: ${lead.company_size}
            Last Contact: ${lead.last_contact_date || 'Never'}
            Notes: ${lead.notes || 'No notes'}
            Deal Value: ${lead.estimated_deal_value ? `$${lead.estimated_deal_value}` : 'Not set'}
            
            Based on this information, suggest:
            1. Most likely call disposition if I just called them
            2. Best next action to take
            3. Appropriate follow-up timeline
            4. Email subject and brief outline
            5. Lead priority level (High/Medium/Low)
            
            Consider their industry, company size, and current status.
            `;

            const response = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        likely_disposition: { type: "string" },
                        next_action: { type: "string" },
                        follow_up_days: { type: "number" },
                        email_subject: { type: "string" },
                        email_outline: { type: "string" },
                        priority: { type: "string" },
                        reasoning: { type: "string" }
                    }
                }
            });

            setAiSuggestions({
                disposition: response.likely_disposition,
                nextAction: response.next_action,
                emailDraft: `Subject: ${response.email_subject}\n\n${response.email_outline}`,
                followUpDate: new Date(Date.now() + response.follow_up_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                priority: response.priority,
                reasoning: response.reasoning
            });

        } catch (error) {
            console.error('Error analyzing lead:', error);
            toast.error('Failed to get AI suggestions');
        } finally {
            setIsProcessing(false);
        }
    }, [lead, setIsProcessing, setAiSuggestions]); // Added lead, setIsProcessing, setAiSuggestions as dependencies

    // Effect to listen for eventBus requests to open the assistant
    useEffect(() => {
        const handleOpenRequest = (data) => {
            if (lead && data.leadId === lead.id) { // Ensure lead is not null
                setIsOpen(true);
                analyzeLeadContext();
            }
        };

        eventBus.on('open-crm-assistant', handleOpenRequest);

        return () => {
            // Correctly reference the same function to remove the listener
            eventBus.off('open-crm-assistant', handleOpenRequest);
        };
    }, [lead, analyzeLeadContext]); // Added analyzeLeadContext to dependencies

    // Save call disposition
    const saveDisposition = async () => {
        if (!disposition || !callNotes) {
            toast.error('Please select disposition and add notes');
            return;
        }

        try {
            // Create activity record
            await LeadActivity.create({
                lead_id: lead.id,
                activity_type: 'Call',
                disposition: disposition,
                sub_disposition: subDisposition,
                notes: callNotes
            });

            // Update lead with next action and follow-up date
            const leadUpdates = {};
            if (nextAction) leadUpdates.next_action = nextAction;
            if (followUpDate) leadUpdates.next_followup_date = followUpDate;
            
            if (Object.keys(leadUpdates).length > 0) {
                await Lead.update(lead.id, leadUpdates);
                onLeadUpdate(leadUpdates);
            }

            toast.success('Call disposition saved successfully!');
            
            // Reset form
            setDisposition('');
            setSubDisposition('');
            setCallNotes('');
            setNextAction('');
            setFollowUpDate('');
            
        } catch (error) {
            console.error('Error saving disposition:', error);
            toast.error('Failed to save call disposition');
        }
    };

    // AI-powered email draft
    const draftFollowUpEmail = async () => {
        setIsProcessing(true);
        try {
            const prompt = `
            Draft a professional follow-up email based on this call:
            
            Lead: ${lead.contact_name} at ${lead.company_name}
            Call Disposition: ${disposition}
            Sub-disposition: ${subDisposition}
            Call Notes: ${callNotes}
            Next Action: ${nextAction}
            
            Create a personalized email that:
            1. References our conversation
            2. Addresses any concerns mentioned
            3. Provides clear next steps
            4. Has an appropriate call-to-action
            `;

            const response = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        subject: { type: "string" },
                        body: { type: "string" }
                    }
                }
            });

            // Use the custom backend function to send the email
            await sendEmailFunction({
                to: lead.contact_email,
                subject: response.subject,
                body: response.body
            });

            toast.success('Follow-up email sent successfully!');

        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send follow-up email');
        } finally {
            setIsProcessing(false);
        }
    };

    // Schedule follow-up meeting
    const scheduleFollowUp = () => {
        const meetingDate = new Date(followUpDate);
        const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
        googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
        googleCalendarUrl.searchParams.set('text', `Follow-up with ${lead.contact_name}`);
        googleCalendarUrl.searchParams.set('dates', 
            `${meetingDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
        );
        googleCalendarUrl.searchParams.set('details', `Follow-up meeting with ${lead.contact_name} from ${lead.company_name}\n\nNext Action: ${nextAction}`);
        
        if (lead.contact_email) {
            googleCalendarUrl.searchParams.set('add', lead.contact_email);
        }
        
        window.open(googleCalendarUrl.toString(), '_blank');
        toast.success('Calendar event created!');
    };

    return (
        <>
            {/* AI Assistant Trigger */}
            <Button
                onClick={() => {
                    setIsOpen(true);
                    analyzeLeadContext();
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
                <BrainCircuit className="w-4 h-4 mr-2" />
                AI Assistant
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-purple-600" />
                            AI CRM Assistant - {lead?.contact_name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* AI Insights Banner */}
                        {aiSuggestions.reasoning && (
                            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-purple-800 mb-1">AI Insights</h4>
                                            <p className="text-sm text-purple-700">{aiSuggestions.reasoning}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button variant="outline" onClick={() => setActiveTab('disposition')} className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Log Call
                            </Button>
                            <Button variant="outline" onClick={() => setActiveTab('email')} className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Send Email
                            </Button>
                            <Button variant="outline" onClick={() => setActiveTab('schedule')} className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Schedule
                            </Button>
                            <Button variant="outline" onClick={() => setActiveTab('reminders')} className="flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Reminders
                            </Button>
                        </div>

                        {/* Main Content Areas */}
                        {activeTab === 'disposition' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="w-5 h-5" />
                                        Call Disposition & Next Steps
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Call Disposition</label>
                                            <Select value={disposition} onValueChange={setDisposition}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select disposition" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(dispositionOptions).map(option => (
                                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {aiSuggestions.disposition && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setDisposition(aiSuggestions.disposition)}
                                                    className="mt-1 text-purple-600 hover:text-purple-700"
                                                >
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    Use AI Suggestion: {aiSuggestions.disposition}
                                                </Button>
                                            )}
                                        </div>

                                        {disposition && (
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Sub-Disposition</label>
                                                <Select value={subDisposition} onValueChange={setSubDisposition}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select sub-disposition" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dispositionOptions[disposition]?.map(option => (
                                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Call Notes</label>
                                        <Textarea
                                            placeholder="What was discussed? Any objections, pain points, or next steps mentioned?"
                                            value={callNotes}
                                            onChange={(e) => setCallNotes(e.target.value)}
                                            className="min-h-24"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Next Action</label>
                                            <Input
                                                placeholder="What's the next step?"
                                                value={nextAction}
                                                onChange={(e) => setNextAction(e.target.value)}
                                            />
                                            {aiSuggestions.nextAction && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setNextAction(aiSuggestions.nextAction)}
                                                    className="mt-1 text-purple-600 hover:text-purple-700"
                                                >
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    Use AI Suggestion
                                                </Button>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Follow-up Date</label>
                                            <Input
                                                type="date"
                                                value={followUpDate}
                                                onChange={(e) => setFollowUpDate(e.target.value)}
                                            />
                                            {aiSuggestions.followUpDate && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setFollowUpDate(aiSuggestions.followUpDate)}
                                                    className="mt-1 text-purple-600 hover:text-purple-700"
                                                >
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    Use AI Suggestion
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button onClick={saveDisposition} disabled={isProcessing}>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Save Disposition
                                        </Button>
                                        
                                        {disposition && callNotes && (
                                            <>
                                                <Button 
                                                    variant="outline" 
                                                    onClick={draftFollowUpEmail}
                                                    disabled={isProcessing}
                                                >
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Follow-up Email
                                                </Button>
                                                
                                                {followUpDate && (
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={scheduleFollowUp}
                                                    >
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        Schedule Follow-up
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'reminders' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="w-5 h-5" />
                                        Smart Reminders & Alerts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                <span className="font-medium text-yellow-800">Upcoming Reminders</span>
                                            </div>
                                            <p className="text-sm text-yellow-700">
                                                Follow up with {lead?.contact_name} on {followUpDate || 'scheduled date'} - {nextAction || 'Complete next action'}
                                            </p>
                                        </div>
                                        
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Eye className="w-4 h-4 text-blue-600" />
                                                <span className="font-medium text-blue-800">Document Engagement Alert</span>
                                            </div>
                                            <p className="text-sm text-blue-700">
                                                I'll notify you when {lead?.contact_name} views your shared documents or spends significant time reviewing materials.
                                            </p>
                                        </div>
                                        
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-green-600" />
                                                <span className="font-medium text-green-800">AI Recommendations</span>
                                            </div>
                                            <p className="text-sm text-green-700">
                                                Based on similar successful deals, I recommend focusing on {lead?.pain_points?.[0] || 'their main pain points'} and scheduling a demo within the next week.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
