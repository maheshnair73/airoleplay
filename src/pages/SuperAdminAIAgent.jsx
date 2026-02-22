
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    Bot, 
    Building2, 
    Settings, 
    TrendingUp, 
    Users, 
    DollarSign,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    BarChart3,
    Zap,
    Clock,
    MessageSquare
} from 'lucide-react';
import { AIAgentSubscription } from '@/api/entities';
import { AIAgentActivity } from '@/api/entities';
import { Company } from '@/api/entities';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SuperAdminAIAgent() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null); // This state isn't used in the provided code, but keeping it
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [newSubscription, setNewSubscription] = useState({
        company_id: '',
        plan_type: 'basic',
        subscription_status: 'trial',
        monthly_price: 99
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [subscriptionsData, companiesData, activitiesData] = await Promise.all([
                AIAgentSubscription.list('-created_date'),
                Company.list('-created_date'),
                AIAgentActivity.list('-created_date', 50)
            ]);

            setSubscriptions(subscriptionsData);
            setCompanies(companiesData);
            setActivities(activitiesData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load effyAI Agent data');
        } finally {
            setIsLoading(false);
        }
    };

    const createSubscription = async () => {
        try {
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

            const subscriptionData = {
                ...newSubscription,
                trial_start_date: new Date().toISOString().split('T')[0],
                trial_end_date: trialEndDate.toISOString().split('T')[0],
                features_enabled: getPlanFeatures(newSubscription.plan_type),
                monthly_usage_limits: getPlanLimits(newSubscription.plan_type)
            };

            await AIAgentSubscription.create(subscriptionData);
            toast.success('effyAI Agent subscription created successfully!');
            setShowCreateModal(false);
            setNewSubscription({ company_id: '', plan_type: 'basic', subscription_status: 'trial', monthly_price: 99 });
            fetchData();
        } catch (error) {
            console.error('Error creating subscription:', error);
            toast.error('Failed to create subscription');
        }
    };

    const updateSubscriptionStatus = async (subscriptionId, status) => {
        try {
            await AIAgentSubscription.update(subscriptionId, { subscription_status: status });
            toast.success(`Subscription ${status} successfully!`);
            fetchData();
        } catch (error) {
            console.error('Error updating subscription:', error);
            toast.error('Failed to update subscription');
        }
    };

    const getPlanFeatures = (planType) => {
        const features = {
            basic: ['call_transcription', 'email_assistance', 'basic_insights'],
            professional: ['call_transcription', 'email_assistance', 'basic_insights', 'dsr_automation', 'document_analysis', 'task_automation'],
            enterprise: ['call_transcription', 'email_assistance', 'basic_insights', 'dsr_automation', 'document_analysis', 'task_automation', 'advanced_analytics', 'custom_integrations']
        };
        return features[planType] || features.basic;
    };

    const getPlanLimits = (planType) => {
        const limits = {
            basic: { transcription_minutes: 500, ai_insights: 100, automated_emails: 50, dsr_creations: 10 },
            professional: { transcription_minutes: 2000, ai_insights: 500, automated_emails: 200, dsr_creations: 50 },
            enterprise: { transcription_minutes: -1, ai_insights: -1, automated_emails: -1, dsr_creations: -1 } // Unlimited
        };
        return limits[planType] || limits.basic;
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            trial: 'bg-blue-100 text-blue-800',
            expired: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.inactive;
    };

    const getPlanBadge = (plan) => {
        const colors = {
            basic: 'bg-blue-100 text-blue-800',
            professional: 'bg-purple-100 text-purple-800',
            enterprise: 'bg-orange-100 text-orange-800'
        };
        return colors[plan] || colors.basic;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        effyAI Agent Management
                    </h1>
                    <p className="text-slate-600 mt-2">Manage effyAI Agent subscriptions and settings across all companies</p>
                </div>
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
                    Super Admin Only
                </Badge>
            </div>

            <Tabs defaultValue="subscriptions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="subscriptions">Company Subscriptions</TabsTrigger>
                    <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
                    <TabsTrigger value="settings">Global Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="subscriptions" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>effyAI Agent Subscriptions</CardTitle>
                            <CardDescription>
                                Manage which companies have access to effyAI Agent features
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Manage Subscriptions</h2>
                                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Bot className="w-4 h-4 mr-2" />
                                            Create Subscription
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create effyAI Agent Subscription</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Company</Label>
                                                <Select value={newSubscription.company_id} onValueChange={(value) => setNewSubscription({...newSubscription, company_id: value})}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select company" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {companies.map(company => (
                                                            <SelectItem key={company.id} value={company.id}>
                                                                {company.company_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Plan Type</Label>
                                                <Select value={newSubscription.plan_type} onValueChange={(value) => setNewSubscription({...newSubscription, plan_type: value})}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="basic">Basic - $99/month</SelectItem>
                                                        <SelectItem value="professional">Professional - $299/month</SelectItem>
                                                        <SelectItem value="enterprise">Enterprise - $599/month</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Monthly Price</Label>
                                                <Input 
                                                    type="number" 
                                                    value={newSubscription.monthly_price}
                                                    onChange={(e) => setNewSubscription({...newSubscription, monthly_price: parseInt(e.target.value)})}
                                                />
                                            </div>
                                            <Button onClick={createSubscription} className="w-full">
                                                Create Subscription
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid gap-6">
                                {subscriptions.map(subscription => {
                                    const company = companies.find(c => c.id === subscription.company_id);
                                    return (
                                        <Card key={subscription.id}>
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{company?.company_name || 'Unknown Company'}</h3>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge className={getStatusBadge(subscription.subscription_status)}>
                                                                {subscription.subscription_status}
                                                            </Badge>
                                                            <Badge className={getPlanBadge(subscription.plan_type)}>
                                                                {subscription.plan_type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            ${subscription.monthly_price}/month • {subscription.features_enabled?.length || 0} features enabled
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {subscription.subscription_status !== 'active' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateSubscriptionStatus(subscription.id, 'active')}
                                                            >
                                                                Activate
                                                            </Button>
                                                        )}
                                                        {subscription.subscription_status === 'active' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => updateSubscriptionStatus(subscription.id, 'inactive')}
                                                            >
                                                                Deactivate
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-600">Transcription Minutes</p>
                                                        <p className="text-lg font-semibold">
                                                            {subscription.current_usage?.transcription_minutes || 0} / {subscription.monthly_usage_limits?.transcription_minutes === -1 ? '∞' : subscription.monthly_usage_limits?.transcription_minutes}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-600">AI Insights</p>
                                                        <p className="text-lg font-semibold">
                                                            {subscription.current_usage?.ai_insights || 0} / {subscription.monthly_usage_limits?.ai_insights === -1 ? '∞' : subscription.monthly_usage_limits?.ai_insights}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-600">Automated Emails</p>
                                                        <p className="text-lg font-semibold">
                                                            {subscription.current_usage?.automated_emails || 0} / {subscription.monthly_usage_limits?.automated_emails === -1 ? '∞' : subscription.monthly_usage_limits?.automated_emails}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-600">DSR Creations</p>
                                                        <p className="text-lg font-semibold">
                                                            {subscription.current_usage?.dsr_creations || 0} / {subscription.monthly_usage_limits?.dsr_creations === -1 ? '∞' : subscription.monthly_usage_limits?.dsr_creations}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>effyAI Agent Usage Analytics</CardTitle>
                            <CardDescription>
                                Monitor usage patterns and performance across all companies
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <Building2 className="h-8 w-8 text-blue-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                                                <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {subscriptions.filter(s => s.subscription_status === 'active').length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <Clock className="h-8 w-8 text-blue-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Trial Subscriptions</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {subscriptions.filter(s => s.subscription_status === 'trial').length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <DollarSign className="h-8 w-8 text-green-600" />
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ${subscriptions.reduce((total, sub) => total + (sub.monthly_price || 0), 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <h3 className="text-xl font-bold mb-4">Recent effyAI Agent Activities</h3>
                            <div className="space-y-4">
                                {activities.map(activity => (
                                    <div key={activity.id} className="flex items-start justify-between p-4 border rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Bot className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{activity.activity_type.replace(/_/g, ' ').toUpperCase()}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Entity: {activity.related_entity} • ID: {activity.related_id}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {format(new Date(activity.created_date), 'MMM d, yyyy h:mm a')} • 
                                                    Processed in {activity.processing_time_ms}ms • 
                                                    Confidence: {activity.confidence_score}%
                                                </p>
                                                {activity.ai_output && (
                                                    <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                                                        {activity.ai_output.length > 200 
                                                            ? `${activity.ai_output.substring(0, 200)}...` 
                                                            : activity.ai_output
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={
                                                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                activity.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }>
                                                {activity.status}
                                            </Badge>
                                            {activity.user_feedback && (
                                                <Badge variant="outline">
                                                    {activity.user_feedback}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global effyAI Agent Settings</CardTitle>
                            <CardDescription>
                                Configure system-wide effyAI Agent parameters and limits
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Enable effyAI Agent for New Companies</Label>
                                    <p className="text-sm text-gray-600">Automatically enable effyAI Agent trial for new company signups</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Global Rate Limiting</Label>
                                    <p className="text-sm text-gray-600">Enforce system-wide rate limits for effyAI processing</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Activity Logging</Label>
                                    <p className="text-sm text-gray-600">Log all effyAI Agent activities for monitoring and analytics</p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="space-y-3">
                                <Label>Default Trial Duration (Days)</Label>
                                <Input type="number" defaultValue="14" className="w-32" />
                            </div>

                            <div className="space-y-3">
                                <Label>System Maintenance Mode</Label>
                                <p className="text-sm text-gray-600">Temporarily disable effyAI Agent for all companies</p>
                                <Button variant="outline" size="sm">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Enable Maintenance Mode
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
