import React, { useState, useEffect } from 'react';
import { DialerIntegration } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plug, Save, Trash2, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { testDialerConnection } from '@/api/functions';

export default function DialerSettings() {
    const [integrations, setIntegrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingStates, setSavingStates] = useState({});
    const [testingStates, setTestingStates] = useState({});

    const loadIntegrations = async () => {
        setIsLoading(true);
        try {
            const data = await DialerIntegration.list();
            setIntegrations(data);
        } catch (error) {
            toast.error("Failed to load dialer integrations.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadIntegrations();
    }, []);

    const handleFieldChange = (index, field, value) => {
        const newIntegrations = [...integrations];
        newIntegrations[index][field] = value;
        setIntegrations(newIntegrations);
    };

    const handleSave = async (integration, index) => {
        setSavingStates(prev => ({ ...prev, [index]: true }));
        try {
            // Ensure we save all relevant fields
            const { id, ...updateData } = integration;
            await DialerIntegration.update(id, updateData);
            toast.success(`${integration.integration_name} saved successfully.`);
        } catch (error) {
            toast.error(`Failed to save ${integration.integration_name}.`);
        }
        setSavingStates(prev => ({ ...prev, [index]: false }));
    };
    
    const handleTest = async (integration, index) => {
        setTestingStates(prev => ({ ...prev, [index]: true }));
        try {
            const { data } = await testDialerConnection({ integrationId: integration.id });
            if (data.success) {
                toast.success(`Connection to ${integration.integration_name} is successful!`);
            } else {
                toast.error(`Connection failed: ${data.error}`);
            }
            // Refresh integrations to show updated status
            loadIntegrations();
        } catch (error) {
             toast.error(`Failed to test connection: ${error.data?.error || "An unknown error occurred"}`);
        }
        setTestingStates(prev => ({ ...prev, [index]: false }));
    };

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dialer Settings</h1>
                <p className="text-slate-600 mt-1">Configure and manage your voice dialer integrations.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : integrations.length > 0 ? (
                integrations.map((integration, index) => (
                    <Card key={integration.id} className="shadow-lg border-l-4 border-l-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plug className="w-5 h-5" />
                                        {integration.integration_name}
                                    </CardTitle>
                                    <CardDescription className="capitalize mt-1">
                                        {integration.provider} Integration
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {integration.last_sync_status === 'connected' ? (
                                        <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Connected
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Error
                                        </span>
                                    )}
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor={`active-switch-${index}`} className="text-sm font-medium">Active</Label>
                                        <Switch
                                            id={`active-switch-${index}`}
                                            checked={integration.is_active}
                                            onCheckedChange={(checked) => handleFieldChange(index, 'is_active', checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor={`name-${index}`}>Integration Name</Label>
                                <Input
                                    id={`name-${index}`}
                                    value={integration.integration_name}
                                    onChange={(e) => handleFieldChange(index, 'integration_name', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            
                            {integration.provider === 'effyvoice' && (
                                <>
                                    <div>
                                        <Label htmlFor={`userid-${index}`}>User ID</Label>
                                        <Input
                                            id={`userid-${index}`}
                                            value={integration.userid || ''}
                                            onChange={(e) => handleFieldChange(index, 'userid', e.target.value)}
                                            className="mt-1"
                                            placeholder="e.g., effibiz"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`password-${index}`}>Password</Label>
                                        <Input
                                            id={`password-${index}`}
                                            type="password"
                                            value={integration.password || ''}
                                            onChange={(e) => handleFieldChange(index, 'password', e.target.value)}
                                            className="mt-1"
                                            placeholder="Enter EffyVoice Password"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <Label htmlFor={`api-key-${index}`}>API Key</Label>
                                <Input
                                    id={`api-key-${index}`}
                                    type="password"
                                    value={integration.api_key}
                                    onChange={(e) => handleFieldChange(index, 'api_key', e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => handleTest(integration, index)}
                                    disabled={testingStates[index]}
                                >
                                    {testingStates[index] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Test Connection
                                </Button>
                                <Button
                                    onClick={() => handleSave(integration, index)}
                                    disabled={savingStates[index]}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {savingStates[index] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                 <div className="text-center py-12">
                    <Plug className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No dialer integrations found.</p>
                </div>
            )}
        </div>
    );
}