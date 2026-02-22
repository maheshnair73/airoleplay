import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleplaySession } from '@/api/entities';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Play, Square, Mic, MicOff, Video, VideoOff, Phone, CheckCircle, User as UserIcon, Building, Briefcase, Target, Lightbulb, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import VideoCallIntegration from '@/components/roleplay/VideoCallIntegration';
import CallTranscription from '@/components/roleplay/CallTranscription';
import { createDemoTranscription } from '@/utils/transcriptionDemo';

export default function RoleplaySessionPage() {
    const [session, setSession] = useState(null);
    const [lead, setLead] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionActive, setSessionActive] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [sessionComplete, setSessionComplete] = useState(false);
    const navigate = useNavigate();

    const extractLeadFromSessionNotes = (notes) => {
        // This helper might not be needed if lead_id is always present
        // but it's a good fallback.
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

                const [userData, sessionData] = await Promise.all([
                    User.me(),
                    RoleplaySession.get(sessionId)
                ]);

                setCurrentUser(userData);
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

    const handleStartSession = async () => {
        try {
            await RoleplaySession.update(session.id, { session_status: 'active' });
            setSession(prev => ({...prev, session_status: 'active'}));
            setSessionActive(true);
            toast.success('Roleplay session started!');
        } catch (error) {
            toast.error('Failed to start session');
        }
    };

    const handleEndSession = async () => {
        try {
            await RoleplaySession.update(session.id, {
                session_status: 'completed',
                session_duration: sessionTime
            });
            setSession(prev => ({
                ...prev,
                session_status: 'completed',
                session_duration: sessionTime
            }));
            setSessionActive(false);
            setSessionComplete(true);
            toast.success('Session completed! You can now view the transcription tab and provide feedback.');
        } catch (error) {
            console.error('Error ending session:', error);
            toast.error('Failed to end session');
        }
    };

    const handleSubmitFeedback = async () => {
        try {
            const isInitiator = currentUser.email === session.initiator_email;
            const feedbackKey = isInitiator ? 'self_assessment' : 'peer_feedback';
            
            await RoleplaySession.update(session.id, {
                feedback: {
                    ...(session.feedback || {}),
                    [feedbackKey]: feedback
                }
            });
            
            toast.success('Feedback submitted!');
            navigate(createPageUrl('CoachingHub'));
        } catch (error) {
            toast.error('Failed to submit feedback');
        }
    };

    if (isLoading || !session || !lead || !currentUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-slate-600">Loading session...</p>
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
                    <Button variant="ghost" onClick={() => navigate(createPageUrl('CoachingHub'))} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />Back to Coaching Hub
                    </Button>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center"><Users className="w-8 h-8 text-white" /></div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Human Roleplay Session</h1>
                            <p className="text-slate-600">Practice with {lead.contact_name} from {lead.company_name}</p>
                        </div>
                        <div className="ml-auto">
                            <Badge className={`px-4 py-2 text-sm ${ session.session_status === 'active' ? 'bg-green-100 text-green-800' : session.session_status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800' }`}>
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
                                    {sessionActive && <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div><span className="text-lg font-mono">{formatTime(sessionTime)}</span></div>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!sessionActive && !sessionComplete ? (
                                    <div className="text-center space-y-4">
                                        {/* ... Waiting to start UI ... */}
                                        <Button onClick={handleStartSession} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3" size="lg"><Play className="w-5 h-5 mr-2" />Start Roleplay Session</Button>
                                    </div>
                                ) : sessionActive ? (
                                    <div className="text-center space-y-4">
                                        <div className="bg-green-50 p-6 rounded-lg"><h3 className="font-semibold text-green-800 mb-2">Session Active</h3><p className="text-green-700">You are in a live roleplay session. The session is being recorded.</p></div>
                                        <VideoCallIntegration session={session} currentUser={currentUser} isInitiator={isInitiator} />
                                        <Button onClick={handleEndSession} variant="destructive" size="lg"><Square className="w-5 h-5 mr-2" />End Session</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 p-6 rounded-lg text-center">
                                            <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                                            <h3 className="font-semibold text-blue-800 mb-2">Session Completed</h3>
                                            <p className="text-blue-700">Duration: {formatTime(session.session_duration || sessionTime)}</p>
                                        </div>

                                        <Tabs defaultValue="transcription" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="feedback" className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Feedback
                                                </TabsTrigger>
                                                <TabsTrigger value="transcription" className="flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4" />
                                                    Transcription
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="feedback" className="mt-4 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        {isInitiator ? 'Your Feedback on the Session' : 'Feedback for the Sales Rep'}
                                                    </label>
                                                    <Textarea
                                                        placeholder="Share your thoughts..."
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                        rows={6}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleSubmitFeedback}
                                                    className="w-full"
                                                    disabled={!feedback.trim()}
                                                >
                                                    Submit Feedback
                                                </Button>
                                            </TabsContent>

                                            <TabsContent value="transcription" className="mt-4">
                                                <CallTranscription
                                                    sessionId={session.id}
                                                    videoUrl={session.recording_url}
                                                />
                                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <p className="text-sm text-amber-800 mb-2">
                                                        <strong>Demo Mode:</strong> Click below to generate sample transcription data for testing
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                await createDemoTranscription(session.id);
                                                                toast.success('Demo transcription created! Refresh to see it.');
                                                                window.location.reload();
                                                            } catch (error) {
                                                                toast.error('Failed to create demo transcription');
                                                            }
                                                        }}
                                                    >
                                                        Generate Demo Transcription
                                                    </Button>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">{lead.contact_name?.charAt(0) || 'L'}</div>Prospect Context</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-800">{lead.contact_name}</h4>
                                    <p className="text-slate-600">{lead.contact_title}</p>
                                    <p className="text-slate-500 text-sm">{lead.company_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /><span className="text-sm">{lead.industry || 'Unknown Industry'}</span></div>
                                    <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /><span className="text-sm">{lead.company_size || 'Unknown Size'}</span></div>
                                </div>
                                {lead.notes && <div className="bg-slate-50 p-3 rounded-lg"><h5 className="font-medium text-sm text-slate-700 mb-1">Background Notes</h5><p className="text-sm text-slate-600">{lead.notes}</p></div>}
                            </CardContent>
                        </Card>

                        {userNotes && (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        {isInitiator ? <Briefcase className="w-5 h-5 text-blue-600"/> : <Target className="w-5 h-5 text-yellow-600"/>}
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