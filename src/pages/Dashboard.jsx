
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Lead } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import {
    BarChart3, Users, Target, DollarSign, BrainCircuit, Bot,
    GraduationCap, Settings, MoreVertical, LogOut, Loader2, Command, FileText, Phone, Plug,
    Book, Presentation, MessageSquare, Server, ChevronRight, Mail, User as UserIcon, ShieldCheck,
    Mic, Brain, Clock, HelpCircle, ArrowRight, Copy, Plus, TrendingUp, TrendingDown,
    Activity, Zap, Award, CheckCircle, Sparkles // Added Sparkles
} from 'lucide-react';
import AICoachCorner from '@/components/dashboard/AICoachCorner';
import GameStatusWidget from '@/components/gamification/GameStatusWidget';

export default function Dashboard() {
    const navigate = useNavigate(); // Initialize useNavigate
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({
        totalLeads: 0,
        activeDeals: 0, // Now represents Active Opportunities (qualified leads)
        pipelineValue: 0,
        winRate: 100
    });
    const [urgentFollowUps, setUrgentFollowUps] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [currentUser, recentLeads] = await Promise.all([
                    User.me(),
                    Lead.list('-created_at', 5)
                ]);
                
                setUser(currentUser);
                setLeads(recentLeads);
                
                // Calculate stats from leads only
                const allLeads = await Lead.list();
                
                // Find qualified leads needing follow-up
                const qualifiedLeadsNeedingFollowUp = allLeads.filter(lead => 
                    lead.status === 'qualified' && 
                    (!lead.next_followup_date || new Date(lead.next_followup_date) <= new Date())
                );
                setUrgentFollowUps(qualifiedLeadsNeedingFollowUp);
                
                // Calculate pipeline from qualified leads with estimated_deal_value
                const qualifiedLeads = allLeads.filter(lead => 
                    ['qualified', 'meeting_scheduled', 'proposal_sent', 'negotiation'].includes(lead.status)
                );
                const pipelineTotal = qualifiedLeads.reduce((sum, lead) => sum + (lead.estimated_deal_value || 0), 0);
                
                const wonLeads = allLeads.filter(lead => lead.status === 'closed_won').length;
                const totalClosedLeads = allLeads.filter(lead => ['closed_won', 'closed_lost'].includes(lead.status)).length;
                const winRate = totalClosedLeads > 0 ? Math.round((wonLeads / totalClosedLeads) * 100) : 100;
                
                setStats({
                    totalLeads: allLeads.length,
                    activeDeals: qualifiedLeads.length, // Now represents active opportunities
                    pipelineValue: pipelineTotal,
                    winRate: winRate
                });
            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusBadgeColor = (status) => {
        const colors = {
            'new': 'bg-blue-100 text-blue-800',
            'contacted': 'bg-yellow-100 text-yellow-800',
            'qualified': 'bg-green-100 text-green-800',
            'meeting_scheduled': 'bg-purple-100 text-purple-800',
            'proposal_sent': 'bg-indigo-100 text-indigo-800', // Added for lead status
            'negotiation': 'bg-orange-100 text-orange-800',
            'closed_won': 'bg-emerald-100 text-emerald-800',
            'closed_lost': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            {/* Header with Action Buttons */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Welcome back! Here's your sales overview.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link to={createPageUrl('effyLeads')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Lead
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Game Status Widget */}
            <GameStatusWidget />

            {/* Urgent Follow-ups Alert - Redesigned */}
            {urgentFollowUps.length > 0 && (
                <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 shadow-md">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-900">Urgent Follow-ups ({urgentFollowUps.length})</h3>
                                <p className="text-sm text-orange-800">You have qualified leads that need attention.</p>
                            </div>
                        </div>
                        
                        <div className="flex-grow flex flex-wrap items-center gap-2">
                            {urgentFollowUps.slice(0, 3).map(lead => (
                                <Link 
                                    key={lead.id}
                                    to={createPageUrl('LeadDetail')} 
                                    onClick={() => {
                                        sessionStorage.setItem('selectedLeadId', lead.id);
                                        sessionStorage.setItem('selectedLeadData', JSON.stringify(lead));
                                    }}
                                >
                                    <Badge variant="outline" className="bg-white/80 hover:bg-white cursor-pointer py-1 px-3">
                                        {lead.contact_name}
                                    </Badge>
                                </Link>
                            ))}
                            {urgentFollowUps.length > 3 && (
                                <span className="text-sm text-orange-700 font-medium">
                                    + {urgentFollowUps.length - 3} more
                                </span>
                            )}
                        </div>

                        <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 flex-shrink-0 mt-2 md:mt-0">
                            <Link to={createPageUrl('effyLeads')}>
                                View All
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </div>
                </Card>
            )}

            {/* AI Coach's Corner */}
            <AICoachCorner />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('effyLeads')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
                        <div className="flex items-center text-xs text-green-600 mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +12%
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('effyLeads')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Active Opportunities</CardTitle>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Target className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.activeDeals}</div>
                        <div className="flex items-center text-xs text-green-600 mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +8%
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('effyLeads')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Pipeline Value</CardTitle>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.pipelineValue)}</div>
                        <div className="flex items-center text-xs text-green-600 mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +23%
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('Analytics')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Win Rate</CardTitle>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Award className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.winRate}%</div>
                        <div className="flex items-center text-xs text-red-600 mt-1">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            -3%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Recent Leads */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">Recent Leads</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to={createPageUrl('effyLeads')}>
                                View All
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {leads.length > 0 ? leads.map((lead) => (
                            <div key={lead.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                 onClick={() => {
                                     sessionStorage.setItem('selectedLeadId', lead.id);
                                     sessionStorage.setItem('selectedLeadData', JSON.stringify(lead));
                                     window.location.href = createPageUrl('LeadDetail');
                                 }}>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                            {lead.contact_name ? lead.contact_name.charAt(0).toUpperCase() : 'L'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-slate-900">{lead.company_name || 'Unknown Company'}</p>
                                        <p className="text-sm text-slate-600">{lead.contact_name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge className={getStatusBadgeColor(lead.status)}>
                                        {lead.status || 'new'}
                                    </Badge>
                                    {lead.estimated_deal_value && (
                                        <p className="text-sm font-medium text-slate-600 mt-1">
                                            {formatCurrency(lead.estimated_deal_value)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-500">
                                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>No leads yet. Start by adding your first lead!</p>
                                <Button asChild className="mt-3">
                                    <Link to={createPageUrl('effyLeads')}>Add Lead</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
