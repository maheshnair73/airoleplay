import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react';

const ProductKnowledgeReview = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [validationLogs, setValidationLogs] = useState([]);
  const [usps, setUsps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [decision, setDecision] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (activeTab === 'pending') {
        const { data, error } = await supabase
          .from('knowledge_correction_requests')
          .select(`
            *,
            user_profiles!knowledge_correction_requests_user_id_fkey(full_name, email)
          `)
          .eq('company_id', profile.company_id)
          .eq('admin_decision', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCorrectionRequests(data || []);
      } else if (activeTab === 'flagged') {
        const { data, error } = await supabase
          .from('demo_validation_logs')
          .select(`
            *,
            roleplay_sessions!inner(
              user_profiles!inner(full_name, email)
            ),
            product_usps(usp_title, usp_description)
          `)
          .eq('company_id', profile.company_id)
          .eq('needs_admin_review', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setValidationLogs(data || []);
      } else if (activeTab === 'manage') {
        let query = supabase
          .from('product_usps')
          .select('*, user_profiles!product_usps_created_by_fkey(full_name)')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false });

        if (filterCategory !== 'all') {
          query = query.eq('category', filterCategory);
        }

        const { data, error } = await query;
        if (error) throw error;
        setUsps(data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setDecision('');
    setReviewDialogOpen(true);
  };

  const handleReview = async () => {
    if (!decision) {
      toast.error('Please select a decision');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      let createdUspId = null;

      if (decision === 'approved') {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        const { data: uspData, error: uspError } = await supabase
          .from('product_usps')
          .insert({
            company_id: profile.company_id,
            usp_title: selectedRequest.suggested_usp_title,
            usp_description: selectedRequest.suggested_usp_description,
            category: selectedRequest.category,
            is_approved: true,
            source: 'user_contributed',
            created_by: selectedRequest.user_id,
            approved_by: user.id
          })
          .select()
          .single();

        if (uspError) throw uspError;
        createdUspId = uspData.id;
      }

      const { error } = await supabase
        .from('knowledge_correction_requests')
        .update({
          admin_decision: decision,
          admin_notes: adminNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          created_usp_id: createdUspId
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success(`Request ${decision}`);
      setReviewDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error reviewing request:', error);
      toast.error('Failed to process review');
    }
  };

  const toggleUSPApproval = async (usp) => {
    try {
      const { error } = await supabase
        .from('product_usps')
        .update({ is_approved: !usp.is_approved })
        .eq('id', usp.id);

      if (error) throw error;
      toast.success(usp.is_approved ? 'USP disabled' : 'USP enabled');
      loadData();
    } catch (error) {
      console.error('Error toggling USP:', error);
      toast.error('Failed to update USP');
    }
  };

  const deleteUSP = async (uspId) => {
    if (!confirm('Are you sure you want to delete this USP?')) return;

    try {
      const { error } = await supabase
        .from('product_usps')
        .delete()
        .eq('id', uspId);

      if (error) throw error;
      toast.success('USP deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting USP:', error);
      toast.error('Failed to delete USP');
    }
  };

  const filteredUSPs = usps.filter(usp => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        usp.usp_title.toLowerCase().includes(query) ||
        usp.usp_description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product Knowledge Management</h1>
        <p className="text-gray-600 mt-2">
          Review and manage product USPs and user contributions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending Reviews
            {correctionRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {correctionRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="flagged" className="gap-2">
            Flagged Validations
            {validationLogs.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {validationLogs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="manage">Manage USPs</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : correctionRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p>No pending correction requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {correctionRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{request.category}</Badge>
                          <span className="text-sm text-gray-600">
                            by {request.user_profiles?.full_name || 'Unknown'}
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">
                          {request.suggested_usp_title}
                        </h3>
                        <p className="text-gray-700 mb-3">
                          {request.suggested_usp_description}
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Original statement:</p>
                          <p className="text-sm italic">{request.spoken_text}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => openReviewDialog(request)}
                        className="ml-4"
                      >
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="flagged" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : validationLogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p>No flagged validations</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {validationLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={log.validation_type === 'incorrect' ? 'destructive' : 'secondary'}>
                            {log.validation_type}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Confidence: {Math.round(log.confidence_score * 100)}%
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-2">{log.spoken_text}</p>
                        {log.product_usps && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              Matched USP:
                            </p>
                            <p className="text-sm text-blue-800">
                              {log.product_usps.usp_title}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <div className="mb-4 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search USPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="benefit">Benefit</SelectItem>
                <SelectItem value="use_case">Use Case</SelectItem>
                <SelectItem value="differentiator">Differentiator</SelectItem>
                <SelectItem value="pricing">Pricing</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUSPs.map((usp) => (
                <Card key={usp.id} className={!usp.is_approved ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={usp.is_approved ? 'default' : 'secondary'}>
                            {usp.category}
                          </Badge>
                          <Badge variant="outline">{usp.source}</Badge>
                          {usp.user_profiles && (
                            <span className="text-sm text-gray-600">
                              by {usp.user_profiles.full_name}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{usp.usp_title}</h3>
                        <p className="text-sm text-gray-700">{usp.usp_description}</p>
                        {usp.keywords && usp.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {usp.keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant={usp.is_approved ? 'outline' : 'default'}
                          onClick={() => toggleUSPApproval(usp)}
                        >
                          {usp.is_approved ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUSP(usp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Correction Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Suggested USP Title</Label>
                <p className="text-sm font-medium mt-1">{selectedRequest.suggested_usp_title}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-700 mt-1">{selectedRequest.suggested_usp_description}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p className="text-sm text-gray-700 mt-1">{selectedRequest.category}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Label>Original Statement</Label>
                <p className="text-sm italic mt-1">{selectedRequest.spoken_text}</p>
              </div>
              <div>
                <Label htmlFor="decision">Decision</Label>
                <Select value={decision} onValueChange={setDecision}>
                  <SelectTrigger id="decision">
                    <SelectValue placeholder="Select a decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                    <SelectItem value="modified">Needs Modification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductKnowledgeReview;
