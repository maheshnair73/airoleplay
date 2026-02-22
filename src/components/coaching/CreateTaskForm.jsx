import React, { useState, useEffect } from 'react';
import { CoachingTask } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';

export default function CreateTaskForm({ open, onOpenChange, onTaskCreated }) {
    const [task, setTask] = useState({
        task_title: '',
        task_type: 'video',
        description: '',
        scenario: '',
        duration_seconds: 180,
        due_date: null,
        assigned_users: [],
    });
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openUserSelect, setOpenUserSelect] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            const users = await User.list().catch(() => []);
            setAllUsers(users);
        }
        fetchUsers();
    }, []);

    const handleChange = (field, value) => {
        setTask(prev => ({ ...prev, [field]: value }));
    };
    
    const handleUserSelect = (userEmail) => {
        const currentAssigned = task.assigned_users;
        const newAssigned = currentAssigned.includes(userEmail)
            ? currentAssigned.filter(email => email !== userEmail)
            : [...currentAssigned, userEmail];
        handleChange('assigned_users', newAssigned);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await CoachingTask.create({ ...task, duration_seconds: Number(task.duration_seconds) });
            onTaskCreated();
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Coaching Task</DialogTitle>
                    <DialogDescription>Design a practice scenario for your team.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <Input placeholder="Task Title (e.g., Handling Budget Objections)" value={task.task_title} onChange={e => handleChange('task_title', e.target.value)} required />
                    <Textarea placeholder="Scenario Description" value={task.scenario} onChange={e => handleChange('scenario', e.target.value)} required />
                    <Textarea placeholder="Detailed Instructions" value={task.description} onChange={e => handleChange('description', e.target.value)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select value={task.task_type} onValueChange={v => handleChange('task_type', v)}>
                            <SelectTrigger><SelectValue placeholder="Task Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                                <SelectItem value="screen_recording">Screen Recording</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input type="number" placeholder="Max Duration (seconds)" value={task.duration_seconds} onChange={e => handleChange('duration_seconds', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{task.due_date ? format(task.due_date, 'PPP') : 'Set due date'}</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={task.due_date} onSelect={d => handleChange('due_date', d)} /></PopoverContent>
                        </Popover>

                        <Popover open={openUserSelect} onOpenChange={setOpenUserSelect}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={openUserSelect} className="w-full justify-between">
                                    {task.assigned_users.length > 0 ? `${task.assigned_users.length} user(s) selected` : "Assign to users..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search users..." />
                                    <CommandEmpty>No users found.</CommandEmpty>
                                    <CommandGroup className="max-h-60 overflow-y-auto">
                                        {allUsers.map((user) => (
                                            <CommandItem key={user.id} onSelect={() => handleUserSelect(user.email)} >
                                                <Check className={`mr-2 h-4 w-4 ${task.assigned_users.includes(user.email) ? "opacity-100" : "opacity-0"}`} />
                                                {user.full_name || user.email}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Task'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}