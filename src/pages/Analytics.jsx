import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
                <p className="text-slate-600 mt-2">Data-driven insights into your sales performance</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Sales Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Analytics dashboard coming soon</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}