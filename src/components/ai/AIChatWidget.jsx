
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, Loader2, Mic, Phone, PhoneOff, Minimize2, MicOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InvokeLLM } from '@/api/integrations';
import { User } from '@/api/entities';
import { toast } from 'sonner';
import eventBus from '@/components/utils/eventBus';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const defaultAgentSettings = {
    agent_name: 'Effy',
    agent_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80',
    voice_settings: {
        voice_name: 'Microsoft Zira Desktop - English (United States)',
        rate: 0.9,
        pitch: 1.1,
        volume: 0.9
    }
};

// Global variables for speech synthesis
let speechSynthesisInstance = null;
let currentUtterance = null;

// Varied error responses to avoid repetition
const errorResponses = [
    "Sorry, I'm having trouble connecting. Can you try again?",
    "Hmm, something went wrong on my end. Could you repeat that?",
    "I seem to have lost you there. Mind trying once more?",
    "Oops, technical hiccup! Can you give that another shot?",
    "I didn't catch that properly. Could you say it again?"
];

let errorResponseIndex = 0;

const getNextErrorResponse = () => {
    const response = errorResponses[errorResponseIndex];
    errorResponseIndex = (errorResponseIndex + 1) % errorResponses.length;
    return response;
};

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [agentSettings, setAgentSettings] = useState(defaultAgentSettings);
    const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(false);
    const [conversationState, setConversationState] = useState('greeting');
    const [typingText, setTypingText] = useState('');
    const [isTypingEffect, setIsTypingEffect] = useState(false);
    const [callStartTime, setCallStartTime] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [voices, setVoices] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMicMuted, setIsMicMuted] = useState(false);
    
    const messageListRef = useRef(null);
    const typingIntervalRef = useRef(null);
    const callTimerRef = useRef(null);
    const speakRef = useRef(null);
    const recognitionRef = useRef(null);
    const recognitionStateRef = useRef('stopped');
    const handleSendMessageRef = useRef(null);
    const listeningTimeoutRef = useRef(null);
    const isComponentMountedRef = useRef(true);

    // Check for Web Speech API support
    const voiceEnabled = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

    const scrollToBottom = useCallback(() => {
        if (messageListRef.current) {
            setTimeout(() => {
                messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
            }, 100);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTypingEffect, scrollToBottom]);

    // Call timer
    useEffect(() => {
        if (isCallActive && callStartTime) {
            callTimerRef.current = setInterval(() => {
                setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
            }, 1000);
        } else {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        }
        return () => {
            if (callTimerRef.current) {
                clearInterval(callTimerRef.current);
            }
        };
    }, [isCallActive, callStartTime]);

    // Format call duration
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Load available system voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
            loadVoices();
        }

        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            }
        };
    }, []);

    // Load user's agent settings and current user info
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
                
                if (user?.ai_agent_settings) {
                    setAgentSettings(prev => ({ 
                        ...prev, 
                        ...user.ai_agent_settings,
                        voice_settings: {
                            ...prev.voice_settings,
                            ...(user.ai_agent_settings.voice_settings || {})
                        }
                    }));
                }
            } catch (error) {
                console.warn("Using default agent settings");
            }
        };
        loadUserData();
    }, []);

    // Clean up function
    const cleanupSpeechAndRecognition = useCallback(() => {
        // Clear timeouts
        if (listeningTimeoutRef.current) {
            clearTimeout(listeningTimeoutRef.current);
            listeningTimeoutRef.current = null;
        }

        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }

        // Stop speech synthesis
        if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
            try {
                window.speechSynthesis.cancel();
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        // Stop speech recognition
        if (recognitionRef.current && recognitionStateRef.current === 'listening') {
            try {
                recognitionRef.current.stop();
                recognitionStateRef.current = 'stopped';
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        // Reset states
        setIsSpeaking(false);
        setIsListening(false);
        setIsTypingEffect(false);
        setTypingText('');
    }, []);

    // Typing effect for AI messages
    const typeMessage = useCallback((text, callback) => {
        if (!isComponentMountedRef.current) return;
        
        setIsTypingEffect(true);
        setTypingText('');
        let index = 0;
        
        const typeInterval = setInterval(() => {
            if (!isComponentMountedRef.current || index >= text.length) {
                clearInterval(typeInterval);
                if (isComponentMountedRef.current) {
                    setIsTypingEffect(false);
                    setTypingText('');
                    callback?.();
                }
                return;
            }
            
            setTypingText(prev => prev + text[index]);
            index++;
        }, 30);

        typingIntervalRef.current = typeInterval;
    }, []);

    // Handle sending messages - REVERTED TO ORIGINAL
    const handleSendMessage = useCallback(async (messageContent = inputValue) => {
        const trimmedMessage = messageContent.trim();
        if (!trimmedMessage || isLoading) return;

        cleanupSpeechAndRecognition();
        setShowSuggestedQuestions(false);

        const newUserMessage = { 
            id: crypto.randomUUID(), 
            type: 'user', 
            content: trimmedMessage,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);
        setIsThinking(true);
        setConversationState('active');

        try {
            const conversationHistory = messages
                .slice(-6)
                .map(msg => `${msg.type === 'ai' ? 'AI' : 'User'}: ${msg.content}`)
                .join('\n');

            const userName = currentUser?.display_name || currentUser?.full_name || 'there';
            const firstName = userName.split(' ')[0];

            const colleaguePrompt = `You are an AI sales colleague named Effy, talking to ${firstName}. Your purpose is to assist with sales-related tasks for our company, EffySales Pro. You are having a natural phone conversation.

Key conversation rules:
- **Off-Topic Guardrail**: If the user asks about something completely unrelated to sales, our products, or business (e.g., "how to bake a cake", "what is the capital of France"), you must politely decline and steer the conversation back. Respond like this: "I focus strictly on helping you with your sales outcomes here at EffySales Pro. If you'd like details about our platform's capabilities, features, or how it drives revenue, I'm here to help! Do you have any sales-related questions?"
- Use ${firstName}'s name **sparingly**, only when it feels natural, like at the beginning of a conversation or to regain attention. Avoid using it in every response.
- Keep responses to 1-2 sentences maximum.
- Be conversational and helpful.
- **IMPORTANT**: Your response must be direct. Do NOT start with "Effy:" or any other prefix.

Recent conversation:
${conversationHistory}

${firstName} just said: "${trimmedMessage}"

Your direct response:`;

            const response = await InvokeLLM({ prompt: colleaguePrompt });
            
            if (!isComponentMountedRef.current) return;
            
            setIsThinking(false);
            
            const aiResponse = { 
                id: crypto.randomUUID(), 
                type: 'ai', 
                content: response,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiResponse]);
            
            if (speakRef.current) speakRef.current(response);
            typeMessage(response);

        } catch (error) {
            console.error("Error sending message:", error);
            
            if (!isComponentMountedRef.current) return;
            
            setIsThinking(false);
            const errorMessage = getNextErrorResponse();
            const errorResponse = { 
                id: crypto.randomUUID(), 
                type: 'ai', 
                content: errorMessage,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorResponse]);
            if (speakRef.current) speakRef.current(errorMessage);
        } finally {
            if (isComponentMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [inputValue, isLoading, messages, currentUser, typeMessage, cleanupSpeechAndRecognition]);

    useEffect(() => {
        handleSendMessageRef.current = handleSendMessage;
    }, [handleSendMessage]);

    // Speech synthesis
    const speak = useCallback((text) => {
        if (!voiceEnabled || !text || voices.length === 0 || !isComponentMountedRef.current) return;
        
        try {
            if (window.speechSynthesis?.speaking) {
                window.speechSynthesis.cancel();
            }
        } catch (e) {
            // Ignore errors
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        const selectedVoice = voices.find(v => v.name === agentSettings.voice_settings.voice_name) ||
                            voices.find(v => v.name.toLowerCase().includes('zira')) ||
                            voices.find(v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en'));
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.rate = agentSettings.voice_settings.rate;
        utterance.pitch = agentSettings.voice_settings.pitch;
        utterance.volume = agentSettings.voice_settings.volume;
        
        utterance.onstart = () => {
            if (isComponentMountedRef.current) {
                setIsSpeaking(true);
            }
        };
        
        utterance.onend = () => {
            if (isComponentMountedRef.current) {
                setIsSpeaking(false);
            }
        };
        
        utterance.onerror = () => {
            if (isComponentMountedRef.current) {
                setIsSpeaking(false);
            }
        };
        
        try {
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            setIsSpeaking(false);
        }
    }, [voiceEnabled, voices, agentSettings.voice_settings]);

    useEffect(() => {
        speakRef.current = speak;
    }, [speak]);

    // FIXED Speech Recognition Setup
    useEffect(() => {
        if (!voiceEnabled || !isComponentMountedRef.current) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            
            const recognition = recognitionRef.current;
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                console.log('🎤 Speech recognition started');
                if (isComponentMountedRef.current) {
                    recognitionStateRef.current = 'listening';
                    setIsListening(true);
                }
            };

            recognition.onresult = (event) => {
                console.log('🗣️ Speech recognition result received');
                if (!isComponentMountedRef.current) return;
                
                // Stop any current speech
                if (window.speechSynthesis?.speaking) {
                    window.speechSynthesis.cancel();
                }
                setIsSpeaking(false);

                const transcript = event.results[event.results.length - 1][0].transcript.trim();
                console.log('Transcript:', transcript);
                
                if (transcript.length > 2) {
                    handleSendMessageRef.current?.(transcript);
                }
            };

            recognition.onerror = (event) => {
                console.error('🚨 Speech recognition error:', event.error);
                if (!isComponentMountedRef.current) return;
                
                recognitionStateRef.current = 'error';
                setIsListening(false);
                
                // Only show critical errors to user
                if (event.error === 'not-allowed') {
                    toast.error("Microphone access denied. Please allow microphone access.");
                } else if (event.error === 'network') {
                    toast.error("Network error with speech recognition.");
                }
                // Ignore other errors like 'aborted', 'no-speech' as they're normal
            };

            recognition.onend = () => {
                console.log('🎤 Speech recognition ended');
                if (isComponentMountedRef.current) {
                    recognitionStateRef.current = 'stopped';
                    setIsListening(false);
                }
            };
        }
        
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
    }, [voiceEnabled]);

    // Start listening function - FIXED
    const startListening = useCallback(() => {
        if (!voiceEnabled || !recognitionRef.current || isMicMuted || !isComponentMountedRef.current) {
            console.log('Cannot start listening:', { voiceEnabled, hasRecognition: !!recognitionRef.current, isMicMuted, isComponentMounted: isComponentMountedRef.current });
            return;
        }
        
        if (recognitionStateRef.current !== 'stopped') {
            console.log('Recognition not in stopped state:', recognitionStateRef.current);
            return;
        }
        
        try {
            console.log('🎤 Starting speech recognition...');
            recognitionStateRef.current = 'starting';
            recognitionRef.current.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            recognitionStateRef.current = 'stopped';
        }
    }, [voiceEnabled, isMicMuted]);

    // Auto-listening loop - FIXED
    useEffect(() => {
        if (!isCallActive || isSpeaking || isThinking || isMicMuted || !isComponentMountedRef.current) {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (isCallActive && !isSpeaking && !isThinking && !isMicMuted && recognitionStateRef.current === 'stopped') {
                startListening();
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [isCallActive, isSpeaking, isThinking, isMicMuted, startListening]);

    // Start call with shortened greeting
    const handleStartCall = useCallback(async () => {
        setIsOpen(true);
        setIsCallActive(true);
        setCallStartTime(Date.now());
        setMessages([]);
        setConversationState('greeting');
        setShowSuggestedQuestions(false);
        
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            toast.success("Voice chat ready!");
        } catch (error) {
            toast.error("Microphone access required for voice chat.");
        }
        
        const userName = currentUser?.display_name || currentUser?.full_name || 'there';
        const firstName = userName.split(' ')[0];
        // Shortened greeting without self-introduction
        const greeting = `${getGreeting()} ${firstName}! What can I help you with today?`;
        
        const initialMessage = { 
            id: crypto.randomUUID(), 
            type: 'ai', 
            content: greeting,
            timestamp: new Date()
        };
        
        setTimeout(() => {
            if (isComponentMountedRef.current) {
                setMessages([initialMessage]);
                if (speakRef.current) speakRef.current(greeting);
                typeMessage(greeting, () => {
                    setTimeout(() => {
                        setShowSuggestedQuestions(true);
                    }, 1000);
                });
            }
        }, 500);
    }, [typeMessage, currentUser]);

    // End call
    const handleEndCall = useCallback(() => {
        cleanupSpeechAndRecognition();
        setIsCallActive(false);
        setCallStartTime(null);
        setCallDuration(0);
        setIsOpen(false);
        setMessages([]);
        setConversationState('greeting');
        setShowSuggestedQuestions(false);
        toast.success("Call ended");
    }, [cleanupSpeechAndRecognition]);

    // Toggle microphone
    const handleToggleMic = useCallback(() => {
        setIsMicMuted(prev => {
            const newMuted = !prev;
            if (newMuted) {
                cleanupSpeechAndRecognition();
                toast.info("Microphone muted");
            } else {
                toast.info("Microphone unmuted");
            }
            return newMuted;
        });
    }, [cleanupSpeechAndRecognition]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Component cleanup
    useEffect(() => {
        return () => {
            isComponentMountedRef.current = false;
            cleanupSpeechAndRecognition();
        };
    }, [cleanupSpeechAndRecognition]);

    // Event bus handlers
    useEffect(() => {
        const handleOpen = () => handleStartCall();
        eventBus.on('ai:openChat', handleOpen);
        return () => eventBus.off('ai:openChat', handleOpen);
    }, [handleStartCall]);

    const suggestedQuestions = [
        "Help me with my sales pipeline",
        "Draft an email for a prospect", 
        "Prepare for my next call",
        "Analyze my lead performance"
    ];

    return (
        <>
            {/* Removed the centered bottom chat button */}

            {/* Chat Widget - INCREASED WIDTH */}
            {isOpen && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-95 rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 backdrop-blur-sm"
                     style={{ width: '520px', height: '500px' }}>
                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-opacity-90 text-white p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8 border-2 border-white/20">
                                    <AvatarImage src={agentSettings.agent_avatar} alt="Effy" />
                                    <AvatarFallback className="bg-white/20 text-white text-sm">E</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium text-sm">{agentSettings.agent_name}</div>
                                    <div className="text-xs opacity-90 flex items-center gap-1">
                                        {isCallActive && callStartTime && (
                                            <>
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                {formatDuration(callDuration)}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 text-white hover:bg-white/20"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div 
                        ref={messageListRef} 
                        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 bg-opacity-50"
                        style={{ height: '360px' }}
                    >
                        {/* Messages */}
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                    message.type === 'user' 
                                        ? 'bg-blue-500 bg-opacity-90 text-white backdrop-blur-sm' 
                                        : 'bg-white bg-opacity-90 text-gray-800 shadow-sm border backdrop-blur-sm'
                                }`}>
                                    <div className="text-sm">{message.content}</div>
                                </div>
                            </div>
                        ))}

                        {/* Suggested Questions - Show ONLY after AI greeting is complete AND no user messages */}
                        {showSuggestedQuestions && 
                         messages.length === 1 && 
                         messages[0]?.type === 'ai' && 
                         !isTypingEffect && 
                         !isThinking && (
                            <div className="space-y-2 mt-4">
                                <div className="text-xs text-gray-500 text-center">Try asking:</div>
                                {suggestedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            // Prepend "Hey Effy, " to the suggested question
                                            handleSendMessage(`${question}`); // Removed 'Hey Effy, '
                                            setShowSuggestedQuestions(false);
                                        }}
                                        className="w-full text-left p-3 text-sm bg-blue-50 bg-opacity-90 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors backdrop-blur-sm"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* LISTENING Indicator */}
                        {isListening && (
                            <div className="flex justify-center">
                                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium">🎤 Listening...</span>
                                </div>
                            </div>
                        )}
                        
                        {/* THINKING Indicator */}
                        {isThinking && (
                            <div className="flex justify-center">
                                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-sm font-medium">🤔 Thinking...</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Typing Animation */}
                        {isTypingEffect && typingText && (
                            <div className="flex justify-start">
                                <div className="bg-white bg-opacity-90 text-gray-800 shadow-sm border rounded-2xl px-4 py-2 max-w-[80%] backdrop-blur-sm">
                                    <div className="text-sm">{typingText}<span className="animate-pulse">|</span></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-white bg-opacity-95 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={isLoading || isSpeaking}
                                    className="pr-10 bg-white bg-opacity-90 backdrop-blur-sm"
                                />
                                
                                {/* Voice Status Indicators */}
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                    {isListening && !isMicMuted && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                    {isSpeaking && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    )}
                                </div>
                            </div>

                            {/* Microphone Toggle */}
                            <Button
                                onClick={handleToggleMic}
                                variant={isMicMuted ? "destructive" : "outline"}
                                size="icon"
                                className={isMicMuted ? "text-white" : "text-gray-600 hover:text-gray-800"}
                            >
                                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </Button>

                            {/* Send Button */}
                            <Button
                                onClick={() => handleSendMessage()}
                                disabled={!inputValue.trim() || isLoading}
                                size="icon"
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>

                            {/* Disconnect Button */}
                            <Button
                                onClick={handleEndCall}
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:bg-red-100 hover:text-red-600"
                            >
                                <PhoneOff className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
