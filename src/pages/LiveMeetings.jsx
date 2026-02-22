
import React, { useState, useEffect } from 'react';
import { Meeting } from '@/api/entities';
import { User } from '@/api/entities'; // Preserving User import as per functionality preservation
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Video, CheckCircle, Clock, Users, Calendar, Link as LinkIcon } from 'lucide-react'; // Updated lucide-react imports
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import MeetingDetailSheet from '@/components/meetings/MeetingDetailSheet';
import RescheduleModal from '@/components/meetings/RescheduleModal'; // New import
import InviteModal from '@/components/meetings/InviteModal'; // New import

const IntegrationCard = ({ platform, icon, isConnected, onConnect }) => (
    <Card className="bg-white"> {/* Removed hover:shadow-md transition-shadow */}
        <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-4 rounded-lg flex items-center justify-center bg-slate-100">{icon}</div>
            <h3 className="font-semibold text-slate-800 mb-2">{platform}</h3>
            {isConnected ? (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1"> {/* Updated Badge class */}
                    <CheckCircle className="w-3 h-3" />Connected
                </Badge>
            ) : (
                <Button variant="outline" size="sm" onClick={() => onConnect(platform)}>
                    Connect
                </Button>
            )}
        </CardContent>
    </Card>
);

const MeetingItem = ({ meeting, onSelectMeeting }) => {
    const isCompleted = meeting.status === 'completed';
    const platformIcons = {
        'Google Meet': <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/685a423a286492bdf63ba047/a90657ade_7089160_google_meet_icon.png" alt="Google Meet" className="w-6 h-6" />,
        'Microsoft Teams': <img src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg" className="w-6 h-6" alt="Microsoft Teams" />,
        'Zoom': <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/685a423a286492bdf63ba047/49b95b275_7693297_zoom_socialmedia_meeting_logo_apps_icon.png" alt="Zoom" className="w-6 h-6" />,
    };

    // Format duration from seconds to readable format
    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        let result = [];
        if (hours > 0) {
            result.push(`${hours}h`);
        }
        if (minutes > 0 || (hours === 0 && seconds > 0)) { // Show minutes even if 0 if there are no hours, but only if seconds exist
            result.push(`${minutes}m`);
        }
        if (result.length === 0 && seconds === 0) { // Handle case where duration is 0
            return '0m';
        }
        return result.join(' ');
    };

    return (
        <Card
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-500"
            onClick={() => onSelectMeeting(meeting)}
        >
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                             {platformIcons[meeting.platform] || <Video className="w-6 h-6 text-slate-400" />}
                            <h4 className="font-semibold text-slate-800 text-lg">{meeting.title}</h4>
                        </div>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1 pl-9">
                            {isCompleted ? (
                                <>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-slate-400" /> 
                                        {format(new Date(meeting.scheduled_at), 'PPP')}
                                    </span>
                                    {meeting.call_duration ? (
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-slate-400" /> 
                                            Duration: {formatDuration(meeting.call_duration)}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-slate-400" /> 
                                            {format(new Date(meeting.scheduled_at), 'p')}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-slate-400" /> 
                                    {format(new Date(meeting.scheduled_at), 'PPp')}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-slate-400" /> 
                                {meeting.participants?.length || 0} participants
                            </span>
                        </div>
                    </div>
                    <div className="flex-shrink-0 self-center sm:self-auto">
                         {isCompleted && meeting.call_record_id ? (
                             <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                                <Link to={createPageUrl(`CallAnalysis?id=${meeting.call_record_id}&back=LiveMeetings`)}>View Analysis</Link>
                            </Button>
                        ) : isCompleted ? (
                             <Badge variant="secondary">Processing...</Badge>
                        ) : (
                             <Badge>Upcoming</Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function LiveMeetings() {
    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [user, setUser] = useState(null);

    // New states for modals
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [meetingToActOn, setMeetingToActOn] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Get current user
                const currentUser = await User.me();
                setUser(currentUser); // Set user state

                // Try to fetch meetings, if none exist, create demo data
                let meetingsData = await Meeting.list('-scheduled_at');
                if (meetingsData.length === 0) {
                    const defaultEmail = currentUser?.email || 'demo@effysales.pro';
                    // Create demo meetings without invalid call_record_id references
                    meetingsData = [
                        {
                            id: 'demo_meeting_1',
                            title: 'Discovery Call with Globex Corp',
                            platform: 'Google Meet',
                            status: 'upcoming',
                            scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                            participants: ['john.doe@globexcorp.com', defaultEmail],
                            created_by: defaultEmail
                        },
                        {
                            id: 'demo_meeting_2',
                            title: 'Project Kick-off with Apex Corp',
                            platform: 'Microsoft Teams',
                            status: 'upcoming',
                            scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
                            participants: ['sarah.smith@apexcorp.com', 'mike.johnson@apexcorp.com', defaultEmail],
                            created_by: defaultEmail
                        },
                        {
                            id: 'demo_meeting_3',
                            title: 'Product Demo - StartupXYZ',
                            platform: 'Zoom',
                            status: 'completed',
                            scheduled_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
                            participants: ['founder@startupxyz.com', defaultEmail],
                            created_by: defaultEmail,
                            call_record_id: 'demo_call_001', // This will create mock data in CallAnalysis
                            call_duration: 1800 // 30 minutes
                        }
                    ];
                }
                setMeetings(meetingsData);
            } catch (error) {
                console.error("Failed to fetch meetings:", error);
                toast.error("Failed to load meeting data.");
                // Set demo data even on error
                const defaultEmail = user?.email || 'demo@effysales.pro';
                setMeetings([
                    {
                        id: 'demo_meeting_1',
                        title: 'Discovery Call with Globex Corp',
                        platform: 'Google Meet',
                        status: 'upcoming',
                        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        participants: ['john.doe@globexcorp.com', defaultEmail],
                        created_by: defaultEmail
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user?.email]); // Dependency added to re-fetch if user email changes (e.g. after login)

    const handleConnect = (platform) => {
        let message, description;

        switch (platform) {
            case 'Google Calendar':
                message = "Google Calendar Integration";
                description = "This would redirect you to Google OAuth to grant calendar access. The effyMeeting Assistant would then automatically sync with your calendar events.";
                break;
            case 'Google Meet':
                message = "Google Meet Integration";
                description = "This requires Google Workspace admin approval to install the effyMeeting Assistant. The bot would automatically join Google Meet calls when invited.";
                break;
            case 'Microsoft Teams':
                message = "Microsoft Teams Integration";
                description = "This requires Microsoft 365 admin approval to install the effyMeeting Assistant Teams App. The bot would join Teams meetings when added as a participant.";
                break;
            case 'Zoom':
                message = "Zoom Integration";
                description = "This would connect to Zoom's API. The effyMeeting Assistant would join Zoom meetings when the bot email (bot@effysales.pro) is invited.";
                break;
            default:
                message = `${platform} Integration`;
                description = "Integration setup would be configured here.";
        }

        toast.info(message, {
            description: description,
            duration: 6000,
        });
    };

    const upcomingMeetings = meetings.filter(m => m.status === 'upcoming');
    const pastMeetings = meetings.filter(m => m.status === 'completed' || m.status === 'cancelled');

    // Handlers for new modals
    const handleReschedule = (meeting) => {
        setMeetingToActOn(meeting);
        setShowRescheduleModal(true);
    };

    const handleInvite = (meeting) => {
        setMeetingToActOn(meeting);
        setShowInviteModal(true);
    };

    return (
        <div className="p-6 md:p-10 bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900">effyMeeting Assistant</h1>
                </div>
                <p className="text-slate-600 max-w-3xl">Connect your calendar to have the effyMeeting Assistant join, record, and analyze your sales meetings on Zoom, Google Meet, and Microsoft Teams.</p>
            </header>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-xl bg-slate-200">
                    <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
                    <TabsTrigger value="past">Past Meetings</TabsTrigger>
                    <TabsTrigger value="apps">Connected Apps (2)</TabsTrigger>
                </TabsList>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mt-6">
                    <CardContent className="p-0">
                        <TabsContent value="upcoming" className="p-6 space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                                </div>
                            ) : upcomingMeetings.length > 0 ? (
                                <div className="grid gap-4">
                                    {upcomingMeetings.map(meeting => (
                                        <MeetingItem
                                            key={meeting.id}
                                            meeting={meeting}
                                            onSelectMeeting={setSelectedMeeting}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                    <p className="text-lg font-medium mb-2">No upcoming meetings</p>
                                    <p className="text-sm">Your scheduled meetings will appear here.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="past" className="p-6 space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                                </div>
                            ) : pastMeetings.length > 0 ? (
                                <div className="grid gap-4">
                                    {pastMeetings.map(meeting => (
                                        <MeetingItem
                                            key={meeting.id}
                                            meeting={meeting}
                                            onSelectMeeting={setSelectedMeeting}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                    <p className="text-lg font-medium mb-2">No past meetings</p>
                                    <p className="text-sm">Completed meetings with analysis will appear here.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="apps" className="m-0 p-6">
                            <div className="space-y-8">
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardHeader>
                                        <CardTitle className="text-blue-800">How It Works</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-blue-700 space-y-2 text-sm">
                                        <p>1. Connect your Google Calendar and grant permissions.</p>
                                        <p>2. For any meeting in your calendar, the effyMeeting Assistant will automatically join as a silent notetaker.</p>
                                        <p>3. After the meeting, the recording, transcript, and AI analysis will appear in your "Past Meetings" tab and on the corresponding lead's page.</p>
                                        <p>4. You can also manually invite the assistant by adding <strong className="font-semibold">bot@effybiz.com</strong> to any calendar invite.</p> {/* Updated email address */}
                                    </CardContent>
                                </Card>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Manage Connections</h3>
                                    <p className="text-slate-600 mb-6 text-sm">Allow the effyMeeting Assistant to join your meetings by connecting your calendar and meeting platforms.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <IntegrationCard
                                            platform="Google Calendar"
                                            icon={<img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-8 h-8" alt="Google Calendar logo" />}
                                            isConnected={true}
                                            onConnect={handleConnect}
                                        />
                                        <IntegrationCard
                                            platform="Zoom"
                                            icon={<img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/685a423a286492bdf63ba047/49b95b275_7693297_zoom_socialmedia_meeting_logo_apps_icon.png" className="w-8 h-8" alt="Zoom logo" />}
                                            isConnected={true}
                                            onConnect={handleConnect}
                                        />
                                        <IntegrationCard
                                            platform="Google Meet"
                                            icon={<img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/685a423a286492bdf63ba047/a90657ade_7089160_google_meet_icon.png" className="w-8 h-8" alt="Google Meet logo" />}
                                            isConnected={false}
                                            onConnect={handleConnect}
                                        />
                                        <IntegrationCard
                                            platform="Microsoft Teams"
                                            icon={<img src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg" className="w-8 h-8" alt="Microsoft Teams logo" />}
                                            isConnected={false}
                                            onConnect={handleConnect}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
            <MeetingDetailSheet
                isOpen={!!selectedMeeting}
                onClose={() => setSelectedMeeting(null)}
                meeting={selectedMeeting}
                currentUser={user}
                onReschedule={handleReschedule} // Added handler to sheet
                onInvite={handleInvite} // Added handler to sheet
            />
            {/* New Modals */}
            <RescheduleModal
                isOpen={showRescheduleModal}
                onClose={() => setShowRescheduleModal(false)}
                meeting={meetingToActOn}
                // Add any necessary reschedule logic here, e.g., onRescheduleSubmit
            />
            <InviteModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                meeting={meetingToActOn}
                // Add any necessary invite logic here, e.g., onInviteSubmit
            />
        </div>
    );
}
