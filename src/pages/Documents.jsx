
import React, { useState, useEffect } from 'react';
import { Document } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { ShareDocumentModal } from '@/components/documents/ShareDocumentModal';
import {
    Plus, FileText, Eye, Download, Share, MoreVertical,
    Search, Filter, RefreshCw, Calendar, User as UserIcon,
    Building, Mail, Tag, Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const DocumentCard = ({ document, onShare, onEdit }) => {
    const [thumbError, setThumbError] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800 border border-gray-300',
            sent: 'bg-blue-100 text-blue-800 border border-blue-300',
            viewed: 'bg-green-100 text-green-800 border border-green-300',
            signed: 'bg-purple-100 text-purple-800 border border-purple-300',
            expired: 'bg-red-100 text-red-800 border border-red-300',
            archived: 'bg-slate-100 text-slate-800 border border-slate-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-300';
    };

    const getDocumentIcon = (docType) => {
        const icons = {
            proposal: '📝',
            contract: '📋',
            rfp_response: '📊',
            presentation: 'プレゼンテーション', // Using Japanese characters to force a distinct visual
            case_study: '📚',
            brochure: '📄',
            template: '📁',
            agreement: '🤝',
            report: '📈',
            invoice: '🧾'
        };
        return icons[docType?.toLowerCase()] || '📄';
    };

    const Thumbnail = () => {
        if (thumbError || !document.thumbnail_url) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <span className="text-5xl opacity-50">{getDocumentIcon(document.document_type)}</span>
                </div>
            );
        }
        return (
            <img
                src={document.thumbnail_url}
                alt={document.document_name || 'Document thumbnail'}
                className="w-full h-full object-cover"
                onError={() => setThumbError(true)}
            />
        );
    };

    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 group overflow-hidden">
            {/* Thumbnail Section */}
            <div className="h-40 bg-slate-100 border-b">
                <Thumbnail />
            </div>

            <CardHeader className="pb-3 pt-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                            <Link to={createPageUrl(`DocumentAnalytics?id=${document.id}`)} className="hover:underline">
                                {document.document_name || 'Untitled Document'}
                            </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-500 truncate">
                                {document.company_name || 'No company'}
                            </span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 flex-shrink-0">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link to={createPageUrl(`DocumentAnalytics?id=${document.id}`)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Analytics
                                </Link>
                            </DropdownMenuItem>
                            {/* THIS IS THE FIX: Using onClick directly */}
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={onEdit}>
                                <FileText className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShare(document)}>
                                <Share className="w-4 h-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                            {document.file_url && (
                                <DropdownMenuItem asChild>
                                    <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download PDF
                                    </a>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end pt-0 pb-4">
                {/* Status Badge */}
                <div className="flex justify-between items-center mt-3">
                    <Badge className={`${getStatusColor(document.status)} font-medium capitalize text-xs`}>
                        {document.status?.replace('_', ' ') || 'draft'}
                    </Badge>
                    
                    <div className="flex items-center text-xs text-slate-500 gap-3">
                         <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{document.analytics?.total_views || 0}</span>
                        </div>
                        {document.created_date && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{format(new Date(document.created_date), 'MMM d')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function Documents() {
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('my_documents');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const navigate = useNavigate();

    // Load documents and user data
    useEffect(() => {
        loadData();
    }, []);

    // Auto-refresh every 30 seconds to catch newly created documents
    useEffect(() => {
        const interval = setInterval(() => {
            loadData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Filter documents when search, status, or tab changes
    useEffect(() => {
        filterDocuments();
    }, [documents, searchTerm, statusFilter, activeTab, currentUser]); // Added currentUser to dependencies for tab filtering

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [user, allDocuments] = await Promise.all([
                User.me(),
                Document.list('-created_date') // Get all documents, newest first
            ]);

            console.log('Loaded documents:', allDocuments); // Debug logging
            setCurrentUser(user);
            setDocuments(allDocuments);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    const filterDocuments = () => {
        let filtered = [...documents];

        // Filter by tab (my documents vs shared)
        if (activeTab === 'my_documents') {
            filtered = filtered.filter(doc => doc.created_by === currentUser?.email);
        } else if (activeTab === 'shared_with_me') {
            filtered = filtered.filter(doc => doc.created_by !== currentUser?.email);
        }

        // Filter by status
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(doc => doc.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(doc =>
                (doc.document_name || '').toLowerCase().includes(searchLower) ||
                (doc.company_name || '').toLowerCase().includes(searchLower) ||
                (doc.recipient_name || '').toLowerCase().includes(searchLower) ||
                (doc.tags || []).some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        setFilteredDocuments(filtered);
    };

    // This getStatusIcon is still used for the stats cards below, but not in DocumentCard anymore.
    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent': return '📤';
            case 'viewed': return '👁️';
            case 'signed': return '✅';
            case 'expired': return '❌';
            case 'archived': return '📁';
            default: return '📄';
        }
    };

    const handleRefresh = () => {
        toast.info('Refreshing documents...');
        loadData();
    };

    const handleShare = (document) => {
        setSelectedDocument(document);
        setShareModalOpen(true);
    };

    const handleEdit = (documentId) => {
        navigate(createPageUrl(`CreateDocument?id=${documentId}`));
    };

    // Calculate stats
    const myDocuments = documents.filter(doc => doc.created_by === currentUser?.email);
    const totalDocuments = myDocuments.length;
    const sentDocuments = myDocuments.filter(doc => doc.status === 'sent').length;
    const viewedDocuments = myDocuments.filter(doc => doc.status === 'viewed').length;
    const signedDocuments = myDocuments.filter(doc => doc.status === 'signed').length;

    if (isLoading) {
        return (
            <div className="p-6 bg-slate-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-3 text-slate-600">Loading documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Documents</h1>
                        <p className="text-slate-600 mt-1">
                            Create, manage, and track all your sales collateral.
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Last refreshed: {format(lastRefresh, 'h:mm a')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Link to={createPageUrl('CreateDocument')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Document
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Documents</p>
                                <p className="text-2xl font-bold text-slate-900">{totalDocuments}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
                                <Share className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">Sent</p>
                                <p className="text-2xl font-bold text-slate-900">{sentDocuments}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                                <Eye className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">Viewed</p>
                                <p className="text-2xl font-bold text-slate-900">{viewedDocuments}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mr-4">
                                <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">Signed</p>
                                <p className="text-2xl font-bold text-slate-900">{signedDocuments}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="my_documents">My Documents</TabsTrigger>
                            <TabsTrigger value="shared_with_me">Shared with Me</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search documents by name or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-80"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="viewed">Viewed</SelectItem>
                                <SelectItem value="signed">Signed</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Documents Grid */}
                {filteredDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDocuments.map((document) => (
                            <DocumentCard
                                key={document.id}
                                document={document}
                                onShare={handleShare}
                                onEdit={() => handleEdit(document.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            {searchTerm || statusFilter !== 'all' ? 'No documents found' : 'No documents yet'}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first document to get started'
                            }
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                            <Button asChild>
                                <Link to={createPageUrl('CreateDocument')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Document
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Share Modal */}
            <ShareDocumentModal
                open={shareModalOpen}
                onOpenChange={setShareModalOpen}
                document={selectedDocument}
            />
        </div>
    );
}
