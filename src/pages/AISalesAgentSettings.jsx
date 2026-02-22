
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/api/entities';
import { toast } from 'sonner';
import { 
    Bot, Save, Play, Square, Settings, Mic, Volume2, 
    Upload, Image, Palette, MessageSquare, Sparkles,
    VolumeX, RotateCcw, X
} from 'lucide-react';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const defaultAvatars = [
    { id: 'professional-woman', url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80", name: "Professional Woman" },
    { id: 'business-man', url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80", name: "Business Man" },
    { id: 'friendly-woman', url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80", name: "Friendly Woman" },
    { id: 'tech-man', url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80", name: "Tech Professional" },
    { id: 'consultant-woman', url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80", name: "Consultant" },
    { id: 'sales-man', url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80", name: "Sales Professional" }
];

const defaultPrompts = [
    "What does SalesAI Pro do?",
    "What problem does it solve?",
    "How much does it cost?",
    "Can I see a demo?",
    "What integrations do you have?",
    "How do I get started?",
    "What's your ROI?",
    "Do you have case studies?"
];

export default function AISalesAgentSettings() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTestingVoice, setIsTestingVoice] = useState(false);
    const [testingVoiceId, setTestingVoiceId] = useState(null); // Track which voice is being tested
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    
    const [agentSettings, setAgentSettings] = useState({
        agent_name: 'Effy',
        agent_title: 'AI Sales Assistant',
        agent_avatar: defaultAvatars[0].url,
        initial_greeting: `${getGreeting()}. I'm Effy, an AI seller for SalesAI Pro. Are you looking to understand what our product does, or do you have another specific question?`,
        suggested_prompts: [...defaultPrompts],
        voice_settings: {
            voice_name: '',
            voice_id: '',
            rate: 1.0,
            pitch: 1.0,
            volume: 0.9
        },
        personality_traits: {
            tone: 'professional',
            helpfulness: 'high',
            proactiveness: 'medium'
        }
    });

    useEffect(() => {
        loadUserAndSettings();
        loadVoices();
    }, []);

    const loadUserAndSettings = async () => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            
            // Load existing agent settings if they exist
            if (currentUser.ai_agent_settings) {
                setAgentSettings(prev => ({
                    ...prev,
                    ...currentUser.ai_agent_settings
                }));
            }
        } catch (error) {
            console.error('Error loading user settings:', error);
            toast.error("Failed to load settings");
        }
        setIsLoading(false);
    };

    const findDefaultVoice = (availableVoices) => {
        if (!availableVoices || availableVoices.length === 0) return null;

        // Prioritize a high-quality Google voice, then fall back to the first available voice
        let defaultVoice = availableVoices.find(v => v.name.includes('Google') && v.lang.includes('US')) || availableVoices[0];
        return defaultVoice;
    };

    const loadVoices = () => {
        const loadVoicesFromSynthesis = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                const englishVoices = availableVoices
                    .filter(voice => voice.lang.startsWith('en'))
                    .map(voice => ({
                        id: voice.name,
                        name: voice.name,
                        lang: voice.lang,
                        gender: detectGender(voice.name),
                        voice: voice
                    }));
                setVoices(englishVoices);

                // Set default voice if none selected or if previously selected voice isn't available
                if (!selectedVoice || !englishVoices.some(v => v.id === selectedVoice.id)) {
                    const defaultVoiceName = agentSettings.voice_settings.voice_name;
                    let voiceToSet = englishVoices.find(v => v.name === defaultVoiceName);

                    if (!voiceToSet) {
                        voiceToSet = findDefaultVoice(englishVoices);
                    }
                    
                    if (voiceToSet) {
                        setSelectedVoice(voiceToSet);
                        setAgentSettings(prev => ({
                            ...prev,
                            voice_settings: {
                                ...prev.voice_settings,
                                voice_name: voiceToSet.name,
                                voice_id: voiceToSet.id
                            }
                        }));
                    }
                }
            }
        };

        loadVoicesFromSynthesis();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = loadVoicesFromSynthesis;
        }
    };

    const detectGender = (voiceName) => {
        const malePatterns = [/male/i, /david/i, /alex/i, /daniel/i, /mark/i, /tom/i, /fred/i];
        const femalePatterns = [/female/i, /zira/i, /samantha/i, /victoria/i, /karen/i, /allison/i];
        
        if (malePatterns.some(pattern => pattern.test(voiceName))) return 'male';
        if (femalePatterns.some(pattern => pattern.test(voiceName))) return 'female';
        return 'unknown';
    };

    const handleVoiceTest = (voice) => {
        if (isTestingVoice && testingVoiceId === voice.id) {
            window.speechSynthesis.cancel();
            setIsTestingVoice(false);
            setTestingVoiceId(null);
            return;
        }

        // Stop any current speech
        window.speechSynthesis.cancel();
        setIsTestingVoice(true);
        setTestingVoiceId(voice.id);
        
        const testText = `Hi, I'm ${agentSettings.agent_name}. This is how I sound with this voice setting.`;
        
        const utterance = new SpeechSynthesisUtterance(testText);
        utterance.voice = voice.voice;
        utterance.rate = agentSettings.voice_settings.rate;
        utterance.pitch = agentSettings.voice_settings.pitch;
        utterance.volume = agentSettings.voice_settings.volume;
        
        utterance.onend = () => {
            setIsTestingVoice(false);
            setTestingVoiceId(null);
        };
        utterance.onerror = () => {
            setIsTestingVoice(false);
            setTestingVoiceId(null);
        };
        
        window.speechSynthesis.speak(utterance);
    };

    const handleSelectVoice = (voice) => {
        // If the user clicks the currently selected voice, deselect it and revert to the default or clear.
        if (selectedVoice?.id === voice.id) {
            const defaultVoice = findDefaultVoice(voices);
            if (defaultVoice && defaultVoice.id !== voice.id) {
                // Only reset if the default is different from current selection
                setSelectedVoice(defaultVoice);
                setAgentSettings(prev => ({
                    ...prev,
                    voice_settings: {
                        ...prev.voice_settings,
                        voice_name: defaultVoice.name,
                        voice_id: defaultVoice.id,
                    },
                }));
                toast.info("Voice deselected and reset to default.");
            } else {
                // If current selection IS the default, or no default is found, clear selection entirely
                setSelectedVoice(null);
                setAgentSettings(prev => ({
                    ...prev,
                    voice_settings: {
                        ...prev.voice_settings,
                        voice_name: '',
                        voice_id: '',
                    },
                }));
                toast.info("Voice deselected. System will use browser default.");
            }
        } else {
            // Otherwise, select the new voice.
            setSelectedVoice(voice);
            setAgentSettings(prev => ({
                ...prev,
                voice_settings: {
                    ...prev.voice_settings,
                    voice_name: voice.name,
                    voice_id: voice.id,
                },
            }));
            toast.success(`Voice "${voice.name}" selected successfully!`);
        }
    };

    const handleResetVoice = () => {
        const defaultVoice = findDefaultVoice(voices);
        if (defaultVoice) {
            setSelectedVoice(defaultVoice);
            setAgentSettings(prev => ({
                ...prev,
                voice_settings: {
                    ...prev.voice_settings,
                    voice_name: defaultVoice.name,
                    voice_id: defaultVoice.id,
                },
            }));
            toast.info("Voice has been reset to the default setting.");
        } else {
            toast.error("Could not find a default voice to reset to.");
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await User.updateMyUserData({
                ai_agent_settings: agentSettings
            });
            toast.success("AI Sales Agent settings saved successfully!");
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error("Failed to save settings");
        }
        setIsSaving(false);
    };

    const addSuggestedPrompt = () => {
        setAgentSettings(prev => ({
            ...prev,
            suggested_prompts: [...prev.suggested_prompts, '']
        }));
    };

    const removeSuggestedPrompt = (index) => {
        setAgentSettings(prev => ({
            ...prev,
            suggested_prompts: prev.suggested_prompts.filter((_, i) => i !== index)
        }));
    };

    const updateSuggestedPrompt = (index, value) => {
        setAgentSettings(prev => ({
            ...prev,
            suggested_prompts: prev.suggested_prompts.map((prompt, i) => 
                i === index ? value : prompt
            )
        }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Sales Agent Settings</h1>
                    <p className="text-slate-600">Customize your AI assistant's appearance, voice, and behavior</p>
                </div>

                {/* Preview Card */}
                <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <CardTitle className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 border-2 border-white/20">
                                <AvatarImage src={agentSettings.agent_avatar} />
                                <AvatarFallback className="bg-white text-blue-500 font-bold">
                                    {agentSettings.agent_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-bold">{agentSettings.agent_name}</h3>
                                <p className="text-blue-100 text-sm">{agentSettings.agent_title}</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-slate-700 italic">"{agentSettings.initial_greeting}"</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {agentSettings.suggested_prompts.slice(0, 4).map((prompt, index) => (
                                <Badge key={index} variant="outline" className="bg-white">
                                    {prompt}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Settings */}
                    <Card className="shadow-xl border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="agent_name">Agent Name</Label>
                                <Input
                                    id="agent_name"
                                    value={agentSettings.agent_name}
                                    onChange={(e) => setAgentSettings(prev => ({
                                        ...prev,
                                        agent_name: e.target.value
                                    }))}
                                    placeholder="e.g., Effy, Sarah, Alex"
                                />
                            </div>

                            <div>
                                <Label htmlFor="agent_title">Agent Title</Label>
                                <Input
                                    id="agent_title"
                                    value={agentSettings.agent_title}
                                    onChange={(e) => setAgentSettings(prev => ({
                                        ...prev,
                                        agent_title: e.target.value
                                    }))}
                                    placeholder="e.g., AI Sales Assistant, Sales Consultant"
                                />
                            </div>

                            <div>
                                <Label>Avatar Selection</Label>
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    {defaultAvatars.map((avatar) => (
                                        <div
                                            key={avatar.id}
                                            className={`cursor-pointer p-2 rounded-lg border-2 transition-all ${
                                                agentSettings.agent_avatar === avatar.url
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                            onClick={() => setAgentSettings(prev => ({
                                                ...prev,
                                                agent_avatar: avatar.url
                                            }))}
                                        >
                                            <Avatar className="w-16 h-16 mx-auto">
                                                <AvatarImage src={avatar.url} />
                                                <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-xs text-center mt-1">{avatar.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="initial_greeting">Initial Greeting</Label>
                                <Textarea
                                    id="initial_greeting"
                                    value={agentSettings.initial_greeting}
                                    onChange={(e) => setAgentSettings(prev => ({
                                        ...prev,
                                        initial_greeting: e.target.value
                                    }))}
                                    placeholder="The first message your AI agent will say to visitors"
                                    className="h-24"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Voice Settings */}
                    <Card className="shadow-xl border-0">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <Volume2 className="w-5 h-5" />
                                    Voice Settings
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={handleResetVoice}>
                                    <RotateCcw className="w-3 h-3 mr-2" />
                                    Reset to Default
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label>Select Voice</Label>
                                {selectedVoice && (
                                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-green-800">
                                                Current Voice: {selectedVoice.name}
                                            </span>
                                            <Badge className="bg-green-100 text-green-800">
                                                {selectedVoice.gender}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                                    {voices.map((voice) => (
                                        <div
                                            key={voice.id}
                                            className={`p-3 rounded-lg border transition-all ${
                                                selectedVoice?.id === voice.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{voice.name}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {voice.lang}
                                                        </Badge>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={`text-xs ${
                                                                voice.gender === 'male' ? 'bg-blue-100 text-blue-800' :
                                                                voice.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {voice.gender}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleVoiceTest(voice)}
                                                        className="h-8"
                                                    >
                                                        {isTestingVoice && testingVoiceId === voice.id ? (
                                                            <>
                                                                <Square className="w-3 h-3 mr-1" />
                                                                Stop
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play className="w-3 h-3 mr-1" />
                                                                Test
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleSelectVoice(voice)}
                                                        className={`h-8 px-3 ${
                                                            selectedVoice?.id === voice.id
                                                                ? 'bg-red-600 hover:bg-red-700 text-white' // Changed to red for deselect
                                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        }`}
                                                        size="sm"
                                                    >
                                                        {selectedVoice?.id === voice.id ? (
                                                            <>
                                                                <X className="w-3 h-3 mr-1" /> {/* X icon for deselect */}
                                                                Deselect
                                                            </>
                                                        ) : (
                                                            'Select'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Voice Controls */}
                            <div className="space-y-4">
                                <div>
                                    <Label>Speech Rate: {agentSettings.voice_settings.rate}</Label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={agentSettings.voice_settings.rate}
                                        onChange={(e) => setAgentSettings(prev => ({
                                            ...prev,
                                            voice_settings: {
                                                ...prev.voice_settings,
                                                rate: parseFloat(e.target.value)
                                            }
                                        }))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <Label>Pitch: {agentSettings.voice_settings.pitch}</Label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={agentSettings.voice_settings.pitch}
                                        onChange={(e) => setAgentSettings(prev => ({
                                            ...prev,
                                            voice_settings: {
                                                ...prev.voice_settings,
                                                pitch: parseFloat(e.target.value)
                                            }
                                        }))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <Label>Volume: {agentSettings.voice_settings.volume}</Label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={agentSettings.voice_settings.volume}
                                        onChange={(e) => setAgentSettings(prev => ({
                                            ...prev,
                                            voice_settings: {
                                                ...prev.voice_settings,
                                                volume: parseFloat(e.target.value)
                                            }
                                        }))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Voice Test with Current Settings */}
                                {selectedVoice && (
                                    <div className="pt-2">
                                        <Button
                                            onClick={() => handleVoiceTest(selectedVoice)}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            {isTestingVoice && testingVoiceId === selectedVoice.id ? (
                                                <>
                                                    <Square className="w-4 h-4 mr-2" />
                                                    Stop Test
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Test Selected Voice with Current Settings
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Suggested Prompts */}
                <Card className="shadow-xl border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Suggested Prompts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {agentSettings.suggested_prompts.map((prompt, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={prompt}
                                        onChange={(e) => updateSuggestedPrompt(index, e.target.value)}
                                        placeholder="Enter a suggested question or prompt"
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeSuggestedPrompt(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={addSuggestedPrompt}
                                className="w-full"
                            >
                                + Add Suggested Prompt
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="px-8 py-3 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        size="lg"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save All AI Agent Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
