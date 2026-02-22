import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Instagram, Linkedin } from 'lucide-react';

export default function SocialIntegrations() {
    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Social Media Integrations</h1>
                <p className="text-slate-600 mt-2">Connect your social media accounts for prospecting and engagement.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Linkedin className="w-5 h-5" />
                        Social Media Connections
                    </CardTitle>
                    <CardDescription>
                        Configuration for platforms like LinkedIn will be available here soon.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="flex justify-center gap-4">
                            <Linkedin className="w-12 h-12 text-slate-300" />
                            <Instagram className="w-12 h-12 text-slate-300" />
                        </div>
                        <p className="text-slate-500 mt-4">Social media integration setup is coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}