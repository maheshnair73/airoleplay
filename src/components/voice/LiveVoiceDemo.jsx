import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
    Play, Pause, Loader2, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function LiveVoiceDemo() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [conversation, setConversation] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const animationFrame = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Set up audio level monitoring
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.current.createMediaStreamSource(stream);
            analyser.current = audioContext.current.createAnalyser();
            analyser.current.fftSize = 256;
            source.connect(analyser.current);
            
            const monitorAudioLevel = () => {
                const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
                analyser.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(average);
                
                if (isRecording) {
                    animationFrame.current = requestAnimationFrame(monitorAudioLevel);
                }
            };
            
            monitorAudioLevel();
            
            // Set up recording
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];
            
            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };
            
            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                setIsProcessing(true);
                
                // Simulate AI processing
                setTimeout(() => {
                    setConversation(prev => [...prev, {
                        id: Date.now(),
                        speaker: 'you',
                        text: "Hello, this is a test of the voice AI system. Can you hear me clearly?",
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    
                    setTimeout(() => {
                        setConversation(prev => [...prev, {
                            id: Date.now() + 1,
                            speaker: 'ai',
                            text: "Yes, I can hear you perfectly! This is a demonstration of our voice AI capabilities. The system is processing your voice in real-time and can respond naturally to your queries.",
                            timestamp: new Date().toLocaleTimeString()
                        }]);
                        setIsProcessing(false);
                    }, 1500);
                }, 1000);
            };
            
            mediaRecorder.current.start();
            setIsRecording(true);
            toast.success("Recording started - speak now!");
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast.error("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            setIsRecording(false);
            
            // Stop audio monitoring
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
            if (audioContext.current) {
                audioContext.current.close();
            }
            
            toast.info("Processing your voice...");
        }
    };

    const clearConversation = () => {
        setConversation([]);
        toast.success("Conversation cleared");
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="w-6 h-6" />
                        Live Voice AI Demo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This is a demonstration of the voice AI interface. In production, this would connect to services like ElevenLabs, Bland AI, or Vapi for real-time voice processing.
                        </AlertDescription>
                    </Alert>

                    {/* Recording Controls */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <Button
                                size="lg"
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isProcessing}
                                className={`w-24 h-24 rounded-full ${
                                    isRecording 
                                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                                        : 'bg-green-500 hover:bg-green-600'
                                }`}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : isRecording ? (
                                    <PhoneOff className="w-8 h-8" />
                                ) : (
                                    <Phone className="w-8 h-8" />
                                )}
                            </Button>
                            
                            {/* Audio Level Indicator */}
                            {isRecording && (
                                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" 
                                     style={{ transform: `scale(${1 + audioLevel / 200})` }}>
                                </div>
                            )}
                        </div>
                        
                        <div className="text-center">
                            <p className="text-lg font-medium">
                                {isProcessing ? 'Processing...' : 
                                 isRecording ? 'Recording - Click to stop' : 
                                 'Click to start voice demo'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {isRecording && `Audio level: ${Math.round(audioLevel)}`}
                            </p>
                        </div>
                    </div>

                    {/* Conversation History */}
                    {conversation.length > 0 && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium">Conversation</h3>
                                <Button variant="outline" size="sm" onClick={clearConversation}>
                                    Clear
                                </Button>
                            </div>
                            
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {conversation.map((message) => (
                                    <div key={message.id} className={`flex ${message.speaker === 'you' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-lg ${
                                            message.speaker === 'you' 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-white border'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={message.speaker === 'you' ? 'secondary' : 'outline'}>
                                                    {message.speaker === 'you' ? 'You' : 'AI Assistant'}
                                                </Badge>
                                                <span className="text-xs opacity-75">{message.timestamp}</span>
                                            </div>
                                            <p className="text-sm">{message.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Integration Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="p-4 text-center">
                                <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                <h4 className="font-medium text-yellow-800">Voice AI Service</h4>
                                <p className="text-sm text-yellow-700">Not Connected</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4 text-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <h4 className="font-medium text-green-800">Audio Recording</h4>
                                <p className="text-sm text-green-700">Working</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4 text-center">
                                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <h4 className="font-medium text-blue-800">Call Integration</h4>
                                <p className="text-sm text-blue-700">Ready</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}