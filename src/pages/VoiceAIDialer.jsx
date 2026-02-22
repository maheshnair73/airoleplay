import React, { useState, useEffect, useMemo } from 'react';
import { Campaign } from '@/api/entities';
import { Lead } from '@/api/entities';
import { CallRecord } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus, Bot, Loader2, Play, Pause, Archive, BarChart2, CheckCircle, Target, Phone, Percent, DollarSign, Users, Briefcase } from 'lucide-react';
import CampaignModal from '@/components/voice/CampaignModal';
import ActiveCampaignMonitor from '@/components/voice/ActiveCampaignMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { initiateVoiceCall } from '@/api/functions';

const CampaignCard = ({ campaign, onSelect, onToggleStatus, onArchive, onMonitor }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onMonitor(campaign)}>
        <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl font-bold text-slate-800">{campaign.name}</CardTitle>
                    <p className="text-sm text-slate-500">{campaign.description}</p>
                </div>
                <div className={`px-2 py-1 text-xs rounded-full capitalize ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                }`}>
                    {campaign.status}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{campaign.target_lead_count || 0} Leads</span>
                </div>
                <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{campaign.config?.callScript?.replace('_', ' ') || 'N/A'}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onSelect(campaign); }}>Details</Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); onToggleStatus(campaign); }}
                    disabled={campaign.status === 'completed' || campaign.status === 'archived'}
                >
                    {campaign.status === 'active' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {campaign.status === 'active' ? 'Pause' : 'Start'}
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onArchive(campaign); }}>
                    <Archive className="w-4 h-4 mr-2" /> Archive
                </Button>
            </div>
        </CardContent>
    </Card>
);

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

const CampaignDashboardMetrics = ({ campaigns, callRecords, leads }) => {
    const metrics = useMemo(() => {
        const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
        const totalDials = callRecords.length;
        const connectedCalls = callRecords.filter(c => c.call_status === 'completed').length;
        const connectionRate = totalDials > 0 ? (connectedCalls / totalDials * 100).toFixed(1) : 0;
        const qualifiedLeads = leads.filter(l => l.status === 'qualified' && callRecords.some(c => c.lead_id === l.id)).length;
        const qualificationRate = connectedCalls > 0 ? (qualifiedLeads / connectedCalls * 100).toFixed(1) : 0;
        const totalCost = callRecords.reduce((sum, c) => sum + (c.call_cost || 0), 0);

        return { activeCampaigns, totalDials, connectionRate, qualifiedLeads, qualificationRate, totalCost };
    }, [campaigns, callRecords, leads]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <MetricCard title="Active Campaigns" value={metrics.activeCampaigns} icon={Play} color="bg-green-500" />
            <MetricCard title="Total Dials" value={metrics.totalDials} icon={Phone} color="bg-blue-500" />
            <MetricCard title="Connection Rate" value={metrics.connectionRate} suffix="%" icon={Target} color="bg-cyan-500" />
            <MetricCard title="Qualified Leads" value={metrics.qualifiedLeads} icon={CheckCircle} color="bg-yellow-500" />
            <MetricCard title="Qualification Rate" value={metrics.qualificationRate} suffix="%" icon={Percent} color="bg-purple-500" />
            <MetricCard title="Total Cost" value={metrics.totalCost.toFixed(2)} prefix="$" icon={DollarSign} color="bg-slate-500" />
        </div>
    );
};

export default function VoiceAIDialer() {
    const [campaigns, setCampaigns] = useState([]);
    const [leads, setLeads] = useState([]);
    const [callRecords, setCallRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [activeCampaign, setActiveCampaign] = useState(null);
    const [isStartingCampaign, setIsStartingCampaign] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [campaignData, leadData, callRecordData] = await Promise.all([
                Campaign.list('-created_date'),
                Lead.list(),
                CallRecord.filter({ call_type: 'ai_voice' })
            ]);
            setCampaigns(campaignData);
            setLeads(leadData);
            setCallRecords(callRecordData);
        } catch (error) {
            console.error('Error loading campaign data:', error);
            toast.error("Failed to load campaign data.");
        }
        setIsLoading(false);
    };

    const handleSaveCampaign = async (campaignData) => {
        try {
            if (campaignData.id) {
                await Campaign.update(campaignData.id, campaignData);
                toast.success("Campaign updated successfully!");
            } else {
                await Campaign.create(campaignData);
                toast.success("Campaign created successfully!");
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Error saving campaign:', error);
            toast.error("Failed to save campaign.");
        }
    };

    const handleToggleStatus = async (campaign) => {
        const newStatus = campaign.status === 'active' ? 'draft' : 'active';
        
        if (newStatus === 'active') {
            setIsStartingCampaign(true);
            toast.info(`Starting campaign: ${campaign.name}...`);
            try {
                const targetLeads = await Lead.filter(campaign.filters || {});
                if (targetLeads.length === 0) {
                    toast.error("No target leads found for this campaign's filters.");
                    setIsStartingCampaign(false);
                    return;
                }

                await Campaign.update(campaign.id, { status: 'active', last_run_date: new Date().toISOString() });

                const callPromises = targetLeads.map(lead => 
                    initiateVoiceCall({
                        leadId: lead.id,
                        campaignId: campaign.id,
                        callScript: campaign.config?.callScript,
                        customInstructions: campaign.config?.customInstructions,
                    }).catch(err => ({ leadId: lead.id, error: err.message }))
                );

                Promise.all(callPromises).then(results => {
                    const failedCalls = results.filter(r => r.error);
                    if (failedCalls.length > 0) {
                        toast.error(`${failedCalls.length} of ${targetLeads.length} calls failed to initiate.`);
                    }
                });

                toast.success(`Campaign "${campaign.name}" is active and dialing ${targetLeads.length} leads.`);
                setActiveCampaign(campaign);
            } catch (error) {
                console.error('Error starting campaign:', error);
                toast.error("Failed to start campaign.");
                await Campaign.update(campaign.id, { status: 'draft' });
            } finally {
                setIsStartingCampaign(false);
                loadData();
            }
        } else {
            try {
                await Campaign.update(campaign.id, { status: newStatus });
                toast.success(`Campaign status updated to ${newStatus}.`);
                loadData();
            } catch (error) {
                console.error('Error toggling campaign status:', error);
                toast.error("Failed to update campaign status.");
            }
        }
    };
    
    const handleArchive = async (campaign) => {
        try {
            await Campaign.update(campaign.id, { status: 'archived' });
            toast.success("Campaign archived.");
            loadData();
        } catch (error) {
            console.error('Error archiving campaign:', error);
            toast.error("Failed to archive campaign.");
        }
    };
    
    const handleSelectCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleMonitorCampaign = (campaign) => {
        if (campaign.status === 'active' || campaign.status === 'completed') {
            setActiveCampaign(campaign);
        } else {
            handleSelectCampaign(campaign);
        }
    };

    if (isLoading || isStartingCampaign) {
        return (
            <div className="p-8 text-center bg-slate-50 min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="ml-2 text-slate-700">{isStartingCampaign ? 'Starting campaign...' : 'Loading campaigns...'}</p>
            </div>
        );
    }

    if (activeCampaign) {
        return <ActiveCampaignMonitor campaign={activeCampaign} onBack={() => setActiveCampaign(null)} />;
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3"><Bot className="w-10 h-10 text-purple-600" /> AI Call Campaigns</h1>
                    <p className="text-slate-600 mt-2">Manage and monitor your AI calling campaigns.</p>
                </div>
                <Button onClick={() => { setSelectedCampaign(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Campaign
                </Button>
            </div>

            <CampaignDashboardMetrics campaigns={campaigns} callRecords={callRecords} leads={leads} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.filter(c => c.status !== 'archived').map(campaign => (
                    <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onSelect={handleSelectCampaign}
                        onToggleStatus={handleToggleStatus}
                        onArchive={handleArchive}
                        onMonitor={handleMonitorCampaign}
                    />
                ))}
            </div>

            <CampaignModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSaveCampaign}
                campaign={selectedCampaign}
                leads={leads}
            />
        </div>
    );
}