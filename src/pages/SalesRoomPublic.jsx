
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DigitalSalesRoom } from '@/api/entities';
import { SalesRoomEngagement } from '@/api/entities';
import { SalesRoomMessage } from '@/api/entities';
import { useLocation } from 'react-router-dom';
import { Loader2, Video, FileText, MessageSquare, LayoutTemplate, Users, Play, CheckCircle, Building2, Lock, Clock, Eye, Download, Share2, MessageCircle, Send, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import MutualActionPlan from '../components/sales_rooms/MutualActionPlan';
import { format, isAfter } from 'date-fns';
import { calculateEngagementScore } from '@/api/functions'; // Included as per outline, though not used directly in this implementation of score weights.

// Password Protection Component
const PasswordGate = ({ onAccess }) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            onAccess(password);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <CardTitle className="text-2xl">Access Required</CardTitle>
                    <p className="text-gray-600">This sales room is password protected</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Access Sales Room'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

// New, more powerful analytics hook
const useAnalytics = (roomId, isPublicView = false) => {
    const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    // Removed sectionStartTime and currentSectionId as they are not used in the new event-based logging, focusing on specific events.

    const logEngagementEvent = useCallback(async (eventType, details = {}) => {
        if (!isPublicView || !roomId) return; // Only log events from the public view and if room ID is available

        const SCORE_WEIGHTS = {
            room_viewed: 1,
            section_viewed: 3,
            video_played: 5,
            video_progress: 2,
            video_completed: 15,
            document_downloaded: 20,
            comment_added: 12,
            map_item_completed: 18,
        };

        const intentScore = SCORE_WEIGHTS[eventType] || 0;

        try {
            await SalesRoomEngagement.create({
                room_id: roomId,
                session_id: sessionId.current,
                event_type: eventType,
                event_details: details,
                intent_score: intentScore,
                // In a real scenario, you'd capture user info if they logged in
                visitor_name: "Anonymous Visitor",
                visitor_email: "visitor@example.com" // Placeholder, would be captured from visitor form or cookie
            });

            // Trigger a high-intent alert for significant actions
            if (intentScore >= 10) {
                toast.info(`🔥 High-Intent Action Detected`, {
                    description: `A prospect just performed a key action: ${eventType.replace(/_/g, ' ')}.`,
                });
            }

        } catch (error) {
            console.error(`Failed to log engagement event (${eventType}):`, error);
        }
    }, [roomId, isPublicView]); // Dependency array for useCallback

    useEffect(() => {
        if (roomId && isPublicView) {
            logEngagementEvent('room_viewed');
        }
    }, [roomId, isPublicView, logEngagementEvent]); // Added logEngagementEvent to dependency array

    return { logEngagementEvent };
};

// Comments Panel Component
// Updated to accept logEngagementEvent prop
const CommentsPanel = ({ roomId, sectionId, isOpen, onToggle, logEngagementEvent }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadMessages = useCallback(async () => {
        try {
            const roomMessages = await SalesRoomMessage.filter({
                room_id: roomId,
                related_section: sectionId || 'general'
            });
            setMessages(roomMessages);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, [roomId, sectionId]);

    useEffect(() => {
        if (isOpen && sectionId) {
            loadMessages();
        }
    }, [isOpen, sectionId, loadMessages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsLoading(true);
        try {
            await SalesRoomMessage.create({
                room_id: roomId,
                sender_email: 'visitor@example.com', // Would be actual visitor email
                sender_name: 'Anonymous Visitor',
                sender_role: 'buyer',
                message: newMessage,
                message_type: 'comment',
                related_section: sectionId || 'general'
            });

            setNewMessage('');
            loadMessages(); // Reload messages
            toast.success('Message sent!');
            if (logEngagementEvent) { // Check if prop is provided
                logEngagementEvent('comment_added', { section_id: sectionId, message: newMessage }); // Log comment event
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="border-t bg-white p-4">
            <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
                {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{message.sender_name}</span>
                                <Badge variant="outline" className="text-xs">
                                    {message.sender_role}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                    {format(new Date(message.created_date), 'MMM d, h:mm a')}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700">{message.message}</p>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">
                        No comments yet. Start the conversation!
                    </p>
                )}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Add a comment or question..."
                    className="flex-1"
                />
                <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            </form>
        </div>
    );
};

export default function SalesRoomPublic() {
    const [room, setRoom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [visitorInfo, setVisitorInfo] = useState({ name: '', email: '', company: '' });
    const [showVisitorForm, setShowVisitorForm] = useState(false);

    const location = useLocation();
    const { logEngagementEvent } = useAnalytics(room?.id, true); // Updated useAnalytics call
    const videoProgressRef = useRef({}); // New ref for video progress

    useEffect(() => {
        const fetchRoom = async () => {
            const params = new URLSearchParams(location.search);
            const url = params.get('url');
            if (!url) {
                setError("Sales Room URL not provided.");
                setIsLoading(false);
                return;
            }

            try {
                const rooms = await DigitalSalesRoom.filter({ room_url: url });
                if (rooms.length > 0) {
                    const fetchedRoom = rooms[0];

                    // Check if room is expired
                    if (fetchedRoom.expires_at && isAfter(new Date(), new Date(fetchedRoom.expires_at))) {
                        setError("This sales room has expired.");
                        setIsLoading(false);
                        return;
                    }

                    setRoom(fetchedRoom);

                    // Check access requirements
                    if (fetchedRoom.password) {
                        setHasAccess(false);
                    } else if (fetchedRoom.require_contact_info) {
                        setShowVisitorForm(true);
                        setHasAccess(false);
                    } else {
                        setHasAccess(true);
                    }

                    // Set the initial active section to the first visible one
                    const firstVisibleSection = fetchedRoom.sections
                        ?.filter(s => s.is_visible)
                        .sort((a, b) => a.order - b.order)[0];

                    if (firstVisibleSection) {
                        setActiveSectionId(firstVisibleSection.id);
                    }
                } else {
                    setError("Sales Room not found.");
                }
            } catch (err) {
                console.error("Failed to load sales room:", err);
                setError("Failed to load sales room.");
            }
            setIsLoading(false);
        };
        fetchRoom();
    }, [location.search]);

    const handlePasswordAccess = (enteredPassword) => {
        if (enteredPassword === room.password) {
            setHasAccess(true);
            toast.success('Access granted!');
        } else {
            toast.error('Incorrect password');
        }
    };

    const handleVisitorInfoSubmit = (e) => {
        e.preventDefault();
        if (visitorInfo.name && visitorInfo.email) {
            setHasAccess(true);
            setShowVisitorForm(false);
            toast.success('Welcome! You now have access to this sales room.');
            // Optionally, log visitor info submission as an engagement event
            // logEngagementEvent('visitor_info_submitted', { name: visitorInfo.name, email: visitorInfo.email, company: visitorInfo.company });
        }
    };

    const handleSectionClick = (section) => {
        setActiveSectionId(section.id);
        // The section_viewed event is now handled by the useEffect below
    };

    const handleNextSection = () => {
        const visibleSections = room?.sections?.filter(s => s.is_visible).sort((a, b) => a.order - b.order) || [];
        const currentIndex = visibleSections.findIndex(s => s.id === activeSectionId);
        if (currentIndex > -1 && currentIndex < visibleSections.length - 1) {
            const nextSection = visibleSections[currentIndex + 1];
            setActiveSectionId(nextSection.id);
            // The section_viewed event for the next section is handled by the useEffect below
            toast.info(`Moving to: ${nextSection.title}`);
        }
    };

    const handleSectionUpdate = async (updatedSection) => {
        if (!room) return;

        const updatedSections = room.sections.map(s =>
            s.id === updatedSection.id ? updatedSection : s
        );

        const updatedRoom = { ...room, sections: updatedSections };
        setRoom(updatedRoom);

        try {
            await DigitalSalesRoom.update(room.id, { sections: updatedSections });
            toast.success("Changes saved!");
        } catch (error) {
            toast.error("Failed to save changes.");
        }
    };

    const handleVideoTimeUpdate = (e, sectionId) => {
        const video = e.target;
        const percentage = (video.currentTime / video.duration) * 100;

        // Track progress in 25% increments (e.g., 25%, 50%, 75%)
        for (let i = 25; i <= 75; i += 25) {
            // Ensure videoProgressRef.current is initialized for this section
            if (!videoProgressRef.current[sectionId]) {
                videoProgressRef.current[sectionId] = {};
            }
            if (percentage >= i && !videoProgressRef.current[sectionId][i]) {
                videoProgressRef.current[sectionId][i] = true;
                logEngagementEvent('video_progress', { section_id: sectionId, percentage_watched: i, duration: video.duration });
            }
        }
    };

    // Helper function to render section content
    const renderSectionContent = (section) => {
        const theme = room.customization?.theme || 'light';

        switch (section.type) {
            case 'content':
                return (
                    <div
                        dangerouslySetInnerHTML={{ __html: section.content }}
                        className={`prose prose-lg max-w-none ${theme === 'dark' ? 'dark:prose-invert' : ''}`}
                    />
                );
            case 'video':
                return section.file_url ? (
                    <div className="aspect-w-16 aspect-h-9 w-full">
                        <video
                            src={section.file_url}
                            controls
                            autoPlay
                            className="w-full rounded-lg"
                            onPlay={() => logEngagementEvent('video_played', { section_id: section.id, section_title: section.title })}
                            onTimeUpdate={(e) => handleVideoTimeUpdate(e, section.id)}
                            onEnded={() => {
                                logEngagementEvent('video_completed', { section_id: section.id, section_title: section.title });
                                handleNextSection();
                            }}
                        />
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Video not available</p>
                );
            case 'document':
                return section.file_url ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                Version {section.file_version || '1.0'}
                            </span>
                            {room.allow_downloads && (
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={section.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => logEngagementEvent('document_downloaded', { section_id: section.id, section_title: section.title, file_url: section.file_url })}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </a>
                                </Button>
                            )}
                        </div>
                        <div className="h-[600px] w-full">
                            <iframe
                                src={section.file_url}
                                className="w-full h-full rounded-lg border"
                                title={section.title}
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Document not available</p>
                );
            case 'mutual_action_plan':
                return (
                    <MutualActionPlan
                        section={section}
                        onUpdate={handleSectionUpdate}
                        participants={room.participants || []}
                        isEditable={true}
                        // Pass logEngagementEvent for internal MAP item completion
                        onItemCompleted={(itemId, itemTitle) => logEngagementEvent('map_item_completed', { section_id: section.id, item_id: itemId, item_title: itemTitle })}
                    />
                );
            default:
                return <p className="text-center text-gray-500 py-8">Content type not supported</p>;
        }
    };

    // Log section_viewed when activeSection changes
    useEffect(() => {
        if (activeSection) {
            logEngagementEvent('section_viewed', {
                section_id: activeSection.id,
                section_title: activeSection.title
            });
        }
    }, [activeSection, logEngagementEvent]); // Depend on activeSection and logEngagementEvent

    // Loading state
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading sales room...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-100">
                <p className="text-slate-500">Sales room not found.</p>
            </div>
        );
    }

    // Password protection
    if (room.password && !hasAccess) {
        return <PasswordGate onAccess={handlePasswordAccess} />;
    }

    // Visitor information form
    if (room.require_contact_info && showVisitorForm && !hasAccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl">Welcome!</CardTitle>
                        <p className="text-gray-600">Please provide your information to access this sales room</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVisitorInfoSubmit} className="space-y-4">
                            <Input
                                placeholder="Your Name *"
                                value={visitorInfo.name}
                                onChange={(e) => setVisitorInfo({...visitorInfo, name: e.target.value})}
                                required
                            />
                            <Input
                                type="email"
                                placeholder="Email Address *"
                                value={visitorInfo.email}
                                onChange={(e) => setVisitorInfo({...visitorInfo, email: e.target.value})}
                                required
                            />
                            <Input
                                placeholder="Company Name"
                                value={visitorInfo.company}
                                onChange={(e) => setVisitorInfo({...visitorInfo, company: e.target.value})}
                            />
                            <Button type="submit" className="w-full">
                                Access Sales Room
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const customization = room.customization || {};
    const theme = customization.theme || 'light';
    const visibleSections = room.sections?.filter(s => s.is_visible).sort((a, b) => a.order - b.order) || [];
    const activeSection = visibleSections.find(s => s.id === activeSectionId);

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
             style={{ fontFamily: customization.font_family || 'Inter' }}>

            {/* Header */}
            <header className={`sticky top-0 z-50 border-b shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo Section */}
                        <div className="flex items-center gap-4">
                            {customization.logo_url ? (
                                <img
                                    src={customization.logo_url}
                                    alt={`${room.company_name} Logo`}
                                    className="h-8 w-auto object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        const fallback = e.target.nextElementSibling;
                                        if (fallback) fallback.style.display = 'block';
                                    }}
                                />
                            ) : null}

                            <div className={`font-bold text-lg ${customization.logo_url ? 'hidden' : 'block'}`}
                                 style={{ color: customization.brand_color || '#4f46e5' }}>
                                {room.company_name}
                            </div>
                        </div>

                        {/* Room Title */}
                        <div className="flex-1 text-center">
                            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {room.room_name}
                            </h1>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {customization.welcome_message || `A collaborative space for ${room.company_name}`}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowComments(!showComments)}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Comments
                            </Button>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    Live
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Banner Image */}
            {customization.banner_url && (
                <div className="w-full h-32 sm:h-48 lg:h-64 overflow-hidden">
                    <img
                        src={customization.banner_url}
                        alt="Banner"
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.parentElement.style.display = 'none'}
                    />
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar - Content Hub */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-24 space-y-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>

                            {/* Content Hub */}
                            <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: customization.brand_color || '#4f46e5' }}></div>
                                    Content Hub
                                </h2>
                                <nav className="space-y-2">
                                    {visibleSections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSectionClick(section)}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                                                activeSectionId === section.id
                                                    ? 'text-white shadow-md'
                                                    : theme === 'dark'
                                                        ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                                                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                                            }`}
                                            style={{
                                                backgroundColor: activeSectionId === section.id ? customization.brand_color || '#4f46e5' : 'transparent'
                                            }}
                                        >
                                            {section.type === 'video' && <Play className="w-4 h-4" />}
                                            {section.type === 'document' && <FileText className="w-4 h-4" />}
                                            {section.type === 'mutual_action_plan' && <CheckCircle className="w-4 h-4" />}
                                            {section.type === 'content' && <MessageSquare className="w-4 h-4" />}
                                            <div className="flex-1">
                                                <span className="font-medium block">{section.title}</span>
                                                {section.view_count > 0 && (
                                                    <span className="text-xs opacity-70">
                                                        {section.view_count} views
                                                    </span>
                                                )}
                                            </div>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Participants */}
                            {room.participants && room.participants.length > 0 && (
                                <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5" style={{ color: customization.brand_color || '#4f46e5' }} />
                                        Participants
                                    </h2>
                                    <div className="space-y-3">
                                        {room.participants.map((participant, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                                    {participant.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                        {participant.name}
                                                    </p>
                                                    <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {participant.role === 'buyer' && '👤 Buyer'}
                                                        {participant.role === 'seller' && '💼 Seller'}
                                                        {participant.role === 'stakeholder' && '🤝 Stakeholder'}
                                                        {participant.company && ` • ${participant.company}`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Frame */}
                    <div className="lg:col-span-3">
                        {activeSection ? (
                            <div className={`rounded-xl border shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                {/* Section Header */}
                                <div className="flex items-center justify-between p-6 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: customization.brand_color || '#4f46e5' }}></div>
                                        <div>
                                            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                {activeSection.title}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {activeSection.type.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                                {activeSection.file_version && (
                                                    <Badge variant="outline" className="text-xs">
                                                        v{activeSection.file_version}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowComments(!showComments)}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Discuss
                                    </Button>
                                </div>

                                {/* Section Content */}
                                <div className="p-6">
                                    {renderSectionContent(activeSection)}
                                </div>

                                {/* Comments Panel */}
                                <CommentsPanel
                                    roomId={room.id}
                                    sectionId={activeSection.id}
                                    isOpen={showComments}
                                    onToggle={() => setShowComments(!showComments)}
                                    logEngagementEvent={logEngagementEvent} // Pass logEngagementEvent to CommentsPanel
                                />
                            </div>
                        ) : (
                            /* Welcome Message */
                            <div className={`rounded-xl p-12 border text-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                                     style={{ backgroundColor: (customization.brand_color || '#4f46e5') + '20' }}>
                                    <Building2 className="w-8 h-8" style={{ color: customization.brand_color || '#4f46e5' }} />
                                </div>
                                <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Welcome to {room.room_name}
                                </h2>
                                <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                                    {customization.welcome_message || `This is your collaborative space with ${room.company_name}. Select an item from the Content Hub to begin.`}
                                </p>
                                <div className="flex justify-center gap-4">
                                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium">Interactive Content</p>
                                    </div>
                                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <MessageCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium">Real-time Comments</p>
                                    </div>
                                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium">Team Collaboration</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className={`border-t mt-16 py-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Powered by effySales Pro Digital Sales Rooms
                            </span>
                        </div>
                        {room.updated_date && (
                             <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Last updated: {format(new Date(room.updated_date), 'MMM d, yyyy')}
                            </div>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
