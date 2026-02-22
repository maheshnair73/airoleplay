import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Play, Settings, Sparkles, BrainCircuit } from 'lucide-react';

const agentTasks = [
    {
        title: "AI Sales Development Rep (SDR)",
        description: "Deploy an AI agent to research prospects, generate personalized outreach, and book meetings on your calendar.",
        icon: Sparkles,
        link: "AISalesSDR",
        status: "Active"
    },
    {
        title: "Autonomous AI Voice Dialer",
        description: "Launch AI-powered voice campaigns to qualify leads and gather information at scale. View results and transcripts.",
        icon: Bot,
        link: "VoiceAIDialer",
        status: "Active"
    },
    {
        title: "Configure AI Agent Personas",
        description: "Customize the name, voice, and behavior of your AI sales agents to perfectly match your brand.",
        icon: Settings,
        link: "AIAgentSettings",
        status: "Ready to Configure"
    }
];

export default function AIAgentHub() {
    return (
        <div className="p-8 bg-slate-50 min-h-full">
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-12">
                    <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full mb-4">
                        <BrainCircuit className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900">AI Agent Hub</h1>
                    <p className="text-xl text-slate-600 mt-4 max-w-2xl mx-auto">
                        Your command center for deploying and managing autonomous AI sales agents to automate your workflow.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {agentTasks.map((task) => (
                        <Card key={task.title} className="flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 p-3 rounded-lg">
                                        <task.icon className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <CardTitle className="text-2xl">{task.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>{task.description}</CardDescription>
                            </CardContent>
                            <div className="p-6 pt-0">
                                <Link to={createPageUrl(task.link)}>
                                    <Button className="w-full bg-slate-800 hover:bg-slate-900">
                                        <Play className="w-4 h-4 mr-2" />
                                        Go to {task.icon === Settings ? 'Settings' : 'Workspace'}
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}