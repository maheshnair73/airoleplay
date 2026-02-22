import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { TaskSubmission } from '@/api/entities';
import { CoachingTask } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BrainCircuit, Loader2, Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { UploadPrivateFile } from '@/api/integrations';
import { analyzeCoachingSubmission } from '@/api/functions';

export default function PitchReviewModal({ open, onOpenChange, lead, pitchText, recordedAudio }) {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!open) return;
            setIsLoading(true);
            try {
                const [allUsers, me] = await Promise.all([
                    User.list(),
                    User.me()
                ]);
                setCurrentUser(me);
                setUsers(allUsers.filter(u => u.email !== me.email && u.role.includes('admin')));
            } catch (error) {
                console.error("Failed to fetch users", error);
                toast.error("Could not load users for review.");
            }
            setIsLoading(false);
        };

        fetchData();
    }, [open]);

    const createAdHocTask = async () => {
        // Create a generic task for this ad-hoc practice session
        try {
            const task = await CoachingTask.create({
                task_title: `Ad-hoc pitch practice for ${lead.contact_name}`,
                task_type: 'audio',
                scenario: `An impromptu pitch practice for lead: ${lead.contact_name} from ${lead.company_name}. Pitch text was: "${pitchText}"`,
                duration_seconds: 120, // default
                status: 'active', // So it can be referenced
            });
            return task.id;
        } catch (error) {
            console.error("Failed to create ad-hoc task", error);
            toast.error("Could not create underlying practice task.");
            return null;
        }
    };

    const handleSendReview = async (reviewType) => {
        if (!recordedAudio) {
            toast.error("No recording available to send for review.");
            return;
        }
        if (reviewType === 'peer' && !selectedUser) {
            toast.error("Please select a manager to send the review to.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload audio file
            const { file_uri } = await UploadPrivateFile({ file: recordedAudio });
            if (!file_uri) throw new Error("File upload failed.");

            // 2. Create an ad-hoc task to associate with
            const adHocTaskId = await createAdHocTask();
            if (!adHocTaskId) throw new Error("Task creation failed.");

            // 3. Create the submission record
            const submissionPayload = {
                task_id: adHocTaskId,
                related_lead_id: lead.id,
                submitted_by: currentUser.email,
                submission_url: file_uri,
                submission_type: 'audio',
                status: reviewType === 'peer' ? 'pending_peer_review' : 'pending_ai_review',
                reviewer_email: reviewType === 'peer' ? users.find(u => u.id === selectedUser)?.email : null,
            };
            const newSubmission = await TaskSubmission.create(submissionPayload);

            // 4. If AI review, trigger the backend function
            if (reviewType === 'ai') {
                await analyzeCoachingSubmission({ submissionId: newSubmission.id, audioUrl: file_uri });
                toast.success("Submission sent for AI analysis!", {
                    description: "You'll be notified once the review is complete."
                });
            } else {
                 toast.success("Review request sent successfully!", {
                    description: `${users.find(u => u.id === selectedUser)?.full_name} has been notified.`
                });
            }
            
            onOpenChange(false);
            setSelectedUser(null);
        } catch (error) {
            console.error(`Failed to send for ${reviewType} review:`, error);
            toast.error("Failed to send submission.", { description: error.message });
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            if (!isOpen) setSelectedUser(null);
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Pitch for Review</DialogTitle>
                    <DialogDescription>
                        Get feedback on your recorded pitch for {lead.contact_name}.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">📎 Audio recording attached</p>
                        <p className="text-xs text-blue-600">Your recorded pitch will be sent for review.</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2 text-slate-600">AI-Powered Feedback</h4>
                        <Button onClick={() => handleSendReview('ai')} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white" disabled={isSubmitting}>
                           {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <BrainCircuit className="w-4 h-4 mr-2"/>}
                           Get Instant AI Analysis
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">Or</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2 text-slate-600">Manager Review</h4>
                        {isLoading ? (
                            <div className="flex justify-center">
                                <Loader2 className="animate-spin text-slate-400" />
                            </div>
                        ) : (
                             <div className="flex items-center gap-2">
                                <Select onValueChange={setSelectedUser} value={selectedUser || ''} disabled={isSubmitting}>
                                    <SelectTrigger className="flex-grow">
                                        <SelectValue placeholder="Select a manager..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(user => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.display_name || user.full_name || user.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={() => handleSendReview('peer')} disabled={!selectedUser || isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                                </Button>
                             </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}