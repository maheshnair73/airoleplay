import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import {
  FileText, Video, Headphones, BookOpen, Eye, X, ChevronDown, ChevronUp, Info
} from 'lucide-react';

export default function MaterialViewer({ materialId, onClose, compact = false }) {
  const [material, setMaterial] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!compact);

  useEffect(() => {
    if (materialId) {
      loadMaterial();
    }
  }, [materialId]);

  const loadMaterial = async () => {
    setIsLoading(true);
    try {
      const { data: materialData, error: matError } = await supabase
        .from('roleplay_knowledge_materials')
        .select('*')
        .eq('id', materialId)
        .single();

      if (matError) throw matError;

      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: progressData } = await supabase
          .from('agent_material_progress')
          .select('*')
          .eq('user_email', user.email)
          .eq('material_id', materialId)
          .maybeSingle();

        setProgress(progressData);
      }

      setMaterial(materialData);
    } catch (error) {
      console.error('Failed to load material:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <Card className={compact ? 'w-full' : ''}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!material) {
    return null;
  }

  const Icon = getMaterialIcon(material.material_type);

  if (compact) {
    return (
      <Card className="w-full border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Study Material</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{material.title}</h4>
                <p className="text-sm text-slate-600">{material.description}</p>
              </div>

              {progress && (
                <div className="flex items-center gap-4 text-sm bg-white p-2 rounded-lg">
                  <div>
                    <span className="text-slate-600">Accuracy: </span>
                    <span className="font-semibold">
                      {progress.total_questions_asked > 0
                        ? Math.round((progress.total_questions_correct / progress.total_questions_asked) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Mastery: </span>
                    <span className="font-semibold">{Math.round(progress.mastery_level)}%</span>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-lg border">
                <div className="flex items-start gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600">
                    During this practice session, the AI will ask you questions about this material to test your knowledge.
                  </p>
                </div>
              </div>

              {material.material_type === 'text' && material.content_text && (
                <ScrollArea className="h-48 w-full border rounded-lg p-3 bg-white">
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">
                    {material.content_text}
                  </div>
                </ScrollArea>
              )}

              {material.material_type !== 'text' && material.file_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(material.file_url, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Material
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>{material.title}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{material.description}</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge>{material.category}</Badge>
          <Badge variant="outline">{material.material_type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content">
          <TabsList className="w-full">
            <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
            {progress && <TabsTrigger value="progress" className="flex-1">Progress</TabsTrigger>}
          </TabsList>
          <TabsContent value="content" className="space-y-4">
            {material.material_type === 'text' && material.content_text && (
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="text-sm text-slate-700 whitespace-pre-wrap">
                  {material.content_text}
                </div>
              </ScrollArea>
            )}
            {material.material_type === 'document' && material.file_url && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(material.file_url, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Open Document
                </Button>
                <iframe
                  src={material.file_url}
                  className="w-full h-96 border rounded-lg"
                  title={material.title}
                />
              </div>
            )}
            {material.material_type === 'video' && material.file_url && (
              <video
                src={material.file_url}
                controls
                className="w-full rounded-lg border"
              />
            )}
            {material.material_type === 'audio' && material.file_url && (
              <audio
                src={material.file_url}
                controls
                className="w-full"
              />
            )}
          </TabsContent>
          {progress && (
            <TabsContent value="progress" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-600">Times Practiced</p>
                    <p className="text-2xl font-bold text-slate-900">{progress.times_practiced}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-600">Questions Asked</p>
                    <p className="text-2xl font-bold text-slate-900">{progress.total_questions_asked}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-600">Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">
                      {progress.total_questions_asked > 0
                        ? Math.round((progress.total_questions_correct / progress.total_questions_asked) * 100)
                        : 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-600">Mastery Level</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(progress.mastery_level)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
