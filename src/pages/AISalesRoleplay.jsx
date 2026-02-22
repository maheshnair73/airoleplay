
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioLines, CheckCircle } from 'lucide-react';

export default function AISalesRoleplay() {
    const features = [
        {
            title: "Adaptive Buyer Personas",
            description: "AI learns from your actual customer calls to create hyper-realistic roleplay scenarios."
        },
        {
            title: "Performance-Based Daily Coaching",
            description: "AI analyzes your call patterns and automatically recommends specific roleplay scenarios to address your unique weaknesses."
        },
        {
            title: "Real-Time Coaching",
            description: "Get instant feedback on your pitch, objection handling, and closing techniques during practice."
        },
        {
            title: "Custom Scenarios",
            description: "Practice industry-specific situations tailored to your sales process and product suite."
        },
        {
            title: "Performance Analytics",
            description: "Track improvement over time with detailed performance metrics and skill progression charts."
        }
    ];

    const benefits = [
        "Close 20-40% more deals with better-prepared sales reps",
        "Reduce ramp time for new hires by 60%",
        "Practice high-stakes scenarios without real-world consequences",
        "Build confidence before important client meetings",
        "Get personalized daily coaching tasks based on your actual performance gaps"
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge variant="outline" className="mb-4 py-1 px-3 text-blue-700 border-blue-200 bg-white">
                            <AudioLines className="w-4 h-4 mr-2" />
                            AI Sales Roleplay
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
                            Turn Every Rep Into a <span className="text-blue-600">Top Performer</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                            Practice against hyper-realistic AI buyer personas that create digital twins of your actual prospects. 
                            Close 20-40% more deals with reps who are always prepared for the conversations they'll actually have.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                                Start Free Trial
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-slate-300 bg-white/50">
                                Watch Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Benefits */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
                            Why Top Sales Teams Choose AI Roleplay
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-green-50/70 border border-green-100">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                                    <span className="text-slate-700 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Intelligent Coaching Section */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-slate-900 mb-4">
                                AI That Creates Digital Twins of Your Prospects
                            </h2>
                            <p className="text-slate-600 max-w-3xl mx-auto text-lg">
                                Gone are the days of generic training. Our AI analyzes your actual customer conversations to create digital twins of your prospects, then automatically serves up targeted roleplay scenarios that mirror real buying behaviors and objection patterns.
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-12 border">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                                        Your Personal AI Performance Coach
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-blue-50">
                                                <span className="text-blue-600 font-bold text-lg">1</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 text-lg">Creates Digital Twins of Prospects</p>
                                                <p className="text-slate-600">AI analyzes your customer interactions to build digital replicas of real buyers, complete with their communication style, objections, and decision-making patterns.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-green-50">
                                                <span className="text-green-600 font-bold text-lg">2</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 text-lg">Generates Targeted Scenarios</p>
                                                <p className="text-slate-600">Uses these digital twins to create hyper-realistic roleplay scenarios that specifically address your performance gaps.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-purple-50">
                                                <span className="text-purple-600 font-bold text-lg">3</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 text-lg">Delivers Daily Coaching Tasks</p>
                                                <p className="text-slate-600">Automatically suggests 5-10 minute practice sessions each morning based on your unique needs and prospect patterns.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-6 border">
                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-lg border-l-4 border-orange-400 shadow-sm">
                                            <p className="text-sm font-medium text-slate-900">Today's Coaching Recommendation</p>
                                            <p className="text-sm text-slate-600 mt-1">
                                                "You've been struggling with price objections in enterprise deals. Practice with our 'CFO Pushback' scenario."
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xs text-orange-600 font-medium">High Priority</span>
                                                <span className="text-xs text-slate-500">5 min practice</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-400 shadow-sm">
                                            <p className="text-sm font-medium text-slate-900">Secondary Focus</p>
                                            <p className="text-sm text-slate-600 mt-1">
                                                "Your discovery calls could be stronger. Try the 'Deep Needs Analysis' scenario."
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xs text-blue-600 font-medium">Medium Priority</span>
                                                <span className="text-xs text-slate-500">7 min practice</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-lg text-slate-700">
                                <strong>The result?</strong> Reps spend just 10 minutes each morning practicing exactly what they need to improve, against digital twins of their actual prospects, instead of wasting hours on generic training that doesn't move the needle.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-slate-50/70">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                Advanced Features That Set Us Apart
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                                While others use static scripts, we create living, breathing buyer personas from your actual deal data.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.slice(0,5).map((feature, index) => (
                                <Card key={index} className="bg-white shadow-md hover:shadow-xl transition-shadow border">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
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

            {/* CTA Section */}
            <section className="py-20 bg-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Transform Your Sales Team?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join thousands of sales professionals who've dramatically improved their close rates with AI roleplay.
                        </p>
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg">
                            Get Started Today
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
