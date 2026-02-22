import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Sparkles, Users, Building, Target, MessageSquare, Loader2, Search, Lightbulb, TrendingUp } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { toast } from 'sonner';

export default function AILeadResearcher({ lead, onInsightsGenerated }) {
    const [companyContext, setCompanyContext] = useState('');
    const [leadContext, setLeadContext] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [insights, setInsights] = useState(null);
    const [activeTab, setActiveTab] = useState('research');

    const handleAnalyze = async () => {
        if (!companyContext.trim() && !leadContext.trim()) {
            toast.error('Please provide some context about the company or the lead to analyze.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const prompt = `You are an expert sales researcher and strategist. Analyze the following information about a sales prospect:

BASE PROSPECT INFORMATION:
- Name: ${lead.contact_name}
- Title: ${lead.contact_title || 'Not specified'}
- Company: ${lead.company_name}
- Industry: ${lead.industry || 'Not specified'}

ADDITIONAL COMPANY CONTEXT:
${companyContext || 'No additional company context provided.'}

ADDITIONAL LEAD/CONTACT CONTEXT:
${leadContext || 'No additional lead context provided.'}

Please provide a comprehensive analysis with the following sections:

1. COMPANY PROFILE ANALYSIS (based on all info)
   - Market position, recent news, and financial health.

2. CONTACT ANALYSIS (based on all info)
   - Role, responsibilities, decision-making authority (1-10), and influence.
   - Typical pain points for this role.

3. SALES STRATEGY
   - Best approach, key value props, potential objections.

4. PERSONALIZED ELEVATOR PITCH
   - A 30-second pitch tailored to this prospect.

5. ROLEPLAY SCRIPT SUGGESTIONS
   - Opening line, discovery questions, and call-to-action.

Return your analysis in valid JSON format with these exact keys: company_profile, contact_analysis, sales_strategy, elevator_pitch, roleplay_script`;

            const response = await InvokeLLM({
                prompt: prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        company_profile: { type: "string" },
                        contact_analysis: { type: "string" },
                        sales_strategy: { type: "string" },
                        elevator_pitch: { type: "string" },
                        roleplay_script: { type: "string" }
                    },
                    required: ["company_profile", "contact_analysis", "sales_strategy", "elevator_pitch", "roleplay_script"]
                }
            });

            setInsights(response);
            setActiveTab('insights');
            onInsightsGenerated?.(response);
            toast.success('AI analysis completed!');
        } catch (error) {
            console.error('Error analyzing lead:', error);
            toast.error('Failed to analyze lead. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="research">Research Input</TabsTrigger>
                <TabsTrigger value="insights" disabled={!insights}>AI Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="research" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Company Information & Context
                        </label>
                        <Textarea
                            placeholder={`e.g., 500-employee SaaS, recently raised $50M Series B, expanding internationally, struggling with sales process scalability.`}
                            value={companyContext}
                            onChange={(e) => setCompanyContext(e.target.value)}
                            className="min-h-32 resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Lead/Contact Information & Context
                        </label>
                        <Textarea
                            placeholder={`e.g., VP of Sales Ops, been with company 3 years, previously at Salesforce. Active on LinkedIn discussing sales automation.`}
                            value={leadContext}
                            onChange={(e) => setLeadContext(e.target.value)}
                            className="min-h-32 resize-none"
                        />
                    </div>
                </div>
                <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!companyContext.trim() && !leadContext.trim())}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                    {isAnalyzing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                    ) : (
                        <><Sparkles className="w-4 h-4 mr-2" />Generate AI Insights</>
                    )}
                </Button>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 pt-4">
                {insights && (
                    <div className="space-y-6">
                        {/* Company Profile */}
                        <Card className="border border-blue-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building className="w-5 h-5 text-blue-600" /> Company Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{insights.company_profile}</p>
                            </CardContent>
                        </Card>

                        {/* Contact Analysis */}
                        <Card className="border border-green-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5 text-green-600" /> Contact Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{insights.contact_analysis}</p>
                            </CardContent>
                        </Card>

                        {/* Sales Strategy */}
                        <Card className="border border-orange-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="w-5 h-5 text-orange-600" /> Sales Strategy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{insights.sales_strategy}</p>
                            </CardContent>
                        </Card>

                        {/* Elevator Pitch */}
                        <Card className="border border-purple-200">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-purple-600" /> Personalized Pitch
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(insights.elevator_pitch, 'Pitch')}>Copy</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <p className="text-sm text-slate-700 italic whitespace-pre-wrap">"{insights.elevator_pitch}"</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Roleplay Script */}
                        <Card className="border border-indigo-200">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-indigo-600" /> Roleplay Script
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(insights.roleplay_script, 'Script')}>Copy</Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{insights.roleplay_script}</p>
                            </CardContent>
                        </Card>

                        <div className="text-center pt-4 border-t">
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">✨ AI-Generated Sales Intelligence</Badge>
                        </div>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}