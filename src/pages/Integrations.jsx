import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    Video, Plug, CheckCircle, Copy, Settings, Phone, Mail, 
    MessageSquare, Calendar, Users, Globe, Building2, Zap
} from 'lucide-react';
import { toast } from 'sonner';

// Custom icons for platforms not in Lucide
const TeamsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.4376 10.3332H15.4219V4.5H21.4376C21.968 4.5 22.4 4.93203 22.4 5.46237V9.3708C22.4 9.90114 21.968 10.3332 21.4376 10.3332Z" fill="#4B53BC"/>
        <path d="M14.4609 4.5H8.72852C7.30664 4.5 6.14062 5.66602 6.14062 7.08789V9.3709H12.1484C13.4336 9.3709 14.4609 8.34355 14.4609 7.0584V4.5Z" fill="#5C63CE"/>
        <path d="M14.4609 10.3332H6.14062V12.6164C6.14062 13.9344 7.20312 15.0156 8.52109 15.0156H14.4609V10.3332Z" fill="#7879F1"/>
        <path d="M15.4219 19.5H21.4376C21.968 19.5 22.4 19.068 22.4 18.5376V14.6291C22.4 14.0988 21.968 13.6668 21.4376 13.6668H15.4219V19.5Z" fill="#4B53BC"/>
        <rect x="2" y="7.95898" width="3.17969" height="8.08203" rx="1.58984" fill="#2D2D2D"/>
        <circle cx="3.58984" cy="5.93945" r="2" fill="#2D2D2D"/>
    </svg>
);

const WebexIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#00C473"/>
        <path d="M8 10l4 4 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const HubSpotIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#FF7A59"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <path d="M12 3v6M12 15v6M3 12h6M15 12h6" stroke="white" strokeWidth="2"/>
    </svg>
);

const SalesforceIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#00A1E0"/>
        <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white"/>
    </svg>
);

const IntegrationCard = ({ 
    icon, 
    title, 
    description, 
    isConnected, 
    onConnect, 
    onDisconnect,
    webhookUrl,
    category = "meeting",
    comingSoon = false 
}) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl);
        toast.success("Webhook URL copied to clipboard!");
    };
    
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {icon}
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {title}
                                {comingSoon && (
                                    <Badge variant="outline" className="text-xs">Soon</Badge>
                                )}
                            </CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                    {comingSoon ? (
                        <Badge variant="outline" className="text-slate-500 bg-slate-50">
                            Coming Soon
                        </Badge>
                    ) : isConnected ? (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                <CheckCircle className="w-4 h-4 mr-1" /> Connected
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={onDisconnect}>
                                Disconnect
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={onConnect}>Connect</Button>
                    )}
                </div>
            </CardHeader>
            {isConnected && webhookUrl && category === "meeting" && (
                <CardContent>
                    <Alert>
                        <Settings className="h-4 w-4" />
                        <AlertTitle>Webhook Configuration</AlertTitle>
                        <AlertDescription>
                            Add this webhook URL to your {title} app settings to receive recordings automatically.
                        </AlertDescription>
                        <div className="flex items-center gap-2 mt-3 bg-slate-100 p-2 rounded-md">
                            <Input 
                                readOnly 
                                value={webhookUrl} 
                                className="text-xs flex-1 bg-transparent border-0 shadow-none focus-visible:ring-0" 
                            />
                            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                                <Copy className="w-4 h-4"/>
                            </Button>
                        </div>
                    </Alert>
                </CardContent>
            )}
        </Card>
    );
};

export default function Integrations() {
    const [user, setUser] = useState(null);
    const [connections, setConnections] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Load user and their integration connections
    useEffect(() => {
        const loadUserConnections = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                
                // Load existing connections from user data
                const userConnections = currentUser.integrations || {};
                setConnections(userConnections);
            } catch (error) {
                console.error('Error loading user:', error);
            }
            setIsLoading(false);
        };
        
        loadUserConnections();
    }, []);

    const handleConnect = async (integrationKey) => {
        try {
            const newConnections = {
                ...connections,
                [integrationKey]: {
                    connected: true,
                    connectedAt: new Date().toISOString(),
                    status: 'active'
                }
            };
            
            // Save to user data
            await User.updateMyUserData({ integrations: newConnections });
            
            setConnections(newConnections);
            toast.success(`${integrationKey} connected successfully!`);
        } catch (error) {
            console.error('Error connecting integration:', error);
            toast.error(`Failed to connect ${integrationKey}`);
        }
    };

    const handleDisconnect = async (integrationKey) => {
        try {
            const newConnections = {
                ...connections,
                [integrationKey]: {
                    connected: false,
                    disconnectedAt: new Date().toISOString()
                }
            };
            
            // Save to user data
            await User.updateMyUserData({ integrations: newConnections });
            
            setConnections(newConnections);
            toast.success(`${integrationKey} disconnected successfully!`);
        } catch (error) {
            console.error('Error disconnecting integration:', error);
            toast.error(`Failed to disconnect ${integrationKey}`);
        }
    };

    const isConnected = (key) => connections[key]?.connected || false;

    // Webhook URLs (these would be your actual deployment URLs)
    const webhookUrls = {
        zoom: "https://your-app-domain.com/api/zoomWebhook",
        teams: "https://your-app-domain.com/api/teamsWebhook",
        webex: "https://your-app-domain.com/api/webexWebhook",
        meet: "https://your-app-domain.com/api/meetWebhook"
    };

    const integrations = {
        meeting: [
            {
                key: 'zoom',
                icon: <Video className="w-8 h-8 text-blue-500" />,
                title: 'Zoom',
                description: 'Connect your Zoom account to analyze cloud recordings.',
                webhookUrl: webhookUrls.zoom
            },
            {
                key: 'teams',
                icon: <TeamsIcon />,
                title: 'Microsoft Teams',
                description: 'Connect your Microsoft 365 account for Teams meetings.',
                webhookUrl: webhookUrls.teams
            },
            {
                key: 'webex',
                icon: <WebexIcon />,
                title: 'Cisco Webex',
                description: 'Analyze Webex meeting recordings and calls.',
                webhookUrl: webhookUrls.webex,
                comingSoon: true
            },
            {
                key: 'meet',
                icon: <Video className="w-8 h-8 text-green-500" />,
                title: 'Google Meet',
                description: 'Connect Google Meet for recording analysis.',
                webhookUrl: webhookUrls.meet,
                comingSoon: true
            }
        ],
        crm: [
            {
                key: 'salesforce',
                icon: <SalesforceIcon />,
                title: 'Salesforce',
                description: 'Sync leads, opportunities, and activities with Salesforce.',
                category: 'crm',
                comingSoon: true
            },
            {
                key: 'hubspot',
                icon: <HubSpotIcon />,
                title: 'HubSpot',
                description: 'Connect HubSpot CRM for seamless data sync.',
                category: 'crm',
                comingSoon: true
            }
        ],
        communication: [
            {
                key: 'email',
                icon: <Mail className="w-8 h-8 text-blue-600" />,
                title: 'Email Integration',
                description: 'Connect Gmail/Outlook for email tracking and templates.',
                category: 'communication',
                comingSoon: true
            },
            {
                key: 'phone',
                icon: <Phone className="w-8 h-8 text-green-600" />,
                title: 'Phone System',
                description: 'Integrate with your phone system for call logging.',
                category: 'communication',
                comingSoon: true
            },
            {
                key: 'calendar',
                icon: <Calendar className="w-8 h-8 text-purple-600" />,
                title: 'Calendar Sync',
                description: 'Sync meetings and appointments across platforms.',
                category: 'communication',
                comingSoon: true
            }
        ]
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-32 bg-slate-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Integrations</h1>
                <p className="text-slate-600 mt-2">Connect your favorite tools to supercharge your sales workflow.</p>
            </div>

            {/* Meeting Platforms */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Video className="w-6 h-6" />
                        Meeting Platforms
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {integrations.meeting.map(integration => (
                            <IntegrationCard
                                key={integration.key}
                                icon={integration.icon}
                                title={integration.title}
                                description={integration.description}
                                isConnected={isConnected(integration.key)}
                                onConnect={() => handleConnect(integration.key)}
                                onDisconnect={() => handleDisconnect(integration.key)}
                                webhookUrl={integration.webhookUrl}
                                category="meeting"
                                comingSoon={integration.comingSoon}
                            />
                        ))}
                    </div>
                </div>

                {/* CRM Systems */}
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Building2 className="w-6 h-6" />
                        CRM Systems
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {integrations.crm.map(integration => (
                            <IntegrationCard
                                key={integration.key}
                                icon={integration.icon}
                                title={integration.title}
                                description={integration.description}
                                isConnected={isConnected(integration.key)}
                                onConnect={() => handleConnect(integration.key)}
                                onDisconnect={() => handleDisconnect(integration.key)}
                                category={integration.category}
                                comingSoon={integration.comingSoon}
                            />
                        ))}
                    </div>
                </div>

                {/* Communication Tools */}
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" />
                        Communication Tools
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {integrations.communication.map(integration => (
                            <IntegrationCard
                                key={integration.key}
                                icon={integration.icon}
                                title={integration.title}
                                description={integration.description}
                                isConnected={isConnected(integration.key)}
                                onConnect={() => handleConnect(integration.key)}
                                onDisconnect={() => handleDisconnect(integration.key)}
                                category={integration.category}
                                comingSoon={integration.comingSoon}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Developer Note */}
            <Alert>
                <Plug className="h-4 w-4"/>
                <AlertTitle>Integration Status</AlertTitle>
                <AlertDescription>
                    The "Connect" buttons for Zoom and Teams are functional and will save your connection preferences. 
                    For production deployment, these would trigger OAuth flows to the respective platforms. 
                    Other integrations marked as "Coming Soon" are in development.
                </AlertDescription>
            </Alert>
        </div>
    );
}