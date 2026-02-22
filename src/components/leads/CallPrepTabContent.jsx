
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Mic, HelpCircle, Shield, Sparkles, Loader2, Users, Share2, BrainCircuit, Target, Brain } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { Product } from '@/api/entities';
import { SharedPitch } from '@/api/entities';
import { SharedQuestion } from '@/api/entities';
import { SharedObjection } from '@/api/entities';
import { User } from '@/api/entities';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import RoleplayOverlay from '@/components/coaching/RoleplayOverlay';

const dummySharedPitches = [
  {
    id: 'sp_dummy_1',
    pitch_name: 'Standard B2B Tech Pitch',
    pitch_content: "I noticed your company is a leader in its industry, and companies like yours often face challenges with scaling operations efficiently. Our solution helps streamline that by automating key processes, which has helped similar clients boost their productivity by up to 30%.",
    success_rate: 78,
    target_audience: 'Mid-Market CTOs',
    usage_count: 152,
    created_by: 'manager@example.com'
  },
  {
    id: 'sp_dummy_2',
    pitch_name: 'Quick Follow-up Pitch',
    pitch_content: "Just wanted to quickly follow up on our last conversation. I was thinking more about your goals regarding improving team collaboration, and I'm confident our platform can help you achieve that. Do you have 15 minutes to dive deeper next week?",
    success_rate: 65,
    target_audience: 'Warm Leads',
    usage_count: 88,
    created_by: 'sales.lead@example.com'
  }
];

const dummySharedQuestions = [{
    id: 'sq_dummy_1',
    name: 'Initial SaaS Discovery Call',
    questions: [
        { question: "Can you walk me through how you're currently handling [Process X]?", purpose: "Establish baseline and identify initial pain points." },
        { question: "What would the ideal solution for [Problem Y] look like for your team?", purpose: "Understand their vision and success criteria." },
        { question: "Who, besides yourself, is typically involved in evaluating new tools like this?", purpose: "Identify key decision-makers early." },
    ],
    success_rate: 82,
    target_audience: 'SMB Owners',
    usage_count: 210,
    created_by: 'manager@example.com'
}];

const dummySharedObjections = [{
    id: 'so_dummy_1',
    name: 'Early Stage Objection Handling',
    objections: [
        { objection: "We're not looking to make any changes right now.", response: "I understand, timing is everything. So I don't waste your time in the future, could you share what your top priorities are for this quarter? It'll help me know if and when it makes sense to reach out again." },
        { objection: "Just send me an email.", response: "I'd be happy to, but to make sure it's relevant, could you tell me what specific information would be most helpful for you? It'll take just 30 seconds and I can tailor it to your needs." },
    ],
    success_rate: 71,
    target_audience: 'Cold Outreach',
    usage_count: 350,
    created_by: 'sales.lead@example.com'
}];

export default function CallPrepTabContent({ lead }) {
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [discoveryQuestions, setDiscoveryQuestions] = useState([]);
  const [objectionHandling, setObjectionHandling] = useState([]);
  const [products, setProducts] = useState([]);
  const [sharedPitches, setSharedPitches] = useState([]);
  const [sharedQuestions, setSharedQuestions] = useState([]);
  const [sharedObjections, setSharedObjections] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRoleplayOverlay, setShowRoleplayOverlay] = useState(false);

  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingObjections, setIsGeneratingObjections] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        const [activeProducts, user, sPitches, sQuestions, sObjections] = await Promise.all([
            Product.filter({ is_active: true }),
            User.me(),
            SharedPitch.filter({ is_active: true }),
            SharedQuestion.filter({ is_active: true }),
            SharedObjection.filter({ is_active: true })
        ]);
        
        setProducts(activeProducts);
        setCurrentUser(user);
        
        const filterForUser = (items) => user ? items.filter(item => 
            !item.shared_with?.length || item.shared_with.includes(user.email)
        ) : [];

        const availablePitches = filterForUser(sPitches);
        const availableQuestions = filterForUser(sQuestions);
        const availableObjections = filterForUser(sObjections);
      
        setSharedPitches(availablePitches.length > 0 ? availablePitches : dummySharedPitches);
        setSharedQuestions(availableQuestions.length > 0 ? availableQuestions : dummySharedQuestions);
        setSharedObjections(availableObjections.length > 0 ? availableObjections : dummySharedObjections);

    } catch (error) {
      console.error('Error loading data, using dummy data:', error);
      setSharedPitches(dummySharedPitches);
      setSharedQuestions(dummySharedQuestions);
      setSharedObjections(dummySharedObjections);
    }
  };

  const generateContent = async (type) => {
    let prompt, schema, setter, loadingSetter;

    const baseContext = `
      Analyze the following prospect and generate insights for a sales call.
      - Name: ${lead.contact_name}
      - Title: ${lead.contact_title}
      - Company: ${lead.company_name}
      - Industry: ${lead.industry || 'Not specified'}
      - Personality Traits: ${lead.personality_traits?.join(', ') || 'Not identified'}
      - Pain Points: ${lead.pain_points?.join(', ') || 'Not identified'}
      - Budget Range: ${lead.budget_range || 'Not specified'}
      - Timeline: ${lead.timeline || 'Not specified'}
    `;

    const productInfo = products.length > 0 ? products.map(p => `
      Product: ${p.name}
      Description: ${p.description}
      Key Features: ${p.features?.join(', ') || 'N/A'}
      Target Audience: ${p.target_audience || 'N/A'}
      Use Cases: ${p.use_cases?.join(', ') || 'N/A'}
    `).join('\n\n') : 'No product information available';

    switch (type) {
      case 'pitch':
        if (products.length === 0) {
          toast.error('No products configured. Contact your administrator to set up company products.');
          return;
        }
        
        loadingSetter = setIsGeneratingPitch;
        setter = setGeneratedPitch;
        
        prompt = `${baseContext}

        Our company's products/services:
        ${productInfo}

        Generate a concise 30-second elevator pitch that:
        1. References the prospect's known pain points and characteristics
        2. Positions our solution as addressing those specific challenges
        3. Proposes a brief chat or next step
        4. Uses natural, conversational language
        5. Sounds authentic and personalized`;
        
        schema = {
          type: "object",
          properties: {
            pitch: { type: "string" }
          },
          required: ["pitch"]
        };
        break;
      case 'questions':
        loadingSetter = setIsGeneratingQuestions;
        setter = setDiscoveryQuestions;
        prompt = `${baseContext}

        Our company's products/services:
        ${productInfo}

        Generate 5-7 strategic discovery questions for this prospect that:
        1. Build on their known characteristics and pain points
        2. Uncover deeper challenges and decision-making process
        3. Identify budget and timeline specifics
        4. Qualify their fit for our solutions
        5. Build rapport and demonstrate expertise

        Focus on open-ended questions that encourage dialogue.`;
        
        schema = {
          type: "object",
          properties: {
            questions: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  question: { type: "string" },
                  purpose: { type: "string" }
                }
              }
            }
          },
          required: ["questions"]
        };
        break;
      case 'objections':
        loadingSetter = setIsGeneratingObjections;
        setter = setObjectionHandling;
        prompt = `${baseContext}

        Our company's products/services:
        ${productInfo}

        Generate 4-5 common objections this prospect might raise based on their profile and effective responses that:
        1. Acknowledge their concern authentically
        2. Provide evidence or examples relevant to their situation
        3. Redirect to value proposition
        4. Ask a follow-up question to continue the conversation

        Focus on objections specific to their role, industry, and known concerns.`;
        
        schema = {
          type: "object",
          properties: {
            objections: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  objection: { type: "string" },
                  response: { type: "string" }
                }
              }
            }
          },
          required: ["objections"]
        };
        break;
      default:
        return;
    }

    loadingSetter(true);
    try {
      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: schema
      });

      if (type === 'pitch') setter(response.pitch);
      if (type === 'questions') setter(response.questions);
      if (type === 'objections') setter(response.objections);

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`);
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(`Failed to generate ${type}. Please try again.`);
    } finally {
      loadingSetter(false);
    }
  };

  const handleUseSharedItem = async (item, type) => {
    try {
      // Copy content to clipboard
      let contentToCopy = '';
      if (type === 'pitch') {
        contentToCopy = item.pitch_content;
      } else if (type === 'question set') {
        contentToCopy = item.questions.map(q => `Q: ${q.question}\nPurpose: ${q.purpose}`).join('\n\n');
      } else if (type === 'objection set') {
        contentToCopy = item.objections.map(o => `Objection: "${o.objection}"\nResponse: ${o.response}`).join('\n\n');
      }

      // Copy to clipboard
      if (navigator.clipboard && contentToCopy) {
        await navigator.clipboard.writeText(contentToCopy);
      }

      // Update usage count (skip for dummy data)
      if (!item.id.startsWith('sp_dummy_') && !item.id.startsWith('sq_dummy_') && !item.id.startsWith('so_dummy_')) {
        const updatedCount = (item.usage_count || 0) + 1;
        
        switch (type) {
          case 'pitch':
            await SharedPitch.update(item.id, { usage_count: updatedCount });
            // Set as active pitch for this lead
            setGeneratedPitch(item.pitch_content);
            break;
          case 'question set':
            await SharedQuestion.update(item.id, { usage_count: updatedCount });
            // Set as active questions
            setDiscoveryQuestions(item.questions);
            break;
          case 'objection set':
            await SharedObjection.update(item.id, { usage_count: updatedCount });
            // Set as active objections
            setObjectionHandling(item.objections);
            break;
          default:
            break;
        }
      } else {
        // For dummy data, still set as active content
        if (type === 'pitch') {
          setGeneratedPitch(item.pitch_content);
        } else if (type === 'question set') {
          setDiscoveryQuestions(item.questions);
        } else if (type === 'objection set') {
          setObjectionHandling(item.objections);
        }
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} copied and ready to use!`, {
        description: "Content copied to clipboard and loaded into AI section for practice"
      });

    } catch (error) {
      console.error(`Error using ${type}:`, error);
      toast.error(`Failed to use ${type}. Please try again.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Research Status Banner */}
      {!lead.ai_generated_pitch ? (
          <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                              <BrainCircuit className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                              <h3 className="font-semibold text-amber-800 text-lg">Research This Lead First</h3>
                              <p className="text-amber-700 text-sm">Get AI-powered insights before preparing your call approach</p>
                          </div>
                      </div>
                      <Button 
                          onClick={() => window.location.href = window.location.href.replace('#call-prep', '#details')}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Go Research Lead
                      </Button>
                  </div>
              </CardContent>
          </Card>
      ) : (
          // Call Prep Content - Only show when lead is researched
          <Tabs defaultValue="pitch" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pitch">
                      <Mic className="w-4 h-4 mr-2" />
                      Personalized Pitch
                  </TabsTrigger>
                  <TabsTrigger value="questions">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Discovery Questions
                  </TabsTrigger>
                  <TabsTrigger value="objections">
                      <Shield className="w-4 h-4 mr-2" />
                      Handle Objections
                  </TabsTrigger>
              </TabsList>
              
              {/* PITCH TAB */}
              <TabsContent value="pitch">
                  <Tabs defaultValue="shared-pitch" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="shared-pitch">
                              <Share2 className="w-4 h-4 mr-2" />
                              Shared with Me ({sharedPitches.length})
                          </TabsTrigger>
                          <TabsTrigger value="ai-pitch">
                              <Sparkles className="w-4 h-4 mr-2" />
                              AI Generated
                          </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="ai-pitch">
                          <Card className="shadow-lg">
                              <CardHeader className="flex flex-row items-center justify-between">
                                  <div>
                                      <CardTitle className="flex items-center gap-2">
                                          <Sparkles className="w-5 h-5 text-purple-600" />
                                          AI-Generated Pitch for {lead.contact_name}
                                      </CardTitle>
                                      <CardDescription>
                                          Personalized based on company research and contact analysis
                                      </CardDescription>
                                  </div>
                                  <Button onClick={() => setShowRoleplayOverlay(true)} className="bg-green-600 hover:bg-green-700">
                                      <Mic className="w-4 h-4 mr-2" />
                                      Practice Pitch
                                  </Button>
                              </CardHeader>
                              <CardContent>
                                  <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500 mb-6">
                                      <p className="text-slate-800 italic leading-relaxed text-lg font-medium">
                                          "{lead.ai_generated_pitch}"
                                      </p>
                                  </div>
                                  
                                  {generatedPitch && (
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Brain className="w-4 h-4 text-blue-600" />
                                                <h4 className="font-medium text-slate-800">Alternative Pitch Generated</h4>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                                <p className="text-slate-700 italic leading-relaxed text-lg">"{generatedPitch}"</p>
                                            </div>
                                        </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                      <div className="bg-blue-50 p-4 rounded-lg">
                                          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                              <Target className="w-4 h-4" />
                                              Key Pain Points
                                          </h4>
                                          <ul className="text-sm text-blue-700 space-y-1">
                                              {lead.pain_points?.slice(0, 3).map((point, index) => (
                                                  <li key={index}>• {point}</li>
                                              )) || <li>• Not identified yet</li>}
                                          </ul>
                                      </div>
                                      
                                      <div className="bg-green-50 p-4 rounded-lg">
                                          <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-1">
                                              <Users className="w-4 h-4" />
                                              Decision Makers
                                          </h4>
                                          <ul className="text-sm text-green-700 space-y-1">
                                              {lead.decision_makers?.slice(0, 3).map((dm, index) => (
                                                  <li key={index}>• {dm}</li>
                                              )) || <li>• {lead.contact_name} (Primary)</li>}
                                          </ul>
                                      </div>
                                  </div>

                                  <div className="flex gap-3 flex-wrap">
                                      <Button variant="outline" onClick={() => generateContent('pitch')} disabled={isGeneratingPitch}>
                                          {isGeneratingPitch ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                                          Generate Alternative Pitch
                                      </Button>
                                      <Button onClick={() => setShowRoleplayOverlay(true)} className="bg-green-600 hover:bg-green-700">
                                          <Mic className="w-4 h-4 mr-2" />
                                          Practice Pitch
                                      </Button>
                                  </div>
                              </CardContent>
                          </Card>
                      </TabsContent>
                      
                      <TabsContent value="shared-pitch">
                          <Card className="shadow-lg">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-slate-700">
                                      <Share2 className="w-5 h-5" />
                                      Shared Pitches
                                  </CardTitle>
                                  <CardDescription>
                                      Pitches shared by your team. Click "Use" to copy and track usage.
                                  </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  {sharedPitches.map((spitch) => (
                                      <div key={spitch.id} className="p-4 border rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                          <div className="flex-1">
                                              <h4 className="font-semibold text-lg text-slate-800">{spitch.pitch_name}</h4>
                                              <p className="text-slate-600 italic text-sm mb-2">"{spitch.pitch_content}"</p>
                                              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
                                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                                      Target: {spitch.target_audience || 'N/A'}
                                                  </Badge>
                                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                                      Success Rate: {spitch.success_rate || 0}%
                                                  </Badge>
                                                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                                      Used: {spitch.usage_count || 0} times
                                                  </Badge>
                                                  <span className="ml-auto text-slate-400">Shared by: {spitch.created_by || 'Unknown'}</span>
                                              </div>
                                          </div>
                                          <Button onClick={() => handleUseSharedItem(spitch, 'pitch')} size="sm" className="flex-shrink-0">
                                              Use This Pitch
                                          </Button>
                                      </div>
                                  ))}
                              </CardContent>
                          </Card>
                      </TabsContent>
                  </Tabs>
              </TabsContent>
              
              {/* QUESTIONS TAB */}
              <TabsContent value="questions">
                  <Tabs defaultValue="shared-questions" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                           <TabsTrigger value="shared-questions">
                              <Share2 className="w-4 h-4 mr-2" />
                              Shared with Me ({sharedQuestions.length})
                          </TabsTrigger>
                          <TabsTrigger value="ai-questions">
                              <Sparkles className="w-4 h-4 mr-2" />
                              AI Generated
                          </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="ai-questions">
                          <Card className="shadow-lg">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                      <Sparkles className="w-5 h-5 text-blue-600" />
                                      AI-Generated Discovery Questions
                                  </CardTitle>
                                  <CardDescription>
                                      Personalized questions to uncover needs and qualify the prospect.
                                  </CardDescription>
                              </CardHeader>
                              <CardContent>
                                  {isGeneratingQuestions ? (
                                      <div className="flex justify-center items-center p-8">
                                          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                          <span className="ml-2 text-slate-600">Generating strategic questions...</span>
                                      </div>
                                  ) : discoveryQuestions.length > 0 ? (
                                      <div className="space-y-4">
                                          <div className="space-y-3">
                                              {discoveryQuestions.map((item, index) => (
                                                  <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                                      <p className="font-medium text-blue-900 mb-1">{item.question}</p>
                                                      <p className="text-blue-700 text-sm italic">Purpose: {item.purpose}</p>
                                                  </div>
                                              ))}
                                          </div>
                                          <Button variant="outline" onClick={() => generateContent('questions')} size="sm">
                                              <Sparkles className="w-4 h-4 mr-2" />
                                              Regenerate Questions
                                          </Button>
                                      </div>
                                  ) : (
                                      <div className="text-center py-8">
                                          <Button onClick={() => generateContent('questions')} className="bg-blue-600 hover:bg-blue-700">
                                              <Sparkles className="w-4 h-4 mr-2" />
                                              Generate AI Discovery Questions
                                          </Button>
                                          <p className="text-slate-500 text-sm mt-2">Get personalized questions based on their role and company</p>
                                      </div>
                                  )}
                              </CardContent>
                          </Card>
                      </TabsContent>
                      
                      <TabsContent value="shared-questions">
                          <Card className="shadow-lg">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-slate-700">
                                      <Share2 className="w-5 h-5" />
                                      Shared Discovery Question Sets
                                  </CardTitle>
                                  <CardDescription>
                                      Question sets shared by your team. Click "Use" to track usage.
                                  </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  {sharedQuestions.map((squestionSet) => (
                                      <div key={squestionSet.id} className="p-4 border rounded-lg bg-gray-50">
                                          <div className="flex justify-between items-start mb-3 gap-2">
                                              <h4 className="font-semibold text-lg text-slate-800">{squestionSet.name}</h4>
                                              <Button onClick={() => handleUseSharedItem(squestionSet, 'question set')} size="sm" className="flex-shrink-0">
                                                  Use This Set
                                              </Button>
                                          </div>
                                          <div className="space-y-2 mb-3">
                                              {squestionSet.questions.map((q, qIndex) => (
                                                  <div key={qIndex} className="p-2 bg-gray-100 rounded">
                                                      <p className="font-medium text-slate-700 text-sm">{q.question}</p>
                                                      <p className="text-slate-500 text-xs italic">Purpose: {q.purpose}</p>
                                                  </div>
                                              ))}
                                          </div>
                                          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
                                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                                  Target: {squestionSet.target_audience || 'N/A'}
                                              </Badge>
                                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                                  Success Rate: {squestionSet.success_rate || 0}%
                                              </Badge>
                                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                                  Used: {squestionSet.usage_count || 0} times
                                              </Badge>
                                              <span className="ml-auto text-slate-400">Shared by: {squestionSet.created_by || 'Unknown'}</span>
                                          </div>
                                      </div>
                                  ))}
                              </CardContent>
                          </Card>
                      </TabsContent>
                  </Tabs>
              </TabsContent>
              
              {/* OBJECTIONS TAB */}
              <TabsContent value="objections">
                  <Tabs defaultValue="shared-objections" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="shared-objections">
                              <Share2 className="w-4 h-4 mr-2" />
                              Shared with Me ({sharedObjections.length})
                          </TabsTrigger>
                          <TabsTrigger value="ai-objections">
                              <Sparkles className="w-4 h-4 mr-2" />
                              AI Generated
                          </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="ai-objections">
                          <Card className="shadow-lg">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                      <Sparkles className="w-5 h-5 text-red-600" />
                                      AI-Generated Objection Handling
                                  </CardTitle>
                                  <CardDescription>
                                      Anticipated objections and effective responses based on prospect profile.
                                  </CardDescription>
                              </CardHeader>
                              <CardContent>
                                  {isGeneratingObjections ? (
                                      <div className="flex justify-center items-center p-8">
                                          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                                          <span className="ml-2 text-slate-600">Generating objection responses...</span>
                                      </div>
                                  ) : objectionHandling.length > 0 ? (
                                      <div className="space-y-4">
                                          <div className="space-y-4">
                                              {objectionHandling.map((item, index) => (
                                                  <div key={index} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                                                      <p className="font-medium text-red-900 mb-2">🚫 "{item.objection}"</p>
                                                      <p className="text-red-800 text-sm leading-relaxed">💡 {item.response}</p>
                                                  </div>
                                              ))}
                                          </div>
                                          <Button variant="outline" onClick={() => generateContent('objections')} size="sm">
                                              <Sparkles className="w-4 h-4 mr-2" />
                                              Regenerate Responses
                                          </Button>
                                      </div>
                                  ) : (
                                      <div className="text-center py-8">
                                          <Button onClick={() => generateContent('objections')} className="bg-red-600 hover:bg-red-700">
                                              <Sparkles className="w-4 h-4 mr-2" />
                                              Generate AI Objection Handling
                                          </Button>
                                          <p className="text-slate-500 text-sm mt-2">Get responses for common objections from similar prospects</p>
                                      </div>
                                  )}
                              </CardContent>
                          </Card>
                      </TabsContent>
                      
                      <TabsContent value="shared-objections">
                          <Card className="shadow-lg">
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-slate-700">
                                      <Share2 className="w-5 h-5" />
                                      Shared Objection Handling Sets
                                  </CardTitle>
                                  <CardDescription>
                                      Objection handling sets shared by your team. Click "Use" to track usage.
                                  </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  {sharedObjections.map((sobjectionSet) => (
                                      <div key={sobjectionSet.id} className="p-4 border rounded-lg bg-gray-50">
                                          <div className="flex justify-between items-start mb-3 gap-2">
                                              <h4 className="font-semibold text-lg text-slate-800">{sobjectionSet.name}</h4>
                                              <Button onClick={() => handleUseSharedItem(sobjectionSet, 'objection set')} size="sm" className="flex-shrink-0">
                                                  Use This Set
                                              </Button>
                                          </div>
                                          <div className="space-y-2 mb-3">
                                              {sobjectionSet.objections.map((o, oIndex) => (
                                                  <div key={oIndex} className="p-2 bg-gray-100 rounded">
                                                      <p className="font-medium text-slate-700 text-sm">🚫 "{o.objection}"</p>
                                                      <p className="text-slate-500 text-xs italic">💡 {o.response}</p>
                                                  </div>
                                              ))}
                                          </div>
                                          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
                                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                                  Target: {sobjectionSet.target_audience || 'N/A'}
                                              </Badge>
                                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                                  Success Rate: {sobjectionSet.success_rate || 0}%
                                              </Badge>
                                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                                  Used: {sobjectionSet.usage_count || 0} times
                                              </Badge>
                                              <span className="ml-auto text-slate-400">Shared by: {sobjectionSet.created_by || 'Unknown'}</span>
                                          </div>
                                      </div>
                                  ))}
                              </CardContent>
                          </Card>
                      </TabsContent>
                  </Tabs>
              </TabsContent>
          </Tabs>
      )}

      {showRoleplayOverlay && (
          <RoleplayOverlay
              lead={lead}
              onClose={() => setShowRoleplayOverlay(false)}
              initialPitchText={generatedPitch || lead.ai_generated_pitch}
          />
      )}
    </div>
  );
}
