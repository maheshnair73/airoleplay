
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Product } from '@/api/entities';
import { Competitor } from '@/api/entities'; // New import
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package, DollarSign, CheckCircle, XCircle, MoreVertical, Search, Link as LinkIcon, Briefcase, BookOpen, Eye, X, Upload, FileText, Image, Video, Music, Presentation, File, ShieldOff, ArrowLeft, Share2, Loader2, Shield, ExternalLink, TrendingUp, Award, Users, Target } from 'lucide-react'; // Added Shield, ExternalLink, TrendingUp, Award, Users, Target icons
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // New imports for MultiSelect
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'; // New imports for MultiSelect

const TabButton = ({ tabId, label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
            isActive 
                ? 'border-blue-600 text-blue-600' 
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
        }`}
    >
        {label}
    </button>
);

// Enhanced File upload component with proper validation and thumbnails
const FileUploader = ({ onFileUploaded }) => {
    const [isUploading, setIsUploading] = useState(false);

    const detectFileTypeFromMime = (mimeType, fileName) => {
        // Image files
        if (mimeType.startsWith('image/')) return 'Image';

        // Video files
        if (mimeType.startsWith('video/')) return 'Video';

        // Audio files
        if (mimeType.startsWith('audio/')) return 'Audio';

        // PDF files
        if (mimeType === 'application/pdf') return 'PDF';

        // Office documents - prioritize more specific MIME types or common extensions
        // Presentation
        if (mimeType.includes('presentation') || fileName.toLowerCase().endsWith('.ppt') || fileName.toLowerCase().endsWith('.pptx')) {
            return 'Presentation';
        }
        // Word Document
        if (mimeType.includes('document') || mimeType.includes('word') || fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx')) {
            return 'Document';
        }
        // Spreadsheet
        if (mimeType.includes('sheet') || mimeType.includes('excel') || fileName.toLowerCase().endsWith('.xls') || fileName.toLowerCase().endsWith('.xlsx')) {
            return 'Spreadsheet';
        }

        // Fallback for general file types
        return 'File';
    };

    const validateFileType = (file) => {
        const allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg', // Added more common video types
            'audio/mpeg', 'audio/wav', 'audio/aac', // Added more common audio types
            'application/pdf',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        const allowedExtensions = [
            '.jpg', '.jpeg', '.png', '.gif', '.webp', // Images
            '.mp4', '.mov', '.avi', '.wmv', // Videos
            '.mp3', '.wav', '.aac', // Audio
            '.pdf', // PDF
            '.ppt', '.pptx', // Presentations
            '.doc', '.docx', // Documents
            '.xls', '.xlsx' // Spreadsheets
        ];

        const hasValidMimeType = allowedMimeTypes.includes(file.type);
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        const hasValidExtension = allowedExtensions.includes(fileExtension);

        // Allow if either mime type or extension is valid
        return hasValidMimeType || hasValidExtension;
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!validateFileType(file)) {
            toast.error('Invalid file type. Please upload images, videos, audio, PDF, or Office documents.');
            e.target.value = ''; // Clear input
            return;
        }

        // Check file size (50MB limit)
        const MAX_FILE_SIZE_MB = 50;
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`File size too large. Please upload files smaller than ${MAX_FILE_SIZE_MB}MB.`);
            e.target.value = ''; // Clear input
            return;
        }

        setIsUploading(true);
        try {
            const result = await UploadFile({ file });
            
            const detectedType = detectFileTypeFromMime(file.type, file.name);
            
            const fileInfo = {
                name: file.name,
                type: detectedType, // Category like 'Image', 'Video', 'PDF'
                file_url: result.file_url,
                file_size: file.size,
                original_type: file.type, // The actual MIME type from the file system
                description: '', // Initialize description
                usage_context: 'general' // Initialize usage context
            };
            
            onFileUploaded(fileInfo);
            toast.success(`${detectedType} uploaded successfully!`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
        } finally {
            e.target.value = ''; // Clear the input after upload attempt
            setIsUploading(false);
        }
    };

    return (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
            <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.wmv,.mp3,.wav,.aac,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-700 mb-2">
                    {isUploading ? 'Uploading...' : 'Upload Collateral'}
                </p>
                <p className="text-sm text-slate-500">
                    Drag & drop or click to select files
                </p>
                <div className="mt-3 text-xs text-slate-400">
                    <p>Supported: Images (JPG, PNG, GIF, WEBP), Videos (MP4, MOV, AVI, WMV)</p>
                    <p>Audio (MP3, WAV, AAC), Documents (PDF, DOC, PPT, XLS)</p>
                    <p>Max size: 50MB</p>
                </div>
            </label>
        </div>
    );
};

// MultiSelectCompetitors component for linking existing competitors
const MultiSelectCompetitors = ({ allCompetitors, selectedIds, onSelectionChange }) => {
    const [open, setOpen] = useState(false);
    const selectedCompetitors = allCompetitors.filter(c => selectedIds.includes(c.id));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-auto min-h-[40px] text-left">
                    {selectedCompetitors.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                            {selectedCompetitors.map(c => <Badge key={c.id} variant="secondary" className="bg-slate-100 text-slate-700">{c.name}</Badge>)}
                        </div>
                    ) : (
                        <span className="text-slate-500">Select competitors...</span>
                    )}
                    <span className="sr-only">Toggle competitors</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search competitors..." />
                    <CommandList>
                        <CommandEmpty>No competitors found.</CommandEmpty>
                        <CommandGroup>
                            {allCompetitors.map(competitor => (
                                <CommandItem
                                    key={competitor.id}
                                    onSelect={() => {
                                        const newSelection = selectedIds.includes(competitor.id)
                                            ? selectedIds.filter(id => id !== competitor.id)
                                            : [...selectedIds, competitor.id];
                                        onSelectionChange(newSelection);
                                    }}
                                >
                                    <CheckCircle className={`mr-2 h-4 w-4 ${selectedIds.includes(competitor.id) ? "opacity-100 text-blue-600" : "opacity-0"}`} />
                                    {competitor.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

// Add a reusable component for dynamic input fields
const DynamicFieldInput = ({ label, items, onItemsChange, onSaveField, placeholder }) => {
    const [editingIndex, setEditingIndex] = useState(-1);
    const [tempValue, setTempValue] = useState(''); // Only one temp value for the currently edited field

    // Ensure items is always an array, even if initial prop is null/undefined
    const currentItems = Array.isArray(items) ? items : [];

    const getSingularLabel = (lbl) => {
        if (lbl.endsWith('s')) return lbl.slice(0, -1);
        return lbl;
    };

    const addField = () => {
        // Prevent adding a new field if the last item is empty and still being edited or not saved.
        // This prevents adding multiple empty fields without saving the previous one.
        if (editingIndex !== -1 && tempValue === '' && currentItems[editingIndex] === '') {
            toast.error(`Please save or cancel the current empty ${getSingularLabel(label).toLowerCase()} before adding another.`);
            return;
        }

        const newItems = [...currentItems, ''];
        onItemsChange(newItems);
        setEditingIndex(newItems.length - 1);
        setTempValue(''); // Start with an empty temp value for the new field
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setTempValue(currentItems[index]); // Load current value into temp
    };

    const saveField = async (index) => {
        const valueToSave = tempValue.trim();
        if (valueToSave) {
            const newItems = [...currentItems];
            newItems[index] = valueToSave;
            onItemsChange(newItems); // Update parent state immediately

            if (onSaveField) {
                await onSaveField(newItems); // Call parent's save for persistence
            }

            setEditingIndex(-1); // Exit editing mode
            setTempValue(''); // Clear temp value
            toast.success(`${getSingularLabel(label)} saved.`);
        } else {
            toast.error("Value cannot be empty.");
        }
    };

    const cancelEditing = (index) => {
        if (currentItems[index] === '' && tempValue.trim() === '') {
            // If it was a newly added empty field and nothing was typed, remove it
            removeField(index);
        }
        setEditingIndex(-1); // Exit editing mode
        setTempValue(''); // Clear temp value
    };

    const removeField = (index) => {
        const newItems = currentItems.filter((_, i) => i !== index);
        onItemsChange(newItems);
        if (editingIndex === index) { // If the removed item was being edited, clear editing state
            setEditingIndex(-1);
            setTempValue('');
        }
        // If an item before the edited one was removed, adjust editingIndex
        else if (editingIndex > index) {
            setEditingIndex(editingIndex - 1);
        }
        toast.success(`${getSingularLabel(label)} removed.`);
    };

    return (
        <div>
            <label className="text-sm font-medium mb-2 block">{label}</label>
            <div className="space-y-2">
                {currentItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        {editingIndex === index ? (
                            <>
                                <Input
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    placeholder={placeholder}
                                    className="flex-1"
                                    autoFocus
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            saveField(index);
                                        } else if (e.key === 'Escape') {
                                            cancelEditing(index);
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => saveField(index)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => cancelEditing(index)}
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <div 
                                    className="flex-1 p-2 bg-gray-50 border rounded-md cursor-pointer hover:bg-gray-100 min-h-[40px] flex items-center"
                                    onClick={() => startEditing(index)}
                                >
                                    {item || (
                                        <span className="text-gray-400 italic">{placeholder}</span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => startEditing(index)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                {/* Show remove button if there's more than one field, or if it's the only field but not empty */}
                                {(currentItems.length > 1 || (currentItems.length === 1 && item !== '')) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeField(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addField}
                    className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    disabled={editingIndex !== -1 && tempValue === '' && currentItems[editingIndex] === ''}
                >
                    <Plus className="w-4 h-4" />
                    Add More
                </Button>
            </div>
        </div>
    );
};

const ProductForm = ({ open, onOpenChange, product, onSave }) => {
    const [formData, setFormData] = useState({});
    const [activeTab, setActiveTab] = useState('overview');
    const [allCompetitors, setAllCompetitors] = useState([]);

    useEffect(() => {
        const fetchCompetitors = async () => {
            try {
                const competitors = await Competitor.list();
                setAllCompetitors(competitors);
            } catch (error) {
                console.error("Failed to fetch competitors:", error);
                toast.error("Failed to load competitors for linking.");
            }
        };

        if (open) {
            fetchCompetitors();
            setActiveTab('overview');
            if (product) {
                setFormData({
                    ...product,
                    // Ensure features and use_cases are arrays, even if they might have been single strings before
                    features: Array.isArray(product.features) ? product.features : (product.features ? [product.features] : ['']),
                    use_cases: Array.isArray(product.use_cases) ? product.use_cases : (product.use_cases ? [product.use_cases] : ['']),
                    base_price: product.base_price?.toString() || '',
                    collaterals: product.collaterals || [],
                    competitor_ids: product.competitor_ids || [], // Initialize competitor_ids
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    features: [''], // Initialize with one empty field
                    pricing_model: 'Subscription',
                    base_price: '',
                    target_audience: '',
                    use_cases: [''], // Initialize with one empty field
                    version: '1.0',
                    is_active: true,
                    collaterals: [],
                    competitor_ids: [], // Initialize competitor_ids for new product
                });
            }
        }
    }, [product, open]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (arrayName, index, field, value) => {
        const newArray = [...formData[arrayName]];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormData(prev => ({ ...prev, [arrayName]: newArray }));
    };

    const addArrayItem = (arrayName, newItem) => {
        setFormData(prev => ({...prev, [arrayName]: [...(prev[arrayName] || []), newItem]}));
    };
    
    const removeArrayItem = (arrayName, index) => {
        const newArray = formData[arrayName].filter((_, i) => i !== index);
        setFormData(prev => ({...prev, [arrayName]: newArray}));
    };

    const handleFileUploaded = (fileInfo) => {
        addArrayItem('collaterals', fileInfo);
    };

    // Add handlers for individual field saving
    const handleSaveFeatures = async (features) => {
        if (!product || !product.id) return; // Only save if product exists (editing mode)
        try {
            // Assuming Product.update can handle partial updates for specific fields
            await Product.update(product.id, { features: features.filter(f => f.trim()) });
            // The formData state is already updated by onItemsChange
        } catch (error) {
            console.error('Error saving features:', error);
            toast.error('Failed to save features.');
        }
    };

    const handleSaveUseCases = async (useCases) => {
        if (!product || !product.id) return; // Only save if product exists (editing mode)
        try {
            // Assuming Product.update can handle partial updates for specific fields
            await Product.update(product.id, { use_cases: useCases.filter(u => u.trim()) });
            // The formData state is already updated by onItemsChange
        } catch (error) {
            console.error('Error saving use cases:', error);
            toast.error('Failed to save use cases.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...formData,
                // Filter out any empty strings from features and use_cases arrays
                features: formData.features.filter(f => f.trim()),
                use_cases: formData.use_cases.filter(u => u.trim()),
                base_price: formData.base_price ? Number(formData.base_price) : undefined,
                // competitor_ids is already an array of IDs, no transformation needed
            };

            if (product) {
                await Product.update(product.id, productData);
                toast.success('Product updated successfully!');
            } else {
                await Product.create(productData);
                toast.success('Product created successfully!');
            }
            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Failed to save product. Check required fields.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col"> {/* Adjusted max-w */}
                <DialogHeader>
                    <DialogTitle>{product ? 'Edit Product Details' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>
                        {product ? `Editing "${product.name}"` : 'Fill in the details to add a new product.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="border-b border-slate-200">
                    <div className="flex gap-1">
                        <TabButton tabId="overview" label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <TabButton tabId="collaterals" label="Collaterals" isActive={activeTab === 'collaterals'} onClick={() => setActiveTab('collaterals')} />
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-6 pt-4 pr-2">
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Product Name*</label>
                                    <Input value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., SalesAI Pro Platform" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Version</label>
                                    <Input value={formData.version || ''} onChange={(e) => handleChange('version', e.target.value)} placeholder="e.g., 2.1" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Description*</label>
                                <Textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} placeholder="Provide a compelling overview of the product..." required className="min-h-[100px]" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Use DynamicFieldInput for features */}
                                <DynamicFieldInput
                                    label="Key Features"
                                    items={formData.features || ['']}
                                    onItemsChange={(items) => handleChange('features', items)}
                                    onSaveField={product ? handleSaveFeatures : undefined}
                                    placeholder="e.g., AI-Powered Lead Scoring"
                                />
                                {/* Use DynamicFieldInput for use cases */}
                                <DynamicFieldInput
                                    label="Common Use Cases"
                                    items={formData.use_cases || ['']}
                                    onItemsChange={(items) => handleChange('use_cases', items)}
                                    onSaveField={product ? handleSaveUseCases : undefined}
                                    placeholder="e.g., Reduce ramp time for new reps"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Pricing Model</label>
                                    <Select value={formData.pricing_model || 'Subscription'} onValueChange={(value) => handleChange('pricing_model', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Subscription">Subscription</SelectItem>
                                            <SelectItem value="One-time">One-time</SelectItem>
                                            <SelectItem value="Usage-based">Usage-based</SelectItem>
                                            <SelectItem value="Freemium">Freemium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Base Price ($)</label>
                                    <Input type="number" value={formData.base_price || ''} onChange={(e) => handleChange('base_price', e.target.value)} placeholder="e.g., 99" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Target Audience</label>
                                <Input value={formData.target_audience || ''} onChange={(e) => handleChange('target_audience', e.target.value)} placeholder="e.g., B2B SaaS companies with 50-500 employees" />
                            </div>

                             <div>
                                <label className="text-sm font-medium mb-1 block">Link Competitors</label>
                                <MultiSelectCompetitors 
                                    allCompetitors={allCompetitors}
                                    selectedIds={formData.competitor_ids || []}
                                    onSelectionChange={(ids) => handleChange('competitor_ids', ids)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="is_active" checked={formData.is_active || false} onChange={(e) => handleChange('is_active', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Product is Active & Available for Sale</label>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'collaterals' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Sales & Marketing Collaterals</h3>
                            
                            <FileUploader onFileUploaded={handleFileUploaded} />
                            
                            {formData.collaterals?.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {formData.collaterals.map((coll, index) => (
                                        <Card key={index} className="p-4 bg-white relative hover:shadow-md transition-shadow">
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500" 
                                                onClick={() => removeArrayItem('collaterals', index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            
                                            <div className="flex items-center gap-3 mb-3">
                                                {coll.original_type?.startsWith('image/') ? <Image className="w-5 h-5 text-blue-500" /> :
                                                coll.original_type?.startsWith('video/') ? <Video className="w-5 h-5 text-purple-500" /> :
                                                coll.original_type?.startsWith('audio/') ? <Music className="w-5 h-5 text-green-500" /> :
                                                coll.original_type?.includes('pdf') ? <FileText className="w-5 h-5 text-red-500" /> :
                                                (coll.original_type?.includes('presentation') || coll.original_type?.includes('ppt')) ? <Presentation className="w-5 h-5 text-orange-500" /> :
                                                <File className="w-5 h-5 text-slate-500" />}
                                                
                                                <div className="flex-1">
                                                    <Badge variant="outline" className="text-xs">{coll.type}</Badge>
                                                    <p className="font-medium text-sm truncate">{coll.name}</p>
                                                    {coll.file_size && (
                                                        <p className="text-xs text-slate-500">
                                                            {(coll.file_size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <Textarea 
                                                placeholder="Description (e.g., Explains value proposition)" 
                                                value={coll.description || ''} 
                                                onChange={(e) => handleArrayChange('collaterals', index, 'description', e.target.value)}
                                                className="mb-3 min-h-[60px]"
                                            />
                                            
                                            <Select 
                                                value={coll.usage_context || 'general'} 
                                                onValueChange={(value) => handleArrayChange('collaterals', index, 'usage_context', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Usage Context" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General</SelectItem>
                                                    <SelectItem value="competitor_analysis">Competitor Analysis</SelectItem>
                                                    <SelectItem value="feature_demo">Feature Demo</SelectItem>
                                                    <SelectItem value="case_study">Case Study</SelectItem>
                                                    <SelectItem value="pricing_comparison">Pricing Comparison</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            
                                            {coll.file_url && (
                                                <div className="mt-3">
                                                    <a 
                                                        href={coll.file_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        <LinkIcon className="w-3 h-3" />
                                                        View File
                                                    </a>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="pt-4 sticky bottom-0 bg-white">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">{product ? 'Save Changes' : 'Create Product'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// Clean Product Card Component
const ProductCard = ({ product, onEdit, onDelete, navigateToDetail }) => (
    <Card 
        className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md group cursor-pointer" 
        onClick={() => navigateToDetail(product)}
    >
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <CardTitle className="text-xl font-bold mb-1">{product.name}</CardTitle>
                    <div className="flex items-center gap-3 text-xs">
                        <Badge variant="outline" className="border-slate-300 text-slate-200">
                            v{product.version || '1.0'}
                        </Badge>
                        {product.is_active ? (
                            <Badge className="bg-green-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />Active
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-slate-600">
                                <XCircle className="w-3 h-3 mr-1" />Inactive
                            </Badge>
                        )}
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigateToDetail(product); }}>
                            <Eye className="w-4 h-4 mr-2" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
                            <Edit className="w-4 h-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(product); }} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-4">
            <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{product.description}</p>
                
                {product.features?.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-slate-700">Key Features:</h4>
                        <div className="flex flex-wrap gap-1">
                            {product.features.slice(0, 3).map((feature, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                    {feature}
                                </Badge>
                            ))}
                            {product.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{product.features.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium">
                            {product.pricing_model}
                            {product.base_price && ` - $${product.base_price}`}
                        </span>
                    </div>
                    {/* Removed Button, replaced with Eye icon as click handled by card */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <Eye className="w-4 h-4 text-blue-600" />
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await Product.list('-updated_date');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOpenForm = (product = null) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleSave = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
        loadProducts();
    };

    const handleDelete = async (product) => {
        if (window.confirm(`Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`)) {
            try {
                await Product.delete(product.id);
                toast.success(`"${product.name}" deleted successfully!`);
                loadProducts();
            } catch (error) {
                toast.error('Failed to delete product.');
            }
        }
    };

    const handleNavigateToDetail = (product) => {
        navigate(createPageUrl(`ProductDetail?id=${product.id}`));
    };
    
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-6 md:p-10">
            <header className="mb-8">
                <Link to={createPageUrl('Dashboard')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Product Knowledge Hub</h1>
                        <p className="text-slate-600 mt-2">Manage products, features, pricing, and competitive analysis.</p>
                    </div>
                    <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Add New Product
                    </Button>
                </div>
                <div className="mt-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Search for a product by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 max-w-lg"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onEdit={handleOpenForm} 
                        onDelete={handleDelete}
                        navigateToDetail={handleNavigateToDetail}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && !isLoading && (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Package className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-slate-900">No products found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {searchQuery ? `No products match "${searchQuery}".` : "Get started by adding your first product."}
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => handleOpenForm()}>
                            <Plus className="-ml-1 mr-2 h-5 w-5" />
                            Add Product
                        </Button>
                    </div>
                </div>
            )}
            
            <ProductForm open={isFormOpen} onOpenChange={setIsFormOpen} product={editingProduct} onSave={handleSave} />
        </div>
    );
}

// Exporting ProductForm to be used in ProductDetail page
export { ProductForm, TabButton, FileUploader, MultiSelectCompetitors };
