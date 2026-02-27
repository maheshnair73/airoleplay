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
import { MonitorUp, Sparkles, ArrowLeft } from 'lucide-react';

const ProductDemoSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bots, setBots] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedBot, setSelectedBot] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [buyerPersona, setBuyerPersona] = useState('business');
  const [demoType, setDemoType] = useState('full_demo');
  const [targetDuration, setTargetDuration] = useState(15);
  const [keyFeatures, setKeyFeatures] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      const { data: botsData } = await supabase
        .from('roleplay_bots')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .order('name', { ascending: true });

      setBots(botsData || []);

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('name', { ascending: true });

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleStartDemo = async () => {
    if (!selectedBot) {
      toast.error('Please select an AI bot');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: roleplaySession, error: sessionError } = await supabase
        .from('roleplay_sessions')
        .insert({
          user_id: user.id,
          bot_id: selectedBot,
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
          buyer_persona: buyerPersona
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
            <div>
              <Label htmlFor="bot">AI Client Bot</Label>
              <Select value={selectedBot} onValueChange={setSelectedBot}>
                <SelectTrigger id="bot">
                  <SelectValue placeholder="Select an AI bot" />
                </SelectTrigger>
                <SelectContent>
                  {bots.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {bot.name} - {bot.role}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="product">Product (Optional)</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product or leave blank for general demo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific product</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="persona">Buyer Persona</Label>
              <Select value={buyerPersona} onValueChange={setBuyerPersona}>
                <SelectTrigger id="persona">
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
                <li>• Live AI validation of your product knowledge</li>
                <li>• Real-time coaching assistance during the demo</li>
                <li>• Screen sharing capability to show your product</li>
                <li>• Post-session analysis with detailed feedback</li>
                <li>• Coverage tracking for all key product features</li>
              </ul>
            </div>

            <Button
              onClick={handleStartDemo}
              disabled={loading || !selectedBot}
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
      </div>
    </div>
  );
};

export default ProductDemoSetup;
