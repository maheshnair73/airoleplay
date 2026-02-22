import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/api/entities';
import { Plus, Edit, Trash2, Award, Zap, Target, Crown, Star, ArrowLeft, Gift, X } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const initialAchievementState = {
    achievement_id: '',
    name: '',
    description: '',
    category: 'prospecting',
    points_reward: 100,
    difficulty: 'bronze',
    is_active: true,
    rewards: [],
    trigger_criteria: {
        action_type: 'call_completed',
        count_required: 100,
        time_period: 'all_time'
    }
};

export default function AchievementManagement() {
    const [achievements, setAchievements] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentAchievement, setCurrentAchievement] = useState(initialAchievementState);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        setIsLoading(true);
        try {
            const data = await Achievement.list();
            setAchievements(data);
        } catch (error) {
            toast.error("Failed to load achievements.");
        }
        setIsLoading(false);
    };

    const handleOpenDialog = (achievement = null) => {
        if (achievement) {
            setCurrentAchievement({
                ...initialAchievementState,
                ...achievement,
                rewards: achievement.rewards || [],
                trigger_criteria: achievement.trigger_criteria || initialAchievementState.trigger_criteria,
            });
            setIsEditing(true);
        } else {
            setCurrentAchievement(initialAchievementState);
            setIsEditing(false);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const achievementToSave = {
                ...currentAchievement,
                points_reward: Number(currentAchievement.points_reward),
                trigger_criteria: {
                    ...currentAchievement.trigger_criteria,
                    count_required: Number(currentAchievement.trigger_criteria.count_required),
                },
            };

            if (isEditing) {
                await Achievement.update(achievementToSave.id, achievementToSave);
                toast.success("Achievement updated successfully!");
            } else {
                await Achievement.create(achievementToSave);
                toast.success("Achievement created successfully!");
            }
            fetchAchievements();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Save error:", error);
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} achievement: ${error.message || ''}`);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this achievement? This cannot be undone.")) {
            try {
                await Achievement.delete(id);
                toast.success("Achievement deleted.");
                fetchAchievements();
            } catch(error) {
                toast.error("Failed to delete achievement.");
            }
        }
    };

    const handleAddReward = () => {
        setCurrentAchievement(prev => ({
            ...prev,
            rewards: [...(prev.rewards || []), { type: 'Custom', value: '', description: '' }]
        }));
    };

    const handleRemoveReward = (index) => {
        setCurrentAchievement(prev => ({
            ...prev,
            rewards: prev.rewards.filter((_, i) => i !== index)
        }));
    };

    const handleRewardChange = (index, field, value) => {
        const updatedRewards = [...currentAchievement.rewards];
        updatedRewards[index][field] = value;
        setCurrentAchievement(prev => ({ ...prev, rewards: updatedRewards }));
    };

    const MetricOptions = [
        { label: 'Calls Completed', value: 'call_completed' },
        { label: 'Leads Created', value: 'lead_created' },
        { label: 'Leads Qualified', value: 'lead_qualified' },
        { label: 'Proposals Sent', value: 'proposal_sent' },
        { label: 'Proposals Signed', value: 'proposal_signed' },
        { label: 'Roleplays Finished', value: 'roleplay_finished' },
        { label: 'Coaching Submitted', value: 'coaching_submitted' },
    ];

    return (
        <div className="p-8">
            <Link to={createPageUrl('GamificationAdmin')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Gamification Hub
            </Link>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Achievement Management</h1>
                    <p className="text-muted-foreground">Create and manage achievements for your team.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Achievement
                </Button>
            </header>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Trigger</TableHead>
                                <TableHead>Rewards</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan="5" className="text-center">Loading achievements...</TableCell></TableRow>
                            ) : achievements.length === 0 ? (
                                <TableRow><TableCell colSpan="5" className="text-center">No achievements found.</TableCell></TableRow>
                            ) : (
                                achievements.map(ach => (
                                    <TableRow key={ach.id}>
                                        <TableCell className="font-medium">{ach.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {ach.trigger_criteria?.count_required} {MetricOptions.find(m => m.value === ach.trigger_criteria?.action_type)?.label || ach.trigger_criteria?.action_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{ach.points_reward} pts</Badge>
                                                <Badge className="capitalize bg-gray-200 text-gray-800">{ach.difficulty}</Badge>
                                                {(ach.rewards || []).map((r, i) => (
                                                    <Badge key={i} variant="default" className="bg-purple-100 text-purple-800">{r.type}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={ach.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                                {ach.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(ach)}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(ach.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit' : 'Create'} Achievement Level</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        {/* Basic Info */}
                        <div className="space-y-2">
                           <Label htmlFor="name">Achievement Name</Label>
                           <Input id="name" value={currentAchievement.name} onChange={(e) => setCurrentAchievement({...currentAchievement, name: e.target.value})} placeholder="e.g., Call Master Level 1" />
                        </div>
                        
                        {/* Trigger Condition */}
                        <Card>
                            <CardHeader><CardTitle>Trigger Condition</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Metric to Track</Label>
                                    <Select value={currentAchievement.trigger_criteria.action_type} onValueChange={(v) => setCurrentAchievement({...currentAchievement, trigger_criteria: {...currentAchievement.trigger_criteria, action_type: v}})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {MetricOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Value</Label>
                                    <Input type="number" value={currentAchievement.trigger_criteria.count_required} onChange={(e) => setCurrentAchievement({...currentAchievement, trigger_criteria: {...currentAchievement.trigger_criteria, count_required: e.target.value}})} placeholder="e.g., 100" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rewards */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rewards</CardTitle>
                                <CardDescription>Define what the user earns for completing this achievement.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bonus Points</Label>
                                        <Input type="number" value={currentAchievement.points_reward} onChange={(e) => setCurrentAchievement({...currentAchievement, points_reward: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Badge Level</Label>
                                        <Select value={currentAchievement.difficulty} onValueChange={(v) => setCurrentAchievement({...currentAchievement, difficulty: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bronze">Bronze</SelectItem>
                                                <SelectItem value="silver">Silver</SelectItem>
                                                <SelectItem value="gold">Gold</SelectItem>
                                                <SelectItem value="platinum">Platinum</SelectItem>
                                                <SelectItem value="diamond">Diamond</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                
                                <Label>Special Rewards</Label>
                                <div className="space-y-3">
                                    {(currentAchievement.rewards || []).map((reward, index) => (
                                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                                            <Select value={reward.type} onValueChange={(v) => handleRewardChange(index, 'type', v)}>
                                                <SelectTrigger className="w-1/3"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Certificate">Certificate</SelectItem>
                                                    <SelectItem value="Cash Prize">Cash Prize</SelectItem>
                                                    <SelectItem value="Coupon">Coupon</SelectItem>
                                                    <SelectItem value="Custom">Custom</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input 
                                                className="flex-1"
                                                placeholder="Value (e.g., $50, URL, 'Amazon Gift Card')" 
                                                value={reward.value} 
                                                onChange={(e) => handleRewardChange(index, 'value', e.target.value)} 
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveReward(index)}>
                                                <X className="w-4 h-4 text-red-500"/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={handleAddReward}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Special Reward
                                </Button>
                            </CardContent>
                        </Card>
                        
                         {/* Other Settings */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Internal Description</Label>
                            <Textarea id="description" value={currentAchievement.description} onChange={(e) => setCurrentAchievement({...currentAchievement, description: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="achievement_id">Technical ID</Label>
                           <Input id="achievement_id" value={currentAchievement.achievement_id} onChange={(e) => setCurrentAchievement({...currentAchievement, achievement_id: e.target.value})} placeholder="e.g., calls_made_level_1" />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}