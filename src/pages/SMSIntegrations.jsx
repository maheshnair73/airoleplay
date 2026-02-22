import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export default function SMSIntegrations() {
    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">SMS Integrations</h1>
                <p className="text-slate-600 mt-2">Connect SMS providers to send text messages from the platform.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        SMS Provider Settings
                    </CardTitle>
                    <CardDescription>
                        Configuration for SMS integrations will be available here soon.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">SMS integration setup is coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}