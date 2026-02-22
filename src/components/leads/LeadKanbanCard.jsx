
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Phone, Loader2, PhoneOff, Calendar, User, Building2, DollarSign, Presentation, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { initiateHumanCall } from '@/api/functions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';


export default function LeadKanbanCard({ lead, onLeadClick }) {
    const [isCallLoading, setIsCallLoading] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const navigate = useNavigate();

    const priorityColors = {
        High: 'bg-red-100 text-red-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Low: 'bg-blue-100 text-blue-800'
    };

    const getScoreColor = (score) => {
        if (!score) return 'bg-slate-100 text-slate-800';
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const handleCall = async (e) => {
        e.stopPropagation();
        
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

    const handleEndCall = (e) => {
        e.stopPropagation();
        setIsCallActive(false);
        toast.success("Call ended");
    };

    const handleCreateSalesRoom = (e) => {
        e.stopPropagation();
        navigate(createPageUrl(`CreateDigitalSalesRoom?leadId=${lead.id}`));
    };

    return (
        <div 
            className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all"
            onClick={() => onLeadClick(lead)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {lead.contact_name?.charAt(0) || 'L'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-slate-900">{lead.contact_name || 'Unknown'}</h4>
                        <p className="text-xs text-slate-500">{lead.contact_title || 'No title'}</p>
                    </div>
                </div>
                
                <div className="flex gap-1">
                    {!isCallActive ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCall}
                            disabled={!lead.contact_phone || isCallLoading}
                            className="h-6 w-6 p-0"
                        >
                            {isCallLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Phone className="w-3 h-3" />
                            )}
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleEndCall}
                            className="h-6 w-6 p-0"
                        >
                            <PhoneOff className="w-3 h-3" />
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={handleCreateSalesRoom}>
                                <Presentation className="w-4 h-4 mr-2" />
                                Create Sales Room
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Building2 className="w-3 h-3" />
                    <span>{lead.company_name || 'Unknown Company'}</span>
                </div>
                
                {lead.estimated_deal_value && (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                        <DollarSign className="w-3 h-3" />
                        <span>${lead.estimated_deal_value.toLocaleString()}</span>
                    </div>
                )}
                
                {lead.meeting_date_time && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(lead.meeting_date_time), 'MMM d, h:mm a')}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
                {lead.priority && (
                    <Badge className={`text-xs ${priorityColors[lead.priority]}`}>
                        {lead.priority}
                    </Badge>
                )}
                
                {lead.ai_score && (
                    <Badge className={`text-xs ${getScoreColor(lead.ai_score)}`}>
                        Score: {lead.ai_score}
                    </Badge>
                )}
                
                {lead.lead_source && (
                    <Badge variant="outline" className="text-xs">
                        {lead.lead_source}
                    </Badge>
                )}
            </div>

            {isCallActive && (
                <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Call Active</span>
                </div>
            )}
        </div>
    );
}
