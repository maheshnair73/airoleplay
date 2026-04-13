import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Music, Video, Loader, Trash2, Eye, Upload } from 'lucide-react';
import { getContentLibrary, deleteContentMaterial, getContentUsageStats } from '@/api/functions';
import { toast } from 'sonner';

const FILE_ICONS = {
  pdf: FileText,
  docx: FileText,
  pptx: FileText,
  mp4: Video,
  mp3: Music
};

const CATEGORIES = [
  { value: 'product_knowledge', label: 'Product Knowledge' },
  { value: 'objection_handling', label: 'Objection Handling' },
  { value: 'discovery_questions', label: 'Discovery Questions' },
  { value: 'sales_methodology', label: 'Sales Methodology' },
  { value: 'case_studies', label: 'Case Studies' },
  { value: 'other', label: 'Other' }
];

export default function AIRoleplayContentLibrary() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [usageStats, setUsageStats] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, [category]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (category !== 'all') filters.category = category;
      if (search) filters.search = search;

      const data = await getContentLibrary(filters);
      setMaterials(data);

      const stats = {};
      for (const material of data) {
        const usage = await getContentUsageStats(material.id);
        stats[material.id] = usage.length;
      }
      setUsageStats(stats);
    } catch (error) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return;

    try {
      setDeleting(id);
      await deleteContentMaterial(id);
      setMaterials(materials.filter(m => m.id !== id));
      toast.success('Material deleted');
    } catch (error) {
      toast.error('Failed to delete material');
    } finally {
      setDeleting(null);
    }
  };

  const filteredMaterials = materials.filter(m =>
    m.file_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice Materials Library</h1>
          <p className="text-muted-foreground">Browse and manage your uploaded content</p>
        </div>
        <Button
          onClick={() => navigate('/upload-materials')}
          className="flex items-center gap-2"
          size="lg"
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={loadMaterials} disabled={loading}>
            {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            Refresh
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No materials found</p>
          </CardContent>
        </Card>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map(material => {
              const Icon = FILE_ICONS[material.file_type] || FileText;
              return (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <Icon className="w-8 h-8 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {material.file_type.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-medium truncate">{material.file_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(material.file_size_kb / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {material.description && (
                      <p className="text-sm line-clamp-2">{material.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {material.category.replace(/_/g, ' ')}
                      </Badge>
                      {material.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {usageStats[material.id] || 0} uses
                      </span>
                      <span>{material.visibility}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Use in Session
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                        disabled={deleting === material.id}
                      >
                        {deleting === material.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent>
              <div className="space-y-2">
                {filteredMaterials.map(material => {
                  const Icon = FILE_ICONS[material.file_type] || FileText;
                  return (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{material.file_name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {material.category.replace(/_/g, ' ')}
                            </Badge>
                            {material.tags?.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{(material.file_size_kb / 1024).toFixed(2)} MB</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {usageStats[material.id] || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Use
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                          disabled={deleting === material.id}
                        >
                          {deleting === material.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
