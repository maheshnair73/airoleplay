import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';

export default function EffyVoiceErrorLog() {
    const lastAttempt = {
      sessionId: '495437356721877', // From your actual debug session
      agentId: '4455',
      extension: '9699859996',
    };

    // Helper to generate the JSON payload string for clarity
    const generatePayload = (calledNumber) => {
        return JSON.stringify({
            AgentID: lastAttempt.agentId,
            Called_no: calledNumber,
            Extension: lastAttempt.extension
        }, null, 2); // Pretty print JSON
    };

    const logText = `
Subject: EffyVoice API Dialing Error - "Invalid Called number" - Multiple Numbers Tested

To the EffyVoice Support Team,

We are encountering a persistent error when trying to use your dialing API. ALL phone numbers are being rejected as "Invalid Called number" even when they are exactly 10 digits without leading zero.

Summary:
We are successfully authenticating and receiving a SessionID. However, when we use that SessionID to make calls via the /v1/dial/{SessionID} endpoint, the API consistently returns "Invalid Called number, please enter 10 digit number without 0" error for ALL numbers tested.

Here are the detailed logs from our recent debug session:

---

1. Authentication (Login) - SUCCESS
   - Endpoint: POST https://icicisecs.voicegateindia.com:49443/v1/user/login
   - Request Payload: {"Userid": "effibiz", "Password": "vgt@***"}
   - Result: Successful. A valid Session ID was returned.
   - Session ID from this attempt: ${lastAttempt.sessionId}

2. Multiple Dialing Attempts - ALL FAILED
   - Endpoint: PUT https://icicisecs.voicegateindia.com:49443/v1/dial/${lastAttempt.sessionId}
   
   Test 1 - Number: 9821226717
   Request Payload:
   \`\`\`json
${generatePayload("9821226717")}
   \`\`\`
   Response: "Invalid Called number, please enter 10 digit number without 0"
   
   Test 2 - Number: 09821226717
   Request Payload:
   \`\`\`json
${generatePayload("09821226717")}
   \`\`\`
   Response: "Invalid Called number, please enter 10 digit number without 0"
   
   Test 3 - Number: 919821226717
   Request Payload:
   \`\`\`json
${generatePayload("919821226717")}
   \`\`\`
   Response: "Invalid Called number, please enter 10 digit number without 0"

---

CRITICAL ISSUE:
Even the number "9821226717" which is EXACTLY 10 digits with NO leading zero is being rejected. This suggests either:

1. There is a server-side configuration issue with AgentID "${lastAttempt.agentId}"
2. The AgentID is not properly configured for outbound calling
3. There are additional validation rules not mentioned in the error message
4. There is a bug in your API validation logic

Please urgently check:
- Is AgentID "${lastAttempt.agentId}" active and configured for outbound calls?
- Are there any additional number format requirements not mentioned in the error?
- Are there any account-level restrictions preventing calls?

Current Success Rate: 0/5 (ALL numbers rejected)

Thank you for your urgent assistance.
`;

    const handleCopy = () => {
        navigator.clipboard.writeText(logText.trim());
        toast.success("Actual error log copied to clipboard!");
    };

    return (
        <Card className="shadow-lg border-red-500 border-t-4">
            <CardHeader>
                <CardTitle>2. Actual Error Log from Recent Debug Session</CardTitle>
                <CardDescription>
                    This shows the real data from your recent debug test - ALL numbers failed, even perfectly formatted 10-digit numbers.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-semibold">Key Finding:</p>
                    <p className="text-red-700">Even "9821226717" (exactly 10 digits, no leading zero) was rejected. This indicates a server-side configuration issue, not a formatting problem.</p>
                </div>
                <pre className="bg-slate-900 text-white text-xs rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono">
                    {logText.trim()}
                </pre>
                <Button onClick={handleCopy} className="w-full bg-red-500 hover:bg-red-600">
                    <ClipboardCopy className="w-4 h-4 mr-2" />
                    Copy Actual Error Log to Clipboard
                </Button>
            </CardContent>
        </Card>
    );
}