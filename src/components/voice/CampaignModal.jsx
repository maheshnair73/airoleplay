import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';

export default function CampaignModal({ open, onOpenChange, onSave, campaign, leads }) {
    const [campaignData, setCampaignData] = useState({
        name: '',
        description: '',
        filters: { search: '', status: 'new', source: 'all' },
        config: { 
            callScript: 'cold_outreach', 
            customInstructions: '',
            qualification_criteria: '',
            key_questions: [''],
            transfer_triggers: ['']
        }
    });

    useEffect(() => {
        if (campaign) {
            setCampaignData({
                ...campaign,
                config: {
                    ...campaign.config,
                    key_questions: campaign.config.key_questions?.length ? campaign.config.key_questions : [''],
                    transfer_triggers: campaign.config.transfer_triggers?.length ? campaign.config.transfer_triggers : ['']
                }
            });
        } else {
            setCampaignData({
                name: '',
                description: '',
                filters: { search: '', status: 'new', source: 'all' },
                config: { 
                    callScript: 'cold_outreach', 
                    customInstructions: '',
                    qualification_criteria: 'The lead expresses a clear need for our product, has decision-making power or can connect to one, and agrees to a follow-up meeting.',
                    key_questions: ['What are the biggest challenges you are facing with your current sales process?'],
                    transfer_triggers: ['demo', 'pricing', 'speak to a human', 'representative']
                }
            });
        }
    }, [campaign, open]);

    const handleFieldChange = (field, value) => {
        setCampaignData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleFilterChange = (field, value) => {
        setCampaignData(prev => ({ ...prev, filters: { ...prev.filters, [field]: value } }));
    };

    const handleConfigChange = (field, value) => {
        setCampaignData(prev => ({ ...prev, config: { ...prev.config, [field]: value } }));
    };
    
    const handleArrayChange = (field, index, value) => {
        const newArray = [...campaignData.config[field]];
        newArray[index] = value;
        handleConfigChange(field, newArray);
    };

    const addArrayItem = (field) => {
        handleConfigChange(field, [...campaignData.config[field], '']);
    };
    
    const removeArrayItem = (field, index) => {
        const newArray = campaignData.config[field].filter((_, i) => i !== index);
        handleConfigChange(field, newArray);
    };

    const targetLeadCount = useMemo(() => {
        if (!leads) return 0;
        return leads.filter(lead => {
            const searchMatch = campaignData.filters.search ? (
                lead.contact_name?.toLowerCase().includes(campaignData.filters.search.toLowerCase()) ||
                lead.company_name?.toLowerCase().includes(campaignData.filters.search.toLowerCase())
            ) : true;
            const statusMatch = campaignData.filters.status !== 'all' ? lead.status === campaignData.filters.status : true;
            const sourceMatch = campaignData.filters.source !== 'all' ? lead.lead_source === campaignData.filters.source : true;
            return searchMatch && statusMatch && sourceMatch;
        }).length;
    }, [leads, campaignData.filters]);

    const handleSubmit = () => {
        onSave({ ...campaignData, target_lead_count: targetLeadCount });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
                    <DialogDescription>
                        Configure your AI calling campaign. The AI will use these settings to qualify leads.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Basic Info */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Campaign Name</Label>
                        <Input id="name" value={campaignData.name} onChange={(e) => handleFieldChange('name', e.target.value)} placeholder="e.g., Q3 Tech Sector Outreach" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={campaignData.description} onChange={(e) => handleFieldChange('description', e.target.value)} placeholder="Briefly describe the goal of this campaign" />
                    </div>
                    
                    {/* Lead Targeting */}
                    <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Lead Targeting</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={campaignData.filters.status} onValueChange={(val) => handleFilterChange('status', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Source</Label>
                                <Select value={campaignData.filters.source} onValueChange={(val) => handleFilterChange('source', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sources</SelectItem>
                                        <SelectItem value="website">Website</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="referral">Referral</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm font-medium text-blue-600">
                            Targets {targetLeadCount} leads
                        </div>
                    </div>
                    
                    {/* AI Configuration */}
                    <div className="p-4 border rounded-lg space-y-4">
                        <h4 className="font-semibold">AI Configuration</h4>
                        <div className="space-y-2">
                            <Label>Call Script Type</Label>
                            <Select value={campaignData.config.callScript} onValueChange={(val) => handleConfigChange('callScript', val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                                    <SelectItem value="follow_up">Follow Up</SelectItem>
                                    <SelectItem value="demo_booking">Demo Booking</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Qualification Criteria</Label>
                             <Textarea value={campaignData.config.qualification_criteria} onChange={(e) => handleConfigChange('qualification_criteria', e.target.value)} placeholder="Describe what makes a lead qualified for this campaign..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Key Questions for AI to Ask</Label>
                            {campaignData.config.key_questions.map((q, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Input value={q} onChange={(e) => handleArrayChange('key_questions', i, e.target.value)} placeholder={`Question ${i + 1}`} />
                                    <Button variant="ghost" size="icon" onClick={() => removeArrayItem('key_questions', i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addArrayItem('key_questions')}><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
                        </div>
                        <div className="space-y-2">
                            <Label>Transfer to Human Triggers</Label>
                            {campaignData.config.transfer_triggers.map((t, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Input value={t} onChange={(e) => handleArrayChange('transfer_triggers', i, e.target.value)} placeholder={`Trigger word/phrase ${i + 1}`} />
                                    <Button variant="ghost" size="icon" onClick={() => removeArrayItem('transfer_triggers', i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addArrayItem('transfer_triggers')}><Plus className="w-4 h-4 mr-2" /> Add Trigger</Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>{campaign ? 'Save Changes' : 'Create Campaign'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}