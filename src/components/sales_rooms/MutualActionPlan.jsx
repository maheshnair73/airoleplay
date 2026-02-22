import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { 
    Plus, Calendar as CalendarIcon, User, Clock, CheckCircle2, 
    Circle, AlertCircle, MessageSquare, Edit2, Trash2
} from 'lucide-react';
import { format, isOverdue, parseISO } from 'date-fns';

const statusColors = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Circle },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
    completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
    overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle }
};

const ActionItem = ({ item, onUpdate, onDelete, participants, isEditable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(item);
    
    const getStatusInfo = () => {
        if (item.status === 'completed') return statusColors.completed;
        if (item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed') {
            return statusColors.overdue;
        }
        return statusColors[item.status] || statusColors.pending;
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    const handleSave = () => {
        onUpdate(editingItem);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditingItem(item);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Card className="mb-4 border-blue-200">
                <CardContent className="p-4">
                    <div className="space-y-4">
                        <div>
                            <Label>Task Title</Label>
                            <Input
                                value={editingItem.title}
                                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                placeholder="What needs to be done?"
                            />
                        </div>
                        
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={editingItem.description || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                placeholder="Additional details..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Assigned To</Label>
                                <Select 
                                    value={editingItem.assigned_to?.[0] || ''} 
                                    onValueChange={(value) => setEditingItem({ ...editingItem, assigned_to: [value] })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {participants.map((participant) => (
                                            <SelectItem key={participant.email} value={participant.email}>
                                                {participant.name} ({participant.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Due Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editingItem.due_date ? format(new Date(editingItem.due_date), 'PPP') : 'Set date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={editingItem.due_date ? new Date(editingItem.due_date) : undefined}
                                            onSelect={(date) => setEditingItem({ ...editingItem, due_date: date?.toISOString().split('T')[0] })}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select 
                                    value={editingItem.status} 
                                    onValueChange={(value) => setEditingItem({ ...editingItem, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`mb-4 transition-all hover:shadow-md ${item.status === 'completed' ? 'opacity-75' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <StatusIcon className={`w-5 h-5 mt-1 ${statusInfo.text}`} />
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold ${item.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {item.title}
                            </h4>
                            {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <User className="w-4 h-4" />
                                    {participants.find(p => p.email === item.assigned_to?.[0])?.name || 'Unassigned'}
                                </div>
                                
                                {item.due_date && (
                                    <div className={`flex items-center gap-1 text-sm ${
                                        new Date(item.due_date) < new Date() && item.status !== 'completed' 
                                            ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                        <CalendarIcon className="w-4 h-4" />
                                        {format(new Date(item.due_date), 'MMM d, yyyy')}
                                    </div>
                                )}

                                <Badge className={`${statusInfo.bg} ${statusInfo.text}`}>
                                    {item.status.replace('_', ' ')}
                                </Badge>

                                {item.comments_count > 0 && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <MessageSquare className="w-4 h-4" />
                                        {item.comments_count}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditable && (
                        <div className="flex items-center gap-2 ml-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(item.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const NewActionItemForm = ({ onAdd, participants, onCancel }) => {
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        assigned_to: [],
        due_date: '',
        status: 'pending'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newItem.title.trim()) return;
        
        onAdd({
            ...newItem,
            id: `action_${Date.now()}`,
            comments_count: 0,
            resource_count: 0
        });
        
        setNewItem({
            title: '',
            description: '',
            assigned_to: [],
            due_date: '',
            status: 'pending'
        });
        onCancel();
    };

    return (
        <Card className="mb-4 border-green-200">
            <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Task Title *</Label>
                        <Input
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            placeholder="e.g., Review security documentation"
                            required
                        />
                    </div>
                    
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Additional context or requirements..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Assigned To</Label>
                            <Select 
                                value={newItem.assigned_to[0] || ''} 
                                onValueChange={(value) => setNewItem({ ...newItem, assigned_to: [value] })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select owner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {participants.map((participant) => (
                                        <SelectItem key={participant.email} value={participant.email}>
                                            {participant.name} ({participant.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newItem.due_date ? format(new Date(newItem.due_date), 'PPP') : 'Set date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={newItem.due_date ? new Date(newItem.due_date) : undefined}
                                        onSelect={(date) => setNewItem({ ...newItem, due_date: date?.toISOString().split('T')[0] })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Add Action Item
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default function MutualActionPlan({ section, onUpdate, isEditable = true, participants = [] }) {
    const [showNewForm, setShowNewForm] = useState(false);
    const actionItems = section.action_items || [];

    const handleAddActionItem = (newItem) => {
        const updatedSection = {
            ...section,
            action_items: [...actionItems, newItem]
        };
        onUpdate(updatedSection);
    };

    const handleUpdateActionItem = (updatedItem) => {
        const updatedActionItems = actionItems.map(item => 
            item.id === updatedItem.id ? updatedItem : item
        );
        const updatedSection = {
            ...section,
            action_items: updatedActionItems
        };
        onUpdate(updatedSection);
    };

    const handleDeleteActionItem = (itemId) => {
        const updatedActionItems = actionItems.filter(item => item.id !== itemId);
        const updatedSection = {
            ...section,
            action_items: updatedActionItems
        };
        onUpdate(updatedSection);
    };

    // Calculate progress statistics
    const totalItems = actionItems.length;
    const completedItems = actionItems.filter(item => item.status === 'completed').length;
    const overDueItems = actionItems.filter(item => 
        item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed'
    ).length;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                            <div className="text-sm text-gray-600">Total Items</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{completedItems}</div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{overDueItems}</div>
                            <div className="text-sm text-gray-600">Overdue</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{progressPercentage}%</div>
                            <div className="text-sm text-gray-600">Progress</div>
                        </div>
                    </div>
                    
                    {totalItems > 0 && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Items List */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
                    {isEditable && (
                        <Button 
                            onClick={() => setShowNewForm(true)}
                            disabled={showNewForm}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Action Item
                        </Button>
                    )}
                </div>

                {showNewForm && (
                    <NewActionItemForm
                        onAdd={handleAddActionItem}
                        participants={participants}
                        onCancel={() => setShowNewForm(false)}
                    />
                )}

                {actionItems.length === 0 && !showNewForm ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No Action Items Yet</h3>
                            <p className="text-gray-500 mb-4">
                                Create action items to track next steps and keep the deal moving forward.
                            </p>
                            {isEditable && (
                                <Button onClick={() => setShowNewForm(true)} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Action Item
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    actionItems.map((item) => (
                        <ActionItem
                            key={item.id}
                            item={item}
                            onUpdate={handleUpdateActionItem}
                            onDelete={handleDeleteActionItem}
                            participants={participants}
                            isEditable={isEditable}
                        />
                    ))
                )}
            </div>
        </div>
    );
}