
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Loader2, Edit } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast'; // Assuming this is where toast is imported from

// Mock User model/service for demonstration purposes.
// In a real application, this would be an API call or a ORM/DB integration.
const mockUsersData = [
    { id: 'usr_001', full_name: 'Alice Johnson', email: 'alice.j@example.com', role: 'admin', phone_number: '9699859996', user_id: 'alice_id_101', effyvoice_agent_id: '4455', country: 'india' },
    { id: 'usr_002', full_name: 'Bob Williams', email: 'bob.w@example.com', role: 'user', phone_number: '9699859997', user_id: 'bob_id_102', effyvoice_agent_id: '4456', country: 'usa' },
    { id: 'usr_003', full_name: 'Charlie Davis', email: 'charlie.d@example.com', role: 'user', phone_number: '9699859998', user_id: 'charlie_id_103', effyvoice_agent_id: '', country: 'uk' },
    { id: 'usr_004', full_name: 'Diana Miller', email: 'diana.m@example.com', role: 'user', phone_number: '', user_id: 'diana_id_104', effyvoice_agent_id: '4458', country: 'canada' },
    { id: 'usr_005', full_name: 'Eve Brown', email: 'eve.b@example.com', role: 'admin', phone_number: '9699859999', user_id: 'eve_id_105', effyvoice_agent_id: '4459', country: 'australia' },
];

class User {
    static async getAll() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockUsersData);
            }, 500); // Simulate network delay
        });
    }

    static async update(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockUsersData.findIndex(user => user.id === id);
                if (index !== -1) {
                    // Update the user data, ensuring required fields are present
                    mockUsersData[index] = {
                        ...mockUsersData[index],
                        phone_number: data.phone_number,
                        user_id: data.user_id,
                        effyvoice_agent_id: data.effyvoice_agent_id,
                        country: data.country
                    };
                    resolve();
                } else {
                    reject(new Error('User not found'));
                }
            }, 300); // Simulate network delay
        });
    }
}

export default function Users() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null); // This state isn't used in the provided outline but is kept for potential future use
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState({});

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const fetchedUsers = await User.getAll();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to load users:", error);
            toast({
                title: "Error",
                description: "Failed to load users. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleEditUser = (user) => {
        setEditingUser({
            ...user,
            phone_number: user.phone_number || '9699859996',
            user_id: user.user_id || user.id, // Fallback to user.id if user_id is not set
            effyvoice_agent_id: user.effyvoice_agent_id || '',
            country: user.country || 'india'
        });
        setShowEditModal(true);
    };

    const handleSaveUser = async () => {
        try {
            await User.update(editingUser.id, {
                phone_number: editingUser.phone_number,
                user_id: editingUser.user_id,
                effyvoice_agent_id: editingUser.effyvoice_agent_id,
                country: editingUser.country
            });
            toast({
                title: "Success",
                description: "User updated successfully!",
                variant: "success", // Assuming a 'success' variant exists in your toast setup
            });
            setShowEditModal(false);
            loadUsers(); // Refresh the user list
        } catch (error) {
            console.error("Failed to update user:", error);
            toast({
                title: "Error",
                description: "Failed to update user. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">User Management</h1>
                <p className="text-slate-600 mt-2">Manage team members and permissions</p>
            </div>

            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Agent ID</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan="7" className="text-center h-24">
                                            <Loader2 className="mx-auto w-6 h-6 animate-spin text-slate-300" />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.full_name || 'No Name'}</div>
                                                        <div className="text-sm text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100/80' : 'bg-blue-100 text-blue-800 hover:bg-blue-100/80'}>
                                                    {user.role || 'user'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.phone_number || 'Not set'}</TableCell>
                                            <TableCell>
                                                <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                                                    {user.user_id || user.id}
                                                </code>
                                            </TableCell>
                                            <TableCell>{user.effyvoice_agent_id || 'Not set'}</TableCell>
                                            <TableCell className="capitalize">{user.country || 'india'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="7" className="text-center h-24 text-slate-500">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4 text-slate-800">Edit User Profile</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2 text-slate-700">Phone Number (Extension)</label>
                                    <Input
                                        id="phoneNumber"
                                        value={editingUser.phone_number}
                                        onChange={(e) => setEditingUser({...editingUser, phone_number: e.target.value})}
                                        placeholder="9699859996"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Used as extension number for EffyVoice calls</p>
                                </div>

                                <div>
                                    <label htmlFor="userId" className="block text-sm font-medium mb-2 text-slate-700">User ID</label>
                                    <Input
                                        id="userId"
                                        value={editingUser.user_id}
                                        onChange={(e) => setEditingUser({...editingUser, user_id: e.target.value})}
                                        placeholder="Enter unique user ID"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="agentId" className="block text-sm font-medium mb-2 text-slate-700">EffyVoice Agent ID</label>
                                    <Input
                                        id="agentId"
                                        value={editingUser.effyvoice_agent_id}
                                        onChange={(e) => setEditingUser({...editingUser, effyvoice_agent_id: e.target.value})}
                                        placeholder="4455"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Required for EffyVoice dialer integration</p>
                                </div>

                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium mb-2 text-slate-700">Country</label>
                                    <Select 
                                        value={editingUser.country} 
                                        onValueChange={(value) => setEditingUser({...editingUser, country: value})}
                                    >
                                        <SelectTrigger id="country">
                                            <SelectValue placeholder="Select a country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="india">India</SelectItem>
                                            <SelectItem value="usa">USA</SelectItem>
                                            <SelectItem value="uk">UK</SelectItem>
                                            <SelectItem value="canada">Canada</SelectItem>
                                            <SelectItem value="australia">Australia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveUser}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
