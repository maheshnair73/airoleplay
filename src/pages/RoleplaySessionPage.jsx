import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleplaySession } from '@/api/entities';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Play, Square, Mic, MicOff, Video, VideoOff, Clock, CheckCircle, User as UserIcon, Building, Briefcase, Target, Lightbulb, Check } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function RoleplaySessionPage() {
    const [session, setSession] = useState(null);
    const [lead, setLead] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionActive, setSessionActive] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [sessionComplete, setSessionComplete] = useState(false);
    
    // New state for readiness
    const [participantStatus, setParticipantStatus] = useState({ initiator_ready: false, prospect_player_ready: false });
    const [isCurrentUserReady, setIsCurrentUserReady] = useState(false);
    
    const navigate = useNavigate();

    const isInitiator = currentUser?.email === session?.initiator_email;
    const userRole = isInitiator ? 'Sales Rep' : 'Prospect Player';
    const otherUserEmail = isInitiator ? session?.prospect_player_email : session?.initiator_email;

    const fetchSessionData = useCallback(async (sessionId) => {
        try {
            const sessionData = await RoleplaySession.get(sessionId);
            setSession(sessionData);
            setParticipantStatus(sessionData.participant_status || { initiator_ready: false, prospect_player_ready: false });
            if (sessionData.session_status === 'completed') {
                setSessionComplete(true);
            }
            if (sessionData.session_status === 'active') {
                setSessionActive(true);
            }
        } catch (error) {
            console.error('Error polling session data:', error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const sessionId = urlParams.get('sessionId');
                
                if (sessionId) {
                    const [sessionData, userData] = await Promise.all([
                        RoleplaySession.get(sessionId),
                        User.me()
                    ]);
                    
                    setSession(sessionData);
                    setCurrentUser(userData);
                    setParticipantStatus(sessionData.participant_status || { initiator_ready: false, prospect_player_ready: false });
                    
                    if (sessionData.lead_id) {
                        const leadData = await Lead.get(sessionData.lead_id);
                        setLead(leadData);
                    }
                    
                    if (sessionData.session_status === 'completed') {
                        setSessionComplete(true);
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

    // Polling for readiness status
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('sessionId');
        if (sessionId && !sessionActive && !sessionComplete) {
            const interval = setInterval(() => {
                fetchSessionData(sessionId);
            }, 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [sessionActive, sessionComplete, fetchSessionData]);

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

    const handleReadyClick = async () => {
        if (!session || !currentUser) return;
        
        const isInitiatorClick = currentUser.email === session.initiator_email;
        const newStatus = { ...participantStatus };
        
        if (isInitiatorClick) {
            newStatus.initiator_ready = true;
        } else {
            newStatus.prospect_player_ready = true;
        }

        try {
            await RoleplaySession.update(session.id, { participant_status: newStatus });
            setParticipantStatus(newStatus);
            setIsCurrentUserReady(true);
            toast.success("You are marked as ready!");
        } catch (error) {
            console.error('Error setting ready status:', error);
            toast.error("Could not mark as ready.");
        }
    };

    const handleStartSession = async () => {
        try {
            await RoleplaySession.update(session.id, {
                session_status: 'active'
            });
            setSessionActive(true);
            toast.success('Roleplay session started!');
        } catch (error) {
            console.error('Error starting session:', error);
            toast.error('Failed to start session');
        }
    };

    const handleEndSession = async () => {
        try {
            await RoleplaySession.update(session.id, {
                session_status: 'completed',
                session_duration: sessionTime
            });
            setSessionActive(false);
            setSessionComplete(true);
            toast.success('Session completed!');
        } catch (error) {
            console.error('Error ending session:', error);
            toast.error('Failed to end session');
        }
    };

    const handleSubmitFeedback = async () => {
        // ... implementation needed ...
        toast.info("Feedback submission is not yet implemented.");
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!session || !lead) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold">Session not found</h2>
                <Button onClick={() => navigate(createPageUrl('Leads'))} className="mt-4">
                    Back to Leads
                </Button>
            </div>
        );
    }

    const bothUsersReady = participantStatus.initiator_ready && participantStatus.prospect_player_ready;
    const otherUserIsReady = isInitiator ? participantStatus.prospect_player_ready : participantStatus.initiator_ready;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(createPageUrl('Leads'))}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Leads
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-3">
                                        <Users className="w-6 h-6 text-blue-600" />
                                        Human-to-Human Roleplay
                                    </span>
                                    {sessionActive && (
                                        <Badge variant="destructive" className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> {formatTime(sessionTime)}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!sessionActive && !sessionComplete ? (
                                    <div className="text-center space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="p-4 border rounded-lg bg-white">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <UserIcon className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">You ({userRole})</p>
                                                        <p className="text-sm text-slate-500">{currentUser.full_name}</p>
                                                    </div>
                                                </div>
                                                <Button onClick={handleReadyClick} disabled={isCurrentUserReady} className="w-full">
                                                    <Check className="w-4 h-4 mr-2" />
                                                    {isCurrentUserReady ? "You are Ready" : "I'm Ready"}
                                                </Button>
                                            </div>
                                            
                                            <div className="p-4 border rounded-lg bg-white">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                        <UserIcon className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{isInitiator ? 'Prospect Player' : 'Sales Rep'}</p>
                                                        <p className="text-sm text-slate-500">{otherUserEmail}</p>
                                                    </div>
                                                </div>
                                                {otherUserIsReady ? (
                                                  <Badge className="w-full justify-center py-2 bg-green-100 text-green-800">Ready</Badge>
                                                ) : (
                                                  <Badge className="w-full justify-center py-2 bg-yellow-100 text-yellow-800">Waiting for user...</Badge>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            onClick={handleStartSession}
                                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                                            size="lg"
                                            disabled={!bothUsersReady}
                                        >
                                            <Play className="w-5 h-5 mr-2" />
                                            {bothUsersReady ? "Start Roleplay Session" : "Waiting for both users to be ready"}
                                        </Button>
                                        
                                        {!bothUsersReady && <p className="text-sm text-slate-500">
                                            The session will begin once both participants are ready.
                                        </p>}
                                    </div>
                                ) : sessionActive ? (
                                    <div className="text-center space-y-6">
                                        <div className="flex justify-center items-center gap-6 text-lg font-semibold text-slate-700">
                                            <div className="flex items-center gap-2">
                                                <Mic className="w-5 h-5 text-red-500 animate-pulse" />
                                                <span>Session is live and being recorded...</span>
                                            </div>
                                        </div>
                                        <Button onClick={handleEndSession} variant="destructive" size="lg">
                                            <Square className="w-5 h-5 mr-2" />
                                            End Session
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-green-600 mb-2">Session Complete!</h3>
                                        <p className="text-slate-600 mb-4">Provide your feedback to complete the process.</p>
                                        <Textarea 
                                            placeholder={`Provide feedback for ${isInitiator ? 'the prospect player' : 'the sales rep'}...`}
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            className="min-h-[120px] mb-4"
                                        />
                                        <Button onClick={handleSubmitFeedback} size="lg">
                                            Submit Feedback
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="lg:sticky lg:top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-600" />
                                Prospect Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-800 flex items-center gap-2"><UserIcon className="w-4 h-4 text-slate-500"/>{lead.contact_name}</h4>
                                <p className="text-sm text-slate-600">{lead.contact_title}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 flex items-center gap-2"><Building className="w-4 h-4 text-slate-500"/>{lead.company_name}</h4>
                                <p className="text-sm text-slate-600">{lead.company_industry}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 flex items-center gap-2"><Target className="w-4 h-4 text-slate-500"/>Key Pain Points</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {lead.company_pain_points?.split(',').map((point, i) => (
                                        <Badge key={i} variant="outline">{point.trim()}</Badge>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-slate-800 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-slate-500"/>Session Goal</h4>
                                <p className="text-sm text-slate-600 mt-1">{session.session_notes || "Practice initial outreach and discovery."}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}