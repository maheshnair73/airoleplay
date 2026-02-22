
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Phone, Loader2, PhoneOff, MoreVertical, Presentation, User, Mail, TrendingUp, TrendingDown } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { initiateHumanCall } from '@/api/functions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LeadListItem({ lead, onClick, documentActivity }) {
    const [isCallLoading, setIsCallLoading] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const navigate = useNavigate();

    const statusColors = {
        new: 'bg-blue-100 text-blue-800',
        contacted: 'bg-cyan-100 text-cyan-800',
        qualified: 'bg-yellow-100 text-yellow-800',
        meeting_scheduled: 'bg-orange-100 text-orange-800',
        proposal_sent: 'bg-purple-100 text-purple-800',
        negotiation: 'bg-indigo-100 text-indigo-800',
        closed_won: 'bg-green-100 text-green-800',
        closed_lost: 'bg-red-100 text-red-800'
    };

    const getScoreColor = (score) => {
        if (!score) return 'bg-slate-100 text-slate-800';
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM d, h:mm a');
        } catch (e) {
            return 'Invalid date';
        }
    };

    const activity = documentActivity[lead.contact_email];

    const handleCall = async () => { // Removed 'e' param as it's not needed when called from DropdownMenuItem
        
        if (!lead.contact_phone) {
            toast.error("No phone number available");
            return;
        }

        setIsCallLoading(true);
        try {
            const response = await initiateHumanCall({ leadId: lead.id });
            
            if (response.data?.success) {
                toast.success("Call initiated!", {
                    description: `Connecting to ${lead.contact_name}`
                });
                setIsCallActive(true);
            } else {
                toast.error("Call failed", {
                    description: response.data?.error || "Unknown error"
                });
            }
        } catch (error) {
            console.error('Call error:', error);
            toast.error("Failed to initiate call");
        } finally {
            setIsCallLoading(false);
        }
    };

    const handleEndCall = () => { // Removed 'e' param as it's not needed when called from DropdownMenuItem
        setIsCallActive(false);
        toast.success("Call ended");
    };

    const handleCreateSalesRoom = () => { // Removed 'e' param as it's not needed when called from DropdownMenuItem
        // Corrected page reference to `create-digital-sales-room` to resolve potential 404 errors.
        // Assuming `createPageUrl` converts the component name to a URL path,
        // a kebab-case string is a more common and robust way to refer to routes.
        navigate(createPageUrl(`create-digital-sales-room?leadId=${lead.id}`));
    };

    // The onClick handler for the entire row will now handle viewing lead details
    // The previous handleRowClick is no longer needed as the row's onClick is directly `onClick(lead)`

    return (
        <tr 
            key={lead.id}
            className="hover:bg-blue-50/50 cursor-pointer border-b border-slate-100 transition-colors duration-150"
            onClick={() => onClick(lead)}
        >
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {lead.contact_name?.charAt(0) || 'L'}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">{lead.contact_name || 'Unknown'}</p>
                        <p className="text-sm text-slate-500">{lead.contact_title || 'No title'}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{lead.company_name || 'Unknown Company'}</p>
                <p className="text-sm text-slate-500">{lead.industry || 'Industry not specified'}</p>
            </td>
            <td className="px-4 py-3">
                <p className="text-slate-700">{lead.contact_email}</p>
                <p className="text-sm text-slate-500">{lead.contact_phone || 'No phone'}</p>
            </td>
            <td className="px-4 py-3">
                <p className="text-sm text-slate-700">{formatDate(lead.created_date)}</p>
            </td>
            <td className="px-4 py-3">
                <Badge className="bg-slate-100 text-slate-700">{lead.lead_source || 'unknown'}</Badge>
            </td>
            <td className="px-4 py-3">
                <Badge className={statusColors[lead.status] || 'bg-slate-100 text-slate-800'}>
                    {lead.status || 'new'}
                </Badge>
            </td>
            <td className="px-4 py-3 text-center">
                {lead.ai_score ? (
                    <Badge className={getScoreColor(lead.ai_score)}>
                        {lead.ai_score}
                    </Badge>
                ) : (
                    <span className="text-slate-400">—</span>
                )}
            </td>
            <td className="px-4 py-3 text-center"> {/* This is the engagement score cell, not icons */}
                {lead.engagement_score ? (
                    <Badge className={getScoreColor(lead.engagement_score)}>
                        {lead.engagement_score}%
                    </Badge>
                ) : (
                    <span className="text-slate-400">—</span>
                )}
            </td>
            <td className="px-4 py-3"> {/* Dedicated activity cell */}
                {activity ? (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <div className="text-xs">
                            <p className="font-medium text-green-700">Viewing now</p>
                            <p className="text-slate-500 truncate max-w-xs">{activity.document_name}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500 text-xs">
                        {lead.last_contact_date ? `Last contacted ${format(new Date(lead.last_contact_date), 'MMM d')}` : 'No activity'}
                    </p>
                )}
            </td>
            <td className="px-4 py-3 text-right"> {/* New actions dropdown cell */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => onClick(lead)}> {/* View Lead Details */}
                            <Eye className="w-4 h-4 mr-2" />
                            View Lead Details
                        </DropdownMenuItem>

                        {!isCallActive ? (
                            <DropdownMenuItem onClick={handleCall} disabled={!lead.contact_phone || isCallLoading}>
                                {isCallLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Phone className="w-4 h-4 mr-2" />
                                )}
                                Call Lead
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={handleEndCall}>
                                <PhoneOff className="w-4 h-4 mr-2" />
                                End Call
                            </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={handleCreateSalesRoom}>
                            <Presentation className="w-4 h-4 mr-2" />
                            Create Sales Room
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}
