import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, Server, Zap, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export default function BackendGuide() {
    return (
        <div className="space-y-6">
            <Alert>
                <Server className="h-4 w-4" />
                <AlertDescription>
                    <strong>Backend Functions Required:</strong> To enable call recording and AI analysis, you need to deploy backend functions in your workspace. Enable this in Workspace → Settings → Backend Functions.
                </AlertDescription>
            </Alert>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            Required Backend Functions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">1. Meeting Bot Handler</h4>
                                <p className="text-sm text-gray-600 mb-2">Joins meetings automatically and starts recording</p>
                                <Badge variant="outline">Python/Node.js</Badge>
                                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
{`async function joinMeeting(meetingData) {
  // Join Zoom/Google Meet
  // Start recording
  // Monitor for meeting end
  // Process recording when done
}`}
                                </pre>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">2. Webhook Handler</h4>
                                <p className="text-sm text-gray-600 mb-2">Receives notifications when meetings start/end</p>
                                <Badge variant="outline">REST API Endpoint</Badge>
                                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
{`POST /webhook/zoom
POST /webhook/google-meet
// Handle meeting.started, meeting.ended events`}
                                </pre>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">3. Audio Processing</h4>
                                <p className="text-sm text-gray-600 mb-2">Converts audio to text with speaker identification</p>
                                <Badge variant="outline">Speech-to-Text API</Badge>
                                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
{`// Google Cloud Speech-to-Text
// Azure Speech Services  
// AWS Transcribe`}
                                </pre>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">4. AI Analysis Engine</h4>
                                <p className="text-sm text-gray-600 mb-2">Analyzes conversation for insights and coaching points</p>
                                <Badge variant="outline">OpenAI GPT-4</Badge>
                                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
{`// Extract: objections, pain points, buying signals
// Generate: next steps, coaching recommendations
// Calculate: talk ratio, sentiment score`}
                                </pre>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Required API Keys & Services
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-2">Zoom Integration</h4>
                                    <ul className="text-sm space-y-1">
                                        <li>• Zoom Marketplace App</li>
                                        <li>• Meeting Bot SDK</li>
                                        <li>• API Key & Secret</li>
                                        <li>• Webhook URL</li>
                                    </ul>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-2">Google Meet</h4>
                                    <ul className="text-sm space-y-1">
                                        <li>• Google Cloud Project</li>
                                        <li>• Meet API (Beta)</li>
                                        <li>• Service Account</li>
                                        <li>• Calendar API</li>
                                    </ul>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-2">Speech-to-Text</h4>
                                    <ul className="text-sm space-y-1">
                                        <li>• Google Cloud Speech</li>
                                        <li>• Azure Speech Services</li>
                                        <li>• AWS Transcribe</li>
                                        <li>• Speaker Diarization</li>
                                    </ul>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-2">AI Analysis</h4>
                                    <ul className="text-sm space-y-1">
                                        <li>• OpenAI API Key</li>
                                        <li>• GPT-4 Access</li>
                                        <li>• Function Calling</li>
                                        <li>• JSON Mode</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Implementation Flow
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                                <div>
                                    <h4 className="font-semibold">User Schedules Meeting</h4>
                                    <p className="text-sm text-gray-600">Enables "Invite AI Notetaker" toggle</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                <div>
                                    <h4 className="font-semibold">Meeting Starts</h4>
                                    <p className="text-sm text-gray-600">Webhook triggers → Bot joins automatically</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                                <div>
                                    <h4 className="font-semibold">Recording & Transcription</h4>
                                    <p className="text-sm text-gray-600">Audio captured → Speech-to-text with speakers</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                                <div>
                                    <h4 className="font-semibold">AI Analysis</h4>
                                    <p className="text-sm text-gray-600">GPT-4 analyzes → Insights saved to database</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">5</div>
                                <div>
                                    <h4 className="font-semibold">Results Available</h4>
                                    <p className="text-sm text-gray-600">View in Call Analytics → Create coaching tasks</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            What's Already Built (Frontend)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-green-600">✅ Completed</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• CallRecord entity for data storage</li>
                                    <li>• Call Analytics page to view recordings</li>
                                    <li>• Call Analysis page for detailed insights</li>
                                    <li>• "Invite AI Notetaker" toggle in scheduler</li>
                                    <li>• Integration with coaching system</li>
                                    <li>• Sample data for testing UI</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-orange-600">⚠️ Needs Backend</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• Actual meeting bot deployment</li>
                                    <li>• Real-time recording capture</li>
                                    <li>• Speech-to-text processing</li>
                                    <li>• AI analysis generation</li>
                                    <li>• Webhook endpoints</li>
                                    <li>• API integrations</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Next Step:</strong> Enable Backend Functions in your workspace, then deploy the meeting bot code to start processing real recordings. The frontend is ready to display the results immediately.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}