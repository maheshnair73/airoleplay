import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Crown, Shield, UserPlus } from 'lucide-react';
import { promoteToSuperAdmin } from '@/api/functions';

export default function SuperAdminPromotion() {
    const [userEmail, setUserEmail] = useState('vinodkotagiri@icloud.com');
    const [newRole, setNewRole] = useState('super_admin');
    const [isPromoting, setIsPromoting] = useState(false);

    const handlePromoteUser = async (e) => {
        e.preventDefault();
        
        if (!userEmail || !newRole) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsPromoting(true);
        try {
            const { data } = await promoteToSuperAdmin({ userEmail, newRole });
            toast.success(data.message);
            setUserEmail('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to promote user');
        } finally {
            setIsPromoting(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    User Role Management
                </h1>
                <p className="text-slate-600 mt-2">Promote users to Super Admin or change their roles</p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500" />
                        Promote User
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePromoteUser} className="space-y-6">
                        <div>
                            <Label htmlFor="userEmail">User Email</Label>
                            <Input
                                id="userEmail"
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="Enter user email to promote"
                                className="mt-1"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                The user must have already logged into the application at least once
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="newRole">New Role</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">Regular User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Crown className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-amber-800 font-medium">Important Notes:</p>
                                    <ul className="text-amber-700 text-sm mt-1 space-y-1">
                                        <li>• The user must first log into the app using their email</li>
                                        <li>• Super Admin gives access to all platform management features</li>
                                        <li>• Admin gives access to company-level management features</li>
                                        <li>• This action takes effect immediately</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isPromoting}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                            {isPromoting ? (
                                'Promoting...'
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Promote User
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="max-w-2xl bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <h3 className="font-semibold text-blue-800 mb-3">Quick Setup Instructions:</h3>
                    <ol className="text-blue-700 text-sm space-y-2">
                        <li>1. Ask <strong>vinodkotagiri@icloud.com</strong> to visit the application and log in using their iCloud email</li>
                        <li>2. Once they've logged in successfully, come back to this page</li>
                        <li>3. Enter their email above and select "Super Admin" role</li>
                        <li>4. Click "Promote User" - they'll immediately have super admin access</li>
                        <li>5. They can then access all Super Admin and Admin Panel features from the sidebar</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}