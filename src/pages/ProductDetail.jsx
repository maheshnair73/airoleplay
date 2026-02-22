
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Product } from '@/api/entities';
import { Competitor } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Plus, Users, Shield, ExternalLink, Award, Package, DollarSign, TrendingUp, CheckCircle, XCircle, Target, BookOpen, Link as LinkIcon, Image, Video, Music, Presentation, File, Loader2, FileText } from 'lucide-react';
import ProductManagement, { ProductForm } from './ProductManagement'; // Re-using the form

// Re-creating the TabButton for this page
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

export default function ProductDetailPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [linkedCompetitors, setLinkedCompetitors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // State for the edit form
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const productId = new URLSearchParams(location.search).get('id');

    const loadProductData = useCallback(async () => {
        if (!productId) {
            setError("No product specified.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const productData = await Product.get(productId);
            setProduct(productData);

            if (productData.competitor_ids?.length > 0) {
                const allCompetitors = await Competitor.list();
                const filtered = allCompetitors.filter(c => productData.competitor_ids.includes(c.id));
                setLinkedCompetitors(filtered);
            } else {
                setLinkedCompetitors([]);
            }
            setError(null);
        } catch (err) {
            console.error("Failed to load product details:", err);
            setError("Could not find the requested product.");
            toast.error("Failed to load product details.");
        } finally {
            setIsLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        loadProductData();
    }, [loadProductData]);

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    const handleSave = () => {
        setIsFormOpen(false);
        loadProductData(); // Refresh data after saving
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-4">{error}</h2>
                <Button asChild>
                    <Link to={createPageUrl('ProductManagement')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Product Hub
                    </Link>
                </Button>
            </div>
        );
    }
    
    if (!product) return null;

    return (
        <div className="p-6 md:p-10">
            <header className="mb-8">
                 <Link to={createPageUrl('ProductManagement')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Product Hub
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>
                            {product.is_active ? (
                                <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
                            ) : (
                                <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>
                            )}
                        </div>
                        <p className="text-slate-600 mt-2">Version {product.version}</p>
                    </div>
                    <Button onClick={handleOpenForm}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Product
                    </Button>
                </div>
            </header>

             <div className="border-b border-slate-200 mb-6">
                <div className="flex gap-1">
                    <TabButton tabId="overview" label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <TabButton tabId="competitors" label="Competitive Intel" isActive={activeTab === 'competitors'} onClick={() => setActiveTab('competitors')} />
                    <TabButton tabId="collaterals" label="Collaterals" isActive={activeTab === 'collaterals'} onClick={() => setActiveTab('collaterals')} />
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6 max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 leading-relaxed">{product.description}</p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card>
                            <CardHeader><CardTitle>Key Features</CardTitle></CardHeader>
                            <CardContent>
                                {product.features?.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                                        {product.features.map((feature, i) => <li key={i}>{feature}</li>)}
                                    </ul>
                                ) : <p className="text-slate-500">No features listed.</p>}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Use Cases</CardTitle></CardHeader>
                            <CardContent>
                                {product.use_cases?.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-2 text-slate-600">
                                        {product.use_cases.map((useCase, i) => <li key={i}>{useCase}</li>)}
                                    </ul>
                                ) : <p className="text-slate-500">No use cases listed.</p>}
                            </CardContent>
                        </Card>
                    </div>
                     <Card>
                        <CardHeader><CardTitle>Pricing & Audience</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <h3 className="font-semibold mb-2">Pricing</h3>
                                <p className="text-slate-600">{product.pricing_model}{product.base_price && ` - $${product.base_price}`}</p>
                            </div>
                            {product.target_audience && (
                                <div>
                                    <h3 className="font-semibold mb-2">Target Audience</h3>
                                    <p className="text-slate-600">{product.target_audience}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'competitors' && (
                <div className="space-y-6">
                    {/* Competitive Intel content from ProductDetailView will go here */}
                     {linkedCompetitors.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {linkedCompetitors.map((competitor) => (
                               <Card key={competitor.id} className="border-orange-200 shadow-md">
                                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                {competitor.logo_url ? (
                                                    <img src={competitor.logo_url} alt={competitor.name} className="w-12 h-12 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <Shield className="w-6 h-6 text-orange-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <CardTitle className="text-xl text-slate-800">{competitor.name}</CardTitle>
                                                    {competitor.market_position && <Badge className="bg-orange-100 text-orange-800 mt-1">{competitor.market_position}</Badge>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {competitor.website && (
                                                    <a href={competitor.website} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                                                    </a>
                                                )}
                                                <Link to={createPageUrl(`CompetitorManagement?competitorId=${competitor.id}`)}>
                                                    <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                                                </Link>
                                            </div>
                                        </div>
                                        {competitor.description && <p className="text-slate-600 mt-3">{competitor.description}</p>}
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left Column */}
                                            <div className="space-y-4">
                                                {competitor.unique_selling_proposition && (
                                                    <div>
                                                        <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2"><Award className="w-4 h-4" />Their USP</h4>
                                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                            <p className="text-slate-700 font-medium">{competitor.unique_selling_proposition}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {competitor.key_features?.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><Package className="w-4 h-4" />Key Features</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {competitor.key_features.map((feature, i) => <Badge key={i} variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-xs">{feature}</Badge>)}
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" />Pricing Strategy</h4>
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                                                        {competitor.pricing_model && <p><span className="font-medium">Model:</span> {competitor.pricing_model}</p>}
                                                        {competitor.pricing_range && <p><span className="font-medium">Range:</span> {competitor.pricing_range}</p>}
                                                        {competitor.pricing_strategy && <p className="text-sm text-slate-600">{competitor.pricing_strategy}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Right Column */}
                                            <div className="space-y-4">
                                                {competitor.strengths?.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" />Their Strengths</h4>
                                                        <ul className="space-y-1">{competitor.strengths.map((strength, i) => <li key={i} className="flex items-center gap-2 text-sm"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-slate-700">{strength}</span></li>)}</ul>
                                                    </div>
                                                )}
                                                {competitor.weaknesses?.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2"><XCircle className="w-4 h-4" />Their Weaknesses</h4>
                                                        <ul className="space-y-1">{competitor.weaknesses.map((weakness, i) => <li key={i} className="flex items-center gap-2 text-sm"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span className="text-slate-700">{weakness}</span></li>)}</ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg">
                            <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-800 mb-2">No Competitors Linked</h3>
                            <p className="text-slate-600 mb-6">Link competitors to this product to access competitive intelligence.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'collaterals' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {product.collaterals?.length > 0 ? (
                        product.collaterals.map((item, i) => (
                            <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-2">
                                    {item.type === 'Image' ? <Image className="w-5 h-5 text-blue-500" /> :
                                     item.type === 'Video' ? <Video className="w-5 h-5 text-purple-500" /> :
                                     item.type === 'Audio' ? <Music className="w-5 h-5 text-green-500" /> :
                                     item.type === 'PDF' ? <FileText className="w-5 h-5 text-red-500" /> :
                                     item.type === 'Presentation' ? <Presentation className="w-5 h-5 text-orange-500" /> :
                                     <File className="w-5 h-5 text-slate-500" />}
                                    
                                    <div className="flex-1">
                                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{item.description}</p>
                                {item.file_url && (
                                    <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <LinkIcon className="w-4 h-4 mr-2" /> View File
                                        </Button>
                                    </a>
                                )}
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-500">No collaterals uploaded yet</p>
                        </div>
                    )}
                </div>
            )}
            
            {isFormOpen && (
                <ProductForm 
                    open={isFormOpen} 
                    onOpenChange={setIsFormOpen} 
                    product={product} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
}
