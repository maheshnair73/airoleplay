
import React, { useState, useEffect, useMemo } from 'react';
import { Lead } from '@/api/entities';
import { DocumentView } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Loader2, Search, Table, Kanban, Phone, ChevronDown, BrainCircuit, Eye, Edit, User, Mail, Sparkles, Calendar, Clock, CheckCircle2, XCircle, PhoneCall, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import LeadForm from '@/components/leads/LeadForm';
import LeadListItem from '@/components/leads/LeadListItem';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import GameActionTracker from '@/components/gamification/GameActionTracker';
import FloatingCallWidget from '@/components/calls/FloatingCallWidget';

const statusColumns = {
    new: { title: 'New Leads', color: 'border-t-blue-500' },
    contacted: { title: 'Contacted', color: 'border-t-cyan-500' },
    qualified: { title: 'Qualified', color: 'border-t-yellow-500' },
    meeting_scheduled: { title: 'Meeting Scheduled', color: 'border-t-purple-500' },
    proposal_sent: { title: 'Proposal Sent', color: 'border-t-orange-500' },
    negotiation: { title: 'Negotiation', color: 'border-t-indigo-500' },
    closed_won: { title: 'Closed Won', color: 'border-t-green-500' },
    closed_lost: { title: 'Closed Lost', color: 'border-t-red-500' }
};

// LeadCardInternal component defined within EffyLeads.tsx to replace LeadKanbanCard
// It handles the display and actions for a single lead in the Kanban view.
const LeadCardInternal = ({ lead, onLeadClick, onLeadEdit }) => {
    // navigate and createPageUrl are available from the EffyLeads scope if this component is defined within it.
    // If it were a separate file, navigate would be passed as a prop or used directly if it's a Hook.

    return (
        <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border border-slate-200 bg-white">
            <CardContent className="p-6 h-full flex flex-col">
                {/* Header section */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-slate-800 leading-tight" onClick={() => onLeadClick(lead)}>
                        {lead.contact_name || lead.company_name || 'N/A'}
                    </h3>
                    {lead.status && (
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize 
                            ${lead.status === 'closed_won' ? 'bg-green-100 text-green-800' :
                              lead.status === 'closed_lost' ? 'bg-red-100 text-red-800' :
                              lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'}`}>
                            {statusColumns[lead.status]?.title || lead.status.replace('_', ' ')}
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-500 mb-3">{lead.company_name}</p>

                {/* Contact info and details */}
                <div className="flex-grow space-y-2">
                    <div className="flex items-center text-sm text-slate-600">
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        <span>{lead.contact_name || 'N/A'}</span>
                    </div>
                    {lead.contact_email && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Mail className="w-4 h-4 mr-2 text-slate-400" />
                            <span className="truncate">{lead.contact_email}</span>
                        </div>
                    )}
                    {lead.contact_phone && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Phone className="w-4 h-4 mr-2 text-slate-400" />
                            <span>{lead.contact_phone}</span>
                        </div>
                    )}

                    {/* Disposition badges */}
                    {lead.disposition && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                            <PhoneCall className="w-4 h-4 text-slate-400" />
                            <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${
                                lead.disposition === 'interested' ? 'bg-green-100 text-green-700' :
                                lead.disposition === 'callback_requested' ? 'bg-yellow-100 text-yellow-700' :
                                lead.disposition === 'not_interested' ? 'bg-red-100 text-red-700' :
                                lead.disposition === 'voicemail' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                            }`}>
                                {lead.disposition.replace(/_/g, ' ')}
                            </span>
                        </div>
                    )}

                    {lead.sub_disposition && (
                        <div className="text-xs text-slate-500 pl-6">
                            {lead.sub_disposition.replace(/_/g, ' ')}
                        </div>
                    )}

                    {/* Next call date */}
                    {lead.next_call_date && (
                        <div className="flex items-center gap-2 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1.5 rounded mt-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                                {new Date(lead.next_call_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions - AI Pitch Generator Most Prominent */}
                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                    {/* AI Custom Pitch - Primary Action */}
                    <Button 
                        onClick={() => window.open(createPageUrl(`CallPreparation?leadId=${lead.id}`), '_blank')}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate AI Custom Pitch
                    </Button>
                    
                    {/* Secondary Actions */}
                    <div className="flex flex-wrap gap-2">
                        {lead.contact_phone && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => window.open(`tel:${lead.contact_phone}`)}>
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                            </Button>
                        )}
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onLeadClick(lead)}
                        >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onLeadEdit(lead)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const LeadColumn = ({ status, leads, onLeadClick, onLeadEdit }) => ( // Added onLeadEdit prop
    <div className="bg-slate-100 rounded-xl p-4 w-80 flex-shrink-0">
        <h3 className="font-bold text-lg text-slate-700 mb-4">
            {statusColumns[status].title} ({leads.length})
        </h3>
        <Droppable droppableId={status}>
            {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[200px] space-y-3">
                    {leads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                >
                                    {/* Using LeadCardInternal instead of LeadKanbanCard */}
                                    <LeadCardInternal lead={lead} onLeadClick={onLeadClick} onLeadEdit={onLeadEdit} />
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    </div>
);

export default function EffyLeads() {
    const [leads, setLeads] = useState([]);
    const [documentActivity, setDocumentActivity] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [currentView, setCurrentView] = useState('table'); // 'table' or 'kanban'
    const [isSubmitting, setIsSubmitting] = useState(false); // Added for LeadForm submission state
    const [activeCall, setActiveCall] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isCallMuted, setIsCallMuted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (activeCall) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeCall]);

    useEffect(() => {
        fetchLeads();

        const fetchLiveActivity = async () => {
            try {
                const viewers = await DocumentView.filter({ is_currently_viewing: true });
                const activityMap = viewers.reduce((acc, viewer) => {
                    if (viewer && viewer.viewer_email) {
                        acc[viewer.viewer_email] = {
                            document_name: viewer.document_details?.document_name || 'a document',
                            viewer_name: viewer.viewer_name || 'Unknown Viewer',
                            started_at: viewer.updated_date,
                        };
                    }
                    return acc;
                }, {});
                setDocumentActivity(activityMap);
            } catch (error) {
                console.error("Failed to fetch live activity:", error);
            }
        };

        fetchLiveActivity();
        const intervalId = setInterval(fetchLiveActivity, 7000);
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array as fetchLeads and fetchLiveActivity are stable or fetch on mount/interval

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const data = await Lead.list('-created_at');
            const validLeads = data.filter(lead => 
                lead && typeof lead === 'object' && (lead.contact_name || lead.company_name)
            );
            setLeads(validLeads);
        } catch (error) {
            console.error('Error fetching leads:', error);
            setLeads([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (leadData) => {
        setIsSubmitting(true);
        try {
            // Determine if it's an update or create based on selectedLead
            if (selectedLead && selectedLead.id) {
                const updatedLead = await Lead.update(selectedLead.id, leadData);
                toast.success('Lead updated successfully!');
            } else {
                const newLead = await Lead.create(leadData);
                await GameActionTracker.trackAction('lead_created', 'lead', newLead.id);
                toast.success('Lead created successfully!');
            }
            
            setShowLeadForm(false); 
            setSelectedLead(null); 
            await fetchLeads(); 
        } catch (error) {
            console.error("Failed to save lead:", error);
            toast.error('Failed to save lead. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async (leadId, newStatus) => {
        try {
            await Lead.update(leadId, { status: newStatus });
            
            if (newStatus === 'qualified') {
                await GameActionTracker.trackAction('lead_qualified', 'lead', leadId);
            }
            
            await fetchLeads(); 
            toast.success(`Lead status updated to ${statusColumns[newStatus].title}!`);
        } catch (error) {
            console.error('Failed to update lead status:', error);
            toast.error('Failed to update lead status');
        }
    };

    const handleOnDragEnd = async (result) => {
        if (!result.destination) return;
        
        const leadId = result.draggableId; 
        const newStatus = result.destination.droppableId;
        
        // Optimistically update UI
        const updatedLeads = leads.map(lead => {
            if (lead.id.toString() === leadId) {
                return { ...lead, status: newStatus };
            }
            return lead;
        });
        setLeads(updatedLeads);

        await handleStatusUpdate(leadId, newStatus);
    };

    // Handler for editing a lead from LeadCardInternal (Kanban view)
    const handleEditLead = (lead) => {
        setSelectedLead(lead);
        setShowLeadForm(true);
    };

    const handleStartCall = (lead) => {
        if (lead.contact_phone) {
            setActiveCall(lead);
            setCallDuration(0);
            setIsCallMuted(false);
            toast.success(`Call started with ${lead.contact_name || lead.company_name}`);
            window.open(`tel:${lead.contact_phone}`);
        } else {
            toast.error('No phone number available for this lead');
        }
    };

    const handleEndCall = () => {
        if (activeCall) {
            toast.success(`Call ended. Duration: ${Math.floor(callDuration / 60)}:${String(callDuration % 60).padStart(2, '0')}`);
            setActiveCall(null);
            setCallDuration(0);
            setIsCallMuted(false);
        }
    };

    const handleMuteToggle = () => {
        setIsCallMuted(!isCallMuted);
        toast.info(isCallMuted ? 'Call unmuted' : 'Call muted');
    };

    const filteredLeads = useMemo(() => {
        let filtered = leads;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(lead => lead.status === statusFilter);
        }

        if (sourceFilter !== 'all') {
            filtered = filtered.filter(lead => lead.source === sourceFilter);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(lead =>
                (lead.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.contact_email || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [leads, searchTerm, statusFilter, sourceFilter]);

    const leadsByStatus = useMemo(() => {
        const grouped = Object.keys(statusColumns).reduce((acc, status) => {
            acc[status] = filteredLeads.filter(lead => lead.status === status);
            return acc;
        }, {});
        return grouped;
    }, [filteredLeads]);

    const urgentFollowUps = useMemo(() => {
        const now = new Date();
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        return leads
            .filter(lead => {
                if (!lead.next_call_date) return false;
                const callDate = new Date(lead.next_call_date);
                return callDate <= next24Hours && callDate >= now;
            })
            .sort((a, b) => new Date(a.next_call_date) - new Date(b.next_call_date));
    }, [leads]);

    const leadStats = useMemo(() => {
        return {
            total: leads.length,
            new: leads.filter(lead => lead.status === 'new').length,
            contacted: leads.filter(lead => lead.status === 'contacted').length,
            qualified: leads.filter(lead => lead.status === 'qualified').length,
            closedWon: leads.filter(lead => lead.status === 'closed_won').length,
            pendingContact: leads.filter(lead =>
                lead.status === 'new' ||
                (lead.disposition === 'callback_requested' && lead.status !== 'closed_won' && lead.status !== 'closed_lost')
            ).length,
        };
    }, [leads]);

    const pendingLeads = useMemo(() => {
        return leads.filter(lead =>
            lead.status === 'new' ||
            (lead.disposition === 'callback_requested' && lead.status !== 'closed_won' && lead.status !== 'closed_lost')
        );
    }, [leads]);

    const handleRowClick = (lead) => {
        if (lead && lead.id) {
            navigate(createPageUrl(`LeadDetail?leadId=${lead.id}`));
        } else {
            console.warn("Attempted to click on a lead with no ID:", lead);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            {activeCall && (
                <FloatingCallWidget
                    lead={activeCall}
                    callDuration={callDuration}
                    onEndCall={handleEndCall}
                    onMuteToggle={handleMuteToggle}
                    isMuted={isCallMuted}
                    position="bottom-right"
                />
            )}

            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">effyLeads</h1>
                    <p className="text-slate-600 mt-2">Manage your prospects and opportunities</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => {
                            setSelectedLead(null); // Clear selected lead for "Add"
                            setShowLeadForm(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lead
                    </Button>
                </div>
            </header>

            <LeadForm
                open={showLeadForm}
                onOpenChange={setShowLeadForm}
                onLeadAdded={() => {
                    fetchLeads();
                    setShowLeadForm(false);
                }}
            />

            {/* Lead Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Leads</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{leadStats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Pending Contact</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{leadStats.pendingContact}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Qualified</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{leadStats.qualified}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Closed Won</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{leadStats.closedWon}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {pendingLeads.length > 0 && (
                <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                                <PhoneCall className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Pending Leads to Contact</h2>
                                <p className="text-sm text-slate-600">New leads and callback requests requiring attention</p>
                            </div>
                            <Badge className="ml-auto bg-blue-600 text-white text-lg px-3 py-1">
                                {pendingLeads.length}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingLeads.slice(0, 6).map(lead => (
                                <Card
                                    key={lead.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-600 bg-white"
                                    onClick={() => handleRowClick(lead)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{lead.contact_name || lead.company_name}</h3>
                                                <p className="text-sm text-slate-500">{lead.company_name}</p>
                                            </div>
                                            <Badge className={`${
                                                lead.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                            } text-xs`}>
                                                {lead.status === 'new' ? 'New' : 'Callback'}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            {lead.contact_phone && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span>{lead.contact_phone}</span>
                                                </div>
                                            )}

                                            {lead.contact_email && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="truncate">{lead.contact_email}</span>
                                                </div>
                                            )}

                                            {lead.disposition && (
                                                <div className="flex items-center gap-2">
                                                    <PhoneCall className="w-4 h-4 text-slate-400" />
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                                        lead.disposition === 'interested' ? 'bg-green-100 text-green-700' :
                                                        lead.disposition === 'callback_requested' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {lead.disposition.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            )}

                                            {lead.next_call_date && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    <span>
                                                        {new Date(lead.next_call_date).toLocaleString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartCall(lead);
                                                }}
                                            >
                                                <Phone className="w-3 h-3 mr-1" />
                                                Call Now
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRowClick(lead);
                                                }}
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {pendingLeads.length > 6 && (
                            <div className="mt-4 text-center">
                                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                                    View All {pendingLeads.length} Pending Leads
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {urgentFollowUps.length > 0 && (
                <Card className="mb-6 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Urgent Follow-ups</h2>
                                <p className="text-sm text-slate-600">Scheduled calls in the next 24 hours</p>
                            </div>
                            <Badge className="ml-auto bg-orange-500 text-white text-lg px-3 py-1">
                                {urgentFollowUps.length}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {urgentFollowUps.map(lead => (
                                <Card
                                    key={lead.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-orange-500 bg-white"
                                    onClick={() => handleRowClick(lead)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{lead.contact_name || lead.company_name}</h3>
                                                <p className="text-sm text-slate-500">{lead.company_name}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {lead.contact_phone && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span>{lead.contact_phone}</span>
                                                </div>
                                            )}

                                            {lead.disposition && (
                                                <div className="flex items-center gap-2">
                                                    <PhoneCall className="w-4 h-4 text-slate-400" />
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                                        lead.disposition === 'interested' ? 'bg-green-100 text-green-700' :
                                                        lead.disposition === 'callback_requested' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {lead.disposition.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-sm font-bold text-orange-700 bg-orange-100 px-3 py-2 rounded mt-3">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {new Date(lead.next_call_date).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartCall(lead);
                                                }}
                                            >
                                                <Phone className="w-3 h-3 mr-1" />
                                                Call Now
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRowClick(lead);
                                                }}
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
                {/* Single row with all controls */}
                <div className="flex items-center gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 pl-10 bg-white"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select onValueChange={setStatusFilter} value={statusFilter}>
                        <SelectTrigger className="w-[140px] bg-white">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                            <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="closed_won">Won</SelectItem>
                            <SelectItem value="closed_lost">Lost</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Source Filter */}
                    <Select onValueChange={setSourceFilter} value={sourceFilter}>
                        <SelectTrigger className="w-[130px] bg-white">
                            <SelectValue placeholder="All Sources" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="cold_call">Cold Call</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* View Buttons */}
                    <Button
                        variant={currentView === 'table' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentView('table')}
                        className={`flex items-center gap-2 ${
                            currentView === 'table'
                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Table className="w-4 h-4" />
                        Table View
                    </Button>

                    <Button
                        variant={currentView === 'kanban' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentView('kanban')}
                        className={`flex items-center gap-2 ${
                            currentView === 'kanban'
                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Kanban className="w-4 h-4" />
                        Pipeline View
                    </Button>
                </div>

                <TabsContent value="table">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                                    <tr>
                                        <th className="px-4 py-3">Contact</th>
                                        <th className="px-4 py-3">Company</th>
                                        <th className="px-4 py-3">Contact Info</th>
                                        <th className="px-4 py-3">Created</th>
                                        <th className="px-4 py-3">Source</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Lead Score</th>
                                        <th className="px-4 py-3 text-center">Engagement</th>
                                        <th className="px-4 py-3">Recent Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-10">
                                                <Loader2 className="mx-auto w-8 h-8 text-blue-600 animate-spin" />
                                                <p className="text-slate-500 mt-2">Loading leads...</p>
                                            </td>
                                        </tr>
                                    ) : filteredLeads.length > 0 ? (
                                        filteredLeads.map(lead => (
                                            <LeadListItem 
                                                key={lead.id} 
                                                lead={lead} 
                                                onClick={handleRowClick}
                                                documentActivity={documentActivity}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-10">
                                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-500 text-lg">No leads found matching your criteria</p>
                                                <p className="text-slate-400 text-sm">Try adjusting your filters or adding a new lead.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="kanban">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={handleOnDragEnd}>
                                <div className="flex gap-6 overflow-x-auto pb-6">
                                    {Object.keys(statusColumns).map(status => (
                                        <LeadColumn
                                            key={status}
                                            status={status}
                                            leads={leadsByStatus[status] || []}
                                            onLeadClick={handleRowClick}
                                            onLeadEdit={handleEditLead} // Pass the handleEditLead function
                                        />
                                    ))}
                                </div>
                            </DragDropContext>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
