import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailConnection } from '@/api/entities';
import { toast } from 'sonner';
import { 
    Plug, Trash2, Loader2, CheckCircle, Mail, Server, Send, Edit, X, User, 
    Sparkles, Settings, BookOpen, AlertCircle 
} from 'lucide-react';
import { emailOAuth } from '@/api/functions';
import { syncEmails } from '@/api/functions';
import { sendTestEmail } from '@/api/functions';

export default function EmailSettings() {
    const [connections, setConnections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [testingId, setTestingId] = useState(null);
    const [editingConnection, setEditingConnection] = useState(null);
    const [activeTab, setActiveTab] = useState('connections');
    const smtpFormRef = useRef(null);
    
    const [smtpDetails, setSmtpDetails] = useState({
        display_name: 'Mahesh Nair',
        incoming_server: 'imap.gmail.com',
        incoming_port: 993,
        incoming_type: 'IMAP',
        incoming_secure: true,
        host: 'smtp.gmail.com',
        port: 587, 
        user: 'maheshnair73@gmail.com',
        password: '',
        secure: false, 
    });

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        setIsLoading(true);
        try {
            const data = await EmailConnection.list();
            setConnections(data);
        } catch (error) {
            toast.error("Failed to load email connections.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthConnect = async (provider) => {
        setIsConnecting(true);
        try {
            const { data } = await emailOAuth({ action: 'initiate', provider });
            const oauthPopup = window.open(data.oauthUrl, 'oauthWindow', 'height=600,width=500');
            
            const timer = setInterval(() => {
                if (oauthPopup.closed) {
                    clearInterval(timer);
                    setIsConnecting(false);
                    loadConnections();
                }
            }, 1000);

        } catch (error) {
            toast.error(`Failed to initiate ${provider} connection.`);
            setIsConnecting(false);
        }
    };
    
    const handleSmtpSubmit = async (e) => {
        e.preventDefault();
        if (!smtpDetails.password && !editingConnection) { 
            toast.error("Please enter your email account password.");
            return;
        }
        setIsConnecting(true);
        try {
            const payload = {
                provider: 'smtp',
                email_address: smtpDetails.user,
                display_name: smtpDetails.display_name || smtpDetails.user,
                incoming_server: smtpDetails.incoming_server,
                incoming_port: smtpDetails.incoming_port,
                incoming_type: smtpDetails.incoming_type,
                incoming_secure: smtpDetails.incoming_secure,
                smtp_host: smtpDetails.host,
                smtp_port: smtpDetails.port,
                smtp_user: smtpDetails.user,
                smtp_secure: smtpDetails.secure,
                is_active: true
            };

            if (editingConnection) {
                if (smtpDetails.password) {
                    payload.smtp_password = smtpDetails.password;
                }
                await EmailConnection.update(editingConnection.id, payload);
                toast.success("SMTP connection updated successfully!");
                setEditingConnection(null);
            } else {
                payload.smtp_password = smtpDetails.password;
                await EmailConnection.create(payload);
                toast.success("SMTP connection saved successfully!");
            }
            
            loadConnections();
            setSmtpDetails({ 
                display_name: 'Mahesh Nair', 
                incoming_server: 'imap.gmail.com',
                incoming_port: 993,
                incoming_type: 'IMAP',
                incoming_secure: true,
                host: 'smtp.gmail.com', 
                port: 587, 
                user: 'maheshnair73@gmail.com', 
                password: '', 
                secure: false
            });
            setActiveTab('connections');
            
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.details || error.data?.details || error.message || "An unknown error occurred.";
            toast.error(`Failed to ${editingConnection ? 'update' : 'save'} SMTP connection.`, { description: errorMessage });
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async (id) => {
        if (editingConnection?.id === id) {
            setEditingConnection(null);
            setSmtpDetails({ 
                display_name: 'Mahesh Nair', 
                incoming_server: 'imap.gmail.com',
                incoming_port: 993,
                incoming_type: 'IMAP',
                incoming_secure: true,
                host: 'smtp.gmail.com', 
                port: 587, 
                user: 'maheshnair73@gmail.com', 
                password: '', 
                secure: false
            });
        }
        try {
            await EmailConnection.delete(id);
            toast.success("Connection removed.");
            loadConnections();
        } catch (error) {
            toast.error("Failed to remove connection.");
        }
    };

    const handleSync = async (connectionId) => {
        toast.info("Starting email sync...");
        try {
            await syncEmails({ connectionId });
            toast.success("Email sync completed successfully.");
        } catch(error) {
            toast.error("Failed to sync emails.");
        }
    };

    const handleSendTest = async (connectionId) => {
        setTestingId(connectionId);
        toast.info("Sending test email...");
        try {
            await sendTestEmail({ connectionId });
            toast.success("Test email sent! Please check your inbox.");
        } catch (error) {
            console.error(error);
            const errorMessage = error.data?.details || error.message || "An unknown error occurred.";
            toast.error("Failed to send test email.", { description: errorMessage });
        } finally {
            setTestingId(null);
        }
    };

    const handleEdit = (connection) => {
        setEditingConnection(connection);
        setSmtpDetails({
            display_name: connection.display_name || '',
            incoming_server: connection.incoming_server || 'mail.effybiz.com',
            incoming_port: connection.incoming_port || (connection.incoming_type === 'POP3' ? 995 : 993),
            incoming_type: connection.incoming_type || 'IMAP',
            incoming_secure: connection.incoming_secure !== undefined ? connection.incoming_secure : true,
            host: connection.smtp_host,
            port: connection.smtp_port,
            user: connection.smtp_user,
            password: '',
            secure: connection.smtp_secure,
        });
        setActiveTab('manual-setup');
    };

    const handleCancelEdit = () => {
        setEditingConnection(null);
        setSmtpDetails({ 
            display_name: 'Mahesh Nair', 
            incoming_server: 'imap.gmail.com',
            incoming_port: 993,
            incoming_type: 'IMAP',
            incoming_secure: true,
            host: 'smtp.gmail.com', 
            port: 587, 
            user: 'maheshnair73@gmail.com', 
            password: '', 
            secure: false
        });
    };
    
    const activeConnection = connections.find(c => c.is_active);
    const isEditing = !!editingConnection;

    const handleGmailPreset = () => {
        setSmtpDetails({
            display_name: 'Mahesh Nair',
            incoming_server: 'imap.gmail.com',
            incoming_port: 993,
            incoming_type: 'IMAP',
            incoming_secure: true,
            host: 'smtp.gmail.com',
            port: 587,
            user: 'maheshnair73@gmail.com',
            password: '',
            secure: false,
        });
        toast.info("Gmail settings applied. Use the same email and App Password for both incoming and outgoing.");
    };

    const handleOutlookPreset = () => {
        setSmtpDetails(prev => ({
            ...prev,
            display_name: prev.display_name || 'Mahesh Nair',
            user: prev.user || '',
            incoming_server: 'outlook.office365.com',
            incoming_port: 993,
            incoming_type: 'IMAP',
            incoming_secure: true,
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            password: '',
        }));
        toast.info("Outlook settings applied. Use the same email and password for both incoming and outgoing.");
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Email Settings</h1>
                <p className="text-slate-600 mt-2">Connect and manage your email accounts for seamless communication.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100">
                    <TabsTrigger value="connections" className="data-[state=active]:bg-white">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        My Connections
                    </TabsTrigger>
                    <TabsTrigger value="quick-connect" className="data-[state=active]:bg-white">
                        <Plug className="w-4 h-4 mr-2" />
                        Quick Connect
                    </TabsTrigger>
                    <TabsTrigger value="manual-setup" className="data-[state=active]:bg-white">
                        <Settings className="w-4 h-4 mr-2" />
                        Manual Setup
                    </TabsTrigger>
                    <TabsTrigger value="help" className="data-[state=active]:bg-white">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Help Guide
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Current Connections */}
                <TabsContent value="connections" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Connected Email Accounts
                            </CardTitle>
                            <CardDescription>
                                Manage your connected email accounts. You can test, sync, edit, or disconnect them here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                                </div>
                            ) : connections.length > 0 ? (
                                <div className="space-y-4">
                                    {connections.map(conn => (
                                        <div key={conn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                    <Mail className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-lg text-slate-800">{conn.display_name || conn.email_address}</p>
                                                    <p className="text-sm text-slate-500">{conn.email_address}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs capitalize">
                                                            {conn.provider}
                                                        </Badge>
                                                        {conn.is_active && (
                                                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                                                <CheckCircle className="w-3 h-3 mr-1"/>
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleSendTest(conn.id)}
                                                    disabled={testingId === conn.id}
                                                >
                                                    {testingId === conn.id ? (
                                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <Send className="w-4 h-4 mr-1" />
                                                    )}
                                                    Test
                                                </Button>
                                                {conn.provider === 'smtp' && (
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(conn)}>
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                )}
                                                {conn.provider !== 'smtp' && (
                                                    <Button variant="outline" size="sm" onClick={() => handleSync(conn.id)}>
                                                        Sync
                                                    </Button>
                                                )}
                                                <Button variant="destructive" size="sm" onClick={() => handleDisconnect(conn.id)}>
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No Email Accounts Connected</h3>
                                    <p className="text-slate-500 mb-6">Get started by connecting your first email account</p>
                                    <Button onClick={() => setActiveTab('quick-connect')} className="bg-blue-600 hover:bg-blue-700">
                                        <Plug className="w-4 h-4 mr-2" />
                                        Connect Email Account
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Quick Connect */}
                <TabsContent value="quick-connect" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plug className="w-5 h-5 text-blue-600" />
                                Quick Connect
                            </CardTitle>
                            <CardDescription>
                                Connect your email account with one-click OAuth authentication (recommended)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 border-2 border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                                            <Mail className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-blue-800">Gmail</h3>
                                        <p className="text-blue-700 text-sm">Connect your Gmail account with secure OAuth</p>
                                        <Button 
                                            className="w-full bg-blue-600 hover:bg-blue-700" 
                                            onClick={() => handleOAuthConnect('gmail')} 
                                            disabled={isConnecting}
                                        >
                                            {isConnecting ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Plug className="w-4 h-4 mr-2" />
                                            )}
                                            Connect Gmail
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6 border-2 border-sky-200 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center mx-auto">
                                            <Mail className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-sky-800">Outlook</h3>
                                        <p className="text-sky-700 text-sm">Connect your Outlook/Office 365 account</p>
                                        <Button 
                                            className="w-full bg-sky-600 hover:bg-sky-700" 
                                            onClick={() => handleOAuthConnect('outlook')} 
                                            disabled={isConnecting}
                                        >
                                            {isConnecting ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Plug className="w-4 h-4 mr-2" />
                                            )}
                                            Connect Outlook
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-amber-800 font-medium">Can't connect with OAuth?</p>
                                        <p className="text-amber-700 text-sm mt-1">
                                            If OAuth isn't working, you can set up your email manually in the "Manual Setup" tab with your SMTP/IMAP details.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 3: Manual Setup */}
                <TabsContent value="manual-setup" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-slate-600" />
                                {isEditing ? 'Edit Email Connection' : 'Manual Email Setup'}
                            </CardTitle>
                            <CardDescription>
                                {isEditing ? 'Update your email server settings below.' : 'Configure both incoming (IMAP/POP3) and outgoing (SMTP) email servers to send and receive emails.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Important Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-blue-800 font-medium">Complete Email Setup Required</p>
                                        <p className="text-blue-700 text-sm mt-1">
                                            You need to configure both servers: <strong>Incoming</strong> (IMAP/POP3) to receive emails and <strong>Outgoing</strong> (SMTP) to send emails. Use the same email address and password for both.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Presets */}
                            {!isEditing && (
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-4">Quick Presets</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Button onClick={handleGmailPreset} variant="outline" className="p-4 h-auto">
                                            <div className="text-left">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Sparkles className="w-4 h-4 text-blue-500"/>
                                                    <span className="font-medium">Gmail Complete Setup</span>
                                                </div>
                                                <p className="text-xs text-slate-500">Auto-fill both Gmail IMAP and SMTP settings</p>
                                            </div>
                                        </Button>
                                        <Button onClick={handleOutlookPreset} variant="outline" className="p-4 h-auto">
                                            <div className="text-left">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Sparkles className="w-4 h-4 text-sky-500"/>
                                                    <span className="font-medium">Outlook Complete Setup</span>
                                                </div>
                                                <p className="text-xs text-slate-500">Auto-fill both Outlook IMAP and SMTP settings</p>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Manual Form */}
                            <form onSubmit={handleSmtpSubmit} className="space-y-6">
                                {/* User Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Account Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="display-name">Your Name</Label>
                                            <Input 
                                                id="display-name"
                                                value={smtpDetails.display_name} 
                                                onChange={(e) => setSmtpDetails({...smtpDetails, display_name: e.target.value})} 
                                                placeholder="e.g., John Smith"
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">This will appear in your sent emails</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input 
                                                id="email"
                                                type="email"
                                                value={smtpDetails.user} 
                                                onChange={(e) => setSmtpDetails({...smtpDetails, user: e.target.value})} 
                                                placeholder="your.email@domain.com"
                                                className="mt-1"
                                                required
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Use the same email for both incoming and outgoing</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Incoming Mail Settings */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Incoming Mail Server (For Receiving Emails)
                                    </h4>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                        <p className="text-green-800 text-sm">
                                            <strong>IMAP vs POP3:</strong> IMAP keeps emails on the server (recommended), POP3 downloads them to your device.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="incoming-server">Server Address</Label>
                                            <Input 
                                                id="incoming-server"
                                                value={smtpDetails.incoming_server} 
                                                onChange={(e) => setSmtpDetails({...smtpDetails, incoming_server: e.target.value})} 
                                                placeholder="e.g., imap.gmail.com"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="incoming-type">Protocol</Label>
                                            <Select 
                                                value={smtpDetails.incoming_type} 
                                                onValueChange={(value) => setSmtpDetails({
                                                    ...smtpDetails, 
                                                    incoming_type: value, 
                                                    incoming_port: value === 'IMAP' ? 993 : 995
                                                })}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="IMAP">IMAP (Recommended)</SelectItem>
                                                    <SelectItem value="POP3">POP3</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="incoming-port">Port</Label>
                                            <Input 
                                                id="incoming-port"
                                                type="number"
                                                value={smtpDetails.incoming_port} 
                                                onChange={(e) => setSmtpDetails({...smtpDetails, incoming_port: parseInt(e.target.value)})} 
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                Usually: IMAP=993, POP3=995
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            id="incoming-secure" 
                                            checked={smtpDetails.incoming_secure} 
                                            onChange={(e) => setSmtpDetails({...smtpDetails, incoming_secure: e.target.checked})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <Label htmlFor="incoming-secure" className="text-sm">Use SSL/TLS encryption (recommended)</Label>
                                    </div>
                                </div>

                                {/* Outgoing Mail Settings */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <Send className="w-4 h-4" />
                                        Outgoing Mail Server (SMTP - For Sending Emails)
                                    </h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                        <p className="text-blue-800 text-sm">
                                            <strong>SMTP:</strong> Simple Mail Transfer Protocol - this is what sends your emails out.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="smtp-host">SMTP Server Address</Label>
                                            <Input 
                                                id="smtp-host"
                                                value={smtpDetails.host} 
                                                onChange={(e) => setSmtpDetails({...smtpDetails, host: e.target.value})} 
                                                placeholder="e.g., smtp.gmail.com"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="smtp-port">SMTP Port</Label>
                                            <Select 
                                                value={smtpDetails.port.toString()} 
                                                onValueChange={(value) => {
                                                    const port = parseInt(value);
                                                    setSmtpDetails({
                                                        ...smtpDetails, 
                                                        port: port,
                                                        secure: port === 465
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="587">587 (STARTTLS - Recommended)</SelectItem>
                                                    <SelectItem value="465">465 (SSL/TLS)</SelectItem>
                                                    <SelectItem value="25">25 (Unencrypted - Not recommended)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Port 587 is most commonly used
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            id="smtp-secure" 
                                            checked={smtpDetails.secure} 
                                            onChange={(e) => setSmtpDetails({...smtpDetails, secure: e.target.checked})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <Label htmlFor="smtp-secure" className="text-sm">Use SSL/TLS encryption (recommended)</Label>
                                    </div>
                                </div>

                                {/* Authentication */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <Server className="w-4 h-4" />
                                        Authentication (Same for Both Servers)
                                    </h4>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                        <p className="text-amber-800 text-sm">
                                            <strong>Important:</strong> Use the same email address and password for both incoming and outgoing servers.
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Password / App Password</Label>
                                        <Input 
                                            id="password"
                                            type="password"
                                            value={smtpDetails.password} 
                                            onChange={(e) => setSmtpDetails({...smtpDetails, password: e.target.value})} 
                                            placeholder={isEditing ? "Enter new password to update" : "Enter your email password"}
                                            className="mt-1"
                                        />
                                        {smtpDetails.host === 'smtp.gmail.com' && (
                                            <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                                                <strong>Gmail Users:</strong> You must use a 16-character <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline font-semibold">App Password</a>, not your regular Gmail password. This same App Password works for both IMAP and SMTP.
                                            </div>
                                        )}
                                        {smtpDetails.host === 'smtp.office365.com' && (
                                            <div className="mt-2 text-sm text-sky-700 bg-sky-50 p-3 rounded-md border border-sky-200">
                                                <strong>Outlook Users:</strong> Use your regular Outlook password. If you have 2FA enabled, you may need to generate an App Password from your Microsoft account security settings.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t">
                                    {isEditing && (
                                        <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700">
                                        {isConnecting ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                        )}
                                        {isEditing ? 'Update Email Connection' : 'Connect Email Account'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 4: Help Guide */}
                <TabsContent value="help" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-slate-600" />
                                Email Setup Help Guide
                            </CardTitle>
                            <CardDescription>
                                Step-by-step instructions for connecting your email accounts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Complete Setup Explanation */}
                            <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-400">
                                <h4 className="font-semibold text-slate-800 mb-3">Understanding Email Server Setup</h4>
                                <div className="space-y-2 text-slate-700 text-sm">
                                    <p><strong>Why do I need both servers?</strong></p>
                                    <ul className="ml-4 space-y-1">
                                        <li>• <strong>Incoming Server (IMAP/POP3):</strong> Receives emails sent to you</li>
                                        <li>• <strong>Outgoing Server (SMTP):</strong> Sends emails from your account</li>
                                        <li>• <strong>Both use the same email and password</strong> - just different server addresses</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Gmail Setup */}
                            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <h4 className="font-semibold text-blue-800 mb-3">Gmail Complete Setup</h4>
                                <div className="space-y-3 text-blue-700 text-sm">
                                    <div>
                                        <p><strong>Incoming Mail (IMAP):</strong></p>
                                        <ul className="ml-4 space-y-1">
                                            <li>• Server: imap.gmail.com</li>
                                            <li>• Port: 993</li>
                                            <li>• Security: SSL/TLS</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p><strong>Outgoing Mail (SMTP):</strong></p>
                                        <ul className="ml-4 space-y-1">
                                            <li>• Server: smtp.gmail.com</li>
                                            <li>• Port: 587 (STARTTLS) or 465 (SSL/TLS)</li>
                                            <li>• Security: STARTTLS or SSL/TLS</li>
                                        </ul>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded">
                                        <p><strong>Gmail App Password Required:</strong></p>
                                        <ol className="ml-4 space-y-1 mt-2">
                                            <li>1. Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline font-semibold">myaccount.google.com/apppasswords</a></li>
                                            <li>2. Select "Mail" and generate a 16-character password</li>
                                            <li>3. Use this App Password (not your Gmail password) for both servers</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            {/* Outlook Setup */}
                            <div className="p-4 bg-sky-50 rounded-lg border-l-4 border-sky-400">
                                <h4 className="font-semibold text-sky-800 mb-3">Outlook/Office 365 Complete Setup</h4>
                                <div className="space-y-3 text-sky-700 text-sm">
                                    <div>
                                        <p><strong>Incoming Mail (IMAP):</strong></p>
                                        <ul className="ml-4 space-y-1">
                                            <li>• Server: outlook.office365.com</li>
                                            <li>• Port: 993</li>
                                            <li>• Security: SSL/TLS</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p><strong>Outgoing Mail (SMTP):</strong></p>
                                        <ul className="ml-4 space-y-1">
                                            <li>• Server: smtp.office365.com</li>
                                            <li>• Port: 587</li>
                                            <li>• Security: STARTTLS</li>
                                        </ul>
                                    </div>
                                    <div className="bg-sky-100 p-3 rounded">
                                        <p><strong>Authentication:</strong> Use your regular Outlook password for both servers. If you have 2FA enabled, you may need an App Password.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Troubleshooting */}
                            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                                <h4 className="font-semibold text-amber-800 mb-3">Common Issues & Solutions</h4>
                                <div className="space-y-2 text-amber-700 text-sm">
                                    <ul className="space-y-2">
                                        <li>• <strong>Authentication Failed:</strong> Double-check your password/App Password</li>
                                        <li>• <strong>Connection Refused:</strong> Verify server addresses and ports</li>
                                        <li>• <strong>Can send but not receive:</strong> Check your IMAP settings</li>
                                        <li>• <strong>Can receive but not send:</strong> Check your SMTP settings</li>
                                        <li>• <strong>Gmail not working:</strong> Make sure you're using an App Password, not your regular password</li>
                                        <li>• <strong>Still having issues:</strong> Try the Quick Connect method instead</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}