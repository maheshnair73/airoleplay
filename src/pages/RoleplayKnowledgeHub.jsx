import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import {
  FileText, Video, Headphones, Plus, Search, Clock, Award, TrendingUp,
  Upload, Eye, Trash2, Filter, BookOpen, Brain, Target, Play, Link as LinkIcon, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MATERIAL_TYPES = [
  { value: 'document', label: 'Document (PDF)', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'audio', label: 'Audio', icon: Headphones },
  { value: 'text', label: 'Text Content', icon: BookOpen }
];

const CATEGORIES = [
  'Product Knowledge',
  'Sales Methodology',
  'Objection Handling',
  'Discovery Questions',
  'Closing Techniques',
  'Industry Knowledge',
  'Compliance',
  'Case Studies'
];

export default function RoleplayKnowledgeHub() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [progress, setProgress] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    material_type: 'document',
    file_url: '',
    content_text: '',
    category: 'Product Knowledge',
    tags: []
  });
  const [uploadMethod, setUploadMethod] = useState('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, selectedCategory, selectedType]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      setIsAdmin(['admin', 'super_admin', 'company_admin', 'manager'].includes(user?.role));

      const { data: materialsData, error: materialsError } = await supabase
        .from('roleplay_knowledge_materials')
        .select('*')
        .eq('is_active', true)
        .order('created_date', { ascending: false });

      if (materialsError) throw materialsError;

      const { data: progressData } = await supabase
        .from('agent_material_progress')
        .select('*')
        .eq('user_email', user?.email || '');

      setMaterials(materialsData || []);
      setProgress(progressData || []);
    } catch (error) {
      console.error('Failed to load knowledge materials:', error);
      toast.error('Failed to load knowledge materials');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(m => m.material_type === selectedType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredMaterials(filtered);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `knowledge-materials/${currentUser?.company_id || 'public'}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setNewMaterial({ ...newMaterial, file_url: publicUrl });
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        handleFileUpload(file);
        return;
      }
    }
    const text = e.clipboardData.getData('text');
    if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
      setNewMaterial({ ...newMaterial, file_url: text });
      toast.success('URL pasted');
    }
  };

  const handleCreateMaterial = async () => {
    if (!newMaterial.title) {
      toast.error('Title is required');
      return;
    }

    if (newMaterial.material_type === 'text' && !newMaterial.content_text) {
      toast.error('Content is required for text materials');
      return;
    }

    if (newMaterial.material_type !== 'text' && !newMaterial.file_url) {
      toast.error('File URL is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('roleplay_knowledge_materials')
        .insert({
          ...newMaterial,
          uploaded_by: currentUser?.email || 'admin@effyai.com',
          company_id: currentUser?.company_id
        });

      if (error) throw error;

      toast.success('Knowledge material created successfully');
      setShowCreateModal(false);
      setNewMaterial({
        title: '',
        description: '',
        material_type: 'document',
        file_url: '',
        content_text: '',
        category: 'Product Knowledge',
        tags: []
      });
      setUploadMethod('file');
      loadData();
    } catch (error) {
      console.error('Failed to create material:', error);
      toast.error('Failed to create knowledge material');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const { error } = await supabase
        .from('roleplay_knowledge_materials')
        .update({ is_active: false })
        .eq('id', materialId);

      if (error) throw error;

      toast.success('Material deleted');
      loadData();
    } catch (error) {
      console.error('Failed to delete material:', error);
      toast.error('Failed to delete material');
    }
  };

  const getMaterialIcon = (type) => {
    const iconMap = {
      document: FileText,
      video: Video,
      audio: Headphones,
      text: BookOpen
    };
    return iconMap[type] || FileText;
  };

  const getMaterialProgress = (materialId) => {
    return progress.find(p => p.material_id === materialId);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Product Knowledge': 'bg-blue-100 text-blue-800',
      'Sales Methodology': 'bg-green-100 text-green-800',
      'Objection Handling': 'bg-purple-100 text-purple-800',
      'Discovery Questions': 'bg-orange-100 text-orange-800',
      'Closing Techniques': 'bg-red-100 text-red-800',
      'Industry Knowledge': 'bg-teal-100 text-teal-800',
      'Compliance': 'bg-gray-100 text-gray-800',
      'Case Studies': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalMaterials = materials.length;
  const practiceCount = progress.reduce((sum, p) => sum + p.times_practiced, 0);
  const avgMastery = progress.length > 0
    ? progress.reduce((sum, p) => sum + parseFloat(p.mastery_level), 0) / progress.length
    : 0;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-8 h-8 text-blue-600" />
              Roleplay Knowledge Hub
            </h1>
            <p className="text-slate-600 mt-1">
              Upload training materials and practice with AI roleplay
            </p>
          </div>
          {isAdmin && (
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Knowledge Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      placeholder="e.g., Product Feature Overview"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                      placeholder="Brief description of this material"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Material Type</Label>
                      <Select
                        value={newMaterial.material_type}
                        onValueChange={(val) => setNewMaterial({ ...newMaterial, material_type: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIAL_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newMaterial.category}
                        onValueChange={(val) => setNewMaterial({ ...newMaterial, category: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {newMaterial.material_type === 'text' ? (
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={newMaterial.content_text}
                        onChange={(e) => setNewMaterial({ ...newMaterial, content_text: e.target.value })}
                        placeholder="Paste your training content here"
                        rows={8}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label>Upload Method</Label>
                      <Tabs value={uploadMethod} onValueChange={setUploadMethod}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="file">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </TabsTrigger>
                          <TabsTrigger value="url">
                            <LinkIcon className="w-4 h-4 mr-2" />
                            URL
                          </TabsTrigger>
                          <TabsTrigger value="paste">
                            <FileText className="w-4 h-4 mr-2" />
                            Paste
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="file" className="mt-4">
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                              isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <p className="text-sm text-slate-600">Uploading...</p>
                              </div>
                            ) : newMaterial.file_url ? (
                              <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-full">
                                  <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-slate-900">File uploaded successfully</p>
                                <p className="text-xs text-slate-500 break-all max-w-full">
                                  {newMaterial.file_url}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setNewMaterial({ ...newMaterial, file_url: '' })}
                                >
                                  Change File
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-700 font-medium mb-1">
                                  Drag and drop your file here
                                </p>
                                <p className="text-sm text-slate-500 mb-4">or</p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  Browse Files
                                </Button>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file);
                                  }}
                                  accept=".pdf,.doc,.docx,.txt,.mp4,.mp3,.wav"
                                />
                                <p className="text-xs text-slate-500 mt-4">
                                  Supported: PDF, DOC, DOCX, TXT, MP4, MP3, WAV
                                </p>
                              </>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="url" className="mt-4">
                          <div className="space-y-2">
                            <Input
                              value={newMaterial.file_url}
                              onChange={(e) => setNewMaterial({ ...newMaterial, file_url: e.target.value })}
                              placeholder="https://example.com/document.pdf"
                            />
                            <p className="text-xs text-slate-500">
                              Enter a public URL to your document, video, or audio file
                            </p>
                          </div>
                        </TabsContent>

                        <TabsContent value="paste" className="mt-4">
                          <div
                            onPaste={handlePaste}
                            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors cursor-text"
                            tabIndex={0}
                          >
                            {newMaterial.file_url ? (
                              <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-full">
                                  <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-slate-900">Content pasted</p>
                                <p className="text-xs text-slate-500 break-all max-w-full">
                                  {newMaterial.file_url}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setNewMaterial({ ...newMaterial, file_url: '' })}
                                >
                                  Clear
                                </Button>
                              </div>
                            ) : (
                              <>
                                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-700 font-medium mb-1">
                                  Click here and paste (Ctrl+V / Cmd+V)
                                </p>
                                <p className="text-sm text-slate-500">
                                  Paste a file or URL from your clipboard
                                </p>
                              </>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                  <div>
                    <Label>Tags (comma separated)</Label>
                    <Input
                      value={newMaterial.tags.join(', ')}
                      onChange={(e) => setNewMaterial({
                        ...newMaterial,
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                      placeholder="e.g., SaaS, Enterprise, Q4 2024"
                    />
                  </div>
                  <Button onClick={handleCreateMaterial} className="w-full">
                    Create Material
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Materials</p>
                <p className="text-2xl font-bold text-slate-900">{totalMaterials}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Practice Sessions</p>
                <p className="text-2xl font-bold text-slate-900">{practiceCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Mastery</p>
                <p className="text-2xl font-bold text-slate-900">{Math.round(avgMastery)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Materials Studied</p>
                <p className="text-2xl font-bold text-slate-900">{progress.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {MATERIAL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(material => {
            const Icon = getMaterialIcon(material.material_type);
            const userProgress = getMaterialProgress(material.id);
            return (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {material.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge className={getCategoryColor(material.category)}>
                      {material.category}
                    </Badge>
                    {material.tags?.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userProgress && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Times Practiced</span>
                          <span className="font-semibold text-slate-900">
                            {userProgress.times_practiced}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Accuracy</span>
                          <span className="font-semibold text-slate-900">
                            {userProgress.total_questions_asked > 0
                              ? Math.round((userProgress.total_questions_correct / userProgress.total_questions_asked) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Mastery Level</span>
                          <span className="font-semibold text-slate-900">
                            {Math.round(userProgress.mastery_level)}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3">
                      <Link to={createPageUrl(`AIRoleplay?materialId=${material.id}`)} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Brain className="w-4 h-4 mr-2" />
                          Practice with AI
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredMaterials.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-slate-500">
              <Brain className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No knowledge materials found</p>
              <p className="text-sm mt-1">
                {isAdmin
                  ? 'Click "Add Material" to upload your first training content'
                  : 'Ask your admin to upload training materials'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
