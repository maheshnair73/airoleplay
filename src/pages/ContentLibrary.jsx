import React, { useState, useEffect, useMemo } from 'react';
import { Document } from '@/api/entities';
import { DocumentView } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Eye, Copy, Send, BarChart2, Loader2, Edit, Filter, Clock, FileText, Folder } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import EmailComposer from '@/components/email/EmailComposer';

const statusStyles = {
    draft: 'bg-slate-100 text-slate-800 border-slate-300',
    sent: 'bg-blue-100 text-blue-800 border-blue-300',
    viewed: 'bg-green-100 text-green-800 border-green-300',
    signed: 'bg-purple-100 text-purple-800 border-purple-300',
    archived: 'bg-gray-100 text-gray-500 border-gray-300',
    pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-teal-100 text-teal-800 border-teal-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    expired: 'bg-amber-100 text-amber-800 border-amber-300',
};

const DocumentCard = ({ doc, onSend, onShare, currentlyViewing }) => {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-200 group">
            <CardContent className="p-4 flex flex-col justify-between h-full">
                <div>
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <Link to={createPageUrl(`DocumentAnalytics?id=${doc.id}`)}>
                                <h3 className="font-bold text-lg text-slate-800 hover:text-blue-600">{doc.document_name}</h3>
                            </Link>
                            <p className="text-sm text-slate-500">{doc.company_name || 'Template'}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-8 h-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link to={createPageUrl(`CreateDocument?template=${doc.id}`)}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        <span>Use Template</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to={createPageUrl(`CreateDocument?id=${doc.id}`)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        <span>Edit</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(doc.created_date).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Template
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Link to={createPageUrl(`CreateDocument?template=${doc.id}`)} className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                                <Copy className="w-4 h-4 mr-2" />
                                Use Template
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function ContentLibrary() {
    const [docs, setDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [filters, setFilters] = useState({ status: 'all', tag: 'all' });
    const [sortBy, setSortBy] = useState('-created_date');
    const [showFilters, setShowFilters] = useState(false);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const data = await Document.list('-created_date');
            setDocs(data);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load documents.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const uniqueTags = useMemo(() => {
        const allTags = docs.flatMap(doc => doc.tags || []);
        return ['all', ...Array.from(new Set(allTags))];
    }, [docs]);

    const filteredAndSortedDocs = useMemo(() => {
        let result = docs;

        // Show shared/template documents
        result = result.filter(doc => doc.document_type === 'template' || doc.is_shared);

        // Apply existing filters (tag, search)
        result = result.filter(doc => {
            const tagMatch = filters.tag === 'all' || (doc.tags && doc.tags.includes(filters.tag));
            const searchMatch = searchTerm ?
                doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.company_name && doc.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;
            return tagMatch && searchMatch;
        });

        // Apply sorting
        result.sort((a, b) => {
            if (sortBy === '-created_date') {
                return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
            }
            if (sortBy === 'document_name') {
                return a.document_name.localeCompare(b.document_name);
            }
            return 0;
        });

        return result;
    }, [docs, filters, sortBy, searchTerm]);

    return (
        <div className="p-6 bg-slate-50/50 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Content Library</h1>
                    <p className="text-slate-600 mt-2">Reusable templates and company-wide assets.</p>
                </div>
                <Button onClick={() => navigate(createPageUrl('CreateDocument'))} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                </Button>
            </div>

            {/* Search and Filter Bar */}
            <Card className="p-4 my-6">
                <div className="flex items-center gap-4">
                    <div className="flex-grow">
                        <Input
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                        <Select value={filters.tag} onValueChange={(value) => setFilters(prev => ({...prev, tag: value}))}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by tag" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueTags.map(tag => (
                                    <SelectItem key={tag} value={tag} className="capitalize">
                                        {tag === 'all' ? 'All Tags' : tag}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="-created_date">Most Recent</SelectItem>
                                <SelectItem value="document_name">Alphabetical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </Card>

            {/* Document Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : filteredAndSortedDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {filteredAndSortedDocs.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            doc={doc}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">No Templates Available</h3>
                    <p className="text-slate-500 mt-2">Create reusable templates for your team.</p>
                    <Button className="mt-4" onClick={() => navigate(createPageUrl('CreateDocument'))}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Button>
                </div>
            )}
        </div>
    );
}