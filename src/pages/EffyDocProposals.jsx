
import React, { useState, useEffect } from 'react';
import { Document } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    FileText, Plus, Eye, Clock, CheckCircle, 
    Send, Loader2, Search, Filter, ArrowLeft,
    Download, Share2, BarChart3, TrendingUp,
    Users, DollarSign, Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function EffyDocProposals() {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        draft: 0,
        sent: 0,
        viewed: 0,
        signed: 0,
        totalViews: 0,
        avgViewTime: 0
    });

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const allDocs = await Document.list('-updated_date');
            // Filter for proposals only
            const proposals = allDocs.filter(doc => doc.document_type === 'proposal');
            setDocuments(proposals);
            
            // Calculate statistics
            const statistics = {
                total: proposals.length,
                draft: proposals.filter(d => d.status === 'draft').length,
                sent: proposals.filter(d => d.status === 'sent').length,
                viewed: proposals.filter(d => d.status === 'viewed').length,
                signed: proposals.filter(d => d.status === 'signed').length,
                totalViews: proposals.reduce((sum, d) => sum + (d.analytics?.total_views || 0), 0),
                avgViewTime: Math.round(
                    proposals.reduce((sum, d) => sum + (d.analytics?.total_time_spent || 0), 0) / proposals.length / 60
                ) || 0
            };
            setStats(statistics);
        } catch (error) {
            console.error('Error loading proposals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = !searchQuery || 
            doc.document_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            viewed: 'bg-purple-100 text-purple-800',
            signed: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            draft: <FileText className="w-4 h-4" />,
            sent: <Send className="w-4 h-4" />,
            viewed: <Eye className="w-4 h-4" />,
            signed: <CheckCircle className="w-4 h-4" />,
            expired: <Clock className="w-4 h-4" />
        };
        return icons[status] || <FileText className="w-4 h-4" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-500">Loading proposals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                            <FileText className="w-10 h-10 text-blue-600" />
                            effyDoc Proposals
                        </h1>
                        <p className="text-slate-600 mt-2">Create, track, and manage your sales proposals</p>
                    </div>
                    <Link to={createPageUrl('CreateDocument')}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Proposal
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Proposals</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                        <p className="text-xs text-slate-500 mt-1">All time</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Sent & Active</CardTitle>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Send className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.sent + stats.viewed}</div>
                        <p className="text-xs text-slate-500 mt-1">Out for review</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Views</CardTitle>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Eye className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalViews}</div>
                        <p className="text-xs text-slate-500 mt-1">Across all proposals</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Signed</CardTitle>
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.signed}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            {stats.total > 0 ? `${Math.round((stats.signed / stats.total) * 100)}% close rate` : 'No data'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Proposal Status Overview</CardTitle>
                        <CardDescription>Current distribution of your proposals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">Draft</p>
                                        <p className="text-sm text-slate-500">In progress</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900">{stats.draft}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Send className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">Sent</p>
                                        <p className="text-sm text-slate-500">Awaiting review</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900">{stats.sent}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">Viewed</p>
                                        <p className="text-sm text-slate-500">Being reviewed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900">{stats.viewed}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">Signed</p>
                                        <p className="text-sm text-slate-500">Deal closed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900">{stats.signed}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link to={createPageUrl('CreateDocument')}>
                            <Button className="w-full justify-start" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Create New Proposal
                            </Button>
                        </Link>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            Browse Templates
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View All Analytics
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Team Performance
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Proposals Section */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Recent Proposals</CardTitle>
                            <CardDescription>Your latest document activity</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Search proposals by name or company..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="viewed">Viewed</SelectItem>
                                <SelectItem value="signed">Signed</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Proposals List */}
                    {filteredDocuments.length > 0 ? (
                        <div className="space-y-4">
                            {filteredDocuments.slice(0, 10).map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-slate-800 truncate max-w-full">{doc.document_name}</h4>
                                            <Badge className={getStatusColor(doc.status)}>
                                                {getStatusIcon(doc.status)}
                                                <span className="ml-1 capitalize">{doc.status}</span>
                                            </Badge>
                                        </div>
                                        {doc.company_name && (
                                            <p className="text-sm text-slate-600 mb-1 truncate max-w-full">{doc.company_name}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            {doc.analytics && (
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {doc.analytics.total_views || 0} views
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(doc.updated_date), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Link to={createPageUrl(`DocumentAnalytics?id=${doc.id}`)}>
                                            <Button variant="outline" size="sm">
                                                <BarChart3 className="w-4 h-4 mr-1" />
                                                Analytics
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            
                            {filteredDocuments.length > 10 && (
                                <div className="text-center pt-4">
                                    <Button variant="outline">
                                        View All {filteredDocuments.length} Proposals
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">No proposals found</h3>
                            <p className="text-slate-500 mb-6">
                                {searchQuery || statusFilter !== 'all' 
                                    ? 'Try adjusting your filters' 
                                    : 'Create your first proposal to get started'}
                            </p>
                            <Link to={createPageUrl('CreateDocument')}>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Proposal
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
