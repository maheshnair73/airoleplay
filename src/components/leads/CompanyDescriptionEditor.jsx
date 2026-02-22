import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lead } from '@/api/entities';
import { Building, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanyDescriptionEditor({ lead, onLeadUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(lead.company_description || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedLead = await Lead.update(lead.id, {
                company_description: description
            });
            onLeadUpdate(updatedLead);
            setIsEditing(false);
            toast.success('Company description updated successfully!');
        } catch (error) {
            console.error('Error updating company description:', error);
            toast.error('Failed to update company description');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setDescription(lead.company_description || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">About Company</h4>
                <div className="space-y-4">
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter company overview, description, key facts, or any relevant information about this company..."
                        className="min-h-32"
                        rows={6}
                    />
                    <div className="flex gap-3">
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-800">About Company</h4>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                >
                    <Edit className="w-4 h-4 mr-2" />
                    {lead.company_description ? 'Edit' : 'Add'}
                </Button>
            </div>
            
            {lead.company_description ? (
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.company_description}</p>
                </div>
            ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                    <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 mb-2">No company overview available</p>
                    <p className="text-sm text-slate-400">Click "Add" to provide information about this company</p>
                </div>
            )}
        </div>
    );
}