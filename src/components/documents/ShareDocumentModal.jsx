import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Mail, Copy, Link as LinkIcon, Calendar as CalendarIcon, 
    Shield, Eye, Clock, Share2, Check, AlertTriangle, Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export function ShareDocumentModal({ open, onOpenChange, document }) {
    const [activeTab, setActiveTab] = useState('email');
    const [emailData, setEmailData] = useState({
        recipients: '',
        subject: `${document?.document_name || 'Document'} - Shared with you`,
        message: `Hi,\n\nI'm sharing "${document?.document_name || 'this document'}" with you. Please find the secure link below.\n\nBest regards`
    });
    
    const [securitySettings, setSecuritySettings] = useState({
        cannotForward: false,
        linkExpiry: 'never',
        expiryDate: null,
        expiryDays: 7,
        viewOnce: false,
        requireEmail: false,
        password: ''
    });

    const [isSharing, setIsSharing] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    React.useEffect(() => {
        if (document && open) {
            const baseUrl = window.location.origin;
            const docUrl = `${baseUrl}${createPageUrl(`DocumentPublicView?id=${document.public_id || document.id}`)}`;
            setShareUrl(docUrl);
        }
    }, [document, open]);

    const handleSecurityChange = (key, value) => {
        setSecuritySettings(prev => ({ ...prev, [key]: value }));
    };

    const generateSecureLink = async () => {
        try {
            let expiresAt = null;
            
            if (securitySettings.linkExpiry === 'days' && securitySettings.expiryDays > 0) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + securitySettings.expiryDays);
                expiresAt = expiry.toISOString();
            } else if (securitySettings.linkExpiry === 'date' && securitySettings.expiryDate) {
                expiresAt = securitySettings.expiryDate.toISOString();
            }

            await base44.entities.Document.update(document.id, {
                expires_at: expiresAt,
                require_email: securitySettings.requireEmail,
                password: securitySettings.password || null,
                allow_download: !securitySettings.cannotForward,
                security_settings: {
                    cannot_forward: securitySettings.cannotForward,
                    view_once: securitySettings.viewOnce,
                    link_expiry: securitySettings.linkExpiry
                }
            });

            return shareUrl;
        } catch (error) {
            console.error('Error updating document security:', error);
            throw error;
        }
    };

    const handleCopyLink = async () => {
        try {
            const secureUrl = await generateSecureLink();
            await navigator.clipboard.writeText(secureUrl);
            toast.success('Secure link copied to clipboard!', {
                description: 'The link includes your security settings.',
            });
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const handleSendEmail = async () => {
        if (!emailData.recipients.trim()) {
            toast.error('Please enter at least one recipient email');
            return;
        }

        setIsSharing(true);
        try {
            const secureUrl = await generateSecureLink();
            const recipients = emailData.recipients.split(',').map(email => email.trim());

            for (const recipient of recipients) {
                if (recipient) {
                    const emailBody = `${emailData.message}\n\nSecure Document Link: ${secureUrl}\n\n`;
                    
                    await base44.integrations.Core.SendEmail({
                        to: recipient,
                        subject: emailData.subject,
                        body: emailBody
                    });
                }
            }

            toast.success(`Document shared with ${recipients.length} recipient(s)!`);
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to send email');
        } finally {
            setIsSharing(false);
        }
    };

    const getSecuritySummary = () => {
        const features = [];
        if (securitySettings.cannotForward) features.push('No forwarding');
        if (securitySettings.linkExpiry !== 'never') features.push('Link expires');
        if (securitySettings.viewOnce) features.push('View once');
        if (securitySettings.requireEmail) features.push('Email required');
        if (securitySettings.password) features.push('Password protected');
        return features;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Share Document: {document?.document_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Share Method Tabs */}
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'email' 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Mail className="w-4 h-4" />
                            Share via Email
                        </button>
                        <button
                            onClick={() => setActiveTab('link')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'link' 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <LinkIcon className="w-4 h-4" />
                            Copy Link
                        </button>
                    </div>

                    {/* Email Tab */}
                    {activeTab === 'email' && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
                                <Input
                                    id="recipients"
                                    placeholder="john@company.com, jane@company.com"
                                    value={emailData.recipients}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    rows={4}
                                    value={emailData.message}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                                />
                            </div>
                        </div>
                    )}

                    {/* Link Tab */}
                    {activeTab === 'link' && (
                        <div className="space-y-4">
                            <div>
                                <Label>Document Link</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        value={shareUrl}
                                        readOnly
                                        className="bg-slate-50"
                                    />
                                    <Button onClick={handleCopyLink} variant="outline">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="w-5 h-5" />
                                Link Security Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Cannot Forward */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">Cannot Forward</Label>
                                    <p className="text-xs text-slate-500">Prevent recipients from downloading or forwarding</p>
                                </div>
                                <Switch
                                    checked={securitySettings.cannotForward}
                                    onCheckedChange={(checked) => handleSecurityChange('cannotForward', checked)}
                                />
                            </div>

                            {/* Link Expiry */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Link Expiry</Label>
                                <Select
                                    value={securitySettings.linkExpiry}
                                    onValueChange={(value) => handleSecurityChange('linkExpiry', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="never">Never expires</SelectItem>
                                        <SelectItem value="days">Expires in X days</SelectItem>
                                        <SelectItem value="date">Expires on specific date</SelectItem>
                                    </SelectContent>
                                </Select>

                                {securitySettings.linkExpiry === 'days' && (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={securitySettings.expiryDays}
                                            onChange={(e) => handleSecurityChange('expiryDays', parseInt(e.target.value))}
                                            className="w-20"
                                        />
                                        <span className="text-sm text-slate-500">days from now</span>
                                    </div>
                                )}

                                {securitySettings.linkExpiry === 'date' && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {securitySettings.expiryDate ? format(securitySettings.expiryDate, 'PPP') : 'Pick a date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={securitySettings.expiryDate}
                                                onSelect={(date) => handleSecurityChange('expiryDate', date)}
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>

                            {/* View Once */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">View Once</Label>
                                    <p className="text-xs text-slate-500">Link becomes invalid after first view</p>
                                </div>
                                <Switch
                                    checked={securitySettings.viewOnce}
                                    onCheckedChange={(checked) => handleSecurityChange('viewOnce', checked)}
                                />
                            </div>

                            {/* Require Email */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">Require Email</Label>
                                    <p className="text-xs text-slate-500">Viewers must enter their email to access</p>
                                </div>
                                <Switch
                                    checked={securitySettings.requireEmail}
                                    onCheckedChange={(checked) => handleSecurityChange('requireEmail', checked)}
                                />
                            </div>

                            {/* Password Protection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Password Protection (Optional)</Label>
                                <Input
                                    type="password"
                                    placeholder="Enter password"
                                    value={securitySettings.password}
                                    onChange={(e) => handleSecurityChange('password', e.target.value)}
                                />
                            </div>

                            {/* Security Summary */}
                            {getSecuritySummary().length > 0 && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">Security Features Active</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {getSecuritySummary().map((feature, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {feature}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        {activeTab === 'email' ? (
                            <Button onClick={handleSendEmail} disabled={isSharing}>
                                {isSharing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Email
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button onClick={handleCopyLink}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Secure Link
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}