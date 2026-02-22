import React, { useState, useEffect } from 'react';
import { SalesKnowledgeBase } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    BookOpen, 
    Plus, 
    Search, 
    Edit3, 
    Check, 
    X, 
    Brain,
    MessageSquare,
    HelpCircle,
    Target,
    Users,
    TrendingUp,
    Star,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';

const KnowledgeCard = ({ item, onEdit, onApprove, onReject, isManager }) => {
    const categoryIcons = {
        objections: <X className="w-4 h-4" />,
        questions: <HelpCircle className="w-4 h-4" />,
        responses: <MessageSquare className="w-4 h-4" />,
        scripts: <BookOpen className="w-4 h-4" />,
        best_practices: <Star className="w-4 h-4" />,
        competitive_intel: <Target className="w-4 h-4" />
    };

    const categoryColors = {
        objections: 'bg-red-100 text-red-800',
        questions: 'bg-blue-100 text-blue-800',
        responses: 'bg-green-100 text-green-800',
        scripts: 'bg-purple-100 text-purple-800',
        best_practices: 'bg-yellow-100 text-yellow-800',
        competitive_intel: 'bg-orange-100 text-orange-800'
    };

    const sourceColors = {
        ai_generated: 'bg-violet-100 text-violet-800',
        manager_created: 'bg-emerald-100 text-emerald-800',
        rep_suggested: 'bg-cyan-100 text-cyan-800',
        call_analysis: 'bg-indigo-100 text-indigo-800'
    };

    return (
        <Card className="hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            {categoryIcons[item.category]}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
                            <div className="flex gap-2 mt-2">
                                <Badge className={categoryColors[item.category]}>
                                    {item.category.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className={sourceColors[item.source]}>
                                    {item.source?.replace('_', ' ')}
                                </Badge>
                                {!item.is_approved && isManager && (
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                        Pending Approval
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                            <Edit3 className="w-4 h-4" />
                        </Button>
                        {isManager && !item.is_approved && (
                            <>
                                <Button variant="ghost" size="icon" onClick={() => onApprove(item)} className="text-green-600">
                                    <Check className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onReject(item)} className="text-red-600">
                                    <X className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-600 line-clamp-3 mb-3">{item.content}</p>
                {item.recommended_response && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">Recommended Response:</p>
                        <p className="text-sm text-blue-800 line-clamp-2">{item.recommended_response}</p>
                    </div>
                )}
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                    <span>Used {item.usage_count || 0} times</span>
                    {item.effectiveness_score && (
                        <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {item.effectiveness_score}% effective
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const KnowledgeForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item || {
        category: 'objections',
        title: '',
        content: '',
        recommended_response: '',
        alternative_responses: [],
        subcategory: '',
        tags: [],
        context: {
            call_type: [],
            prospect_profile: '',
            deal_stage: []
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="objections">Objections</SelectItem>
                        <SelectItem value="questions">Questions</SelectItem>
                        <SelectItem value="responses">Responses</SelectItem>
                        <SelectItem value="scripts">Scripts</SelectItem>
                        <SelectItem value="best_practices">Best Practices</SelectItem>
                        <SelectItem value="competitive_intel">Competitive Intel</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    placeholder="Subcategory (optional)"
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({...prev, subcategory: e.target.value}))}
                />
            </div>
            
            <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                required
            />
            
            <Textarea
                placeholder="Content (the actual objection, question, or information)"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                rows={3}
                required
            />
            
            <Textarea
                placeholder="Recommended response or handling approach"
                value={formData.recommended_response}
                onChange={(e) => setFormData(prev => ({...prev, recommended_response: e.target.value}))}
                rows={3}
            />
            
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Knowledge Item</Button>
            </div>
        </form>
    );
};

export default function SalesKnowledge() {
    const [knowledgeItems, setKnowledgeItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [approvalFilter, setApprovalFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterItems();
    }, [knowledgeItems, searchTerm, categoryFilter, approvalFilter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [itemsData, userData] = await Promise.all([
                SalesKnowledgeBase.list('-created_date').catch(() => []),
                User.me().catch(() => null)
            ]);
            setKnowledgeItems(itemsData);
            setCurrentUser(userData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load knowledge base');
        }
        setIsLoading(false);
    };

    const filterItems = () => {
        let filtered = knowledgeItems;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.recommended_response?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }

        if (approvalFilter !== 'all') {
            filtered = filtered.filter(item => 
                approvalFilter === 'approved' ? item.is_approved : !item.is_approved
            );
        }

        setFilteredItems(filtered);
    };

    const handleSave = async (formData) => {
        try {
            if (editingItem) {
                await SalesKnowledgeBase.update(editingItem.id, {
                    ...formData,
                    last_updated_by: currentUser?.email,
                    is_approved: false // Reset approval when edited
                });
                toast.success('Knowledge item updated');
            } else {
                await SalesKnowledgeBase.create({
                    ...formData,
                    source: 'manager_created',
                    last_updated_by: currentUser?.email,
                    is_approved: currentUser?.role === 'admin'
                });
                toast.success('Knowledge item created');
            }
            
            setIsFormOpen(false);
            setEditingItem(null);
            loadData();
        } catch (error) {
            toast.error('Failed to save knowledge item');
        }
    };

    const handleApprove = async (item) => {
        try {
            await SalesKnowledgeBase.update(item.id, { is_approved: true });
            toast.success('Knowledge item approved');
            loadData();
        } catch (error) {
            toast.error('Failed to approve item');
        }
    };

    const handleReject = async (item) => {
        if (confirm('Are you sure you want to reject this knowledge item?')) {
            try {
                await SalesKnowledgeBase.delete(item.id);
                toast.success('Knowledge item rejected and removed');
                loadData();
            } catch (error) {
                toast.error('Failed to reject item');
            }
        }
    };

    const isManager = currentUser?.role === 'admin';
    const pendingApproval = knowledgeItems.filter(item => !item.is_approved).length;

    const stats = {
        total: knowledgeItems.length,
        approved: knowledgeItems.filter(item => item.is_approved).length,
        pending: pendingApproval,
        byCategory: knowledgeItems.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {})
    };

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Sales Knowledge Base</h1>
                    <p className="text-slate-600 mt-2">Centralized repository of sales questions, objections, and best responses</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Knowledge Item
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100">Total Items</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">Approved</p>
                                <p className="text-3xl font-bold">{stats.approved}</p>
                            </div>
                            <Check className="w-8 h-8 text-green-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100">Pending</p>
                                <p className="text-3xl font-bold">{stats.pending}</p>
                            </div>
                            <HelpCircle className="w-8 h-8 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100">AI Generated</p>
                                <p className="text-3xl font-bold">{knowledgeItems.filter(i => i.source === 'ai_generated').length}</p>
                            </div>
                            <Brain className="w-8 h-8 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Knowledge Items</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Search knowledge base..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="objections">Objections</SelectItem>
                                <SelectItem value="questions">Questions</SelectItem>
                                <SelectItem value="responses">Responses</SelectItem>
                                <SelectItem value="scripts">Scripts</SelectItem>
                                <SelectItem value="best_practices">Best Practices</SelectItem>
                                <SelectItem value="competitive_intel">Competitive Intel</SelectItem>
                            </SelectContent>
                        </Select>
                        {isManager && (
                            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-slate-500 mt-4">Loading knowledge base...</p>
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map((item) => (
                                <KnowledgeCard
                                    key={item.id}
                                    item={item}
                                    onEdit={(item) => {
                                        setEditingItem(item);
                                        setIsFormOpen(true);
                                    }}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    isManager={isManager}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Knowledge Items Found</h3>
                            <p className="text-slate-500 mb-6">Start building your sales knowledge base by adding common objections, questions, and responses.</p>
                            <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-5 h-5 mr-2" />
                                Add First Item
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Knowledge Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Knowledge Item' : 'Add New Knowledge Item'}
                        </DialogTitle>
                    </DialogHeader>
                    <KnowledgeForm
                        item={editingItem}
                        onSave={handleSave}
                        onCancel={() => {
                            setIsFormOpen(false);
                            setEditingItem(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}