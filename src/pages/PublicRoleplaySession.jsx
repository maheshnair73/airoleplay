import React, { useState, useEffect, useRef } from 'react';
import { RoleplaySession } from '@/api/entities';
import { Lead } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Play, Square, Mic, MicOff, Video, VideoOff, Phone, CheckCircle, User as UserIcon, Building, Briefcase, Target, Lightbulb, FileText } from 'lucide-react';
import { toast } from 'sonner';
import VideoCallIntegration from '@/components/roleplay/VideoCallIntegration';

export default function PublicRoleplaySessionPage() {
    const [session, setSession] = useState(null);
    const [lead, setLead] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionActive, setSessionActive] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [sessionComplete, setSessionComplete] = useState(false);
    const [participantName, setParticipantName] = useState('');
    const [participantEmail, setParticipantEmail] = useState('');
    const [isJoined, setIsJoined] = useState(false);

    const extractLeadFromSessionNotes = (notes) => {
        return null; 
    };

    const createFallbackLead = (leadIdentifier) => {
        return {
            id: leadIdentifier,
            company_name: 'Practice Company',
            contact_name: 'Practice Prospect',
            contact_title: 'Decision Maker',
            notes: 'Practice roleplay scenario.',
        };
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const sessionId = urlParams.get('sessionId');
                
                if (!sessionId) {
                    toast.error('No session ID provided');
                    setIsLoading(false);
                    return;
                }

                // For public access, we'll create a temporary session data
                if (sessionId === 'new') {
                    const tempSession = {
                        id: 'new',
                        session_type: 'human_human',
                        lead_id: 'temp-lead',
                        initiator_email: 'host@example.com',
                        session_status: 'pending_invite',
                        rep_notes: 'Practice your sales pitch in this roleplay session.',
                        prospect_notes: 'You are playing the role of a prospect. Be professional but challenging.',
                        meeting_details: {
                            platform: 'our_platform',
                            meetingLink: window.location.href
                        }
                    };
                    
                    const tempLead = createFallbackLead('temp-lead');
                    
                    setSession(tempSession);
                    setLead(tempLead);
                } else {
                    // Try to load the actual session (this might fail for public access)
                    try {
                        const sessionData = await RoleplaySession.get(sessionId);
                        setSession(sessionData);

                        const isPracticeScenario = sessionData.lead_id?.includes('practice-scenario');
                        
                        let leadData;
                        if (isPracticeScenario) {
                            leadData = extractLeadFromSessionNotes(sessionData.rep_notes) || createFallbackLead(sessionData.lead_id);
                        } else {
                            try {
                                leadData = await Lead.get(sessionData.lead_id);
                            } catch (e) {
                                leadData = createFallbackLead(sessionData.lead_id);
                            }
                        }
                        setLead(leadData);
                        
                        if (sessionData.session_status === 'active') {
                            setSessionActive(true);
                        } else if (sessionData.session_status === 'completed') {
                            setSessionComplete(true);
                        }
                    } catch (error) {
                        console.error('Error loading session:', error);
                        // Create fallback data for public access
                        const fallbackSession = {
                            id: sessionId,
                            session_type: 'human_human',
                            lead_id: 'public-session',
                            session_status: 'pending_invite',
                            rep_notes: 'Welcome to the roleplay session. This is a practice sales call scenario.',
                            prospect_notes: 'You are playing the role of a potential customer. Be professional but ask challenging questions.'
                        };
                        const fallbackLead = createFallbackLead('public-session');
                        
                        setSession(fallbackSession);
                        setLead(fallbackLead);
                    }
                }
                
            } catch (error) {
                console.error('Error loading session:', error);
                toast.error('Failed to load roleplay session');
            }
            setIsLoading(false);
        };
        
        init();
    }, []);

    useEffect(() => {
        let interval;
        if (sessionActive) {
            interval = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleJoinSession = () => {
        if (!participantName.trim() || !participantEmail.trim()) {
            toast.error('Please enter your name and email to join');
            return;
        }
        setCurrentUser({ full_name: participantName, email: participantEmail });
        setIsJoined(true);
        toast.success('Welcome to the roleplay session!');
    };

    const handleStartSession = () => {
        setSessionActive(true);
        toast.success('Roleplay session started!');
    };

    const handleEndSession = () => {
        setSessionActive(false);
        setSessionComplete(true);
        toast.success('Session completed!');
    };

    const handleSubmitFeedback = () => {
        toast.success('Thank you for your feedback!');
        window.close(); // Close the window/tab
    };

    if (isLoading || !session || !lead) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-slate-600">Loading session...</p>
            </div>
        );
    }

    // Show join form if not joined yet
    if (!isJoined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Join Roleplay Session</CardTitle>
                        <p className="text-slate-600">You've been invited to participate in a sales roleplay session</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Your Name</label>
                            <Input
                                placeholder="Enter your full name"
                                value={participantName}
                                onChange={(e) => setParticipantName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Your Email</label>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={participantEmail}
                                onChange={(e) => setParticipantEmail(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleJoinSession} className="w-full bg-green-600 hover:bg-green-700">
                            Join Session
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isInitiator = currentUser.email === session.initiator_email;
    const userRole = isInitiator ? 'Sales Rep' : 'Prospect Player';
    const userNotes = isInitiator ? session.rep_notes : session.prospect_notes;
    const userNotesTitle = isInitiator ? "Your Goals & Notes" : "Your Persona & Instructions";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Human Roleplay Session</h1>
                            <p className="text-slate-600">Practice with {lead.contact_name} from {lead.company_name}</p>
                        </div>
                        <div className="ml-auto">
                            <Badge className={`px-4 py-2 text-sm ${ 
                                session.session_status === 'active' ? 'bg-green-100 text-green-800' : 
                                session.session_status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800' 
                            }`}>
                                {session.session_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Session Controls</span>
                                    {sessionActive && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                            <span className="text-lg font-mono">{formatTime(sessionTime)}</span>
                                        </div>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!sessionActive && !sessionComplete ? (
                                    <div className="text-center space-y-4">
                                        <div className="bg-blue-50 p-6 rounded-lg">
                                            <h3 className="font-semibold text-blue-800 mb-2">Ready to Start?</h3>
                                            <p className="text-blue-700 mb-4">Welcome, {currentUser.full_name}! You are playing the role of: <strong>{userRole}</strong></p>
                                        </div>
                                        <Button onClick={handleStartSession} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3" size="lg">
                                            <Play className="w-5 h-5 mr-2" />
                                            Start Roleplay Session
                                        </Button>
                                    </div>
                                ) : sessionActive ? (
                                    <div className="text-center space-y-4">
                                        <div className="bg-green-50 p-6 rounded-lg">
                                            <h3 className="font-semibold text-green-800 mb-2">Session Active</h3>
                                            <p className="text-green-700">You are in a live roleplay session.</p>
                                        </div>
                                        <VideoCallIntegration 
                                            session={session} 
                                            currentUser={currentUser} 
                                            isInitiator={isInitiator} 
                                        />
                                        <Button onClick={handleEndSession} variant="destructive" size="lg">
                                            <Square className="w-5 h-5 mr-2" />
                                            End Session
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <div className="bg-blue-50 p-6 rounded-lg">
                                            <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                            <h3 className="font-semibold text-blue-800 mb-2">Session Completed</h3>
                                            <p className="text-blue-700">Duration: {formatTime(session.session_duration || sessionTime)}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    {isInitiator ? 'Your Feedback on the Session' : 'Feedback for the Sales Rep'}
                                                </label>
                                                <Textarea
                                                    placeholder="Share your thoughts..."
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    rows={4}
                                                />
                                            </div>
                                            <Button onClick={handleSubmitFeedback} className="w-full" disabled={!feedback.trim()}>
                                                Submit Feedback
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                                        {lead.contact_name?.charAt(0) || 'L'}
                                    </div>
                                    Prospect Context
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-800">{lead.contact_name}</h4>
                                    <p className="text-slate-600">{lead.contact_title}</p>
                                    <p className="text-slate-500 text-sm">{lead.company_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">{lead.industry || 'Unknown Industry'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">{lead.company_size || 'Unknown Size'}</span>
                                    </div>
                                </div>
                                {lead.notes && (
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-sm text-slate-700 mb-1">Background Notes</h5>
                                        <p className="text-sm text-slate-600">{lead.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {userNotes && (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        {isInitiator ? (
                                            <Briefcase className="w-5 h-5 text-blue-600"/>
                                        ) : (
                                            <Target className="w-5 h-5 text-yellow-600"/>
                                        )}
                                        {userNotesTitle}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{userNotes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}