import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, Target, CheckCircle, Percent, DollarSign, Loader2, Users } from 'lucide-react';
import { CallRecord } from '@/api/entities';
import { Lead } from '@/api/entities';
import { toast } from 'sonner';

const MetricCard = ({ title, value, icon: Icon, color, prefix = '', suffix = '' }) => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-800">{prefix}{value}{suffix}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function ActiveCampaignMonitor({ campaign, onBack }) {
    const [callRecords, setCallRecords] = useState([]);
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!campaign) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [records, campaignLeads] = await Promise.all([
                    CallRecord.filter({ campaign_id: campaign.id }),
                    Lead.filter(campaign.filters || {})
                ]);
                setCallRecords(records);
                setLeads(campaignLeads);
            } catch (error) {
                console.error("Error fetching campaign data:", error);
                toast.error("Failed to refresh campaign data.");
            }
            setIsLoading(false);
        };
        
        fetchData();
        const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds

        return () => clearInterval(interval);
    }, [campaign]);

    const metrics = useMemo(() => {
        const totalLeadsInList = leads.length;
        const totalDials = callRecords.length;
        const connectedCalls = callRecords.filter(c => c.call_status === 'completed').length;
        const connectionRate = totalDials > 0 ? ((connectedCalls / totalDials) * 100).toFixed(1) : 0;
        
        const qualifiedLeadIds = new Set(callRecords.filter(c => c.ai_analysis?.qualification_outcome === 'qualified').map(c => c.lead_id));
        const qualifiedLeads = qualifiedLeadIds.size;
        const qualificationRate = connectedCalls > 0 ? ((qualifiedLeads / connectedCalls) * 100).toFixed(1) : 0;
        const totalCost = callRecords.reduce((sum, c) => sum + (c.call_cost || 0), 0);

        return { totalLeadsInList, totalDials, connectionRate, qualifiedLeads, qualificationRate, totalCost, connectedCalls };
    }, [callRecords, leads]);

    if (!campaign) return null;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Button variant="ghost" onClick={onBack} className="mb-2 -ml-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Campaigns
                    </Button>
                    <h1 className="text-4xl font-bold text-slate-800">{campaign.name}</h1>
                    <p className="text-slate-600 mt-2">{campaign.description}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">Status</p>
                    <div className={`px-3 py-1 text-lg font-semibold rounded-full capitalize ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800 animate-pulse' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {campaign.status}
                    </div>
                </div>
            </div>

            {isLoading && callRecords.length === 0 ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <MetricCard title="Target Leads" value={metrics.totalLeadsInList} icon={Users} color="bg-gray-500" />
                    <MetricCard title="Dials Made" value={metrics.totalDials} icon={Phone} color="bg-blue-500" />
                    <MetricCard title="Connection Rate" value={metrics.connectionRate} suffix="%" icon={Target} color="bg-cyan-500" />
                    <MetricCard title="Qualified Leads" value={metrics.qualifiedLeads} icon={CheckCircle} color="bg-yellow-500" />
                    <MetricCard title="Qualification Rate" value={metrics.qualificationRate} suffix="%" icon={Percent} color="bg-purple-500" />
                    <MetricCard title="Total Cost" value={metrics.totalCost.toFixed(2)} prefix="$" icon={DollarSign} color="bg-slate-500" />
                </div>
            )}
        </div>
    );
}