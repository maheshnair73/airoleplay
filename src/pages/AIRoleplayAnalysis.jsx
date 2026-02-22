
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { RoleplaySession } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft, Play, Pause, Volume2, MessageSquare,
    CheckCircle, XCircle, BarChart3, Clock, Target,
    Brain, TrendingUp, Award, FileText, Bot, Repeat, PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function AIRoleplayAnalysis() {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionNotFound, setSessionNotFound] = useState(false);
    const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = React.useRef(null);

    const location = useLocation();
    const navigate = useNavigate(); // Initialize useNavigate
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('id');

    const createMockSession = useCallback((id) => {
        // Define different mock sessions based on ID
        const baseMockSession = {
            id: id,
            bot_name: 'Kathy Wood',
            bot_personality: 'VP of Sales',
            scenario: 'Discovery Call Practice',
            created_date: '2024-02-08T14:30:00Z',
            session_duration: 420,
            call_type: 'discovery',
            audio_url: 'https://example.com/audio-call-' + id + '.mp3',
            transcript: [
                {
                    speaker: 'ai',
                    text: "Hi there! Thanks for taking the time to speak with me today. I'm Kathy, VP of Sales here at TechCorp. How's your day going?",
                    timestamp: '2024-02-08T14:30:15Z',
                    timeInSeconds: 0
                },
                {
                    speaker: 'user',
                    text: "Hi Kathy, nice to meet you. My day's been pretty busy, but I'm glad we could connect.",
                    timestamp: '2024-02-08T14:30:25Z',
                    timeInSeconds: 10
                },
                {
                    speaker: 'ai',
                    text: "I completely understand. Before we dive in, I noticed on your LinkedIn you're a big fan of hiking. Have you been on any good trails lately?",
                    timestamp: '2024-02-08T14:30:35Z',
                    timeInSeconds: 20
                },
                {
                    speaker: 'user',
                    text: "Wow, great research! I just got back from Yosemite. It was amazing. But yeah, let's talk business. We're struggling with lead qualification.",
                    timestamp: '2024-02-08T14:30:50Z',
                    timeInSeconds: 35
                },
                {
                    speaker: 'ai',
                    text: "Yosemite is incredible. Okay, focusing on lead qualification—that's a common challenge. When you say conversion rates aren't where you want them, what's your current rate, and where would you ideally like to see it?",
                    timestamp: '2024-02-08T14:31:05Z',
                    timeInSeconds: 50
                },
                {
                    speaker: 'user',
                    text: "Right now we're at about 8%, and honestly, we'd like to be closer to 15% or even 20%. We're spending so much time on leads that go nowhere.",
                    timestamp: '2024-02-08T14:31:22Z',
                    timeInSeconds: 67
                },
                {
                    speaker: 'ai',
                    text: "That's a significant gap. What do you think is causing that? Is it a data quality issue, or is it more about your team's ability to identify the right leads?",
                    timestamp: '2024-02-08T14:31:38Z',
                    timeInSeconds: 83
                },
                {
                    speaker: 'user',
                    text: "I think it's a bit of both. Our data isn't always accurate, and sometimes our reps spend time on companies that aren't even in our ICP.",
                    timestamp: '2024-02-08T14:31:52Z',
                    timeInSeconds: 97
                },
                {
                    speaker: 'ai',
                    text: "Got it. And what's the impact of this on your team? Are they frustrated? Is it affecting morale?",
                    timestamp: '2024-02-08T14:32:05Z',
                    timeInSeconds: 110
                },
                {
                    speaker: 'user',
                    text: "Definitely. My top performers are getting burned out chasing bad leads. It's a real problem.",
                    timestamp: '2024-02-08T14:32:18Z',
                    timeInSeconds: 123
                },
                {
                    speaker: 'ai',
                    text: "I can see how that would be a major concern. Have you tried any solutions to address this so far?",
                    timestamp: '2024-02-08T14:32:30Z',
                    timeInSeconds: 135
                },
                {
                    speaker: 'user',
                    text: "We're using ZoomInfo for data, but we're still having issues with accuracy and enrichment.",
                    timestamp: '2024-02-08T14:32:42Z',
                    timeInSeconds: 147
                },
                {
                    speaker: 'ai',
                    text: "ZoomInfo is a solid tool. Many of our customers actually use us alongside ZoomInfo to enrich their data further and improve qualification accuracy. What's been your experience with their data quality specifically?",
                    timestamp: '2024-02-08T14:33:00Z',
                    timeInSeconds: 165
                },
                {
                    speaker: 'user',
                    text: "It's decent, but we still find a lot of outdated contacts and missing information. Plus, it doesn't really help us prioritize which leads to focus on first.",
                    timestamp: '2024-02-08T14:33:18Z',
                    timeInSeconds: 183
                },
                {
                    speaker: 'ai',
                    text: "That makes sense. If you could wave a magic wand and fix one thing about your lead qualification process today, what would it be?",
                    timestamp: '2024-02-08T14:33:35Z',
                    timeInSeconds: 200
                },
                {
                    speaker: 'user',
                    text: "I'd want real-time insights on which leads are most likely to convert, so my team isn't wasting time on dead ends.",
                    timestamp: '2024-02-08T14:33:50Z',
                    timeInSeconds: 215
                },
                {
                    speaker: 'ai',
                    text: "That's exactly what our platform helps with. We use AI to score and prioritize leads based on conversion probability. Would it make sense to schedule a quick 20-minute demo next week so I can show you how it works?",
                    timestamp: '2024-02-08T14:34:10Z',
                    timeInSeconds: 235
                },
                {
                    speaker: 'user',
                    text: "Yeah, that could be interesting. Let me check my calendar. How about Tuesday at 2 PM?",
                    timestamp: '2024-02-08T14:34:25Z',
                    timeInSeconds: 250
                },
                {
                    speaker: 'ai',
                    text: "Tuesday at 2 PM works perfectly. I'll send you a calendar invite with a link to the demo. In the meantime, is there anything specific you'd like me to prepare or focus on?",
                    timestamp: '2024-02-08T14:34:40Z',
                    timeInSeconds: 265
                },
                {
                    speaker: 'user',
                    text: "Just show me how it integrates with our existing tools and what kind of ROI we can expect.",
                    timestamp: '2024-02-08T14:34:55Z',
                    timeInSeconds: 280
                },
                {
                    speaker: 'ai',
                    text: "Perfect. I'll prepare some case studies from similar companies in your industry. Looking forward to it, and thanks for your time today!",
                    timestamp: '2024-02-08T14:35:10Z',
                    timeInSeconds: 295
                },
                {
                    speaker: 'user',
                    text: "Sounds good. Thanks, Kathy!",
                    timestamp: '2024-02-08T14:35:20Z',
                    timeInSeconds: 305
                }
            ],
            analysis_results: {
                overall_score: 78,
                talk_listen_ratio: 45,
                filler_words: 8,
                questions_count: 7,
                longest_monologue: 45,
                talk_speed_wpm: 142,
                summary: "The agent started with good rapport-building but could have tied it back to the business conversation more smoothly. They successfully identified a key pain point (lead qualification) but missed an opportunity to explore the financial impact before jumping to metrics. The call ended with a clear, but not confirmed, next step.",
                objections: [
                    { objection: "I'm not interested in buying customer data right now.", response: "I understand, and I'm not here to sell you data today. I'm here to understand if the challenges you face with lead qualification are something we might be able to help with down the line." },
                    { objection: "We're already using ZoomInfo.", response: "That's great, they're a solid tool. Many of our customers use us alongside ZoomInfo to enrich the data they already have and improve qualification accuracy. What's been your experience with their data quality?" }
                ],
                questions_asked: [
                    "How's your day going?",
                    "Could you tell me a bit about your current sales process?",
                    "What's your current conversion rate, and where would you ideally like to see it?"
                ],
                what_went_well: [
                    { title: "Rapport Building", text: "Used personal information from LinkedIn to build initial rapport." },
                    { title: "Open-Ended Questions", text: "Asked questions that encouraged the prospect to elaborate on their challenges." },
                ],
                areas_for_improvement: [
                    { title: "Probing Deeper", text: "Could have asked 'What's the financial impact of poor lead qualification?' to create more urgency." },
                    { title: "Handling Objections", text: "When the prospect mentioned using a competitor, the agent could have explored their satisfaction level more before positioning their own product." },
                ],
                scorecard: [
                    {
                        category: "Opener",
                        score: "1/2",
                        criteria: [
                            { text: "Permission based opener?", passed: false },
                            { text: "Used research on prospect?", passed: true }
                        ]
                    },
                    {
                        category: "Social Proof",
                        score: "0/2",
                        criteria: [
                            { text: "Provided social proof?", passed: false },
                            { text: "Asked if social proof was relevant?", passed: false }
                        ]
                    },
                    {
                        category: "Discovery",
                        score: "1/2",
                        criteria: [
                            { text: "SDR asked for preconceptions of product?", passed: false },
                            { text: "Asked for success criteria for next call?", passed: true }
                        ]
                    },
                    {
                        category: "Closing",
                        score: "1/2",
                        criteria: [
                            { text: "Next steps agreed upon?", passed: true },
                            { text: "Follow-up meeting booked?", passed: false }
                        ]
                    }
                ]
            },
            bot_configuration: JSON.stringify({
                id: 'mock_bot_1',
                name: 'Kathy Wood',
                title: 'VP of Sales',
                company_name: 'TechCorp',
                personality: 'Professional, Analytical',
                roleplay_type: 'discovery',
                voice: 'english_male',
                language: 'english',
                traits: ['Professional', 'Analytical', 'Challenging'],
                painPoints: ['Lead qualification', 'Sales cycle length', 'Conversion rates'],
                background: 'Kathy Wood is a VP of Sales at TechCorp, a growing B2B SaaS company. She\'s generally open to new solutions but is also skeptical of flashy sales pitches and prioritizes demonstrable ROI. She\'s currently focused on improving lead quality and sales efficiency.',
                difficulty: 'Medium'
            })
        };

        // Customize based on different session IDs
        const variations = {
            '2': {
                scenario: 'Cold Call Opening',
                session_duration: 280,
                call_type: 'cold_call',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 73 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'John Doe', title: 'IT Manager', roleplay_type: 'cold_call', personality: 'Busy, Direct' })
            },
            '3': {
                scenario: 'Product Demo Walkthrough',
                session_duration: 510,
                call_type: 'demo',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 91 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Sarah Chen', title: 'Product Owner', roleplay_type: 'demo', personality: 'Detail-oriented, Technical' })
            },
            '4': {
                scenario: 'Follow-up Call Strategy',
                session_duration: 320,
                call_type: 'follow_up',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 79 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Michael Lee', title: 'CFO', roleplay_type: 'follow_up', personality: 'Budget-focused, Strategic' })
            },
            '5': {
                scenario: 'Objection Handling Practice',
                session_duration: 380,
                call_type: 'objection_handling',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 68 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Emily White', title: 'Procurement Specialist', roleplay_type: 'objection_handling', personality: 'Challenging, Cost-conscious' })
            },
            '6': {
                scenario: 'Pricing Discussion',
                session_duration: 450,
                call_type: 'pricing',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 85 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'David Kim', title: 'Head of Operations', roleplay_type: 'pricing', personality: 'Value-driven, Negotiator' })
            },
            '7': {
                scenario: 'Competitive Positioning',
                session_duration: 290,
                call_type: 'competitive',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 82 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Jessica Green', title: 'Marketing Director', roleplay_type: 'competitive', personality: 'Brand-focused, Comparative' })
            },
            '8': {
                scenario: 'Closing Techniques',
                session_duration: 340,
                call_type: 'closing',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 76 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Robert Blue', title: 'CEO', roleplay_type: 'closing', personality: 'Decision-maker, Bottom-line focused' })
            },
            '9': {
                scenario: 'Discovery Call - Enterprise Client',
                session_duration: 390,
                call_type: 'discovery',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 84 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Linda Brown', title: 'Enterprise Account Manager', roleplay_type: 'discovery', personality: 'Complex needs, Strategic' })
            },
            '10': {
                scenario: 'Warm Call Follow-up',
                session_duration: 250,
                call_type: 'warm_call',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 89 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Steven Gray', title: 'Small Business Owner', roleplay_type: 'warm_call', personality: 'Friendly, Time-conscious' })
            },
            '11': {
                scenario: 'Technical Demo',
                session_duration: 600,
                call_type: 'demo',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 77 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Alex Wong', title: 'Lead Developer', roleplay_type: 'demo', personality: 'Technical, In-depth questions' })
            },
            '12': {
                scenario: 'Contract Negotiation',
                session_duration: 480,
                call_type: 'negotiation',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 92 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Olivia White', title: 'Legal Counsel', roleplay_type: 'negotiation', personality: 'Risk-averse, Detailed' })
            }
        };

        return { ...baseMockSession, ...(variations[id] || {}) };
    }, []);

    const loadSession = useCallback(async () => {
        setIsLoading(true);
        if (sessionId) {
            try {
                const sessionData = await RoleplaySession.get(sessionId);

                // Transform database session to match the expected format
                const transformedSession = {
                    id: sessionData.id,
                    bot_name: sessionData.transcript?.bot_name || 'AI Bot',
                    bot_personality: sessionData.transcript?.bot_personality || 'AI Assistant',
                    scenario: sessionData.session_name || sessionData.scenario_type,
                    created_date: sessionData.created_at,
                    session_duration: sessionData.duration,
                    call_type: sessionData.scenario_type,
                    transcript: sessionData.transcript?.exchanges || [],
                    analysis_results: {
                        overall_score: sessionData.score || 0,
                        summary: sessionData.feedback || 'Session completed successfully.',
                        objections: [],
                        questions_asked: [],
                        what_went_well: [],
                        areas_for_improvement: [],
                        scorecard: []
                    },
                    bot_configuration: JSON.stringify({
                        name: sessionData.transcript?.bot_name || 'AI Bot',
                        personality: sessionData.transcript?.bot_personality || 'Professional'
                    })
                };

                setSession(transformedSession);
                setSessionNotFound(false);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading session:', error);
                // If database fetch fails, check if it's a demo session ID
                if (/^[1-9]$|^1[0-9]$|^20$/.test(sessionId)) {
                    setSession(createMockSession(sessionId));
                    setSessionNotFound(false);
                } else {
                    setSessionNotFound(true);
                }
                setIsLoading(false);
            }
        } else {
            setSessionNotFound(true);
            setIsLoading(false);
        }
    }, [sessionId, createMockSession]);

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const handleSeekToTime = (timeInSeconds) => {
        if (audioRef.current) {
            audioRef.current.currentTime = timeInSeconds;
            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const TranscriptViewer = ({ transcript }) => (
        <div className="space-y-4 max-h-96 overflow-y-auto bg-slate-50 p-4 rounded-lg">
            {transcript.map((item, index) => (
                <div
                    key={index}
                    className={`flex gap-3 ${item.speaker === 'user' ? 'justify-end' : 'justify-start'} group cursor-pointer hover:bg-slate-100/50 p-2 rounded-lg transition-colors`}
                    onClick={() => handleSeekToTime(item.timeInSeconds || 0)}
                >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                        item.speaker === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-slate-200'
                    }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 opacity-50" />
                            <span className="text-xs font-medium opacity-70">
                                {formatTime(item.timeInSeconds || 0)}
                            </span>
                            <span className="text-xs opacity-50">
                                {item.speaker === 'user' ? 'You' : session?.bot_name}
                            </span>
                        </div>
                        <p className="text-sm">{item.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const ScorecardView = ({ scorecard }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {scorecard?.map((category, idx) => (
                <div key={idx}>
                    <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-semibold text-slate-800">{category.category}</h4>
                        <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{category.score}</span>
                    </div>
                    <div className="space-y-2">
                        {category.criteria?.map((criterion, criterionIdx) => (
                            <div key={criterionIdx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                                {criterion.passed ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                )}
                                <span className="text-sm text-slate-700">{criterion.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const handlePracticeAgain = () => {
        if (!session) return; // Ensure session data is available

        // Navigate to a unique practice session URL instead of back to the main list
        // Note: The bot_configuration parsing logic is removed as AIRoleplayPractice expects
        // simpler parameters like bot_name and original_session ID.
        const practiceUrl = createPageUrl(`AIRoleplayPractice?bot_name=${encodeURIComponent(session.bot_name)}&session_type=repeat&original_session=${session.id}`);
        window.location.href = practiceUrl;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading analysis...</p>
                </div>
            </div>
        );
    }

    if (sessionNotFound) {
        return (
            <div className="p-6">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Session Not Found</h2>
                    <p className="text-slate-600 mb-6">The session you're looking for doesn't exist or may have been deleted.</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" asChild>
                            <Link to={createPageUrl('AIRoleplayHistory')}>View All Sessions</Link>
                        </Button>
                        <Button asChild>
                            <Link to={createPageUrl('AIRoleplay')}>Start New Session</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        // This case should ideally not be reached if sessionNotFound and isLoading are handled correctly,
        // but it's a good fallback for robustness.
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">Session data could not be loaded.</p>
                    <Button asChild>
                        <Link to={createPageUrl('AIRoleplay')}>Back to AI Roleplay</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link to={createPageUrl('AIRoleplayHistory')}>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Session Analysis</h1>
                            <p className="text-slate-600">{session.scenario}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={`${getScoreColor(session.analysis_results?.overall_score || 0)} font-bold px-3 py-1`}>
                            {session.analysis_results?.overall_score || 0}% Overall
                        </Badge>
                    </div>
                </div>

                {/* Audio Player */}
                {session.audio_url && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={togglePlayPause}
                                    className="h-12 w-12 rounded-full"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-5 w-5" />
                                    ) : (
                                        <Play className="h-5 w-5 ml-0.5" />
                                    )}
                                </Button>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={currentTime}
                                        onChange={(e) => {
                                            const time = parseFloat(e.target.value);
                                            setCurrentTime(time);
                                            if (audioRef.current) {
                                                audioRef.current.currentTime = time;
                                            }
                                        }}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <Volume2 className="h-5 w-5 text-slate-400" />
                            </div>
                            <audio
                                ref={audioRef}
                                src={session.audio_url}
                                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                                onLoadedMetadata={(e) => setDuration(e.target.duration)}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Click on any transcript message to jump to that timestamp
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Session Overview */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-600" />
                            Session Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Clock className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Duration</p>
                                <p className="text-lg font-bold">{formatDuration(session.session_duration)}</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Exchanges</p>
                                <p className="text-lg font-bold">{session.transcript?.length || 0}</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Target className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Bot Personality</p>
                                <p className="text-lg font-bold">{session.bot_personality}</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Award className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Call Type</p>
                                <p className="text-lg font-bold">{session.call_type?.replace('_', ' ') || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="feedback" className="space-y-6">
                    <TabsList className="grid grid-cols-3 w-full md:w-fit">
                        <TabsTrigger value="feedback" className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Feedback & Scorecard
                        </TabsTrigger>
                        <TabsTrigger value="transcript" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Transcript
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Key Moments
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="feedback" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none prose-slate mb-8">
                                    <p>{session.analysis_results?.summary || 'No summary available.'}</p>
                                </div>

                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Evaluation Scorecard</h3>
                                {session.analysis_results?.scorecard?.length > 0 ? (
                                    <ScorecardView scorecard={session.analysis_results.scorecard} />
                                ) : (
                                    <p className="text-slate-500 text-center py-8">No detailed scorecard available for this session.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transcript">
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversation Transcript</CardTitle>
                                <p className="text-sm text-slate-600">Review the full conversation flow</p>
                            </CardHeader>
                            <CardContent>
                                <TranscriptViewer transcript={session.transcript} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="insights">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600 mb-1">Talk/Listen Ratio</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {session.analysis_results?.talk_listen_ratio || 45}%
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Recommended: 30-40%
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600 mb-1">Filler Words</p>
                                            <p className="text-2xl font-bold text-yellow-600">
                                                {session.analysis_results?.filler_words || 0}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Recommended: 0-5
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600 mb-1">Questions Asked</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {session.analysis_results?.questions_count || 0}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Great discovery!
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600 mb-1">Talk Speed</p>
                                            <p className="text-2xl font-bold text-slate-700">
                                                {session.analysis_results?.talk_speed_wpm || 0} wpm
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Recommended: 120-150
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-blue-600">Key Objections & Rep Responses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {session.analysis_results?.objections?.map((item, index) => (
                                            <li key={index} className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                                <p className="text-sm font-semibold text-slate-600 mb-1">Objection: "{item.objection}"</p>
                                                <p className="text-sm text-slate-800">Response: "{item.response}"</p>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-green-600">What Went Well</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {session.analysis_results?.what_went_well?.map((item, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold">{item.title}</h4>
                                                        <p className="text-sm text-slate-600">{item.text}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {session.analysis_results?.areas_for_improvement?.map((item, index) => (
                                                 <li key={index} className="flex items-start gap-3">
                                                    <XCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold">{item.title}</h4>
                                                        <p className="text-sm text-slate-600">{item.text}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Next Steps
                        </CardTitle>
                        <CardDescription>Continue improving your sales skills.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap justify-center gap-4">
                        <Button
                            onClick={handlePracticeAgain}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                            <Repeat className="w-4 h-4" />
                            Practice this Scenario Again
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to={createPageUrl('AIRoleplay')} className="flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Start a New Session
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to={createPageUrl('AIRoleplayHistory')} className="flex items-center gap-2">
                                <Bot className="w-4 h-4" />
                                View All Bot Sessions
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
