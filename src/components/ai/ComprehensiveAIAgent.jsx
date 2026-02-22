import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
    Bot, 
    Brain,
    Zap,
    CheckCircle,
    Clock,
    TrendingUp,
    FileText,
    Mail,
    Phone,
    Calendar,
    Users,
    BarChart,
    Lightbulb,
    Target,
    AlertTriangle,
    MessageSquare
} from 'lucide-react';
import { AIAgentSubscription } from '@/api/entities';
import { AIAgentActivity } from '@/api/entities';
import { Lead } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ComprehensiveAIAgent({ lead, onLeadUpdate, trigger = null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('insights');
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiInsights, setAiInsights] = useState([]);
    const [aiTasks, setAiTasks] = useState([]);
    const [agentStatus, setAgentStatus] = useState('ready'); // ready, analyzing, suggesting
    const [subscription, setSubscription] = useState(null);

    const checkSubscription = useCallback(async () => {
        try {
            const subscriptions = await AIAgentSubscription.filter({ subscription_status: 'active' });
            if (subscriptions.length > 0) {
                setSubscription(subscriptions[0]);
            }
        } catch (error) {
            console.error('Error checking AI Agent subscription:', error);
        }
    }, []);

    const loadAIData = useCallback(async () => {
        if (!lead?.id) return;
        
        try {
            const activities = await AIAgentActivity.filter({ 
                related_entity: 'lead', 
                related_id: lead.id 
            }, '-created_date', 10);
            
            setAiInsights(activities);
        } catch (error) {
            console.error('Error loading AI data:', error);
        }
    }, [lead?.id]);

    const analyzeLeadComprehensively = useCallback(async () => {
        if (!subscription || subscription.subscription_status !== 'active') {
            toast.error('effyAI Agent subscription required for this feature');
            return;
        }

        setIsProcessing(true);
        setAgentStatus('analyzing');
        
        try {
            const analysisPrompt = `
            Analyze this lead comprehensively and provide actionable insights:
            
            Lead: ${lead?.contact_name} at ${lead?.company_name}
            Title: ${lead?.contact_title}
            Industry: ${lead?.industry}
            Company Size: ${lead?.company_size}
            Status: ${lead?.status}
            Last Contact: ${lead?.last_contact_date || 'Never'}
            Deal Value: ${lead?.estimated_deal_value ? `$${lead.estimated_deal_value}` : 'Not set'}
            Pain Points: ${lead?.pain_points?.join(', ') || 'Not identified'}
            Notes: ${lead?.notes || 'No notes'}
            
            Provide:
            1. Lead qualification assessment
            2. Best next action with reasoning
            3. Recommended follow-up timeline
            4. Potential objections and how to handle them
            5. Personalized email/call script suggestions
            6. Risk factors and opportunities
            `;

            const analysis = await InvokeLLM({
                prompt: analysisPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        qualification_score: { type: "number" },
                        qualification_reasoning: { type: "string" },
                        next_best_action: { type: "string" },
                        action_reasoning: { type: "string" },
                        follow_up_timeline: { type: "string" },
                        email_script: { type: "string" },
                        call_script: { type: "string" },
                        risk_factors: { type: "array", items: { type: "string" } },
                        opportunities: { type: "array", items: { type: "string" } },
                        urgency_level: { type: "string" }
                    }
                }
            });

            // Save AI activity
            await AIAgentActivity.create({
                activity_type: 'insight_generated',
                related_entity: 'lead',
                related_id: lead.id,
                ai_output: JSON.stringify(analysis),
                confidence_score: 95,
                status: 'completed'
            });

            toast.success('effyAI analysis completed!');
            loadAIData();
        } catch (error) {
            console.error('Error analyzing lead:', error);
            toast.error('Failed to analyze lead');
        } finally {
            setIsProcessing(false);
            setAgentStatus('ready');
        }
    }, [lead, subscription, loadAIData]);

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    useEffect(() => {
        if (trigger === 'open') {
            setIsOpen(true);
            loadAIData();
        }
    }, [trigger, loadAIData]);

    useEffect(() => {
        if (isOpen && lead) {
            loadAIData();
        }
    }, [isOpen, lead, loadAIData]);

    return (
        <>
            {/* AI Agent Trigger */}
            <Button
                onClick={() => {
                    setIsOpen(true);
                    analyzeLeadComprehensively();
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
                <Bot className="w-4 h-4 mr-2" />
                effyAI Agent
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bot className="w-6 h-6 text-purple-600" />
                            effyAI Agent - {lead?.contact_name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* AI Status Banner */}
                        {agentStatus !== 'ready' && (
                            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Bot className="w-6 h-6 text-purple-600 animate-pulse" />
                                        <div>
                                            <h4 className="font-semibold text-purple-800">
                                                {agentStatus === 'analyzing' ? 'effyAI Analyzing Lead...' : 'effyAI Generating Insights...'}
                                            </h4>
                                            <p className="text-sm text-purple-700">
                                                {agentStatus === 'analyzing' 
                                                    ? 'Analyzing lead data and generating comprehensive insights...'
                                                    : 'Creating personalized recommendations and action items...'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                                <TabsTrigger value="scripts">Scripts & Content</TabsTrigger>
                                <TabsTrigger value="activity">AI Activity</TabsTrigger>
                            </TabsList>

                            <TabsContent value="insights" className="space-y-4">
                                <div className="grid gap-4">
                                    {aiInsights.map((insight, index) => (
                                        <Card key={index}>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Brain className="w-5 h-5 text-purple-600" />
                                                    {insight.activity_type.replace(/_/g, ' ').toUpperCase()}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-gray-600">
                                                    {insight.ai_output ? (
                                                        <pre className="whitespace-pre-wrap">
                                                            {typeof insight.ai_output === 'string' 
                                                                ? insight.ai_output 
                                                                : JSON.stringify(insight.ai_output, null, 2)
                                                            }
                                                        </pre>
                                                    ) : (
                                                        'No insights available'
                                                    )}
                                                </div>
                                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                                    <span>Confidence: {insight.confidence_score}%</span>
                                                    <span>{format(new Date(insight.created_date), 'MMM d, h:mm a')}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {aiInsights.length === 0 && (
                                        <Card>
                                            <CardContent className="p-6 text-center">
                                                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600">No AI insights generated yet</p>
                                                <p className="text-sm text-gray-500 mt-1">Click "Analyze Lead" to get AI-powered insights</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="scripts" className="space-y-4">
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">AI Scripts & Content coming soon</p>
                                        <p className="text-sm text-gray-500 mt-1">AI-generated call scripts, email templates, and follow-up content</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="activity" className="space-y-4">
                                <div className="space-y-3">
                                    {aiInsights.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Bot className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{activity.activity_type.replace(/_/g, ' ').toUpperCase()}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Status: {activity.status} • Confidence: {activity.confidence_score}%
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800">
                                                {activity.status}
                                            </Badge>
                                        </div>
                                    ))}

                                    {aiInsights.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>No AI activity recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}