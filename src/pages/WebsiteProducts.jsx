
import React from 'react';
import { Mic, BrainCircuit, Building, Users, FileText, BarChart3, CheckCircle, Star, ClipboardCheck, AudioLines, Bot } from 'lucide-react';

const FeatureCard = ({ icon, title, description, benefits, differentiator }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 flex flex-col">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-600 mb-4 flex-grow text-sm">{description}</p>
        
        <div className="mb-4 bg-slate-50 p-3 rounded-lg">
            <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-2 mb-2"><Star className="w-3 h-3 text-yellow-500"/> The SalesAI Pro Difference</h4>
            <p className="text-xs text-slate-600">{differentiator}</p>
        </div>

        <div className="space-y-2">
            {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">{benefit}</span>
                </div>
            ))}
        </div>
    </div>
);

export default function WebsiteProducts() {
    const features = [
        {
            id: 'roleplay', // Changed to 'roleplay' as 'coaching' is too broad for just this one. If grouping, the ID should be on the section, not individual cards.
            icon: <AudioLines className="w-6 h-6" />,
            title: "Adaptive Buyer Voice Roleplay",
            description: "Go beyond generic personas. Practice against AI that learns from your real customer calls, adopting their unique voice, objections, and personality for hyper-realistic training.",
            differentiator: "Other tools use static scripts. We create living, breathing buyer personas from your actual deal data, so reps practice for the conversations they will actually have.",
            benefits: ["Master objections with true-to-life buyer resistance", "Build confidence by practicing with authentic voices", "Continuously adapt your pitch to evolving customer behavior"]
        },
        {
            id: 'scorecards', // Changed to 'scorecards' for unique ID.
            icon: <ClipboardCheck className="w-6 h-6" />,
            title: "Custom AI Scorecards",
            description: "Stop coaching with generic advice. Our AI analyzes calls and scores reps against your specific sales methodology—be it MEDDIC, BANT, SPIN, or your own custom framework.",
            differentiator: "We don't just transcribe calls; we analyze them through the lens of your sales process, delivering coaching insights that are directly relevant to how your team wins.",
            benefits: ["Standardize evaluations based on your winning framework", "Get objective feedback aligned with your sales playbook", "Benchmark performance to identify and scale best practices"]
        },
        {
            id: 'notetaker',
            icon: <Bot className="w-6 h-6" />,
            title: "effyAI Sales Buddy (AI Notetaker)",
            description: "Your AI co-pilot that attends live meetings, automatically records, transcribes, and extracts critical revenue intelligence so you can focus 100% on the conversation.",
            differentiator: "Unlike simple transcription tools, our AI Sales Buddy identifies pain points, buying signals, and next steps, feeding directly into your sales analytics and CRM.",
            benefits: [
                "Eliminate manual note-taking during calls",
                "Capture every detail: objections, commitments, action items",
                "Automatically identify revenue-critical insights",
                "Focus entirely on building rapport and listening"
            ]
        },
        {
            id: 'salesrooms',
            icon: <Building className="w-6 h-6" />,
            title: "Digital Sales Rooms",
            description: "Stop juggling email threads and attachments. Create a single, branded microsite for each deal to collaborate with buyers, share content, and gain unparalleled insight into their engagement.",
            differentiator: "This isn't just a document tracker; it's a collaborative workspace that makes buying from you easier and gives you a competitive edge.",
            benefits: ["Shorten sales cycles by centralizing communication", "Track exactly what content your buyers engage with", "Deliver a modern, impressive buying experience"]
        },
        {
            id: 'prospecting',
            icon: <Users className="w-6 h-6" />,
            title: "effyLeads AI Prospecting",
            description: "Our AI-powered engine identifies and qualifies high-intent leads that match your ideal customer profile, then hands them off to your reps for the final touch.",
            differentiator: "We combine automated outreach with deep qualification, so your team spends its time talking to buyers who are ready to talk, not chasing dead ends.",
            benefits: ["Fill your pipeline with high-quality, qualified leads", "Automate the most time-consuming part of prospecting", "Increase your meeting booking rate"]
        },
        {
            id: 'proposals',
            icon: <FileText className="w-6 h-6" />,
            title: "effyDoc Proposals",
            description: "Create, send, and track stunning, interactive proposals that close deals. Get notified the instant your prospect opens the document and see exactly what they focus on.",
            differentiator: "Move beyond static PDFs. Our smart documents give you the intel you need to follow up at the perfect moment with the perfect message.",
            benefits: ["Real-time alerts when your proposal is viewed", "Page-by-page analytics to understand buyer intent", "Secure e-signature for faster closing"]
        },
        {
            id: 'analytics',
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Unified Sales Analytics",
            description: "Get a 360-degree view of your entire sales process, from first touch to final signature. Connect activity to outcomes and make decisions based on data, not guesswork.",
            differentiator: "While other tools exist in silos, we connect the dots across training, prospecting, and deal management to show you what truly drives revenue.",
            benefits: ["Track full-funnel performance in one place", "Forecast revenue with greater accuracy", "Identify trends and optimize your sales process"]
        }
    ];

    return (
        <div className="bg-slate-50 py-12">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        A Full-Funnel Product Suite to Drive Revenue
                    </h1>
                    <p className="mt-3 max-w-3xl mx-auto text-lg text-slate-600">
                        SalesAI Pro isn't a collection of features; it's an integrated system designed to make every part of your sales motion smarter, faster, and more effective.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature) => (
                        <div key={feature.title} id={feature.id} className="scroll-mt-24">
                            <FeatureCard {...feature} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
