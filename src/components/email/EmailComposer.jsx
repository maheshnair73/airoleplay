
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Mail, Send, Wand2, Save, Loader2, Sparkles, 
    User, Building, FileText, BookOpen, X
} from 'lucide-react';
import { EmailComposition } from '@/api/entities';
import { EmailTemplate } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations'; 
import { Document } from '@/api/entities';
import { toast } from 'sonner';
import { sendEmail as sendEmailFunction } from '@/api/functions'; // Added sendEmail from functions

const EMAIL_TYPES = [
    { value: 'cold_outreach', label: 'Cold Outreach' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'meeting_request', label: 'Meeting Request' },
    { value: 'thank_you', label: 'Thank You' },
    { value: 'nurture', label: 'Nurture' },
    { value: 'objection_response', label: 'Objection Response' },
    { value: 'custom', label: 'Custom' }
];

export default function EmailComposer({ open, onOpenChange, lead, deal, document, onEmailSent, initialType = 'follow_up', initialData = null }) {
    const [email, setEmail] = useState({
        subject: '',
        body: '',
        recipient_email: '',
        recipient_name: '',
        email_type: initialType,
        prompt_used: '',
        related_lead_id: null,
        related_deal_id: null,
        related_document_id: null
    });
    
    const [showAIPrompt, setShowAIPrompt] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');

    useEffect(() => {
        if (open) {
            loadTemplates();
            let baseEmail = {
                subject: '',
                body: '',
                recipient_email: '',
                recipient_name: '',
                email_type: initialType,
                prompt_used: '',
                related_lead_id: null,
                related_deal_id: null,
                related_document_id: null
            };

            if (lead) {
                baseEmail.recipient_email = lead.contact_email || '';
                baseEmail.recipient_name = lead.contact_name || '';
                baseEmail.related_lead_id = lead.id;
            }
            if (deal) {
                baseEmail.recipient_email = deal.contact_email || baseEmail.recipient_email;
                baseEmail.recipient_name = deal.contact_name || baseEmail.recipient_name;
                baseEmail.related_deal_id = deal.id;
            }
            if (document) {
                baseEmail.recipient_email = document.recipient_email || baseEmail.recipient_email;
                baseEmail.recipient_name = document.recipient_name || baseEmail.recipient_name;
                baseEmail.related_document_id = document.id;
            }
            
            if (initialData) {
                baseEmail.subject = initialData.subject || baseEmail.subject;
                baseEmail.body = initialData.body || baseEmail.body;
                baseEmail.recipient_email = initialData.recipient_email || baseEmail.recipient_email;
                baseEmail.recipient_name = initialData.recipient_name || baseEmail.recipient_name;
                // Preserve prompt_used from initialData if available, otherwise clear or set default
                baseEmail.prompt_used = initialData.prompt_used || '';
            } else {
                 // Reset subject, body, and email type if no initial data is provided
                baseEmail.subject = '';
                baseEmail.body = '';
                baseEmail.email_type = initialType;
                baseEmail.prompt_used = ''; // Clear prompt_used if no initial data
            }
            
            setEmail(baseEmail);
        }
    }, [open, lead, deal, document, initialType, initialData]);

    const loadTemplates = async () => {
        try {
            const templateList = await EmailTemplate.list('-usage_count');
            setTemplates(templateList);
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const generateAIEmail = async () => {
        if (!aiPrompt.trim()) {
            toast.error("Please enter a prompt describing the email you want to generate.");
            return;
        }

        setIsGenerating(true);
        try {
            const contextData = {
                recipient: {
                    name: email.recipient_name,
                    email: email.recipient_email,
                    company: lead?.company_name || deal?.company_name || document?.recipient_company_name,
                    title: lead?.contact_title || deal?.contact_title,
                    industry: lead?.industry
                },
                lead_info: lead ? {
                    status: lead.status,
                    source: lead.lead_source,
                    pain_points: lead.notes,
                    last_contact: lead.last_contact_date,
                    estimated_value: lead.estimated_deal_value
                } : null,
                deal_info: deal ? {
                    stage: deal.stage,
                    value: deal.deal_value,
                    close_date: deal.expected_close_date,
                    probability: deal.probability,
                    pain_points: deal.pain_points,
                    next_action: deal.next_action
                } : null,
                document_info: document ? {
                    document_name: document.document_name,
                    document_type: document.document_type,
                    status: document.status,
                    last_viewed: document.last_viewed_at,
                    summary: document.summary
                } : null
            };

            const prompt = `You are an expert sales professional writing a ${email.email_type.replace('_', ' ')} email.

Context about the recipient:
${JSON.stringify(contextData, null, 2)}

User's request: ${aiPrompt}

Please generate a professional, personalized email that:
1. Uses the recipient's name and company context
2. Is appropriate for the email type: ${email.email_type}
3. Follows best practices for sales communication
4. Is concise but compelling
5. Has a clear call-to-action

Return a JSON object with:
- subject: A compelling subject line
- body: The complete email body (plain text, professional formatting)`;

            const response = await InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        subject: { type: "string" },
                        body: { type: "string" }
                    },
                    required: ["subject", "body"]
                }
            });

            setEmail(prev => ({
                ...prev,
                subject: response.subject,
                body: response.body,
                prompt_used: aiPrompt
            }));

            setShowAIPrompt(false);
            setAiPrompt('');
            toast.success("Email generated successfully!");

        } catch (error) {
            console.error('Error generating email:', error);
            toast.error("Failed to generate email. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const applyTemplate = async (template) => {
        if (!template) return;

        try {
            const contextData = {
                recipient_name: email.recipient_name,
                company_name: lead?.company_name || deal?.company_name || document?.recipient_company_name,
                sender_name: "Your Name", // Placeholder, ideally from user context
                deal_value: deal?.deal_value ? `$${deal.deal_value.toLocaleString()}` : "",
                meeting_date: "Next Tuesday", // Placeholder, should be dynamic
                product_name: "Our Solution", // Placeholder, should be dynamic
                document_name: document?.document_name || ""
            };

            let subject = template.subject_template;
            let body = template.body_template;

            Object.entries(contextData).forEach(([key, value]) => {
                const placeholder = `{{${key}}}`;
                subject = subject.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
                body = body.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
            });

            setEmail(prev => ({
                ...prev,
                subject,
                body,
                prompt_used: `Using template: ${template.template_name}`
            }));

            await EmailTemplate.update(template.id, {
                usage_count: (template.usage_count || 0) + 1
            });

            toast.success(`Template "${template.template_name}" applied!`);

        } catch (error) {
            console.error('Error applying template:', error);
            toast.error("Failed to apply template.");
        }
    };

    const saveAsTemplate = async () => {
        if (!templateName.trim() || !email.subject.trim() || !email.body.trim()) {
            toast.error("Please provide a template name and complete email content.");
            return;
        }

        try {
            await EmailTemplate.create({
                template_name: templateName,
                template_type: email.email_type,
                subject_template: email.subject,
                body_template: email.body,
                use_case: `Template created from ${email.email_type} email`,
                is_active: true
            });

            toast.success("Email saved as template!");
            setShowSaveTemplate(false);
            setTemplateName('');
            loadTemplates();
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error("Failed to save template.");
        }
    };

    const sendEmail = async () => {
        if (!email.subject.trim() || !email.body.trim() || !email.recipient_email.trim()) {
            toast.error("Please fill in all required fields before sending.");
            return;
        }

        setIsSaving(true);
        try {
            // Step 1: Use the custom backend function for sending external emails
            await sendEmailFunction({
                to: email.recipient_email,
                subject: email.subject,
                body: email.body
            });

            // Step 2: If sending was successful, create the record in the app's database for tracking
            await EmailComposition.create({
                ...email,
                status: 'sent',
                sent_at: new Date().toISOString(),
                related_document_id: document ? document.id : null,
            });

            if (document) {
                await Document.update(document.id, { status: 'sent' });
            }

            if (lead) {
                const { LeadActivity } = await import('@/api/entities');
                await LeadActivity.create({
                    lead_id: lead.id,
                    activity_type: 'Email',
                    notes: `Email sent: "${email.subject}"`
                });
            }

            toast.success("Email sent successfully!");
            onOpenChange(false);
            if(onEmailSent) {
              onEmailSent();
            }
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error(`Failed to send email: ${error.message || 'Unknown error occurred'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const saveDraft = async () => {
        if (!email.subject.trim() || !email.body.trim()) {
            toast.error("Please add subject and content before saving draft.");
            return;
        }

        setIsSaving(true);
        try {
            await EmailComposition.create({
                ...email,
                status: 'draft'
            });
            toast.success("Email saved as draft!");
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving draft:', error);
            toast.error("Failed to save draft.");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredTemplates = templates.filter(t => 
        t.template_type === email.email_type && t.is_active
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-white" />
                        </div>
                        Compose Email
                        {(lead || deal || document) && (
                            <Badge variant="outline" className="ml-2">
                                {lead ? `${lead.contact_name}` : deal ? `${deal.contact_name}` : document ? `${document.recipient_name}` : ''}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Email Type and Actions Row */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium">Email Type:</label>
                            <Select 
                                value={email.email_type} 
                                onValueChange={(value) => setEmail(prev => ({ ...prev, email_type: value }))}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {EMAIL_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSaveTemplate(true)}
                                disabled={!email.subject.trim() || !email.body.trim()}
                            >
                                <Save className="w-4 h-4 mr-1" />
                                Save as Template
                            </Button>
                        </div>
                    </div>

                    {/* Recipient Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">To</label>
                            <Input
                                type="email"
                                value={email.recipient_email}
                                onChange={(e) => setEmail(prev => ({ ...prev, recipient_email: e.target.value }))}
                                placeholder="recipient@company.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Recipient Name</label>
                            <Input
                                value={email.recipient_name}
                                onChange={(e) => setEmail(prev => ({ ...prev, recipient_name: e.target.value }))}
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Subject</label>
                        <Input
                            value={email.subject}
                            onChange={(e) => setEmail(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Email subject line..."
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* Email Body - Takes up 2/3 of the space */}
                        <div className="col-span-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium">Email Content</label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAIPrompt(!showAIPrompt)}
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
                                >
                                    <Wand2 className="w-4 h-4 mr-1" />
                                    AI Generate
                                </Button>
                            </div>

                            {showAIPrompt ? (
                                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                                    <CardContent className="p-4">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium mb-2 block">
                                                    <Sparkles className="w-4 h-4 inline mr-1" />
                                                    Describe the email you want to generate
                                                </label>
                                                <Textarea
                                                    placeholder="e.g., Follow up on our demo call, address their concern about pricing, and suggest a pilot program"
                                                    value={aiPrompt}
                                                    onChange={(e) => setAiPrompt(e.target.value)}
                                                    className="min-h-24"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={generateAIEmail}
                                                    disabled={isGenerating || !aiPrompt.trim()}
                                                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                                                >
                                                    {isGenerating ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            Generate Email
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowAIPrompt(false);
                                                        setAiPrompt('');
                                                    }}
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Textarea
                                    value={email.body}
                                    onChange={(e) => setEmail(prev => ({ ...prev, body: e.target.value }))}
                                    placeholder="Write your email content here..."
                                    className="min-h-80"
                                />
                            )}
                        </div>

                        {/* Templates Sidebar - Takes up 1/3 of the space */}
                        <div>
                            <label className="text-sm font-medium mb-2 block flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                Templates ({filteredTemplates.length})
                            </label>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {filteredTemplates.length > 0 ? (
                                    filteredTemplates.map(template => (
                                        <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow border border-slate-200">
                                            <CardContent className="p-3" onClick={() => applyTemplate(template)}>
                                                <h4 className="font-medium text-sm text-slate-800 mb-1">{template.template_name}</h4>
                                                <p className="text-xs text-slate-600 mb-2">{template.use_case}</p>
                                                <p className="text-xs text-slate-500 truncate">Subject: {template.subject_template}</p>
                                                <Badge variant="outline" className="text-xs mt-2">
                                                    Used {template.usage_count || 0} times
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        No templates for {email.email_type.replace('_', ' ')} emails
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button 
                            variant="outline" 
                            onClick={saveDraft}
                            disabled={isSaving}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button 
                            onClick={sendEmail}
                            disabled={isSaving || !email.subject.trim() || !email.body.trim() || !email.recipient_email.trim()}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Send Email
                        </Button>
                    </div>
                </div>

                {/* Save Template Modal */}
                {showSaveTemplate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-96">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Save as Template</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Template Name</label>
                                        <Input
                                            placeholder="e.g., Follow-up after demo"
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowSaveTemplate(false);
                                                setTemplateName('');
                                            }}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={saveAsTemplate}
                                            disabled={!templateName.trim()}
                                            className="flex-1"
                                        >
                                            Save Template
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
