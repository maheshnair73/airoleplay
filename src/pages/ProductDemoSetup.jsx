import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MonitorUp, Sparkles, UserPlus, X, Briefcase, Settings, Package, Upload, BookOpen, Loader2, CheckCircle2, Link as LinkIcon, FileText, Plus, Check, Users } from 'lucide-react';
import {
  RoleplaySetupLayout,
  RoleplaySetupSection,
  RoleplaySetupField,
  RoleplaySetupGrid,
  RoleplaySetupActions,
  InfoBanner
} from '@/components/roleplay/RoleplaySetupLayout';

const MATERIAL_CATEGORIES = [
  'Product Knowledge', 'Sales Methodology', 'Objection Handling',
  'Discovery Questions', 'Closing Techniques', 'Industry Knowledge',
  'Compliance', 'Case Studies', 'General Training'
];

const ProductDemoSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentTab, setCurrentTab] = useState('attendees');

  const [selectedBot, setSelectedBot] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [buyerPersona, setBuyerPersona] = useState('business');
  const [demoType, setDemoType] = useState('full_demo');
  const [targetDuration, setTargetDuration] = useState(15);
  const [keyFeatures, setKeyFeatures] = useState('');

  const [knowledgeMaterials, setKnowledgeMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newMaterial, setNewMaterial] = useState({
    title: '', description: '', material_type: 'document',
    file_url: '', content_text: '', category: 'Product Knowledge'
  });
  const fileInputRef = useRef(null);

  const [attendees, setAttendees] = useState([
    { id: 1, name: '', role: '', persona: 'business', botId: '' }
  ]);
  const [productInquiry, setProductInquiry] = useState({
    companySize: '',
    industry: '',
    specificNeeds: '',
    budget: '',
    timeline: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('User error:', userError);
        toast.error('Authentication error');
        return;
      }

      if (!user) {
        console.error('No user found');
        navigate('/');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error('Failed to load profile');
        return;
      }

      const { data: botsData, error: botsError } = await supabase
        .from('ai_clients')
        .select('*')
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      if (botsError) {
        console.error('Bots error:', botsError);
      }

      setBots(botsData || []);
      setCurrentUser({ ...user, company_id: profile.company_id });

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('name', { ascending: true });

      if (productsError) {
        console.error('Products error:', productsError);
      }

      setProducts(productsData || []);

      const { data: materialsData } = await supabase
        .from('roleplay_knowledge_materials')
        .select('*')
        .eq('is_active', true)
        .order('created_date', { ascending: false });

      setKnowledgeMaterials(materialsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setDataLoading(false);
    }
  };

  const addAttendee = () => {
    setAttendees([...attendees, {
      id: Date.now(),
      name: '',
      role: '',
      persona: 'business',
      botId: ''
    }]);
  };

  const removeAttendee = (id) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter(a => a.id !== id));
    }
  };

  const updateAttendee = (id, field, value) => {
    setAttendees(attendees.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const toggleMaterial = (id) => setSelectedMaterials(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error('File size exceeds 50MB limit'); return; }
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `knowledge-materials/${currentUser?.company_id || 'public'}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error(uploadError.message || 'Upload failed');
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
      const titleGuess = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewMaterial(prev => ({
        ...prev, file_url: publicUrl, title: prev.title || titleGuess,
        material_type: ['mp4', 'mov', 'avi'].includes(fileExt) ? 'video' : ['mp3', 'wav', 'm4a'].includes(fileExt) ? 'audio' : 'document'
      }));
      toast.success('File uploaded — add a title and save');
    } catch (error) { toast.error(error.message || 'Failed to upload file'); }
    finally { setIsUploading(false); }
  };

  const handleSaveMaterial = async () => {
    if (!newMaterial.title.trim()) { toast.error('Please enter a title'); return; }
    if (newMaterial.material_type === 'text' && !newMaterial.content_text.trim()) { toast.error('Please enter the text content'); return; }
    if (newMaterial.material_type !== 'text' && !newMaterial.file_url.trim()) { toast.error('Please upload a file or enter a URL'); return; }
    try {
      const { data, error } = await supabase.from('roleplay_knowledge_materials').insert({
        ...newMaterial, uploaded_by: currentUser?.email || '', company_id: currentUser?.company_id, is_active: true
      }).select().single();
      if (error) throw error;
      setKnowledgeMaterials(prev => [data, ...prev]);
      setSelectedMaterials(prev => [...prev, data.id]);
      setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'Product Knowledge' });
      setUploadTab('file');
      setShowUploadModal(false);
      toast.success('Material added and selected');
    } catch (error) { toast.error('Failed to save material'); }
  };

  const handleStartDemo = async () => {
    const validAttendees = attendees.filter(a => a.name && a.botId);

    if (validAttendees.length === 0) {
      toast.error('Please add at least one attendee with a name and AI bot');
      return;
    }

    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: roleplaySession, error: sessionError } = await supabase
        .from('roleplay_sessions')
        .insert({
          user_id: user.id,
          bot_id: validAttendees[0].botId,
          scenario_description: `Product demo session - ${demoType}`,
          roleplay_type: 'product_demo',
          status: 'pending'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const featuresArray = keyFeatures
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const { error: demoError } = await supabase
        .from('product_demo_sessions')
        .insert({
          roleplay_session_id: roleplaySession.id,
          product_id: selectedProduct || null,
          screen_share_enabled: false,
          demo_type: demoType,
          target_duration_minutes: targetDuration,
          key_features_to_cover: featuresArray,
          buyer_persona: buyerPersona,
          company_size: productInquiry.companySize || null,
          budget_range: productInquiry.budget || null,
          buying_timeline: productInquiry.timeline || null,
          industry_context: productInquiry.industry || null,
          product_inquiry: productInquiry
        });

      if (demoError) throw demoError;

      toast.success('Demo session created!');
      navigate(`/ProductDemoRoleplay/${roleplaySession.id}`);

    } catch (error) {
      console.error('Error creating demo session:', error);
      toast.error('Failed to create demo session');
    } finally {
      setLoading(false);
    }
  };

  const canProceedFromAttendees = () => {
    return attendees.filter(a => a.name && a.botId).length > 0;
  };

  const canProceedFromProduct = () => {
    return !!selectedProduct;
  };

  const goToNextTab = () => {
    const tabs = ['attendees', 'product', 'materials', 'settings'];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const goToPreviousTab = () => {
    const tabs = ['attendees', 'product', 'materials', 'settings'];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading demo setup...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'attendees', label: 'Attendees', icon: Users, complete: canProceedFromAttendees() },
    { id: 'product', label: 'Product', icon: Package, complete: canProceedFromProduct(), accessible: canProceedFromAttendees() },
    { id: 'materials', label: 'Materials', icon: BookOpen, accessible: canProceedFromAttendees() },
    { id: 'settings', label: 'Settings', icon: Settings, accessible: canProceedFromProduct() }
  ];

  return (
    <RoleplaySetupLayout
      title="Product Demo Practice"
      description="Practice your product demos with AI clients and get real-time feedback"
      icon={MonitorUp}
      backPath="/ai-roleplay"
      backLabel="Back to AI Roleplay"
      currentTab={currentTab}
      tabs={tabs}
      onTabChange={setCurrentTab}
      loading={loading}
    >

        {bots.length === 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MonitorUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Product Demo Practice</CardTitle>
                  <CardDescription>
                    Practice your product demos with AI clients and get real-time feedback
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Clients Available</h3>
                <p className="text-gray-600 mb-4">
                  You need to create AI Clients before starting product demo practice.
                </p>
                <Button onClick={() => navigate('/create-ai-client')}>
                  Create Your First AI Client
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <MonitorUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Product Demo Practice</CardTitle>
                <CardDescription>
                  Practice your product demos with AI clients and get real-time feedback
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {[
                    { value: 'attendees', label: 'Attendees', icon: UserPlus, step: 1 },
                    { value: 'product', label: 'Product', icon: Package, step: 2 },
                    { value: 'materials', label: 'Materials', icon: BookOpen, step: 3 },
                    { value: 'settings', label: 'Settings', icon: Settings, step: 4 }
                  ].map((tab, index) => {
                    const isActive = currentTab === tab.value;
                    const isComplete =
                      (tab.value === 'attendees' && canProceedFromAttendees()) ||
                      (tab.value === 'product' && canProceedFromProduct()) ||
                      (tab.value === 'materials') ||
                      (tab.value === 'settings' && index < 3);

                    return (
                      <div key={tab.value} className="flex-1">
                        <div className="flex items-center">
                          <button
                            onClick={() => setCurrentTab(tab.value)}
                            className={`flex flex-col items-center gap-2 flex-1 transition-all ${
                              isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                                  : isComplete
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {isComplete && !isActive ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                tab.step
                              )}
                            </div>
                            <span className={`text-xs font-medium text-center ${
                              isActive ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {tab.label}
                            </span>
                          </button>
                          {index < 3 && (
                            <div className={`h-1 flex-1 mx-2 rounded transition-all ${
                              isComplete ? 'bg-green-600' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <TabsContent value="attendees" className="space-y-4">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Demo Attendees</h3>
                      <p className="text-sm text-gray-600 mt-1">Add the people who will participate in this demo</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      Add at least one attendee with an assigned AI client to proceed. You can add multiple attendees to simulate different buyer personas.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mb-4">
                  <Button onClick={addAttendee} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Attendee
                  </Button>
                </div>

                <div className="space-y-3">
                {attendees.map((attendee, index) => {
                  const isValid = attendee.name && attendee.botId;
                  return (
                  <Card key={attendee.id} className={`p-5 border-2 transition-all ${
                    isValid ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Attendee {index + 1}</p>
                            {isValid && (
                              <p className="text-xs text-green-700 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Complete
                              </p>
                            )}
                          </div>
                        </div>
                        {attendees.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeAttendee(attendee.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Name</Label>
                          <Input
                            placeholder="e.g., John Smith"
                            value={attendee.name}
                            onChange={(e) => updateAttendee(attendee.id, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Role/Title</Label>
                          <Input
                            placeholder="e.g., VP of Sales"
                            value={attendee.role}
                            onChange={(e) => updateAttendee(attendee.id, 'role', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Persona Type</Label>
                          <Select
                            value={attendee.persona}
                            onValueChange={(value) => updateAttendee(attendee.id, 'persona', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical Buyer</SelectItem>
                              <SelectItem value="business">Business Buyer</SelectItem>
                              <SelectItem value="executive">Executive</SelectItem>
                              <SelectItem value="procurement">Procurement</SelectItem>
                              <SelectItem value="end_user">End User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>AI Client</Label>
                          <Select
                            value={attendee.botId}
                            onValueChange={(value) => updateAttendee(attendee.id, 'botId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select AI Client" />
                            </SelectTrigger>
                            <SelectContent>
                              {bots.map((bot) => (
                                <SelectItem key={bot.id} value={bot.id}>
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {bot.first_name} {bot.last_name} - {bot.title}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                  );
                })}
                </div>
              </TabsContent>

              <TabsContent value="product" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Product & Buyer Context</h3>
                  <p className="text-sm text-gray-600 mt-1">Configure which product you'll demo and set the buyer's context</p>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      Fill in the product and at least one buyer detail to proceed. This helps the AI understand the sales context.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <Label htmlFor="product" className="text-base font-semibold">Product</Label>
                  <p className="text-xs text-gray-600 mb-3">Select which product you'll be demonstrating</p>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger id="product" className="bg-white">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                  <h4 className="font-semibold text-gray-900">Buyer Context</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companySize" className="text-sm">Company Size</Label>
                      <Select
                        value={productInquiry.companySize}
                        onValueChange={(value) => setProductInquiry({ ...productInquiry, companySize: value })}
                      >
                        <SelectTrigger id="companySize">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="industry" className="text-sm">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., SaaS, Healthcare"
                        value={productInquiry.industry}
                        onChange={(e) => setProductInquiry({ ...productInquiry, industry: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget" className="text-sm">Budget Range</Label>
                      <Input
                        id="budget"
                        placeholder="e.g., $10k-$50k"
                        value={productInquiry.budget}
                        onChange={(e) => setProductInquiry({ ...productInquiry, budget: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="timeline" className="text-sm">Timeline</Label>
                      <Select
                        value={productInquiry.timeline}
                        onValueChange={(value) => setProductInquiry({ ...productInquiry, timeline: value })}
                      >
                        <SelectTrigger id="timeline">
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate (1 month)</SelectItem>
                          <SelectItem value="short">Short term (1-3 months)</SelectItem>
                          <SelectItem value="medium">Medium (3-6 months)</SelectItem>
                          <SelectItem value="long">Long term (6+ months)</SelectItem>
                          <SelectItem value="exploring">Just exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specificNeeds" className="text-sm">Specific Needs</Label>
                    <Textarea
                      id="specificNeeds"
                      placeholder="What problems are they solving? What features interest them?"
                      value={productInquiry.specificNeeds}
                      onChange={(e) => setProductInquiry({ ...productInquiry, specificNeeds: e.target.value })}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Training Materials</h3>
                  <p className="text-sm text-gray-600 mt-1">Help the AI understand your product by uploading documentation and resources</p>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      Materials are optional but highly recommended. They help the AI provide more accurate product information during the demo. Upload product specs, pitch decks, FAQs, or case studies.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="gap-2"
                    onClick={() => {
                      setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'Product Knowledge' });
                      setUploadTab('file');
                      setShowUploadModal(true);
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Material
                  </Button>
                </div>

                {knowledgeMaterials.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">{knowledgeMaterials.length} material{knowledgeMaterials.length !== 1 ? 's' : ''} available</p>
                      {selectedMaterials.length > 0 && (
                        <span className="text-sm font-semibold text-green-700 flex items-center gap-1">
                          <Check className="w-4 h-4" /> {selectedMaterials.length} selected
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {knowledgeMaterials.map(material => (
                        <div
                          key={material.id}
                          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedMaterials.includes(material.id)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => toggleMaterial(material.id)}
                        >
                          <Checkbox
                            checked={selectedMaterials.includes(material.id)}
                            onCheckedChange={() => toggleMaterial(material.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{material.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{material.material_type} • {material.category}</div>
                            {material.description && (
                              <div className="text-sm text-gray-700 mt-2">{material.description}</div>
                            )}
                          </div>
                          {selectedMaterials.includes(material.id) && (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'Product Knowledge' });
                      setUploadTab('file');
                      setShowUploadModal(true);
                    }}
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">No materials uploaded</p>
                    <p className="text-sm text-gray-600 mt-2">Upload product specs, pitch decks, case studies, or FAQs</p>
                    <Button type="button" className="mt-4 gap-2">
                      <Upload className="w-4 h-4" />
                      Upload First Material
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Demo Settings</h3>
                  <p className="text-sm text-gray-600 mt-1">Configure the demo experience and what to focus on</p>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      All fields are optional. They help tailor the demo to your specific selling scenario and get more targeted feedback.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <Label htmlFor="demoType" className="text-base font-semibold">Demo Type</Label>
                      <p className="text-xs text-gray-600 mb-3">Choose the focus of your demo</p>
                      <Select value={demoType} onValueChange={setDemoType}>
                        <SelectTrigger id="demoType" className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_demo">Full Product Demo</SelectItem>
                          <SelectItem value="feature_focus">Feature Focus</SelectItem>
                          <SelectItem value="objection_handling">Objection Handling</SelectItem>
                          <SelectItem value="technical_deep_dive">Technical Deep Dive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <Label htmlFor="duration" className="text-base font-semibold">Duration</Label>
                      <p className="text-xs text-gray-600 mb-3">Target demo length in minutes</p>
                      <Input
                        id="duration"
                        type="number"
                        value={targetDuration}
                        onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                        min={5}
                        max={60}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <Label htmlFor="features" className="text-base font-semibold">Key Features</Label>
                    <p className="text-xs text-gray-600 mb-3">Features you want to highlight (comma-separated)</p>
                    <Textarea
                      id="features"
                      value={keyFeatures}
                      onChange={(e) => setKeyFeatures(e.target.value)}
                      placeholder="e.g., Dashboard, Reporting, Salesforce Integration"
                      rows={3}
                      className="resize-none bg-white"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      What you'll experience
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Multiple AI attendees simulating real buyer personas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Live AI validation of your product knowledge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Real-time coaching and objection handling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Detailed post-session analysis and feedback</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 pt-6 border-t flex gap-4 justify-between">
              <Button
                onClick={goToPreviousTab}
                variant="outline"
                disabled={currentTab === 'attendees'}
                size="lg"
                className="min-w-32"
              >
                Previous
              </Button>

              {currentTab === 'settings' ? (
                <Button
                  onClick={handleStartDemo}
                  disabled={loading || !canProceedFromAttendees() || !canProceedFromProduct()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Creating Session...
                    </>
                  ) : (
                    <>
                      <MonitorUp className="w-5 h-5 mr-2" />
                      Start Product Demo
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={goToNextTab}
                  disabled={
                    (currentTab === 'attendees' && !canProceedFromAttendees()) ||
                    (currentTab === 'product' && !canProceedFromProduct())
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  Continue
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        )}

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Training Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs value={uploadTab} onValueChange={setUploadTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="file"><Upload className="w-4 h-4 mr-1.5" />File</TabsTrigger>
                <TabsTrigger value="url"><LinkIcon className="w-4 h-4 mr-1.5" />URL</TabsTrigger>
                <TabsTrigger value="text"><FileText className="w-4 h-4 mr-1.5" />Text</TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="mt-3">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /><p className="text-sm text-muted-foreground">Uploading...</p></div>
                  ) : newMaterial.file_url && uploadTab === 'file' ? (
                    <div className="flex flex-col items-center gap-2"><CheckCircle2 className="w-8 h-8 text-green-600" /><p className="text-sm font-medium text-green-700">Uploaded — click to replace</p></div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium text-gray-700">Drop file here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT, MP4, MP3, WAV — up to 50MB</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.mp4,.mp3,.wav,.m4a,.mov" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
              </TabsContent>
              <TabsContent value="url" className="mt-3">
                <div className="space-y-2">
                  <Label>Document or Video URL</Label>
                  <Input placeholder="https://..." value={newMaterial.file_url} onChange={(e) => setNewMaterial(prev => ({ ...prev, file_url: e.target.value }))} />
                </div>
              </TabsContent>
              <TabsContent value="text" className="mt-3">
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea placeholder="Paste product info, FAQs, pitch notes, scripts..." rows={5} value={newMaterial.content_text} onChange={(e) => setNewMaterial(prev => ({ ...prev, content_text: e.target.value, material_type: 'text' }))} />
                </div>
              </TabsContent>
            </Tabs>
            <div className="space-y-3 pt-2 border-t">
              <div>
                <Label>Title *</Label>
                <Input placeholder="e.g., Product Overview Q2" value={newMaterial.title} onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={newMaterial.category} onValueChange={(v) => setNewMaterial(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MATERIAL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newMaterial.material_type} onValueChange={(v) => setNewMaterial(prev => ({ ...prev, material_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button type="button" onClick={handleSaveMaterial} disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Save & Add to Demo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </RoleplaySetupLayout>
  );
};

export default ProductDemoSetup;
