import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle, TrendingUp, Target, Brain, Users, Eye, Zap } from 'lucide-react';

export default function UnifiedSalesAnalytics() {
    const features = [
        {
            icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
            title: "Full-Funnel Visibility",
            description: "Track performance from first touch to final signature in one unified dashboard"
        },
        {
            icon: <Brain className="w-8 h-8 text-purple-600" />,
            title: "AI-Powered Insights",
            description: "Get actionable recommendations to optimize your sales process and increase win rates"
        },
        {
            icon: <Target className="w-8 h-8 text-green-600" />,
            title: "Predictive Forecasting",
            description: "Forecast revenue with 95% accuracy using advanced machine learning algorithms"
        },
        {
            icon: <Users className="w-8 h-8 text-orange-600" />,
            title: "Rep Performance Analytics",
            description: "Identify top performers and scale their winning behaviors across your team"
        }
    ];

    const benefits = [
        "Stop guessing what drives revenue - get the data your competitors wish they had",
        "Increase forecast accuracy from 60% to 95%",
        "Identify bottlenecks and optimize your sales process",
        "Scale winning behaviors from top performers"
    ];

    const metrics = [
        { 
            title: "Pipeline Velocity", 
            description: "See how fast deals move through each stage",
            icon: <Zap className="w-6 h-6 text-yellow-600" />
        },
        { 
            title: "Win Rate Analysis", 
            description: "Understand what separates won deals from lost ones",
            icon: <Target className="w-6 h-6 text-green-600" />
        },
        { 
            title: "Activity Correlation", 
            description: "Connect sales activities to actual revenue outcomes",
            icon: <TrendingUp className="w-6 h-6 text-blue-600" />
        },
        { 
            title: "Competitive Intelligence", 
            description: "Track win/loss rates against specific competitors",
            icon: <Eye className="w-6 h-6 text-purple-600" />
        }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge variant="outline" className="mb-4 py-1 px-3 text-blue-700 border-blue-200">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Unified Sales Analytics
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
                            Stop Guessing What Drives Revenue - <span className="text-blue-600">Get the Data</span> Your Competitors Wish They Had
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                            Get a 360-degree view of your entire sales process, from first touch to final signature. 
                            Connect activity to outcomes and make decisions based on data, not guesswork.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                                See Your Analytics
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                                View Demo Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Statement */}
            <section className="py-16 bg-red-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-slate-900 mb-8">
                            Your Sales Tools Exist in Silos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg border-l-4 border-red-500">
                                <h3 className="font-bold text-slate-900 mb-2">Scattered Data</h3>
                                <p className="text-slate-600 text-sm">CRM, email, calls, documents - all disconnected</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border-l-4 border-red-500">
                                <h3 className="font-bold text-slate-900 mb-2">Poor Forecasting</h3>
                                <p className="text-slate-600 text-sm">Guessing at revenue with 60% accuracy or less</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border-l-4 border-red-500">
                                <h3 className="font-bold text-slate-900 mb-2">No Clear ROI</h3>
                                <p className="text-slate-600 text-sm">Can't connect sales activities to actual outcomes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Metrics */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                The Metrics That Actually Matter
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                While other tools give you vanity metrics, we show you what drives revenue.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {metrics.map((metric, index) => (
                                <div key={index} className="flex items-start gap-4 p-6 bg-slate-50 rounded-lg">
                                    <div className="bg-white p-3 rounded-lg">
                                        {metric.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{metric.title}</h3>
                                        <p className="text-slate-600">{metric.description}</p>
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
                                Connect the Dots Across Your Entire Sales Motion
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                While other tools exist in silos, we connect activity to outcomes across your entire revenue process.
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
                            Make Data-Driven Decisions, Not Guesses
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
                            Ready to Make Revenue Predictable?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join sales leaders who've transformed guesswork into data-driven revenue growth.
                        </p>
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                            Get Your Analytics Dashboard
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}