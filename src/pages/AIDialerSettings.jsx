
import React, { useState, useEffect } from 'react';
import { DialerIntegration } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge'; // Added this import
import { toast } from 'sonner';
import { Loader2, Plus, Settings, Trash2, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { testDialerConnection } from '@/api/functions';

const IntegrationCard = ({ integration, onTest, onDelete, onSetActive }) => (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>{integration.integration_name}</CardTitle>
                    <CardDescription>Provider: {integration.provider}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {integration.last_sync_status === 'connected' && <Badge className="bg-green-500 text-white">Connected</Badge>} {/* Added text-white for better contrast */}
                    {integration.last_sync_status === 'error' && <Badge variant="destructive">Error</Badge>}
                    {integration.last_sync_status === 'pending' && <Badge variant="outline">Pending</Badge>}
                    {integration.is_active && <Badge>Active</Badge>}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onTest(integration)}>
                        <Zap className="w-4 h-4 mr-2"/>
                        Test Connection
                    </Button>
                    {!integration.is_active && (
                        <Button variant="default" size="sm" onClick={() => onSetActive(integration)}>
                            Set Active
                        </Button>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDelete(integration.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
        </CardContent>
    </Card>
);

const AddIntegrationForm = ({ onSave }) => {
    const [integration, setIntegration] = useState({
        integration_name: '',
        provider: 'elevenlabs',
        api_key: '',
        is_active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await DialerIntegration.create(integration);
            toast.success("Integration added successfully.");
            onSave();
            setIntegration({ integration_name: '', provider: 'elevenlabs', api_key: '', is_active: true });
        } catch (error) {
            toast.error("Failed to add integration.");
        }
        setIsSaving(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Dialer Integration</CardTitle>
                <CardDescription>Connect to a voice AI provider like ElevenLabs.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Integration Name</Label>
                        <Input id="name" placeholder="e.g., ElevenLabs Production" value={integration.integration_name} onChange={(e) => setIntegration({...integration, integration_name: e.target.value})} required />
                    </div>
                    <div>
                        <Label htmlFor="provider">Provider</Label>
                        <Select value={integration.provider} onValueChange={(value) => setIntegration({...integration, provider: value})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                                <SelectItem value="bland" disabled>Bland.ai (coming soon)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="api_key">API Key</Label>
                        <Input id="api_key" type="password" placeholder="Your ElevenLabs API Key" value={integration.api_key} onChange={(e) => setIntegration({...integration, api_key: e.target.value})} required />
                    </div>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} {/* Added mr-2 for Loader2 */}
                        {isSaving ? 'Adding...' : 'Add Integration'} {/* Updated button text */}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default function AIDialerSettings() {
    const [integrations, setIntegrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchIntegrations = async () => {
        setIsLoading(true);
        try {
            const data = await DialerIntegration.list();
            setIntegrations(data);
            if (data.length === 0) {
                setShowForm(true);
            }
        } catch (error) {
            toast.error("Failed to fetch integrations.");
            console.error("Error fetching integrations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const handleTest = async (integration) => {
        toast.info(`Testing connection for ${integration.integration_name}...`);
        try {
            const { data } = await testDialerConnection({ integrationId: integration.id });
            if (data.success) {
                toast.success("Connection successful!");
            } else {
                toast.error(`Connection failed: ${data.error || 'Unknown error'}`); // Added fallback error message
            }
            fetchIntegrations(); // Refresh status after test
        } catch (error) {
            toast.error("Failed to test connection.");
            console.error("Error testing connection:", error);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this integration?")) {
            try {
                await DialerIntegration.delete(id);
                toast.success("Integration deleted.");
                fetchIntegrations();
            } catch (error) {
                toast.error("Failed to delete integration.");
                console.error("Error deleting integration:", error);
            }
        }
    };

    const handleSetActive = async (integrationToActivate) => {
        try {
            // Deactivate all other integrations and activate the selected one
            const updates = integrations.map(int => {
                if (int.id === integrationToActivate.id && !int.is_active) {
                    return DialerIntegration.update(int.id, { is_active: true });
                } else if (int.id !== integrationToActivate.id && int.is_active) {
                    return DialerIntegration.update(int.id, { is_active: false });
                }
                return Promise.resolve(); // No change needed for this integration
            }).filter(Boolean); // Filter out resolved promises if no update was needed

            await Promise.all(updates);
            toast.success(`${integrationToActivate.integration_name} is now the active integration.`);
            fetchIntegrations();
        } catch (error) {
            toast.error("Failed to set active integration.");
            console.error("Error setting active integration:", error);
        }
    };


    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">AI Dialer Settings</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel Add' : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Integration
                        </>
                    )}
                </Button>
            </div>
            
            {showForm && <AddIntegrationForm onSave={() => { fetchIntegrations(); setShowForm(false); }} />}
            
            <div className="mt-6 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                        <p className="ml-2 text-gray-500">Loading integrations...</p>
                    </div>
                ) : integrations.length === 0 && !showForm ? (
                    <Card className="text-center p-8">
                        <CardTitle className="mb-2">No Dialer Integrations Found</CardTitle>
                        <CardDescription className="mb-4">Add your ElevenLabs integration to start making AI calls.</CardDescription>
                        <Button className="mt-4" onClick={() => setShowForm(true)}>Add Integration</Button>
                    </Card>
                ) : (
                    integrations.map(int => (
                        <IntegrationCard 
                            key={int.id} 
                            integration={int} 
                            onTest={handleTest} 
                            onDelete={handleDelete}
                            onSetActive={handleSetActive}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
