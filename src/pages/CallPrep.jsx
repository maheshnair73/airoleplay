import React, { useState, useEffect } from 'react';
import { Lead } from '@/api/entities';
import CallPrepCard from '@/components/calls/CallPrepCard';
import { Loader2, CalendarX, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function CallPrep() {
    const [upcomingCalls, setUpcomingCalls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUpcomingCalls = async () => {
            setIsLoading(true);
            try {
                // Fetch all leads that have a meeting scheduled.
                const allLeads = await Lead.list();
                
                const calls = allLeads
                    .filter(lead => lead.meeting_date_time) // Filter for leads with a scheduled meeting
                    .sort((a, b) => new Date(a.meeting_date_time) - new Date(b.meeting_date_time)); // Sort by meeting date

                setUpcomingCalls(calls);
            } catch (error) {
                console.error("Failed to fetch upcoming calls:", error);
                toast.error("Could not load upcoming calls.");
            }
            setIsLoading(false);
        };

        fetchUpcomingCalls();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-slate-600">Loading upcoming calls...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-600" />
                    Upcoming Call Preparation
                </h1>
                <p className="text-slate-600 mt-1">Review your scheduled calls and prepare for success.</p>
            </div>

            {upcomingCalls.length > 0 ? (
                <div className="space-y-6">
                    {upcomingCalls.map(call => (
                        <CallPrepCard key={call.id} call={call} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm border">
                    <CalendarX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">No Upcoming Calls</h2>
                    <p className="text-slate-500 mt-2">There are no calls scheduled. Go to a lead's profile to schedule one!</p>
                </div>
            )}
        </div>
    );
}