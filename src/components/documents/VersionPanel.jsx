import React, { useState, useEffect } from 'react';
import { DocumentVersion } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    Clock, Upload, Download, FileText, 
    Plus, Eye, RotateCcw, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { UploadFile } from '@/api/integrations';

export default function VersionPanel({ document, onVersionChange }) {
    const [versions, setVersions] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [newVersionData, setNewVersionData] = useState({
        version_number: '',
        change_summary: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [showNewVersionDialog, setShowNewVersionDialog] = useState(false);

    useEffect(() => {
        if (document?.id) {
            loadVersions();
        }
    }, [document?.id]);

    const loadVersions = async () => {
        if (!document?.id) return;
        
        try {
            const versionData = await DocumentVersion.filter(
                { document_id: document.id },
                '-created_date'
            );
            setVersions(versionData);
        } catch (error) {
            console.error('Error loading versions:', error);
        }
    };

    const generateNextVersion = () => {
        if (versions.length === 0) return '1.0';
        
        const currentVersions = versions.map(v => v.version_number).sort();
        const latest = currentVersions[0] || '1.0';
        const [major, minor] = latest.split('.').map(Number);
        
        return `${major}.${(minor || 0) + 1}`;
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
        } else {
            toast.error('Please select a PDF file');
        }
    };

    const createNewVersion = async () => {
        if (!selectedFile || !newVersionData.change_summary.trim()) {
            toast.error('Please select a file and provide a change summary');
            return;
        }

        setIsUploading(true);
        try {
            // Upload the new file
            const uploadResult = await UploadFile({ file: selectedFile });
            if (!uploadResult?.file_url) {
                throw new Error('File upload failed');
            }

            // Mark all existing versions as not current
            for (const version of versions) {
                if (version.is_current) {
                    await DocumentVersion.update(version.id, { is_current: false });
                }
            }

            // Create new version
            const versionNumber = newVersionData.version_number || generateNextVersion();
            await DocumentVersion.create({
                document_id: document.id,
                version_number: versionNumber,
                file_url: uploadResult.file_url,
                thumbnail_url: `https://placehold.co/300x400/f8fafc/64748b?text=PDF+v${versionNumber}`,
                change_summary: newVersionData.change_summary,
                is_current: true,
                file_size: selectedFile.size,
                upload_method: 'manual'
            });

            // Update the main document with the new file URL
            if (onVersionChange) {
                onVersionChange(uploadResult.file_url, versionNumber);
            }

            toast.success('New version created successfully!');
            setShowNewVersionDialog(false);
            setNewVersionData({ version_number: '', change_summary: '' });
            setSelectedFile(null);
            loadVersions();
        } catch (error) {
            console.error('Error creating version:', error);
            toast.error('Failed to create new version');
        } finally {
            setIsUploading(false);
        }
    };

    const revertToVersion = async (version) => {
        try {
            // Mark all versions as not current
            for (const v of versions) {
                if (v.is_current) {
                    await DocumentVersion.update(v.id, { is_current: false });
                }
            }

            // Mark selected version as current
            await DocumentVersion.update(version.id, { is_current: true });

            if (onVersionChange) {
                onVersionChange(version.file_url, version.version_number);
            }

            toast.success(`Reverted to version ${version.version_number}`);
            loadVersions();
        } catch (error) {
            console.error('Error reverting version:', error);
            toast.error('Failed to revert to version');
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Document Versions</h3>
                <Dialog open={showNewVersionDialog} onOpenChange={setShowNewVersionDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Version
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Version</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Version Number</label>
                                <Input
                                    placeholder={`Auto: ${generateNextVersion()}`}
                                    value={newVersionData.version_number}
                                    onChange={(e) => setNewVersionData({ ...newVersionData, version_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Change Summary *</label>
                                <Textarea
                                    placeholder="Describe what changed in this version..."
                                    value={newVersionData.change_summary}
                                    onChange={(e) => setNewVersionData({ ...newVersionData, change_summary: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">PDF File *</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {selectedFile && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowNewVersionDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={createNewVersion} disabled={isUploading}>
                                    {isUploading ? (
                                        <>
                                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Create Version
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {versions.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-6">
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No versions yet</p>
                            <p className="text-sm text-gray-400">Create versions to track changes</p>
                        </CardContent>
                    </Card>
                ) : (
                    versions.map((version) => (
                        <Card key={version.id} className={version.is_current ? 'ring-2 ring-blue-500' : ''}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold">Version {version.version_number}</h4>
                                            {version.is_current && (
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{version.change_summary}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(version.created_date), 'MMM d, yyyy h:mm a')}
                                            </span>
                                            {version.file_size && (
                                                <span>{formatFileSize(version.file_size)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!version.is_current && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => revertToVersion(version)}
                                            >
                                                <RotateCcw className="w-4 h-4 mr-1" />
                                                Revert
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={version.file_url} target="_blank" rel="noopener noreferrer">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </a>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={version.file_url} download>
                                                <Download className="w-4 h-4 mr-1" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}