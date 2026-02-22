import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Unlock, Edit, Users, Globe, Loader2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { User as UserEntity } from '@/api/entities';
import { ModuleAccess } from '@/api/entities';
import { toast } from 'sonner';

const modulesList = [
    { id: 'Dashboard', name: 'Dashboard' },
    { id: 'Leads', name: 'Leads' },
    { id: 'Deals', name: 'Deals' },
    { id: 'EmailHub', name: 'Email Hub' },
    { id: 'Documents', name: 'Documents' },
    { id: 'Playbooks', name: 'Playbooks' },
    { id: 'DigitalSalesRooms', name: 'Digital Sales Rooms' },
    { id: 'AISalesAgent', name: 'AI Sales Agent' },
    { id: 'CoachingHub', name: 'AI Coaching Hub' },
    { id: 'AIRoleplay', name: 'AI Roleplay' },
    { id: 'CallAnalytics', name: 'Call Analytics' },
    { id: 'Analytics', name: 'Performance Analytics' },
    { id: 'VoiceAIDialer', name: 'AI Voice Dialer' },
    { id: 'Dialer', name: 'Manual Dialer' }
];

const ModuleEditModal = ({ open, onOpenChange, module, users, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [accessType, setAccessType] = useState(module.access_type || 'all_users');
    const [allowedUsers, setAllowedUsers] = useState(module.allowed_users || []);

    useEffect(() => {
        setAccessType(module.access_type || 'all_users');
        setAllowedUsers(module.allowed_users || []);
    }, [module]);

    const handleUserToggle = (email) => {
        setAllowedUsers(prev => 
            prev.includes(email) ? prev.filter(u => u !== email) : [...prev, email]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateData = {
                ...module,
                access_type: accessType,
                allowed_users: accessType === 'specific_users' ? allowedUsers : []
            };
            await onSave(updateData);
            onOpenChange(false);
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Access for: {module.module_name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={accessType === 'all_users' ? 'default' : 'outline'}
                            onClick={() => setAccessType('all_users')}
                            className="flex-1"
                        >
                            <Globe className="w-4 h-4 mr-2" /> All Users
                        </Button>
                        <Button
                            variant={accessType === 'specific_users' ? 'default' : 'outline'}
                            onClick={() => setAccessType('specific_users')}
                            className="flex-1"
                        >
                            <Users className="w-4 h-4 mr-2" /> Specific Users
                        </Button>
                    </div>

                    {accessType === 'specific_users' && (
                        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                            <p className="font-medium mb-2">Select users with access:</p>
                            <div className="space-y-2">
                                {users.map(user => (
                                    <div key={user.email} className="flex items-center justify-between">
                                        <label htmlFor={`user-${user.email}`} className="text-sm">
                                            {user.full_name} ({user.email})
                                        </label>
                                        <Switch
                                            id={`user-${user.email}`}
                                            checked={allowedUsers.includes(user.email)}
                                            onCheckedChange={() => handleUserToggle(user.email)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ModuleManagement() {
    const [moduleAccess, setModuleAccess] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingModule, setEditingModule] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [accessData, usersData] = await Promise.all([
                ModuleAccess.list(),
                UserEntity.list()
            ]);
            
            const accessMap = new Map(accessData.map(item => [item.module_id, item]));
            const combined = modulesList.map(module => ({
                module_id: module.id,
                module_name: module.name,
                is_enabled: true,
                access_type: 'all_users',
                allowed_users: [],
                ...accessMap.get(module.id)
            }));

            setModuleAccess(combined);
            setUsers(usersData.filter(u => u.role !== 'admin'));
        } catch (error) {
            toast.error("Failed to load module settings.");
            console.error("Fetch error:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleEnable = async (module) => {
        const updatedModule = { ...module, is_enabled: !module.is_enabled };
        setModuleAccess(prev => prev.map(m => m.module_id === module.module_id ? updatedModule : m));
        await handleSave(updatedModule);
    };

    const handleSave = async (moduleToSave) => {
        try {
            if (moduleToSave.id) {
                await ModuleAccess.update(moduleToSave.id, moduleToSave);
            } else {
                await ModuleAccess.create(moduleToSave);
            }
            toast.success(`${moduleToSave.module_name} settings updated!`);
            fetchData(); // Refresh data
        } catch (error) {
            toast.error(`Failed to update ${moduleToSave.module_name}.`);
        }
    };

    if (isLoading) {
        return <div className="p-6 flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div className="p-6 space-y-8 bg-slate-50/50">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Module Management</h1>
                <p className="text-slate-600 mt-2">Control which features and modules are available to your users.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Feature Access Control</CardTitle>
                    <CardDescription>
                        Enable or disable modules and manage user access permissions. Admins always have access to all modules.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Module</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Access Rule</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {moduleAccess.map(module => (
                                <TableRow key={module.module_id}>
                                    <TableCell className="font-medium">{module.module_name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={module.is_enabled}
                                                onCheckedChange={() => handleToggleEnable(module)}
                                            />
                                            <Badge variant={module.is_enabled ? 'default' : 'secondary'}>
                                                {module.is_enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {module.access_type === 'all_users' ? (
                                            <div className="flex items-center gap-1 text-sm text-slate-600">
                                                <Globe className="w-4 h-4 text-green-500" />
                                                All Users
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-sm text-slate-600">
                                                <Users className="w-4 h-4 text-blue-500" />
                                                {module.allowed_users.length} Specific Users
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setEditingModule(module)}
                                            disabled={!module.is_enabled}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Manage Access
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {editingModule && (
                <ModuleEditModal
                    open={!!editingModule}
                    onOpenChange={() => setEditingModule(null)}
                    module={editingModule}
                    users={users}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}