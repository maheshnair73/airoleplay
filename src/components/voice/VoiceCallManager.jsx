
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX,
    Settings, Play, Pause, Square, Clock, AlertCircle, CheckCircle2,
    Loader2, Brain, Zap, User, Target
} from 'lucide-react';
import { toast } from 'sonner';
import { Lead } from '@/api/entities';
import { CallRecord } from '@/api/entities';
import { processCallRecording } from '@/api/functions';

const CALL_SCRIPTS = {
    cold_outreach: {
        name: "Cold Outreach",
        prompt: "You are making a cold call to introduce our solution. Be friendly but professional, quickly establish rapport, identify pain points, and try to schedule a demo."
    },
    follow_up: {
        name: "Follow-up Call", 
        prompt: "This is a follow-up call with an existing lead. Reference previous conversations, address any concerns, and move the relationship forward."
    },
    demo_booking: {
        name: "Demo Booking",
        prompt: "Your goal is to schedule a product demonstration. Qualify their needs, understand their timeline, and secure a specific meeting time."
    },
    closing: {
        name: "Closing Call",
        prompt: "This is a closing call where you need to get a commitment. Handle objections confidently and push for a decision."
    }
};

export default function VoiceCallManager({ lead, open, onOpenChange }) {
    const [isCallActive, setIsCallActive] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isRecording, setIsRecording] = useState(true);
    const [callScript, setCallScript] = useState('cold_outreach');
    const [customInstructions, setCustomInstructions] = useState('');
    const [callStatus, setCallStatus] = useState('preparing'); // preparing, dialing, connected, ended
    const [transcript, setTranscript] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [callId, setCallId] = useState(null);
    const [isInitiating, setIsInitiating] = useState(false);
    
    const callTimer = useRef(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    useEffect(() => {
        return () => {
            if (callTimer.current) {
                clearInterval(callTimer.current);
            }
        };
    }, []);

    const startCall = async () => {
        if (!lead?.contact_phone) {
            toast.error("No phone number available for this lead");
            return;
        }

        setIsInitiating(true);
        setCallStatus('dialing');

        try {
            // Call the backend to initiate the voice call
            const { initiateVoiceCall } = await import('@/api/functions');
            
            const response = await initiateVoiceCall({
                leadId: lead.id,
                callScript: callScript,
                customInstructions: customInstructions,
                phoneNumber: lead.contact_phone
            });

            if (response.data.success) {
                setCallId(response.data.call_id);
                setIsCallActive(true);
                
                // Start call timer
                callTimer.current = setInterval(() => {
                    setCallDuration(prev => prev + 1);
                }, 1000);

                // Start recording
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder.current = new MediaRecorder(stream);
                audioChunks.current = [];

                mediaRecorder.current.ondataavailable = (event) => {
                    audioChunks.current.push(event.data);
                };

                mediaRecorder.current.start();
                
                // Simulate call connection
                setTimeout(() => {
                    setCallStatus('connected');
                    toast.success("Call connected! AI Voice Assistant is now active.");
                    
                    // Add initial transcript entry
                    setTranscript([{
                        timestamp: 0,
                        speaker: 'system',
                        text: `AI Voice Call started with ${lead.contact_name} at ${lead.company_name}`
                    }]);

                    // Simulate some conversation for demo
                    setTimeout(() => {
                        setTranscript(prev => [...prev, {
                            timestamp: 5,
                            speaker: 'ai',
                            text: `Hi ${lead.contact_name}, this is Sarah from SalesAI Pro. I hope I'm not catching you at a bad time?`
                        }]);
                    }, 3000);

                    setTimeout(() => {
                        setTranscript(prev => [...prev, {
                            timestamp: 15,
                            speaker: 'prospect',
                            text: "Hi Sarah, I have a few minutes. What's this about?"
                        }]);
                    }, 8000);

                    setTimeout(() => {
                        setTranscript(prev => [...prev, {
                            timestamp: 20,
                            speaker: 'ai',
                            text: "Great! I'm calling because I noticed your company might benefit from our sales automation platform. Are you currently facing any challenges with your sales process?"
                        }]);
                    }, 12000);
                }, 3000);

            } else {
                throw new Error(response.data.error || 'Failed to initiate call');
            }

        } catch (error) {
            console.error('Error starting call:', error);
            toast.error("Failed to start call. This is currently a demo - real voice AI integration requires additional setup.");
            setIsCallActive(false);
            setCallStatus('preparing');
        } finally {
            setIsInitiating(false);
        }
    };

    const endCall = async () => {
        setCallStatus('ended');
        setIsCallActive(false);
        
        if (callTimer.current) {
            clearInterval(callTimer.current);
        }

        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            
            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                await processCallRecording({
                    audio: audioBlob,
                    leadId: lead.id,
                    callType: callScript,
                    prospectName: lead.contact_name
                });
            };
        }

        toast.success(`Call ended. Duration: ${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`);
        
        // Reset state after a delay
        setTimeout(() => {
            setCallDuration(0);
            setCallStatus('preparing');
            setTranscript([]);
        }, 3000);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        toast.info(isMuted ? "Microphone unmuted" : "Microphone muted");
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                Voice AI Call Manager
                            </CardTitle>
                            <p className="text-blue-100 mt-1">
                                Calling: {lead.contact_name} at {lead.company_name}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="text-white hover:bg-white/20"
                        >
                            ×
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Call Status */}
                    <div className="text-center">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                            isCallActive 
                                ? callStatus === 'connected' 
                                    ? 'bg-green-500 animate-pulse' 
                                    : 'bg-yellow-500 animate-pulse'
                                : 'bg-gray-200'
                        }`}>
                            <Phone className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-lg font-semibold capitalize">{callStatus.replace('_', ' ')}</p>
                            <p className="text-2xl font-mono font-bold text-blue-600">
                                {formatDuration(callDuration)}
                            </p>
                            <p className="text-sm text-gray-600">{lead.contact_phone}</p>
                        </div>
                    </div>

                    {/* Call Setup (only when not active) */}
                    {!isCallActive && callStatus === 'preparing' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Call Script</label>
                                <Select value={callScript} onValueChange={setCallScript}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(CALL_SCRIPTS).map(([key, script]) => (
                                            <SelectItem key={key} value={key}>
                                                {script.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {CALL_SCRIPTS[callScript]?.prompt}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Custom Instructions</label>
                                <Textarea
                                    placeholder="Any specific talking points or context for this call..."
                                    value={customInstructions}
                                    onChange={(e) => setCustomInstructions(e.target.value)}
                                    className="h-20"
                                />
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This call will be recorded and analyzed by AI for coaching insights.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Live Transcript (during call) */}
                    {isCallActive && transcript.length > 0 && (
                        <div className="border rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                Live Transcript
                            </h4>
                            <div className="space-y-2 text-sm">
                                {transcript.map((entry, index) => (
                                    <div key={index} className="flex gap-2">
                                        <span className="text-gray-500 min-w-12">
                                            {Math.floor(entry.timestamp / 60)}:{(entry.timestamp % 60).toString().padStart(2, '0')}
                                        </span>
                                        <span className={`font-medium ${
                                            entry.speaker === 'user' ? 'text-blue-600' : 
                                            entry.speaker === 'prospect' ? 'text-green-600' : 
                                            entry.speaker === 'ai' ? 'text-purple-600' : 'text-gray-600'
                                        }`}>
                                            {entry.speaker === 'user' ? 'You' : 
                                             entry.speaker === 'prospect' ? lead.contact_name : 
                                             entry.speaker === 'ai' ? 'AI Assistant' : 'System'}:
                                        </span>
                                        <span>{entry.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Call Controls */}
                    <div className="flex justify-center gap-4">
                        {!isCallActive ? (
                            <Button
                                onClick={startCall}
                                disabled={!lead?.contact_phone || isInitiating}
                                className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
                            >
                                {isInitiating ? (
                                    <>
                                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                        Initiating Call...
                                    </>
                                ) : (
                                    <>
                                        <PhoneCall className="w-6 h-6 mr-2" />
                                        Start AI Voice Call
                                    </>
                                )}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={toggleMute}
                                    className={isMuted ? 'bg-red-50 border-red-200' : ''}
                                >
                                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </Button>
                                
                                <Button
                                    variant="destructive"
                                    onClick={endCall}
                                    className="px-8"
                                >
                                    <PhoneOff className="w-5 h-5 mr-2" />
                                    End Call
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Lead Context */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Lead Context
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <Badge className="ml-2">{lead.status}</Badge>
                            </div>
                            <div>
                                <span className="text-gray-500">Source:</span>
                                <span className="ml-2">{lead.lead_source}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Industry:</span>
                                <span className="ml-2">{lead.industry || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">AI Score:</span>
                                <span className="ml-2 font-medium">{lead.ai_score || 'N/A'}</span>
                            </div>
                        </div>
                        {lead.notes && (
                            <div className="mt-3">
                                <span className="text-gray-500">Notes:</span>
                                <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{lead.notes}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
