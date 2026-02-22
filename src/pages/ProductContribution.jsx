
import React, { useState, useEffect } from 'react';
import { Product } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, X, Upload, FileText, Image, Video, Music, Presentation, File, Loader2, ServerCrash, CheckCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Re-defining components here for the public page to keep it self-contained
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

const FileUploader = ({ onFileUploaded }) => {
    const [isUploading, setIsUploading] = useState(false);

    const detectFileTypeFromMime = (mimeType, fileName) => {
        if (mimeType.startsWith('image/')) return 'Image';
        if (mimeType.startsWith('video/')) return 'Video';
        if (mimeType.startsWith('audio/')) return 'Audio';
        if (mimeType === 'application/pdf') return 'PDF';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || fileName.toLowerCase().includes('.ppt')) return 'Presentation';
        if (mimeType.includes('document') || mimeType.includes('word') || fileName.toLowerCase().includes('.doc')) return 'Document';
        if (mimeType.includes('sheet') || mimeType.includes('excel') || fileName.toLowerCase().includes('.xls')) return 'Spreadsheet';
        return 'Document';
    };

    const validateFileType = (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'audio/mp3', 'audio/wav', 'audio/aac', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const fileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.avi', '.mov', '.wmv', '.mp3', '.wav', '.aac', '.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx'];
        const hasValidMimeType = allowedTypes.includes(file.type);
        const hasValidExtension = fileExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        return hasValidMimeType || hasValidExtension;
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!validateFileType(file)) {
            toast.error('Invalid file type.');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size too large (max 50MB).');
            return;
        }
        setIsUploading(true);
        try {
            const result = await UploadFile({ file });
            const detectedType = detectFileTypeFromMime(file.type, file.name);
            onFileUploaded({ name: file.name, type: detectedType, file_url: result.file_url, file_size: file.size, original_type: file.type, description: '', usage_context: 'general' });
            toast.success(`${detectedType} uploaded successfully!`);
        } catch (error) {
            toast.error('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
            <input type="file" onChange={handleFileUpload} disabled={isUploading} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-700 mb-2">{isUploading ? 'Uploading...' : 'Upload Collateral'}</p>
                <p className="text-sm text-slate-500">Drag & drop or click to select files (Max 50MB)</p>
            </label>
        </div>
    );
};

const TagInput = ({ items, onItemsChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const newItem = inputValue.trim();
            if (!items.includes(newItem)) onItemsChange([...items, newItem]);
            setInputValue('');
        }
    };
    const removeItem = (indexToRemove) => onItemsChange(items.filter((_, index) => index !== indexToRemove));
    return (
        <div>
            <Input placeholder={placeholder} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} className="mb-2" />
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1.5 py-1 px-2">{item}<button type="button" onClick={() => removeItem(index)} className="rounded-full hover:bg-slate-300 p-0.5"><X className="w-3 h-3" /></button></Badge>
                ))}
            </div>
        </div>
    );
};


const CompetitorSection = ({ competitors, onCompetitorsChange }) => {
    const [editingIndex, setEditingIndex] = useState(-1);
    const [currentCompetitor, setCurrentCompetitor] = useState({ name: '', website: '', strengths: [], weaknesses: [], differentiator: '', pricing_strategy: '', notes: '' });

    const handleSaveCompetitor = () => {
        if (!currentCompetitor.name.trim()) { toast.error('Competitor name is required'); return; }
        const newCompetitors = [...competitors];
        if (editingIndex === -1) newCompetitors.push(currentCompetitor);
        else newCompetitors[editingIndex] = currentCompetitor;
        onCompetitorsChange(newCompetitors);
        setEditingIndex(-1);
        setCurrentCompetitor({ name: '', website: '', strengths: [], weaknesses: [], differentiator: '', pricing_strategy: '', notes: '' });
    };
    const handleEditCompetitor = (index) => setCurrentCompetitor(competitors[index]);
    const handleDeleteCompetitor = (index) => onCompetitorsChange(competitors.filter((_, i) => i !== index));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Competitor Analysis</h3>
                <Button type="button" onClick={() => {setEditingIndex(-1); setCurrentCompetitor({ name: '', website: '', strengths: [], weaknesses: [], differentiator: '', pricing_strategy: '', notes: '' });}} variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Add Competitor</Button>
            </div>
            {(editingIndex === -1 || editingIndex < competitors.length) && (
                <Card className="p-6"><h4 className="font-semibold mb-4">{editingIndex === -1 ? 'Add New Competitor' : `Edit ${competitors[editingIndex]?.name}`}</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium mb-1 block">Competitor Name*</label><Input placeholder="e.g., Competitor Inc." value={currentCompetitor.name} onChange={(e) => setCurrentCompetitor({...currentCompetitor, name: e.target.value})} /></div>
                            <div><label className="text-sm font-medium mb-1 block">Website</label><Input placeholder="https://competitor.com" value={currentCompetitor.website} onChange={(e) => setCurrentCompetitor({...currentCompetitor, website: e.target.value})} /></div>
                        </div>
                        <div><label className="text-sm font-medium mb-1 block">Their Strengths (Press Enter to add)</label><TagInput items={currentCompetitor.strengths} onItemsChange={(strengths) => setCurrentCompetitor({...currentCompetitor, strengths})} placeholder="e.g., Market leader..." /></div>
                        <div><label className="text-sm font-medium mb-1 block">Their Weaknesses (Press Enter to add)</label><TagInput items={currentCompetitor.weaknesses} onItemsChange={(weaknesses) => setCurrentCompetitor({...currentCompetitor, weaknesses})} placeholder="e.g., High pricing..." /></div>
                        <div><label className="text-sm font-medium mb-1 block">Our Key Differentiator</label><Textarea placeholder="How we stand out..." value={currentCompetitor.differentiator} onChange={(e) => setCurrentCompetitor({...currentCompetitor, differentiator: e.target.value})} /></div>
                        <div className="flex gap-3">
                            <Button type="button" onClick={handleSaveCompetitor} className="bg-green-600 hover:bg-green-700">{editingIndex === -1 ? 'Add Competitor' : 'Save Changes'}</Button>
                            <Button type="button" variant="outline" onClick={() => { setEditingIndex(-1); setCurrentCompetitor({ name: '', website: '', strengths: [], weaknesses: [], differentiator: '', pricing_strategy: '', notes: '' }); }}>Cancel</Button>
                        </div>
                    </div>
                </Card>
            )}
            {competitors.length > 0 && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{competitors.map((competitor, index) => (<Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3"><div><h4 className="font-semibold text-lg">{competitor.name}</h4>{competitor.website && (<a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Website</a>)}</div>
                    <div className="flex gap-2"><Button type="button" variant="ghost" size="icon" onClick={() => {setEditingIndex(index); setCurrentCompetitor(competitors[index]);}}><Edit className="w-4 h-4" /></Button><Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteCompetitor(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button></div>
                </div>
                {competitor.strengths?.length > 0 && (<div className="mb-3"><h5 className="text-sm font-medium text-green-700 mb-1">Strengths:</h5><div className="flex flex-wrap gap-1">{competitor.strengths.map((s, i) => <Badge key={i} className="bg-green-100 text-green-800 text-xs">{s}</Badge>)}</div></div>)}
                {competitor.weaknesses?.length > 0 && (<div className="mb-3"><h5 className="text-sm font-medium text-red-700 mb-1">Weaknesses:</h5><div className="flex flex-wrap gap-1">{competitor.weaknesses.map((w, i) => <Badge key={i} className="bg-red-100 text-red-800 text-xs">{w}</Badge>)}</div></div>)}
                {competitor.differentiator && (<div className="mb-3"><h5 className="text-sm font-medium text-blue-700 mb-1">Differentiator:</h5><p className="text-sm text-slate-600">{competitor.differentiator}</p></div>)}
            </Card>))}</div>)}
        </div>
    );
};

export default function ProductContribution() {
    const [product, setProduct] = useState(null);
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                
                if (!token) {
                    setError('No contribution token provided.');
                    setIsLoading(false);
                    return;
                }

                // Find product by share_token
                const products = await Product.filter({ share_token: token });
                if (products.length === 0) {
                    setError('Invalid or expired link.');
                    setIsLoading(false);
                    return;
                }

                const foundProduct = products[0];
                setProduct(foundProduct);
                setFormData({
                    ...foundProduct,
                    features: Array.isArray(foundProduct.features) ? foundProduct.features.join('\n') : '',
                    use_cases: Array.isArray(foundProduct.use_cases) ? foundProduct.use_cases.join('\n') : '',
                    base_price: foundProduct.base_price?.toString() || '',
                    collaterals: foundProduct.collaterals || [],
                    competitors: foundProduct.competitors || [],
                });
            } catch (e) {
                console.error('Error fetching product:', e);
                setError('Failed to load product data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, []);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleArrayChange = (arrayName, index, field, value) => {
        const newArray = [...formData[arrayName]];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormData(prev => ({ ...prev, [arrayName]: newArray }));
    };
    const addArrayItem = (arrayName, newItem) => setFormData(prev => ({...prev, [arrayName]: [...(prev[arrayName] || []), newItem]}));
    const removeArrayItem = (arrayName, index) => setFormData(prev => ({...prev, [arrayName]: formData[arrayName].filter((_, i) => i !== index)}));
    const handleFileUploaded = (fileInfo) => addArrayItem('collaterals', fileInfo);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const productData = {
                ...formData,
                features: formData.features.split('\n').filter(f => f.trim()),
                use_cases: formData.use_cases.split('\n').filter(u => u.trim()),
                base_price: formData.base_price ? Number(formData.base_price) : undefined
            };
            await Product.update(product.id, productData);
            toast.success('Your contributions have been saved. Thank you!');
            setIsSaved(true);
        } catch (error) {
            toast.error('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    if (error) {
        return <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-center p-4">
            <ServerCrash className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
            <p className="text-slate-600 mt-2">{error}</p>
            <p className="text-sm text-slate-500 mt-4">Please check the link or contact the person who sent it to you.</p>
        </div>;
    }
    
    if (isSaved) {
        return <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-center p-4">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">Thank You!</h1>
            <p className="text-slate-600 mt-2">Your contributions have been successfully submitted.</p>
            <p className="text-sm text-slate-500 mt-1">You can now close this window.</p>
        </div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 md:p-8">
            <Toaster />
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-slate-800">Contribute to: {product.name}</h1>
                    <p className="text-slate-600 mt-1">Thank you for helping us gather intelligence. Your changes are saved automatically.</p>
                </div>
                <div className="border-b border-slate-200 px-6">
                    <div className="flex gap-1">
                        <TabButton tabId="overview" label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <TabButton tabId="competitors" label="Competitors" isActive={activeTab === 'competitors'} onClick={() => setActiveTab('competitors')} />
                        <TabButton tabId="collaterals" label="Collaterals" isActive={activeTab === 'collaterals'} onClick={() => setActiveTab('collaterals')} />
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                     {activeTab === 'overview' && (
                        <div className="space-y-4">
                           {/* Simplified Overview section */}
                           <div><label className="text-sm font-medium mb-1 block">Product Name</label><Input value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} /></div>
                           <div><label className="text-sm font-medium mb-1 block">Description</label><Textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="min-h-[100px]" /></div>
                           <div><label className="text-sm font-medium mb-1 block">Key Features (one per line)</label><Textarea value={formData.features || ''} onChange={(e) => handleChange('features', e.target.value)} className="min-h-[120px]" /></div>
                        </div>
                    )}
                    {activeTab === 'competitors' && <CompetitorSection competitors={formData.competitors || []} onCompetitorsChange={(c) => handleChange('competitors', c)} />}
                    {activeTab === 'collaterals' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Sales & Marketing Collaterals</h3>
                            <FileUploader onFileUploaded={handleFileUploaded} />
                            {formData.collaterals?.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {formData.collaterals.map((coll, index) => (
                                        <Card key={index} className="p-4 relative">
                                            {/* Collateral card content now included */}
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => removeArrayItem('collaterals', index)}><Trash2 className="w-4 h-4" /></Button>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="text-blue-500">
                                                    {coll.type === 'Image' ? <Image className="w-5 h-5"/> : coll.type === 'Video' ? <Video className="w-5 h-5"/> : coll.type === 'Audio' ? <Music className="w-5 h-5"/> : coll.type === 'PDF' ? <FileText className="w-5 h-5"/> : coll.type === 'Presentation' ? <Presentation className="w-5 h-5"/> : <File className="w-5 h-5"/>}
                                                </div>
                                                <p className="font-medium text-sm truncate">{coll.name}</p>
                                            </div>
                                            <Textarea placeholder="Description..." value={coll.description || ''} onChange={(e) => handleArrayChange('collaterals', index, 'description', e.target.value)} className="mb-2"/>
                                            <Select value={coll.usage_context || 'general'} onValueChange={(v) => handleArrayChange('collaterals', index, 'usage_context', v)}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General</SelectItem>
                                                    <SelectItem value="competitor_analysis">Competitor Analysis</SelectItem>
                                                    <SelectItem value="feature_demo">Feature Demo</SelectItem>
                                                    <SelectItem value="case_study">Case Study</SelectItem>
                                                    <SelectItem value="pricing_comparison">Pricing Comparison</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                     <div className="pt-6 border-t flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Submit Contributions
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
