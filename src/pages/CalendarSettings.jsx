
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, CheckCircle, XCircle, Calendar as CalendarIcon, Clock, Plus, Trash2, Edit, Users, Mail, Video } from 'lucide-react';
import { toast } from 'sonner';
import { CalendarConnection } from '@/api/entities';
import { User } from '@/api/entities';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';

const GoogleIcon = () => <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.11-5.52c-2.17 1.45-4.92 2.3-8.78 2.3-6.76 0-12.47-4.55-14.51-10.68H2.26v5.7C6.22 42.4 14.48 48 24 48z"/><path fill="#FBBC05" d="M9.49 28.19c-.4-1.22-.63-2.53-.63-3.88s.23-2.66.63-3.88V14.7H2.26C.86 17.53 0 20.65 0 24.31s.86 6.78 2.26 9.61l7.23-5.73z"/><path fill="#EA4335" d="M24 9.31c3.52 0 6.62 1.21 9.09 3.52l6.3-6.3C35.91 2.24 30.47 0 24 0 14.48 0 6.22 5.6 2.26 14.7l7.23 5.73c2.04-6.13 7.75-10.68 14.51-10.68z"/></svg>;
const OutlookIcon = () => <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#0078D4" d="M12.25 2.25h-1.5l-9.5 9.25v1.5h22.5v-1.5l-9.5-9.25zM1.25 14.25v7.5h21.5v-7.5l-10.75 6.25-10.75-6.25z"/></svg>;

const MeetingCard = ({ meeting, onEdit, onCancel, onInvite }) => {
    const meetingDate = parseISO(meeting.start_time);
    const endDate = parseISO(meeting.end_time);
    
    const getDateLabel = (date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isThisWeek(date)) return format(date, 'EEEE');
        return format(date, 'MMM d, yyyy');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'tentative': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{meeting.title}</h3>
                            <Badge className={getStatusColor(meeting.status)}>
                                {meeting.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {getDateLabel(meetingDate)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(meetingDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                            </div>
                            {meeting.attendees?.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {meeting.attendees.length} attendees
                                </div>
                            )}
                        </div>
                        {meeting.description && (
                            <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                        )}
                        {meeting.location && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Video className="w-4 h-4" />
                                {meeting.location}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => onInvite(meeting)}>
                            <Users className="w-4 h-4 mr-1" />
                            Invite
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onEdit(meeting)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onCancel(meeting)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const EditMeetingModal = ({ meeting, open, onOpenChange, onSave }) => {
    const [editedMeeting, setEditedMeeting] = useState(meeting || {});

    useEffect(() => {
        setEditedMeeting(meeting || {});
    }, [meeting]);

    const handleSave = () => {
        onSave(editedMeeting);
        onOpenChange(false);
    };

    if (!meeting) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={editedMeeting.title || ''}
                            onChange={(e) => setEditedMeeting({...editedMeeting, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={editedMeeting.description || ''}
                            onChange={(e) => setEditedMeeting({...editedMeeting, description: e.target.value})}
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={editedMeeting.location || ''}
                            onChange={(e) => setEditedMeeting({...editedMeeting, location: e.target.value})}
                            placeholder="Meeting room, Zoom link, etc."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const InviteModal = ({ meeting, open, onOpenChange, onInvite }) => {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');

    const handleInvite = () => {
        if (!inviteEmail) {
            toast.error('Please enter an email address');
            return;
        }
        onInvite(meeting, inviteEmail, inviteMessage);
        setInviteEmail('');
        setInviteMessage('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite to Meeting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium">{meeting?.title}</h4>
                        <p className="text-sm text-gray-600">
                            {meeting?.start_time && format(parseISO(meeting.start_time), 'MMM d, yyyy h:mm a')}
                        </p>
                    </div>
                    <div>
                        <Label htmlFor="inviteEmail">Email Address</Label>
                        <Input
                            id="inviteEmail"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@company.com"
                        />
                    </div>
                    <div>
                        <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
                        <Textarea
                            id="inviteMessage"
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                            placeholder="Looking forward to our meeting..."
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleInvite}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function CalendarSettings() {
    const [connections, setConnections] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [invitingToMeeting, setInvitingToMeeting] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await User.me();
                if (user && user.email) {
                    const existingConnections = await CalendarConnection.filter({ user_email: user.email });
                    setConnections(existingConnections);
                    
                    // Sample meetings for demo - in real implementation, this would come from calendar API
                    setSampleMeetings();
                }
            } catch (error) {
                toast.error("Failed to load calendar data.");
                console.error(error);
                // Set sample meetings even on error for demo
                setSampleMeetings();
            } finally {
                setIsLoading(false);
            }
        };

        const setSampleMeetings = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);

            setMeetings([
                {
                    id: '1',
                    title: 'Product Demo with ABC Corp',
                    description: 'Quarterly sales review and next steps discussion',
                    start_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString(),
                    end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).toISOString(),
                    status: 'confirmed',
                    location: 'https://zoom.us/j/123456789',
                    attendees: ['john.doe@abccorp.com', 'jane.smith@abccorp.com']
                },
                {
                    id: '2',
                    title: 'Discovery Call - TechStart Inc',
                    description: 'Initial discovery call to understand their needs',
                    start_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 30).toISOString(),
                    end_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 30).toISOString(),
                    status: 'confirmed',
                    location: 'Google Meet',
                    attendees: ['mike@techstart.com']
                },
                {
                    id: '3',
                    title: 'Follow-up with Enterprise Client',
                    description: 'Contract negotiation and pricing discussion',
                    start_time: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 16, 0).toISOString(),
                    end_time: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 17, 0).toISOString(),
                    status: 'tentative',
                    location: 'Conference Room A',
                    attendees: ['sarah@enterprise.com', 'bob@enterprise.com', 'alice@enterprise.com']
                }
            ]);
        };

        fetchData();
    }, []);

    const handleConnect = (provider) => {
        toast.info(`Connecting to ${provider}...`, {
            description: "This feature is coming soon. You'll be able to link your calendar to automatically sync meetings.",
        });
    };

    const handleEditMeeting = (meeting) => {
        setEditingMeeting(meeting);
    };

    const handleSaveMeeting = (updatedMeeting) => {
        setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
        toast.success('Meeting updated successfully!');
    };

    const handleCancelMeeting = (meeting) => {
        if (window.confirm(`Are you sure you want to cancel "${meeting.title}"?`)) {
            setMeetings(prev => prev.filter(m => m.id !== meeting.id));
            toast.success('Meeting cancelled successfully!');
        }
    };

    const handleInviteToMeeting = (meeting, email, message) => {
        // In real implementation, this would send calendar invite
        toast.success(`Invitation sent to ${email} for "${meeting.title}"`);
    };

    const getDaysWithMeetings = () => {
        return meetings.map(meeting => parseISO(meeting.start_time));
    };

    const getTodaysMeetings = () => {
        return meetings.filter(meeting => isToday(parseISO(meeting.start_time)));
    };

    const getUpcomingMeetings = () => {
        const now = new Date();
        return meetings.filter(meeting => parseISO(meeting.start_time) > now)
            .sort((a, b) => parseISO(a.start_time) - parseISO(b.start_time));
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Calendar & Scheduling</h1>
                    <p className="text-slate-600">Manage your calendar connections and upcoming meetings.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar View */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Calendar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border"
                                modifiers={{
                                    meeting: getDaysWithMeetings()
                                }}
                                modifiersStyles={{
                                    meeting: { 
                                        backgroundColor: '#BFDBFE', // Light blue background
                                        color: '#1E40AF',           // Darker blue text
                                        fontWeight: 'bold',
                                        border: '2px solid #3B82F6' // Blue border
                                    }
                                }}
                            />
                            <Button 
                                variant="outline" 
                                className="w-full mt-4" 
                                onClick={() => setSelectedDate(new Date())}>
                                Go to Today
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Meetings List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Today's Meetings */}
                        <Card className="border-blue-500 border-2 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-blue-600">Today's Meetings ({getTodaysMeetings().length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {getTodaysMeetings().length > 0 ? (
                                    getTodaysMeetings().map(meeting => (
                                        <MeetingCard
                                            key={meeting.id}
                                            meeting={meeting}
                                            onEdit={handleEditMeeting}
                                            onCancel={handleCancelMeeting}
                                            onInvite={setInvitingToMeeting}
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No meetings scheduled for today</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Meetings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Meetings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {getUpcomingMeetings().length > 0 ? (
                                    getUpcomingMeetings().map(meeting => (
                                        <MeetingCard
                                            key={meeting.id}
                                            meeting={meeting}
                                            onEdit={handleEditMeeting}
                                            onCancel={handleCancelMeeting}
                                            onInvite={setInvitingToMeeting}
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No upcoming meetings</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Calendar Connections */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Connect Your Calendars</CardTitle>
                        <CardDescription>Link your Google or Outlook calendar to sync meetings automatically.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border rounded-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <GoogleIcon />
                                        <div>
                                            <p className="font-semibold">Google Calendar</p>
                                            <p className="text-sm text-slate-500">Sync with your primary Google account.</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleConnect('Google')} variant="outline">
                                        <Plus className="w-4 h-4 mr-2" /> Connect
                                    </Button>
                                </div>

                                <div className="p-4 border rounded-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <OutlookIcon />
                                        <div>
                                            <p className="font-semibold">Outlook Calendar</p>
                                            <p className="text-sm text-slate-500">Sync with your Microsoft 365 account.</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleConnect('Outlook')} variant="outline">
                                        <Plus className="w-4 h-4 mr-2" /> Connect
                                    </Button>
                                </div>
                            </>
                        )}
                        
                        {connections.length > 0 && (
                             <div className="pt-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Connections</h3>
                                {connections.map(conn => (
                                    <div key={conn.id} className="p-4 border rounded-lg flex items-center justify-between bg-green-50 border-green-200">
                                        <div className="flex items-center">
                                            {conn.provider === 'google' ? <GoogleIcon /> : <OutlookIcon />}
                                            <div>
                                                <p className="font-semibold">{conn.provider === 'google' ? "Google Calendar" : "Outlook Calendar"}</p>
                                                <p className="text-sm text-green-700">Connected successfully</p>
                                            </div>
                                        </div>
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="w-4 h-4 mr-2" />Disconnect
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Booking Page Settings */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Public Booking Page</CardTitle>
                        <CardDescription>Set up your public booking link for clients to schedule meetings with you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="booking-slug">Your Booking Link</Label>
                           <div className="flex items-center gap-2">
                               <span className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-l-md border border-r-0">effysales.pro/meet/</span>
                               <Input id="booking-slug" defaultValue="mahesh-pandey" className="rounded-l-none" />
                           </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meeting-duration">Default Meeting Duration</Label>
                             <Select defaultValue="30">
                                <SelectTrigger id="meeting-duration">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">60 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-4">
                            <h4 className="font-medium mb-3">Working Hours</h4>
                            <p className="text-sm text-slate-500">This feature is coming soon. You'll be able to set your availability for each day of the week.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <EditMeetingModal
                meeting={editingMeeting}
                open={!!editingMeeting}
                onOpenChange={(open) => !open && setEditingMeeting(null)}
                onSave={handleSaveMeeting}
            />

            <InviteModal
                meeting={invitingToMeeting}
                open={!!invitingToMeeting}
                onOpenChange={(open) => !open && setInvitingToMeeting(null)}
                onInvite={handleInviteToMeeting}
            />
        </div>
    );
}
