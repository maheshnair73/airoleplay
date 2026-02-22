
import React, { useState, useEffect, useRef } from 'react';
import { CallRecord } from '@/api/entities';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    Loader2, AlertTriangle, Users, Calendar, Clock, Phone, BrainCircuit, MessageSquare,
    Play, Pause, Rewind, FastForward, Volume2, Search, ThumbsUp, ThumbsDown, Lightbulb,
    Share2, Download, Bot, User as UserIcon, Send, ArrowLeft, Home, Filter,
    Target, TrendingUp, AlertCircle, CheckCircle, XCircle, MinusCircle, Link as LinkIcon, VideoOff,
    Activity, Eye, Mouse
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ScoreIndicator = ({ score, maxScore = 10, label, description, onMetricSelect, isSelected = false }) => {
    const percentage = (score / maxScore) * 100;
    const getColorClass = () => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusIcon = () => {
        if (percentage >= 80) return <CheckCircle className="w-4 h-4 text-green-500" />;
        if (percentage >= 60) return <MinusCircle className="w-4 h-4 text-yellow-500" />;
        return <XCircle className="w-4 h-4 text-red-500" />;
    };

    return (
        <button
            onClick={onMetricSelect}
            className={`flex items-center justify-between p-3 bg-white rounded-lg border text-left w-full transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'}`}
        >
            <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                    <p className="font-medium text-slate-800">{label}</p>
                    {description && <p className="text-xs text-slate-500">{description}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className={`text-lg font-bold ${getColorClass()}`}>
                    {score}/{maxScore}
                </div>
            </div>
        </button>
    );
};

const FrameworkSection = ({ title, items, maxScore = 10, onMetricSelect, selectedMetric }) => (
    <div className="space-y-3">
        <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">{title}</h4>
        <div className="space-y-2">
            {items.map((item, index) => (
                <ScoreIndicator
                    key={index}
                    score={item.score}
                    maxScore={maxScore}
                    label={item.label}
                    description={item.description}
                    onMetricSelect={() => onMetricSelect(item)}
                    isSelected={selectedMetric?.label === item.label}
                />
            ))}
        </div>
    </div>
);

const TranscriptItem = ({ item, onTimestampClick, isSearchMatch = false, isEvidence = false }) => {
    const isUser = item.speaker === 'user' || item.speaker === 'Speaker 0' || item.speaker?.toLowerCase().includes('rep');
    const speakerName = isUser ? 'Sales Rep' : 'Prospect';

    return (
        <div className={`flex gap-3 my-4 transition-all duration-300 rounded-lg ${isUser ? '' : 'flex-row-reverse'} ${isSearchMatch ? 'bg-yellow-50 border border-yellow-200' : ''} ${isEvidence ? 'ring-2 ring-offset-2 ring-blue-500 bg-blue-50' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xs ${isUser ? 'bg-blue-500' : 'bg-purple-500'}`}>
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-slate-800">{speakerName}</p>
                    <button
                        onClick={() => onTimestampClick(item.timestamp)}
                        className="text-xs text-slate-500 hover:text-blue-600 font-mono"
                    >
                        {new Date(item.timestamp * 1000).toISOString().substr(14, 5)}
                    </button>
                </div>
                <div className={`p-3 rounded-lg text-sm leading-relaxed ${isUser ? 'bg-blue-50' : 'bg-purple-50'}`}>
                    <p className="text-slate-800">{item.text}</p>
                </div>
            </div>
        </div>
    );
};

const MetricDetailView = ({ metric, onBack, onTimestampClick }) => {

    const formatCoachingText = (text) => {
        const timestampRegex = /\[(\d{1,2}:\d{2})\]/g;

        const parts = text.split(timestampRegex);

        return parts.map((part, index) => {
            // Even indices are regular text, odd indices are timestamps
            if (index % 2 === 1) {
                const timeParts = part.split(':').map(Number);
                const seconds = timeParts[0] * 60 + timeParts[1];
                return (
                    <button
                        key={index}
                        onClick={() => onTimestampClick(seconds)}
                        className="font-mono bg-blue-100 text-blue-700 px-1 py-0.5 rounded-sm hover:bg-blue-200 transition-colors"
                    >
                        {part}
                    </button>
                );
            }
            return part;
        });
    };

    return (
        <div className="p-4 pt-0 space-y-6">
            <Button variant="ghost" onClick={onBack} className="text-sm text-slate-600 hover:text-slate-900 -ml-3">
                <ArrowLeft className="w-4 h-4 mr-2"/>
                View full scorecard
            </Button>

            <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider">{metric.framework}</p>
                <h3 className="text-xl font-bold text-slate-800">{metric.label}</h3>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-blue-500"/>
                        Why were you scored this way?
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-slate-700">
                    <p>{metric.aiExplanation}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500"/>
                        What could you do differently next time?
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-slate-700 space-y-3">
                    {metric.aiCoaching.map((point, index) => (
                        <p key={index}>{formatCoachingText(point)}</p>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

const ParticipantCard = ({ participant, engagementData }) => {
    return (
        <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-semibold text-slate-800">{participant.name}</h4>
                    <p className="text-sm text-slate-500">{participant.role}</p>
                </div>
                <Badge className={`ml-auto ${participant.role === 'Sales Rep' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {participant.role}
                </Badge>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Talk Time
                    </span>
                    <span className="text-sm font-semibold">{engagementData?.talkTime || '45%'}</span>
                </div>
                <Progress value={parseInt(engagementData?.talkTime) || 45} className="h-2" />

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                        <div className="text-lg font-bold text-slate-800">{engagementData?.questionsAsked || '7'}</div>
                        <div className="text-xs text-slate-500">Questions Asked</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-slate-800">{engagementData?.sentiment || '0.8'}</div>
                        <div className="text-xs text-slate-500">Sentiment Score</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default function CallAnalysis() {
    const [call, setCall] = useState(null);
    const [lead, setLead] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTranscript, setFilteredTranscript] = useState([]);
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [highlightedEvidence, setHighlightedEvidence] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [backUrl, setBackUrl] = useState(createPageUrl('CallInsights'));
    const navigate = useNavigate();

    // Create mock call data for demo purposes - kept outside useEffect as it's not part of the outlined change
    const createMockCallData = (callId) => {
        return {
            id: callId,
            call_id: callId,
            caller_name: "Demo Sales Rep",
            caller_email: "demo@effysales.pro",
            prospect_name: "Demo Prospect",
            prospect_phone: "+1 (555) 123-4567",
            call_duration: 1200, // 20 minutes
            call_status: "completed",
            call_direction: "outbound",
            call_type: "discovery",
            created_date: new Date().toISOString(),
            recording_url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
            transcript: [
                {
                    speaker: 'user',
                    timestamp: 5,
                    text: "Hi, this is a demo transcript. Thanks for your time today."
                },
                {
                    speaker: 'prospect',
                    timestamp: 8,
                    text: "Hi there! Yes, I'm interested to learn more about your solution."
                },
                {
                    speaker: 'user',
                    timestamp: 15,
                    text: "Great! Let me start by understanding your current challenges. What's your biggest pain point right now?"
                },
                {
                    speaker: 'prospect',
                    timestamp: 20,
                    text: "We're struggling with lead qualification and our conversion rates aren't where we want them to be."
                },
                {
                    speaker: 'user',
                    timestamp: 50,
                    text: "But yeah, let's talk business. We're struggling with lead qualification."
                },
                {
                    speaker: 'user',
                    timestamp: 65,
                    text: "When you say conversion rates aren't where you want them, what's your current rate, and where would you ideally like to see it?"
                }
            ],
            ai_analysis: {
                overall_score: 75,
                summary: "This was a productive discovery call. The rep successfully identified key pain points around lead qualification and conversion rates. Good rapport building at the start, though there were missed opportunities to quantify the business impact.",
                sentiment_score: 0.7,
                talk_ratio: 0.4,
                questions_asked: [
                    "What's your biggest pain point right now?",
                    "How are you currently handling lead qualification?",
                    "What would success look like for you?"
                ],
                objections_raised: [
                    "We're already using a solution but it's not working well"
                ],
                key_topics: [
                    "Lead qualification",
                    "Conversion rates",
                    "Current process challenges"
                ],
                next_steps: [
                    "Schedule product demo",
                    "Send case study examples",
                    "Follow up next week"
                ],
                buying_signals: [
                    "Interested to learn more",
                    "Current solution isn't working well"
                ],
                pain_points: [
                    "Lead qualification challenges",
                    "Poor conversion rates"
                ]
            }
        };
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const callId = urlParams.get('id');
        const backPage = urlParams.get('back');

        if (backPage) {
            setBackUrl(createPageUrl(backPage));
        }

        if (!callId) {
            setError("No call ID provided in URL.");
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Try to fetch the call record
                let callData;
                // Preserve mock data generation logic, as it was in the original and outline didn't explicitly remove the function
                if (callId.includes('call_mtg_') || callId.includes('demo_')) {
                    console.log('Creating mock data for demo call:', callId);
                    callData = createMockCallData(callId);
                } else {
                    callData = await CallRecord.get(callId);
                }

                if (!callData) {
                    throw new Error("Call record not found.");
                }

                setCall(callData);

                // Try to load associated data
                if (callData.lead_id) {
                    try {
                        const leadData = await Lead.get(callData.lead_id);
                        setLead(leadData);
                    } catch (leadErr) {
                        console.warn("Associated lead not found:", leadErr);
                    }
                }
                if (callData.caller_email) {
                    try {
                        const userData = await User.filter({ email: callData.caller_email });
                        if(userData.length > 0) setUser(userData[0]);
                    } catch (userErr) {
                        console.warn("Associated user not found:", userErr);
                    }
                }
            } catch (err) {
                console.error("Error loading call data:", err);

                // Handle specific error types
                if (err.message?.includes('not found') || err.response?.status === 404) {
                    setError("This call record does not exist or has been deleted.");
                } else if (err.message?.includes('Unauthorized') || err.response?.status === 401) {
                    setError("You don't have permission to view this call record.");
                } else {
                    setError(err.message || "Failed to load call details. Please try again.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [navigate]); // Added navigate to dependency array for best practice

    useEffect(() => {
        if (call?.transcript) {
            const filtered = call.transcript.filter(item =>
                searchQuery === '' ||
                item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.speaker.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTranscript(filtered);
        }
    }, [call?.transcript, searchQuery]);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const seek = (seconds) => {
        if(videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
        }
    };

    const handleTimestampClick = (time) => {
        if(videoRef.current) {
            videoRef.current.currentTime = time;
            if(!isPlaying) {
                videoRef.current.play();
            }
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);
        const onLoadedMetadata = () => setDuration(video.duration); // Set duration once metadata is loaded

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded);
        video.addEventListener('loadedmetadata', onLoadedMetadata);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('ended', onEnded);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, [call]); // Re-run effect if call data changes, possibly new video

    const handleMetricSelect = (metric) => {
        if (selectedMetric?.label === metric.label) {
            setSelectedMetric(null);
            setHighlightedEvidence([]);
        } else {
            setSelectedMetric(metric);
            setHighlightedEvidence(metric.evidence || []);

            if (metric.evidence && metric.evidence.length > 0) {
                setTimeout(() => {
                    // Find the first relevant timestamp from the evidence
                    const firstEvidenceTimestamp = metric.evidence[0].timestamp;
                    const transcriptItemElement = document.getElementById(`transcript-item-${firstEvidenceTimestamp}`);
                    if (transcriptItemElement) {
                        transcriptItemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">Loading call analysis...</p>
                </div>
            </div>
        );
    }

    if (error || !call) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Call Not Found</h2>
                    <p className="text-slate-600 mb-6 text-lg">{error || "The call record you're looking for doesn't exist."}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </Button>
                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Link to={createPageUrl('CallInsights')}>
                                <Phone className="w-4 h-4" />
                                View All Calls
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-8 p-4 bg-slate-100 rounded-lg text-left">
                        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            What happened?
                        </h3>
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li>• The call record may have been deleted</li>
                            <li>• The link you followed might be outdated</li>
                            <li>• You might not have permission to view this call</li>
                            <li>• The call analysis may still be processing</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    const { ai_analysis: analysis, transcript } = call;
    const overallScore = analysis?.overall_score || Math.round((analysis?.sentiment_score || 0.5) * 100);

    const participants = [
        { name: call.caller_name || 'Sales Rep', role: 'Sales Rep', email: call.caller_email },
        { name: call.prospect_name || 'Prospect', role: 'Prospect', email: lead?.email }
    ].filter(p => p.name);

    const spicedScores = [
        { label: 'Situation', framework: 'SPICED', score: 2, description: 'Understanding prospect\'s current state', evidence: [{ timestamp: 8, text: "Yes. This is Cynthia. Who's calling?" }], aiExplanation: "The rep did not gather any background information on the prospect's current situation, tools, or processes. The conversation was brief and focused on the rep's introduction, missing the chance to establish context.", aiCoaching: ["After the prospect's initial greeting, the rep could have asked discovery questions like:", "- 'What are you currently using for lead qualification?'", "- 'What specific challenges are you facing with sales rep ramp time?'"] },
        { label: 'Pain', framework: 'SPICED', score: 8, description: 'Pain points identified and explored', evidence: [{ timestamp: 50, text: "But yeah, let's talk business. We're struggling with lead qualification." }], aiExplanation: "The rep successfully identified a clear pain point when the prospect explicitly mentioned their struggle with lead qualification.", aiCoaching: ["Excellent job identifying the pain point at [0:50]. To deepen the impact, you could have followed up with:", "- 'How does that struggle impact your team's quota attainment?'", "- 'What would it mean for your business if you could solve that?'"] },
        { label: 'Impact', framework: 'SPICED', score: 4, description: 'Business impact discussed', evidence: [], aiExplanation: "The rep did not explore the business or financial impact of the stated pain point (lead qualification). This is a missed opportunity to create urgency.", aiCoaching: ["When a pain point is raised, always tie it to a business metric. For example, after the prospect mentions struggling with lead qualification at [0:50], ask:", "- 'What's the financial cost of a poorly qualified lead for your team?'"] },
        { label: 'Critical Event', framework: 'SPICED', score: 3, description: 'Urgency factors identified', evidence: [], aiExplanation: "No critical event or compelling timeline was identified or created during the call. The conversation ended without a clear reason for the prospect to act now.", aiCoaching: ["Try to uncover or create urgency by asking questions like:", "- 'Is there an upcoming event, like a board meeting or new quarter, that makes solving this a priority?'", "- 'What happens if this isn't addressed in the next 3 months?'"] },
        { label: 'Decision', framework: 'SPICED', score: 5, description: 'Decision process understood', evidence: [], aiExplanation: "The call did not progress far enough to discuss the decision-making process, criteria, or key stakeholders involved.", aiCoaching: ["Once a pain point is qualified, it's crucial to understand the buying process. You could ask:", "- 'Who, besides yourself, is typically involved in evaluating new sales tools?'", "- 'What are the most important criteria for your team when choosing a solution?'"] }
    ];

    const meddpiccScores = [
        { label: 'Metrics', framework: 'MEDDPICC', score: 6, description: 'Quantifiable success metrics', evidence: [{ timestamp: 65, text: "When you say conversion rates aren't where you want them, what's your current rate, and where would you ideally like to see it?" }], aiExplanation: "The rep attempted to quantify the prospect's pain by asking about their current and ideal conversion rates, which is a good first step.", aiCoaching: ["Great start on metrics at [1:05]. To make it stronger, tie it to a dollar value:", "- 'If you could get to that ideal rate, what would that mean in terms of additional revenue per quarter?'"] },
        { label: 'Identify Pain', framework: 'MEDDPICC', score: 8, description: 'Core pain points discovered', evidence: [{ timestamp: 50, text: "But yeah, let's talk business. We're struggling with lead qualification." }], aiExplanation: "The rep successfully uncovered a primary pain point directly from the prospect.", aiCoaching: ["You did well to get the prospect to state their pain at [0:50]. The next step is to explore the root cause and consequences of that pain."] },
        { label: 'Champion', framework: 'MEDDPICC', score: 2, description: 'Internal advocate identified', evidence: [], aiExplanation: "The call did not identify or test if the prospect could act as an internal champion who would sell on the rep's behalf.", aiCoaching: ["To build a champion, you need to understand their personal win. Ask questions like:", "- 'How would solving this lead qualification issue help you in your role?'"] },
    ];


    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link to={backUrl} className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Call with {call.prospect_name || 'Unknown Prospect'}
                            </h1>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    {participants.length} Participants
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(call.created_date), 'PPP')}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {formatTime(call.call_duration)}
                                </span>
                                <Badge className="bg-blue-100 text-blue-800">
                                    Score: {overallScore}/100
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </div>
            </header>

            <main className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Video and Transcript Panel (Left) */}
                    <div className="space-y-6">
                        {/* Video Player */}
                        <Card className="shadow-lg">
                            <CardContent className="p-0">
                                {call.recording_url ? (
                                    <video
                                        ref={videoRef}
                                        src={call.recording_url}
                                        className="w-full rounded-t-lg bg-black aspect-video"
                                        controls={false}
                                    />
                                ) : (
                                    <div className="w-full aspect-video bg-slate-800 flex items-center justify-center text-slate-400 rounded-t-lg">
                                        <VideoOff className="w-12 h-12" />
                                        <p className="ml-2 text-xl">No recording available</p>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 px-4 py-3">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            onClick={handlePlayPause}
                                            size="icon"
                                            className="bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full"
                                            disabled={!call.recording_url}
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                                        </Button>
                                        <div className="flex-1 flex items-center gap-3">
                                            <span className="text-sm font-mono text-slate-600 min-w-[40px]">{formatTime(currentTime)}</span>
                                            <Progress value={duration ? (currentTime / duration) * 100 : 0} className="h-2" />
                                            <span className="text-sm font-mono text-slate-400 min-w-[40px]">{formatTime(duration)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transcript */}
                        <Card className="shadow-lg max-h-[50vh] flex flex-col">
                            <CardHeader className="flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Transcript</CardTitle>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="Search..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 w-48"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-1">
                                {transcript?.length > 0 ? (
                                    (searchQuery ? filteredTranscript : transcript).map((item, i) => {
                                        const isEvidence = highlightedEvidence.some(e => e.timestamp === item.timestamp);
                                        const isSearchMatchItem = searchQuery && item.text.toLowerCase().includes(searchQuery.toLowerCase());
                                        return (
                                            <div key={`transcript-item-container-${item.timestamp || i}`} id={`transcript-item-${item.timestamp}`}>
                                                <TranscriptItem
                                                    item={item}
                                                    onTimestampClick={handleTimestampClick}
                                                    isSearchMatch={isSearchMatchItem}
                                                    isEvidence={isEvidence}
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                                        <p>No transcript available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Analysis Panel (Right) */}
                    <div className="space-y-6">
                        {selectedMetric ? (
                            <MetricDetailView
                                metric={selectedMetric}
                                onBack={() => {
                                    setSelectedMetric(null);
                                    setHighlightedEvidence([]);
                                }}
                                onTimestampClick={handleTimestampClick}
                            />
                        ) : (
                            <Tabs defaultValue="participants" className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="participants">Participants</TabsTrigger>
                                    <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
                                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                                    <TabsTrigger value="objections">Objections</TabsTrigger>
                                </TabsList>

                                <TabsContent value="participants" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="w-5 h-5 text-blue-500" />
                                                Call Participants ({participants.length})
                                            </CardTitle>
                                            <CardDescription>Engagement metrics and participation data</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {participants.map((participant, index) => (
                                                <ParticipantCard
                                                    key={index}
                                                    participant={participant}
                                                    engagementData={{
                                                        talkTime: participant.role === 'Sales Rep' ? '60%' : '40%',
                                                        questionsAsked: participant.role === 'Sales Rep' ? '7' : '2',
                                                        sentiment: participant.role === 'Sales Rep' ? '0.8' : '0.7'
                                                    }}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="scorecard" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">Overall Score</CardTitle>
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {overallScore}/100
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Progress value={overallScore} className="h-3" />
                                            <p className="text-sm text-slate-600 mt-2">
                                                {overallScore >= 80 ? 'Excellent call performance' :
                                                 overallScore >= 60 ? 'Good call with room for improvement' :
                                                 'Call needs significant improvement'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-1 gap-6">
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Target className="w-5 h-5 text-red-500" />
                                                    SPICED
                                                </CardTitle>
                                                <CardDescription>Sales qualification methodology</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <FrameworkSection title="SPICED FRAMEWORK" items={spicedScores} onMetricSelect={handleMetricSelect} selectedMetric={selectedMetric} />
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                                    MEDDPICC
                                                </CardTitle>
                                                <CardDescription>Enterprise sales methodology</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <FrameworkSection title="MEDDPICC FRAMEWORK" items={meddpiccScores} onMetricSelect={handleMetricSelect} selectedMetric={selectedMetric} />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="analytics" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Talk Metrics</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {Math.round((analysis?.talk_ratio || 0.5) * 100)}%
                                                    </div>
                                                    <div className="text-sm text-slate-600">Rep Talk Time</div>
                                                </div>
                                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {(analysis?.questions_asked || []).length}
                                                    </div>
                                                    <div className="text-sm text-slate-600">Questions Asked</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Key Topics</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {(analysis?.key_topics || ['Pricing', 'Features', 'Timeline']).map(topic => (
                                                    <Badge key={topic} variant="outline">{topic}</Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Next Steps</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {(analysis?.next_steps || ['Follow up with proposal', 'Schedule demo']).map((step, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                        <span className="text-sm">{step}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="feedback" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Lightbulb className="w-5 h-5 text-yellow-500" />
                                                AI Coaching Feedback
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                                                <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                                                    <ThumbsUp className="w-4 h-4"/>
                                                    What Went Well
                                                </h4>
                                                <ul className="text-sm text-green-700 space-y-1">
                                                    <li>• Excellent rapport building at the start</li>
                                                    <li>• Good discovery questions about pain points</li>
                                                    <li>• Professional handling of price objections</li>
                                                </ul>
                                            </div>
                                            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                                                <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-2">
                                                    <Lightbulb className="w-4 h-4"/>
                                                    Opportunities for Improvement
                                                </h4>
                                                <ul className="text-sm text-orange-700 space-y-1">
                                                    <li>• Could have asked more clarifying questions about budget</li>
                                                    <li>• Missed opportunity to discuss decision timeline</li>
                                                    <li>• Should have confirmed next steps more clearly</li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="objections" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Objections Raised</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {(analysis?.objections_raised || []).length > 0 ? (
                                                <div className="space-y-4">
                                                    {(analysis.objections_raised || []).map((objection, i) => (
                                                        <div key={i} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                                                            <p className="font-medium text-red-800 mb-1">"{objection}"</p>
                                                            <p className="text-sm text-red-600">Handled: Yes</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                                    <p>No major objections identified in this call</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
