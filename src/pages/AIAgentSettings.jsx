
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from '@/components/ui/progress';
import { 
    BrainCircuit, 
    Bot, 
    Sparkles, 
    Activity,
    Zap,
    Settings,
    Mail,
    Phone,
    FileText,
    BarChart3,
    Shield,
    Clock
} from 'lucide-react';
import { AIAgentSubscription } from '@/api/entities';
import { AIAgentActivity } from '@/api/entities';
import { toast } from 'sonner';

export default function AIAgentSettings() {
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState({
        auto_transcribe_calls: true,
        auto_create_tasks: true,
        smart_email_timing: true,
        engagement_alerts: true
    });

    const fetchSubscription = useCallback(async () => {
        setIsLoading(true);
        try {
            const subscriptions = await AIAgentSubscription.list();
            if (subscriptions.length > 0) {
                setSubscription(subscriptions[0]);
                // Ensure default settings are applied if subscription settings are null/undefined
                setSettings(subscriptions[0].settings || {
                    auto_transcribe_calls: true,
                    auto_create_tasks: true,
                    smart_email_timing: true,
                    engagement_alerts: true
                });
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]); // Now fetchSubscription is a stable reference

    const updateSettings = async (newSettings) => {
        try {
            if (subscription) {
                await AIAgentSubscription.update(subscription.id, {
                    settings: { ...settings, ...newSettings }
                });
                setSettings(prev => ({ ...prev, ...newSettings }));
                toast.success('Settings updated successfully');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update settings');
        }
    };

    const startFreeTrial = async () => {
        try {
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 14); // 14-day free trial

            const newSubscription = await AIAgentSubscription.create({
                company_id: 'current_company', // This would be dynamic in real implementation
                subscription_status: 'trial',
                plan_type: 'professional',
                trial_start_date: new Date().toISOString().split('T')[0],
                trial_end_date: trialEnd.toISOString().split('T')[0],
                features_enabled: ['call_transcription', 'email_assistance', 'basic_insights', 'task_automation'],
                settings: settings
            });

            setSubscription(newSubscription);
            toast.success('Free trial started! Welcome to effyAI Agent');
        } catch (error) {
            console.error('Error starting trial:', error);
            toast.error('Failed to start trial');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Bot className="w-12 h-12 animate-pulse text-purple-600 mx-auto mb-4" />
                    <p className="text-slate-500">Loading effyAI Agent...</p>
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <BrainCircuit className="w-7 h-7 text-white" />
                        </div>
                        effyAI Agent
                    </h1>
                    <p className="text-slate-600 mb-8">Your intelligent sales automation assistant</p>
                </div>

                {/* Feature Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="text-center p-6">
                        <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Call Analysis</h3>
                        <p className="text-sm text-slate-600">Automatic transcription and insights from all your calls</p>
                    </Card>
                    <Card className="text-center p-6">
                        <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Smart Emails</h3>
                        <p className="text-sm text-slate-600">AI-drafted personalized follow-up emails</p>
                    </Card>
                    <Card className="text-center p-6">
                        <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Document Intelligence</h3>
                        <p className="text-sm text-slate-600">Track engagement and get actionable insights</p>
                    </Card>
                    <Card className="text-center p-6">
                        <Bot className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Task Automation</h3>
                        <p className="text-sm text-slate-600">Automatically create follow-up tasks and reminders</p>
                    </Card>
                    <Card className="text-center p-6">
                        <BarChart3 className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Performance Insights</h3>
                        <p className="text-sm text-slate-600">AI-powered analytics and recommendations</p>
                    </Card>
                    <Card className="text-center p-6">
                        <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">CRM Integration</h3>
                        <p className="text-sm text-slate-600">Seamlessly sync all AI insights with your CRM</p>
                    </Card>
                </div>

                {/* CTA */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="p-8 text-center">
                        <BrainCircuit className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to supercharge your sales?</h2>
                        <p className="text-slate-600 mb-6">Start your 14-day free trial and experience the power of AI automation</p>
                        <Button 
                            onClick={startFreeTrial}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Start Free Trial
                        </Button>
                        <p className="text-xs text-slate-500 mt-2">No credit card required • Cancel anytime</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <BrainCircuit className="w-6 h-6 text-white" />
                        </div>
                        effyAI Agent Settings
                    </h1>
                    <p className="text-slate-600 mt-1">Configure your AI assistant preferences</p>
                </div>
                <Badge className={`px-4 py-2 ${
                    subscription.subscription_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : subscription.subscription_status === 'trial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {subscription.subscription_status.toUpperCase()}
                    {subscription.subscription_status === 'trial' && subscription.trial_end_date && 
                        ` • ${Math.ceil((new Date(subscription.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24))} days left`
                    }
                </Badge>
            </div>

            <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="settings">AI Settings</TabsTrigger>
                    <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Automation Preferences</CardTitle>
                            <CardDescription>
                                Configure how effyAI Agent assists with your daily tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Auto-transcribe Calls</Label>
                                    <p className="text-sm text-slate-500">Automatically transcribe and analyze call recordings</p>
                                </div>
                                <Switch
                                    checked={settings.auto_transcribe_calls}
                                    onCheckedChange={(checked) => updateSettings({ auto_transcribe_calls: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Smart Email Timing</Label>
                                    <p className="text-sm text-slate-500">AI suggests optimal times to send follow-up emails</p>
                                </div>
                                <Switch
                                    checked={settings.smart_email_timing}
                                    onCheckedChange={(checked) => updateSettings({ smart_email_timing: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Auto-create Tasks</Label>
                                    <p className="text-sm text-slate-500">Automatically create follow-up tasks from AI insights</p>
                                </div>
                                <Switch
                                    checked={settings.auto_create_tasks}
                                    onCheckedChange={(checked) => updateSettings({ auto_create_tasks: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Engagement Alerts</Label>
                                    <p className="text-sm text-slate-500">Get notified when prospects interact with your content</p>
                                </div>
                                <Switch
                                    checked={settings.engagement_alerts}
                                    onCheckedChange={(checked) => updateSettings({ engagement_alerts: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Statistics</CardTitle>
                            <CardDescription>
                                Track your AI usage against plan limits
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Call Transcription Minutes</Label>
                                        <span className="text-sm text-slate-500">
                                            {subscription.current_usage?.transcription_minutes || 0} / {subscription.monthly_usage_limits?.transcription_minutes || 500}
                                        </span>
                                    </div>
                                    <Progress value={((subscription.current_usage?.transcription_minutes || 0) / (subscription.monthly_usage_limits?.transcription_minutes || 500)) * 100} />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>AI Insights Generated</Label>
                                        <span className="text-sm text-slate-500">
                                            {subscription.current_usage?.ai_insights || 0} / {subscription.monthly_usage_limits?.ai_insights || 100}
                                        </span>
                                    </div>
                                    <Progress value={((subscription.current_usage?.ai_insights || 0) / (subscription.monthly_usage_limits?.ai_insights || 100)) * 100} />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Automated Emails</Label>
                                        <span className="text-sm text-slate-500">
                                            {subscription.current_usage?.automated_emails || 0} / {subscription.monthly_usage_limits?.automated_emails || 50}
                                        </span>
                                    </div>
                                    <Progress value={((subscription.current_usage?.automated_emails || 0) / (subscription.monthly_usage_limits?.automated_emails || 50)) * 100} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent AI Activity</CardTitle>
                            <CardDescription>
                                Latest actions performed by effyAI Agent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-slate-500">
                                <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>No recent activity</p>
                                <p className="text-sm">AI activity will appear here as it processes your data</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
