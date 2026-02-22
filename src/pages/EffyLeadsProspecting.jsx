import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Target, Brain, Zap, TrendingUp, Search, Phone } from 'lucide-react';

export default function EffyLeadsProspecting() {
    const features = [
        {
            icon: <Brain className="w-8 h-8 text-purple-600" />,
            title: "AI Lead Qualification",
            description: "Our AI screens and qualifies leads before they reach your reps"
        },
        {
            icon: <Target className="w-8 h-8 text-green-600" />,
            title: "ICP Matching",
            description: "Find prospects that match your exact ideal customer profile"
        },
        {
            icon: <Phone className="w-8 h-8 text-blue-600" />,
            title: "Automated Outreach",
            description: "Multi-channel campaigns with personalized messaging at scale"
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
            title: "Pipeline Intelligence",
            description: "Get insights on which prospects are most likely to convert"
        }
    ];

    const stats = [
        { number: "3x", label: "More Qualified Leads", description: "vs manual prospecting" },
        { number: "60%", label: "Higher Response Rate", description: "with AI-powered personalization" },
        { number: "80%", label: "Less Time Prospecting", description: "focus on selling, not searching" },
        { number: "2.5x", label: "Faster Pipeline Growth", description: "accelerated lead generation" }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge variant="outline" className="mb-4 py-1 px-3 text-green-700 border-green-200">
                            <Users className="w-4 h-4 mr-2" />
                            effyLeads AI Prospecting
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
                            Fill Your Pipeline While <span className="text-green-600">Competitors Manually Hunt</span> for Leads
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                            Our AI-powered engine identifies and qualifies high-intent leads that match your ideal customer profile, 
                            then hands them off to your reps for the final touch. Stop chasing dead ends.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
                                Start Generating Leads
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                                See AI in Action
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                The Numbers Don't Lie
                            </h2>
                            <p className="text-slate-600">
                                See why top sales teams are switching to AI-powered prospecting
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center p-6 rounded-lg bg-green-50">
                                    <div className="text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                                    <div className="font-semibold text-slate-900 mb-1">{stat.label}</div>
                                    <div className="text-sm text-slate-600">{stat.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                Prospecting on Autopilot
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                We combine automated outreach with deep qualification, so your team talks to buyers who are ready to buy.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feature, index) => (
                                <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            {feature.icon}
                                            <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem/Solution */}
            <section className="py-16 bg-red-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                Stop Wasting Time on Cold Prospects
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-lg border-l-4 border-red-500">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">The Old Way</h3>
                                <ul className="space-y-2 text-slate-600">
                                    <li>• Reps spend 60% of time prospecting</li>
                                    <li>• Low-quality leads waste sales cycles</li>
                                    <li>• Manual research takes hours per prospect</li>
                                    <li>• Generic outreach gets ignored</li>
                                </ul>
                            </div>
                            <div className="bg-white p-8 rounded-lg border-l-4 border-green-500">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">The effyLeads Way</h3>
                                <ul className="space-y-2 text-slate-600">
                                    <li>• AI handles prospecting and qualification</li>
                                    <li>• Only high-intent leads reach your reps</li>
                                    <li>• Instant research and contact enrichment</li>
                                    <li>• Personalized outreach at scale</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-green-600">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to 3x Your Qualified Leads?
                        </h2>
                        <p className="text-xl text-green-100 mb-8">
                            Let AI do the heavy lifting while your reps focus on what they do best - closing deals.
                        </p>
                        <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4">
                            Start Your Lead Engine
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}