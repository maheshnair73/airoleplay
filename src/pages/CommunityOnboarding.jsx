
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { CommunityProfile } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, User as UserIcon, Heart, DollarSign, GraduationCap, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const contributionOptions = [
    { id: 'mentoring', label: 'Mentor Rising Talent (Pro Bono)', icon: Heart },
    { id: 'sales_consulting', label: 'Offer Paid Sales Consulting', icon: DollarSign },
    { id: 'pitch_evaluation', label: 'Shape Skills by Evaluating Pitches', icon: GraduationCap },
    { id: 'article_writing', label: 'Share Your Wisdom as a Thought Leader' },
    { id: 'content_moderation', label: 'Uphold Quality as a Content Moderator' }
];

const audienceOptions = [
    { id: 'freshers', label: 'Freshers (0-1 years)' },
    { id: '1-5_years', label: 'Mid-Level (1-5 years)' },
    { id: 'anyone', label: 'Anyone' }
];

export default function CommunityOnboarding() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        headline: '',
        bio: '',
        linkedin_profile_url: '',
        contributions: [],
        consulting_audience: [],
        mentoring_commitment: '', // New field for mentoring commitment
        expected_rate_per_hour: '',
        expected_rate_per_30_mins: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (e) {
                // If not logged in, redirect to welcome page
                navigate(createPageUrl('Welcome'));
            }
        };
        fetchUser();
    }, [navigate]);

    const handleContributionsChange = (contributionId, checked) => {
        setFormData(prev => {
            const newContributions = checked
                ? [...prev.contributions, contributionId]
                : prev.contributions.filter(c => c !== contributionId);
            return { ...prev, contributions: newContributions };
        });
    };
    
    const handleAudienceChange = (audienceId, checked) => {
        setFormData(prev => {
            const newAudience = checked
                ? [...prev.consulting_audience, audienceId]
                : prev.consulting_audience.filter(a => a !== audienceId);
            return { ...prev, consulting_audience: newAudience };
        });
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const profileData = {
                ...formData,
                user_email: user.email,
                expected_rate_per_hour: formData.expected_rate_per_hour ? Number(formData.expected_rate_per_hour) : null,
                expected_rate_per_30_mins: formData.expected_rate_per_30_mins ? Number(formData.expected_rate_per_30_mins) : null,
            };
            await CommunityProfile.create(profileData);
            toast.success('Welcome to the community! Your profile has been created.');
            navigate(createPageUrl('Dashboard'));
        } catch (error) {
            console.error('Failed to create community profile:', error);
            toast.error('Could not create your profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                       <UserIcon className="w-8 h-8 text-blue-600" />
                       <span className="text-2xl">Join the effySales Community</span>
                    </CardTitle>
                    <CardDescription>Tell us a bit about yourself and how you'd like to contribute.</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="font-semibold text-lg">How would you like to contribute?</h3>
                            <p className="text-sm text-slate-600">Select all that apply. You're joining a community dedicated to elevating the sales profession.</p>
                            <div className="space-y-4">
                                {contributionOptions.map(option => (
                                    <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Checkbox
                                            id={option.id}
                                            checked={formData.contributions.includes(option.id)}
                                            onCheckedChange={(checked) => handleContributionsChange(option.id, checked)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor={option.id} className="cursor-pointer font-medium flex items-center gap-2">
                                                {option.icon && <option.icon className="w-4 h-4 text-blue-600" />}
                                                {option.label}
                                            </Label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={nextStep} className="w-full">
                                Next <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}
                    
                    {step === 2 && (
                         <div className="space-y-6">
                            {formData.contributions.includes('mentoring') && (
                                <div className="space-y-4 p-4 border-2 border-blue-100 rounded-lg bg-blue-50/50">
                                    <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-800">
                                        <Heart className="w-5 h-5 text-blue-600" />
                                        Shape the Next Generation: Pro Bono Mentorship
                                    </h3>
                                    <p className="text-sm text-blue-700">Remember the challenges of starting out? Here's your chance to be the guide you wish you had. Pay it forward by mentoring emerging sales talent.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-2">
                                            <Label className="font-medium text-slate-800">I'm passionate about guiding:</Label>
                                            {audienceOptions.map(option => (
                                                <div key={option.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`mentoring_${option.id}`}
                                                        checked={formData.consulting_audience.includes(option.id)}
                                                        onCheckedChange={(checked) => handleAudienceChange(option.id, checked)}
                                                    />
                                                    <Label htmlFor={`mentoring_${option.id}`} className="cursor-pointer">{option.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                             <Label htmlFor="commitment" className="font-medium text-slate-800 flex items-center gap-1"><Clock className="w-4 h-4" /> Weekly Commitment</Label>
                                             <select
                                                id="commitment"
                                                value={formData.mentoring_commitment}
                                                onChange={(e) => setFormData({...formData, mentoring_commitment: e.target.value})}
                                                className="w-full p-2 border rounded-md bg-white"
                                            >
                                                <option value="" disabled>Select hours...</option>
                                                <option value="1-2 hours/week">1-2 hours/week</option>
                                                <option value="3-5 hours/week">3-5 hours/week</option>
                                                <option value="5+ hours/week">5+ hours/week</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.contributions.includes('sales_consulting') && (
                                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        Monetize Your Expertise: Paid Consulting
                                    </h3>
                                    <p className="text-sm text-slate-600">Set your rates for specialized, one-on-one consulting sessions. A 15-minute introductory call will always be free to build rapport.</p>
                                    
                                    {/* Audience selection for paid consulting if not also mentoring */}
                                    {!formData.contributions.includes('mentoring') && (
                                      <div className="space-y-2">
                                           <Label>Who is your ideal paid client?</Label>
                                           {audienceOptions.map(option => (
                                              <div key={option.id} className="flex items-center space-x-2">
                                                  <Checkbox
                                                      id={`consulting_${option.id}`}
                                                      checked={formData.consulting_audience.includes(option.id)}
                                                      onCheckedChange={(checked) => handleAudienceChange(option.id, checked)}
                                                  />
                                                  <Label htmlFor={`consulting_${option.id}`} className="cursor-pointer">{option.label}</Label>
                                              </div>
                                          ))}
                                      </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="rate_30_mins">Rate for 30 minutes (USD)</Label>
                                            <Input 
                                                id="rate_30_mins"
                                                type="number" 
                                                placeholder="e.g., 50"
                                                value={formData.expected_rate_per_30_mins}
                                                onChange={e => setFormData({...formData, expected_rate_per_30_mins: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="rate_hourly">Rate per hour (USD)</Label>
                                            <Input 
                                                id="rate_hourly"
                                                type="number" 
                                                placeholder="e.g., 100"
                                                value={formData.expected_rate_per_hour}
                                                onChange={e => setFormData({...formData, expected_rate_per_hour: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Note: A rating-based automated rate will be launched soon. This is for initial setup.</p>
                                </div>
                            )}

                             <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Your Professional Profile</h3>
                                <div>
                                    <Label htmlFor="headline">Headline</Label>
                                    <Input id="headline" placeholder="e.g., 'VP of Sales @ Acme Inc | B2B SaaS Growth Expert'" value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} />
                                </div>
                                <div>
                                    <Label htmlFor="bio">Short Bio</Label>
                                    <Textarea id="bio" placeholder="Tell us about your experience and what you're passionate about in sales." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                                </div>
                                 <div>
                                    <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                                    <Input id="linkedin" placeholder="https://linkedin.com/in/yourprofile" value={formData.linkedin_profile_url} onChange={e => setFormData({...formData, linkedin_profile_url: e.target.value})} />
                                </div>
                             </div>

                            <div className="flex gap-4">
                                <Button onClick={prevStep} variant="outline" className="w-full">Back</Button>
                                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finish & Join Community'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
