
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Code, Smartphone, Shield, Zap, BookOpen, Users, Target, Bot, Database } from 'lucide-react';

const ApiSection = ({ title, icon: Icon, children }) => (
    <Card className="card-print">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Icon className="w-6 h-6 text-blue-600" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const CodeBlock = ({ language, children }) => (
    <pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto text-sm my-4">
        <code className={`language-${language}`}>{children}</code>
    </pre>
);

const Endpoint = ({ method, path, description }) => (
    <div className="border-b py-3">
        <div className="flex items-center gap-3">
            <Badge className={
                method === 'GET' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
            }>{method}</Badge>
            <code className="font-mono text-slate-800">{path}</code>
        </div>
        <p className="text-sm text-slate-600 mt-1 ml-12">{description}</p>
    </div>
);

export default function APIDocumentation() {
    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-blue-100 rounded-full p-3 mb-4">
                        <Smartphone className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Mobile Developer API Documentation
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        A guide for integrating the SalesAI Pro platform into native mobile applications (iOS & Android).
                    </p>
                    <div data-no-print="true" className="mt-6 flex justify-center items-center gap-4">
                        <Badge variant="outline">Version: 1.0</Badge>
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download as PDF
                        </Button>
                    </div>
                </div>

                <ApiSection title="Authentication" icon={Shield}>
                    <p>Authentication is handled via JWTs. The mobile app must first authenticate the user using their credentials to obtain a token, which must then be included in the `Authorization` header for all subsequent requests.</p>
                    <CodeBlock language="http">
                        {`POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "user_password"
}

-- RESPONSE --
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "ey...",
  "user": { "id": "...", "email": "...", "role": "sales_rep" }
}`}
                    </CodeBlock>
                     <p>Include the token in all future requests:</p>
                    <CodeBlock language="http">
                        {`Authorization: Bearer <YOUR_JWT_TOKEN>`}
                    </CodeBlock>
                </ApiSection>

                <ApiSection title="SDK Integration (Recommended)" icon={BookOpen}>
                    <p>While you can use the REST API directly, we strongly recommend using our platform's auto-generated SDK, which provides a type-safe and more convenient way to interact with the backend data. The SDK handles authentication, data parsing, and error handling for you.</p>
                    <h3 className="font-semibold text-lg mt-4 mb-2">Swift (iOS) Example:</h3>
                    <CodeBlock language="swift">
{`import Base44

// Configure with your app details
Base44.configure(appId: "YOUR_APP_ID")

// Login
let user = await Base44.auth.login(email: "user@example.com", password: "...")

// Fetch leads after login
let leads = try await Base44.entities.Lead.list(orderBy: "-created_date", limit: 50)
for lead in leads {
    print("Lead: \\(lead.contactName ?? "N/A")")
}`}
                    </CodeBlock>
                    <h3 className="font-semibold text-lg mt-4 mb-2">Kotlin (Android) Example:</h3>
                    <CodeBlock language="kotlin">
{`import com.base44.sdk.Base44
import kotlinx.coroutines.runBlocking

// Configure
Base44.configure(appId = "YOUR_APP_ID")

// Login in a coroutine
runBlocking {
    val user = Base44.auth.login("user@example.com", "...")

    // Fetch deals
    val deals = Base44.entities.Deal.list(limit = 20)
    deals.forEach { deal ->
        println("Deal: \${deal.dealName}")
    }
}`}
                    </CodeBlock>
                </ApiSection>

                <ApiSection title="Core Endpoints (REST API)" icon={Database}>
                    <p>If not using the SDK, you can interact with the core entities via these REST endpoints. All responses are in JSON format.</p>
                    <h3 className="font-semibold text-lg mt-4 mb-2 flex items-center gap-2"><Users className="w-5 h-5"/>Leads</h3>
                    <Endpoint method="GET" path="/api/entities/Lead/list" description="Retrieve a list of leads assigned to the authenticated user." />
                    <Endpoint method="GET" path="/api/entities/Lead/get?id={lead_id}" description="Get details for a single lead." />
                    <Endpoint method="POST" path="/api/entities/Lead/update" description="Update a lead's properties (e.g., status, notes)." />
                    
                    <h3 className="font-semibold text-lg mt-6 mb-2 flex items-center gap-2"><Target className="w-5 h-5"/>Deals</h3>
                    <Endpoint method="GET" path="/api/entities/Deal/list" description="Retrieve a list of deals for the user." />
                    <Endpoint method="GET" path="/api/entities/Deal/get?id={deal_id}" description="Get details for a single deal." />
                </ApiSection>

                <ApiSection title="AI & Functional Endpoints" icon={Bot}>
                    <p>Complex operations and AI interactions are handled by serverless functions. These should be invoked using a `POST` request to the function's endpoint.</p>
                     <h3 className="font-semibold text-lg mt-4 mb-2">AI Roleplay</h3>
                     <p>This endpoint manages a conversational voice roleplay session. It's stateful and requires sending the transcript history with each turn.</p>
                     <Endpoint method="POST" path="/api/functions/aiRoleplay/invoke" description="Send user's speech and get AI's audio response." />
                     <CodeBlock language="json">
{`// REQUEST BODY
{
  "userText": "Hi, I'd like to talk about your software needs.",
  "prospect": { "name": "Logan Sullivan", "personality": "Nice" },
  "transcriptHistory": [
    { "speaker": "ai", "text": "This is Logan." }
  ]
}

// RESPONSE BODY
{
    "text": "Sure, you have 2 minutes. What's this about?",
    "audio": "BASE64_ENCODED_MP3_DATA"
}`}
                     </CodeBlock>

                     <h3 className="font-semibold text-lg mt-6 mb-2">Call Analysis</h3>
                     <p>After a call is recorded and uploaded, this function can be triggered to get AI-powered analysis.</p>
                     <Endpoint method="POST" path="/api/functions/analyzeCallRecording/invoke" description="Submits a call recording for transcription and analysis." />
                     <CodeBlock language="json">
{`// REQUEST BODY
{
  "recording_url": "https://path/to/your/audio.mp3",
  "call_id": "call_xyz789",
  "caller_email": "rep@example.com"
}

// NOTE: This is an async operation. The function will update the 'CallRecord'
// entity with the analysis results when complete.`}
                     </CodeBlock>
                </ApiSection>

                 <ApiSection title="Real-Time Events (WebSockets)" icon={Zap}>
                    <p>For a live, interactive experience, the mobile app should connect to our WebSocket server to receive real-time events. This is crucial for features like live notifications.</p>
                     <h3 className="font-semibold text-lg mt-4 mb-2">Connection</h3>
                     <p>Connect to the WebSocket endpoint using your JWT for authentication.</p>
                     <CodeBlock language="javascript">
                        {`const socket = new WebSocket('wss://api.effysales.pro/ws?token=YOUR_JWT_TOKEN');`}
                    </CodeBlock>

                    <h3 className="font-semibold text-lg mt-4 mb-2">Listening for Events</h3>
                     <p>Once connected, listen for `message` events. The data will be a JSON string.</p>
                     <CodeBlock language="javascript">
{`socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'DOCUMENT_VIEW_STARTED':
            // Show a notification: "Logan from Acme just opened 'Your Proposal.pdf'"
            console.log(data.payload); 
            // { document_name: '...', viewer_name: '...', ... }
            break;
        case 'LEAD_STATUS_UPDATED':
            // Refresh the lead list or update a specific lead's UI
            console.log(data.payload);
            // { lead_id: '...', new_status: 'qualified' }
            break;
    }
};`}
                    </CodeBlock>
                </ApiSection>
            </div>
        </div>
    );
}
