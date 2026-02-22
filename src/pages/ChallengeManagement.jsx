
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Challenge } from '@/api/entities';
import { Plus, Edit, Trash2, Trophy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const initialChallengeState = {
    challenge_name: '',
    description: '',
    challenge_type: 'individual',
    category: 'prospecting',
    start_date: '',
    end_date: '',
    status: 'upcoming',
    goal_criteria: { metric: 'points_earned', target_value: 1000 },
    rewards: { winner_points: 500, participant_points: 50 }
};

export default function ChallengeManagement() {
    const [challenges, setChallenges] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentChallenge, setCurrentChallenge] = useState(initialChallengeState);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setIsLoading(true);
        try {
            const data = await Challenge.list();
            setChallenges(data);
        } catch (error) {
            toast.error("Failed to load challenges.");
        }
        setIsLoading(false);
    };

    const handleOpenDialog = (challenge = null) => {
        if (challenge) {
            setCurrentChallenge({
                ...challenge,
                start_date: challenge.start_date ? challenge.start_date.split('T')[0] : '',
                end_date: challenge.end_date ? challenge.end_date.split('T')[0] : '',
            });
            setIsEditing(true);
        } else {
            setCurrentChallenge(initialChallengeState);
            setIsEditing(false);
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (isEditing) {
                await Challenge.update(currentChallenge.id, currentChallenge);
                toast.success("Challenge updated successfully!");
            } else {
                await Challenge.create(currentChallenge);
                toast.success("Challenge created successfully!");
            }
            fetchChallenges();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} challenge.`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this challenge?")) {
            try {
                await Challenge.delete(id);
                toast.success("Challenge deleted.");
                fetchChallenges();
            } catch(error) {
                toast.error("Failed to delete challenge.");
            }
        }
    };

    return (
        <div className="p-8">
             <Link to={createPageUrl('GamificationAdmin')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Gamification Hub
            </Link>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Challenge Management</h1>
                    <p className="text-muted-foreground">Create and manage competitions for your team.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Challenge
                </Button>
            </header>

            <Card>
                <CardContent className="p-0">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Goal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Timeline</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading ? (
                                <TableRow><TableCell colSpan="6" className="text-center">Loading challenges...</TableCell></TableRow>
                            ) : challenges.length === 0 ? (
                                <TableRow><TableCell colSpan="6" className="text-center">No challenges found.</TableCell></TableRow>
                            ) : (
                                challenges.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.challenge_name}</TableCell>
                                        <TableCell className="capitalize">{c.challenge_type}</TableCell>
                                        <TableCell>{c.goal_criteria?.target_value} {c.goal_criteria?.metric.replace(/_/g, ' ')}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize">{c.status}</Badge></TableCell>
                                        <TableCell>{new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(c)}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit' : 'Create'} Challenge</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                       <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={currentChallenge.challenge_name} onChange={(e) => setCurrentChallenge({...currentChallenge, challenge_name: e.target.value})} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desc" className="text-right">Description</Label>
                            <Textarea id="desc" value={currentChallenge.description} onChange={(e) => setCurrentChallenge({...currentChallenge, description: e.target.value})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Dates</Label>
                            <div className="col-span-3 grid grid-cols-2 gap-2">
                                <Input type="date" value={currentChallenge.start_date} onChange={(e) => setCurrentChallenge({...currentChallenge, start_date: e.target.value})} />
                                <Input type="date" value={currentChallenge.end_date} onChange={(e) => setCurrentChallenge({...currentChallenge, end_date: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="goal_metric" className="text-right">Goal</Label>
                             <div className="col-span-3 grid grid-cols-2 gap-2">
                                <Select value={currentChallenge.goal_criteria.metric} onValueChange={(v) => setCurrentChallenge({...currentChallenge, goal_criteria: {...currentChallenge.goal_criteria, metric: v}})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="points_earned">Points Earned</SelectItem>
                                        <SelectItem value="deals_closed">Deals Closed</SelectItem>
                                        <SelectItem value="calls_made">Calls Made</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input type="number" placeholder="Target" value={currentChallenge.goal_criteria.target_value} onChange={(e) => setCurrentChallenge({...currentChallenge, goal_criteria: {...currentChallenge.goal_criteria, target_value: parseInt(e.target.value)}})} />
                             </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Save Challenge</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
