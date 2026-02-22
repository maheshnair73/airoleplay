
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Users, BookOpen, Star, Mic, Edit, CheckSquare } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center transform transition-transform duration-300 hover:-translate-y-2">
        <div className="inline-block p-4 bg-blue-100 text-blue-600 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
    </div>
);

export default function CommunityLanding() {
    return (
        <div className="bg-slate-50">
            {/* Hero Section */}
            <section className="text-center py-20 px-4 bg-gradient-to-b from-white to-slate-50">
                <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-5xl font-bold text-slate-900 mb-4">Join the effySales Pro Community</h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                    Share your expertise, shape the future of sales, and connect with a global network of professionals.
                </p>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link to={createPageUrl('CommunityOnboarding')}>
                        Become a Contributor
                    </Link>
                </Button>
            </section>

            {/* Features/Benefits Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How You Can Contribute</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Star className="w-8 h-8" />}
                            title="Mentor Rising Stars"
                            description="Guide the next generation of sales talent by offering your experience and insights through one-on-one mentorship."
                        />
                        <FeatureCard 
                            icon={<BookOpen className="w-8 h-8" />}
                            title="Become a Thought Leader"
                            description="Write and publish articles, create video content, or host podcasts to establish your brand and share your knowledge."
                        />
                         <FeatureCard 
                            icon={<Mic className="w-8 h-8" />}
                            title="Offer Expert Consulting"
                            description="Provide paid consulting services to individuals and businesses seeking to overcome specific sales challenges."
                        />
                        <FeatureCard 
                            icon={<Edit className="w-8 h-8" />}
                            title="Evaluate Pitches"
                            description="Help reps hone their skills by providing constructive, real-world feedback on their sales pitches and roleplays."
                        />
                         <FeatureCard 
                            icon={<CheckSquare className="w-8 h-8" />}
                            title="Moderate & Curate"
                            description="Uphold the quality of our community by reviewing and approving content submitted by other members."
                        />
                         <FeatureCard 
                            icon={<Users className="w-8 h-8" />}
                            title="Network & Grow"
                            description="Connect with peers, learn from other experts, and expand your professional network in a collaborative environment."
                        />
                    </div>
                </div>
            </section>

             {/* Final CTA Section */}
            <section className="bg-white py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Make an Impact?</h2>
                    <p className="text-lg text-slate-600 mb-8">
                        Your expertise is valuable. Join us today and start contributing to a smarter, more effective sales world.
                    </p>
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <Link to={createPageUrl('CommunityOnboarding')}>
                            Join the effySales Community
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
