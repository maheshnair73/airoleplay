import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadContentMaterial } from '@/api/functions';
import { toast } from 'sonner';

export default function AIRoleplayContentUpload() {
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('product_knowledge');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('personal');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const ALLOWED_TYPES = ['pdf', 'docx', 'pptx', 'mp4', 'mp3'];

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_TYPES.includes(ext)) {
        toast.error(`${file.name} has unsupported format`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 100MB limit`);
        return false;
      }
      return true;
    });
    setFiles(validFiles);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.split(',').map(t => t.trim()).includes(tagInput.trim())) {
      setTags(tags ? `${tags}, ${tagInput}` : tagInput);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const tagArray = tags.split(',').map(t => t.trim());
    const filtered = tagArray.filter(t => t !== tagToRemove);
    setTags(filtered.join(', '));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    const uploaded = [];

    for (const file of files) {
      try {
        const metadata = {
          category,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          description,
          visibility
        };

        const result = await uploadContentMaterial(file, metadata);
        uploaded.push(result);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setUploadedFiles([...uploadedFiles, ...uploaded]);
    setFiles([]);
    setDescription('');
    setTags('');
    setUploading(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Practice Materials</h1>
        <p className="text-muted-foreground">Add content to use in your roleplay sessions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Materials</CardTitle>
          <CardDescription>Support formats: PDF, DOCX, PPTX, MP4, MP3 (max 100MB each)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors">
            <div className="flex flex-col items-center gap-3">
              <FileUp className="w-8 h-8 text-muted-foreground" />
              <p className="font-medium">Drag and drop files here or click to select</p>
              <input
                type="file"
                multiple
                onChange={handleFilesChange}
                accept=".pdf,.docx,.pptx,.mp4,.mp3"
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">{files.length} file(s) selected:</p>
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_knowledge">Product Knowledge</SelectItem>
                  <SelectItem value="objection_handling">Objection Handling</SelectItem>
                  <SelectItem value="discovery_questions">Discovery Questions</SelectItem>
                  <SelectItem value="sales_methodology">Sales Methodology</SelectItem>
                  <SelectItem value="case_studies">Case Studies</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Only</SelectItem>
                  <SelectItem value="company_wide">Company-wide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            {tags && (
              <div className="flex gap-2 flex-wrap mt-2">
                {tags.split(',').map(tag => (
                  <Badge
                    key={tag.trim()}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag.trim())}
                  >
                    {tag.trim()} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe this material..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full"
            size="lg"
          >
            {uploading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            {uploading ? 'Uploading...' : 'Upload Materials'}
          </Button>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recently Uploaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.category.replace(/_/g, ' ')} • {(file.file_size_kb / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Badge variant="outline">{file.visibility}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
