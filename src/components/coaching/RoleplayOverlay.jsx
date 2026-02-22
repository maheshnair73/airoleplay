import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, X, Mic, Bot, Users, ArrowLeft, Volume2, Send, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import PitchReviewModal from '@/components/coaching/PitchReviewModal';

const generateElevatorPitchInternal = (contactName, companyName, contactTitle, companyWebsite, industry) => {
    if (!contactName || !companyName) return 'Please provide lead details to generate a pitch.';
    const placeholderPitch = `Hi ${contactName}, I'm calling from [Your Company] and I noticed that ${companyName} (${industry || 'your industry'}) is focused on [relevant challenge/goal]. Our solution helps companies like yours to [achieve benefit] by [unique selling point]. I'm confident we can help you [specific outcome].`;
    return placeholderPitch;
};

export default function RoleplayOverlay({ lead, onClose, initialPitchText }) {
    const [selectedMode, setSelectedMode] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const navigate = useNavigate();

    const effectivePitchText = useMemo(() => {
        if (initialPitchText && initialPitchText.trim() !== '') {
            return initialPitchText;
        }
        if (lead && lead.ai_generated_pitch && lead.ai_generated_pitch.trim() !== '') {
            return lead.ai_generated_pitch;
        }
        if (lead) {
            return generateElevatorPitchInternal(
                lead.contact_name,
                lead.company_name,
                lead.contact_title,
                lead.company_website,
                lead.industry
            );
        }
        return 'No pitch available. Lead data missing or could not be generated.';
    }, [initialPitchText, lead]);

    const [pitchText, setPitchText] = useState(effectivePitchText);

    useEffect(() => {
        setPitchText(effectivePitchText);
    }, [effectivePitchText]);

    useEffect(() => {
        const checkSpeechSupport = () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    setSpeechSupported(true);
                } else {
                    window.speechSynthesis.addEventListener('voiceschanged', () => {
                        const newVoices = window.speechSynthesis.getVoices();
                        setSpeechSupported(newVoices.length > 0);
                    });
                }
            } else {
                setSpeechSupported(false);
            }
        };
        checkSpeechSupport();
    }, []);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else if (!recordedAudio) {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording, recordedAudio]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleHearPitch = () => {
        if (!speechSupported) {
            toast.error("Speech synthesis is not supported in your browser.");
            return;
        }
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(pitchText);
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            utterance.voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => {
            setIsSpeaking(false);
            toast.error("Speech playback failed.");
        };
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setRecordedAudio({ blob, url: URL.createObjectURL(blob) });
                stream.getTracks().forEach(track => track.stop());
            };
            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setRecordedAudio(null);
        } catch (error) {
            toast.error("Could not start recording. Please check microphone permissions.");
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder?.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const playRecording = () => {
        if (recordedAudio && !isPlaying) {
            const audio = new Audio(recordedAudio.url);
            setIsPlaying(true);
            audio.onended = () => setIsPlaying(false);
            audio.play().catch(() => setIsPlaying(false));
        }
    };

    const deleteRecording = () => {
        if (recordedAudio) {
            URL.revokeObjectURL(recordedAudio.url);
        }
        setRecordedAudio(null);
        setRecordingTime(0);
    };

    const handleModeSelect = (mode) => {
        setSelectedMode(mode);
        if (mode === 'ai') {
            onClose();
            navigate(createPageUrl(`AIRoleplay?name=${encodeURIComponent(lead.contact_name)}&title=${encodeURIComponent(lead.contact_title || '')}&company=${encodeURIComponent(lead.company_name)}&personality=Nice`));
        } else if (mode === 'human') {
            onClose();
            navigate(createPageUrl(`HumanRoleplay?leadId=${lead.id}`));
        }
    };

    if (!selectedMode) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white w-full max-w-4xl h-auto max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl">
                    <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold">Choose Practice Mode</h3>
                            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">{lead.contact_name?.charAt(0) || 'L'}</div>
                            <div>
                                <h4 className="font-semibold text-lg">{lead.contact_name}</h4>
                                <p className="text-purple-100">{lead.contact_title} at {lead.company_name}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h4 className="text-2xl font-bold text-slate-800 mb-3">How would you like to practice?</h4>
                            <p className="text-slate-600">Choose the practice mode that fits your learning style and available time</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 group" onClick={() => handleModeSelect('self')}>
                                <CardContent className="p-6 text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors"><Mic className="w-8 h-8 text-blue-600" /></div>
                                    <h5 className="font-bold text-lg text-slate-800 mb-2">Pitch Practice</h5>
                                    <p className="text-sm text-slate-600 mb-4">Record your pitch and get feedback from AI or colleagues</p>
                                    <div className="flex flex-wrap gap-2 justify-center"><Badge variant="outline" className="text-xs bg-blue-50">Quick</Badge><Badge variant="outline" className="text-xs bg-blue-50">Self-paced</Badge></div>
                                </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-400 group" onClick={() => handleModeSelect('ai')}>
                                <CardContent className="p-6 text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors"><Bot className="w-8 h-8 text-purple-600" /></div>
                                    <h5 className="font-bold text-lg text-slate-800 mb-2">AI Roleplay</h5>
                                    <p className="text-sm text-slate-600 mb-4">Interactive conversation with an AI version of the prospect</p>
                                    <div className="flex flex-wrap gap-2 justify-center"><Badge variant="outline" className="text-xs bg-purple-50">Interactive</Badge><Badge variant="outline" className="text-xs bg-purple-50">24/7 Available</Badge></div>
                                </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-green-400 group" onClick={() => handleModeSelect('human')}>
                                <CardContent className="p-6 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors"><Users className="w-8 h-8 text-green-600" /></div>
                                    <h5 className="font-bold text-lg text-slate-800 mb-2">Human Roleplay</h5>
                                    <p className="text-sm text-slate-600 mb-4">Practice with a colleague or manager playing the prospect</p>
                                    <div className="flex flex-wrap gap-2 justify-center"><Badge variant="outline" className="text-xs bg-green-50">Realistic</Badge><Badge variant="outline" className="text-xs bg-green-50">Collaborative</Badge></div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="text-center text-slate-500 text-sm">💡 <strong>Tip:</strong> Use Pitch Practice to prepare, then AI Roleplay for interactive practice, and Human Roleplay for final preparation.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
                <div className="bg-white w-96 h-full shadow-2xl flex flex-col">
                    <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedMode(null)} className="text-white hover:bg-white/20 p-1"><ArrowLeft className="w-4 h-4" /></Button>
                                <h3 className="text-lg font-semibold">Pitch Practice Mode</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20"><X className="w-4 h-4" /></Button>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold">{lead.contact_name?.charAt(0) || 'L'}</div>
                            <div>
                                <h4 className="font-medium">{lead.contact_name}</h4>
                                <p className="text-blue-100 text-sm">{lead.contact_title} at {lead.company_name}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader><CardTitle className="text-sm">Generated Elevator Pitch</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="bg-slate-50 p-4 rounded-lg mb-4"><p className="text-slate-700 italic leading-relaxed">"{pitchText}"</p></div>
                                    {!speechSupported && <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4"><p className="text-amber-800 text-xs">💡 Speech playback is not available in your browser. For the best experience, try Chrome, Edge, or Safari.</p></div>}
                                    <Button onClick={handleHearPitch} variant="outline" className="w-full mb-4" disabled={!speechSupported || !pitchText || pitchText.trim() === ''}><Volume2 className="w-4 h-4 mr-2"/>{isSpeaking ? 'Stop' : 'Hear Pitch'}</Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mic className="w-4 h-4" />Record Your Pitch</CardTitle></CardHeader>
                                <CardContent>
                                    {!recordedAudio ? (
                                        <div className="text-center space-y-3">
                                            {!isRecording ? (
                                                <>
                                                    <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white"><Mic className="w-4 h-4 mr-2" />Start Recording</Button>
                                                    <p className="text-sm text-slate-500">Record your pitch to get feedback.</p>
                                                </>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                        <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
                                                    </div>
                                                    <Button onClick={stopRecording} variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">Stop Recording</Button>
                                                    <p className="text-sm text-slate-500">Recording...</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <span className="text-sm text-green-700">Completed ({formatTime(recordingTime)})</span>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={playRecording} disabled={isPlaying}><Play className="w-4 h-4" /></Button>
                                                    <Button size="sm" variant="outline" onClick={deleteRecording} className="text-red-600 hover:bg-red-50"><X className="w-4 h-4" /></Button>
                                                </div>
                                            </div>
                                            <Button onClick={() => setIsReviewModalOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-700"><Send className="w-4 h-4 mr-2" />Send for Review</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="p-6 border-t mt-auto bg-gray-50 text-center"><p className="text-sm text-slate-500">Practice your pitch to improve delivery.</p></div>
                </div>
            </div>
            <PitchReviewModal open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen} lead={lead} pitchText={pitchText} recordedAudio={recordedAudio ? recordedAudio.blob : null} />
        </>
    );
};