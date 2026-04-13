import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Play, CheckCircle, Clock, BookOpen, Send, MessageCircle, Users, Loader2,
  Target, Zap, Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function LetsPractice() {
  const [modules, setModules] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const [feedbackData, setFeedbackData] = useState({
    feedbackType: 'ai_bot',
    content: '',
    activityId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      loadModules(user.email);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadModules = async (userEmail) => {
    try {
      const { data, error } = await supabase
        .from('user_module_assignments_new')
        .select('*, module:practice_modules_new(*)')
        .eq('user_email', userEmail)
        .order('assignment_date', { ascending: false });

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load practice modules');
    }
  };

  const handleStartPractice = (module) => {
    window.location.href = createPageUrl('AIRoleplay');
  };

  const handleSubmitFeedbackRequest = async () => {
    if (!selectedModule || !feedbackData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('module_feedback_submissions_new')
        .insert([{
          user_email: currentUser?.email,
          module_id: selectedModule.module_id,
          activity_id: feedbackData.activityId || `activity_${Date.now()}`,
          feedback_type: feedbackData.feedbackType,
          submitted_by_email: currentUser?.email,
          feedback_content: {
            request: feedbackData.content,
            timestamp: new Date().toISOString()
          }
        }]);

      if (error) throw error;

      toast.success(`Feedback request submitted to ${feedbackData.feedbackType === 'ai_bot' ? 'AI Coach' : 'Team Member'}!`);
      setShowFeedbackDialog(false);
      setFeedbackData({ feedbackType: 'ai_bot', content: '', activityId: '' });
      setSelectedModule(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback request');
    }
  };

  const handleUpdateModuleStatus = async (moduleId, newStatus) => {
    try {
      const { error } = await supabase
        .from('user_module_assignments_new')
        .update({ status: newStatus })
        .eq('id', moduleId);

      if (error) throw error;

      toast.success('Status updated!');
      loadModules(currentUser?.email);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getFilteredModules = () => {
    if (activeTab === 'all') return modules;
    return modules.filter(m => m.status === activeTab);
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      assigned: Clock,
      in_progress: Play,
      completed: CheckCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading your modules...</p>
        </div>
      </div>
    );
  }

  const filteredModules = getFilteredModules();
  const completedCount = modules.filter(m => m.status === 'completed').length;
  const inProgressCount = modules.filter(m => m.status === 'in_progress').length;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Lets Practice</h1>
        <p className="text-muted-foreground mt-2 text-base">Your personalized practice modules assigned by your manager</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{modules.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Assigned to you</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">In Progress</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Currently practicing</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Modules finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Modules List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({modules.length})</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredModules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">No modules in this category</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredModules.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{assignment.module?.module_name}</CardTitle>
                        <CardDescription className="mt-2 text-sm">
                          {assignment.module?.description}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(assignment.status)} text-white`}>
                        <span className="flex items-center gap-1">
                          {React.createElement(getStatusIcon(assignment.status))}
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {assignment.module?.module_type.charAt(0).toUpperCase() + assignment.module?.module_type.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {assignment.module?.difficulty_level.charAt(0).toUpperCase() + assignment.module?.difficulty_level.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {assignment.status === 'assigned' && (
                        <Button
                          onClick={() => {
                            handleUpdateModuleStatus(assignment.id, 'in_progress');
                            handleStartPractice(assignment.module);
                          }}
                          className="gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Start Practicing
                        </Button>
                      )}

                      {assignment.status === 'in_progress' && (
                        <>
                          <Button
                            onClick={() => handleStartPractice(assignment.module)}
                            variant="default"
                            className="gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Continue
                          </Button>
                          <Button
                            onClick={() => handleUpdateModuleStatus(assignment.id, 'completed')}
                            variant="outline"
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                          </Button>
                        </>
                      )}

                      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedModule(assignment)}
                            className="gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Request Feedback
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Feedback</DialogTitle>
                            <DialogDescription>
                              Get feedback on your practice from AI Coach or your team
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold">Feedback From</label>
                              <Select value={feedbackData.feedbackType} onValueChange={(value) => setFeedbackData({ ...feedbackData, feedbackType: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ai_bot">AI Coach</SelectItem>
                                  <SelectItem value="human_review">Manager/Team</SelectItem>
                                  <SelectItem value="peer_feedback">Peer Feedback</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-semibold">Your Feedback Request</label>
                              <Textarea
                                placeholder="What specific feedback would you like? E.g., 'Help me improve my discovery questions' or 'Review my closing technique'"
                                value={feedbackData.content}
                                onChange={(e) => setFeedbackData({ ...feedbackData, content: e.target.value })}
                                rows={4}
                              />
                            </div>

                            <Button onClick={handleSubmitFeedbackRequest} className="w-full">
                              <Send className="w-4 h-4 mr-2" />
                              Submit Request
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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
