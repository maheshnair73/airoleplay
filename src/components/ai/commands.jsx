
import {
    Users, Target, DollarSign, BrainCircuit, Bot, FileText, Phone, Mail, Mic, BookOpen
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Lead } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import eventBus from '@/components/utils/eventBus';
import { Button } from '@/components/ui/button'; // Added import for Button

const generatePitch = async () => {
    const path = window.location.pathname;
    const search = window.location.search;

    if (!path.includes('/LeadDetail')) {
        toast.error("You must be on a lead detail page to generate a pitch.");
        return;
    }
    
    const params = new URLSearchParams(search);
    const leadId = params.get('id');

    if (!leadId) {
        toast.error("Could not find Lead ID on this page.");
        return;
    }

    const toastId = toast.loading("Fetching lead data and generating pitch...");

    try {
        const lead = await Lead.get(leadId);
        if (!lead) {
            throw new Error("Lead data could not be retrieved.");
        }

        const prompt = `
            You are an expert sales strategist. Your goal is to craft a compelling, concise, and personalized 30-second elevator pitch.

            Your company is "SalesAI Pro", a platform that provides an end-to-end agentic AI workflow for sales teams, covering prospecting, outreach, call analysis, proposal generation, and more.

            Generate the pitch for the following prospect:
            - Name: ${lead.contact_name}
            - Title: ${lead.contact_title}
            - Company: ${lead.company_name}
            - Industry: ${lead.industry || 'their industry'}
            - Known Pain Points / Notes: ${lead.notes || 'Not specified, but assume typical challenges for their role.'}

            The pitch should be conversational, directly address a likely pain point for their role, and clearly state the value SalesAI Pro provides. End with a question to open a conversation. Keep it under 100 words.
        `;
        
        const pitch = await InvokeLLM({ prompt });
        
        toast.success("Here's your effyPitch!", {
            id: toastId,
            duration: 20000,
            description: (
                <div className="mt-2">
                    <p className="text-sm whitespace-pre-wrap mb-3">{pitch}</p>
                    <Button 
                        size="sm" 
                        onClick={() => {
                            navigator.clipboard.writeText(pitch);
                            toast.success("Pitch copied to clipboard!");
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        Copy Pitch
                    </Button>
                </div>
            ),
        });

    } catch (error) {
        toast.error("Failed to generate pitch. " + error.message, { id: toastId });
    }
};

export const commands = [
    {
        name: "Generate effyPitch",
        description: "Craft a tailored elevator pitch for the current lead.",
        icon: Mic,
        action: generatePitch
    },
    {
        name: 'New Lead',
        description: 'Create a new lead.',
        icon: Users,
        action: () => {
            const url = createPageUrl('Leads');
            window.location.href = url;
        }
    },
    {
        name: 'New Deal',
        description: 'Start a new deal from scratch.',
        icon: Target,
        action: () => {
            const url = createPageUrl('Deals');
            window.location.href = url;
        }
    },
    {
        name: 'View Documentation',
        description: 'Open the technical documentation.',
        icon: BookOpen,
        action: () => {
            const url = createPageUrl('TechnicalDocumentation');
            window.location.href = url;
        }
    },
    {
        name: 'Email Hub',
        description: 'Go to your email inbox and templates.',
        icon: Mail,
        action: () => {
            const url = createPageUrl('EmailHub');
            window.location.href = url;
        }
    },
    {
        name: 'AI Roleplay',
        description: 'Practice your sales pitch with an AI bot.',
        icon: Bot,
        action: () => {
            const url = createPageUrl('AIRoleplay');
            window.location.href = url;
        }
    }
];
