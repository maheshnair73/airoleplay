import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import {
  MonitorUp,
  MonitorOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Play,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';
import ProductDemoAssistant from '@/components/roleplay/ProductDemoAssistant';
import { toast } from 'sonner';

const ProductDemoRoleplay = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [demoSession, setDemoSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState([]);

  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    loadSession();
    initializeSpeechRecognition();

    return () => {
      cleanup();
    };
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const { data: roleplayData, error: roleplayError } = await supabase
        .from('roleplay_sessions')
        .select(`
          *,
          ai_clients(*)
        `)
        .eq('id', sessionId)
        .single();

      if (roleplayError) throw roleplayError;
      setSession(roleplayData);

      const { data: demoData } = await supabase
        .from('product_demo_sessions')
        .select('*')
        .eq('roleplay_session_id', sessionId)
        .single();

      setDemoSession(demoData);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;

        if (event.results[current].isFinal) {
          handleTranscript(transcriptText);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      setRecognition(recognitionInstance);
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  };

  const handleTranscript = async (text) => {
    const newEntry = {
      timestamp: new Date().toISOString(),
      text,
      speaker: 'user'
    };

    setTranscript(prev => [...prev, newEntry]);

    if (text.length > 20) {
      await validateSpeech(text);
    }
  };

  const validateSpeech = async (spokenText) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/product-demo-analyzer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            spokenText,
            companyId: profile.company_id,
            productId: demoSession?.product_id
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log('Validation result:', result.validationResult);
      }
    } catch (error) {
      console.error('Error validating speech:', error);
    }
  };

  const startDemo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (recognition) {
        recognition.start();
      }

      setIsActive(true);
      toast.success('Demo started!');

      await supabase
        .from('roleplay_sessions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Error starting demo:', error);
      toast.error('Failed to start demo. Please check camera and microphone permissions.');
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always'
          },
          audio: false
        });

        setScreenStream(stream);
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }

        stream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          setScreenStream(null);
        };

        setScreenSharing(true);
        toast.success('Screen sharing started');

        await supabase
          .from('product_demo_sessions')
          .update({ screen_share_enabled: true })
          .eq('roleplay_session_id', sessionId);

      } catch (error) {
        console.error('Error sharing screen:', error);
        toast.error('Failed to share screen');
      }
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setScreenSharing(false);
      toast.info('Screen sharing stopped');
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endDemo = async () => {
    cleanup();

    await supabase
      .from('roleplay_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    toast.success('Demo completed!');
    navigate(`/product-demo-analysis/${sessionId}`);
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (recognition) {
      recognition.stop();
    }
    setIsActive(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Demo Roleplay</h1>
            <p className="text-sm text-gray-600 mt-1">
              {session?.ai_clients?.name} - {demoSession?.buyer_persona} buyer persona
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Live' : 'Not Started'}
            </Badge>
            {demoSession?.target_duration_minutes && (
              <Badge variant="outline">
                Target: {demoSession.target_duration_minutes} min
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Card className="relative overflow-hidden bg-black">
              <CardHeader className="absolute top-4 left-4 z-10">
                <CardTitle className="text-white text-sm">
                  {screenSharing ? 'Your Screen' : 'Your Video'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                {screenSharing ? (
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gray-900">
              <CardHeader className="absolute top-4 left-4 z-10">
                <CardTitle className="text-white text-sm">AI Client</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-16 h-16" />
                  </div>
                  <p className="text-lg font-medium">{session?.ai_clients?.name}</p>
                  <p className="text-sm text-gray-400">{demoSession?.buyer_persona} Buyer</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                {!isActive ? (
                  <Button
                    onClick={startDemo}
                    size="lg"
                    className="gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Demo
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={toggleScreenShare}
                      variant={screenSharing ? "default" : "outline"}
                      size="lg"
                      className="gap-2"
                    >
                      {screenSharing ? (
                        <>
                          <MonitorOff className="w-5 h-5" />
                          Stop Sharing
                        </>
                      ) : (
                        <>
                          <MonitorUp className="w-5 h-5" />
                          Share Screen
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={toggleVideo}
                      variant={videoEnabled ? "outline" : "secondary"}
                      size="lg"
                    >
                      {videoEnabled ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <VideoOff className="w-5 h-5" />
                      )}
                    </Button>

                    <Button
                      onClick={toggleAudio}
                      variant={audioEnabled ? "outline" : "secondary"}
                      size="lg"
                    >
                      {audioEnabled ? (
                        <Mic className="w-5 h-5" />
                      ) : (
                        <MicOff className="w-5 h-5" />
                      )}
                    </Button>

                    <Button
                      onClick={endDemo}
                      variant="destructive"
                      size="lg"
                      className="gap-2"
                    >
                      <PhoneOff className="w-5 h-5" />
                      End Demo
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {demoSession?.key_features_to_cover && demoSession.key_features_to_cover.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Key features to cover:</strong>{' '}
                {demoSession.key_features_to_cover.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <ProductDemoAssistant
          sessionId={sessionId}
          demoSession={demoSession}
          isActive={isActive}
          transcript={transcript}
        />
      </div>
    </div>
  );
};

export default ProductDemoRoleplay;
