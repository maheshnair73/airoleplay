
import React, { useState, useEffect, useMemo } from 'react';
import { Lead } from '@/api/entities';
import { DocumentView } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Loader2, Search, Table, Kanban, Phone, ChevronDown, BrainCircuit, Eye, Edit, User, Mail, Sparkles } from 'lucide-react'; // Added Sparkles
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import LeadForm from '@/components/leads/LeadForm';
import LeadListItem from '@/components/leads/LeadListItem';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import GameActionTracker from '@/components/gamification/GameActionTracker';

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
                <div className="flex-grow space-y-3">
                    <div className="flex items-center text-sm text-slate-600">
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        <span>{lead.contact_name || 'N/A'}</span>
                    </div>
                    {lead.contact_email && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Mail className="w-4 h-4 mr-2 text-slate-400" />
                            <span>{lead.contact_email}</span>
                        </div>
                    )}
                    {lead.contact_phone && (
                        <div className="flex items-center text-sm text-slate-600">
                            <Phone className="w-4 h-4 mr-2 text-slate-400" />
                            <span>{lead.contact_phone}</span>
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
    const navigate = useNavigate();

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
            const data = await Lead.list('-created_date');
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

    const handleRowClick = (lead) => {
        if (lead && lead.id) {
            navigate(createPageUrl(`LeadDetail?leadId=${lead.id}`));
        } else {
            console.warn("Attempted to click on a lead with no ID:", lead);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">effyLeads</h1>
                    <p className="text-slate-600 mt-2">Manage your prospects and opportunities</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => {
                            setSelectedLead(null); // Clear selected lead for "Add"
                            setShowLeadForm(true);
                        }} 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lead
                    </Button>
                </div>
            </header>

            {showLeadForm && (
                <LeadForm
                    lead={selectedLead} // Pass selectedLead for editing, null for adding
                    onClose={() => {
                        setShowLeadForm(false);
                        setSelectedLead(null); // Reset selected lead when form closes
                    }}
                    onSave={handleSubmit}
                    isSubmitting={isSubmitting}
                />
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
