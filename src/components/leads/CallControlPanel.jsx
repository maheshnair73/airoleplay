import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, PhoneOff, Clock, Pause, Play, Mic, MicOff, Volume2, VolumeX, BookOpen, Search, Sparkles, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SalesKnowledgeBase, Product, Competitor } from '@/api/entities';
import FloatingCallWidget from '@/components/calls/FloatingCallWidget';

export default function CallControlPanel({ lead, onCallEnd, onCallStart }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [showKnowledgeHub, setShowKnowledgeHub] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [selectedTab, setSelectedTab] = useState('search');

  useEffect(() => {
    let interval;
    if (isCallActive && !isPaused) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, isPaused]);

  useEffect(() => {
    if (showKnowledgeHub) {
      loadKnowledgeBase();
    }
  }, [showKnowledgeHub]);

  const loadKnowledgeBase = async () => {
    setIsLoadingKnowledge(true);
    try {
      const [knowledgeData, productsData, competitorsData] = await Promise.all([
        SalesKnowledgeBase.list('-created_at'),
        Product.list('-created_at'),
        Competitor.list('-created_at')
      ]);
      setKnowledgeItems(knowledgeData || []);
      setProducts(productsData || []);
      setCompetitors(competitorsData || []);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    setCallStartTime(new Date());
    setCallDuration(0);
    if (onCallStart) {
      onCallStart({ startTime: new Date(), lead });
    }
    toast.success('Call started');
  };

  const handleEndCall = () => {
    const callData = {
      duration: callDuration,
      startTime: callStartTime,
      endTime: new Date(),
      lead
    };

    setIsCallActive(false);
    setIsPaused(false);
    setCallDuration(0);
    setCallStartTime(null);

    if (onCallEnd) {
      onCallEnd(callData);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Call resumed' : 'Call paused');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Unmuted' : 'Muted');
  };

  const handleFloatingEndCall = () => {
    handleEndCall();
  };

  const handleFloatingMuteToggle = () => {
    toggleMute();
  };

  const filteredKnowledge = knowledgeItems.filter(item =>
    item.title?.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
    item.content?.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
    item.category?.toLowerCase().includes(knowledgeSearch.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
    product.description?.toLowerCase().includes(knowledgeSearch.toLowerCase())
  );

  const filteredCompetitors = competitors.filter(competitor =>
    competitor.name?.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
    competitor.strengths?.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
    competitor.weaknesses?.toLowerCase().includes(knowledgeSearch.toLowerCase())
  );

  return (
    <>
      {isCallActive && (
        <FloatingCallWidget
          lead={lead}
          callDuration={callDuration}
          onEndCall={handleFloatingEndCall}
          onMuteToggle={handleFloatingMuteToggle}
          isMuted={isMuted}
          position="bottom-right"
        />
      )}

      <Card className={`shadow-lg border-2 ${isCallActive ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {!isCallActive ? (
              <div className="text-center">
                <Button
                  onClick={handleStartCall}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-16 text-lg"
                >
                  <Phone className="w-6 h-6 mr-2" />
                  Start Call with {lead?.contact_name}
                </Button>
                <p className="text-sm text-slate-500 mt-2">
                  Click to begin tracking this call
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 text-white mb-4 animate-pulse">
                    <Phone className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">
                    {formatDuration(callDuration)}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Call in progress with {lead?.contact_name}
                  </p>
                  {isPaused && (
                    <Badge variant="outline" className="mt-2 bg-amber-50 text-amber-700 border-amber-300">
                      <Pause className="w-3 h-3 mr-1" />
                      Paused
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={togglePause}
                    className="flex items-center justify-center gap-2"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        Hold
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={toggleMute}
                    className={`flex items-center justify-center gap-2 ${isMuted ? 'bg-red-50 border-red-300' : ''}`}
                  >
                    {isMuted ? (
                      <>
                        <MicOff className="w-4 h-4 text-red-600" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Mute
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  onClick={() => setShowKnowledgeHub(true)}
                  variant="outline"
                  className="w-full bg-blue-50 border-blue-300 hover:bg-blue-100"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Quick Access: Knowledge Hub
                </Button>

                <Button
                  onClick={handleEndCall}
                  size="lg"
                  variant="destructive"
                  className="w-full h-14 text-lg"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showKnowledgeHub} onOpenChange={setShowKnowledgeHub}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Knowledge Hub - Quick Reference
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search knowledge base, products, competitors..."
                value={knowledgeSearch}
                onChange={(e) => setKnowledgeSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 border-b">
              <Button
                variant={selectedTab === 'search' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('search')}
              >
                <Search className="w-4 h-4 mr-2" />
                All
              </Button>
              <Button
                variant={selectedTab === 'products' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('products')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Products ({products.length})
              </Button>
              <Button
                variant={selectedTab === 'competitors' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('competitors')}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Competitors ({competitors.length})
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              {isLoadingKnowledge ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading knowledge base...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {(selectedTab === 'search' || selectedTab === 'products') && filteredProducts.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        Products
                      </h3>
                      <div className="space-y-3">
                        {filteredProducts.map((product) => (
                          <Card key={product.id} className="border-blue-200">
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-slate-800 mb-2">{product.name}</h4>
                              <p className="text-sm text-slate-600 mb-2">{product.description}</p>
                              {product.key_features && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-slate-700">Key Features:</p>
                                  <ul className="text-xs text-slate-600 space-y-1 ml-4">
                                    {product.key_features.split('\n').slice(0, 3).map((feature, idx) => (
                                      <li key={idx} className="flex items-start gap-1">
                                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedTab === 'search' || selectedTab === 'competitors') && filteredCompetitors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Competitors
                      </h3>
                      <div className="space-y-3">
                        {filteredCompetitors.map((competitor) => (
                          <Card key={competitor.id} className="border-amber-200">
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-slate-800 mb-2">{competitor.name}</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {competitor.strengths && (
                                  <div>
                                    <p className="font-semibold text-green-700 mb-1">Strengths:</p>
                                    <p className="text-slate-600 text-xs">{competitor.strengths}</p>
                                  </div>
                                )}
                                {competitor.weaknesses && (
                                  <div>
                                    <p className="font-semibold text-red-700 mb-1">Weaknesses:</p>
                                    <p className="text-slate-600 text-xs">{competitor.weaknesses}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTab === 'search' && filteredKnowledge.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Knowledge Articles
                      </h3>
                      <div className="space-y-3">
                        {filteredKnowledge.map((item) => (
                          <Card key={item.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-slate-800">{item.title}</h4>
                                {item.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-3">{item.content}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredKnowledge.length === 0 && filteredProducts.length === 0 && filteredCompetitors.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No results found</p>
                      <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
