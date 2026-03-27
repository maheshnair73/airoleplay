import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Package } from 'lucide-react';
import { ModuleAccess, User } from '@/api/entities';
import { toast } from 'sonner';

const modulesList = [
    { id: 'Dashboard', name: 'Dashboard', description: 'Main overview and key metrics' },
    { id: 'Leads', name: 'Leads', description: 'Lead management and tracking' },
    { id: 'Deals', name: 'Deals', description: 'Deal pipeline and opportunities' },
    { id: 'EmailHub', name: 'Email Hub', description: 'Email integration and management' },
    { id: 'Documents', name: 'Documents', description: 'Document creation and sharing' },
    { id: 'Playbooks', name: 'Playbooks', description: 'Sales playbooks and templates' },
    { id: 'DigitalSalesRooms', name: 'Digital Sales Rooms', description: 'Collaborative buyer spaces' },
    { id: 'AISalesAgent', name: 'AI Sales Agent', description: 'AI-powered sales assistance' },
    { id: 'CoachingHub', name: 'AI Coaching Hub', description: 'Sales coaching and training' },
    { id: 'AIRoleplay', name: 'AI Roleplay', description: 'Practice calls with AI' },
    { id: 'CallAnalytics', name: 'Call Analytics', description: 'Call recording analysis' },
    { id: 'Analytics', name: 'Performance Analytics', description: 'Sales performance insights' },
    { id: 'VoiceAIDialer', name: 'AI Voice Dialer', description: 'AI-powered calling' },
    { id: 'Dialer', name: 'Manual Dialer', description: 'Standard dialer functionality' }
];

export default function IntegratedModules() {
    const [loading, setLoading] = useState(true);
    const [moduleAccess, setModuleAccess] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchModuleAccess();
    }, []);

    const fetchModuleAccess = async () => {
        try {
            setLoading(true);
            const user = await User.me();
            setCurrentUser(user);

            const access = await ModuleAccess.list();
            setModuleAccess(access);
        } catch (error) {
            console.error('Failed to fetch module access:', error);
            toast.error('Failed to load module access');
        } finally {
            setLoading(false);
        }
    };

    const hasAccess = (moduleId) => {
        const accessRecord = moduleAccess.find(m => m.module_id === moduleId);

        if (!accessRecord || !accessRecord.is_enabled) {
            return false;
        }

        if (accessRecord.access_type === 'all_users') {
            return true;
        }

        if (accessRecord.access_type === 'specific_users' && currentUser) {
            return accessRecord.allowed_users?.includes(currentUser.email);
        }

        return false;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Modules</h1>
                <p className="text-slate-600 mt-2">View which modules you have access to</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modulesList.map(module => {
                    const access = hasAccess(module.id);

                    return (
                        <Card key={module.id} className={access ? 'border-green-200' : 'border-slate-200'}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-slate-600" />
                                        <CardTitle className="text-lg">{module.name}</CardTitle>
                                    </div>
                                    {access ? (
                                        <Badge variant="success" className="bg-green-100 text-green-700 border-green-300">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Enabled
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                            <XCircle className="w-3 h-3 mr-1" />
                                            Disabled
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="mt-2">
                                    {module.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <p className="text-sm text-slate-700">
                        Need access to a disabled module? Contact your administrator to request access.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}