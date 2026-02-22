import React, { useState, useEffect } from 'react';
import { CallRecord } from '@/api/entities';
import { LeadActivity } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, History, Search, Filter, Clock, User, Building } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { initiateHumanCall } from '@/api/functions';

export default function Dialer() {
    const [callHistory, setCallHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchCallHistory();
    }, []);

    const fetchCallHistory = async () => {
        setIsLoading(true);
        try {
            const records = await CallRecord.list('-created_date', 50);
            setCallHistory(records);
        } catch (error) {
            console.error('Error fetching call history:', error);
            toast.error('Failed to load call history');
        }
        setIsLoading(false);
    };

    const handleQuickDial = async () => {
        if (!phoneNumber) {
            toast.error('Please enter a phone number');
            return;
        }

        try {
            const response = await initiateHumanCall({ 
                phoneNumber: phoneNumber.trim(),
                leadId: null // Quick dial doesn't have associated lead
            });
            
            if (response.data?.success) {
                toast.success('Call initiated successfully!');
                setPhoneNumber('');
                // Refresh call history after a brief delay
                setTimeout(fetchCallHistory, 2000);
            } else {
                toast.error('Call failed to initiate');
            }
        } catch (error) {
            console.error('Quick dial error:', error);
            toast.error('Failed to initiate call');
        }
    };

    const getCallStatusColor = (status) => {
        const colors = {
            'completed': 'bg-green-100 text-green-800',
            'no_answer': 'bg-yellow-100 text-yellow-800',
            'busy': 'bg-orange-100 text-orange-800',
            'voicemail': 'bg-blue-100 text-blue-800',
            'failed': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };

    const getCallTypeIcon = (type) => {
        return type === 'ai_voice' ? '🤖' : '📞';
    };

    const filteredHistory = callHistory.filter(call => {
        const matchesSearch = searchTerm === '' || 
            call.prospect_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.prospect_phone?.includes(searchTerm);
            
        const matchesFilter = filterType === 'all' || call.call_type === filterType;
        
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
                        <Phone className="w-10 h-10 text-blue-600" />
                        Call History & Quick Dial
                    </h1>
                    <p className="text-slate-600 mt-2">View your call activity and make quick calls</p>
                </header>

                {/* Quick Dial Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Quick Dial
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Input
                                placeholder="Enter phone number..."
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="flex-1"
                                onKeyPress={(e) => e.key === 'Enter' && handleQuickDial()}
                            />
                            <Button onClick={handleQuickDial} className="bg-green-600 hover:bg-green-700">
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Call History Section */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" />
                                Call History
                            </CardTitle>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                    <Input
                                        placeholder="Search calls..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-64"
                                    />
                                </div>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                                >
                                    <option value="all">All Calls</option>
                                    <option value="human_dialer">Manual Calls</option>
                                    <option value="ai_voice">AI Calls</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-slate-500 mt-2">Loading call history...</p>
                            </div>
                        ) : filteredHistory.length > 0 ? (
                            <div className="space-y-3">
                                {filteredHistory.map((call) => (
                                    <div key={call.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl">{getCallTypeIcon(call.call_type)}</div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-900">
                                                            {call.prospect_name || 'Unknown'}
                                                        </p>
                                                        <Badge className={getCallStatusColor(call.call_status)}>
                                                            {call.call_status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{call.prospect_phone}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {format(new Date(call.created_date), 'MMM d, h:mm a')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    {call.call_duration ? `${Math.round(call.call_duration / 60)} min` : 'N/A'}
                                                </p>
                                                {call.call_cost && (
                                                    <p className="text-xs text-slate-500">${call.call_cost.toFixed(2)}</p>
                                                )}
                                                <p className="text-xs text-slate-400 capitalize">
                                                    {call.call_type?.replace('_', ' ') || 'Manual'}
                                                </p>
                                            </div>
                                        </div>
                                        {call.ai_analysis?.summary && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-slate-700">
                                                    <strong>AI Summary:</strong> {call.ai_analysis.summary}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No call history found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}