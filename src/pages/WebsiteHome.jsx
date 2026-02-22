
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Zap, BarChart3, Users, Mic, Building, FileText, Check, Award, Bot, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

const FeatureHighlight = ({ icon, title, description }) => (
    <div className="text-center p-6">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50">
            {icon}
        </div>
        <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm">{description}</p>
    </div>
);

const CompetitiveCard = ({ icon, title, description }) => (
     <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600">{description}</p>
    </div>
);

export default function WebsiteHome() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="py-20 md:py-32 bg-slate-50/50">
                <div className="container mx-auto px-6 text-center">
                     <Badge variant="outline" className="mb-4 py-1 px-3 rounded-full border-blue-200 bg-blue-50 text-blue-700 font-medium">
                        The AI Co-Pilot for High-Performing Sales Teams
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
                        The AI Co-Pilot for <br/> <span className="text-blue-600">High-Performing</span> Sales Teams
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-600">
                        effySales Pro combines AI-powered coaching, roleplay, and deal intelligence into a single platform designed to help your team close more deals, faster.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20" asChild>
                            <Link to={createPageUrl('BookDemo')}>Request a Demo</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link to={createPageUrl('Register')}>Start Free Trial</Link>
                        </Button>
                    </div>
                </div>
            </section>
            
            {/* Competitive Differentiator Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">A Complete Platform, Not a Point Solution.</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-slate-600">
                           While tools like Hyperbound or Outdoo focus on one piece of the sales process, effySales Pro provides an integrated suite to master the entire journey.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <CompetitiveCard 
                            icon={<Bot className="w-6 h-6"/>}
                            title="Automate Top-of-Funnel"
                            description="Let our AI SDRs handle cold calling and appointment setting, freeing up your reps to focus on high-intent conversations."
                        />
                         <CompetitiveCard 
                            icon={<Award className="w-6 h-6"/>}
                            title="Create Elite Reps"
                            description="Use AI-powered roleplay and real-time call coaching to turn your sales team into a squad of consistent top-performers."
                        />
                         <CompetitiveCard 
                            icon={<ShieldCheck className="w-6 h-6"/>}
                            title="Close Deals Faster"
                            description="Use collaborative Digital Sales Rooms to guide buyers, build consensus, and cut your sales cycle time significantly."
                        />
                    </div>
                </div>
            </section>


            {/* Features Overview */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">One Platform, Endless Capabilities</h2>
                        <p className="text-slate-600 mt-2">Everything you need to boost sales productivity and performance.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureHighlight
                            icon={<Mic className="w-6 h-6" />}
                            title="AI Sales Roleplay"
                            description="Practice any sales scenario against life-like AI prospects to sharpen skills."
                        />
                        <FeatureHighlight
                            icon={<BrainCircuit className="w-6 h-6" />}
                            title="AI Coaching Hub"
                            description="Get instant, objective feedback on calls and pitches to improve performance."
                        />
                        <FeatureHighlight
                            icon={<Building className="w-6 h-6" />}
                            title="Digital Sales Rooms"
                            description="Create collaborative deal rooms that impress buyers and accelerate sales cycles."
                        />
                        <FeatureHighlight
                            icon={<Users className="w-6 h-6" />}
                            title="effyLeads"
                            description="Generate qualified leads with AI and manage your pipeline effortlessly."
                        />
                    </div>
                     <div className="mt-12 text-center">
                        <Button variant="link" asChild>
                            <Link to={createPageUrl('WebsiteProducts')}>See All Products →</Link>
                        </Button>
                    </div>
                </div>
            </section>
            
             {/* Final CTA */}
            <section className="py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Ready to Future-Proof Your Sales?</h2>
                    <p className="mt-4 max-w-xl mx-auto text-slate-600">
                        Join top-performing sales teams who trust effySales Pro to not just automate tasks, but to build an unbeatable sales force.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-8 py-6 text-base" asChild>
                            <Link to={createPageUrl('BookDemo')}>Book a Demo</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
