
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { UploadCloud, FileText, Loader2, ArrowLeft, Users, Link as LinkIcon, Settings, Tag, Target, Building, Mail, User as UserIcon, Eye, Save, Clock, Download, PenSquare, Sparkles } from 'lucide-react'; // Added Sparkles
import { Document } from '@/api/entities';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { generateThumbnail } from '@/api/functions'; // Import the new function
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from '@/components/documents/RichTextEditor';


export default function CreateDocument() {
    const [documentData, setDocumentData] = useState({
        id: null,
        document_name: '',
        document_type: 'proposal',
        recipient_name: '',
        recipient_email: '',
        company_name: '',
        lead_id: null,
        deal_id: null,
        approver_email: null,
        notes: '',
        tags: [],
        file_url: '',
        thumbnail_url: '',
        status: 'draft',
        allow_download: true,
        require_email: false,
        customization: {
            brand_color: '#4f46e5',
            logo_url: ''
        },
        content_type: 'pdf', // New field (will now represent any uploaded file)
        editor_content: '', // New field
    });

    const [tagsString, setTagsString] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [allLeads, setAllLeads] = useState([]);
    const [allDeals, setAllDeals] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const navigate = useNavigate();
    const location = useLocation();

    const documentId = new URLSearchParams(location.search).get('id');
    const isEditing = Boolean(documentId);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Fetch essential data first
                const [user, leads] = await Promise.all([
                    User.me(),
                    Lead.list().catch(() => [])
                ]);
                
                setCurrentUser(user);
                setAllLeads(leads);
                setAllDeals([]); // No deals to load

                // Try to fetch users for approver dropdown (even if UI removed, data might be needed)
                try {
                    const usersList = await User.list();
                    setUsers(usersList);
                } catch (usersError) {
                    console.log('Could not fetch users list:', usersError.message);
                    setUsers([]);
                }

                if (isEditing && documentId) {
                    try {
                        const existingDoc = await Document.get(documentId);
                        
                        // Ownership Check
                        if (existingDoc.created_by === user.email) {
                            setIsOwner(true);
                        } else {
                            setIsOwner(false);
                            toast.error("Access Denied: You can only edit documents you have created.");
                            navigate(createPageUrl('Documents'));
                            return;
                        }

                        setDocumentData({
                            id: existingDoc.id,
                            document_name: existingDoc.document_name || '',
                            document_type: existingDoc.document_type || 'proposal',
                            content_type: existingDoc.content_type || 'pdf', // New field
                            editor_content: existingDoc.editor_content || '', // New field
                            recipient_name: existingDoc.recipient_name || '',
                            recipient_email: existingDoc.recipient_email || '',
                            company_name: existingDoc.company_name || '',
                            lead_id: existingDoc.lead_id || null,
                            deal_id: existingDoc.deal_id || null,
                            approver_email: existingDoc.approver_email || null,
                            notes: existingDoc.notes || '',
                            tags: existingDoc.tags || [],
                            file_url: existingDoc.file_url || '',
                            thumbnail_url: existingDoc.thumbnail_url || '',
                            status: existingDoc.status || 'draft',
                            allow_download: existingDoc.allow_download !== false,
                            require_email: existingDoc.require_email || false,
                            customization: existingDoc.customization || { brand_color: '#4f46e5', logo_url: '' }
                        });
                        
                        if (existingDoc.tags) {
                            setTagsString(existingDoc.tags.join(', '));
                        }
                        
                        // If it's a file document, set preview URL
                        if (existingDoc.content_type === 'pdf' && existingDoc.file_url) {
                            setPreviewUrl(existingDoc.file_url);
                        } else if (existingDoc.content_type === 'rich_text') {
                            // When editing a rich text doc, ensure the right content type is active
                            setActiveTab('details'); // Reset to a common tab
                        }
                        
                    } catch (docError) {
                        console.error('Error loading document:', docError);
                        toast.error('Document not found or access denied.');
                        navigate(createPageUrl('Documents'));
                        return;
                    }
                } else {
                    setIsOwner(true);
                }
                
            } catch (error) {
                console.error('Error loading essential data:', error);
                toast.error('Failed to load required data. Please try refreshing the page.');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [documentId, isEditing, navigate]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const allowedTypes = [
                'application/pdf',
                'application/msword', // .doc
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
                'application/vnd.ms-powerpoint', // .ppt
                'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
                'application/vnd.ms-excel', // .xls
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
            ];
            
            const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
            const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
            
            if (allowedTypes.includes(selectedFile.type) || allowedExtensions.includes(fileExtension)) {
                setFile(selectedFile);
                if (!documentData.document_name) {
                    // Remove file extension from document name
                    const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
                    setDocumentData(prev => ({
                        ...prev,
                        document_name: nameWithoutExt
                    }));
                }
                
                const url = URL.createObjectURL(selectedFile);
                setPreviewUrl(url);
            } else {
                toast.error('Please upload a valid document file (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX)');
                setFile(null);
                setPreviewUrl('');
            }
        }
    };

    const handleLeadChange = (leadId) => {
        const selectedLead = allLeads.find(lead => lead.id === leadId);
        if (selectedLead) {
            setDocumentData(prev => ({
                ...prev,
                lead_id: leadId,
                recipient_name: selectedLead.contact_name || '',
                recipient_email: selectedLead.contact_email || '',
                company_name: selectedLead.company_name || ''
            }));
        } else {
            setDocumentData(prev => ({ ...prev, lead_id: null, recipient_name: '', recipient_email: '', company_name: '' }));
        }
    };

    const handleDealChange = (dealId) => {
        // Since Deal entity doesn't exist, just clear fields
        setDocumentData(prev => ({ ...prev, deal_id: null }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        toast.info("Attempting to save document...");
    
        if (!documentData.document_name?.trim()) {
            toast.error('Please enter a document name');
            return;
        }

        // For file upload types, ensure a file is present on create or if changing the file
        if (documentData.content_type === 'pdf' && !isEditing && !file && !documentData.file_url) {
            toast.error('A document file is required for this document type.');
            return;
        }
    
        setIsSaving(true);
        try {
            let finalFileUrl = documentData.file_url;
            let finalThumbnailUrl = documentData.thumbnail_url;
            
            if (documentData.content_type === 'pdf' && file) { // 'pdf' content_type now means "uploaded file"
                toast.info("Uploading file...");
                setIsUploading(true);
                const uploadResult = await UploadFile({ file });
                if (!uploadResult || !uploadResult.file_url) {
                    throw new Error("File upload failed or did not return a URL.");
                }
                finalFileUrl = uploadResult.file_url;
                
                // Use a generic placeholder initially
                const uploadedFileType = file.name.toLowerCase().split('.').pop();
                finalThumbnailUrl = `https://placehold.co/300x400/e0f2f7/0288d1?text=${uploadedFileType.toUpperCase()}`;
                
                setIsUploading(false);
            }
    
            if (documentData.content_type === 'pdf' && !finalFileUrl && !isEditing) { 
                toast.error("A document file is required. Please upload a file.");
                setIsSaving(false);
                return;
            }
            
            // For rich_text, clear file-related fields
            if (documentData.content_type === 'rich_text') {
                finalFileUrl = null;
                finalThumbnailUrl = `https://placehold.co/300x400/E9D5FF/4C1D95?text=TEXT`;
            }


            const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    
            const payload = {
                document_name: documentData.document_name.trim(),
                document_type: documentData.document_type,
                content_type: documentData.content_type,
                editor_content: documentData.content_type === 'rich_text' ? documentData.editor_content : null,
                notes: documentData.notes || null,
                tags: tagsArray,
                file_url: finalFileUrl,
                thumbnail_url: finalThumbnailUrl, // Save initial placeholder
                allow_download: documentData.allow_download,
                require_email: documentData.require_email,
                company_name: documentData.company_name || null,
                recipient_name: documentData.recipient_name || null,
                recipient_email: documentData.recipient_email || null,
                lead_id: documentData.lead_id || null,
                deal_id: documentData.deal_id || null,
                approver_email: documentData.approver_email || null,
                customization: documentData.customization || { brand_color: '#4f46e5', logo_url: '' },
            };
            
            let savedDocument;
            if (isEditing) {
                savedDocument = await Document.update(documentId, payload);
                toast.success('Document updated successfully!');
            } else {
                payload.public_id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                payload.status = 'draft';
                payload.created_by = currentUser?.email;
                savedDocument = await Document.create(payload);
                toast.success('Document created successfully!');
            }
            
            // AFTER saving, trigger the thumbnail generation if it's a file upload
            if (savedDocument && savedDocument.id && documentData.content_type === 'pdf' && finalFileUrl) {
                // Don't wait for it, let it run in the background
                generateThumbnail({ pdf_url: finalFileUrl, document_id: savedDocument.id })
                    .then(res => {
                        if(res.data && res.data.success) console.log('Thumbnail generation started for', savedDocument.id);
                        else console.error('Thumbnail generation failed to start', res.data?.error || 'Unknown error');
                    })
                    .catch(err => console.error('Error calling thumbnail function', err));
            }
            
            // Update documentData with ID from newly created document for panels
            if (savedDocument && savedDocument.id) {
                setDocumentData(prev => ({ ...prev, id: savedDocument.id }));
            }
    
        } catch (error) {
            console.error('SAVE FAILED:', error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred.";
            toast.error('Save failed', { description: errorMessage });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSwitchChange = (field, checked) => {
        setDocumentData(prev => ({ ...prev, [field]: checked }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-slate-700 text-lg">Loading...</p>
            </div>
        );
    }

    const DebugInfo = () => {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (!isDev) return null;
        
        return (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold mb-2">Debug Info (Dev Mode Only):</h4>
                <pre className="text-xs overflow-auto">
                    {JSON.stringify(documentData, null, 2)}
                </pre>
                <h4 className="font-semibold mb-2 mt-4">Current User:</h4>
                <pre className="text-xs overflow-auto">
                    {JSON.stringify(currentUser, null, 2)}
                </pre>
                <p className="text-xs mt-2">Is Owner: {isOwner ? 'Yes' : 'No'}</p>
            </div>
        );
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col">
            {/* Compact Header Bar */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate(createPageUrl('Documents'))} size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Documents
                        </Button>
                        <div className="h-6 w-px bg-slate-300"></div>
                        <h1 className="text-xl font-semibold text-slate-900">
                            {isEditing ? 'Edit Document' : 'Create New Document'}
                        </h1>
                    </div>
                    <Button 
                        onClick={handleSave}
                        disabled={isSaving || isUploading || !isOwner}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {isEditing ? 'Update Document' : 'Create Document'}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex min-h-0">
                {/* Left Panel - Document File & Preview */}
                <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-200">
                    <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {documentData.content_type === 'pdf' ? <FileText className="w-5 h-5 text-blue-600" /> : <PenSquare className="w-5 h-5 text-purple-600" />}
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {documentData.content_type === 'pdf' ? 'Document File' : 'Document Editor'}
                                </h2>
                            </div>
                            
                            {!isEditing && (
                                <Tabs value={documentData.content_type} onValueChange={(value) => setDocumentData(prev => ({ ...prev, content_type: value, document_type: value === 'rich_text' ? 'text_document' : 'proposal' }))} className="w-auto">
                                    <TabsList>
                                        <TabsTrigger value="pdf">File Upload</TabsTrigger>
                                        <TabsTrigger value="rich_text">Editor</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            )}

                            {(documentData.content_type === 'pdf' && (previewUrl || documentData.file_url) && isOwner) && (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => document.getElementById('file-input')?.click()}
                                    disabled={isUploading}
                                >
                                    Change File
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Document Preview Area */}
                    <div className="flex-1 min-h-0 p-6">
                        {documentData.content_type === 'pdf' ? (
                            <>
                                {!previewUrl && !documentData.file_url ? (
                                    <div 
                                        className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
                                            !isOwner 
                                                ? 'border-gray-200 bg-gray-50' 
                                                : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer'
                                        }`}
                                        onClick={() => isOwner && document.getElementById('file-input')?.click()}
                                    >
                                        <UploadCloud className="w-16 h-16 text-slate-400 mb-4" />
                                        <p className="text-xl font-semibold text-slate-700 mb-2">
                                            {isOwner ? 'Upload your document' : 'No document uploaded'}
                                        </p>
                                        <p className="text-slate-500 text-center max-w-md">
                                            {isOwner ? 'Click here or drag and drop your PDF, Word, PowerPoint, or Excel file to get started' : 'You need to be the owner to upload files'}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">PDF</span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">DOC/DOCX</span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">PPT/PPTX</span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">XLS/XLSX</span>
                                        </div>
                                    </div>
                                ) : (
                                    <FilePreview 
                                        fileUrl={previewUrl || documentData.file_url} 
                                        fileName={documentData.document_name || 'Document'} 
                                        isUploading={isUploading} 
                                    />
                                )}
                            </>
                        ) : (
                            <RichTextEditor
                                value={documentData.editor_content}
                                onChange={(content) => setDocumentData(prev => ({...prev, editor_content: content}))}
                                readOnly={!isOwner}
                            />
                        )}
                    </div>

                    <input
                        id="file-input"
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={!isOwner}
                    />
                </div>

                {/* Right Panel - Document Details */}
                <div className="w-80 flex-shrink-0 bg-white">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="flex-shrink-0 border-b border-slate-200">
                            <TabsList className="grid w-full grid-cols-4 bg-slate-50 m-2">
                                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                                <TabsTrigger value="recipient" className="text-xs">Recipient</TabsTrigger>
                                <TabsTrigger value="collab" className="text-xs">Collab</TabsTrigger>
                                <TabsTrigger value="versions" className="text-xs">Versions</TabsTrigger>
                            </TabsList>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            <TabsContent value="details" className="p-6 mt-0 space-y-4">
                                <div>
                                    <Label htmlFor="document-name">Document Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="document-name"
                                        value={documentData.document_name || ''}
                                        onChange={(e) => setDocumentData({...documentData, document_name: e.target.value})}
                                        placeholder="Enter document name"
                                        disabled={!isOwner}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="document-type">Document Type</Label>
                                    <Select 
                                        value={documentData.document_type || 'proposal'}
                                        onValueChange={(value) => setDocumentData({...documentData, document_type: value})}
                                        disabled={!isOwner || documentData.content_type === 'rich_text'}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select document type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {documentData.content_type === 'rich_text' ? (
                                                <SelectItem value="text_document">✍️ Text Document</SelectItem>
                                            ) : (
                                                <>
                                                    <SelectItem value="proposal">📝 Proposal</SelectItem>
                                                    <SelectItem value="contract">📋 Contract</SelectItem>
                                                    <SelectItem value="rfp_response">📊 RFP Response</SelectItem>
                                                    <SelectItem value="presentation">🎯 Presentation</SelectItem>
                                                    <SelectItem value="case_study">📚 Case Study</SelectItem>
                                                    <SelectItem value="brochure">📄 Brochure</SelectItem>
                                                    <SelectItem value="text_document">✍️ Text Document</SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                {documentData.document_type === 'rfp_response' && (
                                    <Card className="bg-purple-50 border-purple-200 shadow-md animate-in fade-in-50">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2 text-purple-800">
                                                <Sparkles className="w-5 h-5" />
                                                AI Assistant
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-purple-700 mb-4">
                                                Launch the AI RFP Assistant to analyze requirements and generate a draft.
                                            </p>
                                            <Button 
                                                className="w-full bg-purple-600 hover:bg-purple-700"
                                                onClick={() => navigate(createPageUrl('RFPAssistant'))}
                                            >
                                                Use AI RFP Assistant
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                <div>
                                    <Label htmlFor="tags">Tags</Label>
                                    <Input
                                        id="tags"
                                        value={tagsString}
                                        onChange={(e) => setTagsString(e.target.value)}
                                        placeholder="e.g., proposal, Q4, legal"
                                        disabled={!isOwner}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Separate with commas</p>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={documentData.notes || ''}
                                        onChange={(e) => setDocumentData({...documentData, notes: e.target.value})}
                                        placeholder="Internal notes about this document..."
                                        disabled={!isOwner}
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="recipient" className="p-6 mt-0 space-y-4">
                                <div>
                                    <Label htmlFor="company-name">Company Name</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            id="company-name"
                                            value={documentData.company_name || ''}
                                            onChange={(e) => setDocumentData({...documentData, company_name: e.target.value})}
                                            placeholder="Client company name"
                                            disabled={!isOwner}
                                        />
                                        <Button variant="outline" size="icon" disabled={true}>
                                            <Building className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="recipient-name">Recipient Name</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            id="recipient-name"
                                            value={documentData.recipient_name || ''}
                                            onChange={(e) => setDocumentData({...documentData, recipient_name: e.target.value})}
                                            placeholder="Primary recipient"
                                            disabled={!isOwner}
                                        />
                                        <Button variant="outline" size="icon" disabled={true}>
                                            <UserIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="recipient-email">Recipient Email</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            id="recipient-email"
                                            type="email"
                                            value={documentData.recipient_email || ''}
                                            onChange={(e) => setDocumentData({...documentData, recipient_email: e.target.value})}
                                            placeholder="recipient@company.com"
                                            disabled={!isOwner}
                                        />
                                        <Button variant="outline" size="icon" disabled={true}>
                                            <Mail className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label>Link to Lead</Label>
                                    <Select 
                                        value={documentData.lead_id || ''} 
                                        onValueChange={handleLeadChange}
                                        disabled={!isOwner}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select a lead (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>No lead selected</SelectItem>
                                            {allLeads.map((lead) => (
                                                <SelectItem key={lead.id} value={lead.id}>
                                                    {lead.contact_name} ({lead.company_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Link to Deal</Label>
                                    <Select 
                                        value={documentData.deal_id || ''} 
                                        onValueChange={handleDealChange}
                                        disabled={!isOwner}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select a deal (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>No deal selected</SelectItem>
                                            {allDeals.map((deal) => (
                                                <SelectItem key={deal.id} value={deal.id}>
                                                    {deal.deal_name} ({deal.company_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>

                            <TabsContent value="collab" className="p-6 mt-0">
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">Collaboration features coming soon</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="versions" className="p-6 mt-0">
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">Version history coming soon</p>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            {/* Debug Info, if enabled */}
            <DebugInfo />
            
        </div>
    );
}

// File Preview Component
const FilePreview = ({ fileUrl, fileName, isUploading }) => {
    const getFileType = (url, name) => {
        const extension = name?.toLowerCase().split('.').pop() || url?.toLowerCase().split('.').pop() || '';
        const cleanedExtension = extension.split('?')[0]; // Remove query params
        return cleanedExtension;
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'pdf': return '📄';
            case 'doc':
            case 'docx': return '📝';
            case 'ppt':
            case 'pptx': return '📊';
            case 'xls':
            case 'xlsx': return '📈';
            default: return '📁';
        }
    };

    const fileType = getFileType(fileUrl, fileName);
    const isLocalFile = fileUrl && fileUrl.startsWith('blob:');

    if (isUploading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Processing document...</p>
                </div>
            </div>
        );
    }
    
    // Fallback for local files (that aren't PDFs) or unsupported types
    const renderFallback = (message) => (
        <div className="h-full flex items-center justify-center bg-slate-50 text-center p-8">
            <div>
                <span className="text-8xl mb-6 block">{getFileIcon(fileType)}</span>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">{fileName || 'Document'}</h3>
                <p className="text-slate-500 mb-6">{message}</p>
                <Button asChild>
                    <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                    </a>
                </Button>
            </div>
        </div>
    );
    
    // For local files (except PDF), Google Viewer can't access them.
    if (isLocalFile && fileType !== 'pdf') {
        return renderFallback('Full preview will be available after saving.');
    }

    return (
        <div className="h-full bg-slate-100 rounded-lg overflow-hidden">
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-3 bg-slate-200 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{getFileIcon(fileType)}</span>
                        <span className="text-sm font-medium text-slate-700">Document Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="text-xs"
                        >
                            <Eye className="w-3 h-3 mr-1" />
                            Open Full View
                        </Button>
                        {fileUrl && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                asChild
                                className="text-xs"
                            >
                                <a 
                                    href={fileUrl} 
                                    download={fileName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex-1 bg-white">
                    {fileType === 'pdf' ? (
                        <object
                            data={isLocalFile ? fileUrl : `${fileUrl}#view=FitH&toolbar=1&navpanes=1`}
                            type="application/pdf"
                            className="w-full h-full"
                            style={{ minHeight: '500px' }}
                        >
                            {renderFallback('PDF preview failed. Please download to view.')}
                        </object>
                    ) : ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileType) ? (
                        <iframe
                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                            className="w-full h-full border-0"
                            style={{ minHeight: '500px' }}
                            title="Document Preview"
                            onError={() => renderFallback('Preview could not be loaded.')}
                        />
                    ) : (
                        renderFallback(`${fileType.toUpperCase()} files cannot be previewed in the browser.`)
                    )}
                </div>
            </div>
        </div>
    );
};
