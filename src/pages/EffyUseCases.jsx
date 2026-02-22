import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    Bot, Phone, GraduationCap, BarChart3, Mail, Command, Sparkles, ArrowRight, BrainCircuit 
} from 'lucide-react';

const useCases = [
    {
        icon: Bot,
        title: "AI Website Assistant",
        description: "Engage visitors 24/7, answer questions, qualify leads, and book meetings directly from your website.",
        features: ["Lead Capture", "Instant Answers", "Meeting Scheduling"],
        link: "AISalesAgentSettings",
        linkLabel: "Configure Your Agent"
    },
    {
        icon: Phone,
        title: "Autonomous Sales Agent",
        description: "Put Effy to work! It can make outbound calls, send follow-up emails, and update your CRM, acting as a tireless sales development rep.",
        features: ["Outbound Calling", "Email Automation", "CRM Updates"],
        link: "AISalesAgent",
        linkLabel: "Manage AI Tasks"
    },
    {
        icon: GraduationCap,
        title: "AI Sales Coach",
        description: "Practice your pitch, handle tough objections, and get instant feedback. Effy acts as a realistic prospect in roleplay scenarios.",
        features: ["Objection Handling", "Pitch Practice", "Real-time Feedback"],
        link: "AIRoleplay",
        linkLabel: "Start Roleplaying"
    },
    {
        icon: BarChart3,
        title: "Sales Strategist",
        description: "Effy analyzes your leads, deals, and calls to uncover insights. Get recommendations on which leads to prioritize and strategies to close faster.",
        features: ["Lead Scoring", "Deal Insights", "Performance Analytics"],
        link: "Analytics",
        linkLabel: "View Analytics"
    },
    {
        icon: Mail,
        title: "Content Co-pilot",
        description: "Never stare at a blank page again. Effy helps you draft compelling emails, personalize proposals, and create follow-up sequences in seconds.",
        features: ["Email Drafting", "Proposal Personalization", "Content Ideas"],
        link: "EmailHub",
        linkLabel: "Go to Email Hub"
    },
    {
        icon: Command,
        title: "Your Personal Assistant",
        description: "Use the AI Command Bar to have Effy summarize notes, find lead information, or prepare you for your next meeting, without leaving your page.",
        features: ["Quick Summaries", "Data Retrieval", "Meeting Prep"],
        link: null, // Command bar is global
        linkLabel: "Use Cmd/Ctrl + K"
    }
];

const UseCaseCard = ({ useCase }) => (
    <Card className="flex flex-col bg-white/60 backdrop-blur-sm border-slate-200/80 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardHeader className="flex flex-row items-start gap-4 pb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white">
                <useCase.icon className="w-6 h-6" />
            </div>
            <div>
                <CardTitle className="text-xl text-slate-800">{useCase.title}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
            <div>
                <p className="text-slate-600 mb-4">{useCase.description}</p>
                <div className="space-y-2 mb-6">
                    {useCase.features.map(feature => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="text-slate-700">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
            {useCase.link ? (
                <Link to={createPageUrl(useCase.link)}>
                    <Button className="w-full bg-slate-800 hover:bg-slate-900">
                        {useCase.linkLabel}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            ) : (
                <Button className="w-full bg-slate-800 cursor-default" disabled>
                    {useCase.linkLabel}
                </Button>
            )}
        </CardContent>
    </Card>
);

export default function EffyUseCases() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mb-4">
                        <BrainCircuit className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900">Meet Effy, Your AI Co-pilot</h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
                        Effy is more than just a chatbot. It's a powerful, integrated AI assistant designed to enhance every stage of your sales workflow. Here's how you can leverage Effy to close more deals, faster.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {useCases.map(useCase => (
                        <UseCaseCard key={useCase.title} useCase={useCase} />
                    ))}
                </div>
            </div>
        </div>
    );
}