import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, SkipBack, SkipForward, Clock, User, MessageSquare, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function CallTranscription({ sessionId, videoUrl }) {
    const [transcription, setTranscription] = useState(null);
    const [segments, setSegments] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeSegment, setActiveSegment] = useState(null);
    const videoRef = useRef(null);
    const segmentRefs = useRef({});

    useEffect(() => {
        if (sessionId) {
            loadTranscription();
        }
    }, [sessionId]);

    useEffect(() => {
        if (videoRef.current) {
            const video = videoRef.current;

            const handleTimeUpdate = () => {
                setCurrentTime(video.currentTime);
                updateActiveSegment(video.currentTime);
            };

            const handleDurationChange = () => {
                setDuration(video.duration);
            };

            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);

            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('durationchange', handleDurationChange);
            video.addEventListener('play', handlePlay);
            video.addEventListener('pause', handlePause);

            return () => {
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('durationchange', handleDurationChange);
                video.removeEventListener('play', handlePlay);
                video.removeEventListener('pause', handlePause);
            };
        }
    }, [videoRef.current, segments]);

    const loadTranscription = async () => {
        try {
            const { data: transcriptionData, error: transcriptionError } = await supabase
                .from('call_transcriptions')
                .select('*')
                .eq('session_id', sessionId)
                .maybeSingle();

            if (transcriptionError) throw transcriptionError;

            if (transcriptionData) {
                setTranscription(transcriptionData);

                const { data: segmentsData, error: segmentsError } = await supabase
                    .from('transcription_segments')
                    .select('*')
                    .eq('transcription_id', transcriptionData.id)
                    .order('start_time', { ascending: true });

                if (segmentsError) throw segmentsError;
                setSegments(segmentsData || []);
            }
        } catch (error) {
            console.error('Error loading transcription:', error);
        }
    };

    const updateActiveSegment = (time) => {
        const active = segments.find(
            seg => time >= parseFloat(seg.start_time) && time <= parseFloat(seg.end_time)
        );
        if (active && active.id !== activeSegment?.id) {
            setActiveSegment(active);
            if (segmentRefs.current[active.id]) {
                segmentRefs.current[active.id].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    };

    const handleSegmentClick = (segment) => {
        if (videoRef.current) {
            videoRef.current.currentTime = parseFloat(segment.start_time);
            videoRef.current.play();
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const skipTime = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getSpeakerColor = (speakerType, speakerName) => {
        if (speakerType === 'user') {
            return 'bg-blue-50 border-blue-200';
        }
        const hash = speakerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colors = [
            'bg-green-50 border-green-200',
            'bg-purple-50 border-purple-200',
            'bg-orange-50 border-orange-200',
            'bg-pink-50 border-pink-200'
        ];
        return colors[hash % colors.length];
    };

    const downloadTranscript = () => {
        const transcript = segments
            .map(seg => `[${formatTime(seg.start_time)}] ${seg.speaker_name}: ${seg.text}`)
            .join('\n\n');

        const blob = new Blob([transcript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${sessionId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Transcript downloaded');
    };

    const groupSegmentsBySpeaker = () => {
        const speakers = {};
        segments.forEach(seg => {
            if (!speakers[seg.speaker_name]) {
                speakers[seg.speaker_name] = [];
            }
            speakers[seg.speaker_name].push(seg);
        });
        return speakers;
    };

    if (!transcription && segments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Call Transcription
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No transcription available for this session yet.</p>
                        <p className="text-sm mt-2">Transcription will be generated after the call.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {videoUrl && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Play className="h-5 w-5" />
                                Call Recording
                            </span>
                            <Badge variant="outline">{formatTime(duration)}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                className="w-full h-full"
                                controls={false}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={(e) => {
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = parseFloat(e.target.value);
                                    }
                                }}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />

                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => skipTime(-10)}
                                >
                                    <SkipBack className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    onClick={togglePlayPause}
                                    className="h-12 w-12"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-5 w-5" />
                                    ) : (
                                        <Play className="h-5 w-5" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => skipTime(10)}
                                >
                                    <SkipForward className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Transcription
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadTranscript}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="timeline">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                            <TabsTrigger value="speaker">Speaker View</TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="mt-4">
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-3">
                                    {segments.map((segment) => (
                                        <div
                                            key={segment.id}
                                            ref={(el) => segmentRefs.current[segment.id] = el}
                                            onClick={() => handleSegmentClick(segment)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                getSpeakerColor(segment.speaker_type, segment.speaker_name)
                                            } ${
                                                activeSegment?.id === segment.id
                                                    ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]'
                                                    : 'hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {formatTime(segment.start_time)}
                                                    </Badge>
                                                    <div className="flex items-center gap-1 font-semibold text-sm">
                                                        <User className="h-3 w-3" />
                                                        {segment.speaker_name}
                                                    </div>
                                                </div>
                                                {segment.confidence && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {Math.round(segment.confidence * 100)}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm leading-relaxed">{segment.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="speaker" className="mt-4">
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-6">
                                    {Object.entries(groupSegmentsBySpeaker()).map(([speaker, speakerSegments]) => (
                                        <div key={speaker} className="space-y-2">
                                            <div className="flex items-center gap-2 sticky top-0 bg-background py-2">
                                                <User className="h-4 w-4" />
                                                <h3 className="font-semibold">{speaker}</h3>
                                                <Badge variant="secondary">{speakerSegments.length} segments</Badge>
                                            </div>
                                            <Separator />
                                            <div className="space-y-2 pl-6">
                                                {speakerSegments.map((segment) => (
                                                    <div
                                                        key={segment.id}
                                                        onClick={() => handleSegmentClick(segment)}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                            activeSegment?.id === segment.id
                                                                ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500'
                                                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <Badge variant="outline" className="text-xs mb-2">
                                                            {formatTime(segment.start_time)}
                                                        </Badge>
                                                        <p className="text-sm">{segment.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
