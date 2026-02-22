import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import EffyVoiceErrorLog from '@/components/troubleshooting/EffyVoiceErrorLog';

async function testEffyVoiceConnection() {
    const integration = { 
        userid: 'effibiz', 
        password: 'vgt@220915', 
        base_url: 'https://icicisecs.voicegateindia.com:49443' 
    };
    
    try {
        const loginResponse = await fetch(`${integration.base_url}/v1/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Userid: integration.userid, Password: integration.password })
        });

        if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            throw new Error(`API returned status ${loginResponse.status}: ${errorText}`);
        }
        
        const loginData = await loginResponse.json();
        
        if (loginData.Error_code !== "0" && loginData.Error_message?.toLowerCase() !== 'success') {
            throw new Error(`Login failed with message: ${loginData.Error_message}`);
        }

        if (!loginData.SessionID) {
            throw new Error(`Login appeared successful but the API did not return a SessionID.`);
        }
        
        return { success: true, message: `Connection successful! Session ID: ${loginData.SessionID}` };
        
    } catch (e) {
        return { success: false, error: `Connection failed: ${e.message}` };
    }
}

export default function EffyVoiceSetup() {
    const [isLoading, setIsLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const handleTestConnection = async () => {
        setIsLoading(true);
        setTestResult(null);
        const result = await testEffyVoiceConnection();
        setTestResult(result);
        if (result.success) {
            toast.success("EffyVoice connection is working!");
        } else {
            toast.error("EffyVoice connection failed.", { description: result.error });
        }
        setIsLoading(false);
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-4 text-slate-800">EffyVoice Dialer Diagnostics</h1>
            <p className="text-slate-600 mb-8 max-w-3xl">
                Use this page to test the connection to the EffyVoice API. This helps diagnose if the issue is with the credentials, the network, or the dialing configuration on the EffyVoice server.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>1. Connection Test</CardTitle>
                        <CardDescription>
                            This button will attempt to log in to the EffyVoice server. A successful test proves the credentials and network connection are working.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleTestConnection} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <ChevronRight className="w-4 h-4 mr-2" />
                            )}
                            Test Login Connection
                        </Button>
                        {testResult && (
                            <div className={`mt-4 p-4 rounded-md text-sm ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <div className="flex items-start">
                                    {testResult.success ? <CheckCircle className="w-5 h-5 mr-3 mt-0.5" /> : <XCircle className="w-5 h-5 mr-3 mt-0.5" />}
                                    <div>
                                        <p className="font-bold">{testResult.success ? 'Success!' : 'Failed'}</p>
                                        <p>{testResult.success ? testResult.message : testResult.error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <EffyVoiceErrorLog />
            </div>
        </div>
    );
}