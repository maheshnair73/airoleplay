import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MonitorUp, Sparkles, ArrowLeft, UserPlus, X, Briefcase } from 'lucide-react';

const ProductDemoSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [bots, setBots] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedBot, setSelectedBot] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [buyerPersona, setBuyerPersona] = useState('business');
  const [demoType, setDemoType] = useState('full_demo');
  const [targetDuration, setTargetDuration] = useState(15);
  const [keyFeatures, setKeyFeatures] = useState('');

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
        .from('roleplay_bots')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (botsError) {
        console.error('Bots error:', botsError);
      }

      setBots(botsData || []);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('name', { ascending: true });

      if (productsError) {
        console.error('Products error:', productsError);
      }

      setProducts(productsData || []);
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Bots Available</h3>
                <p className="text-gray-600 mb-4">
                  You need to create roleplay bots before starting product demo practice.
                </p>
                <Button onClick={() => navigate('/CreateRoleplayBot')}>
                  Create Your First Bot
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
          <CardContent className="space-y-6">
            <div className="border-b pb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Demo Attendees
                  </h3>
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
                          <Label>AI Bot</Label>
                          <Select
                            value={attendee.botId}
                            onValueChange={(value) => updateAttendee(attendee.id, 'botId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select bot" />
                            </SelectTrigger>
                            <SelectContent>
                              {bots.map((bot) => (
                                <SelectItem key={bot.id} value={bot.id}>
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {bot.name}
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
            </div>

            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5" />
                Product & Inquiry Details
              </h3>

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
            </div>

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

            <Button
              onClick={handleStartDemo}
              disabled={loading || attendees.filter(a => a.name && a.botId).length === 0 || !selectedProduct}
              className="w-full"
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
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
};

export default ProductDemoSetup;
