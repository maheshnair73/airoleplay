import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrainCircuit, Send, Loader2, Sparkles } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { toast } from 'sonner';

const initialMessages = [
    {
        id: 1,
        type: 'ai',
        content: "Hi! I'm Effy, your AI Sales Assistant. How can I help you with your sales tasks today?",
    }
];

const suggestedPrompts = [
    "Summarize my active leads",
    "Draft a follow-up email to a prospect after a demo",
    "Give me three key talking points for selling to the finance industry",
    "Identify my top 3 deals by value"
];

export default function AIAssistantChat() {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const SAFETY_PROMPT = `
You are Effy, a professional, helpful, and strictly business-focused AI Sales Assistant. Your purpose is to assist with sales-related tasks like data analysis, content generation, and providing insights. You must maintain a professional and ethical tone at all times.

IMPORTANT: SAFETY AND PROFESSIONALISM RULES:
1.  NEVER engage in personal conversations, flirting, or discussing non-work-related topics (e.g., politics, religion, personal opinions, romantic advice).
2.  NEVER respond to requests that are unethical, illegal, harmful, discriminatory, or inappropriate. This includes generating offensive content, providing financial or legal advice, or creating malicious code.
3.  If you detect a user attempting to misuse you with an inappropriate or unethical request, you MUST politely but firmly decline.
4.  Your refusal response must be professional and redirect the conversation. Use this format: "As a professional sales assistant, I cannot fulfill requests of that nature. My purpose is to help with sales-related tasks. How can I assist you with your sales goals today?"
5.  Do not be preachy or judgmental. Simply state your purpose and redirect.
6.  You are an assistant for the "SalesAI Pro" application.
`;

    const handleSend = async (message = inputValue) => {
        if (!message.trim()) return;

        const userMessage = { id: Date.now(), type: 'user', content: message };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        
        const fullPrompt = `${SAFETY_PROMPT}\n\nThe user's request is: "${message}". Please respond according to your instructions.`;

        try {
            const aiResponse = await InvokeLLM({ prompt: fullPrompt });

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: aiResponse,
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "I'm sorry, I encountered an error. Please try again in a moment.",
            };
            setMessages(prev => [...prev, errorMessage]);
            toast.error("AI Assistant Error: Could not get a response.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[650px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                        {message.type === 'ai' && (
                            <Avatar className="w-9 h-9 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                                    <BrainCircuit className="w-5 h-5" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
                            message.type === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-100 text-slate-800'
                        }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <Avatar className="w-9 h-9 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                                <BrainCircuit className="w-5 h-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="bg-slate-100 p-3 rounded-lg shadow-sm">
                            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                        </div>
                    </div>
                )}
                
                {messages.length === 1 && !isLoading && (
                    <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500 text-center mb-3 flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            Here are some things you can ask:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {suggestedPrompts.map((prompt, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-auto py-2 leading-tight text-slate-600 hover:bg-slate-50"
                                    onClick={() => handleSend(prompt)}
                                >
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t p-4 bg-slate-50/50 rounded-b-lg">
                <div className="flex gap-2 items-start">
                    <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Effy anything about your sales data..."
                        className="flex-1 border-slate-200 focus-visible:ring-violet-400 shadow-sm"
                        disabled={isLoading}
                        rows={2}
                    />
                    <Button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="icon"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                    Please maintain professional conduct. Misuse of the AI assistant will be logged.
                </p>
            </div>
        </div>
    );
}