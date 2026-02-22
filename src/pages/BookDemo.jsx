import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Users, Calendar, Zap, BarChart3, Target, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DemoFeature = ({ icon, title, description }) => (
    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-slate-800 mb-1">{title}</h4>
            <p className="text-sm text-slate-600">{description}</p>
        </div>
    </div>
);

const TestimonialCard = ({ quote, author, role, company }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
        <p className="text-slate-700 mb-4 italic">"{quote}"</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {author.charAt(0)}
            </div>
            <div>
                <p className="font-semibold text-slate-800">{author}</p>
                <p className="text-sm text-slate-600">{role} • {company}</p>
            </div>
        </div>
    </div>
);

export default function BookDemo() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        teamSize: '',
        challenges: '',
        demoType: 'guided_tour',
        preferredTime: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // In a real implementation, you would send this to your backend
            // For now, we'll simulate the process and show success
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            toast.success("Demo request submitted! We'll contact you within 24 hours.");
            
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                company: '',
                jobTitle: '',
                teamSize: '',
                challenges: '',
                demoType: 'guided_tour',
                preferredTime: ''
            });
            
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Header */}
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 py-1 px-3 rounded-full border-blue-200 bg-blue-50 text-blue-700 font-medium">
                            See effySales Pro in Action
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                            Book Your Personal Demo
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            See how effySales Pro can transform your sales team's performance in just 30 minutes. 
                            Get a personalized walkthrough tailored to your specific needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        
                        {/* Demo Request Form */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-slate-800">
                                    Schedule Your Demo
                                </CardTitle>
                                <p className="text-slate-600">
                                    Fill out the form below and we'll get back to you within 24 hours to schedule your personalized demo.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName">First Name*</Label>
                                            <Input
                                                id="firstName"
                                                value={formData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName">Last Name*</Label>
                                            <Input
                                                id="lastName"
                                                value={formData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Work Email*</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="company">Company*</Label>
                                            <Input
                                                id="company"
                                                value={formData.company}
                                                onChange={(e) => handleInputChange('company', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="jobTitle">Job Title*</Label>
                                            <Input
                                                id="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Team Size*</Label>
                                            <Select value={formData.teamSize} onValueChange={(value) => handleInputChange('teamSize', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select team size" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1-5">1-5 people</SelectItem>
                                                    <SelectItem value="6-15">6-15 people</SelectItem>
                                                    <SelectItem value="16-50">16-50 people</SelectItem>
                                                    <SelectItem value="51-100">51-100 people</SelectItem>
                                                    <SelectItem value="100+">100+ people</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Demo Focus*</Label>
                                        <Select value={formData.demoType} onValueChange={(value) => handleInputChange('demoType', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="What would you like to see?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="guided_tour">Complete Platform Tour</SelectItem>
                                                <SelectItem value="ai_coaching">AI Coaching & Roleplay</SelectItem>
                                                <SelectItem value="crm_features">CRM & Lead Management</SelectItem>
                                                <SelectItem value="analytics">Analytics & KPIs</SelectItem>
                                                <SelectItem value="gamification">Gamification Features</SelectItem>
                                                <SelectItem value="custom">Custom Demo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Preferred Time</Label>
                                        <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="When works best for you?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                                                <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                                                <SelectItem value="flexible">I'm flexible</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="challenges">What are your biggest sales challenges?</Label>
                                        <Textarea
                                            id="challenges"
                                            placeholder="Tell us about your current challenges so we can tailor the demo..."
                                            value={formData.challenges}
                                            onChange={(e) => handleInputChange('challenges', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting Request...
                                            </>
                                        ) : (
                                            'Book My Demo'
                                        )}
                                    </Button>

                                    <p className="text-xs text-slate-500 text-center">
                                        No commitment required • 30-minute session • Personalized for your needs
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Demo Information */}
                        <div className="space-y-8">
                            
                            {/* What You'll See */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        What You'll See in Your Demo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <DemoFeature
                                        icon={<Zap className="w-5 h-5 text-blue-600" />}
                                        title="AI Sales Roleplay in Action"
                                        description="Watch reps practice with AI prospects and get instant feedback"
                                    />
                                    <DemoFeature
                                        icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
                                        title="Real-Time Call Analytics"
                                        description="See how AI analyzes live calls and provides actionable insights"
                                    />
                                    <DemoFeature
                                        icon={<Target className="w-5 h-5 text-blue-600" />}
                                        title="CRM & Pipeline Management"
                                        description="Experience streamlined lead management and proposal creation"
                                    />
                                    <DemoFeature
                                        icon={<Award className="w-5 h-5 text-blue-600" />}
                                        title="Gamification & KPIs"
                                        description="Discover how to motivate teams with points, achievements, and leaderboards"
                                    />
                                </CardContent>
                            </Card>

                            {/* Demo Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-blue-500" />
                                        Demo Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">Duration</span>
                                            <span className="font-semibold">30 minutes</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">Format</span>
                                            <span className="font-semibold">Screen share + Q&A</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">Response time</span>
                                            <span className="font-semibold">Within 24 hours</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">Follow-up</span>
                                            <span className="font-semibold">Free trial access</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Testimonial */}
                            <TestimonialCard
                                quote="The demo was incredible. In just 30 minutes, I could see exactly how effySales Pro would solve our coaching bottleneck and scale our top performers' methods across the entire team."
                                author="Russell M."
                                role="VP of Sales"
                                company="UAE IT Solutions Firm"
                            />

                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="text-center mt-16">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">
                            Join 500+ Sales Teams Already Using effySales Pro
                        </h2>
                        <div className="flex justify-center gap-8 text-sm text-slate-600">
                            <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                40% faster deal closure
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                60% improvement in call quality
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                90% of teams see results in 30 days
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}