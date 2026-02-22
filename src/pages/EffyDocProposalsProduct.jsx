import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Eye, Clock, BarChart3, Zap, Shield, Bell } from 'lucide-react';

export default function EffyDocProposalsProduct() {
    const features = [
        {
            icon: <Eye className="w-8 h-8 text-blue-600" />,
            title: "Real-Time View Notifications",
            description: "Get instant alerts when prospects open and view your proposals"
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-green-600" />,
            title: "Page-by-Page Analytics",
            description: "See exactly what sections prospects focus on and for how long"
        },
        {
            icon: <Shield className="w-8 h-8 text-purple-600" />,
            title: "Secure E-Signatures",
            description: "Close deals faster with built-in secure digital signature capabilities"
        },
        {
            icon: <Bell className="w-8 h-8 text-orange-600" />,
            title: "Smart Follow-Up Alerts",
            description: "Know the perfect moment to follow up based on engagement data"
        }
    ];

    const benefits = [
        "Know exactly when prospects view your proposals",
        "Increase close rates by 35% with perfect follow-up timing", 
        "Replace static PDFs with interactive, trackable documents",
        "Accelerate deal closure with integrated e-signatures"
    ];

    const painPoints = [
        {
            problem: "Send proposal into black hole",
            solution: "Get instant view notifications and detailed analytics"
        },
        {
            problem: "Don't know if they're interested",
            solution: "See exactly what content they engage with most"
        },
        {
            problem: "Guessing when to follow up",
            solution: "Smart alerts tell you the perfect moment to reach out"
        },
        {
            problem: "Lengthy signature process",
            solution: "Built-in e-signatures close deals in minutes, not days"
        }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge variant="outline" className="mb-4 py-1 px-3 text-orange-700 border-orange-200">
                            <FileText className="w-4 h-4 mr-2" />
                            effyDoc Proposals
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
                            Know Exactly When Prospects <span className="text-orange-600">View Your Proposals</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                            Create, send, and track stunning, interactive proposals that close deals. 
                            Get notified the instant your prospect opens the document and see exactly what they focus on.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-4">
                                Create Your First Proposal
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                                View Sample Proposal
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem/Solution Grid */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                Stop Sending Proposals Into the Void
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                Move beyond static PDFs. Get the intel you need to follow up at the perfect moment with the perfect message.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {painPoints.map((item, index) => (
                                <div key={index} className="bg-slate-50 p-6 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-red-100 p-2 rounded-lg">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 mb-2">Problem: {item.problem}</h3>
                                            <div className="flex items-start gap-4 mt-3">
                                                <div className="bg-green-100 p-2 rounded-lg">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                </div>
                                                <p className="text-slate-700 font-medium">Solution: {item.solution}</p>
                                            </div>
                                        </div>
                                    </div>
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
                                Smart Documents That Help You Close
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                Every effyDoc proposal is packed with intelligence to give you the competitive edge.
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

            {/* Benefits */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
                            The Competitive Advantage You've Been Missing
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-orange-50">
                                    <CheckCircle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                                    <span className="text-slate-700 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-orange-600">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Know When Your Prospects Are Engaged?
                        </h2>
                        <p className="text-xl text-orange-100 mb-8">
                            Stop guessing about proposal performance. Get the insights that help you close more deals, faster.
                        </p>
                        <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-4">
                            Start Tracking Proposals
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}