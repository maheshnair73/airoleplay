
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { Brain, Zap, ArrowUp, Target, TrendingUp, Activity, Loader2 } from 'lucide-react';

const DataSnapshot = ({ metric, value, target }) => (
    <div className="bg-white/60 p-4 rounded-xl h-full flex flex-col justify-center text-center shadow-inner">
        <p className="text-sm font-medium text-slate-600 mb-1">{metric}</p>
        <p className="text-4xl font-bold text-slate-800">{value}</p>
        {target && <p className="text-xs text-slate-500 mt-1">Team Average: {target}</p>}
    </div>
);

export default function AICoachCorner() {
    const [topInsight, setTopInsight] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const generatePersonalizedInsight = useCallback((currentUser, allLeads) => {
        const userName = currentUser?.display_name?.split(' ')[0] || currentUser?.full_name?.split(' ')[0] || 'there';
        const recentLeads = allLeads.filter(l => new Date(l.created_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const qualifiedRecentLeadsCount = recentLeads.filter(lead => ['qualified', 'meeting_scheduled'].includes(lead.status)).length;
        const conversionRate = recentLeads.length > 0 ? (qualifiedRecentLeadsCount / recentLeads.length) * 100 : 0;
        let insight = null;

        // Active opportunities are qualified leads (or further along)
        const activeOpportunities = allLeads.filter(lead => ['qualified', 'meeting_scheduled', 'proposal_sent', 'negotiation'].includes(lead.status));

        if (conversionRate < 20 && recentLeads.length > 5) {
            insight = {
                id: 'conversion-focus',
                title: `${userName}, Level Up Your Qualification Game`,
                description: `You've contacted ${recentLeads.length} leads recently but only ${qualifiedRecentLeadsCount} moved forward. Top reps in your position typically see 25%+ qualification rates. A focused practice session could unlock those missing opportunities.`,
                icon: Target,
                metric: { name: "Your Qualification Rate", value: `${conversionRate.toFixed(0)}%`, target: "25%" },
                callToAction: { text: 'Practice Discovery Questions', link: 'AIRoleplay' }
            };
        } else if (activeOpportunities.length > 0) {
            const avgDealSize = activeOpportunities.reduce((sum, lead) => sum + (lead.estimated_deal_value || 0), 0) / activeOpportunities.length;
            const totalPipeline = activeOpportunities.reduce((sum, lead) => sum + (lead.estimated_deal_value || 0), 0);
            if (avgDealSize < 25000) {
                insight = {
                    id: 'deal-size-focus',
                    title: `${userName}, Your Next $10K+ Breakthrough`,
                    description: `You have $${Math.round(totalPipeline/1000)}K in your pipeline across ${activeOpportunities.length} opportunities. You're clearly good at building a pipeline, but your average deal size of $${Math.round(avgDealSize/1000)}K shows room to grow. Learning enterprise value communication could 2x your commission.`,
                    icon: TrendingUp,
                    metric: { name: "Your Avg Deal Size", value: `$${Math.round(avgDealSize / 1000)}K`, target: "$35K" },
                    callToAction: { text: 'Study Enterprise Strategies', link: 'ProductManagement' } 
                };
            }
        } else if (recentLeads.length === 0) { 
            insight = {
                id: 'activity-boost',
                title: `${userName}, Let's Jumpstart Your Pipeline`,
                description: `Your CRM shows limited recent activity. The best reps start each day with prospecting momentum. Just 15 minutes of focused outreach can generate 3-5 quality conversations this week.`,
                icon: Activity,
                metric: { name: "Recent Leads Added", value: "0", target: "5/week" },
                callToAction: { text: 'Add Your First Lead', link: 'effyLeads' }
            };
        }
        
        if (!insight) {
            // Calculate last login days (assuming created_date can be used as a proxy for 'first' login or registration)
            const lastLoginDate = new Date(currentUser?.created_date || new Date());
            const today = new Date();
            const timeDiff = today.getTime() - lastLoginDate.getTime();
            const lastLoginDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

            insight = {
                id: 'daily-practice',
                title: `${userName}, Your 5-Minute Sales Edge`,
                description: `You've been using the platform for ${lastLoginDays > 0 ? lastLoginDays + ' days' : 'a while'} - that shows commitment! Top performers do a quick roleplay warm-up before important calls. It's like stretching before a workout - 5 minutes that sets you up for success.`,
                icon: Activity,
                metric: { name: "Daily Practice Goal", value: "5 min", target: null },
                callToAction: { text: 'Start Your Sales Warm-up', link: 'AIRoleplay' }
            };
        }

        setTopInsight(insight);
    }, []);

    const loadUserAndGenerateInsight = useCallback(async () => {
        setIsLoading(true);
        try {
            const [currentUser, allLeads] = await Promise.all([
                User.me().catch(() => null),
                Lead.list().catch(() => []),
            ]);
            
            setUser(currentUser);
            generatePersonalizedInsight(currentUser, allLeads);
        } catch (error) {
            console.error('Error loading user and generating insight:', error);
            // Set a fallback insight to prevent a blank component on error
            setTopInsight({
                id: 'error-state',
                title: `Welcome back!`,
                description: `Let's make today a great day for sales. Ready to warm up?`,
                icon: Brain,
                metric: { name: "Daily Practice Goal", value: "5 min", target: null },
                callToAction: { text: 'Start Your Sales Warm-up', link: 'AIRoleplay' }
            });
        }
        setIsLoading(false);
    }, [generatePersonalizedInsight]);

    useEffect(() => {
        loadUserAndGenerateInsight();
    }, [loadUserAndGenerateInsight]);

    if (isLoading) {
        return (
            <Card className="bg-gradient-to-br from-violet-100 to-blue-100 border-violet-200">
                <CardContent className="p-4 h-40 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!topInsight) return null;

    return (
        <Card className="bg-gradient-to-br from-violet-100 to-blue-100 border-violet-200 overflow-hidden shadow-lg">
            <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-blue-500 rounded-lg flex items-center justify-center shadow-inner">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    AI Coach's Corner
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0">
                                <topInsight.icon className="w-8 h-8 text-violet-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{topInsight.title}</h3>
                                <p className="text-slate-600 text-sm">{topInsight.description}</p>
                            </div>
                        </div>
                        <Link to={createPageUrl(topInsight.callToAction.link)}>
                            <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-bold py-3 h-auto text-base shadow-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                <Zap className="w-5 h-5 mr-2" />
                                {topInsight.callToAction.text}
                                <ArrowUp className="w-4 h-4 ml-2 rotate-45" />
                            </Button>
                        </Link>
                    </div>
                    <div className="h-full">
                        <DataSnapshot
                            metric={topInsight.metric.name}
                            value={topInsight.metric.value}
                            target={topInsight.metric.target}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
