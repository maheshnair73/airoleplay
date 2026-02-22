import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioTower } from 'lucide-react';

export default function WhatsAppIntegrations() {
    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">WhatsApp Integration</h1>
                <p className="text-slate-600 mt-2">Connect your WhatsApp Business account to communicate with leads.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RadioTower className="w-5 h-5" />
                        WhatsApp Business API Settings
                    </CardTitle>
                    <CardDescription>
                        Configuration for WhatsApp integrations will be available here soon.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <RadioTower className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">WhatsApp integration setup is coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}