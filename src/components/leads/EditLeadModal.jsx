
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/api/entities';
import { toast } from 'sonner';
import { Loader2, Save, X, Plus, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TagInput = ({ label, items, setItems, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (inputValue.trim() && !items.includes(inputValue.trim())) {
            setItems([...items, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemove = (itemToRemove) => {
        setItems(items.filter(item => item !== itemToRemove));
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Input
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                />
                <Button type="button" size="sm" onClick={handleAdd}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {items.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {item}
                        <button type="button" onClick={() => handleRemove(item)} className="rounded-full hover:bg-black/10 p-0.5">
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
};

export function EditLeadModal({ open, onOpenChange, lead, onLeadUpdate, focusOnMeeting = false }) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm({
        defaultValues: {
            estimated_deal_value: '',
            probability: '',
            priority: 'Medium',
            budget_range: '',
            timeline: '',
            product_interest: '',
            notes: '',
            next_followup_date: '',
            next_action: '',
            personality_traits: [],
            pain_points: [],
            decision_makers: [],
            competitor_mentions: [],
            meeting_date_time: '',
            meeting_type: '',
            company_website: '',
            industry: '',
            company_size: '',
            annual_revenue: '',
        }
    });

    useEffect(() => {
        if (lead && open) {
            const defaultValues = {
                estimated_deal_value: lead.estimated_deal_value?.toString() || '',
                probability: lead.probability?.toString() || '',
                priority: lead.priority || 'Medium',
                budget_range: lead.budget_range || '',
                timeline: lead.timeline || '',
                product_interest: lead.product_interest || '',
                notes: lead.notes || '',
                next_followup_date: lead.next_followup_date || '',
                next_action: lead.next_action || '',
                personality_traits: lead.personality_traits || [],
                pain_points: lead.pain_points || [],
                decision_makers: lead.decision_makers || [],
                competitor_mentions: lead.competitor_mentions || [],
                meeting_date_time: lead.meeting_date_time ? new Date(lead.meeting_date_time).toISOString().slice(0, 16) : '',
                meeting_type: lead.meeting_type || '',
                company_website: lead.company_website || '',
                industry: lead.industry || '',
                company_size: lead.company_size || '',
                annual_revenue: lead.annual_revenue || '',
            };
            reset(defaultValues);
        } else if (!open) {
            reset();
        }
    }, [lead, open, reset]);

    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            let updateData = {};
            if (focusOnMeeting) {
                // Update only meeting-related fields and general notes
                updateData = {
                    notes: data.notes,
                    meeting_date_time: data.meeting_date_time || null,
                    meeting_type: data.meeting_type || null,
                };
            } else {
                // Full lead update
                updateData = {
                    ...data,
                    estimated_deal_value: data.estimated_deal_value ? Number(data.estimated_deal_value) : null,
                    probability: data.probability ? Number(data.probability) : null,
                    personality_traits: data.personality_traits || [],
                    pain_points: data.pain_points || [],
                    decision_makers: data.decision_makers || [],
                    competitor_mentions: data.competitor_mentions || [],
                    // Ensure meeting-specific fields are not sent or are nullified if not part of general lead update
                    meeting_date_time: undefined,
                    meeting_type: undefined,
                };
            }

            const updatedLead = await Lead.update(lead.id, updateData);
            toast.success(focusOnMeeting ? 'Meeting details updated successfully!' : 'Lead details updated successfully!');
            onLeadUpdate(updatedLead);
            onOpenChange(false);
        } catch (error) {
            console.error('Error updating lead/meeting:', error);
            toast.error(focusOnMeeting ? 'Failed to update meeting details' : 'Failed to update lead details');
        } finally {
            setIsLoading(false);
        }
    };

    // Watch for changes in select components or TagInput to keep them synced with RHF
    const priorityValue = watch('priority');
    const personalityTraits = watch('personality_traits') || [];
    const painPoints = watch('pain_points') || [];
    const decisionMakers = watch('decision_makers') || [];
    const competitorMentions = watch('competitor_mentions') || [];
    const meetingTypeValue = watch('meeting_type');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        {focusOnMeeting ? 'Edit Meeting Details' : 'Edit Lead Information'}
                    </DialogTitle>
                    <DialogDescription>
                        {focusOnMeeting ?
                            `Update the meeting details for ${lead?.contact_name || 'this lead'}.` :
                            `Update the details for ${lead?.contact_name || 'this lead'}.`
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {focusOnMeeting ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Meeting Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="meeting_date_time">Meeting Date & Time</Label>
                                        <Input
                                            id="meeting_date_time"
                                            type="datetime-local"
                                            {...register('meeting_date_time')}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="meeting_type">Meeting Type</Label>
                                        <Select
                                            value={meetingTypeValue}
                                            onValueChange={(value) => setValue('meeting_type', value)}
                                        >
                                            <SelectTrigger id="meeting_type">
                                                <SelectValue placeholder="Select meeting type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Demo">Demo</SelectItem>
                                                <SelectItem value="Discovery">Discovery</SelectItem>
                                                <SelectItem value="Follow-up">Follow-up</SelectItem>
                                                <SelectItem value="Closing">Closing</SelectItem>
                                                <SelectItem value="Initial Call">Initial Call</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="notes">Meeting Notes</Label>
                                    <Textarea
                                        id="notes"
                                        {...register('notes')}
                                        placeholder="Add any notes about this meeting..."
                                        className="min-h-20"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Tabs defaultValue="company_info" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="company_info">About Company</TabsTrigger>
                                <TabsTrigger value="deal_info">Deal Info</TabsTrigger>
                                <TabsTrigger value="sales_insights">Sales Insights</TabsTrigger>
                                <TabsTrigger value="follow_up_notes">Follow-up & Notes</TabsTrigger>
                            </TabsList>

                            <TabsContent value="company_info" className="py-4 space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Company Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="company_website">Company Website</Label>
                                        <Input id="company_website" placeholder="e.g., https://company.com" {...register('company_website')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="industry">Industry</Label>
                                        <Input id="industry" placeholder="e.g., Technology, Healthcare" {...register('industry')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="company_size">Company Size</Label>
                                        <Select value={watch('company_size')} onValueChange={(value) => setValue('company_size', value)}>
                                            <SelectTrigger id="company_size"><SelectValue placeholder="Select company size" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                                <SelectItem value="51-200">51-200 employees</SelectItem>
                                                <SelectItem value="201-1000">201-1000 employees</SelectItem>
                                                <SelectItem value="1000+">1000+ employees</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="annual_revenue">Annual Revenue</Label>
                                        <Input id="annual_revenue" placeholder="e.g., $10M - $50M" {...register('annual_revenue')} />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="deal_info" className="py-4 space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Deal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="estimated_deal_value">Estimated Deal Value ($)</Label>
                                        <Input id="estimated_deal_value" type="number" placeholder="e.g., 25000" {...register('estimated_deal_value')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="probability">Probability (%)</Label>
                                        <Input id="probability" type="number" min="0" max="100" placeholder="e.g., 75" {...register('probability')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={priorityValue} onValueChange={(value) => setValue('priority', value)}>
                                            <SelectTrigger id="priority"><SelectValue placeholder="Select priority" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="High">High</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="budget_range">Budget Range</Label>
                                        <Input id="budget_range" placeholder="e.g., $10K - $50K" {...register('budget_range')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="timeline">Decision Timeline</Label>
                                        <Input id="timeline" placeholder="e.g., Next Quarter, Q2 2024" {...register('timeline')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="product_interest">Product Interest</Label>
                                        <Input id="product_interest" placeholder="e.g., Enterprise Plan" {...register('product_interest')} />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="sales_insights" className="py-4">
                                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Sales Insights</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <div className="space-y-4">
                                        <TagInput label="Personality Traits" items={personalityTraits} setItems={(items) => setValue('personality_traits', items)} placeholder="e.g., Data-driven" />
                                        <TagInput label="Pain Points" items={painPoints} setItems={(items) => setValue('pain_points', items)} placeholder="e.g., High churn rate" />
                                    </div>
                                    <div className="space-y-4">
                                        <TagInput label="Decision Makers" items={decisionMakers} setItems={(items) => setValue('decision_makers', items)} placeholder="e.g., John Doe (CTO)" />
                                        <TagInput label="Competitor Mentions" items={competitorMentions} setItems={(items) => setValue('competitor_mentions', items)} placeholder="e.g., Competitor Inc." />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="follow_up_notes" className="py-4 space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Follow-up & Notes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="next_followup_date">Next Follow-up Date</Label>
                                        <Input id="next_followup_date" type="date" {...register('next_followup_date')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="next_action">Next Action</Label>
                                        <Input id="next_action" placeholder="e.g., Send proposal, Schedule demo" {...register('next_action')} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea id="notes" placeholder="Add any additional notes about this lead..." {...register('notes')} className="min-h-24" />
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isLoading || isSubmitting ? ( <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> ) : ( <><Save className="w-4 h-4 mr-2" />{focusOnMeeting ? 'Update Meeting' : 'Save Changes'}</> )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
