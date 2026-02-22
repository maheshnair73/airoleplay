import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    Brain, Plus, Edit, Trash2, Upload, Download, Zap, 
    Globe, FileText, MessageSquare, DollarSign, Building,
    Save, RefreshCw, CheckCircle, AlertTriangle, Copy, Wand2
} from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { toast } from 'sonner';

const FAQItem = ({ faq, index, onEdit, onDelete }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                            #{index + 1}
                        </Badge>
                        <h4 className="font-medium text-slate-800">{faq.question}</h4>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{faq.answer}</p>
                    {faq.category && (
                        <Badge variant="secondary" className="text-xs">
                            {faq.category}
                        </Badge>
                    )}
                </div>
                <div className="flex gap-2 ml-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(faq)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(faq.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
);

const FAQModal = ({ open, onOpenChange, faq, onSave }) => {
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'General'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (faq) {
            setFormData(faq);
        } else {
            setFormData({ question: '', answer: '', category: 'General' });
        }
    }, [faq, open]);

    const generateAnswer = async () => {
        if (!formData.question.trim()) {
            toast.error("Please enter a question first");
            return;
        }

        setIsGenerating(true);
        try {
            const prompt = `You are a helpful AI assistant for a sales team. Generate a professional, helpful answer to this customer question: "${formData.question}"
            
            The answer should be:
            - Clear and concise
            - Professional but friendly
            - Focused on helping the customer
            - Include a subtle call-to-action when appropriate
            
            Only return the answer text, nothing else.`;

            const answer = await InvokeLLM({ prompt });
            setFormData(prev => ({ ...prev, answer }));
            toast.success("Answer generated successfully!");
        } catch (error) {
            console.error('Error generating answer:', error);
            toast.error("Failed to generate answer. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!formData.question.trim() || !formData.answer.trim()) {
            toast.error("Please fill in both question and answer");
            return;
        }
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {faq ? 'Edit FAQ' : 'Add New FAQ'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        >
                            <option value="General">General</option>
                            <option value="Pricing">Pricing</option>
                            <option value="Features">Features</option>
                            <option value="Support">Support</option>
                            <option value="Integration">Integration</option>
                            <option value="Security">Security</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Question</label>
                        <Input
                            placeholder="What question do customers frequently ask?"
                            value={formData.question}
                            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Answer</label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateAnswer}
                                disabled={isGenerating || !formData.question.trim()}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0"
                            >
                                {isGenerating ? (
                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                    <Wand2 className="w-4 h-4 mr-1" />
                                )}
                                AI Generate
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Provide a helpful, professional answer..."
                            value={formData.answer}
                            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Save FAQ
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function AIAgentTraining() {
    const [activeTab, setActiveTab] = useState('company');
    const [trainingData, setTrainingData] = useState({
        websiteUrl: '',
        companyInfo: '',
        productInfo: '',
        pricing: ''
    });
    const [faqs, setFaqs] = useState([
        { id: 1, question: "What is your product?", answer: "Our product is a comprehensive sales automation platform that helps teams close more deals.", category: "General" },
        { id: 2, question: "How much does it cost?", answer: "We offer flexible pricing plans starting at $29/month per user. Contact us for enterprise pricing.", category: "Pricing" },
        { id: 3, question: "Do you offer a free trial?", answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required.", category: "General" }
    ]);
    const [showFaqModal, setShowFaqModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [isTraining, setIsTraining] = useState(false);

    const handleTrainingChange = (field, value) => {
        setTrainingData(prev => ({ ...prev, [field]: value }));
    };

    const startTraining = async () => {
        setIsTraining(true);
        try {
            // Simulate training process
            await new Promise(resolve => setTimeout(resolve, 3000));
            toast.success('AI Agent training completed successfully!');
        } catch (error) {
            toast.error('Training failed. Please try again.');
        } finally {
            setIsTraining(false);
        }
    };

    const handleFaqSave = (faqData) => {
        if (editingFaq) {
            setFaqs(prev => prev.map(faq => 
                faq.id === editingFaq.id ? { ...faqData, id: editingFaq.id } : faq
            ));
            toast.success('FAQ updated successfully!');
        } else {
            const newFaq = { ...faqData, id: Date.now() };
            setFaqs(prev => [...prev, newFaq]);
            toast.success('FAQ added successfully!');
        }
        setShowFaqModal(false);
        setEditingFaq(null);
    };

    const handleFaqEdit = (faq) => {
        setEditingFaq(faq);
        setShowFaqModal(true);
    };

    const handleFaqDelete = (faqId) => {
        setFaqs(prev => prev.filter(faq => faq.id !== faqId));
        toast.success('FAQ deleted successfully!');
    };

    const generateFaqsFromWebsite = async () => {
        if (!trainingData.websiteUrl) {
            toast.error("Please enter a website URL first");
            return;
        }

        try {
            const prompt = `Based on the website ${trainingData.websiteUrl}, generate 5 common FAQ questions and answers that a sales AI agent should be able to handle. 
            
            Return a JSON array of objects with this structure:
            [{"question": "...", "answer": "...", "category": "General|Pricing|Features|Support"}]`;

            const generatedFaqs = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        faqs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    answer: { type: "string" },
                                    category: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const newFaqs = generatedFaqs.faqs.map((faq, index) => ({
                ...faq,
                id: Date.now() + index
            }));

            setFaqs(prev => [...prev, ...newFaqs]);
            toast.success(`Generated ${newFaqs.length} FAQs from website!`);
        } catch (error) {
            console.error('Error generating FAQs:', error);
            toast.error("Failed to generate FAQs. Please try again.");
        }
    };

    return (
        <div className="p-6 space-y-8 bg-slate-50/50">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">AI Agent Training</h1>
                    <p className="text-slate-600 mt-2">Train your AI agent with comprehensive business knowledge</p>
                </div>
                <Button 
                    onClick={startTraining}
                    disabled={isTraining}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                    {isTraining ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Training AI...
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 mr-2" />
                            Train AI Agent
                        </>
                    )}
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="company">Company Info</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Company Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Website URL</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://yourcompany.com"
                                        value={trainingData.websiteUrl}
                                        onChange={(e) => handleTrainingChange('websiteUrl', e.target.value)}
                                    />
                                    <Button 
                                        variant="outline"
                                        onClick={generateFaqsFromWebsite}
                                        disabled={!trainingData.websiteUrl}
                                    >
                                        <Globe className="w-4 h-4 mr-1" />
                                        Crawl Site
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">AI will extract information from your website</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Company Overview</label>
                                <Textarea
                                    placeholder="Describe your company, mission, values, and what you do..."
                                    value={trainingData.companyInfo}
                                    onChange={(e) => handleTrainingChange('companyInfo', e.target.value)}
                                    rows={6}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Product Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Products & Services</label>
                                <Textarea
                                    placeholder="Describe your products, features, benefits, and use cases..."
                                    value={trainingData.productInfo}
                                    onChange={(e) => handleTrainingChange('productInfo', e.target.value)}
                                    rows={6}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Pricing Information</label>
                                <Textarea
                                    placeholder="Pricing plans, packages, enterprise options..."
                                    value={trainingData.pricing}
                                    onChange={(e) => handleTrainingChange('pricing', e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="faqs" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Frequently Asked Questions
                                </CardTitle>
                                <Button onClick={() => setShowFaqModal(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add FAQ
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {faqs.length > 0 ? (
                                <div className="space-y-4">
                                    {faqs.map((faq, index) => (
                                        <FAQItem
                                            key={faq.id}
                                            faq={faq}
                                            index={index}
                                            onEdit={handleFaqEdit}
                                            onDelete={handleFaqDelete}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No FAQs added yet</p>
                                    <p className="text-sm text-slate-400">Add your first FAQ to get started</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="w-5 h-5" />
                                Training Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Training Status</h4>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-blue-800">Last trained: 2 hours ago</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Training Data Sources</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-sm">Company Information</span>
                                        <Badge variant={trainingData.companyInfo ? "default" : "secondary"}>
                                            {trainingData.companyInfo ? "Complete" : "Missing"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-sm">Product Information</span>
                                        <Badge variant={trainingData.productInfo ? "default" : "secondary"}>
                                            {trainingData.productInfo ? "Complete" : "Missing"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-sm">FAQs</span>
                                        <Badge variant={faqs.length > 0 ? "default" : "secondary"}>
                                            {faqs.length} FAQs
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-sm">Pricing</span>
                                        <Badge variant={trainingData.pricing ? "default" : "secondary"}>
                                            {trainingData.pricing ? "Complete" : "Missing"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <FAQModal
                open={showFaqModal}
                onOpenChange={setShowFaqModal}
                faq={editingFaq}
                onSave={handleFaqSave}
            />
        </div>
    );
}