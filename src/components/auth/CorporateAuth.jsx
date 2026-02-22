import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Shield } from 'lucide-react';

export default function CorporateAuthMessage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">SalesAI Pro</CardTitle>
                    <p className="text-slate-600">Corporate Sales Intelligence Platform</p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">Secure Corporate Access</span>
                    </div>
                    <p className="text-sm text-slate-600">
                        Please contact your system administrator for access to this platform.
                    </p>
                    <p className="text-xs text-slate-400">
                        This application uses enterprise authentication and requires proper user provisioning.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}