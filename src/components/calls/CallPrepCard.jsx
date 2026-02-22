
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Building, User, Mail, Phone, Globe, Mic, Bot, FileText, ChevronDown, Loader2, Eye, PhoneOff } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { initiateHumanCall } from '@/api/functions';
import { toast } from 'sonner';

export default function CallPrepCard({ call }) {
    const navigate = useNavigate();
    const [isCallLoading, setIsCallLoading] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);

    const priorityColors = {
        High: 'bg-red-100 text-red-800 border-red-200',
        Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        Low: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const handlePrepareBriefing = () => {
        // Navigate to the preparation page, passing the origin page
        navigate(createPageUrl(`CallPreparation?leadId=${call.id}&returnTo=CallPrep`));
    };

    const handleAIPractice = () => {
        // Set session storage to remember where we came from
        sessionStorage.setItem('returnToCallPrep', 'true');
        // Navigate to AI Roleplay with lead details
        navigate(createPageUrl(`AIRoleplay?name=${call.contact_name}&title=${call.contact_title}&company=${call.company_name}`));
    };
    
    const handleHumanCall = async () => {
        if (!call.contact_phone) {
            toast.error("No phone number available for this lead.");
            return;
        }

        setIsCallLoading(true);
        try {
            const response = await initiateHumanCall({ leadId: call.id });
            if (response.data?.success) {
                toast.success("Call initiated!", {
                    description: `Connecting to ${call.contact_name}`
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

    const handleEndCall = () => {
        setIsCallActive(false);
        toast.success("Call ended");
    };

    const handleViewDetails = () => {
        // Navigate to Lead Detail, and tell it that its own back button should return here.
        navigate(createPageUrl(`LeadDetail?leadId=${call.id}&returnTo=CallPrep`));
    };

    return (
        <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Building className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{call.company_name}</h3>
                            <p className="text-sm text-slate-500">
                                {call.meeting_date_time ? format(new Date(call.meeting_date_time), 'EEEE, p') : 'No time set'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={`${priorityColors[call.priority] || 'bg-slate-100'}`}>{call.priority || 'N/A'}</Badge>
                        <Badge variant="outline">{call.meeting_type || 'Follow-up'}</Badge>
                    </div>
                </div>

                <div className="border-t border-slate-200 my-4"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <div>
                                <p className="font-semibold text-slate-700">{call.contact_name}</p>
                                <p className="text-slate-500">{call.contact_title}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <a href={`mailto:${call.contact_email}`} className="text-indigo-600 hover:underline">{call.contact_email}</a>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${call.contact_phone}`} className="text-indigo-600 hover:underline">{call.contact_phone}</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <a href={call.company_website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{call.company_website}</a>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-slate-200 mt-4 pt-4">
                    <div className="flex justify-end gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                    Prepare
                                    <ChevronDown className="w-4 h-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={handlePrepareBriefing}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Prep Briefing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleAIPractice}>
                                    <Bot className="w-4 h-4 mr-2" />
                                    Practice with AI Roleplay
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {isCallActive ? (
                                    <DropdownMenuItem onClick={handleEndCall} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                                        <PhoneOff className="w-4 h-4 mr-2" />
                                        End Call
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={handleHumanCall} disabled={!call.contact_phone || isCallLoading}>
                                        {isCallLoading ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Phone className="w-4 h-4 mr-2" />
                                        )}
                                        Start Call (Human)
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleViewDetails}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Full Lead Details
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
