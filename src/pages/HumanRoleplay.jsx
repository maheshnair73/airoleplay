
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { RoleplaySession } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Send, Loader2, Info, UserCheck, Video, Mail, Copy, CheckCircle, Plus, ExternalLink, Briefcase, Target } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createMeetingLinks } from '@/api/functions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function HumanRoleplay() {
    const [lead, setLead] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [sessionData, setSessionData] = useState({
        prospect_player_email: '',
        rep_notes: '',
        prospect_notes: '',
        scheduled_for: ''
    });
    const [meetingPlatform, setMeetingPlatform] = useState('our_platform');
    const [meetingDetails, setMeetingDetails] = useState(null);
    const [inviteList, setInviteList] = useState([]);
    const [newInviteeEmail, setNewInviteeEmail] = useState('');
    const [scheduleOption, setScheduleOption] = useState('now');
    const [showAddColleagueDialog, setShowAddColleagueDialog] = useState(false);
    const [newColleague, setNewColleague] = useState({ email: '', name: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const leadId = urlParams.get('leadId');
                const scenario = urlParams.get('scenario');
                const scenarioTitle = urlParams.get('scenarioTitle');
                const referenceSubmissionId = urlParams.get('referenceSubmissionId');
                
                const [allUsers, userData] = await Promise.all([User.list(), User.me()]);
                
                setCurrentUser(userData);
                setUsers(allUsers.filter(u => u.email !== userData.email));

                let loadedLead;
                
                if (leadId) {
                    loadedLead = await Lead.get(leadId);
                } else if (scenario) {
                    const title = scenarioTitle || 'Pitch Library Practice';
                    loadedLead = {
                        id: 'pitch-practice-scenario',
                        company_name: 'Scenario Company',
                        contact_name: 'Practice Prospect',
                        contact_title: 'Decision Maker',
                        contact_email: 'prospect@scenario.com',
                        notes: decodeURIComponent(scenario),
                        industry: 'Various',
                        company_size: 'Mid-market',
                        status: 'Practice Session',
                        source: 'Pitch Library'
                    };
                } else {
                    loadedLead = {
                        id: 'generic-practice-scenario',
                        company_name: 'Practice Company Inc.',
                        contact_name: 'John Practice',
                        contact_title: 'VP of Operations',
                        contact_email: 'john@practice.com',
                        notes: 'General sales practice scenario. Practice your discovery questions and value proposition.',
                        industry: 'Technology',
                        company_size: '51-200',
                        status: 'Practice Session',
                        source: 'Generic Practice'
                    };
                }

                if (!loadedLead) {
                    throw new Error("Could not find the specified lead or scenario.");
                }

                setLead(loadedLead);

                // Calculate initial notes based on the loadedLead
                let initialRepNotes = `My Goals for this session:\n• Practice my opening pitch.\n• Effectively handle the '${loadedLead?.pain_points?.[0] || 'budget'}' objection.\n• Secure a follow-up meeting.`;
                let initialProspectNotes = `--- For Prospect Player ---\n• Act as ${loadedLead?.contact_name || 'Practice Prospect'}\n• You're busy and skeptical of sales pitches\n• Ask probing questions about value\n• Bring up budget/timing concerns\n• Be professional but challenging`;

                // Override for specific scenarios
                if (scenario) {
                     initialRepNotes = `Pitch Library Practice Session\n\nScenario: ${scenarioTitle || 'Pitch Library Practice'}\n\nReference Submission ID: ${referenceSubmissionId || 'N/A'}`;
                } else if (!leadId) { // Generic scenario
                     initialRepNotes = `Generic Practice Session\nThis is a general roleplay practice scenario.`;
                }
                
                setSessionData(prev => ({
                    ...prev,
                    rep_notes: initialRepNotes,
                    prospect_notes: initialProspectNotes,
                }));

            } catch (error) {
                console.error('HumanRoleplay: Error during initialization:', error);
                toast.error('Error setting up roleplay session. The lead may not exist or is inaccessible.');
                setLead(null); // Ensure error screen is shown
            }
            setIsLoading(false);
        };
        
        init();
    }, []);

    const handleCreateMeeting = async () => {
        if (!sessionData.prospect_player_email) {
            toast.error('Please select someone to play the prospect role first');
            return;
        }

        if (meetingPlatform === 'our_platform') {
            const publicSessionUrl = `${window.location.origin}${createPageUrl('PublicRoleplaySession')}?sessionId=new`;

            setMeetingDetails({
                platform: 'our_platform',
                meetingLink: publicSessionUrl
            });

            const prospectUser = users.find(u => u.email === sessionData.prospect_player_email);
            const initialInvites = [
                { email: currentUser.email, name: currentUser.full_name || currentUser.email, role: 'Sales Rep', status: 'accepted' },
                { email: sessionData.prospect_player_email, name: prospectUser?.full_name || sessionData.prospect_player_email, role: 'Prospect Player', status: 'pending' }
            ];
            setInviteList(initialInvites);
            toast.success('Session link created! You can now add more participants or start the session.');
            return;
        }

        setIsCreating(true);
        try {
            let meetingLink = '';

            switch(meetingPlatform) {
                case 'meet':
                    meetingLink = 'https://meet.google.com/new';
                    break;
                case 'zoom':
                    meetingLink = 'https://zoom.us/start/webmeeting';
                    break;
                case 'teams':
                    meetingLink = 'https://teams.microsoft.com/';
                    break;
                default:
                    meetingLink = '#';
            }

            const prospectUser = users.find(u => u.email === sessionData.prospect_player_email);

            setMeetingDetails({
                platform: meetingPlatform,
                meetingLink: meetingLink
            });

            const initialInvites = [
                { email: currentUser.email, name: currentUser.full_name || currentUser.email, role: 'Sales Rep', status: 'accepted' },
                { email: sessionData.prospect_player_email, name: prospectUser?.full_name || sessionData.prospect_player_email, role: 'Prospect Player', status: 'pending' }
            ];
            setInviteList(initialInvites);

            toast.success(`Meeting setup complete! Open ${meetingPlatform} and share the link with participants.`);
        } catch (error) {
            console.error('Error creating meeting:', error);
            toast.error(`Failed to create meeting: ${error.message || 'Unknown error'}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleSendInvite = (email) => {
        toast.success(`Invitation sent to ${email}`);
        setInviteList(prev => 
            prev.map(invite => 
                invite.email === email 
                    ? { ...invite, status: 'sent', sentAt: new Date().toISOString() }
                    : invite
            )
        );
    };

    const handleAddInvitee = () => {
        if (!newInviteeEmail) return;
        const newInvite = {
            email: newInviteeEmail,
            name: newInviteeEmail,
            role: 'Observer',
            status: 'pending'
        };
        setInviteList(prev => [...prev, newInvite]);
        setNewInviteeEmail('');
        toast.success('New participant added');
    };

    const handleAddNewColleague = () => {
        if (!newColleague.email || !newColleague.name) {
            toast.error('Please fill in all fields');
            return;
        }

        const colleagueUser = {
            id: `temp-${Date.now()}`,
            email: newColleague.email,
            full_name: newColleague.name,
            role: 'sales_agent'
        };

        setUsers(prev => [...prev, colleagueUser]);
        setSessionData({...sessionData, prospect_player_email: newColleague.email});
        setNewColleague({ email: '', name: '' });
        setShowAddColleagueDialog(false);
        toast.success('Colleague added successfully');
    };

    const handleCreateSession = async () => {
        if (!sessionData.prospect_player_email) {
            toast.error('Please select someone to play the prospect role');
            return;
        }
        if (!meetingDetails) {
            toast.error('Please create a meeting before starting the session.');
            return;
        }

        setIsCreating(true);
        try {
            const sessionPayload = {
                session_type: 'human_human',
                lead_id: lead.id,
                initiator_email: currentUser.email,
                prospect_player_email: sessionData.prospect_player_email,
                session_status: 'pending_invite',
                rep_notes: sessionData.rep_notes,
                prospect_notes: sessionData.prospect_notes,
                scheduled_for: scheduleOption === 'later' && sessionData.scheduled_for ? sessionData.scheduled_for : new Date().toISOString(),
                meeting_details: meetingDetails,
                invitee_list: inviteList
            };

            const session = await RoleplaySession.create(sessionPayload);
            
            toast.success('Roleplay session created! Participants have been notified.');
            navigate(createPageUrl(`RoleplaySession?sessionId=${session.id}`));
        } catch (error) {
            console.error('Error creating roleplay session:', error);
            toast.error(`Failed to create roleplay session: ${error.message}`);
        }
        setIsCreating(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="ml-3 text-slate-600">Setting up roleplay session...</p>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Unable to Load Practice Session</h2>
                <p className="text-slate-500 mb-4">We encountered an issue setting up your session. Please try again or go back.</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Setup Human Roleplay</h1>
                            <p className="text-slate-600">Practice your pitch with a colleague playing {lead.contact_name}</p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="prospect" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="prospect" className="flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            About Prospect
                        </TabsTrigger>
                        <TabsTrigger value="session" className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            Session Setup
                        </TabsTrigger>
                        <TabsTrigger value="meeting" className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Meeting Setup
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="prospect" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                                        {lead.contact_name?.charAt(0) || 'P'}
                                    </div>
                                    Prospect Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Company Name */}
                                    <div>
                                        <h5 className="font-medium text-slate-700 mb-1 flex items-center gap-2"><Briefcase className="w-4 h-4" />Company Name</h5>
                                        <p className="text-slate-600">{lead.company_name}</p>
                                    </div>
                                    {/* Contact Name */}
                                    <div>
                                        <h5 className="font-medium text-slate-700 mb-1 flex items-center gap-2"><UserCheck className="w-4 h-4" />Contact Name</h5>
                                        <p className="text-slate-600">{lead.contact_name}</p>
                                    </div>
                                    {/* Contact Title */}
                                    <div>
                                        <h5 className="font-medium text-slate-700 mb-1 flex items-center gap-2"><Target className="w-4 h-4" />Contact Title</h5>
                                        <p className="text-slate-600">{lead.contact_title}</p>
                                    </div>
                                    {/* Industry */}
                                    <div>
                                        <h5 className="font-medium text-slate-700 mb-1">Industry</h5>
                                        <p className="text-slate-600">{lead.industry}</p>
                                    </div>
                                    {/* Company Size */}
                                    <div>
                                        <h5 className="font-medium text-slate-700 mb-1">Company Size</h5>
                                        <p className="text-slate-600">{lead.company_size}</p>
                                    </div>
                                    {/* Status */}
                                    <div>
                                        <h5 className="font-medium text-slate-700 mb-1">Status</h5>
                                        <p className="text-slate-600">{lead.status}</p>
                                    </div>
                                </div>
                                {lead.notes && <div className="bg-slate-50 p-4 rounded-lg"><h5 className="font-medium text-slate-700 mb-2">Scenario Details</h5><p className="text-slate-600">{lead.notes}</p></div>}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="session" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Roleplay Session Setup</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Who will play the prospect?</label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={sessionData.prospect_player_email}
                                            onValueChange={(value) => {
                                                if (value === 'add_new') {
                                                    setShowAddColleagueDialog(true);
                                                } else {
                                                    setSessionData({...sessionData, prospect_player_email: value});
                                                }
                                            }}
                                            className="flex-1"
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select a colleague or manager..." /></SelectTrigger>
                                            <SelectContent>
                                                {users.map(user => (
                                                    <SelectItem key={user.id} value={user.email}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium">{(user.full_name || user.email).charAt(0).toUpperCase()}</div>
                                                            <span>{user.full_name || user.email}</span>
                                                            {user.role?.includes('admin') && <Badge variant="outline" className="text-xs">Manager</Badge>}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="add_new">
                                                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                                                        <Plus className="w-4 h-4" />
                                                        <span>Add New Colleague</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Dialog open={showAddColleagueDialog} onOpenChange={setShowAddColleagueDialog}>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Colleague</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label htmlFor="colleague-name">Full Name</Label>
                                                    <Input
                                                        id="colleague-name"
                                                        placeholder="John Doe"
                                                        value={newColleague.name}
                                                        onChange={(e) => setNewColleague({...newColleague, name: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="colleague-email">Email Address</Label>
                                                    <Input
                                                        id="colleague-email"
                                                        type="email"
                                                        placeholder="john@company.com"
                                                        value={newColleague.email}
                                                        onChange={(e) => setNewColleague({...newColleague, email: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="outline" onClick={() => setShowAddColleagueDialog(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleAddNewColleague}>
                                                    Add Colleague
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-600"/>Sales Rep Notes (Your Goals)</label>
                                        <Textarea
                                            placeholder="Your goals for this session..."
                                            value={sessionData.rep_notes}
                                            onChange={(e) => setSessionData({...sessionData, rep_notes: e.target.value})}
                                            rows={8}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-yellow-600"/>Prospect Player Notes (Their Instructions)</label>
                                        <Textarea
                                            placeholder="Instructions for the person playing the prospect..."
                                            value={sessionData.prospect_notes}
                                            onChange={(e) => setSessionData({...sessionData, prospect_notes: e.target.value})}
                                            rows={8}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">When to start?</label>
                                    <RadioGroup defaultValue="now" value={scheduleOption} onValueChange={setScheduleOption} className="flex gap-4 items-center">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="now" id="now" />
                                            <Label htmlFor="now">Start Now</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="later" id="later" />
                                            <Label htmlFor="later">Schedule for Later</Label>
                                        </div>
                                    </RadioGroup>
                                    {scheduleOption === 'later' && (
                                        <Input
                                            type="datetime-local"
                                            className="mt-3"
                                            value={sessionData.scheduled_for}
                                            onChange={(e) => setSessionData({...sessionData, scheduled_for: e.target.value})}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="meeting" className="mt-6">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Choose Meeting Platform</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <Button variant={meetingPlatform === 'our_platform' ? 'default' : 'outline'} onClick={() => setMeetingPlatform('our_platform')} className="h-20 flex flex-col gap-2"><Video className="w-6 h-6" />Our Platform</Button>
                                        <Button variant={meetingPlatform === 'meet' ? 'default' : 'outline'} onClick={() => setMeetingPlatform('meet')} className="h-20 flex flex-col gap-2"><ExternalLink className="w-6 h-6" />Google Meet</Button>
                                        <Button variant={meetingPlatform === 'zoom' ? 'default' : 'outline'} onClick={() => setMeetingPlatform('zoom')} className="h-20 flex flex-col gap-2"><ExternalLink className="w-6 h-6" />Zoom</Button>
                                        <Button variant={meetingPlatform === 'teams' ? 'default' : 'outline'} onClick={() => setMeetingPlatform('teams')} className="h-20 flex flex-col gap-2"><ExternalLink className="w-6 h-6" />Teams</Button>
                                    </div>
                                    
                                    <Button onClick={handleCreateMeeting} disabled={isCreating || !sessionData.prospect_player_email} className="w-full">
                                        {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Meeting...</> : <><Video className="w-4 h-4 mr-2" />Create {meetingPlatform === 'our_platform' ? 'Session' : `${meetingPlatform} Meeting`}</>}
                                    </Button>
                                </CardContent>
                            </Card>

                            {meetingDetails && (
                                <Card>
                                    <CardHeader><CardTitle>Meeting Details & Participants</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-green-600" /><span className="font-medium text-green-800">{meetingPlatform === 'our_platform' ? 'Session Ready' : 'Meeting Created'}</span></div>
                                            <div className="flex items-center gap-2"><Input value={meetingDetails.meetingLink} readOnly className="bg-white text-sm" /><Button variant="outline" size="sm" onClick={() => copyToClipboard(meetingDetails.meetingLink)}><Copy className="w-4 h-4" /></Button></div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-3">Participants</h4>
                                            <div className="space-y-2">
                                                {inviteList.map((invite, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium">{invite.name.charAt(0).toUpperCase()}</div>
                                                            <div><p className="font-medium">{invite.name}</p><p className="text-xs text-slate-500">{invite.email} • {invite.role}</p></div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={invite.status === 'accepted' ? 'default' : invite.status === 'sent' ? 'secondary' : 'outline'}>{invite.status}</Badge>
                                                            {invite.status !== 'accepted' && <Button size="sm" variant="outline" onClick={() => handleSendInvite(invite.email)}><Mail className="w-3 h-3 mr-1" />{invite.status === 'sent' ? 'Resend' : 'Send'} Invite</Button>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <Input placeholder="Add new participant email..." value={newInviteeEmail} onChange={(e) => setNewInviteeEmail(e.target.value)} />
                                                <Button onClick={handleAddInvitee} disabled={!newInviteeEmail}><Plus className="w-4 h-4 mr-1" />Add</Button>
                                            </div>
                                        </div>

                                        <Button onClick={handleCreateSession} disabled={isCreating} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                                            {isCreating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating Session...</> : <><Send className="w-5 h-5 mr-2" />Start Roleplay Session</>}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
