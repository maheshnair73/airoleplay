
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/api/entities';
import { CallRecord } from '@/api/entities';
import { GameAction } from '@/api/entities';
import { User } from '@/api/entities';
import { BarChart3, TrendingUp, TrendingDown, Target, Phone, Mail, Trophy, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function KPIDashboard() {
    const [timeRange, setTimeRange] = useState('30');
    const [kpis, setKpis] = useState({
        callVolume: { value: 0, change: 0, target: 150 },
        conversionRate: { value: 0, change: 0, target: 25 },
        avgDealSize: { value: 0, change: 0, target: 50000 },
        activityScore: { value: 0, change: 0, target: 80 },
        coachingCompletion: { value: 0, change: 0, target: 90 },
        proposalsCreated: { value: 0, change: 0, target: 20 }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchKPIData = async () => {
            setIsLoading(true);
            try {
                const daysBack = parseInt(timeRange);
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - daysBack);

                // Fetch data from different entities
                const [leads, callRecords, gameActions] = await Promise.all([
                    Lead.list(),
                    CallRecord.list(),
                    GameAction.list()
                ]);

                // Calculate KPIs
                const callVolume = callRecords.filter(call => 
                    new Date(call.created_date) >= startDate
                ).length;

                const qualifiedLeads = leads.filter(lead => 
                    ['qualified', 'meeting_scheduled', 'proposal_sent', 'negotiation', 'closed_won'].includes(lead.status)
                ).length;
                
                const totalLeads = leads.length;
                const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

                const dealsWon = leads.filter(lead => lead.status === 'closed_won');
                const avgDealSize = dealsWon.length > 0 
                    ? dealsWon.reduce((sum, deal) => sum + (deal.estimated_deal_value || 0), 0) / dealsWon.length
                    : 0;

                const recentGameActions = gameActions.filter(action => 
                    new Date(action.created_date) >= startDate
                );
                const activityScore = recentGameActions.length > 0 
                    ? recentGameActions.reduce((sum, action) => sum + action.points_earned, 0) / recentGameActions.length
                    : 0;

                const coachingActions = recentGameActions.filter(action => 
                    action.action_type === 'coaching_submitted'
                ).length;
                const coachingCompletion = coachingActions * 5; // Approximate percentage

                const proposalActions = recentGameActions.filter(action => 
                    action.action_type === 'document_created'
                ).length;

                setKpis({
                    callVolume: { value: callVolume, change: 12, target: 150 },
                    conversionRate: { value: Math.round(conversionRate), change: -3, target: 25 },
                    avgDealSize: { value: Math.round(avgDealSize), change: 8, target: 50000 },
                    activityScore: { value: Math.round(activityScore), change: 15, target: 80 },
                    coachingCompletion: { value: Math.min(coachingCompletion, 100), change: 5, target: 90 },
                    proposalsCreated: { value: proposalActions, change: 22, target: 20 }
                });

            } catch (error) {
                console.error('Failed to load KPI data:', error);
                toast.error('Failed to load KPI data');
            }
            setIsLoading(false);
        };

        fetchKPIData();
    }, [timeRange]);

    const KPICard = ({ title, value, target, change, icon: Icon, format = 'number' }) => {
        const isPositive = change >= 0;
        const progressPercent = (value / target) * 100;
        
        const formatValue = (val) => {
            if (format === 'currency') {
                return `$${val.toLocaleString()}`;
            } else if (format === 'percentage') {
                return `${val}%`;
            }
            return val.toLocaleString();
        };

        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-700">{title}</h3>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {Math.abs(change)}%
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-bold">{formatValue(value)}</span>
                            <span className="text-sm text-slate-500">Target: {formatValue(target)}</span>
                        </div>
                        
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    progressPercent >= 100 ? 'bg-green-500' : 
                                    progressPercent >= 75 ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{Math.round(progressPercent)}% of target</span>
                            {progressPercent >= 100 && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                    Target Exceeded!
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">KPI Dashboard</h1>
                    <p className="text-slate-600 mt-1">Track your key performance indicators and goals</p>
                </div>
                
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-slate-500">Loading KPI data...</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <KPICard
                        title="Call Volume"
                        value={kpis.callVolume.value}
                        target={kpis.callVolume.target}
                        change={kpis.callVolume.change}
                        icon={Phone}
                        format="number"
                    />
                    
                    <KPICard
                        title="Conversion Rate"
                        value={kpis.conversionRate.value}
                        target={kpis.conversionRate.target}
                        change={kpis.conversionRate.change}
                        icon={Target}
                        format="percentage"
                    />
                    
                    <KPICard
                        title="Avg Deal Size"
                        value={kpis.avgDealSize.value}
                        target={kpis.avgDealSize.target}
                        change={kpis.avgDealSize.change}
                        icon={TrendingUp}
                        format="currency"
                    />
                    
                    <KPICard
                        title="Activity Score"
                        value={kpis.activityScore.value}
                        target={kpis.activityScore.target}
                        change={kpis.activityScore.change}
                        icon={Activity}
                        format="number"
                    />
                    
                    <KPICard
                        title="Coaching Completion"
                        value={kpis.coachingCompletion.value}
                        target={kpis.coachingCompletion.target}
                        change={kpis.coachingCompletion.change}
                        icon={Trophy}
                        format="percentage"
                    />
                    
                    <KPICard
                        title="Proposals Created"
                        value={kpis.proposalsCreated.value}
                        target={kpis.proposalsCreated.target}
                        change={kpis.proposalsCreated.change}
                        icon={Mail}
                        format="number"
                    />
                </div>
            )}
        </div>
    );
}
