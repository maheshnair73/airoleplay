import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MonitorUp, Sparkles, ArrowLeft, UserPlus, X, Briefcase, Settings, Package, Upload, BookOpen, Loader2, CheckCircle2, Link as LinkIcon, FileText, Plus } from 'lucide-react';

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
          attendees: validAttendees.map(a => ({
            name: a.name,
            role: a.role,
            persona: a.persona,
            bot_id: a.botId
          })),
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/ai-roleplay')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to AI Roleplay
        </Button>

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
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="attendees" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Attendees
                </TabsTrigger>
                <TabsTrigger value="product" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Product Details
                </TabsTrigger>
                <TabsTrigger value="materials" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Materials
                  {selectedMaterials.length > 0 && (
                    <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                      {selectedMaterials.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Demo Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attendees" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Demo Attendees</h3>
                    <p className="text-sm text-gray-600">Add the people who will be in this demo</p>
                  </div>
                  <Button onClick={addAttendee} variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Attendee
                  </Button>
                </div>

                <div className="space-y-4">
                {attendees.map((attendee, index) => (
                  <Card key={attendee.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Attendee {index + 1}</Label>
                        {attendees.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
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
                ))}
                </div>
              </TabsContent>

              <TabsContent value="product" className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Product & Inquiry Details</h3>
                  <p className="text-sm text-gray-600">Configure the product and buyer context</p>
                </div>

                <div className="space-y-4">
                <div>
                  <Label htmlFor="product">Product Inquiring About</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger id="product">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
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
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., SaaS, Healthcare, Finance"
                      value={productInquiry.industry}
                      onChange={(e) => setProductInquiry({ ...productInquiry, industry: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget Range</Label>
                    <Input
                      id="budget"
                      placeholder="e.g., $10k-$50k annually"
                      value={productInquiry.budget}
                      onChange={(e) => setProductInquiry({ ...productInquiry, budget: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeline">Implementation Timeline</Label>
                    <Select
                      value={productInquiry.timeline}
                      onValueChange={(value) => setProductInquiry({ ...productInquiry, timeline: value })}
                    >
                      <SelectTrigger id="timeline">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (within 1 month)</SelectItem>
                        <SelectItem value="short">Short term (1-3 months)</SelectItem>
                        <SelectItem value="medium">Medium term (3-6 months)</SelectItem>
                        <SelectItem value="long">Long term (6+ months)</SelectItem>
                        <SelectItem value="exploring">Just exploring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="specificNeeds">Specific Needs or Pain Points</Label>
                  <Textarea
                    id="specificNeeds"
                    placeholder="What problems are they trying to solve? What features are they most interested in?"
                    value={productInquiry.specificNeeds}
                    onChange={(e) => setProductInquiry({ ...productInquiry, specificNeeds: e.target.value })}
                    rows={3}
                  />
                </div>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Training Materials</h3>
                    <p className="text-sm text-gray-600">Upload docs or content so the AI knows your product inside out</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'Product Knowledge' });
                      setUploadTab('file');
                      setShowUploadModal(true);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Material
                  </Button>
                </div>

                {knowledgeMaterials.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {knowledgeMaterials.map(material => (
                      <div
                        key={material.id}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedMaterials.includes(material.id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => toggleMaterial(material.id)}
                      >
                        <Checkbox checked={selectedMaterials.includes(material.id)} onCheckedChange={() => toggleMaterial(material.id)} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{material.title}</div>
                          <div className="text-sm text-muted-foreground">{material.material_type} • {material.category}</div>
                          {material.description && <div className="text-xs text-muted-foreground mt-1 truncate">{material.description}</div>}
                        </div>
                        {selectedMaterials.includes(material.id) && <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    onClick={() => { setNewMaterial({ title: '', description: '', material_type: 'document', file_url: '', content_text: '', category: 'Product Knowledge' }); setUploadTab('file'); setShowUploadModal(true); }}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-700">No materials yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Upload a product spec, pitch deck, FAQ, or any content the AI should know before the demo</p>
                    <Button type="button" variant="outline" size="sm" className="mt-4"><Upload className="w-4 h-4 mr-2" />Upload First Material</Button>
                  </div>
                )}

                {selectedMaterials.length > 0 && (
                  <p className="text-sm text-blue-700 font-medium">{selectedMaterials.length} material{selectedMaterials.length !== 1 ? 's' : ''} selected — AI will use these during the demo</p>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Demo Settings</h3>
                  <p className="text-sm text-gray-600">Configure demo type, duration, and features</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="demoType">Demo Type</Label>
              <Select value={demoType} onValueChange={setDemoType}>
                <SelectTrigger id="demoType">
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

                  <div>
                    <Label htmlFor="duration">Target Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={targetDuration}
                onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                min={5}
                max={60}
                    />
                  </div>

                  <div>
                    <Label htmlFor="features">Key Features to Cover (comma-separated)</Label>
              <Textarea
                id="features"
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
                placeholder="e.g., Dashboard, Reporting, Integration with Salesforce"
                rows={3}
              />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: List specific features you want to practice demonstrating
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">What to expect:</h3>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Multiple AI attendees based on your configuration</li>
                      <li>• Live AI validation of your product knowledge</li>
                      <li>• Real-time coaching assistance during the demo</li>
                      <li>• Screen sharing capability to show your product</li>
                      <li>• Post-session analysis with detailed feedback</li>
                      <li>• Coverage tracking for all key product features</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t flex gap-3 justify-between">
              <Button
                onClick={goToPreviousTab}
                variant="outline"
                disabled={currentTab === 'attendees'}
              >
                Previous
              </Button>

              {currentTab === 'settings' ? (
                <Button
                  onClick={handleStartDemo}
                  disabled={loading || !canProceedFromAttendees() || !canProceedFromProduct()}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
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
                  className="flex-1"
                  size="lg"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        )}
      </div>

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
    </div>
  );
};

export default ProductDemoSetup;
