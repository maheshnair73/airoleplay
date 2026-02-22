
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Sparkles, Wand2, Bot, Play, Building, User, Lightbulb, TrendingUp, RefreshCw, BrainCircuit, MessageSquare, GraduationCap, Copy } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Lead } from '@/api/entities';
import { Badge } from '@/components/ui/badge'; // Make sure Badge is imported

export default function AILeadInsights({ lead, showCoachingTools = false }) {
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [generatedPitch, setGeneratedPitch] = useState('');
    const [isPitchLoading, setIsPitchLoading] = useState(false);
    // Removed pitchFeedback and isRefining state as per outline

    const navigate = useNavigate();

    useEffect(() => {
        if (lead) {
            // Check if insights are already saved in the lead object
            if (lead.ai_generated_intel && Object.keys(lead.ai_generated_intel).length > 0) {
                setInsights(lead.ai_generated_intel);
                setIsLoading(false);
            } else {
                // If no insights, allow user to generate, don't auto-generate on initial load if not present
                // Set isLoading to false initially to show the "Generate AI Insights" button
                setIsLoading(false); 
            }
        }
    }, [lead]);

    const generateInsights = async () => {
        setIsLoading(true);
        try {
            const prompt = `Analyze this sales lead and provide intelligence:

Lead Details:
- Name: ${lead.contact_name}
- Title: ${lead.contact_title}
- Company: ${lead.company_name}
- Industry: ${lead.industry || 'Unknown'}
- Status: ${lead.status}
- Notes: ${lead.notes || 'None'}

Provide insights in this JSON format:
{
    "personality_profile": {
        "communication_style": "Direct/Analytical/Relationship-focused/etc",
        "decision_making": "Quick/Methodical/Consensus-driven/etc",
        "likely_priorities": ["priority1", "priority2", "priority3"]
    },
    "company_intel": {
        "business_challenges": ["challenge1", "challenge2"],
        "growth_stage": "Startup/Growth/Mature/Enterprise",
        "tech_stack": "Modern/Legacy/Mixed/Unknown",
        "decision_timeline": "Fast/Standard/Slow"
    },
    "conversation_approach": {
        "opening_style": "Professional greeting suggestion",
        "key_questions": ["question1", "question2", "question3"],
        "potential_objections": ["objection1", "objection2"]
    },
    "industry_trends": ["trend1", "trend2", "trend3"]
}`;

            const response = await InvokeLLM({ 
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        personality_profile: {
                            type: "object",
                            properties: {
                                communication_style: { type: "string" },
                                decision_making: { type: "string" },
                                likely_priorities: { type: "array", items: { type: "string" } }
                            }
                        },
                        company_intel: {
                            type: "object",
                            properties: {
                                business_challenges: { type: "array", items: { type: "string" } },
                                growth_stage: { type: "string" },
                                tech_stack: { type: "string" },
                                decision_timeline: { type: "string" }
                            }
                        },
                        conversation_approach: {
                            type: "object",
                            properties: {
                                opening_style: { type: "string" },
                                key_questions: { type: "array", items: { type: "string" } },
                                potential_objections: { type: "array", items: { type: "string" } }
                            }
                        },
                        industry_trends: {
                            type: "array",
                            items: { "type": "string" }
                        }
                    }
                }
            });

            // Save the generated insights back to the lead entity
            await Lead.update(lead.id, { ai_generated_intel: response });

            setInsights(response);
        } catch (error) {
            console.error('Error generating insights:', error);
            toast.error('Failed to generate AI insights');
        }
        setIsLoading(false);
    };

    const generateOpeningPitch = async () => {
        setIsPitchLoading(true);
        try {
            const prompt = `Based on the following lead information, generate a concise, compelling 30-second opening pitch.
            Lead Name: ${lead.contact_name}
            Title: ${lead.contact_title}
            Company: ${lead.company_name}
            Industry: ${lead.industry}
            Company Intel: ${JSON.stringify(insights.company_intel)}
            Potential Objections: ${insights.conversation_approach.potential_objections.join(', ')}`;
            
            const response = await InvokeLLM({ prompt });
            setGeneratedPitch(response);
        } catch (error) {
            toast.error("Failed to generate opening pitch.");
        }
        setIsPitchLoading(false);
    };

    // Removed refinePitch function as per outline

    const startRoleplay = () => {
        const roleplayState = {
            botPersonality: {
                name: lead.contact_name,
                title: lead.contact_title,
                company: lead.company_name,
                ...insights.personality_profile,
                potential_objections: insights.conversation_approach.potential_objections,
            }
        };
        navigate(createPageUrl('AIRoleplay'), { state: roleplayState });
    };

    return (
        <div className="space-y-6">
            {/* Generate Insights Button */}
            {!insights && (
                <Card>
                    <CardContent className="p-6 text-center">
                        <Button 
                            onClick={generateInsights}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating AI Insights...
                                </>
                            ) : (
                                <>
                                    <BrainCircuit className="w-5 h-5 mr-2" />
                                    Generate AI Insights
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {insights && (
                <>
                    {/* Refresh Button */}
                    <div className="flex justify-end">
                        <Button 
                            onClick={() => {
                                setInsights(null); // Clear insights to show generate button again if needed
                                generateInsights();
                            }}
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Refresh Insights
                        </Button>
                    </div>

                    {/* Personality Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Personality Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-semibold text-slate-700">Communication Style</p>
                                    <p className="text-slate-600">{insights.personality_profile?.communication_style}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700">Decision Making</p>
                                    <p className="text-slate-600">{insights.personality_profile?.decision_making}</p>
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700 mb-2">Likely Priorities</p>
                                <div className="flex flex-wrap gap-2">
                                    {insights.personality_profile?.likely_priorities?.map((priority, index) => (
                                        <Badge key={index} variant="secondary">{priority}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company Intel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="w-5 h-5 text-green-600" />
                                Company Intel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="font-semibold text-slate-700">Growth Stage</p>
                                    <p className="text-slate-600">{insights.company_intel?.growth_stage}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700">Tech Stack</p>
                                    <p className="text-slate-600">{insights.company_intel?.tech_stack}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700">Decision Timeline</p>
                                    <p className="text-slate-600">{insights.company_intel?.decision_timeline}</p>
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700 mb-2">Business Challenges</p>
                                <div className="flex flex-wrap gap-2">
                                    {insights.company_intel?.business_challenges?.map((challenge, index) => (
                                        <Badge key={index} variant="outline" className="border-red-200 text-red-700">{challenge}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conversation Approach */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-purple-600" />
                                Conversation Approach
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-semibold text-slate-700 mb-2">Opening Style</p>
                                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg italic">
                                    "{insights.conversation_approach?.opening_style}"
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700 mb-2">Key Questions to Ask</p>
                                <ul className="space-y-1">
                                    {insights.conversation_approach?.key_questions?.map((question, index) => (
                                        <li key={index} className="text-slate-600 flex items-start gap-2">
                                            <span className="text-blue-600 mt-1">•</span>
                                            {question}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700 mb-2">Potential Objections</p>
                                <div className="flex flex-wrap gap-2">
                                    {insights.conversation_approach?.potential_objections?.map((objection, index) => (
                                        <Badge key={index} variant="outline" className="border-orange-200 text-orange-700">{objection}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Industry Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Industry Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {insights.industry_trends?.map((trend, index) => (
                                    <div key={index} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                                        <span className="text-indigo-600 mt-1">📈</span>
                                        <span className="text-slate-600">{trend}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Coaching Tools - Restored Card Format */}
                    {showCoachingTools && (
                        <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="w-6 h-6 text-purple-600" />
                                    AI Coaching
                                </CardTitle>
                                <p className="text-slate-600">
                                    Practice and perfect your approach with AI-powered coaching tools
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Roleplay Section */}
                                <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <Bot className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">Practice with AI Roleplay</h3>
                                            <p className="text-sm text-slate-600">Practice your pitch with an AI that acts like {lead.contact_name}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                        <p className="text-sm font-medium text-slate-700 mb-2">AI will roleplay as:</p>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p><strong>Personality:</strong> {insights.personality_profile?.communication_style}</p>
                                            <p><strong>Likely Concern:</strong> {insights.conversation_approach?.potential_objections?.[0]}</p>
                                            <p><strong>Decision Style:</strong> {insights.personality_profile?.decision_making}</p>
                                        </div>
                                    </div>
                                    <Button onClick={startRoleplay} className="w-full bg-purple-600 hover:bg-purple-700">
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Roleplay Session
                                    </Button>
                                </div>

                                {/* AI Pitch Assistant */}
                                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Wand2 className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">AI Pitch Assistant</h3>
                                            <p className="text-sm text-slate-600">Generate and refine your opening pitch</p>
                                        </div>
                                    </div>
                                    {!generatedPitch ? (
                                        <Button 
                                            onClick={generateOpeningPitch} 
                                            disabled={isPitchLoading}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isPitchLoading ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-4 h-4 mr-2" />
                                            )}
                                            Generate Opening Pitch
                                        </Button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-slate-50 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-slate-700 mb-2">Generated Pitch:</p>
                                                <p className="text-slate-600 italic">"{generatedPitch}"</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(generatedPitch);
                                                        toast.success("Pitch copied to clipboard!");
                                                    }}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy Pitch
                                                </Button>
                                                <Button 
                                                    onClick={generateOpeningPitch} // Directly regenerate
                                                    variant="outline"
                                                    className="flex-1"
                                                    disabled={isPitchLoading}
                                                >
                                                    {isPitchLoading ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="w-4 h-4 mr-2" />
                                                    )}
                                                    Regenerate
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
