import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function RescheduleModal({ open, onOpenChange, meeting, onReschedule }) {
    const [date, setDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    useEffect(() => {
        if (meeting) {
            setDate(new Date(meeting.scheduled_at));
            setSelectedTime(format(new Date(meeting.scheduled_at), 'HH:mm'));
        }
    }, [meeting]);

    const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    const handleConfirm = () => {
        if (!date || !selectedTime) {
            toast.error("Please select a date and time.");
            return;
        }
        const [hours, minutes] = selectedTime.split(':');
        const newDate = new Date(date);
        newDate.setHours(parseInt(hours, 10));
        newDate.setMinutes(parseInt(minutes, 10));

        onReschedule(newDate);
        onOpenChange(false);
    };

    if (!meeting) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reschedule Meeting</DialogTitle>
                    <DialogDescription>Select a new date and time for "{meeting.title}".</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border mx-auto"
                    />
                    <div className="grid grid-cols-4 gap-2">
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
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm Reschedule</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}