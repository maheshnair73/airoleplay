import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, CheckCircle, Clock, Eye, Users, BarChart3, FileText, MessageSquare } from 'lucide-react';

export default function DigitalSalesRoomsProduct() {
    const features = [
        {
            icon: <Eye className="w-8 h-8 text-blue-600" />,
            title: "Real-Time Engagement Tracking",
            description: "See exactly what content your buyers engage with and for how long"
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-green-600" />,
            title: "Collaborative Workspace",
            description: "Enable buyers to comment, ask questions, and involve stakeholders"
        },
        {
            icon: <FileText className="w-8 h-8 text-purple-600" />,
            title: "Centralized Content",
            description: "Replace email chaos with organized, branded deal rooms"
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
            title: "Buyer Intelligence",
            description: "Get insights into buyer behavior and decision-making process"
        }
    ];

    const benefits = [
        "Cut sales cycles by 30% with streamlined buyer experience",
        "Increase close rates by 25% with better buyer engagement",
        "Eliminate email chaos and lost documents",
        "Gain competitive advantage with modern buying experience"
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge variant="outline" className="mb-4 py-1 px-3 text-blue-700 border-blue-200">
                            <Building className="w-4 h-4 mr-2" />
                            Digital Sales Rooms
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
                            Cut Sales Cycles by 30% While Your <span className="text-blue-600">Competitors Wait for Email Replies</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                            Create collaborative, branded microsites for each deal. Share content, track engagement, 
                            and guide buyers through your sales process with unprecedented visibility.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                                Create Your First Room
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                                View Demo Room
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-16 bg-red-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">
                            Stop Losing Deals to Email Chaos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                            <div className="bg-white p-6 rounded-lg border-l-4 border-red-500">
                                <h3 className="font-bold text-slate-900 mb-2">Email Threads from Hell</h3>
                                <p className="text-slate-600 text-sm">Multiple stakeholders, lost attachments, and decision delays</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border-l-4 border-red-500">
                                <h3 className="font-bold text-slate-900 mb-2">No Buyer Insights</h3>
                                <p className="text-slate-600 text-sm">You're blind to who's engaged and what content matters</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border-l-4 border-red-500">
                                <h3 className="font-bold text-slate-900 mb-2">Lengthy Sales Cycles</h3>
                                <p className="text-slate-600 text-sm">Deals stall while buyers struggle to move forward internally</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                Everything You Need to Accelerate Deals
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                Transform how you sell with collaborative spaces that buyers actually want to use.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feature, index) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
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
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
                            Proven Results for Modern Sales Teams
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-blue-50">
                                    <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                                    <span className="text-slate-700 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Modernize Your Sales Process?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join sales teams who've shortened their cycles and impressed buyers with collaborative deal rooms.
                        </p>
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                            Start Building Deal Rooms
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}