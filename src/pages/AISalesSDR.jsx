
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Linkedin, Loader2, Clipboard, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { InvokeLLM } from '@/api/integrations';
import ReactMarkdown from 'react-markdown';

export default function AISalesSDR() {
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [aboutContext, setAboutContext] = useState('');
    const [experienceContext, setExperienceContext] = useState('');
    const [postsContext, setPostsContext] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleGenerate = async () => {
        if (aboutContext.trim().length < 10 && experienceContext.trim().length < 10 && postsContext.trim().length < 10) {
            toast.error('Please provide more detailed context (at least 10 characters) in one of the fields.');
            return;
        }

        setIsLoading(true);
        setResult(null);
        
        const prompt = `
            You are an expert Sales Development Representative (SDR) for "effySales Pro", an AI-powered sales co-pilot platform.
            Your task is to conduct deep research on a prospect using the provided, manually gathered information and draft a hyper-personalized outreach email.

            **Prospect's LinkedIn Profile:** ${linkedinUrl || 'Not provided'}

            **CONTEXT PROVIDED BY SDR:**
            ---
            **1. About Section:**
            ${aboutContext || 'Not provided.'}
            ---
            **2. Experience Details (Current Role):**
            ${experienceContext || 'Not provided.'}
            ---
            **3. Recent Posts:**
            ${postsContext || 'Not provided.'}
            ---

            **Instructions:**
            1.  Synthesize insights from ALL provided context fields (About, Experience, Posts). Prioritize the most recent and relevant information, especially from the 'Recent Posts' section, as the primary conversation hook.
            2.  Identify 2-3 key, actionable insights that connect the prospect's current role, challenges, and recent activities.
            3.  Draft a compelling, concise, and personalized cold outreach email. The email must:
                - Have a subject line that grabs attention, likely referencing a recent post or key responsibility.
                - Reference a specific, recent insight (e.g., from a post) to show you've done genuine research.
                - Connect their potential needs (based on their role and posts) to a key benefit of effySales Pro.
                - End with a clear, low-friction call-to-action.
            4.  Return the output in the specified JSON format.
            
            **CRITICAL FALLBACK: If the provided context is too vague to generate meaningful insights, you MUST return a JSON object where the 'insights' field contains a friendly error message asking for more specific details, and leave the other fields as empty strings.**
        `;

        const json_schema = {
            type: 'object',
            properties: {
                insights: {
                    type: 'string',
                    description: 'A markdown-formatted string listing the key insights discovered from the profile.'
                },
                email_subject: {
                    type: 'string',
                    description: 'The personalized subject line for the email.'
                },
                email_body: {
                    type: 'string',
                    description: 'The full, personalized body of the email.'
                }
            },
            required: ['insights', 'email_subject', 'email_body']
        };

        try {
            const response = await InvokeLLM({
                prompt: prompt,
                response_json_schema: json_schema
            });

            if (response && response.insights && response.insights.toLowerCase().includes('more specific details')) {
                toast.error("AI Request: " + response.insights);
                setResult(null);
            } else {
                setResult(response);
            }
        } catch (error) {
            console.error('Error generating AI prospecting email:', error);
            toast.error('Failed to generate insights. The AI model may be temporarily unavailable.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="p-6 bg-slate-50 min-h-full">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg mb-8">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                            AI Sales Prospector (SDR)
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-base">
                            Enter a prospect's LinkedIn profile and optionally add context for hyper-personalized outreach.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Side: Input Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Step 1: Gather Intel</CardTitle>
                                <CardDescription>Provide context from the prospect's LinkedIn profile sections.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="linkedinUrl" className="flex items-center gap-2 mb-2">
                                        <Linkedin className="w-4 h-4 text-blue-600" />
                                        LinkedIn Profile URL (Optional)
                                    </Label>
                                    <Input
                                        id="linkedinUrl"
                                        type="url"
                                        placeholder="https://linkedin.com/in/prospect-name"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="aboutContext" className="mb-2 block text-slate-700 font-medium">
                                        About Section (Recommended)
                                    </Label>
                                    <Textarea
                                        id="aboutContext"
                                        placeholder="Paste the prospect's 'About' section here for key achievements, interests, and professional summary."
                                        className="h-24 bg-white"
                                        value={aboutContext}
                                        onChange={(e) => setAboutContext(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="experienceContext" className="mb-2 block text-slate-700 font-medium">
                                        Experience Details (Current Role)
                                    </Label>
                                    <Textarea
                                        id="experienceContext"
                                        placeholder="Paste details about their current job description, responsibilities, or company initiatives."
                                        className="h-24 bg-white"
                                        value={experienceContext}
                                        onChange={(e) => setExperienceContext(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postsContext" className="mb-2 block text-slate-700 font-medium">
                                        Recent Posts (Highly Recommended)
                                    </Label>
                                    <Textarea
                                        id="postsContext"
                                        placeholder="Paste 1-2 recent, relevant LinkedIn posts from the prospect. This is often the best conversation starter."
                                        className="h-32 bg-white"
                                        value={postsContext}
                                        onChange={(e) => setPostsContext(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                    Analyzing & Drafting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6 mr-2" />
                                    Generate Personalised Email
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Right Side: Results */}
                    <div className="sticky top-6">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow-md border">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                <p className="text-lg font-semibold text-slate-700">Analyzing Prospect...</p>
                                <p className="text-sm text-slate-500">Crafting the perfect outreach email.</p>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-blue-500" />
                                            Key Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="prose prose-sm max-w-none text-slate-700">
                                        <ReactMarkdown>{result.insights}</ReactMarkdown>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Mail className="w-5 h-5 text-green-500" />
                                            Generated Email
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="subject" className="text-slate-700 font-medium">Subject</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Input id="subject" readOnly value={result.email_subject} className="bg-slate-50" />
                                                    <Button variant="outline" size="icon" onClick={() => handleCopy(result.email_subject)} title="Copy subject">
                                                        <Clipboard className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="body" className="text-slate-700 font-medium">Body</Label>
                                                <div className="relative mt-1">
                                                    <Textarea
                                                        id="body"
                                                        readOnly
                                                        value={result.email_body}
                                                        className="h-64 bg-slate-50 font-mono text-sm"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleCopy(result.email_body)}
                                                        className="absolute top-2 right-2"
                                                        title="Copy email body"
                                                    >
                                                        <Clipboard className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
