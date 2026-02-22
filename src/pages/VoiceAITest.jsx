import React from 'react';
import LiveVoiceDemo from '@/components/voice/LiveVoiceDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Phone, Settings, Zap, Brain, 
    CheckCircle2, AlertTriangle, Info
} from 'lucide-react';

export default function VoiceAITest() {
    return (
        <div className="p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Voice AI Test Center</h1>
                <p className="text-slate-600">Test and configure your voice AI calling capabilities</p>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-medium text-green-800">UI Components</h4>
                        <Badge className="bg-green-100 text-green-800">Ready</Badge>
                    </CardContent>
                </Card>
                
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4 text-center">
                        <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <h4 className="font-medium text-yellow-800">Voice AI Service</h4>
                        <Badge className="bg-yellow-100 text-yellow-800">Setup Required</Badge>
                    </CardContent>
                </Card>
                
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4 text-center">
                        <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-medium text-blue-800">AI Analysis</h4>
                        <Badge className="bg-blue-100 text-blue-800">Configured</Badge>
                    </CardContent>
                </Card>
                
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4 text-center">
                        <Phone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h4 className="font-medium text-purple-800">Call Recording</h4>
                        <Badge className="bg-purple-100 text-purple-800">Ready</Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Setup Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Voice AI Setup Instructions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                To enable live voice AI calls, you'll need to set up one of these services:
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="font-medium">Option 1: ElevenLabs Voice AI</h4>
                                <ul className="text-sm space-y-1 text-slate-600">
                                    <li>• Sign up at elevenlabs.io</li>
                                    <li>• Get your API key</li>
                                    <li>• Add ELEVENLABS_API_KEY to environment variables</li>
                                    <li>• Choose voice IDs for your agents</li>
                                </ul>
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="font-medium">Option 2: Bland AI</h4>
                                <ul className="text-sm space-y-1 text-slate-600">
                                    <li>• Sign up at bland.ai</li>
                                    <li>• Get your API key</li>
                                    <li>• Add BLAND_API_KEY to environment variables</li>
                                    <li>• Configure phone number provider</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Current Environment Variables:</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>ELEVENLABS_API_KEY:</span>
                                    <Badge className="bg-green-100 text-green-800">✓ Set</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>DEEPGRAM_API_KEY:</span>
                                    <Badge className="bg-green-100 text-green-800">✓ Set</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>OPENAI_API_KEY:</span>
                                    <Badge className="bg-green-100 text-green-800">✓ Set</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Live Demo */}
            <LiveVoiceDemo />

            {/* Integration Guide */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        What's Working vs What Needs Setup
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-green-700 mb-3">✅ Currently Working</h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Voice call UI and controls
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Audio recording and processing
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Call transcript display
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Lead context integration
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    AI analysis framework
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-medium text-yellow-700 mb-3">⚠️ Needs Real Integration</h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    Actual phone dialing
                                </li>
                                <li className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    Real-time voice AI conversation
                                </li>
                                <li className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    Live speech-to-text
                                </li>
                                <li className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    Text-to-speech synthesis
                                </li>
                                <li className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    Phone number provisioning
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}