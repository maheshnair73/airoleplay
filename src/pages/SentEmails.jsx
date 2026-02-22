import React, { useState, useEffect } from 'react';
import { EmailComposition } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    Mail, Send, Edit, Clock, Eye, MousePointer, 
    ArrowLeft, Filter, Search, Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EmailComposer from '@/components/email/EmailComposer';

const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800'
};

const typeColors = {
    cold_outreach: 'bg-purple-100 text-purple-800',
    follow_up: 'bg-blue-100 text-blue-800',
    proposal: 'bg-green-100 text-green-800',
    meeting_request: 'bg-orange-100 text-orange-800',
    thank_you: 'bg-pink-100 text-pink-800',
    nurture: 'bg-indigo-100 text-indigo-800',
    objection_response: 'bg-red-100 text-red-800',
    custom: 'bg-gray-100 text-gray-800'
};

export default function SentEmails() {
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showComposer, setShowComposer] = useState(false);

    useEffect(() => {
        loadEmails();
    }, []);

    const loadEmails = async () => {
        setIsLoading(true);
        try {
            const emailList = await EmailComposition.list('-created_date');
            setEmails(emailList);
        } catch (error) {
            console.error('Error loading emails:', error);
        }
        setIsLoading(false);
    };

    const filteredEmails = emails.filter(email => {
        const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             email.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
        const matchesType = typeFilter === 'all' || email.email_type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to={createPageUrl('EmailHub')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Email Hub
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Sent Emails</h1>
                        <p className="text-slate-600 mt-1">Track all your sent email communications</p>
                    </div>
                </div>
                <Button 
                    onClick={() => setShowComposer(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Compose Email
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search emails..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                                <SelectItem value="follow_up">Follow Up</SelectItem>
                                <SelectItem value="proposal">Proposal</SelectItem>
                                <SelectItem value="meeting_request">Meeting Request</SelectItem>
                                <SelectItem value="thank_you">Thank You</SelectItem>
                                <SelectItem value="nurture">Nurture</SelectItem>
                                <SelectItem value="objection_response">Objection Response</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="text-sm text-slate-500 flex items-center">
                            Showing {filteredEmails.length} of {emails.length} emails
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Email List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Email History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent Date</TableHead>
                                    <TableHead>Engagement</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmails.length > 0 ? (
                                    filteredEmails.map((email) => (
                                        <TableRow key={email.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <div className="font-medium">{email.subject}</div>
                                                {email.ai_generated && (
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        AI Generated
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{email.recipient_name || email.recipient_email}</div>
                                                <div className="text-sm text-slate-500">{email.recipient_email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={typeColors[email.email_type] || 'bg-gray-100 text-gray-800'}>
                                                    {email.email_type.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[email.status] || 'bg-gray-100 text-gray-800'}>
                                                    {email.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {email.sent_at ? format(new Date(email.sent_at), 'MMM d, yyyy h:mm a') : 'Not sent'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {email.opened_at && (
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <Eye className="w-4 h-4" />
                                                            <span className="text-xs">Opened</span>
                                                        </div>
                                                    )}
                                                    {email.clicked_at && (
                                                        <div className="flex items-center gap-1 text-blue-600">
                                                            <MousePointer className="w-4 h-4" />
                                                            <span className="text-xs">Clicked</span>
                                                        </div>
                                                    )}
                                                    {email.reply_received && (
                                                        <div className="flex items-center gap-1 text-purple-600">
                                                            <Mail className="w-4 h-4" />
                                                            <span className="text-xs">Replied</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="6" className="text-center py-8">
                                            <div className="flex flex-col items-center gap-4">
                                                <Send className="w-12 h-12 text-slate-300" />
                                                <div>
                                                    <p className="text-slate-500">No emails found</p>
                                                    <p className="text-sm text-slate-400">Start sending emails to see them here</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Email Composer */}
            <EmailComposer
                open={showComposer}
                onOpenChange={setShowComposer}
            />
        </div>
    );
}