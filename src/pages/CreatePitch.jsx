import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoachingTask } from '@/api/entities';
import { TaskSubmission } from '@/api/entities';
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
    ArrowLeft, 
    Mic, 
    Video, 
    Monitor, 
    Play, 
    Pause, 
    Square, 
    Upload, 
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Eye,
    Volume2,
    BookOpen,
    Star
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { analyzeCoachingSubmission } from '@/api/functions';

export default function CreatePitch() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordingUrl, setRecordingUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recordingType, setRecordingType] = useState('audio');
    const [addToLibrary, setAddToLibrary] = useState(true);
    const [pitchData, setPitchData] = useState({
        title: '',
        scenario: '',
        category: 'discovery',
        target_audience: '',
        industry_focus: '',
        notes: ''
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                console.error('Error loading user:', error);
                toast.error('Failed to load user data');
                navigate(createPageUrl('PitchLibrary'));
            }
            setIsLoading(false);
        };
        
        loadUser();
    }, [navigate]);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Create preview URL when recording is complete
    useEffect(() => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            setRecordingUrl(url);
            
            // Cleanup URL when component unmounts or new recording
            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [recordedBlob]);

    const startRecording = async () => {
        try {
            let stream;
            
            if (recordingType === 'screen_recording') {
                // Screen recording with audio
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
            } else if (recordingType === 'video') {
                // Video recording with audio
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
            } else {
                // Audio only recording
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                });
            }
            
            const options = {
                mimeType: recordingType === 'audio' ? 'audio/webm' : 'video/webm'
            };
            
            const recorder = new MediaRecorder(stream, options);
            const chunks = [];
            
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };
            
            recorder.onstop = () => {
                const blob = new Blob(chunks, { 
                    type: recordingType === 'audio' ? 'audio/webm' : 'video/webm' 
                });
                setRecordedBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            setMediaRecorder(recorder);
            setRecordingTime(0);
            recorder.start();
            setIsRecording(true);
            
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('Failed to start recording. Please check your permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleSubmit = async () => {
        if (!recordedBlob) {
            toast.error('Please record your pitch first');
            return;
        }
        
        if (!pitchData.title.trim()) {
            toast.error('Please enter a pitch title');
            return;
        }
        
        if (!pitchData.scenario.trim()) {
            toast.error('Please describe the scenario');
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Step 1: Create a coaching task for this pitch
            const task = await CoachingTask.create({
                task_title: pitchData.title,
                task_type: recordingType,
                scenario: pitchData.scenario,
                duration_seconds: recordingTime,
                status: 'active',
                evaluation_criteria: [
                    { name: "Clarity", description: "How clear and articulate was the message?" },
                    { name: "Confidence", description: "How confident and persuasive was the delivery?" },
                    { name: "Value Proposition", description: "How well was the value proposition communicated?" },
                    { name: "Engagement", description: "How engaging and compelling was the pitch?" }
                ]
            });

            // Step 2: Upload the recording
            const file = new File([recordedBlob], `pitch_${task.id}_${Date.now()}.webm`, {
                type: recordedBlob.type
            });
            
            const uploadResult = await UploadFile({ file });
            
            // Step 3: Create the submission
            const submissionData = {
                task_id: task.id,
                submitted_by: user.email,
                submission_url: uploadResult.file_url,
                submission_type: recordingType,
                duration_actual: recordingTime,
                status: 'submitted',
                is_in_library: addToLibrary,
                submission_notes: [
                    `Target Audience: ${pitchData.target_audience}`,
                    `Industry Focus: ${pitchData.industry_focus}`,
                    `Category: ${pitchData.category}`,
                    `Additional Notes: ${pitchData.notes}`
                ].filter(note => note.split(': ')[1]).join('\n')
            };
            
            const submission = await TaskSubmission.create(submissionData);
            
            toast.success('Pitch uploaded successfully!');
            
            // Step 4: Start AI analysis
            setIsAnalyzing(true);
            toast.info('Starting AI analysis...');
            
            try {
                const analysisResult = await analyzeCoachingSubmission({
                    submissionId: submission.id,
                    audioUrl: uploadResult.file_url,
                    taskType: recordingType,
                    evaluationCriteria: task.evaluation_criteria
                });
                
                if (analysisResult.data.success) {
                    toast.success('AI analysis completed!');
                } else {
                    toast.error('AI analysis failed: ' + (analysisResult.data.error || 'Unknown error'));
                }
            } catch (analysisError) {
                console.error('Analysis error:', analysisError);
                toast.error('AI analysis failed. Your pitch was saved but analysis could not be completed.');
            }
            
            navigate(createPageUrl('PitchLibrary'));
            
        } catch (error) {
            console.error('Error submitting pitch:', error);
            toast.error('Failed to submit pitch. Please try again.');
        }
        setIsSubmitting(false);
        setIsAnalyzing(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getRecordingIcon = () => {
        switch (recordingType) {
            case 'audio': return <Mic className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case 'screen_recording': return <Monitor className="w-5 h-5" />;
            default: return <Mic className="w-5 h-5" />;
        }
    };

    const renderPreviewPlayer = () => {
        if (!recordingUrl) return null;

        if (recordingType === 'audio') {
            return (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border-2 border-purple-200">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                            <Volume2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="text-center mb-4">
                        <h3 className="font-semibold text-purple-800 mb-2">Audio Pitch Preview</h3>
                        <p className="text-sm text-purple-600">Duration: {formatTime(recordingTime)}</p>
                    </div>
                    <audio 
                        controls 
                        className="w-full" 
                        src={recordingUrl}
                        preload="metadata"
                    >
                        Your browser does not support audio playback.
                    </audio>
                </div>
            );
        }

        return (
            <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-4 border-2 border-blue-200">
                <div className="text-center mb-4">
                    <h3 className="font-semibold text-blue-800 mb-2">
                        {recordingType === 'video' ? 'Video' : 'Screen Recording'} Preview
                    </h3>
                    <p className="text-sm text-blue-600">Duration: {formatTime(recordingTime)}</p>
                </div>
                <video 
                    controls 
                    className="w-full max-h-96 rounded-lg shadow-lg" 
                    src={recordingUrl}
                    preload="metadata"
                >
                    Your browser does not support video playback.
                </video>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('PitchLibrary'))}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Pitch Library
                    </Button>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Create New Pitch</h1>
                            <p className="text-slate-600">Record and share your best sales pitches</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recording Setup */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pitch Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pitch Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Pitch Title *
                                    </label>
                                    <Input
                                        placeholder="e.g., Enterprise SaaS Cold Outreach"
                                        value={pitchData.title}
                                        onChange={(e) => setPitchData({...pitchData, title: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Scenario Description *
                                    </label>
                                    <Textarea
                                        placeholder="Describe the scenario: Who is the prospect? What's their situation? What are you trying to achieve?"
                                        value={pitchData.scenario}
                                        onChange={(e) => setPitchData({...pitchData, scenario: e.target.value})}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Category
                                        </label>
                                        <Select 
                                            value={pitchData.category} 
                                            onValueChange={(value) => setPitchData({...pitchData, category: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="discovery">Discovery Call</SelectItem>
                                                <SelectItem value="demo">Product Demo</SelectItem>
                                                <SelectItem value="closing">Closing Pitch</SelectItem>
                                                <SelectItem value="objection_handling">Objection Handling</SelectItem>
                                                <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                                                <SelectItem value="follow_up">Follow-up</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Target Audience
                                        </label>
                                        <Input
                                            placeholder="e.g., C-Level, IT Directors"
                                            value={pitchData.target_audience}
                                            onChange={(e) => setPitchData({...pitchData, target_audience: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Industry Focus
                                    </label>
                                    <Input
                                        placeholder="e.g., SaaS, Manufacturing, Healthcare"
                                        value={pitchData.industry_focus}
                                        onChange={(e) => setPitchData({...pitchData, industry_focus: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Additional Notes
                                    </label>
                                    <Textarea
                                        placeholder="Any additional context or tips for using this pitch..."
                                        value={pitchData.notes}
                                        onChange={(e) => setPitchData({...pitchData, notes: e.target.value})}
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recording Interface */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Record Your Pitch</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Recording Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">
                                        Recording Type
                                    </label>
                                    <div className="flex gap-3">
                                        {[
                                            { value: 'audio', icon: Mic, label: 'Audio Only' },
                                            { value: 'video', icon: Video, label: 'Video' },
                                            { value: 'screen_recording', icon: Monitor, label: 'Screen Recording' }
                                        ].map(({ value, icon: Icon, label }) => (
                                            <Button
                                                key={value}
                                                variant={recordingType === value ? 'default' : 'outline'}
                                                onClick={() => setRecordingType(value)}
                                                className="flex items-center gap-2"
                                                disabled={isRecording}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Preview Player */}
                                {recordedBlob && (
                                    <div className="space-y-4">
                                        {renderPreviewPlayer()}
                                    </div>
                                )}

                                {/* Recording Controls */}
                                <div className="text-center space-y-4">
                                    {isRecording && (
                                        <div className="space-y-2">
                                            <div className="text-2xl font-mono text-red-600">
                                                {formatTime(recordingTime)}
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm text-slate-600">Recording...</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-center gap-3">
                                        {!isRecording && !recordedBlob && (
                                            <Button
                                                onClick={startRecording}
                                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                                            >
                                                {getRecordingIcon()}
                                                <span className="ml-2">Start Recording</span>
                                            </Button>
                                        )}

                                        {isRecording && (
                                            <Button
                                                onClick={stopRecording}
                                                variant="outline"
                                                className="px-8 py-3"
                                            >
                                                <Square className="w-4 h-4 mr-2" />
                                                Stop Recording
                                            </Button>
                                        )}

                                        {recordedBlob && (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => {
                                                        setRecordedBlob(null);
                                                        setRecordingUrl(null);
                                                        setRecordingTime(0);
                                                    }}
                                                    variant="outline"
                                                >
                                                    Record Again
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {recordedBlob && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center justify-center gap-2 text-green-700">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Recording complete! Duration: {formatTime(recordingTime)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Library Toggle */}
                                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-purple-800 flex items-center gap-2">
                                            <Star className="w-4 h-4" />
                                            Add to Pitch Library
                                        </h4>
                                        <p className="text-sm text-purple-600">
                                            Share this pitch with your team as a best practice
                                        </p>
                                    </div>
                                    <Switch
                                        checked={addToLibrary}
                                        onCheckedChange={setAddToLibrary}
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isAnalyzing || !recordedBlob}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Uploading Pitch...
                                        </>
                                    ) : isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Analyzing Pitch...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Save Pitch
                                        </>
                                    )}
                                </Button>

                                {isAnalyzing && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-center gap-2 text-blue-700">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>AI is analyzing your pitch... This may take a few minutes.</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tips Sidebar */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-500" />
                                    Recording Tips
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-800 mb-2">Before Recording</h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• Find a quiet environment</li>
                                        <li>• Check your microphone/camera</li>
                                        <li>• Prepare your pitch outline</li>
                                        <li>• Practice once before recording</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-slate-800 mb-2">During Recording</h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• Speak clearly and confidently</li>
                                        <li>• Make it conversational</li>
                                        <li>• Include specific examples</li>
                                        <li>• End with a clear call to action</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-slate-800 mb-2">What Makes a Great Pitch</h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• Personalized opening</li>
                                        <li>• Clear value proposition</li>
                                        <li>• Relevant case studies</li>
                                        <li>• Specific next steps</li>
                                    </ul>
                                </div>

                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Pro Tip:</strong> Keep it under 2 minutes for maximum impact!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}