
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, Users, User as UserIconImport, Link as LinkIcon, Edit, X, UserPlus, Loader2, Share2, Mail, PlusCircle, BarChart3, FileText, Download, ArrowLeft, Check, ChevronsUpDown, Search } from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RescheduleModal from './RescheduleModal';
import InviteModal from './InviteModal';

export default function MeetingDetailSheet({ meeting, currentUser, isOpen, onClose }) {
    const [participantLeads, setParticipantLeads] = useState(new Map());
    const [isLoadingLeads, setIsLoadingLeads] = useState(false);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [creatingLeadFor, setCreatingLeadFor] = useState(null);
    const [leadFormData, setLeadFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [users, setUsers] = useState([]);
    const [showUserDialog, setShowUserDialog] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userList = await User.list();
                setUsers(userList);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (meeting?.participants && isOpen) {
            const fetchParticipantLeads = async () => {
                setIsLoadingLeads(true);
                try {
                    const participantEmails = meeting.participants;
                    const leadPromises = participantEmails.map(email => 
                        Lead.filter({ contact_email: email }, '', 1).then(res => res[0])
                    );
                    const leads = await Promise.all(leadPromises);
                    
                    const leadMap = new Map();
                    leads.forEach(lead => {
                        if (lead) {
                            leadMap.set(lead.contact_email, lead);
                        }
                    });
                    setParticipantLeads(leadMap);
                } catch (error) {
                    console.error("Failed to fetch participant leads:", error);
                    toast.error("Could not load participant details.");
                } finally {
                    setIsLoadingLeads(false);
                }
            };
            fetchParticipantLeads();
        }
    }, [meeting, isOpen]);

    // Reset all form states when sheet closes
    useEffect(() => {
        if (!isOpen) {
            setCreatingLeadFor(null);
            setLeadFormData(null);
            setShowUserDialog(false);
            setUserSearchQuery('');
        }
    }, [isOpen]);
    
    if (!meeting) return null;

    const isHost = currentUser?.email === meeting.created_by;
    const isPastMeeting = meeting.status === 'completed';

    // Format duration from seconds to readable format
    const formatDuration = (seconds) => {
        if (!seconds || seconds === 0) return 'Not available';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} min`;
    };

    const handleAction = (action) => {
        if (action === 'Reschedule') {
            setIsRescheduleOpen(true);
            return;
        }
        toast.info(`'${action}' clicked`, {
            description: `This would trigger the ${action.toLowerCase()} workflow for the meeting "${meeting.title}".`,
        });
    };

    const handleInviteAction = (type) => {
        if (type === 'share') {
            const meetingLink = `${window.location.origin}${createPageUrl('LiveMeetings')}?meetingId=${meeting.id}`;
            navigator.clipboard.writeText(meetingLink);
            toast.success("Meeting link copied to clipboard!", {
                 description: meetingLink
            });
        } else if (type === 'email') {
            setIsInviteOpen(true);
        }
    };
    
    const handleRescheduleConfirm = (newDate) => {
        toast.success(`Meeting rescheduled`, {
            description: `"${meeting.title}" is now on ${format(newDate, 'PPP p')}.`,
        });
        setIsRescheduleOpen(false);
        onClose();
    };

    const handleSendInvites = (emails) => {
        toast.success(`${emails.length} invite(s) sent successfully!`);
        setIsInviteOpen(false);
    };

    const handleCreateLead = (email) => {
        const potentialName = email.split('@')[0].split('.').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
        
        const initialData = {
            contact_email: email,
            contact_name: potentialName,
            company_name: '',
            contact_phone: '',
            lead_source: 'event',
            status: 'contacted',
            meeting_date_time: meeting.scheduled_at,
            notes: `Met during: ${meeting.title} on ${format(new Date(meeting.scheduled_at), 'PPP')}`,
            assigned_to_email: currentUser?.email || ''
        };
        
        setCreatingLeadFor({ email, name: potentialName });
        setLeadFormData(initialData);
    };

    const handleCancelLeadCreation = () => {
        setShowUserDialog(false);
        setUserSearchQuery('');
        setCreatingLeadFor(null);
        setLeadFormData(null);
    };

    const handleLeadFormChange = (field, value) => {
        setLeadFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitLead = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const newLead = await Lead.create(leadFormData);
            toast.success('Lead created successfully!');
            
            // Refresh participant leads
            const leadMap = new Map(participantLeads);
            leadMap.set(newLead.contact_email, newLead);
            setParticipantLeads(leadMap);
            
            // Reset form state
            handleCancelLeadCreation();
        } catch (error) {
            console.error("Failed to create lead:", error);
            toast.error('Failed to create lead. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const Participant = ({ email }) => {
        const lead = participantLeads.get(email);
        const name = lead?.contact_name || email;
        const initial = name.charAt(0).toUpperCase();

        if (lead) {
            return (
                <Link to={createPageUrl(`LeadDetail?leadId=${lead.id}`)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-slate-800">{name}</p>
                        <p className="text-xs text-slate-500">{lead.contact_title || email}</p>
                    </div>
                    <LinkIcon className="w-4 h-4 text-slate-400 ml-auto" />
                </Link>
            );
        }

        return (
            <div className="flex items-center justify-between gap-3 p-2">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-slate-800">{name}</p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                    onClick={() => handleCreateLead(email)}
                >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Create Lead
                </Button>
            </div>
        );
    };

    const selectedUser = users.find(u => u.email === leadFormData?.assigned_to_email);
    const filteredUsers = users.filter(u => 
        !userSearchQuery || 
        u.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    // Render lead creation form or meeting details based on state
    const renderContent = () => {
        if (creatingLeadFor && leadFormData) {
            return (
                <div key="lead-form">
                    <SheetHeader className="pb-4">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleCancelLeadCreation}
                            className="w-fit -ml-2 mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Meeting
                        </Button>
                        <SheetTitle className="text-2xl font-bold text-slate-900">
                            Create Lead from Meeting
                        </SheetTitle>
                        <SheetDescription>
                            Creating lead for participant from "{meeting.title}"
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmitLead} className="space-y-4 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact_name">Contact Name *</Label>
                                <Input
                                    id="contact_name"
                                    value={leadFormData.contact_name}
                                    onChange={(e) => handleLeadFormChange('contact_name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_email">Contact Email *</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={leadFormData.contact_email}
                                    onChange={(e) => handleLeadFormChange('contact_email', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                    id="company_name"
                                    value={leadFormData.company_name}
                                    onChange={(e) => handleLeadFormChange('company_name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_phone">Phone Number</Label>
                                <Input
                                    id="contact_phone"
                                    type="tel"
                                    value={leadFormData.contact_phone}
                                    onChange={(e) => handleLeadFormChange('contact_phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lead_source">Lead Source</Label>
                                <Select
                                    value={leadFormData.lead_source}
                                    onValueChange={(value) => handleLeadFormChange('lead_source', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="website">Website</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="referral">Referral</SelectItem>
                                        <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                                        <SelectItem value="event">Event</SelectItem>
                                        <SelectItem value="advertising">Advertising</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={leadFormData.status}
                                    onValueChange={(value) => handleLeadFormChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                        <SelectItem value="qualified">Qualified</SelectItem>
                                        <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assigned_to">Assign To</Label>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between"
                                onClick={() => setShowUserDialog(true)}
                            >
                                {selectedUser ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-xs">
                                                {(selectedUser.full_name || selectedUser.email).charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{selectedUser.full_name || selectedUser.email}</span>
                                    </div>
                                ) : (
                                    "Select user..."
                                )}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={leadFormData.notes}
                                onChange={(e) => handleLeadFormChange('notes', e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleCancelLeadCreation}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Lead'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            );
        }

        // Main meeting details view
        return (
            <div key="meeting-details">
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-2xl font-bold text-slate-900">{meeting.title}</SheetTitle>
                    <SheetDescription>
                        <div className="flex flex-col gap-3 mt-3">
                            <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-600">{meeting.platform} Meeting</span>
                                <Badge variant={isHost ? "default" : "secondary"}>{isHost ? "You are hosting" : "You are an attendee"}</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4 text-slate-400" /> 
                                    <div className="flex flex-col">
                                        <span className="font-medium">Date</span>
                                        <span className="text-slate-500">{format(new Date(meeting.scheduled_at), 'MMM d, yyyy')}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock className="w-4 h-4 text-slate-400" /> 
                                    <div className="flex flex-col">
                                        <span className="font-medium">{isPastMeeting ? 'Duration' : 'Time'}</span>
                                        {isPastMeeting ? (
                                            <span className="text-green-700 font-semibold">{formatDuration(meeting.call_duration)}</span>
                                        ) : (
                                            <span className="text-slate-500">{format(new Date(meeting.scheduled_at), 'p')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 border-t">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Participants ({meeting.participants?.length || 0})
                    </h3>
                    {isLoadingLeads ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {meeting.participants?.map((p, index) => <Participant key={index} email={p} />)}
                        </div>
                    )}
                </div>

                <SheetFooter className="border-t pt-6">
                    <div className="flex flex-wrap gap-2 w-full">
                        {isPastMeeting ? (
                            <>
                                {meeting.call_record_id ? (
                                    <Button asChild className="flex-1">
                                        <Link to={createPageUrl(`CallAnalysis?id=${meeting.call_record_id}&back=LiveMeetings`)}>
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            View Analysis
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" className="flex-1" disabled>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </Button>
                                )}
                                <Button variant="outline" className="flex-1" onClick={() => handleAction('Download Recording')}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => handleAction('Export Summary')}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Export Summary
                                </Button>
                            </>
                        ) : (
                            <>
                                {isHost ? (
                                    <>
                                        <Button onClick={() => handleAction('Reschedule')} className="flex-1"><Edit className="w-4 h-4 mr-2" />Reschedule</Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="flex-1"><UserPlus className="w-4 h-4 mr-2" />Invite</Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleInviteAction('share')}>
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    <span>Share Link</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleInviteAction('email')}>
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    <span>Email Invite</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button onClick={() => handleAction('Cancel')} variant="destructive" className="w-full sm:w-auto mt-2 sm:mt-0"><X className="w-4 h-4 mr-2" />Cancel Meeting</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button onClick={() => handleAction('Request Reschedule')} className="flex-1">Request Reschedule</Button>
                                        <Button onClick={() => handleAction('Cancel Attendance')} variant="outline" className="flex-1">Can't Make It</Button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </SheetFooter>
            </div>
        );
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="sm:max-w-2xl w-[90vw] overflow-y-auto">
                    {renderContent()}
                </SheetContent>
            </Sheet>

            {/* User Selection Dialog */}
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select User to Assign</DialogTitle>
                    </DialogHeader>
                    <Command>
                        <CommandInput 
                            placeholder="Search users..." 
                            value={userSearchQuery}
                            onValueChange={setUserSearchQuery}
                        />
                        <CommandList>
                            <CommandEmpty>No user found.</CommandEmpty>
                            <CommandGroup>
                                {filteredUsers.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        value={user.email}
                                        onSelect={() => {
                                            handleLeadFormChange('assigned_to_email', user.email);
                                            setShowUserDialog(false);
                                            setUserSearchQuery('');
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${
                                                leadFormData?.assigned_to_email === user.email ? "opacity-100" : "opacity-0"
                                            }`}
                                        />
                                        <Avatar className="h-6 w-6 mr-2">
                                            <AvatarFallback className="text-xs">
                                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.full_name || user.email}</span>
                                            {user.full_name && <span className="text-xs text-slate-500">{user.email}</span>}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>

            <RescheduleModal 
                open={isRescheduleOpen}
                onOpenChange={setIsRescheduleOpen}
                meeting={meeting}
                onReschedule={handleRescheduleConfirm}
            />
            <InviteModal
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                onSendInvites={handleSendInvites}
            />
        </>
    );
}
