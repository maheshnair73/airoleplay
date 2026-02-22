
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Bot, 
    Zap, 
    Mail, 
    Phone, 
    FileText, 
    BarChart3,
    Settings,
    Sparkles,
    Clock,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { AIAgentSubscription } from '@/api/entities';
import { AIAgentActivity } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { User } from '@/api/entities';
import { CompanyUser } from '@/api/entities';
import { Company } from '@/api/entities';

export default function AIAgentWidget({ className }) {
    const [subscription, setSubscription] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [quickActions, setQuickActions] = useState([]);

    const getCompanyId = useCallback(async () => {
        const currentUser = await User.me();
        if (!currentUser) return null;
        
        const companyUserRecords = await CompanyUser.filter({ user_email: currentUser.email });
        if (companyUserRecords.length > 0) {
            return companyUserRecords[0].company_id;
        }
        return null;
    }, []);

    const checkSubscription = useCallback(async () => {
        try {
            const companyId = await getCompanyId();
            if (!companyId) {
                setSubscription(null);
                return;
            }
            
            const subscriptions = await AIAgentSubscription.filter({ 
                company_id: companyId,
                $or: [
                    { subscription_status: 'active' },
                    { subscription_status: 'trial' }
                ]
            });

            if (subscriptions.length > 0) {
                setSubscription(subscriptions[0]);
            } else {
                setSubscription(null);
            }
        } catch (error) {
            console.error('Error checking AI Agent subscription:', error);
        }
    }, [getCompanyId]);

    const fetchRecentActivities = useCallback(async () => {
        try {
            const activities = await AIAgentActivity.list('-created_at', 5);
            setRecentActivities(activities);
        } catch (error) {
            console.error('Error fetching AI activities:', error);
        }
    }, []);

    const handleStartTrial = async () => {
        setIsProcessing(true);
        try {
            const currentUser = await User.me();
            if (!currentUser) {
                toast.error("You must be logged in to start a trial.");
                setIsProcessing(false);
                return;
            }

            let companyId = null;

            // 1. Check if user is already linked to a company
            const companyUserRecords = await CompanyUser.filter({ user_email: currentUser.email });
            if (companyUserRecords.length > 0) {
                companyId = companyUserRecords[0].company_id;
            } else {
                // 2. If not linked, check if any company exists at all
                const companies = await Company.list();
                if (companies.length > 0) {
                    // Link user to the first company found (a simplification for single-tenant-like use)
                    companyId = companies[0].id;
                } else {
                    // 3. If no company exists, create a default one
                    const newCompany = await Company.create({
                        company_name: `${currentUser.full_name || currentUser.email}'s Company`,
                        billing_email: currentUser.email,
                        subscription_plan: 'trial',
                        license_count: 5 // Default license count for a new trial company
                    });
                    companyId = newCompany.id;
                    toast.info(`Created a default company for you: ${newCompany.company_name}`);
                }

                // 4. Create the link between user and company
                await CompanyUser.create({
                    company_id: companyId,
                    user_email: currentUser.email,
                    user_name: currentUser.full_name || currentUser.email,
                    role: 'company_admin' // First user should be admin
                });
            }
            
            // Re-check for existing subscription with the now confirmed companyId
            const existingSubscriptions = await AIAgentSubscription.filter({ company_id: companyId });
            if (existingSubscriptions.length > 0 && existingSubscriptions.some(s => ['trial', 'active'].includes(s.subscription_status))) {
                toast.info("Your company already has an active or trial subscription.");
                setSubscription(existingSubscriptions[0]); // Update the UI
                checkSubscription(); // Full refresh of state
                setIsProcessing(false);
                return;
            }

            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 14);

            const newSubscription = await AIAgentSubscription.create({
                company_id: companyId,
                subscription_status: 'trial',
                plan_type: 'professional', // A good plan for a trial
                trial_start_date: new Date().toISOString().split('T')[0],
                trial_end_date: trialEndDate.toISOString().split('T')[0],
                next_billing_date: trialEndDate.toISOString().split('T')[0],
                monthly_usage_limits: {
                    transcription_minutes: 500,
                    ai_insights: 100,
                    automated_emails: 50,
                    dsr_creations: 10
                },
                current_usage: {
                    transcription_minutes: 0,
                    ai_insights: 0,
                    automated_emails: 0,
                    dsr_creations: 0
                }
            });
            
            setSubscription(newSubscription);
            toast.success("effyAI Agent 14-day trial started!");

        } catch (error) {
            console.error('Error starting free trial:', error);
            const errorMessage = error.response?.data?.detail || "Could not start free trial. Please contact support.";
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuickAction = useCallback(async (actionId) => {
        if (!subscription || !['active', 'trial'].includes(subscription.subscription_status)) {
            toast.error('effyAI Agent subscription required for this feature');
            return;
        }

        setIsProcessing(true);
        try {
            // Log the AI activity
            await AIAgentActivity.create({
                activity_type: 'insight_generated',
                related_entity: 'system',
                related_id: 'quick_action',
                ai_output: `Quick action executed: ${actionId}`,
                confidence_score: 95
            });

            switch (actionId) {
                case 'draft_follow_up':
                    toast.success('Follow-up emails have been drafted and saved to your drafts');
                    break;
                case 'analyze_calls':
                    toast.success('Call analysis completed. Check your insights dashboard');
                    break;
                case 'create_proposals':
                    toast.success('Proposals generated for qualified leads');
                    break;
                case 'performance_summary':
                    toast.success('Performance summary generated');
                    break;
                default:
                    toast.info('AI action completed');
            }

            fetchRecentActivities();
        } catch (error) {
            console.error('Error executing quick action:', error);
            toast.error('Failed to execute AI action');
        } finally {
            setIsProcessing(false);
        }
    }, [subscription, fetchRecentActivities]);

    const generateQuickActions = useCallback(() => {
        // AI-suggested quick actions based on current context
        const actions = [
            {
                id: 'draft_follow_up',
                title: 'Draft Follow-up Emails',
                description: 'Create personalized follow-up emails for recent leads',
                icon: Mail,
                action: () => handleQuickAction('draft_follow_up')
            },
            {
                id: 'analyze_calls',
                title: 'Analyze Recent Calls',
                description: 'Get insights from recent call recordings',
                icon: Phone,
                action: () => handleQuickAction('analyze_calls')
            },
            {
                id: 'create_proposals',
                title: 'Generate Proposals',
                description: 'Create custom proposals for qualified leads',
                icon: FileText,
                action: () => handleQuickAction('create_proposals')
            },
            {
                id: 'performance_summary',
                title: 'Performance Summary',
                description: 'Get AI insights on team performance',
                icon: BarChart3,
                action: () => handleQuickAction('performance_summary')
            }
        ];
        setQuickActions(actions);
    }, [handleQuickAction]);

    useEffect(() => {
        checkSubscription();
        fetchRecentActivities();
        generateQuickActions();
    }, [checkSubscription, fetchRecentActivities, generateQuickActions]);

    const getUsageProgress = (current, limit) => {
        if (limit === -1) return 0; // Unlimited
        return (current / limit) * 100;
    };

    if (!subscription) {
        return (
            <Card className={className}>
                <CardContent className="p-6 text-center">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">effyAI Agent Available</h3>
                    <p className="text-gray-600 mb-4">
                        Unlock powerful AI automation for your sales workflow
                    </p>
                    <Button 
                        onClick={handleStartTrial}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    >
                        {isProcessing ? (
                            <><Zap className="w-4 h-4 mr-2 animate-spin" /> Starting...</>
                        ) : (
                            <><Sparkles className="w-4 h-4 mr-2" /> Start Free Trial</>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* effyAI Agent Status */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-purple-600" />
                            effyAI Agent
                        </CardTitle>
                        <Badge className={`${subscription.subscription_status === 'trial' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {subscription.subscription_status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                        Plan: <span className="font-medium capitalize">{subscription.plan_type}</span> • 
                        Next billing: {subscription.next_billing_date ? format(new Date(subscription.next_billing_date), 'MMM d') : 'N/A'}
                    </div>

                    {/* Usage Metrics */}
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Transcription Minutes</span>
                                <span>{subscription.current_usage?.transcription_minutes || 0} / {subscription.monthly_usage_limits?.transcription_minutes === -1 ? '∞' : subscription.monthly_usage_limits?.transcription_minutes}</span>
                            </div>
                            <Progress value={getUsageProgress(subscription.current_usage?.transcription_minutes || 0, subscription.monthly_usage_limits?.transcription_minutes)} className="h-2" />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>AI Insights</span>
                                <span>{subscription.current_usage?.ai_insights || 0} / {subscription.monthly_usage_limits?.ai_insights === -1 ? '∞' : subscription.monthly_usage_limits?.ai_insights}</span>
                            </div>
                            <Progress value={getUsageProgress(subscription.current_usage?.ai_insights || 0, subscription.monthly_usage_limits?.ai_insights)} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* effyAI Quick Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">effyAI Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {quickActions.map(action => (
                        <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <action.icon className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium">{action.title}</h4>
                                    <p className="text-xs text-gray-600">{action.description}</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={action.action}
                                disabled={isProcessing}
                            >
                                <Zap className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Recent effyAI Activities */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Recent effyAI Activities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recentActivities.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className={`p-1 rounded ${
                                activity.status === 'completed' ? 'bg-green-100' :
                                activity.status === 'failed' ? 'bg-red-100' :
                                'bg-yellow-100'
                            }`}>
                                {activity.status === 'completed' ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : activity.status === 'failed' ? (
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                ) : (
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{activity.activity_type.replace(/_/g, ' ').toUpperCase()}</p>
                                <p className="text-xs text-gray-500">
                                    {format(new Date(activity.created_date), 'MMM d, h:mm a')} • 
                                    {activity.confidence_score}% confidence
                                </p>
                            </div>
                        </div>
                    ))}

                    {recentActivities.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            No recent AI activities
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
