import React, { useState, useEffect } from 'react';
import { Lead } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, DollarSign, Clock, Award } from 'lucide-react';

export default function LeadOwnerStats({ assignedToEmail, currentLeadId }) {
    const [stats, setStats] = useState({
        totalLeads: 0,
        wonLeads: 0,
        lostLeads: 0,
        activeLeads: 0,
        winRate: 0,
        totalRevenue: 0,
        avgDealSize: 0,
        avgDaysToClose: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!assignedToEmail) return;
        
        const fetchStats = async () => {
            try {
                // Get all leads assigned to this user
                const allLeads = await Lead.filter({ assigned_to_email: assignedToEmail });
                
                const totalLeads = allLeads.length;
                const wonLeads = allLeads.filter(l => l.status === 'closed_won').length;
                const lostLeads = allLeads.filter(l => l.status === 'closed_lost').length;
                const activeLeads = allLeads.filter(l => !['closed_won', 'closed_lost'].includes(l.status)).length;
                
                const winRate = totalLeads > 0 ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100) || 0 : 0;
                
                const wonLeadsWithValue = allLeads.filter(l => l.status === 'closed_won' && l.estimated_deal_value);
                const totalRevenue = wonLeadsWithValue.reduce((sum, l) => sum + (l.estimated_deal_value || 0), 0);
                const avgDealSize = wonLeadsWithValue.length > 0 ? Math.round(totalRevenue / wonLeadsWithValue.length) : 0;
                
                // Calculate average days to close for won deals
                const wonLeadsWithDates = wonLeadsWithValue.filter(l => l.created_date && l.updated_date);
                const avgDaysToClose = wonLeadsWithDates.length > 0 ? 
                    Math.round(wonLeadsWithDates.reduce((sum, l) => {
                        const created = new Date(l.created_date);
                        const updated = new Date(l.updated_date);
                        return sum + (updated - created) / (1000 * 60 * 60 * 24);
                    }, 0) / wonLeadsWithDates.length) : 0;

                setStats({
                    totalLeads,
                    wonLeads,
                    lostLeads,
                    activeLeads,
                    winRate,
                    totalRevenue,
                    avgDealSize,
                    avgDaysToClose
                });
            } catch (error) {
                console.error('Error fetching lead owner stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [assignedToEmail]);

    if (isLoading) {
        return <div className="text-center py-4 text-slate-500">Loading performance data...</div>;
    }

    if (!assignedToEmail) {
        return <div className="text-center py-4 text-slate-500">No assigned owner</div>;
    }

    return (
        <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-500" />
                    Lead Owner Performance
                </CardTitle>
                <p className="text-sm text-slate-600">{assignedToEmail}</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                            <Target className="w-4 h-4 text-slate-500 mr-1" />
                            <span className="text-xs text-slate-500">Total Leads</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{stats.totalLeads}</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-xs text-slate-500">Won</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">{stats.wonLeads}</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-xs text-slate-500">Lost</span>
                        </div>
                        <p className="text-lg font-bold text-red-600">{stats.lostLeads}</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                            <Clock className="w-4 h-4 text-orange-500 mr-1" />
                            <span className="text-xs text-slate-500">Active</span>
                        </div>
                        <p className="text-lg font-bold text-orange-600">{stats.activeLeads}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Win Rate</p>
                        <Badge className={`px-2 py-1 ${
                            stats.winRate >= 25 ? 'bg-green-100 text-green-800' :
                            stats.winRate >= 15 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {stats.winRate}%
                        </Badge>
                    </div>
                    
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
                        <p className="text-sm font-semibold text-slate-900">
                            ${stats.totalRevenue.toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Avg Deal Size</p>
                        <p className="text-sm font-semibold text-slate-900">
                            ${stats.avgDealSize.toLocaleString()}
                        </p>
                    </div>
                </div>
                
                {stats.avgDaysToClose > 0 && (
                    <div className="text-center mt-3 pt-3 border-t">
                        <p className="text-xs text-slate-500 mb-1">Avg Days to Close</p>
                        <p className="text-sm font-semibold text-slate-900">{stats.avgDaysToClose} days</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}