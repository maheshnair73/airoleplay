import React, { useState, useEffect } from 'react';
import { Competitor } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Shield, Link as LinkIcon, Search, ThumbsUp, ThumbsDown, X, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

const TagInput = ({ items, onItemsChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const newItem = inputValue.trim();
            if (!items?.includes(newItem)) {
                onItemsChange([...(items || []), newItem]);
            }
            setInputValue('');
        }
    };
    const removeItem = (indexToRemove) => {
        onItemsChange(items.filter((_, index) => index !== indexToRemove));
    };
    return (
        <div>
            <Input placeholder={placeholder} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} className="mb-2" />
            <div className="flex flex-wrap gap-2">
                {(items || []).map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1.5 py-1 px-2">
                        {item}
                        <button type="button" onClick={() => removeItem(index)} className="rounded-full hover:bg-slate-300 p-0.5">
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
};

const CompetitorForm = ({ open, onOpenChange, competitor, onSave }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (open) {
            setFormData(competitor || {
                name: '',
                website: '',
                strengths: [],
                weaknesses: [],
                key_differentiators: [],
                pricing_strategy: '',
                notes: ''
            });
        }
    }, [competitor, open]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Competitor name is required.");
            return;
        }

        try {
            if (competitor) {
                await Competitor.update(competitor.id, formData);
                toast.success('Competitor updated successfully!');
            } else {
                await Competitor.create(formData);
                toast.success('Competitor added successfully!');
            }
            onSave();
        } catch (error) {
            console.error('Error saving competitor:', error);
            toast.error('Failed to save competitor.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{competitor ? 'Edit Competitor' : 'Add New Competitor'}</DialogTitle>
                    <DialogDescription>
                        {competitor ? `Editing "${competitor.name}"` : 'Add a new competitor to your intelligence hub.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Competitor Name*</label>
                            <Input value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., RivalTech" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Website</label>
                            <Input value={formData.website || ''} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://rivaltech.com" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Strengths (Press Enter to add)</label>
                        <TagInput items={formData.strengths || []} onItemsChange={(items) => handleChange('strengths', items)} placeholder="e.g., Strong brand, Large user base..." />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Weaknesses (Press Enter to add)</label>
                        <TagInput items={formData.weaknesses || []} onItemsChange={(items) => handleChange('weaknesses', items)} placeholder="e.g., High price, Slow innovation..." />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Our Key Differentiators (Press Enter to add)</label>
                        <TagInput items={formData.key_differentiators || []} onItemsChange={(items) => handleChange('key_differentiators', items)} placeholder="e.g., Better UI/UX, Superior AI..." />
                    </div>
                     <div>
                        <label className="text-sm font-medium mb-1 block">Pricing Strategy</label>
                        <Textarea value={formData.pricing_strategy || ''} onChange={(e) => handleChange('pricing_strategy', e.target.value)} placeholder="Describe their pricing model (e.g., tiered, usage-based) and typical price points." />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">General Notes</label>
                        <Textarea value={formData.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Any other relevant intel, like recent news, key customers, or sales tactics." />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">{competitor ? 'Save Changes' : 'Add Competitor'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const CompetitorCard = ({ competitor, onEdit, onDelete }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{competitor.name}</CardTitle>
                    {competitor.website && (
                        <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            Visit Website
                        </a>
                    )}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(competitor)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(competitor)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {competitor.strengths?.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-green-500" />Strengths</h4>
                    <div className="flex flex-wrap gap-1">
                        {competitor.strengths.map((item, i) => <Badge key={i} className="bg-green-100 text-green-800">{item}</Badge>)}
                    </div>
                </div>
            )}
            {competitor.weaknesses?.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><ThumbsDown className="w-4 h-4 text-red-500" />Weaknesses</h4>
                    <div className="flex flex-wrap gap-1">
                        {competitor.weaknesses.map((item, i) => <Badge key={i} className="bg-red-100 text-red-800">{item}</Badge>)}
                    </div>
                </div>
            )}
            {competitor.key_differentiators?.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" />Our Differentiators</h4>
                    <div className="flex flex-wrap gap-1">
                        {competitor.key_differentiators.map((item, i) => <Badge key={i} variant="outline" className="border-yellow-400">{item}</Badge>)}
                    </div>
                </div>
            )}
             {competitor.pricing_strategy && (
                 <div>
                    <h4 className="font-semibold text-sm mb-2">Pricing Strategy</h4>
                    <p className="text-sm text-slate-600">{competitor.pricing_strategy}</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default function CompetitorManagement() {
    const [competitors, setCompetitors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCompetitor, setEditingCompetitor] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCompetitors();
    }, []);

    const loadCompetitors = async () => {
        setIsLoading(true);
        try {
            const data = await Competitor.list('-updated_date');
            setCompetitors(data);
        } catch (error) {
            toast.error('Failed to load competitors');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOpenForm = (competitor = null) => {
        setEditingCompetitor(competitor);
        setIsFormOpen(true);
    };

    const handleSave = () => {
        setIsFormOpen(false);
        setEditingCompetitor(null);
        loadCompetitors();
    };

    const handleDelete = async (competitor) => {
        if (window.confirm(`Are you sure you want to delete "${competitor.name}"?`)) {
            try {
                await Competitor.delete(competitor.id);
                toast.success(`"${competitor.name}" deleted.`);
                loadCompetitors();
            } catch (error) {
                toast.error('Failed to delete competitor.');
            }
        }
    };
    
    const filteredCompetitors = competitors.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
            <header className="mb-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Competitor Intel Hub</h1>
                        <p className="text-slate-600 mt-2">Centralize competitive analysis to arm your sales team.</p>
                    </div>
                    <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Competitor
                    </Button>
                </div>
                <div className="mt-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Search competitors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 max-w-lg"
                    />
                </div>
            </header>

            {isLoading ? (
                 <div className="text-center py-16"><p>Loading competitors...</p></div>
            ) : filteredCompetitors.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCompetitors.map((competitor) => (
                        <CompetitorCard 
                            key={competitor.id} 
                            competitor={competitor} 
                            onEdit={handleOpenForm} 
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Shield className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-slate-900">No Competitors Found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {searchQuery ? `No results for "${searchQuery}".` : "Get started by adding your first competitor."}
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => handleOpenForm()}>
                            <Plus className="-ml-1 mr-2 h-5 w-5" />
                            Add Competitor
                        </Button>
                    </div>
                </div>
            )}
            
            <CompetitorForm open={isFormOpen} onOpenChange={setIsFormOpen} competitor={editingCompetitor} onSave={handleSave} />
        </div>
    );
}