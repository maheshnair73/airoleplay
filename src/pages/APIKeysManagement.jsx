import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
    Key, ExternalLink, Eye, EyeOff, CheckCircle, 
    AlertCircle, Copy, Settings, Zap, Mic, Brain, 
    Mail, Phone, Database, Shield
} from 'lucide-react';
import { toast } from 'sonner';

// Mock function to simulate API key storage (replace with actual implementation)
const saveApiKey = async (keyName, keyValue) => {
    // In real implementation, this would make an API call to securely store the key
    localStorage.setItem(`api_key_${keyName}`, keyValue);
    return Promise.resolve();
};

const getApiKey = async (keyName) => {
    // In real implementation, this would fetch from secure storage
    return localStorage.getItem(`api_key_${keyName}`) || '';
};

const testApiKey = async (keyName, keyValue) => {
    // Mock testing - in real implementation, this would make actual API calls
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.3; // 70% success rate for demo
};

const ApiKeyCard = ({ 
    name, 
    description, 
    website, 
    icon: Icon, 
    keyName, 
    placeholder,
    instructions,
    pricing,
    features 
}) => {
    const [apiKey, setApiKey] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testStatus, setTestStatus] = useState(null); // null, 'success', 'error'

    useEffect(() => {
        loadApiKey();
    }, []);

    const loadApiKey = async () => {
        const key = await getApiKey(keyName);
        setApiKey(key);
        if (key) {
            setTestStatus('success'); // Assume valid if saved
        }
    };

    const handleSave = async () => {
        if (!apiKey.trim()) {
            toast.error('Please enter an API key');
            return;
        }

        setIsSaving(true);
        try {
            await saveApiKey(keyName, apiKey);
            toast.success(`${name} API key saved successfully!`);
            setTestStatus('success');
        } catch (error) {
            toast.error(`Failed to save ${name} API key`);
            setTestStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTest = async () => {
        if (!apiKey.trim()) {
            toast.error('Please enter an API key first');
            return;
        }

        setIsTesting(true);
        setTestStatus(null);
        
        try {
            const isValid = await testApiKey(keyName, apiKey);
            if (isValid) {
                setTestStatus('success');
                toast.success(`${name} connection successful!`);
            } else {
                setTestStatus('error');
                toast.error(`${name} connection failed. Please check your API key.`);
            }
        } catch (error) {
            setTestStatus('error');
            toast.error(`Failed to test ${name} connection`);
        } finally {
            setIsTesting(false);
        }
    };

    const handleCopyInstructions = () => {
        navigator.clipboard.writeText(instructions);
        toast.success('Instructions copied to clipboard!');
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {name}
                                {testStatus === 'success' && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {testStatus === 'error' && (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                            </CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <a href={website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor={keyName} className="text-sm font-medium">
                        API Key
                    </Label>
                    <div className="flex gap-2 mt-1">
                        <div className="relative flex-1">
                            <Input
                                id={keyName}
                                type={isVisible ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={placeholder}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setIsVisible(!isVisible)}
                            >
                                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            size="sm"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleTest}
                        disabled={isTesting || !apiKey.trim()}
                    >
                        {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleCopyInstructions}
                    >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Instructions
                    </Button>
                </div>

                {pricing && (
                    <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Pricing</p>
                        <p className="text-xs text-green-600">{pricing}</p>
                    </div>
                )}

                {features && features.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                            {features.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {feature}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function APIKeysManagement() {
    const aiServices = [
        {
            name: "OpenAI",
            description: "GPT models for AI conversations and analysis",
            website: "https://platform.openai.com/api-keys",
            icon: Brain,
            keyName: "OPENAI_API_KEY",
            placeholder: "sk-proj-...",
            pricing: "Pay-per-use: $0.03-$0.06 per 1K tokens",
            features: ["GPT-4o", "GPT-4", "Text Analysis", "Conversation AI"],
            instructions: `1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Name it "EffySales Pro"
5. Copy the key (starts with sk-proj-...)
6. Paste it here and click Save`
        },
        {
            name: "ElevenLabs",
            description: "AI voice generation for roleplay and calls",
            website: "https://elevenlabs.io/app/api-keys",
            icon: Mic,
            keyName: "ELEVENLABS_API_KEY",
            placeholder: "sk_...",
            pricing: "Free: 10k characters/month, Paid: $5-$99/month",
            features: ["Voice Cloning", "Multi-language", "Real-time Audio"],
            instructions: `1. Go to https://elevenlabs.io/app/api-keys
2. Sign in to your ElevenLabs account
3. Click "Create API Key"
4. Copy the key (starts with sk_...)
5. Paste it here and click Save`
        },
        {
            name: "Deepgram",
            description: "Advanced speech-to-text transcription",
            website: "https://console.deepgram.com/project/keys",
            icon: Database,
            keyName: "DEEPGRAM_API_KEY",
            placeholder: "Token ...",
            pricing: "Pay-per-use: $0.0043 per minute",
            features: ["Real-time STT", "Speaker Diarization", "Custom Models"],
            instructions: `1. Go to https://console.deepgram.com/project/keys
2. Sign in to your Deepgram account
3. Click "Create a New API Key"
4. Name it "EffySales Pro"
5. Copy the generated token
6. Paste it here and click Save`
        }
    ];

    const dialerServices = [
        {
            name: "Twilio",
            description: "Voice calls and SMS messaging",
            website: "https://console.twilio.com/project/api-keys",
            icon: Phone,
            keyName: "TWILIO_API_KEY",
            placeholder: "ACxxxxx...",
            pricing: "Pay-per-use: $0.085 per minute for calls",
            features: ["Voice Calls", "SMS", "WhatsApp", "Global Coverage"],
            instructions: `1. Go to https://console.twilio.com/project/api-keys
2. Sign in to your Twilio account
3. Find your Account SID and Auth Token
4. Use Account SID as the API key
5. Store Auth Token separately if needed`
        }
    ];

    const webhookSecrets = [
        {
            name: "Zoom Webhook",
            description: "Secure token for Zoom meeting recordings",
            website: "https://marketplace.zoom.us/",
            icon: Shield,
            keyName: "ZOOM_WEBHOOK_SECRET_TOKEN",
            placeholder: "your-secure-token-here",
            pricing: "Free with Zoom integration",
            features: ["Meeting Security", "Recording Access", "Event Validation"],
            instructions: `1. Generate a random secure token (32+ characters)
2. Use a password generator or create your own
3. Example: Trg9wLpZ2@qX7!vR&kF$mN3pQ8xY
4. Share this same token with your Zoom app configuration
5. This ensures only authorized webhooks reach your system`
        },
        {
            name: "Voicegate Webhook",
            description: "Secure token for Voicegate call analytics",
            website: "#",
            icon: Shield,
            keyName: "VOICEGATE_WEBHOOK_SECRET",
            placeholder: "your-secure-token-here",
            pricing: "Free webhook security",
            features: ["Call Analytics", "Webhook Security", "Data Protection"],
            instructions: `1. Generate a random secure token (32+ characters)
2. Use a password generator for maximum security
3. Example: Bx7nM4kL9@pQ2vF&rC$wE8zT
4. Share this token with your Voicegate provider
5. This ensures only legitimate call data reaches your system`
        }
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-lg mb-8">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                                <Key className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">API Keys & Secrets Management</CardTitle>
                                <CardDescription className="text-base">
                                    Configure and manage all your third-party service integrations in one place
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Tabs defaultValue="ai-services" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ai-services" className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            AI Services
                        </TabsTrigger>
                        <TabsTrigger value="dialer-services" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Dialer & Communication
                        </TabsTrigger>
                        <TabsTrigger value="webhook-secrets" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Webhook Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai-services" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {aiServices.map((service) => (
                                <ApiKeyCard key={service.keyName} {...service} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="dialer-services" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dialerServices.map((service) => (
                                <ApiKeyCard key={service.keyName} {...service} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="webhook-secrets" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {webhookSecrets.map((service) => (
                                <ApiKeyCard key={service.keyName} {...service} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <Card className="mt-8 border-amber-200 bg-amber-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-800">
                            <AlertCircle className="w-5 h-5" />
                            Security Notice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-amber-700 text-sm">
                        <ul className="space-y-2">
                            <li>• All API keys are securely encrypted and stored</li>
                            <li>• Keys are only accessible by your account and authorized team members</li>
                            <li>• Never share your API keys publicly or in unsecured channels</li>
                            <li>• Regularly rotate your API keys for maximum security</li>
                            <li>• Test connections regularly to ensure integrations are working</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}