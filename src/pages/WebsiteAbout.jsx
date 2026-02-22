
import React from 'react';

export default function WebsiteAbout() {
    return (
        <div className="py-20 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            The Story Behind effySales Pro
                        </h1>
                        <p className="mt-4 text-lg text-slate-600">
                            How working closely with a UAE-based IT solutions firm revealed the missing piece
                        </p>
                    </div>

                    <div className="prose prose-lg mx-auto text-slate-700 space-y-8">
                        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                            <p className="text-lg font-medium text-blue-900 mb-0">
                                "Guys, effySales has been a lifesaver for our team. Our CRM is finally organized, our proposals look professional, and we're not losing leads anymore. But I'm still seeing the same performance gaps between my reps. Some are closing 40% more deals than others, and I can't figure out why."
                            </p>
                        </div>

                        <p>
                            That was Russell, VP of Sales at a leading UAE-based IT solutions firm, during one of our monthly check-ins in early 2023. His company had been one of our most successful effySales implementations—their 30-person sales team had transformed from spreadsheet chaos to streamlined efficiency in just three months.
                        </p>

                        <p>
                            But Russell's frustration was real, and it resonated with us because we were hearing similar stories from other clients. The basic foundation was solid, but something deeper was missing.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12">The Deep Dive: Uncovering the Real Performance Barriers</h2>

                        <p>
                            We spent the next two months working closely with Russell's team, sitting in on calls, reviewing proposals, and talking to both top performers and struggling reps. What we found was eye-opening:
                        </p>

                        <ul className="space-y-3">
                            <li><strong>The Practice Gap:</strong> Top performers were constantly role-playing difficult scenarios with each other, while others went into calls unprepared.</li>
                            <li><strong>The Intelligence Gap:</strong> High performers took detailed notes and followed structured methodologies, but this knowledge wasn't being scaled across the team.</li>
                            <li><strong>The Coaching Bottleneck:</strong> Russell could only provide personalized feedback to a few reps each week, leaving others to figure things out on their own.</li>
                            <li><strong>The Motivation Challenge:</strong> Without clear performance metrics and recognition, many reps weren't pushing themselves to improve consistently.</li>
                        </ul>

                        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                            <p className="text-lg font-medium text-yellow-900 mb-0">
                                "We realized that effySales had solved the 'what' and 'where' of selling, but we hadn't addressed the 'how' and 'how well.' Our clients needed an AI-powered coach, not just a CRM."
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12">Building effySales Pro: The Missing Pieces</h2>

                        <p>
                            Working directly with Russell and his team, we identified exactly what was needed to bridge the performance gap. This became our blueprint for effySales Pro:
                        </p>

                        <ul className="space-y-3">
                            <li><strong>AI Sales Roleplay:</strong> Russell's top reps were practicing difficult conversations. We built AI that could simulate any prospect scenario, giving every rep access to unlimited practice.</li>
                            <li><strong>effyAI Sales Buddy:</strong> Instead of reps taking fragmented notes during calls, we created an AI assistant that captures every detail and extracts key insights automatically.</li>
                            <li><strong>Real Call Analytics & Custom Scorecards:</strong> Russell needed to scale his coaching insights. We built AI that analyzes every call against his specific methodology and provides consistent feedback.</li>
                            <li><strong>Gamification & KPIs:</strong> To drive consistent improvement, we added achievement systems and clear performance tracking that made getting better engaging and measurable.</li>
                            <li><strong>Digital Sales Rooms & Smart Proposals:</strong> We enhanced our original effyDoc with collaborative deal rooms and engagement tracking to accelerate the buying process.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12">The Transformation: Russell's Team Results</h2>

                        <p>
                            Six months after launching effySales Pro with Russell's firm as our beta partner, the results spoke for themselves:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                            <div className="bg-slate-50 p-4 rounded-lg text-center">
                                <div className="text-3xl font-bold text-blue-600">40%</div>
                                <div className="text-sm text-slate-600">Increase in deal close rates</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg text-center">
                                <div className="text-3xl font-bold text-green-600">60%</div>
                                <div className="text-sm text-slate-600">Reduction in administrative time</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg text-center">
                                <div className="text-3xl font-bold text-purple-600">90%</div>
                                <div className="text-sm text-slate-600">Of reps said they felt more confident</div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500 my-8">
                            <p className="text-lg font-medium text-green-900 mb-2">
                                Russell's reaction:
                            </p>
                            <p className="text-green-800 mb-0">
                                "This isn't just an upgrade to our CRM—it's like giving every rep a personal sales coach and every manager a crystal ball into team performance. Our struggling reps are now hitting quota, and our top performers are setting new records."
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12">Our Mission Today</h2>

                        <p>
                            Working with clients like Russell taught us that sales success isn't just about organization—it's about continuous improvement, intelligent assistance, and turning every interaction into an opportunity for growth.
                        </p>

                        <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500 mt-8">
                            <p className="text-lg font-medium text-indigo-900 mb-2">
                                Our mission with effySales Pro:
                            </p>
                            <p className="text-indigo-800 mb-0">
                                To build the world's most intelligent AI Sales Co-Pilot that transforms every sales professional into a top performer—because we believe that with the right tools and coaching, anyone can achieve exceptional results.
                            </p>
                        </div>

                        <p className="text-center text-slate-600 italic mt-8">
                            — The effySales Pro Team
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
