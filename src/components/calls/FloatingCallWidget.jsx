import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Phone, PhoneOff, Mic, MicOff, Maximize2, Minimize2,
  MessageSquare, BookOpen, Sparkles, Search, Send, X,
  ChevronDown, ChevronUp, HelpCircle
} from 'lucide-react';
import { SalesKnowledgeBase, Product } from '@/api/entities';
import { toast } from 'sonner';

export default function FloatingCallWidget({
  lead,
  callDuration,
  onEndCall,
  onMuteToggle,
  isMuted = false,
  position = 'bottom-right'
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: `How can I assist you during this call with ${lead?.contact_name || 'the prospect'}?` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);

  useEffect(() => {
    loadKnowledgeData();
  }, []);

  const loadKnowledgeData = async () => {
    setIsLoadingKnowledge(true);
    try {
      const [knowledgeData, productsData] = await Promise.all([
        SalesKnowledgeBase.list('-created_at'),
        Product.list('-created_at')
      ]);
      setKnowledgeItems(knowledgeData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsSendingMessage(true);

    try {
      const response = await generateAIResponse(userMessage);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const generateAIResponse = async (query) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('product') || lowerQuery.includes('feature')) {
      const relevantProducts = products.filter(p =>
        p.name?.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      );

      if (relevantProducts.length > 0) {
        const product = relevantProducts[0];
        return `Here's information about ${product.name}:\n\n${product.description}\n\nKey Features:\n${product.key_features || 'Not available'}`;
      }
    }

    if (lowerQuery.includes('price') || lowerQuery.includes('pricing') || lowerQuery.includes('cost')) {
      return "For pricing information, I recommend discussing custom pricing based on their specific needs. Our pricing is flexible and depends on usage volume, features required, and contract terms. Would you like me to help you structure a pricing conversation?";
    }

    if (lowerQuery.includes('competitor') || lowerQuery.includes('compare')) {
      return "When discussing competitors, focus on our unique value propositions: superior customer support, ease of integration, and proven ROI. Would you like specific talking points for any particular competitor?";
    }

    if (lowerQuery.includes('objection') || lowerQuery.includes('concern')) {
      return "Common objection handling tips:\n1. Listen fully before responding\n2. Acknowledge their concern\n3. Provide a relevant case study or example\n4. Ask if that addresses their concern\n\nWhat specific objection are you facing?";
    }

    const relevantKnowledge = knowledgeItems.find(item =>
      item.title?.toLowerCase().includes(lowerQuery) ||
      item.content?.toLowerCase().includes(lowerQuery)
    );

    if (relevantKnowledge) {
      return `${relevantKnowledge.title}\n\n${relevantKnowledge.content}`;
    }

    return "I'm here to help! Try asking about:\n• Product features and benefits\n• Pricing and plans\n• Competitor comparisons\n• Objection handling\n• Common questions";
  };

  const filteredKnowledge = knowledgeItems.filter(item =>
    !searchQuery ||
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    !searchQuery ||
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  if (isMinimized) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Card className="shadow-2xl border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 animate-pulse">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Call in Progress</p>
                <p className="text-lg font-bold text-green-600">{formatDuration(callDuration)}</p>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(false)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onEndCall}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className={`shadow-2xl border-2 border-green-500 transition-all duration-300 ${
        isExpanded ? 'w-[480px]' : 'w-80'
      }`}>
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">Active Call</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-7 w-7 p-0 text-white hover:bg-white/20"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(true)}
                  className="h-7 w-7 p-0 text-white hover:bg-white/20"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onEndCall}
                  className="h-7 w-7 p-0 text-white hover:bg-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{lead?.contact_name || 'Unknown'}</p>
                <p className="text-xs opacity-75">{lead?.company_name || ''}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatDuration(callDuration)}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={onMuteToggle}
                className={`flex-1 text-white hover:bg-white/20 ${isMuted ? 'bg-red-500/30' : ''}`}
              >
                {isMuted ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEndCall}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                <PhoneOff className="w-4 h-4 mr-1" />
                End Call
              </Button>
            </div>
          </div>

          <div className="bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Quick FAQ
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="m-0 p-0">
                <div className={`flex flex-col ${isExpanded ? 'h-[500px]' : 'h-[350px]'}`}>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-3 ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            {message.role === 'assistant' && (
                              <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-3 h-3 text-blue-500" />
                                <span className="text-xs font-semibold text-blue-600">AI Assistant</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      {isSendingMessage && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 rounded-lg p-3">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="border-t p-3 bg-slate-50">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask anything during the call..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isSendingMessage}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Ask about products, pricing, objections, or competitors
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="m-0 p-0">
                <div className={`flex flex-col ${isExpanded ? 'h-[500px]' : 'h-[350px]'}`}>
                  <div className="p-3 border-b bg-slate-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search FAQ, products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    {isLoadingKnowledge ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-slate-600">Loading...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredProducts.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Products
                            </h4>
                            {filteredProducts.slice(0, 3).map((product) => (
                              <Card key={product.id} className="mb-2 border-blue-200">
                                <CardContent className="p-3">
                                  <h5 className="font-semibold text-sm text-slate-800 mb-1">
                                    {product.name}
                                  </h5>
                                  <p className="text-xs text-slate-600 line-clamp-2">
                                    {product.description}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {filteredKnowledge.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                              <HelpCircle className="w-3 h-3" />
                              FAQ & Knowledge
                            </h4>
                            {filteredKnowledge.slice(0, 5).map((item) => (
                              <Card key={item.id} className="mb-2">
                                <CardContent className="p-3">
                                  <h5 className="font-semibold text-sm text-slate-800 mb-1">
                                    {item.title}
                                  </h5>
                                  <p className="text-xs text-slate-600 line-clamp-3">
                                    {item.content}
                                  </p>
                                  {item.category && (
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      {item.category}
                                    </Badge>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {filteredKnowledge.length === 0 && filteredProducts.length === 0 && (
                          <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-600">No results found</p>
                            <p className="text-xs text-slate-400 mt-1">Try a different search</p>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
