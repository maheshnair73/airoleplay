import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, MessageSquare, FileText, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AIAssistantChat from '@/components/ai/AIAssistantChat';

const AIToolCard = ({ icon, title, description, page }) => {
    const Icon = icon;
    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-violet-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-600 mb-4">{description}</p>
                <Link to={createPageUrl(page)}>
                    <Button variant="outline" className="w-full">
                        Go to {title}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};

export default function AIAssistant() {
    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-violet-50 min-h-full">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">AI Assistant</h1>
                <p className="text-slate-600 mt-2">Your intelligent sales co-pilot, ready to help.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chat Component - 2/3 width */}
                <div className="lg:col-span-2">
                    <Card className="h-full shadow-xl border-0">
                        <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-t-lg">
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5" />
                                Chat with Effy
                            </CardTitle>
                            <CardDescription className="text-violet-200">
                                Ask for insights, data summaries, or help with content.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <AIAssistantChat />
                        </CardContent>
                    </Card>
                </div>

                {/* AI Tools Panel - 1/3 width */}
                <div className="space-y-6">
                    <Card className="bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>AI Toolkit</CardTitle>
                            <CardDescription>Explore other AI-powered features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <AIToolCard
                                icon={MessageSquare}
                                title="AI Roleplay"
                                description="Practice your sales pitch against various AI personas."
                                page="AIRoleplay"
                            />
                             <AIToolCard
                                icon={FileText}
                                title="Document Generation"
                                description="Create proposals and documents with AI assistance."
                                page="Documents"
                            />
                             <AIToolCard
                                icon={Phone}
                                title="Call Analysis"
                                description="Review transcripts and AI insights from your calls."
                                page="CallAnalytics"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}