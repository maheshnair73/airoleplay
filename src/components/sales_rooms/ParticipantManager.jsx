
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Users, Send, Search, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Lead } from '@/api/entities'; // Import Lead entity

const generateAvatarFallback = (name) => {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const LeadSelectorModal = ({ onSelect, onCancel }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchLeads = async () => {
            if (searchTerm.length < 2) {
                setLeads([]);
                return;
            }
            setIsLoading(true);
            try {
                // Simulating an API call to Lead.filter
                // In a real application, replace this with actual data fetching
                const allLeads = [
                    { id: '1', contact_name: 'Alice Johnson', company_name: 'Tech Solutions', contact_email: 'alice@techsol.com' },
                    { id: '2', contact_name: 'Bob Williams', company_name: 'Global Corp', contact_email: 'bob@global.com' },
                    { id: '3', contact_name: 'Charlie Brown', company_name: 'Peanuts Inc.', contact_email: 'charlie@peanuts.com' },
                    { id: '4', contact_name: 'Diana Prince', company_name: 'Justice League', contact_email: 'diana@justice.com' },
                    { id: '5', contact_name: 'Eve Adams', company_name: 'Innovate Co', contact_email: 'eve@innovate.net' },
                    { id: '6', contact_name: 'Frank Miller', company_name: 'Miller & Co', contact_email: 'frank@miller.org' },
                    // Add more mock leads or replace with actual Lead.filter implementation
                ];

                const results = allLeads.filter(lead =>
                    lead.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    lead.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                // If actual Lead entity with a filter method exists, use it:
                // const results = await Lead.filter({
                //     _or: [
                //         { contact_name: { _ilike: `%${searchTerm}%` } },
                //         { company_name: { _ilike: `%${searchTerm}%` } },
                //         { contact_email: { _ilike: `%${searchTerm}%` } },
                //     ]
                // }, '-created_date', 10);
                
                setLeads(results.slice(0, 10)); // Limit to 10 results
            } catch (error) {
                toast.error("Failed to search leads.");
                console.error(error);
            }
            setIsLoading(false);
        };
        const debounce = setTimeout(fetchLeads, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Import Participant from Leads</DialogTitle>
            </DialogHeader>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Search by name, company, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
                {isLoading && <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}
                {!isLoading && leads.length === 0 && searchTerm.length > 1 && (
                    <div className="text-center p-4 text-slate-500">No leads found.</div>
                )}
                {!isLoading && leads.length > 0 && leads.map(lead => (
                    <div
                        key={lead.id}
                        onClick={() => onSelect(lead)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                        <Avatar>
                           <AvatarFallback>{generateAvatarFallback(lead.contact_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-slate-900">{lead.contact_name}</p>
                            <p className="text-sm text-slate-600">{lead.company_name} {lead.company_name && lead.contact_email ? ' - ' : ''} {lead.contact_email}</p>
                        </div>
                    </div>
                ))}
            </div>
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </DialogFooter>
        </DialogContent>
    );
};

const ParticipantForm = ({ participant, onSubmit, onCancel, onImport, participants }) => {
    const [formData, setFormData] = useState(
        participant || { name: '', email: '', role: 'buyer', company: '' }
    );

    React.useEffect(() => {
        setFormData(
            participant || { name: '', email: '', role: 'buyer', company: '' }
        );
    }, [participant]);
    
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            toast.error("Name and Email are required.");
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Button type="button" variant="outline" className="w-full gap-2" onClick={onImport}>
                <UserPlus className="w-4 h-4" /> Import from Leads
            </Button>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or add manually</span>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Jane Doe"
                    required
                />
            </div>
            <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="e.g., jane.doe@acme.com"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Role</label>
                    <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                            <SelectItem value="stakeholder">Stakeholder</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">Company</label>
                    <Input
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="e.g., Acme Corp"
                    />
                </div>
            </div>
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{participant?.email && participants.some(p => p.email === participant.email) ? 'Save Changes' : 'Add Participant'}</Button>
            </DialogFooter>
        </form>
    );
};

export default function ParticipantManager({ participants, onUpdateParticipants }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState(null);
    const [isLeadSelectorOpen, setIsLeadSelectorOpen] = useState(false);

    const handleAdd = (newParticipant) => {
        // Prevent adding if participant with same email already exists
        if (participants.some(p => p.email === newParticipant.email)) {
            toast.error("A participant with this email already exists.");
            return;
        }
        onUpdateParticipants([...participants, newParticipant]);
        toast.success(`${newParticipant.name} has been added.`);
        setIsFormOpen(false);
        setEditingParticipant(null); // Clear editing state after add
    };

    const handleEdit = (updatedParticipant) => {
        onUpdateParticipants(
            participants.map(p => (p.email === editingParticipant.email ? updatedParticipant : p))
        );
        toast.success(`${updatedParticipant.name}'s details have been updated.`);
        setEditingParticipant(null);
        setIsFormOpen(false);
    };

    const handleRemove = (participantEmail) => {
        onUpdateParticipants(participants.filter(p => p.email !== participantEmail));
        toast.info("Participant has been removed.");
    };

    const openEditForm = (participant) => {
        setEditingParticipant(participant);
        setIsFormOpen(true);
    };

    const openNewForm = () => {
        setEditingParticipant(null);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingParticipant(null);
    };

    const handleImportFromLead = () => {
        setIsLeadSelectorOpen(true);
        setIsFormOpen(false); // Close main form to open lead selector
        setEditingParticipant(null); // Ensure form is empty for new lead data
    };

    const handleLeadSelected = (lead) => {
        const newParticipantData = {
            name: lead.contact_name || '',
            email: lead.contact_email || '',
            role: 'buyer', // Default role for imported leads
            company: lead.company_name || '',
            // avatar_url: lead.avatar_url // if available in lead
        };
        // Check if this lead's email already exists as a participant
        if (participants.some(p => p.email === newParticipantData.email)) {
            toast.info(`Participant with email ${newParticipantData.email} already exists. Opening for edit.`);
            setEditingParticipant(participants.find(p => p.email === newParticipantData.email));
        } else {
            setEditingParticipant(newParticipantData); // Pre-fill the form with the selected lead's data
        }
        setIsLeadSelectorOpen(false); // Close lead selector
        setIsFormOpen(true); // Open the main participant form
    };

    return (
        <>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    Participant Management
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Control who has access to your sales room and send invitations.
                                </CardDescription>
                            </div>
                            <DialogTrigger asChild>
                                <Button onClick={openNewForm}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Invite Participant
                                </Button>
                            </DialogTrigger>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {participants && participants.length > 0 ? (
                            <div className="space-y-4">
                                {participants.map((p) => (
                                    <div key={p.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100/80 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={p.avatar_url} />
                                                <AvatarFallback className="bg-slate-200 text-slate-600 font-semibold">
                                                    {generateAvatarFallback(p.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-slate-900">{p.name}</p>
                                                <p className="text-sm text-slate-600">{p.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm capitalize text-slate-500">{p.role}</span>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Send className="w-4 h-4" /> Send Invite
                                            </Button>
                                            <div>
                                                <Button variant="ghost" size="icon" onClick={() => openEditForm(p)}>
                                                    <Edit className="w-4 h-4 text-slate-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemove(p.email)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Participants Added</h3>
                                <p className="text-slate-500 mb-6">
                                    Invite prospects, stakeholders, and team members to collaborate.
                                </p>
                                <DialogTrigger asChild>
                                    <Button onClick={openNewForm}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Invite First Participant
                                    </Button>
                                </DialogTrigger>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingParticipant?.email && participants.some(p => p.email === editingParticipant.email) ? 'Edit Participant' : 'Invite New Participant'}</DialogTitle>
                    </DialogHeader>
                    <ParticipantForm
                        participant={editingParticipant}
                        onSubmit={editingParticipant?.email && participants.find(p => p.email === editingParticipant.email) ? handleEdit : handleAdd}
                        onCancel={closeForm}
                        onImport={handleImportFromLead}
                        participants={participants} // Pass participants to form for checking existing emails
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isLeadSelectorOpen} onOpenChange={setIsLeadSelectorOpen}>
                <LeadSelectorModal 
                    onSelect={handleLeadSelected}
                    onCancel={() => setIsLeadSelectorOpen(false)}
                />
            </Dialog>
        </>
    );
}
