import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, CheckCircle, BarChart3, Target, Brain, Users, TrendingUp, Shield } from 'lucide-react';

export default function CustomAIScorecards() {
    const frameworks = [
        { name: "MEDDIC", description: "Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion" },
        { name: "BANT", description: "Budget, Authority, Need, Timeline qualification framework" },
        { name: "SPIN", description: "Situation, Problem, Implication, Need-payoff questioning methodology" },
        { name: "Custom", description: "Build your own framework based on your unique sales process" }
    ];

    const benefits = [
        "Standardize evaluations across your entire sales team",
        "Get objective feedback aligned with your sales methodology",
        "Identify top performers and scale their best practices",
        "Reduce coaching time by 70% with automated insights"
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge variant="outline" className="mb-4 py-1 px-3 text-purple-700 border-purple-200">
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                            Custom AI Scorecards
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
                            Stop Losing Deals to <span className="text-purple-600">Inconsistent Coaching</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                            Our AI analyzes calls and scores reps against YOUR specific sales methodology—MEDDIC, BANT, SPIN, or your own custom framework. 
                            Get coaching insights that actually move the needle.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4">
                                Start Free Trial
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                                See Scorecard Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Supported Frameworks */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                Works With Your Sales Methodology
                            </h2>
                            <p className="text-slate-600">
                                Choose from proven frameworks or build your own custom scorecard
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {frameworks.map((framework, index) => (
                                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-slate-900">{framework.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600">{framework.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Benefits */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
                            The Results Speak for Themselves
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-purple-50">
                                    <CheckCircle className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                                    <span className="text-slate-700 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-purple-600">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Standardize Your Sales Excellence?
                        </h2>
                        <p className="text-xl text-purple-100 mb-8">
                            Stop guessing what makes your top reps successful. Get data-driven insights based on your methodology.
                        </p>
                        <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4">
                            Build Your Custom Scorecard
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}