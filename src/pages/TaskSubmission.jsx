
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CoachingTask } from '@/api/entities';
import { TaskSubmission as TaskSubmissionEntity } from '@/api/entities';
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
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
    Volume2
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { analyzeCoachingSubmission } from '@/api/functions';

export default function TaskSubmission() {
    const [task, setTask] = useState(null);
    const [user, setUser] = useState(null);
    const [existingSubmission, setExistingSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordingUrl, setRecordingUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [isTrialMode, setIsTrialMode] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get task ID from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const taskId = urlParams.get('taskId');

    const loadTaskAndUser = useCallback(async () => {
        setIsLoading(true);
        try {
            const [currentUser, taskData] = await Promise.all([
                User.me(),
                CoachingTask.get(taskId)
            ]);
            
            setUser(currentUser);
            setTask(taskData);
            
            // Check if user already has a submission for this task
            const submissions = await TaskSubmissionEntity.filter({
                task_id: taskId,
                submitted_by: currentUser.email
            });
            
            if (submissions.length > 0) {
                setExistingSubmission(submissions[0]);
            }
            
        } catch (error) {
            console.error('Error loading task:', error);
            toast.error('Failed to load task details');
            const returnToPitchLibrary = sessionStorage.getItem('returnToPitchLibrary');
            if (returnToPitchLibrary === 'true') {
                navigate(createPageUrl('PitchLibrary'));
            } else {
                navigate(createPageUrl('CoachingHub'));
            }
        }
        setIsLoading(false);
    }, [taskId, navigate]);

    useEffect(() => {
        if (!taskId) {
            toast.error('No task ID provided');
            const returnToPitchLibrary = sessionStorage.getItem('returnToPitchLibrary');
            if (returnToPitchLibrary === 'true') {
                navigate(createPageUrl('PitchLibrary'));
            } else {
                navigate(createPageUrl('CoachingHub'));
            }
            return;
        }
        
        loadTaskAndUser();
    }, [taskId, navigate, loadTaskAndUser]);

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

    // Clear the return flag when component unmounts
    useEffect(() => {
        return () => {
            sessionStorage.removeItem('returnToPitchLibrary');
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: task?.task_type === 'video' || task?.task_type === 'screen_recording'
            });
            
            const options = {
                mimeType: task?.task_type === 'audio' ? 'audio/webm' : 'video/webm'
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
                    type: task?.task_type === 'audio' ? 'audio/webm' : 'video/webm' 
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
            toast.error('Failed to start recording. Please check your microphone permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleSubmission = async () => {
        if (!recordedBlob && !existingSubmission) {
            toast.error('Please record your submission first');
            return;
        }
        
        setIsSubmitting(true);
        try {
            let submissionUrl = existingSubmission?.submission_url;
            let submissionId = existingSubmission?.id;
            
            // Upload new recording if provided
            if (recordedBlob) {
                const file = new File([recordedBlob], `submission_${taskId}_${Date.now()}.webm`, {
                    type: recordedBlob.type
                });
                
                const uploadResult = await UploadFile({ file });
                submissionUrl = uploadResult.file_url;
            }
            
            const submissionData = {
                task_id: taskId,
                submitted_by: user.email,
                submission_url: submissionUrl,
                submission_type: task.task_type,
                duration_actual: recordingTime,
                status: 'submitted',
                additional_notes: additionalNotes,
                is_trial: isTrialMode
            };
            
            // Create or update submission
            let submission;
            if (existingSubmission) {
                submission = await TaskSubmissionEntity.update(existingSubmission.id, submissionData);
                submissionId = existingSubmission.id;
            } else {
                submission = await TaskSubmissionEntity.create(submissionData);
                submissionId = submission.id;
            }
            
            toast.success('Submission uploaded successfully!');
            
            // Start AI analysis if not in trial mode
            if (!isTrialMode) {
                setIsAnalyzing(true);
                toast.info('Starting AI analysis...');
                
                try {
                    const analysisResult = await analyzeCoachingSubmission({
                        submissionId: submissionId,
                        audioUrl: submissionUrl,
                        taskType: task.task_type,
                        evaluationCriteria: task.evaluation_criteria
                    });
                    
                    if (analysisResult.data.success) {
                        toast.success('AI analysis completed! Check your results in the Coaching Hub.');
                    } else {
                        toast.error('AI analysis failed: ' + (analysisResult.data.error || 'Unknown error'));
                    }
                } catch (analysisError) {
                    console.error('Analysis error:', analysisError);
                    toast.error('AI analysis failed. Your submission was saved but analysis could not be completed.');
                }
            } else {
                toast.info('Trial submission saved without analysis.');
            }
            
            // Navigate back to appropriate page
            const returnToPitchLibrary = sessionStorage.getItem('returnToPitchLibrary');
            if (returnToPitchLibrary === 'true') {
                navigate(createPageUrl('PitchLibrary'));
            } else {
                navigate(createPageUrl('CoachingHub'));
            }
            
        } catch (error) {
            console.error('Error submitting:', error);
            toast.error('Failed to submit. Please try again.');
        }
        setIsSubmitting(false);
        setIsAnalyzing(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTaskIcon = () => {
        switch (task?.task_type) {
            case 'audio': return <Mic className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case 'screen_recording': return <Monitor className="w-5 h-5" />;
            default: return <Mic className="w-5 h-5" />;
        }
    };

    const renderPreviewPlayer = () => {
        if (!recordingUrl) return null;

        if (task?.task_type === 'audio') {
            return (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border-2 border-purple-200">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                            <Volume2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="text-center mb-4">
                        <h3 className="font-semibold text-purple-800 mb-2">Audio Recording Preview</h3>
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
                        {task?.task_type === 'video' ? 'Video' : 'Screen Recording'} Preview
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

    const getBackUrl = () => {
        const returnToPitchLibrary = sessionStorage.getItem('returnToPitchLibrary');
        if (returnToPitchLibrary === 'true') {
            return createPageUrl('PitchLibrary');
        }
        return createPageUrl('CoachingHub');
    };

    const getBackLabel = () => {
        const returnToPitchLibrary = sessionStorage.getItem('returnToPitchLibrary');
        if (returnToPitchLibrary === 'true') {
            return 'Back to Pitch Library';
        }
        return 'Back to Coaching Hub';
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-500">Loading task details...</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Task Not Found</h2>
                <p className="text-slate-500 mb-4">The requested task could not be found.</p>
                <Button onClick={() => navigate(getBackUrl())}>
                    Go {getBackLabel()}
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(getBackUrl())}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {getBackLabel()}
                    </Button>
                </div>

                {/* Task Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                {getTaskIcon()}
                                {task.task_title}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="capitalize">
                                    {task.task_type.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {Math.floor(task.duration_seconds / 60)} min limit
                                </Badge>
                                {task.created_by && (
                                    <Badge variant="secondary">
                                        Created by: {task.created_by}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-slate-800 mb-2">Scenario:</h4>
                                <p className="text-slate-600">{task.scenario}</p>
                            </div>
                            
                            {task.evaluation_criteria && task.evaluation_criteria.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-slate-800 mb-2">Evaluation Criteria:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {task.evaluation_criteria.map((criteria, index) => (
                                            <li key={index} className="text-slate-600">
                                                <strong>{criteria.name}:</strong> {criteria.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recording Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Your Submission</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Trial Mode Toggle */}
                        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div>
                                <h4 className="font-medium text-yellow-800">Trial Mode</h4>
                                <p className="text-sm text-yellow-600">
                                    Practice mode - this submission won't count towards your task limits and won't be analyzed by AI
                                </p>
                            </div>
                            <Switch
                                checked={isTrialMode}
                                onCheckedChange={setIsTrialMode}
                            />
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
                                    <Progress 
                                        value={(recordingTime / task.duration_seconds) * 100} 
                                        className="w-full max-w-sm mx-auto"
                                    />
                                    <p className="text-sm text-slate-500">
                                        Maximum: {formatTime(task.duration_seconds)}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-center gap-3">
                                {!isRecording && !recordedBlob && (
                                    <Button
                                        onClick={startRecording}
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                                    >
                                        {getTaskIcon()}
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
                                        <Button
                                            onClick={handleSubmission}
                                            disabled={isSubmitting || isAnalyzing}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : isAnalyzing ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                            )}
                                            {isSubmitting ? 'Uploading...' : 
                                             isAnalyzing ? 'Analyzing...' : 
                                             'Submit Recording'}
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
                                    {!isTrialMode && (
                                        <p className="text-xs text-green-600 text-center mt-1">
                                            AI analysis will begin after submission
                                        </p>
                                    )}
                                </div>
                            )}

                            {isAnalyzing && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 text-blue-700">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>AI is analyzing your submission... This may take a few minutes.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Additional Notes (Optional)
                            </label>
                            <Textarea
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                placeholder="Add any additional context or notes about your submission..."
                                className="min-h-20"
                            />
                        </div>

                        {/* Existing Submission */}
                        {existingSubmission && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-700 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="font-medium">Existing Submission Found</span>
                                </div>
                                <p className="text-sm text-blue-600">
                                    Status: <span className="capitalize">{existingSubmission.status}</span>
                                    {existingSubmission.duration_actual && (
                                        <span> • Duration: {formatTime(existingSubmission.duration_actual)}</span>
                                    )}
                                    {existingSubmission.score && (
                                        <span> • Score: {existingSubmission.score}/100</span>
                                    )}
                                </p>
                                <p className="text-xs text-blue-500 mt-1">
                                    You can record a new submission to replace your previous one.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
