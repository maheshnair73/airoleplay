import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SalesKnowledgeBase } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Loader2, Search, Zap, BookOpen, BrainCircuit, Send, User, Bot } from 'lucide-react';
import { toast } from 'sonner';

// Custom hook for the typing effect
const useTypingEffect = (textToType, speed = 30) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (!textToType) {
            setDisplayedText('');
            return;
        }

        setDisplayedText(''); // Reset on new text
        let i = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(prev => prev + textToType.charAt(i));
            i++;
            if (i > textToType.length) {
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [textToType, speed]);

    return displayedText;
};

export default function LiveCallAssistant({ open, onOpenChange, lead }) {
    const [message, setMessage] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [currentResponse, setCurrentResponse] = useState('');

    const typedResponse = useTypingEffect(currentResponse);

    // Initialize with a welcome message
    useEffect(() => {
        if (open && conversationHistory.length === 0) {
            setConversationHistory([{
                id: Date.now(),
                type: 'assistant',
                content: `Hi! I'm your live call assistant. I can help you with information about ${lead.contact_name} or answer any questions that come up during your call. What do you need to know?`,
                timestamp: new Date()
            }]);
        }
    }, [open, lead, conversationHistory.length]);

    const sendMessage = useCallback(async (userMessage) => {
        if (!userMessage.trim()) return;

        // Add user message to conversation
        const userMsg = {
            id: Date.now(),
            type: 'user',
            content: userMessage,
            timestamp: new Date()
        };

        setConversationHistory(prev => [...prev, userMsg]);
        setMessage('');
        setIsSearching(true);
        setCurrentResponse('');

        try {
            // Build conversation context for AI
            const recentConversation = conversationHistory.slice(-6).map(msg => 
                `${msg.type === 'user' ? 'Sales Rep' : 'Assistant'}: ${msg.content}`
            ).join('\n');

            // 1. First, try to find relevant knowledge base articles
            let knowledgeContext = '';
            try {
                const kbResults = await SalesKnowledgeBase.filter(
                    {
                        $or: [
                            { title: { $regex: userMessage, $options: 'i' } },
                            { content: { $regex: userMessage, $options: 'i' } },
                            { recommended_response: { $regex: userMessage, $options: 'i' } }
                        ]
                    },
                    '',
                    2
                );

                if (kbResults.length > 0) {
                    knowledgeContext = '\n\nRelevant Knowledge Base Info:\n' + 
                        kbResults.map(kb => `- ${kb.title}: ${kb.recommended_response || kb.content}`).join('\n');
                }
            } catch (error) {
                console.log('Knowledge base search failed, continuing with AI only');
            }

            // 2. Generate AI response with full context
            const prompt = `You are a live sales assistant helping a sales representative during an active call. Provide quick, actionable responses.

PROSPECT INFORMATION:
- Name: ${lead.contact_name}
- Title: ${lead.contact_title}
- Company: ${lead.company_name}
- Industry: ${lead.industry || 'Not specified'}
- Pain Points: ${lead.pain_points?.join(', ') || 'None identified'}
- Deal Value: ${lead.estimated_deal_value ? `$${lead.estimated_deal_value.toLocaleString()}` : 'Not set'}

RECENT CONVERSATION CONTEXT:
${recentConversation}

CURRENT QUESTION: ${userMessage}

${knowledgeContext}

Provide a direct, actionable response that the sales rep can use immediately. Keep it concise but helpful. If this is a follow-up question, reference the previous context appropriately.`;

            const response = await InvokeLLM({ prompt });
            setCurrentResponse(response);

            // Add assistant response to conversation after typing completes
            setTimeout(() => {
                const assistantMsg = {
                    id: Date.now() + 1,
                    type: 'assistant',
                    content: response,
                    timestamp: new Date()
                };
                setConversationHistory(prev => [...prev, assistantMsg]);
            }, response.length * 30 + 500); // Wait for typing to complete

        } catch (error) {
            console.error("Error in live assistant chat:", error);
            const errorMsg = {
                id: Date.now() + 1,
                type: 'assistant',
                content: "I'm sorry, I'm having trouble processing that request. Please try again or rephrase your question.",
                timestamp: new Date()
            };
            setConversationHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsSearching(false);
        }
    }, [lead, conversationHistory]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(message);
        }
    };

    const handleSend = () => {
        sendMessage(message);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-purple-600" />
                        Live Call Assistant
                    </DialogTitle>
                    <DialogDescription>
                        Chat with AI for real-time help during your call with {lead.contact_name}
                    </DialogDescription>
                </DialogHeader>
                
                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
                    {conversationHistory.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-start gap-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                                    msg.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                                }`}>
                                    {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`px-4 py-2 rounded-lg ${
                                    msg.type === 'user' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-white border shadow-sm'
                                }`}>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Show typing response */}
                    {currentResponse && (
                        <div className="flex items-start gap-3 justify-start">
                            <div className="flex items-start gap-2 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-purple-500">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-white border shadow-sm">
                                    <p className="text-sm">{typedResponse}</p>
                                    {typedResponse !== currentResponse && (
                                        <div className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {isSearching && !currentResponse && (
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2 p-4 border-t">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about this call..."
                        disabled={isSearching}
                        className="flex-1"
                    />
                    <Button 
                        onClick={handleSend}
                        disabled={isSearching || !message.trim()}
                        size="sm"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                
                <div className="text-xs text-gray-500 text-center pb-2">
                    💡 <strong>Tip:</strong> I remember our conversation context. You can ask follow-up questions naturally!
                </div>
            </DialogContent>
        </Dialog>
    );
}