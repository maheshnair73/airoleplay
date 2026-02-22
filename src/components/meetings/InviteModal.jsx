import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function InviteModal({ open, onOpenChange, onSendInvites }) {
    const [emails, setEmails] = useState('');

    const handleSend = () => {
        const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
        if (emailList.length === 0) {
            toast.error("Please enter at least one email address.");
            return;
        }
        onSendInvites(emailList);
        setEmails('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite via Email</DialogTitle>
                    <DialogDescription>Enter email addresses separated by commas. An invitation link will be sent to them.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="example1@company.com, example2@company.com"
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                        rows={4}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSend}>Send Invites</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}