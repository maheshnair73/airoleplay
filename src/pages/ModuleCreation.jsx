import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus, Edit2, Trash2, Share2, Users, Lock, Globe, Mail, Loader2,
  BookOpen, Zap, Target, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function ModuleCreation() {
  const [modules, setModules] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const [formData, setFormData] = useState({
    moduleName: '',
    description: '',
    moduleType: 'roleplay',
    difficultyLevel: 'intermediate',
    isPublished: false
  });

  const [sharingConfig, setSharingConfig] = useState({
    shareType: 'all_users',
    targetRole: '',
    targetEmails: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      loadModules();
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_modules_new')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load modules');
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('practice_modules_new')
        .insert([{
          module_name: formData.moduleName,
          description: formData.description,
          module_type: formData.moduleType,
          difficulty_level: formData.difficultyLevel,
          is_published: formData.isPublished,
          created_by_email: currentUser?.email,
          company_id: currentUser?.company_id
        }])
        .select();

      if (error) throw error;

      toast.success('Module created successfully!');
      setFormData({
        moduleName: '',
        description: '',
        moduleType: 'roleplay',
        difficultyLevel: 'intermediate',
        isPublished: false
      });
      loadModules();
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create module');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveSharing = async () => {
    if (!selectedModule) return;

    try {
      await supabase
        .from('module_sharing_rules_new')
        .delete()
        .eq('module_id', selectedModule.id);

      const rulesToInsert = [{
        module_id: selectedModule.id,
        share_type: sharingConfig.shareType,
        target_role: sharingConfig.shareType === 'by_role' ? sharingConfig.targetRole : null,
        target_email: sharingConfig.shareType === 'specific_users' ? sharingConfig.targetEmails[0] : null
      }];

      const { error } = await supabase
        .from('module_sharing_rules_new')
        .insert(rulesToInsert);

      if (error) throw error;

      toast.success('Sharing settings saved!');
      setShowShareDialog(false);
      loadModules();
    } catch (error) {
      console.error('Error saving sharing:', error);
      toast.error('Failed to save sharing settings');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;

    try {
      const { error } = await supabase
        .from('practice_modules_new')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      toast.success('Module deleted');
      loadModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Module Management</h1>
        <p className="text-muted-foreground mt-2">Create and manage practice modules for your team</p>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modules">My Modules</TabsTrigger>
          <TabsTrigger value="create">Create Module</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Module</CardTitle>
              <CardDescription>Set up a practice module for your team members</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateModule} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="moduleName">Module Name</Label>
                  <Input
                    id="moduleName"
                    placeholder="e.g., Cold Call Mastery"
                    value={formData.moduleName}
                    onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this module covers..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="moduleType">Module Type</Label>
                    <Select value={formData.moduleType} onValueChange={(value) => setFormData({ ...formData, moduleType: value })}>
                      <SelectTrigger id="moduleType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="roleplay">Roleplay Scenario</SelectItem>
                        <SelectItem value="scenario">Sales Scenario</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                        <SelectItem value="skill">Skill Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={formData.difficultyLevel} onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}>
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <Label htmlFor="published" className="font-normal cursor-pointer">
                    Publish module immediately
                  </Label>
                </div>

                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Module
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          {modules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No modules created yet. Create your first module!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {modules.map((module) => (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{module.module_name}</CardTitle>
                        <CardDescription className="mt-2">{module.description}</CardDescription>
                      </div>
                      <Badge variant={module.is_published ? 'default' : 'secondary'}>
                        {module.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">
                        {module.module_type.charAt(0).toUpperCase() + module.module_type.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {module.difficulty_level.charAt(0).toUpperCase() + module.difficulty_level.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedModule(module)}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Share Module</DialogTitle>
                            <DialogDescription>
                              Choose who can access this module
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <Label className="text-base font-semibold">Share With</Label>

                              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                                onClick={() => setSharingConfig({ ...sharingConfig, shareType: 'all_users' })}>
                                <Checkbox
                                  checked={sharingConfig.shareType === 'all_users'}
                                  onCheckedChange={() => setSharingConfig({ ...sharingConfig, shareType: 'all_users' })}
                                />
                                <div>
                                  <Globe className="w-4 h-4 inline mr-2" />
                                  <Label className="font-normal cursor-pointer">All Users in Company</Label>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                                onClick={() => setSharingConfig({ ...sharingConfig, shareType: 'by_role' })}>
                                <Checkbox
                                  checked={sharingConfig.shareType === 'by_role'}
                                  onCheckedChange={() => setSharingConfig({ ...sharingConfig, shareType: 'by_role' })}
                                />
                                <div>
                                  <Users className="w-4 h-4 inline mr-2" />
                                  <Label className="font-normal cursor-pointer">By Role</Label>
                                </div>
                              </div>

                              {sharingConfig.shareType === 'by_role' && (
                                <Select value={sharingConfig.targetRole} onValueChange={(value) => setSharingConfig({ ...sharingConfig, targetRole: value })}>
                                  <SelectTrigger className="ml-8">
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sales_agent">Sales Agent</SelectItem>
                                    <SelectItem value="sales_manager">Sales Manager</SelectItem>
                                    <SelectItem value="company_admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}

                              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                                onClick={() => setSharingConfig({ ...sharingConfig, shareType: 'specific_users' })}>
                                <Checkbox
                                  checked={sharingConfig.shareType === 'specific_users'}
                                  onCheckedChange={() => setSharingConfig({ ...sharingConfig, shareType: 'specific_users' })}
                                />
                                <div>
                                  <Mail className="w-4 h-4 inline mr-2" />
                                  <Label className="font-normal cursor-pointer">Specific Users</Label>
                                </div>
                              </div>
                            </div>

                            <Button onClick={handleSaveSharing} className="w-full">
                              Save Sharing Settings
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
