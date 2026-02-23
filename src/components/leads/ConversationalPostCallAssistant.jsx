import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, CheckCircle, Bot, Sparkles, Calendar, DollarSign, Target, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { Lead, LeadActivity } from '@/api/entities';
import { format } from 'date-fns';

const CONVERSATION_STEPS = {
  INITIAL: 'initial',
  CALL_OUTCOME: 'call_outcome',
  DETAILS: 'details',
  NEXT_STEPS: 'next_steps',
  SUMMARY: 'summary',
  COMPLETE: 'complete'
};

const QUICK_RESPONSES = {
  call_outcome: [
    { value: 'connected_positive', label: 'Connected - Positive', icon: ThumbsUp, color: 'green' },
    { value: 'connected_neutral', label: 'Connected - Neutral', icon: MessageSquare, color: 'blue' },
    { value: 'connected_negative', label: 'Connected - Not Interested', icon: ThumbsDown, color: 'red' },
    { value: 'voicemail', label: 'Left Voicemail', icon: MessageSquare, color: 'amber' },
    { value: 'no_answer', label: 'No Answer', icon: AlertCircle, color: 'slate' }
  ],
  next_steps: [
    { value: 'schedule_meeting', label: 'Schedule Meeting', icon: Calendar },
    { value: 'send_proposal', label: 'Send Proposal', icon: Target },
    { value: 'follow_up_call', label: 'Follow-up Call', icon: MessageSquare },
    { value: 'no_action', label: 'No Further Action', icon: X }
  ]
};

export default function ConversationalPostCallAssistant({ leadId, onComplete, onCancel }) {
  const [step, setStep] = useState(CONVERSATION_STEPS.INITIAL);
  const [lead, setLead] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);

  const [callData, setCallData] = useState({
    outcome: '',
    notes: '',
    duration: '',
    keyPoints: '',
    painPoints: '',
    nextSteps: '',
    followUpDate: '',
    dealValue: '',
    newStatus: ''
  });

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchLead = async () => {
    try {
      const leadData = await Lead.get(leadId);
      setLead(leadData);
      addBotMessage(
        `Great! Let's capture the details from your call with ${leadData.contact_name || 'the prospect'} at ${leadData.company_name || 'their company'}. How did the call go?`
      );
      setStep(CONVERSATION_STEPS.CALL_OUTCOME);
    } catch (error) {
      console.error('Failed to load lead:', error);
      toast.error('Failed to load lead details');
    } finally {
      setIsLoading(false);
    }
  };

  const addBotMessage = (message) => {
    setConversation(prev => [...prev, { type: 'bot', message, timestamp: new Date() }]);
  };

  const addUserMessage = (message) => {
    setConversation(prev => [...prev, { type: 'user', message, timestamp: new Date() }]);
  };

  const handleQuickResponse = (value, label) => {
    addUserMessage(label);
    processCallOutcome(value);
  };

  const processCallOutcome = (outcome) => {
    setCallData(prev => ({ ...prev, outcome }));

    let nextMessage = '';
    let suggestedStatus = '';

    switch (outcome) {
      case 'connected_positive':
        nextMessage = `Excellent! Sounds like a productive call. What were the key points discussed or main takeaways?`;
        suggestedStatus = 'qualified';
        break;
      case 'connected_neutral':
        nextMessage = `I see. What were the main discussion points from the call?`;
        suggestedStatus = 'contacted';
        break;
      case 'connected_negative':
        nextMessage = `I understand. Can you share any specific reasons they mentioned for not being interested?`;
        suggestedStatus = 'closed_lost';
        break;
      case 'voicemail':
        nextMessage = `Got it. I'll log this as a voicemail attempt. When would you like to follow up?`;
        suggestedStatus = 'contacted';
        break;
      case 'no_answer':
        nextMessage = `Noted. When should we schedule the next call attempt?`;
        suggestedStatus = 'contacted';
        break;
    }

    setCallData(prev => ({ ...prev, newStatus: suggestedStatus }));
    addBotMessage(nextMessage);
    setStep(CONVERSATION_STEPS.DETAILS);
  };

  const handleDetailsSubmit = () => {
    if (!callData.notes && !callData.keyPoints) {
      toast.error('Please provide some call details');
      return;
    }

    addUserMessage(callData.notes || callData.keyPoints);

    if (callData.outcome === 'connected_positive') {
      addBotMessage(`Great! What would you like to do next with this lead?`);
      setStep(CONVERSATION_STEPS.NEXT_STEPS);
    } else if (callData.outcome === 'connected_negative') {
      addBotMessage(`Thank you for the details. I'll update the lead status and log this activity.`);
      setStep(CONVERSATION_STEPS.SUMMARY);
    } else {
      addBotMessage(`When would you like to follow up?`);
      setStep(CONVERSATION_STEPS.NEXT_STEPS);
    }
  };

  const handleNextStepsResponse = (value, label) => {
    addUserMessage(label);
    setCallData(prev => ({ ...prev, nextSteps: value }));

    let nextMessage = '';
    let finalStatus = callData.newStatus;

    switch (value) {
      case 'schedule_meeting':
        nextMessage = `Perfect! I'll suggest updating the status to "Meeting Scheduled". Any specific date in mind?`;
        finalStatus = 'meeting_scheduled';
        break;
      case 'send_proposal':
        nextMessage = `Excellent! I'll update the status to "Proposal Sent". What's the estimated deal value?`;
        finalStatus = 'proposal_sent';
        break;
      case 'follow_up_call':
        nextMessage = `Sure thing! When should we schedule the follow-up?`;
        break;
      case 'no_action':
        nextMessage = `Understood. I'll log the activity without scheduling follow-up.`;
        break;
    }

    setCallData(prev => ({ ...prev, newStatus: finalStatus }));
    addBotMessage(nextMessage);
    setStep(CONVERSATION_STEPS.SUMMARY);
  };

  const handleSaveActivity = async () => {
    setIsSaving(true);

    try {
      const updates = {};
      if (callData.newStatus) {
        updates.status = callData.newStatus;
      }
      if (callData.dealValue) {
        updates.deal_value = parseFloat(callData.dealValue);
      }
      if (callData.notes || callData.keyPoints) {
        updates.notes = (lead.notes || '') + `\n\n[Call ${format(new Date(), 'PPp')}]\n${callData.notes || callData.keyPoints}`;
      }

      if (Object.keys(updates).length > 0) {
        await Lead.update(leadId, updates);
      }

      const activityData = {
        lead_id: leadId,
        activity_type: 'call',
        subject: `Call - ${QUICK_RESPONSES.call_outcome.find(r => r.value === callData.outcome)?.label}`,
        description: callData.notes || callData.keyPoints || '',
        outcome: callData.outcome,
        next_steps: callData.nextSteps,
        follow_up_date: callData.followUpDate || null,
        created_at: new Date().toISOString()
      };

      await LeadActivity.create(activityData);

      addBotMessage(`Perfect! I've updated ${lead.contact_name}'s record and logged all the call details. You're all set!`);
      setStep(CONVERSATION_STEPS.COMPLETE);

      toast.success('Call activity saved successfully!');

      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);

    } catch (error) {
      console.error('Failed to save activity:', error);
      toast.error('Failed to save call activity');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <CardTitle>Post-Call Assistant</CardTitle>
              <p className="text-sm text-blue-50 mt-1">
                Let's quickly capture what happened on your call
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.type === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {msg.type === 'bot' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-semibold text-slate-600">AI Assistant</span>
                  </div>
                )}
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {step === CONVERSATION_STEPS.CALL_OUTCOME && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">How did the call go?</Label>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_RESPONSES.call_outcome.map((response) => {
                const Icon = response.icon;
                return (
                  <Button
                    key={response.value}
                    variant="outline"
                    onClick={() => handleQuickResponse(response.value, response.label)}
                    className={`justify-start h-auto py-3 hover:border-${response.color}-500 hover:bg-${response.color}-50`}
                  >
                    <Icon className={`w-5 h-5 mr-3 text-${response.color}-500`} />
                    <span className="font-medium">{response.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {step === CONVERSATION_STEPS.DETAILS && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="keyPoints">Key Discussion Points</Label>
              <Textarea
                id="keyPoints"
                placeholder="What were the main topics discussed?"
                value={callData.keyPoints}
                onChange={(e) => setCallData(prev => ({ ...prev, keyPoints: e.target.value }))}
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any other important details..."
                value={callData.notes}
                onChange={(e) => setCallData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="mt-2"
              />
            </div>
            <Button onClick={handleDetailsSubmit} className="w-full bg-blue-500 hover:bg-blue-600">
              <Send className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </div>
        )}

        {step === CONVERSATION_STEPS.NEXT_STEPS && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">What's the next step?</Label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_RESPONSES.next_steps.map((response) => {
                const Icon = response.icon;
                return (
                  <Button
                    key={response.value}
                    variant="outline"
                    onClick={() => handleNextStepsResponse(response.value, response.label)}
                    className="justify-start h-auto py-3"
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    <span className="font-medium">{response.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {step === CONVERSATION_STEPS.SUMMARY && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {(callData.nextSteps === 'send_proposal' || callData.nextSteps === 'schedule_meeting') && (
                <div>
                  <Label htmlFor="dealValue">Estimated Deal Value (Optional)</Label>
                  <Input
                    id="dealValue"
                    type="number"
                    placeholder="e.g., 50000"
                    value={callData.dealValue}
                    onChange={(e) => setCallData(prev => ({ ...prev, dealValue: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              )}

              {callData.nextSteps !== 'no_action' && (
                <div>
                  <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={callData.followUpDate}
                    onChange={(e) => setCallData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Summary
              </h4>
              <ul className="text-sm space-y-1 text-slate-700">
                <li><strong>Outcome:</strong> {QUICK_RESPONSES.call_outcome.find(r => r.value === callData.outcome)?.label}</li>
                {callData.newStatus && <li><strong>New Status:</strong> {callData.newStatus.replace('_', ' ')}</li>}
                {callData.nextSteps && <li><strong>Next Step:</strong> {QUICK_RESPONSES.next_steps.find(r => r.value === callData.nextSteps)?.label}</li>}
              </ul>
            </div>

            <Button
              onClick={handleSaveActivity}
              disabled={isSaving}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save & Complete
                </>
              )}
            </Button>
          </div>
        )}

        {step === CONVERSATION_STEPS.COMPLETE && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">All Done!</h3>
            <p className="text-slate-600">Your call activity has been saved successfully.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
