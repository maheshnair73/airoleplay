
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DigitalSalesRoom } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Trash2, GripVertical, Loader2, Save, Eye, Palette, Settings,
    Users, LayoutTemplate, Upload, Link, Video, FileText, MessageSquare,
    Sparkles, Moon, Sun, Type, Image as ImageIcon, Contrast, ArrowLeft
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { UploadFile } from '@/api/integrations';
import MutualActionPlan from '../components/sales_rooms/MutualActionPlan';
import ParticipantManager from '../components/sales_rooms/ParticipantManager';
import { Lead } from '@/api/entities'; // New import

const generateUniqueId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const SectionTypeCard = ({ type, title, description, icon: Icon, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
            isSelected
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-slate-200 hover:border-slate-300 bg-white'
        }`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-semibold text-slate-900">{title}</h4>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        </div>
    </div>
);

const SectionEditor = ({ section, onUpdate, onDelete, participants }) => {
    const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const sectionTypes = [
        { type: 'content', title: 'Rich Text', description: 'Text content with HTML formatting', icon: MessageSquare },
        { type: 'document', title: 'PDF Document', description: 'Upload and display PDF files', icon: FileText },
        { type: 'video', title: 'Video', description: 'Embed video content', icon: Video },
        { type: 'mutual_action_plan', title: 'Action Plan', description: 'Interactive task management', icon: LayoutTemplate }
    ];

    const handleFileUpload = async (file) => {
        if (!file) return;

        setIsUploading(true);
        try {
            toast.info(`Uploading ${file.name}...`);
            const { file_url } = await UploadFile({ file });
            onUpdate({ ...section, file_url });
            toast.success('File uploaded successfully!');
        } catch (error) {
            toast.error('File upload failed. Please try again.');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    return (
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                                {sectionTypes.find(t => t.type === section.type)?.title || section.type}
                            </Badge>
                            {section.is_visible ? (
                                <Badge className="bg-green-100 text-green-800 text-xs">Visible</Badge>
                            ) : (
                                <Badge variant="secondary" className="text-xs">Hidden</Badge>
                            )}
                        </div>
                        <Input
                            value={section.title}
                            onChange={(e) => onUpdate({ ...section, title: e.target.value })}
                            placeholder="Section title..."
                            className="text-lg font-semibold border-0 p-0 focus-visible:ring-0 bg-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-slate-500"
                        >
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-6 border-t bg-slate-50/50 pt-6">
                    <div>
                        <Label className="text-sm font-medium text-slate-700 mb-3 block">Section Type</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {sectionTypes.map(typeOption => (
                                <SectionTypeCard
                                    key={typeOption.type}
                                    {...typeOption}
                                    isSelected={section.type === typeOption.type}
                                    onClick={() => onUpdate({ ...section, type: typeOption.type })}
                                />
                            ))}
                        </div>
                    </div>

                    {(section.type === 'video' || section.type === 'document') && (
                        <div>
                            <Label className="text-sm font-medium text-slate-700">File URL or Upload</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={section.file_url || ''}
                                    onChange={(e) => onUpdate({ ...section, file_url: e.target.value })}
                                    placeholder={`Paste URL or click Upload...`}
                                    className="flex-1"
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    accept={section.type === 'document' ? '.pdf' : 'video/*'}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    Upload
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Paste a direct link or upload a {section.type} file.
                            </p>
                        </div>
                    )}

                    {section.type === 'content' && (
                        <div>
                            <Label className="text-sm font-medium text-slate-700">Content</Label>
                            <Textarea
                                placeholder="Enter your content here. HTML is supported for formatting."
                                value={section.content || ''}
                                onChange={(e) => onUpdate({ ...section, content: e.target.value })}
                                className="h-32 mt-2 font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt; for formatting
                            </p>
                        </div>
                    )}

                    {section.type === 'mutual_action_plan' && (
                        <div>
                            <MutualActionPlan
                                section={section}
                                onUpdate={onUpdate}
                                participants={participants}
                                isEditable={true}
                            />
                            {!section.action_items && onUpdate({ ...section, action_items: [] })}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={section.is_visible}
                                onCheckedChange={(checked) => onUpdate({ ...section, is_visible: checked })}
                            />
                            <Label className="text-sm">Visible to prospects</Label>
                        </div>
                        <div className="text-xs text-slate-500">
                            Order: {section.order}
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default function CreateDigitalSalesRoom() {
    const [room, setRoom] = useState({
        room_name: '',
        company_name: '',
        room_url: '',
        lead_id: null, // New field
        status: 'draft',
        password: '',
        expires_at: '', // New field for expiry date
        allow_downloads: true, // New field for download permission
        require_contact_info: false, // New field for contact info requirement
        sections: [],
        customization: {
            brand_color: '#4f46e5',
            logo_url: '',
            banner_url: '',
            font_family: 'Inter',
            theme: 'light',
            welcome_message: '' // New field for welcome message
        },
        participants: [
            { email: 'seller@effy.ai', name: 'Your Name', role: 'seller', company: 'effySales Pro' },
            { email: 'buyer@acme.com', name: 'John Doe (Prospect)', role: 'buyer', company: 'Acme Corp' },
            { email: 'stakeholder@acme.com', name: 'Jane Smith (IT Lead)', role: 'stakeholder', company: 'Acme Corp' },
        ]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [roomId, setRoomId] = useState(null);
    const [sourceLeadId, setSourceLeadId] = useState(null);
    const [sourceLead, setSourceLead] = useState(null);
    const [activeTab, setActiveTab] = useState('content');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        const leadId = params.get('leadId'); // New

        const fetchRoom = async (roomId) => {
            setIsLoading(true);
            setRoomId(roomId);
            try {
                const data = await DigitalSalesRoom.get(roomId);
                setRoom(prev => ({
                    ...prev,
                    ...data,
                    customization: { ...prev.customization, ...(data.customization || {}) },
                    participants: data.participants || prev.participants
                }));

                // If room has a lead_id, fetch the source lead info
                if (data.lead_id) {
                    const leadData = await Lead.get(data.lead_id);
                    setSourceLead(leadData);
                    setSourceLeadId(data.lead_id);
                }
            } catch (err) {
                toast.error("Failed to load sales room.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        const initFromLead = async (leadId) => {
            setIsLoading(true);
            setSourceLeadId(leadId);
            try {
                const lead = await Lead.get(leadId);
                setSourceLead(lead);
                setRoom(prev => {
                    const cleanCompanyName = (lead.company_name || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                    const initialRoomUrl = cleanCompanyName ? `${cleanCompanyName}-deal` : `${generateUniqueId()}-room`;

                    const updatedParticipants = [...prev.participants];
                    if (lead.contact_email && !prev.participants.some(p => p.email === lead.contact_email)) {
                        updatedParticipants.push({
                            email: lead.contact_email,
                            name: lead.contact_name || 'Prospect Contact',
                            role: 'buyer',
                            company: lead.company_name || ''
                        });
                    }

                    return {
                        ...prev,
                        lead_id: lead.id,
                        room_name: `Project with ${lead.company_name || 'Prospect'}`,
                        company_name: lead.company_name || '',
                        room_url: initialRoomUrl,
                        participants: updatedParticipants
                    };
                });
            } catch (err) {
                toast.error("Failed to load lead data.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchRoom(id);
        } else if (leadId) {
            initFromLead(leadId);
        }
    }, [location.search]);

    const handleRoomChange = (field, value) => {
        setRoom(prev => ({ ...prev, [field]: value }));
    };

    const handleParticipantsChange = (newParticipants) => {
        setRoom(prev => ({ ...prev, participants: newParticipants }));
    };

    const handleCustomizationChange = (field, value) => {
        setRoom(prev => ({
            ...prev,
            customization: { ...prev.customization, [field]: value }
        }));
    };

    const addSection = () => {
        const newSection = {
            id: generateUniqueId(),
            title: `New Section ${room.sections.length + 1}`,
            type: 'content', // Default to content, user can change
            content: '',
            file_url: '',
            is_visible: true,
            order: room.sections.length + 1
        };
        setRoom(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    };

    const updateSection = (updatedSection) => {
        setRoom(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === updatedSection.id ? updatedSection : s)
        }));
    };

    const deleteSection = (sectionId) => {
        setRoom(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== sectionId)
        }));
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(room.sections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        const updatedItems = items.map((item, index) => ({ ...item, order: index + 1 }));
        setRoom(prev => ({ ...prev, sections: updatedItems }));
    };

    const handleSave = async () => {
        if (!room.room_name || !room.company_name || !room.room_url) {
            toast.error("Please fill in all required fields");
            setActiveTab('settings'); // Navigate to settings if required fields are missing
            return;
        }

        setIsSaving(true);
        try {
            if (roomId) {
                await DigitalSalesRoom.update(roomId, room);
                toast.success("Sales room updated successfully!");
            } else {
                const newRoom = await DigitalSalesRoom.create(room);
                toast.success("Sales room created successfully!");
                navigate(createPageUrl(`CreateDigitalSalesRoom?id=${newRoom.id}`));
            }
        } catch (error) {
            toast.error("Failed to save sales room.");
            console.error(error);
        }
        setIsSaving(false);
    };

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

    const statusColors = {
        draft: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        archived: 'bg-gray-100 text-gray-800'
    };

    // Google Fonts collection
    const googleFonts = [
        { value: 'Inter', label: 'Inter', category: 'Modern Sans-Serif', preview: 'Clean & Professional' },
        { value: 'Poppins', label: 'Poppins', category: 'Friendly Sans-Serif', preview: 'Friendly & Approachable' },
        { value: 'Roboto', label: 'Roboto', category: 'Google Default', preview: 'Clean & Readable' },
        { value: 'Open Sans', label: 'Open Sans', category: 'Versatile Sans-Serif', preview: 'Highly Readable' },
        { value: 'Lato', label: 'Lato', category: 'Professional Sans-Serif', preview: 'Corporate Friendly' },
        { value: 'Montserrat', label: 'Montserrat', category: 'Modern Display', preview: 'Bold & Modern' },
        { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'Adobe Font', preview: 'Professional' },
        { value: 'Nunito', label: 'Nunito', category: 'Rounded Sans-Serif', preview: 'Soft & Friendly' },
        { value: 'Work Sans', label: 'Work Sans', category: 'Optimized Display', preview: 'Crisp & Clear' },
        { value: 'Raleway', label: 'Raleway', category: 'Elegant Sans-Serif', preview: 'Sophisticated' },
        { value: 'Playfair Display', label: 'Playfair Display', category: 'Elegant Serif', preview: 'Luxury & Elegant' },
        { value: 'Lora', label: 'Lora', category: 'Modern Serif', preview: 'Readable Serif' },
        { value: 'Merriweather', label: 'Merriweather', category: 'Traditional Serif', preview: 'Classic & Trustworthy' },
        { value: 'PT Serif', label: 'PT Serif', category: 'Transitional Serif', preview: 'Academic Style' },
        { value: 'Roboto Mono', label: 'Roboto Mono', category: 'Monospace', preview: 'Technical & Modern' },
        { value: 'Fira Code', label: 'Fira Code', category: 'Code Monospace', preview: 'Developer Friendly' }
    ];

    // Color presets for quick selection
    const colorPresets = [
        { name: 'Corporate Blue', color: '#1E40AF' },
        { name: 'Tech Purple', color: '#7C3AED' },
        { name: 'Success Green', color: '#059669' },
        { name: 'Warm Orange', color: '#EA580C' },
        { name: 'Professional Navy', color: '#1E3A8A' },
        { name: 'Creative Pink', color: '#DB2777' },
        { name: 'Modern Indigo', color: '#4F46E5' },
        { name: 'Trust Teal', color: '#0D9488' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                {sourceLeadId ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            sessionStorage.setItem('selectedLeadId', sourceLeadId);
                                            if (sourceLead) {
                                                sessionStorage.setItem('selectedLeadData', JSON.stringify(sourceLead));
                                            }
                                            navigate(createPageUrl('LeadDetail'));
                                        }}
                                        className="gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to {sourceLead?.contact_name || 'Lead'}
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('DigitalSalesRooms'))}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {roomId ? 'Edit Sales Room' : 'Create Sales Room'}
                                    </h1>
                                    {room.status && (
                                        <Badge className={statusColors[room.status]}>
                                            {room.status}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-slate-600 mt-1">
                                    {sourceLeadId && sourceLead ? (
                                        <>For {sourceLead.contact_name} at {sourceLead.company_name}</>
                                    ) : (
                                        room.room_name || 'Design a collaborative space for your prospects'
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {roomId && (
                                <Button variant="outline" asChild className="gap-2">
                                    <a href={createPageUrl(`SalesRoomPublic?url=${room.room_url}`)} target="_blank" rel="noopener noreferrer">
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </a>
                                </Button>
                            )}
                            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 gap-2">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-sm">
                        <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <LayoutTemplate className="w-4 h-4" />
                            Content
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <Settings className="w-4 h-4" />
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="branding" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <Palette className="w-4 h-4" />
                            Branding
                        </TabsTrigger>
                        <TabsTrigger value="participants" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <Users className="w-4 h-4" />
                            Participants
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-slate-900">
                                            <LayoutTemplate className="w-5 h-5 text-blue-600" />
                                            Content Sections
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Build your sales room with drag-and-drop sections. Reorder them as needed.
                                        </CardDescription>
                                    </div>
                                    <Button onClick={addSection} className="bg-blue-600 hover:bg-blue-700 gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Section
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {room.sections.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                        <LayoutTemplate className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No sections yet</h3>
                                        <p className="text-slate-500 mb-6">Start building your sales room by adding your first section</p>
                                        <Button onClick={addSection} className="bg-blue-600 hover:bg-blue-700 gap-2">
                                            <Plus className="w-4 h-4" />
                                            Create First Section
                                        </Button>
                                    </div>
                                ) : (
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="sections">
                                            {(provided) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                                    {room.sections?.sort((a,b) => a.order - b.order).map((section, index) => (
                                                        <Draggable key={section.id} draggableId={section.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`flex items-start gap-3 ${snapshot.isDragging ? 'opacity-75' : ''}`}
                                                                >
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className="pt-6 cursor-grab hover:cursor-grabbing"
                                                                    >
                                                                        <GripVertical className="w-5 h-5 text-slate-400" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <SectionEditor
                                                                            section={section}
                                                                            onUpdate={updateSection}
                                                                            onDelete={() => deleteSection(section.id)}
                                                                            participants={room.participants}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <Settings className="w-5 h-5 text-blue-600" />
                                    Room Configuration
                                </CardTitle>
                                <CardDescription>Basic settings and security for your digital sales room</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="max-w-2xl space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Room Name *</Label>
                                            <Input
                                                value={room.room_name}
                                                onChange={(e) => handleRoomChange('room_name', e.target.value)}
                                                placeholder="e.g., Project Apollo"
                                                className="mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Company Name *</Label>
                                            <Input
                                                value={room.company_name}
                                                onChange={(e) => handleRoomChange('company_name', e.target.value)}
                                                placeholder="e.g., Acme Corporation"
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Room URL *</Label>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-l-md border border-r-0">
                                                salesroom.co/
                                            </span>
                                            <Input
                                                value={room.room_url}
                                                onChange={(e) => handleRoomChange('room_url', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                                                placeholder="project-apollo"
                                                className="rounded-l-none"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Only lowercase letters, numbers, and hyphens allowed</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Status</Label>
                                            <Select value={room.status} onValueChange={(value) => handleRoomChange('status', value)}>
                                                <SelectTrigger className="mt-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                            Draft - Work in progress
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="active">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            Active - Live and accessible
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="archived">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                            Archived - Read-only
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">Expiry Date (Optional)</Label>
                                            <Input
                                                type="datetime-local"
                                                value={room.expires_at ? new Date(room.expires_at).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => handleRoomChange('expires_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                                className="mt-2"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Room will be inaccessible after this date</p>
                                        </div>
                                    </div>

                                    {/* Security Settings */}
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Security & Access Control</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700">Password Protection (Optional)</Label>
                                                <Input
                                                    type="password"
                                                    value={room.password}
                                                    onChange={(e) => handleRoomChange('password', e.target.value)}
                                                    placeholder="Enter a password to protect this room"
                                                    className="mt-2"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">Visitors will need this password to access the room</p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="text-sm font-medium text-slate-700">Require Contact Information</Label>
                                                    <p className="text-xs text-slate-500 mt-1">Visitors must provide their name and email before accessing</p>
                                                </div>
                                                <Switch
                                                    checked={room.require_contact_info}
                                                    onCheckedChange={(checked) => handleRoomChange('require_contact_info', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="text-sm font-medium text-slate-700">Allow Downloads</Label>
                                                    <p className="text-xs text-slate-500 mt-1">Visitors can download documents and files</p>
                                                </div>
                                                <Switch
                                                    checked={room.allow_downloads}
                                                    onCheckedChange={(checked) => handleRoomChange('allow_downloads', checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Welcome Message */}
                                    <div className="border-t pt-6">
                                        <Label className="text-sm font-medium text-slate-700">Custom Welcome Message</Label>
                                        <Textarea
                                            value={room.customization.welcome_message}
                                            onChange={(e) => handleCustomizationChange('welcome_message', e.target.value)}
                                            placeholder="Enter a personalized welcome message for your visitors..."
                                            className="mt-2"
                                            rows={3}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">This message will appear in the room header and welcome screen</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="branding" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Editor Panel - 3/4 width */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Colors Section */}
                                <Card className="shadow-sm">
                                    <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                                        <CardTitle className="flex items-center gap-2 text-slate-900">
                                            <Palette className="w-5 h-5 text-blue-600" />
                                            Brand Colors & Theme
                                        </CardTitle>
                                        <CardDescription>Choose your brand colors and theme</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Primary Brand Color */}
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                                                    Primary Brand Color
                                                </Label>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <input
                                                        type="color"
                                                        value={room.customization.brand_color}
                                                        onChange={(e) => handleCustomizationChange('brand_color', e.target.value)}
                                                        className="w-12 h-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={room.customization.brand_color}
                                                        onChange={(e) => handleCustomizationChange('brand_color', e.target.value)}
                                                        className="font-mono text-sm flex-1"
                                                        placeholder="#4f46e5"
                                                    />
                                                </div>

                                                {/* Color Presets */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {colorPresets.map((preset, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleCustomizationChange('brand_color', preset.color)}
                                                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all hover:shadow-sm text-left ${
                                                                room.customization.brand_color === preset.color
                                                                    ? 'border-slate-400 bg-slate-50'
                                                                    : 'border-slate-200'
                                                            }`}
                                                        >
                                                            <div
                                                                className="w-4 h-4 rounded-full border border-slate-200 flex-shrink-0"
                                                                style={{ backgroundColor: preset.color }}
                                                            />
                                                            <span className="text-xs text-slate-600 truncate">
                                                                {preset.name}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Theme Selection */}
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700 mb-3 block">
                                                    Color Theme
                                                </Label>
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={() => handleCustomizationChange('theme', 'light')}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all w-full ${
                                                            room.customization.theme === 'light'
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <Sun className="w-5 h-5" />
                                                        <div className="text-left">
                                                            <div className="font-medium">Light Theme</div>
                                                            <div className="text-xs text-slate-500">Clean & Professional</div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCustomizationChange('theme', 'dark')}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all w-full ${
                                                            room.customization.theme === 'dark'
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <Moon className="w-5 h-5" />
                                                        <div className="text-left">
                                                            <div className="font-medium">Dark Theme</div>
                                                            <div className="text-xs text-slate-500">Modern & Sleek</div>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Typography Section */}
                                <Card className="shadow-sm">
                                    <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                                        <CardTitle className="flex items-center gap-2 text-slate-900">
                                            <Type className="w-5 h-5 text-purple-600" />
                                            Typography
                                        </CardTitle>
                                        <CardDescription>Choose the perfect font for your brand</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Label className="text-sm font-medium text-slate-700 mb-3 block">
                                            Font Family
                                        </Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                                            {googleFonts.map((font) => (
                                                <button
                                                    key={font.value}
                                                    onClick={() => handleCustomizationChange('font_family', font.value)}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                                                        room.customization.font_family === font.value
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div
                                                            className="font-medium text-slate-900 mb-1 truncate"
                                                            style={{ fontFamily: font.value }}
                                                        >
                                                            {font.label}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{font.category}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Media Assets Section */}
                                <Card className="shadow-sm">
                                    <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
                                        <CardTitle className="flex items-center gap-2 text-slate-900">
                                            <ImageIcon className="w-5 h-5 text-green-600" />
                                            Brand Assets
                                        </CardTitle>
                                        <CardDescription>Upload your logo and banner images</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                                    Logo URL
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={room.customization.logo_url}
                                                        onChange={(e) => handleCustomizationChange('logo_url', e.target.value)}
                                                        placeholder="https://your-company.com/logo.png"
                                                        className="flex-1"
                                                    />
                                                    <Button variant="outline" size="icon">
                                                        <Upload className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    PNG format, transparent background recommended
                                                </p>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                                    Banner Image URL
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={room.customization.banner_url}
                                                        onChange={(e) => handleCustomizationChange('banner_url', e.target.value)}
                                                        placeholder="https://your-company.com/banner.jpg"
                                                        className="flex-1"
                                                    />
                                                    <Button variant="outline" size="icon">
                                                        <Upload className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    1200x300px, JPG or PNG format recommended
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Live Preview Panel - 1/4 width on the RIGHT */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-24">
                                    <Card className="shadow-lg">
                                        <CardHeader className="border-b">
                                            <CardTitle className="flex items-center gap-2 text-slate-900 text-sm">
                                                <Sparkles className="w-4 h-4 text-amber-500" />
                                                Live Preview
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
                                                <div
                                                    className={`p-4 ${room.customization.theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                                                    style={{ fontFamily: room.customization.font_family }}
                                                >
                                                    {room.customization.logo_url && (
                                                        <img
                                                            src={room.customization.logo_url}
                                                            alt="Logo Preview"
                                                            className="h-6 mb-3 object-contain"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <h3 className={`text-sm font-bold mb-2 ${
                                                        room.customization.theme === 'dark' ? 'text-white' : 'text-slate-900'
                                                    }`}>
                                                        {room.customization.welcome_message || room.room_name || 'Your Sales Room'}
                                                    </h3>
                                                    <p className={`mb-3 text-xs ${
                                                        room.customization.theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                                    }`}>
                                                        {room.customization.welcome_message ? `This is a custom welcome message for your guests.` : `Welcome to our collaboration space with ${room.company_name || 'your company'}.`}
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        className="text-white text-xs px-3 py-1 h-7"
                                                        style={{ backgroundColor: room.customization.brand_color }}
                                                    >
                                                        Branded Button
                                                    </Button>
                                                    <div className={`mt-3 p-2 rounded text-xs ${
                                                        room.customization.theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        Sample content section with your chosen typography and colors.
                                                    </div>
                                                </div>
                                                {room.customization.banner_url && (
                                                    <img
                                                        src={room.customization.banner_url}
                                                        alt="Banner Preview"
                                                        className="w-full h-16 object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {/* Font Preview */}
                                            <div className="p-3 border-t bg-slate-50">
                                                <h4 className="text-xs font-semibold text-slate-700 mb-2">Font Preview</h4>
                                                <div
                                                    className="text-slate-900"
                                                    style={{ fontFamily: room.customization.font_family }}
                                                >
                                                    <p className="text-sm font-bold mb-1">Heading Text</p>
                                                    <p className="text-xs mb-1">Regular paragraph text.</p>
                                                    <p className="text-xs text-slate-600">Small text notes.</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="participants" className="space-y-6">
                        <ParticipantManager
                            participants={room.participants || []}
                            onUpdateParticipants={handleParticipantsChange}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
