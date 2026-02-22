import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Clock, User, Mail, Building, Info, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CalendarScheduler({ open, onOpenChange, lead }) {
    const [date, setDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const handleSchedule = () => {
        if (!date || !selectedTime) {
            toast.error("Please select a date and time.");
            return;
        }
        // Logic to schedule the meeting will be implemented here
        toast.success(`Meeting scheduled with ${lead.contact_name} for ${date.toDateString()} at ${selectedTime}`);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Schedule a Meeting with {lead.contact_name}</DialogTitle>
                    <DialogDescription>
                        Select a date and time. An invitation will be sent to {lead.contact_email}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-3 text-center">Select a Date</h4>
                        <div className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                            />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-3 text-center">Select a Time</h4>
                        <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-2">
                            {timeSlots.map(time => (
                                <Button
                                    key={time}
                                    variant={selectedTime === time ? 'default' : 'outline'}
                                    onClick={() => setSelectedTime(time)}
                                >
                                    {time}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSchedule} disabled={!date || !selectedTime}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}