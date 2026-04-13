import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit2, Trash2, Eye, ToggleRight, ToggleLeft, Search as SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function ManageBotTemplates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    difficulty_level: 'intermediate',
    company: '',
    role: '',
    objections: '',
    personality_traits: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_clients')
        .select('*')
        .eq('is_scenario_template', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('ai_clients')
        .insert([{
          name: formData.name,
          description: formData.description,
          industry: formData.industry,
          difficulty_level: formData.difficulty_level,
          company: formData.company,
          is_scenario_template: true,
          is_public: true
        }]);

      if (error) throw error;

      toast.success('Scenario template created successfully!');
      setFormData({
        name: '',
        description: '',
        industry: '',
        difficulty_level: 'intermediate',
        company: '',
        role: '',
        objections: '',
        personality_traits: ''
      });
      setShowCreateDialog(false);
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublic = async (template) => {
    try {
      const { error } = await supabase
        .from('ai_clients')
        .update({ is_public: !template.is_public })
        .eq('id', template.id);

      if (error) throw error;

      toast.success(template.is_public ? 'Template made private' : 'Template made public');
      loadTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('ai_clients')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 font-medium">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Manage Bot Templates</h1>
          <p className="text-slate-600">Create and manage scenario templates for users to customize</p>
        </div>

        {/* Top Actions */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-300"
            />
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-5 h-5" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Scenario Template</DialogTitle>
                <DialogDescription>
                  Create a new scenario template that users can customize
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Enterprise Buyer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this scenario template..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="font-medium">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, Finance"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="font-medium">Difficulty Level</Label>
                  <select
                    id="difficulty"
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <Button onClick={handleCreateTemplate} className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates List */}
        {filteredTemplates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No templates yet</h3>
                <p className="text-slate-600 mb-4">Create your first scenario template</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-2">{template.description}</CardDescription>
                    </div>
                    <Badge variant={template.is_public ? 'default' : 'secondary'}>
                      {template.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.industry && (
                      <Badge variant="outline">{template.industry}</Badge>
                    )}
                    {template.difficulty_level && (
                      <Badge variant="outline">{template.difficulty_level}</Badge>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePublic(template)}
                      className="gap-2"
                    >
                      {template.is_public ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Make Public
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
