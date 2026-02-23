import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, Copy, RefreshCw, Target, Zap, Mic, CheckCircle, TrendingUp, Award, Users } from 'lucide-react';
import { toast } from 'sonner';
import { InvokeLLM } from '@/api/integrations';
import { Lead, Product, Competitor } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ElevatorPitchGenerator({ leadId, lead: initialLead, onPracticeRoleplay }) {
  const [lead, setLead] = useState(initialLead || null);
  const [isLoading, setIsLoading] = useState(!initialLead);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pitches, setPitches] = useState({
    short: '',
    medium: '',
    detailed: '',
    objectionHandler: '',
    valueProps: []
  });
  const [activeTab, setActiveTab] = useState('short');
  const navigate = useNavigate();

  useEffect(() => {
    if (leadId && !initialLead) {
      fetchLead();
    } else if (initialLead) {
      setLead(initialLead);
    }
  }, [leadId, initialLead]);

  const fetchLead = async () => {
    try {
      const leadData = await Lead.get(leadId);
      setLead(leadData);
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      toast.error('Failed to load lead details');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePitches = async () => {
    if (!lead) return;

    setIsGenerating(true);
    try {
      const products = await Product.list();
      const competitors = await Competitor.list();

      const prompt = `You are a sales expert. Generate customized elevator pitches for this lead:

Lead Information:
- Company: ${lead.company_name || 'Unknown'}
- Contact: ${lead.contact_name || 'Unknown'}
- Industry: ${lead.industry || 'Not specified'}
- Deal Value: ${lead.deal_value ? `$${lead.deal_value}` : 'Not specified'}
- Current Status: ${lead.status || 'new'}
- Pain Points: ${lead.pain_points || 'Not specified'}
- Company Description: ${lead.company_description || 'Not available'}

Our Products: ${products.map(p => p.name).join(', ') || 'Not available'}

Generate the following:
1. A 30-second elevator pitch (2-3 sentences)
2. A 60-second pitch (1 paragraph)
3. A detailed 2-minute pitch (2-3 paragraphs)
4. Common objection handlers (3-4 objections with responses)
5. Top 5 value propositions specific to this lead

Format your response as JSON with these keys:
{
  "short": "30-second pitch",
  "medium": "60-second pitch",
  "detailed": "2-minute pitch",
  "objectionHandler": "Objection 1: [objection]\\nResponse: [response]\\n\\n...",
  "valueProps": ["Value prop 1", "Value prop 2", ...]
}`;

      const response = await InvokeLLM(prompt);

      try {
        const parsed = JSON.parse(response);
        setPitches(parsed);
        toast.success('Pitches generated successfully!');
      } catch (parseError) {
        const shortMatch = response.match(/"short":\s*"([^"]*)"/);
        const mediumMatch = response.match(/"medium":\s*"([^"]*)"/);
        const detailedMatch = response.match(/"detailed":\s*"([^"]*)"/);

        setPitches({
          short: shortMatch ? shortMatch[1] : response.substring(0, 200),
          medium: mediumMatch ? mediumMatch[1] : response.substring(0, 400),
          detailed: detailedMatch ? detailedMatch[1] : response,
          objectionHandler: 'Generated content - see detailed pitch',
          valueProps: ['Efficiency', 'Cost Savings', 'Scalability', 'Expert Support', 'Quick ROI']
        });
        toast.success('Pitches generated!');
      }
    } catch (error) {
      console.error('Failed to generate pitches:', error);
      toast.error('Failed to generate pitches');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handlePracticeRoleplay = () => {
    if (onPracticeRoleplay) {
      onPracticeRoleplay();
    } else {
      navigate(createPageUrl(`AIRoleplayPractice?leadId=${leadId}&scenario=sales_pitch`));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!lead) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-600">Lead data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              AI Elevator Pitch Generator
            </CardTitle>
            <CardDescription className="text-amber-50 mt-2">
              Generate customized pitches for {lead.contact_name} at {lead.company_name}
            </CardDescription>
          </div>
          <Button
            onClick={generatePitches}
            disabled={isGenerating}
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-amber-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {pitches.short ? 'Regenerate' : 'Generate Pitches'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!pitches.short ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Ready to Create Your Perfect Pitch?
            </h3>
            <p className="text-slate-600 mb-6">
              Generate AI-powered elevator pitches tailored specifically for this lead
            </p>
            <Button
              onClick={generatePitches}
              disabled={isGenerating}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Pitches...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Pitches
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="short">30 Seconds</TabsTrigger>
                <TabsTrigger value="medium">60 Seconds</TabsTrigger>
                <TabsTrigger value="detailed">2 Minutes</TabsTrigger>
                <TabsTrigger value="objections">Objections</TabsTrigger>
              </TabsList>

              <TabsContent value="short" className="space-y-4">
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2 bg-blue-600">
                          <Zap className="w-3 h-3 mr-1" />
                          30-Second Pitch
                        </Badge>
                        <p className="text-xs text-slate-600">Perfect for quick introductions</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(pitches.short)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <ScrollArea className="h-32">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {pitches.short}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medium" className="space-y-4">
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2 bg-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          60-Second Pitch
                        </Badge>
                        <p className="text-xs text-slate-600">Ideal for initial meetings</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(pitches.medium)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <ScrollArea className="h-48">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {pitches.medium}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-4">
                <Card className="border-2 border-purple-200 bg-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2 bg-purple-600">
                          <Award className="w-3 h-3 mr-1" />
                          2-Minute Pitch
                        </Badge>
                        <p className="text-xs text-slate-600">Comprehensive presentation</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(pitches.detailed)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <ScrollArea className="h-64">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {pitches.detailed}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="objections" className="space-y-4">
                <Card className="border-2 border-amber-200 bg-amber-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2 bg-amber-600">
                          <Users className="w-3 h-3 mr-1" />
                          Objection Handlers
                        </Badge>
                        <p className="text-xs text-slate-600">Common objections and responses</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(pitches.objectionHandler)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <ScrollArea className="h-64">
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {pitches.objectionHandler}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {pitches.valueProps && pitches.valueProps.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Key Value Propositions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pitches.valueProps.slice(0, 6).map((value, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-700 font-bold text-sm">{index + 1}</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-600" />
                    Ready to Practice?
                  </h4>
                  <p className="text-sm text-slate-600">
                    Practice your pitch with our AI roleplay assistant and get real-time feedback
                  </p>
                </div>
                <Button
                  onClick={handlePracticeRoleplay}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Practice Roleplay
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
