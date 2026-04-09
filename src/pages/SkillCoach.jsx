import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
    Send, Bot, ChevronRight, CheckSquare, BookOpen, Mic, MonitorPlay,
    ClipboardList, TrendingUp, Star, Clock, Play, RotateCcw, X,
    Sparkles, Target, Zap, AlertCircle, CheckCircle2, Plus, MessageSquare,
    BarChart2
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const SESSION_TYPES = [
    { id: 'performance_review', label: 'Review My Performance', icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Get personalized feedback on your recent activity' },
    { id: 'product_training', label: 'Product Training', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50', desc: 'Learn new features, pricing, and use cases' },
    { id: 'skill_drill', label: 'Skill Drill', icon: Target, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Practice specific sales skills with live coaching' },
    { id: 'quiz', label: 'Take a Quiz', icon: CheckSquare, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Test your knowledge with targeted questions' },
    { id: 'demo_review', label: 'Demo Coaching', icon: MonitorPlay, color: 'text-teal-600', bg: 'bg-teal-50', desc: 'Get coached on recording a product demo' },
    { id: 'free_chat', label: 'Open Coaching', icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-50', desc: 'Ask anything — your coach is here to help' },
];

const TASK_TYPE_ICONS = {
    quiz: CheckSquare,
    roleplay: Mic,
    demo_recording: MonitorPlay,
    reading: BookOpen,
    custom: ClipboardList,
};

const TASK_TYPE_COLORS = {
    quiz: 'bg-rose-100 text-rose-700',
    roleplay: 'bg-blue-100 text-blue-700',
    demo_recording: 'bg-teal-100 text-teal-700',
    reading: 'bg-green-100 text-green-700',
    custom: 'bg-slate-100 text-slate-700',
};

function buildSystemPrompt(bot, sessionType, performanceSnapshot) {
    const perf = performanceSnapshot || {};
    const perfContext = Object.keys(perf).length > 0
        ? `\n\nREP PERFORMANCE SNAPSHOT:\n${JSON.stringify(perf, null, 2)}`
        : '';

    const sessionContext = {
        performance_review: 'You are conducting a performance review session. Analyze the rep\'s metrics, highlight strengths, identify gaps, and give specific actionable advice. Be direct and data-driven.',
        product_training: 'You are running a product training session. Teach the rep about features, pricing, use cases, and competitive positioning. Use questions to check understanding. Assign quiz tasks when appropriate.',
        skill_drill: 'You are running a sales skill drill. Pick a specific skill (cold calling, discovery questions, objection handling, closing) and coach the rep through practice scenarios. Give real-time feedback.',
        quiz: 'You are running a knowledge quiz session. Ask one question at a time, wait for the answer, give feedback, then move to the next question. Track score as you go. Make it engaging.',
        demo_review: 'You are coaching the rep on product demos. Discuss demo structure, storytelling, handling questions, and screen-sharing best practices. Assign a demo recording task when ready.',
        free_chat: 'You are an open coaching session. Answer any questions, give advice on sales strategy, help with deal-specific situations, or just have a motivating conversation.',
    };

    return `You are ${bot.name}, an AI sales coach with the following characteristics:
Personality: ${bot.personality}
Focus Area: ${bot.focus_area}
${bot.system_prompt_extra ? `Additional context: ${bot.system_prompt_extra}` : ''}

SESSION TYPE: ${sessionType}
${sessionContext[sessionType] || sessionContext.free_chat}
${perfContext}

COACHING GUIDELINES:
- Be conversational, specific, and actionable
- Reference the rep's actual performance data when available
- Proactively suggest tasks (quizzes, roleplay sessions, demo recordings, reading)
- When suggesting a task, clearly say: "TASK: [task_type] | [title] | [brief description]" on its own line so it can be extracted
  - task_type must be one of: quiz, roleplay, demo_recording, reading, custom
  - Example: TASK: quiz | Product Pricing Quiz | Test your knowledge of our pricing tiers and packaging options
- Keep responses focused (3-5 sentences max unless doing a quiz or detailed explanation)
- Be encouraging but honest — growth requires honest feedback
- Always end with a question or next step to keep momentum going`;
}

function extractTasksFromMessage(text) {
    const taskRegex = /TASK:\s*(\w+)\s*\|\s*([^|]+)\s*\|\s*(.+)/gi;
    const tasks = [];
    let match;
    while ((match = taskRegex.exec(text)) !== null) {
        tasks.push({
            task_type: match[1].toLowerCase().trim(),
            title: match[2].trim(),
            description: match[3].trim(),
        });
    }
    return tasks;
}

function cleanMessageText(text) {
    return text.replace(/TASK:\s*\w+\s*\|[^\n]+/gi, '').trim();
}

export default function SkillCoach() {
    const [currentUser, setCurrentUser] = useState(null);
    const [bots, setBots] = useState([]);
    const [selectedBot, setSelectedBot] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [sessionType, setSessionType] = useState(null);
    const [view, setView] = useState('bots');
    const [openaiKey, setOpenaiKey] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadUser();
        loadBots();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
            setCurrentUser({ ...user, profile });
        }
    };

    const loadBots = async () => {
        const { data } = await supabase
            .from('skill_coach_bots')
            .select('*')
            .eq('is_active', true)
            .order('is_default', { ascending: false });
        if (data) setBots(data);
    };

    const loadTasks = async (userId) => {
        const { data: pending } = await supabase
            .from('skill_coach_tasks')
            .select('*')
            .eq('assigned_to', userId)
            .in('status', ['pending', 'in_progress'])
            .order('created_at', { ascending: false });
        if (pending) setPendingTasks(pending);

        const { data: done } = await supabase
            .from('skill_coach_tasks')
            .select('*')
            .eq('assigned_to', userId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(5);
        if (done) setCompletedTasks(done);
    };

    const startSession = async (bot, type) => {
        setSelectedBot(bot);
        setSessionType(type);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: session, error } = await supabase
            .from('skill_coach_sessions')
            .insert({
                bot_id: bot.id,
                user_id: user.id,
                session_type: type,
                messages: [],
                status: 'active',
            })
            .select()
            .single();

        if (error) { toast.error('Failed to start session'); return; }
        setActiveSession(session);
        await loadTasks(user.id);

        const welcomeMsg = {
            role: 'assistant',
            content: bot.welcome_message || `Hi! I'm ${bot.name}, your ${bot.focus_area} coach. Let's get started!`,
            timestamp: new Date().toISOString(),
        };

        if (type !== 'free_chat') {
            const sessionTypeMeta = SESSION_TYPES.find(s => s.id === type);
            welcomeMsg.content = `${bot.welcome_message || `Hi! I'm ${bot.name}.`}\n\nI see you want to work on **${sessionTypeMeta?.label}**. ${getSessionOpener(bot, type)}`;
        }

        setMessages([welcomeMsg]);
        setView('chat');
        await saveMessages(session.id, [welcomeMsg]);
    };

    const getSessionOpener = (bot, type) => {
        const openers = {
            performance_review: "Let me pull up your recent activity and walk you through what I'm seeing. First — how are you feeling about your performance lately?",
            product_training: "Great choice! Strong product knowledge is the foundation of great selling. What area would you like to cover — features, pricing, competitive positioning, or a specific use case?",
            skill_drill: "Let's sharpen a specific skill. What's felt hardest lately — cold call openers, discovery questions, handling objections, or closing?",
            quiz: "Time to test what you know! I'll ask one question at a time. Don't worry if you get some wrong — that's how we find the gaps. Ready? Here's your first question:\n\nWhat are the three most important questions you should answer in a discovery call?",
            demo_review: "Demos are where deals are won or lost. Let's make sure yours is bulletproof. Tell me — when did you last do a demo, and how did it go?",
            free_chat: "What's on your mind? Ask me anything about sales, your deals, product, or skills.",
        };
        return openers[type] || "How can I help you today?";
    };

    const saveMessages = async (sessionId, msgs) => {
        await supabase
            .from('skill_coach_sessions')
            .update({ messages: msgs })
            .eq('id', sessionId);
    };

    const sendMessage = async () => {
        if (!inputText.trim() || isTyping) return;
        const userText = inputText.trim();
        setInputText('');

        const userMsg = { role: 'user', content: userText, timestamp: new Date().toISOString() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setIsTyping(true);

        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const systemPrompt = buildSystemPrompt(selectedBot, sessionType, {});

            const openaiMessages = [
                { role: 'system', content: systemPrompt },
                ...updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            ];

            const response = await fetch(`${supabaseUrl}/functions/v1/skill-coach-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                body: JSON.stringify({ messages: openaiMessages }),
            });

            let replyText = "I'm here to help! Could you tell me more about what you'd like to work on?";

            if (response.ok) {
                const data = await response.json();
                replyText = data.text || replyText;
            }

            const extractedTasks = extractTasksFromMessage(replyText);
            const cleanedReply = cleanMessageText(replyText);

            const assistantMsg = {
                role: 'assistant',
                content: cleanedReply,
                timestamp: new Date().toISOString(),
                tasks: extractedTasks.length > 0 ? extractedTasks : undefined,
            };

            const finalMessages = [...updatedMessages, assistantMsg];
            setMessages(finalMessages);
            await saveMessages(activeSession.id, finalMessages);

            if (extractedTasks.length > 0 && currentUser) {
                const { data: { user } } = await supabase.auth.getUser();
                for (const task of extractedTasks) {
                    const validTypes = ['quiz', 'roleplay', 'demo_recording', 'reading', 'custom'];
                    const taskType = validTypes.includes(task.task_type) ? task.task_type : 'custom';
                    await supabase.from('skill_coach_tasks').insert({
                        session_id: activeSession.id,
                        bot_id: selectedBot.id,
                        assigned_to: user.id,
                        task_type: taskType,
                        title: task.title,
                        description: task.description,
                        status: 'pending',
                    });
                }
                await loadTasks(user.id);
                toast.success(`${extractedTasks.length} new task${extractedTasks.length > 1 ? 's' : ''} assigned by ${selectedBot.name}`);
            }
        } catch (err) {
            console.error('Coach chat error:', err);
            const fallbackMsg = {
                role: 'assistant',
                content: "I hit a small snag — but I'm still here. Tell me more about what you're working on.",
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, fallbackMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const completeTask = async (taskId) => {
        await supabase
            .from('skill_coach_tasks')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', taskId);
        const { data: { user } } = await supabase.auth.getUser();
        await loadTasks(user.id);
        toast.success('Task marked complete!');
    };

    const endSession = async () => {
        if (activeSession) {
            await supabase
                .from('skill_coach_sessions')
                .update({ status: 'completed', ended_at: new Date().toISOString() })
                .eq('id', activeSession.id);
        }
        setActiveSession(null);
        setMessages([]);
        setSelectedBot(null);
        setSessionType(null);
        setView('bots');
    };

    const getTaskLink = (task) => {
        if (task.task_type === 'roleplay') return createPageUrl('AIRoleplay');
        if (task.task_type === 'demo_recording') return createPageUrl('ProductDemoSetup');
        if (task.task_type === 'reading') return createPageUrl('TrainingLibrary');
        return null;
    };

    if (view === 'chat' && selectedBot) {
        return (
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl">
                            {selectedBot.avatar_emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-slate-900">{selectedBot.name}</h2>
                            <p className="text-xs text-slate-500">{selectedBot.focus_area} · {SESSION_TYPES.find(s => s.id === sessionType)?.label}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={endSession} className="text-slate-500 hover:text-red-500">
                            <X className="w-4 h-4 mr-1" />
                            End Session
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                                        {selectedBot.avatar_emoji}
                                    </div>
                                )}
                                <div className={`max-w-[75%] space-y-2`}>
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-sm'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                                    }`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    {msg.tasks && msg.tasks.length > 0 && (
                                        <div className="space-y-2">
                                            {msg.tasks.map((task, tIdx) => {
                                                const TaskIcon = TASK_TYPE_ICONS[task.task_type] || ClipboardList;
                                                return (
                                                    <div key={tIdx} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                            <TaskIcon className="w-3.5 h-3.5 text-amber-700" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-amber-800">Task Assigned: {task.title}</p>
                                                            <p className="text-xs text-amber-700 mt-0.5">{task.description}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm flex-shrink-0">
                                    {selectedBot.avatar_emoji}
                                </div>
                                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                                    <div className="flex gap-1 items-center h-5">
                                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bg-white border-t border-slate-200 px-6 py-4 flex-shrink-0">
                        <div className="flex gap-3">
                            <Input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                placeholder={`Reply to ${selectedBot.name}...`}
                                className="flex-1"
                                disabled={isTyping}
                            />
                            <Button onClick={sendMessage} disabled={isTyping || !inputText.trim()} className="bg-blue-600 hover:bg-blue-700">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-80 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
                    <div className="px-5 py-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-blue-600" />
                            Your Tasks
                            {pendingTasks.length > 0 && (
                                <span className="ml-auto text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">{pendingTasks.length}</span>
                            )}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {pendingTasks.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No pending tasks</p>
                                <p className="text-xs mt-1">Your coach will assign tasks as you chat</p>
                            </div>
                        ) : (
                            pendingTasks.map(task => {
                                const TaskIcon = TASK_TYPE_ICONS[task.task_type] || ClipboardList;
                                const colorClass = TASK_TYPE_COLORS[task.task_type] || TASK_TYPE_COLORS.custom;
                                const link = getTaskLink(task);
                                return (
                                    <div key={task.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} flex items-center gap-1`}>
                                                <TaskIcon className="w-3 h-3" />
                                                {task.task_type}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800">{task.title}</p>
                                        {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
                                        <div className="flex gap-2">
                                            {link && (
                                                <Link to={link}>
                                                    <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                                                        <Play className="w-3 h-3 mr-1" />
                                                        Start
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-xs h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => completeTask(task.id)}
                                            >
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {completedTasks.length > 0 && (
                            <div className="pt-2">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Completed</p>
                                {completedTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <p className="text-xs text-slate-500 line-through">{task.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-200 space-y-2">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Quick Actions</p>
                        <Link to={createPageUrl('AIRoleplay')}>
                            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                <Mic className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                Start a Roleplay Session
                            </Button>
                        </Link>
                        <Link to={createPageUrl('TrainingLibrary')}>
                            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                <BookOpen className="w-3.5 h-3.5 mr-2 text-green-500" />
                                Browse Training Library
                            </Button>
                        </Link>
                        <Link to={createPageUrl('ProductDemoSetup')}>
                            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                <MonitorPlay className="w-3.5 h-3.5 mr-2 text-teal-500" />
                                Record a Demo
                            </Button>
                        </Link>
                        <Link to={createPageUrl('AgentTrainingProfile')}>
                            <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                                <TrendingUp className="w-3.5 h-3.5 mr-2 text-orange-500" />
                                My Training Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'select-type' && selectedBot) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="max-w-3xl mx-auto">
                    <button onClick={() => { setView('bots'); setSelectedBot(null); }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors">
                        <RotateCcw className="w-4 h-4" />
                        Choose a different coach
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl shadow-lg">
                            {selectedBot.avatar_emoji}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Session with {selectedBot.name}</h1>
                            <p className="text-slate-500">{selectedBot.description}</p>
                        </div>
                    </div>

                    <p className="text-lg font-semibold text-slate-700 mb-4">What would you like to work on?</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {SESSION_TYPES.map(type => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => startSession(selectedBot, type.id)}
                                    className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-5 h-5 ${type.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{type.label}</p>
                                        <p className="text-sm text-slate-500 mt-0.5">{type.desc}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto mt-1 group-hover:text-blue-500 transition-colors" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">SkillCoach</h1>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">AI-Powered</span>
                    </div>
                    <p className="text-slate-500 ml-13">Your personal AI coach — 1-on-1 sessions, performance reviews, quizzes, training, and more.</p>
                </div>

                {pendingTasks.length > 0 && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-800">You have {pendingTasks.length} pending task{pendingTasks.length > 1 ? 's' : ''} from your coach</p>
                            <p className="text-xs text-amber-600 mt-0.5">Start a session to review and complete them</p>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-1">Choose Your Coach</h2>
                    <p className="text-sm text-slate-500 mb-5">Each coach specializes in a different area. Pick the one that matches what you need today.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {bots.map(bot => (
                            <button
                                key={bot.id}
                                onClick={() => { setSelectedBot(bot); setView('select-type'); }}
                                className="group flex flex-col p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all text-left"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
                                        {bot.avatar_emoji}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">{bot.name}</p>
                                        {bot.is_default && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">{bot.focus_area}</p>
                                <p className="text-sm text-slate-600 flex-1">{bot.description}</p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-xs text-slate-400">{bot.personality}</span>
                                    <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                                        Start session
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        ))}

                        {bots.length === 0 && (
                            <div className="col-span-3 text-center py-16 text-slate-400">
                                <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No coaches available yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="rounded-2xl border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-blue-600" />
                                Pending Tasks
                                {pendingTasks.length > 0 && <span className="ml-auto text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{pendingTasks.length}</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {pendingTasks.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">No pending tasks — start a coaching session!</p>
                            ) : (
                                pendingTasks.slice(0, 4).map(task => {
                                    const TaskIcon = TASK_TYPE_ICONS[task.task_type] || ClipboardList;
                                    const link = getTaskLink(task);
                                    return (
                                        <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <TaskIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                            <p className="text-sm text-slate-700 flex-1 truncate">{task.title}</p>
                                            <div className="flex gap-1">
                                                {link && (
                                                    <Link to={link}>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                                                            <Play className="w-3 h-3" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-green-600" onClick={() => completeTask(task.id)}>
                                                    <CheckCircle2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Zap className="w-4 h-4 text-orange-500" />
                                Quick Start
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            {SESSION_TYPES.slice(0, 4).map(type => {
                                const Icon = type.icon;
                                const defaultBot = bots.find(b => b.is_default) || bots[0];
                                return (
                                    <button
                                        key={type.id}
                                        disabled={!defaultBot}
                                        onClick={() => { if (defaultBot) { setSelectedBot(defaultBot); startSession(defaultBot, type.id); } }}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${type.bg} border-transparent hover:border-current hover:shadow-sm disabled:opacity-40`}
                                    >
                                        <Icon className={`w-5 h-5 ${type.color}`} />
                                        <p className="text-xs font-medium text-slate-700">{type.label}</p>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
