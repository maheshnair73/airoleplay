
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Settings, ArrowRight, CheckSquare, ListTodo, ExternalLink, Server } from 'lucide-react';
import { toast } from 'sonner';

const getProductionOrigin = () => {
    const host = window.location.host;
    // This will remove 'preview--' from the host if it exists, ensuring the URL is always the production one.
    const productionHost = host.replace('preview--', '');
    return `https://${productionHost}`;
};

const WebhookGuide = ({ platform, webhookUrl, steps }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl);
        toast.success(`${platform} webhook URL copied to clipboard!`);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-slate-700" />
                    <div>
                        <CardTitle>{platform} Webhook Setup</CardTitle>
                        <CardDescription>A one-time setup by your {platform} administrator.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Copy className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-800">Step 1: Copy This Webhook URL</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                        First, copy this URL - you'll need to paste it into {platform} in the steps below.
                    </p>
                    <div className="bg-white p-3 rounded border">
                        <Label htmlFor={`${platform}-webhook-url`} className="text-xs font-semibold text-slate-500 block mb-1">
                            {platform} Webhook Endpoint URL
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id={`${platform}-webhook-url`} 
                                readOnly 
                                value={webhookUrl} 
                                className="bg-slate-50 text-sm font-mono" 
                            />
                            <Button variant="outline" size="sm" onClick={copyToClipboard}>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-slate-600" />
                        <span className="font-semibold text-slate-800">Step 2: Configure {platform}</span>
                    </div>
                    
                    <div className="space-y-3 pl-6">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800">{step.title}</p>
                                    <p className="text-sm text-slate-600 mt-1" dangerouslySetInnerHTML={{ __html: step.description }}></p>
                                    {step.link && (
                                        <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-flex items-center">
                                            Open {platform} Settings <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const VoicegateWebhookCard = () => {
    const voicegateWebhookUrl = `${getProductionOrigin()}/api/functions/voicegateAnalyticsWebhook`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(voicegateWebhookUrl);
        toast.success("Voicegate webhook URL copied to clipboard!");
    };

    const copyNote = () => {
        const note = `Hi Voicegate Team,

Please configure your system to send call analytics data to our secure webhook endpoint:

**Webhook URL:**
${voicegateWebhookUrl}

**Authentication:**
Include: Authorization: Bearer <SECRET_TOKEN_WE_WILL_PROVIDE>

**JSON Payload (as per the structure you currently use):**
{
  "CampaignID": "string",
  "Count": "number",
  "Direction": "string",
  "Data": [
    {
      "agent_name": "string",
      "agentid": "string",
      "Called_no": "string",
      "Calling_no": "string",
      "disposition": "string",
      "end_time": "datetime string",
      "id": "string",
      "recording_file": "string (URL)",
      "remarks": "string",
      "start_time": "datetime string",
      "status": "string",
      "transid": "string"
    }
  ]
}

Please confirm receipt and let us know if you need any clarifications.

Thank you!`;
        
        navigator.clipboard.writeText(note);
        toast.success("Integration note copied to clipboard!");
    };

    return (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Server className="w-6 h-6 text-green-700" />
                    <div>
                        <CardTitle className="text-green-900">Voicegate Analytics Webhook</CardTitle>
                        <CardDescription className="text-green-700">For receiving call analytics directly from Voicegate</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                    <Label htmlFor="voicegate-webhook-url" className="text-xs font-semibold text-slate-500 block mb-1">
                        Webhook Endpoint URL (Permanent)
                    </Label>
                    <div className="flex items-center gap-2 mb-4">
                        <Input
                            id="voicegate-webhook-url"
                            readOnly
                            value={voicegateWebhookUrl}
                            className="bg-slate-50 text-sm font-mono"
                        />
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy URL
                        </Button>
                    </div>
                    
                    <Button onClick={copyNote} className="w-full bg-green-600 hover:bg-green-700">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Complete Integration Note for Voicegate Team
                    </Button>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-3">
                    <p className="text-sm text-amber-900 font-bold">
                        Action Required: Create a Secret Token
                    </p>
                    <p className="text-sm text-amber-800">
                        To protect this webhook, you need to create a secure password (a "secret token").
                    </p>
                    <ol className="list-decimal list-inside text-sm text-amber-800 space-y-2">
                        <li>
                            <strong>Generate a secret token.</strong> This should be a strong, random string of characters. You can use an online password generator. 
                            <br/>
                            <em className="text-xs">(Example: <code className="bg-amber-200 p-1 rounded">Trg9wLpZ2@qX7!vR&kF$</code>)</em>
                        </li>
                        <li>
                            <strong>Set the token here.</strong> Go to <code className="bg-amber-200 p-1 rounded">Workspace &gt; Settings &gt; Secrets</code> and create a new secret named <code className="bg-amber-200 p-1 rounded">VOICEGATE_WEBHOOK_SECRET</code> with your generated token as the value.
                        </li>
                        <li>
                            <strong>Share the token with Voicegate.</strong> Provide this exact token to the Voicegate team so they can include it for authentication.
                        </li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
};

export default function BackendSetup() {
    const productionOrigin = getProductionOrigin();
    const zoomWebhookUrl = `${productionOrigin}/api/functions/zoomWebhook`;
    const teamsWebhookUrl = `${productionOrigin}/api/functions/teamsWebhook`;

    const zoomSteps = [
        { title: 'Go to Zoom Marketplace', description: 'Log in as an admin and navigate to the App Marketplace.', link: 'https://marketplace.zoom.us/' },
        { title: 'Create a Webhook-only App', description: 'Click "Develop" > "Build App" and choose a "Webhook Only" app. Name it "SalesAI Pro".' },
        { title: 'Add Event Subscription', description: 'Navigate to the "Event Subscriptions" tab. Paste the webhook URL you copied above into the "Event notification endpoint URL" field.' },
        { title: 'Subscribe to Events', description: 'Click "Add Events" and subscribe to the "Recording" > "All cloud recordings have completed" event.' },
        { title: 'Activate the App', description: 'Save your changes. Zoom will validate the endpoint, and then you can activate the app for your organization.' },
    ];

    const teamsSteps = [
        { title: 'Navigate to App Registrations', description: 'Log in to the Azure Portal as an admin and go to "Microsoft Entra ID" > "App registrations".', link: 'https://portal.azure.com/' },
        { title: 'Register the Application', description: 'Click "New registration". Name the application "SalesAI Pro".' },
        { title: 'Select Account Type (Crucial Step)', description: "Under 'Supported account types', select the option: <b>'Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)'</b>. This is essential to allow your customer organizations to connect their Teams accounts." },
        { title: 'Create a Client Secret', description: 'Once registered, go to "Certificates & secrets" in the app menu. Click "New client secret", give it a description, and click "Add". <b>Important:</b> Copy the secret "Value" immediately and save it securely. You will need to provide this to SalesAI Pro.' },
        { title: 'Grant API Permissions', description: 'Go to "API permissions" > "Add a permission" > "Microsoft Graph". Select "Application permissions", then search for and add <b>CallRecord.Read.All</b>. Finally, click "Grant admin consent for..." to approve the permission.' },
        { title: 'Create the Webhook Subscription', description: 'This final, advanced step requires an API call to Microsoft Graph to subscribe to call record notifications. This is typically done using a tool like Graph Explorer or a script, where you will create a subscription pointing to the webhook URL from Step 1.' }
    ];

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Backend Setup Guide</h1>
                <p className="text-slate-600 mt-2">
                    Follow these one-time setup guides to enable automatic integrations for your entire team.
                </p>
            </div>

            <div className="space-y-8">
                <VoicegateWebhookCard />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <WebhookGuide platform="Zoom" webhookUrl={zoomWebhookUrl} steps={zoomSteps} />
                    <WebhookGuide platform="Microsoft Teams" webhookUrl={teamsWebhookUrl} steps={teamsSteps} />
                </div>
            </div>
        </div>
    );
}
