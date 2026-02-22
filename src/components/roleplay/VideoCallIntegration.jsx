
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Phone, ExternalLink, Mic, MicOff, VideoOff, Users, Copy, CheckCircle, Monitor, MonitorSpeaker } from 'lucide-react';
import { toast } from 'sonner';
import { createMeetingLinks } from '@/api/functions';
import { webrtcSignaling } from '@/api/functions';

export default function VideoCallIntegration({ session, currentUser, isInitiator }) {
    const [callMode, setCallMode] = useState(null); // 'webrtc' | 'external'
    const [callActive, setCallActive] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
    const [meetingDetails, setMeetingDetails] = useState(null);
    const [participants, setParticipants] = useState([]);
    
    // WebRTC refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const websocketRef = useRef(null);

    // Initialize WebRTC
    const initializeWebRTC = async () => {
        try {
            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoEnabled,
                audio: audioEnabled
            });
            
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Create peer connection
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Add local stream to peer connection
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            // Handle remote stream
            peerConnection.ontrack = (event) => {
                const remoteStream = event.streams[0];
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                }
            };

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate && websocketRef.current) {
                    websocketRef.current.send(JSON.stringify({
                        type: 'ice-candidate',
                        candidate: event.candidate,
                        roomId: `roleplay_${session.id}`
                    }));
                }
            };

            peerConnectionRef.current = peerConnection;
            
            return true;
        } catch (error) {
            console.error('Error initializing WebRTC:', error);
            toast.error('Unable to access camera/microphone');
            return false;
        }
    };

    // Connect to WebRTC signaling server
    const connectWebSocket = () => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const wsUrl = `${supabaseUrl}/functions/v1/webrtc-signaling`.replace('https://', 'wss://').replace('http://', 'ws://');
        
        websocketRef.current = new WebSocket(wsUrl);
        
        websocketRef.current.onopen = () => {
            websocketRef.current.send(JSON.stringify({
                type: 'join-room',
                roomId: `roleplay_${session.id}`
            }));
        };

        websocketRef.current.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'room-joined':
                    setParticipants(data.participants);
                    break;
                case 'user-joined':
                    toast.info(`${data.userName} joined the call`);
                    // If this is the initiator, create offer
                    if (isInitiator && peerConnectionRef.current) {
                        const offer = await peerConnectionRef.current.createOffer();
                        await peerConnectionRef.current.setLocalDescription(offer);
                        websocketRef.current.send(JSON.stringify({
                            type: 'offer',
                            offer: offer,
                            roomId: `roleplay_${session.id}`
                        }));
                    }
                    break;
                case 'offer':
                    if (peerConnectionRef.current) {
                        await peerConnectionRef.current.setRemoteDescription(data.offer);
                        const answer = await peerConnectionRef.current.createAnswer();
                        await peerConnectionRef.current.setLocalDescription(answer);
                        websocketRef.current.send(JSON.stringify({
                            type: 'answer',
                            answer: answer,
                            roomId: `roleplay_${session.id}`
                        }));
                    }
                    break;
                case 'answer':
                    if (peerConnectionRef.current) {
                        await peerConnectionRef.current.setRemoteDescription(data.answer);
                    }
                    break;
                case 'ice-candidate':
                    if (peerConnectionRef.current) {
                        await peerConnectionRef.current.addIceCandidate(data.candidate);
                    }
                    break;
                case 'user-left':
                    toast.info(`${data.userName} left the call`);
                    break;
            }
        };
    };

    const startWebRTCCall = async () => {
        const initialized = await initializeWebRTC();
        if (initialized) {
            connectWebSocket();
            setCallActive(true);
            setCallMode('webrtc');
            toast.success('Video call started!');
        }
    };

    const endWebRTCCall = () => {
        // Clean up WebRTC resources
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        
        if (websocketRef.current) {
            websocketRef.current.send(JSON.stringify({
                type: 'leave-room',
                roomId: `roleplay_${session.id}`
            }));
            websocketRef.current.close();
        }
        
        setCallActive(false);
        setCallMode(null);
        toast.success('Call ended');
    };

    const createExternalMeeting = async (platform) => {
        setIsCreatingMeeting(true);
        try {
            const response = await createMeetingLinks({
                sessionId: session.id,
                platform: platform,
                sessionDetails: {
                    title: `Roleplay Session - ${session.lead_id}`,
                    participants: [currentUser.email, session.prospect_player_email],
                    duration: 30 // 30 minutes
                }
            });

            setMeetingDetails(response.data);
            setCallMode('external');
            toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} meeting created!`);
        } catch (error) {
            console.error('Error creating meeting:', error);
            toast.error('Failed to create meeting');
        } finally {
            setIsCreatingMeeting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoEnabled(videoTrack.enabled);
            }
        }
    };

    // Clean up on unmount or when call state changes
    useEffect(() => {
        return () => {
            if (callActive && callMode === 'webrtc') {
                // Clean up WebRTC resources
                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(track => track.stop());
                }
                
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                }
                
                if (websocketRef.current) {
                    websocketRef.current.send(JSON.stringify({
                        type: 'leave-room',
                        roomId: `roleplay_${session.id}`
                    }));
                    websocketRef.current.close();
                }
            }
        };
    }, [callActive, callMode, session.id]);

    return (
        <Card className="border-2 border-blue-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Video Call Options
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {!callActive && !meetingDetails && (
                    <>
                        {/* Built-in WebRTC Option */}
                        <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                Built-in Video Call
                            </h4>
                            <p className="text-sm text-slate-600">
                                High-quality video call directly in the browser. No external app required.
                            </p>
                            <Button 
                                onClick={startWebRTCCall} 
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                <Video className="w-4 h-4 mr-2" />
                                Start Built-in Video Call
                            </Button>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                External Meeting Platforms
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => createExternalMeeting('zoom')}
                                    disabled={isCreatingMeeting}
                                    className="flex items-center gap-2"
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Zoom_Logo.svg/1200px-Zoom_Logo.svg.png" alt="Zoom" className="w-4 h-4" />
                                    Zoom
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => createExternalMeeting('teams')}
                                    disabled={isCreatingMeeting}
                                    className="flex items-center gap-2"
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png" alt="Teams" className="w-4 h-4" />
                                    Teams
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => createExternalMeeting('meet')}
                                    disabled={isCreatingMeeting}
                                    className="flex items-center gap-2"
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Google_Meet_icon.svg/1200px-Google_Meet_icon.svg.png" alt="Google Meet" className="w-4 h-4" />
                                    Meet
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => createExternalMeeting('whereby')}
                                    disabled={isCreatingMeeting}
                                    className="flex items-center gap-2"
                                >
                                    <MonitorSpeaker className="w-4 h-4" />
                                    Whereby
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* Active WebRTC Call */}
                {callActive && callMode === 'webrtc' && (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-200">
                            <div className="text-green-800 font-medium mb-2">Built-in Video Call Active</div>
                            <Badge className="bg-green-100 text-green-800">
                                <Users className="w-3 h-3 mr-1" />
                                {participants.length + 1} participant(s)
                            </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">You</p>
                                <video 
                                    ref={localVideoRef} 
                                    autoPlay 
                                    muted 
                                    className="w-full h-40 bg-black rounded-lg object-cover"
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Participant</p>
                                <video 
                                    ref={remoteVideoRef} 
                                    autoPlay 
                                    className="w-full h-40 bg-black rounded-lg object-cover"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-center gap-3">
                            <Button 
                                variant={audioEnabled ? "default" : "destructive"} 
                                size="sm"
                                onClick={toggleAudio}
                            >
                                {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </Button>
                            <Button 
                                variant={videoEnabled ? "default" : "destructive"} 
                                size="sm"
                                onClick={toggleVideo}
                            >
                                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={endWebRTCCall}
                            >
                                End Call
                            </Button>
                        </div>
                    </div>
                )}

                {/* External Meeting Details */}
                {meetingDetails && callMode === 'external' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                            <div className="text-blue-800 font-medium mb-2">
                                {meetingDetails.platform.charAt(0).toUpperCase() + meetingDetails.platform.slice(1)} Meeting Ready
                            </div>
                            <p className="text-blue-700 text-sm">{meetingDetails.instructions}</p>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Meeting Link:</label>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => copyToClipboard(meetingDetails.meetingLink)}
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                            <div className="bg-slate-100 p-3 rounded text-sm break-all">
                                {meetingDetails.meetingLink}
                            </div>
                            
                            {meetingDetails.password && (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <label className="text-sm font-medium">Meeting Password:</label>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => copyToClipboard(meetingDetails.password)}
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="bg-slate-100 p-3 rounded text-sm">
                                        {meetingDetails.password}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-3">
                                <Button 
                                    onClick={() => window.open(meetingDetails.meetingLink, '_blank')}
                                    className="flex-1"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Join Meeting
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setMeetingDetails(null);
                                        setCallMode(null);
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
