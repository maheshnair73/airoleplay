import React, { useState, useEffect } from 'react';
import { DocumentCollaborator } from '@/api/entities';
import { DocumentActivity } from '@/api/entities';
import { DocumentComment } from '@/api/entities';
import { DocumentApproval } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    Users, Plus, MessageSquare, Clock, CheckCircle, 
    XCircle, AlertCircle, User as UserIcon, Mail, 
    Edit3, Trash2, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CollaborationPanel({ document, onUpdate }) {
    const [collaborators, setCollaborators] = useState([]);
    const [activities, setActivities] = useState([]);
    const [comments, setComments] = useState([]);
    const [approvals, setApprovals] = useState([]);
    const [newCollaborator, setNewCollaborator] = useState({ email: '', role: 'viewer' });
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (document?.id) {
            loadData();
        }
    }, [document?.id]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    const loadData = async () => {
        if (!document?.id) return;
        
        try {
            const [collabData, activityData, commentData, approvalData] = await Promise.all([
                DocumentCollaborator.filter({ document_id: document.id }).catch(() => []),
                DocumentActivity.filter({ document_id: document.id }, '-created_date', 50).catch(() => []),
                DocumentComment.filter({ document_id: document.id }, '-created_date').catch(() => []),
                DocumentApproval.filter({ document_id: document.id }).catch(() => [])
            ]);

            setCollaborators(collabData);
            setActivities(activityData);
            setComments(commentData);
            setApprovals(approvalData);
        } catch (error) {
            console.error('Error loading collaboration data:', error);
        }
    };

    const addCollaborator = async () => {
        if (!newCollaborator.email || !document?.id) return;

        try {
            const permissions = {
                can_edit: newCollaborator.role === 'editor' || newCollaborator.role === 'owner',
                can_comment: true,
                can_approve: newCollaborator.role === 'editor' || newCollaborator.role === 'owner',
                can_share: newCollaborator.role === 'owner',
                can_delete: newCollaborator.role === 'owner'
            };

            await DocumentCollaborator.create({
                document_id: document.id,
                collaborator_email: newCollaborator.email,
                collaborator_name: newCollaborator.email.split('@')[0],
                role: newCollaborator.role,
                permissions,
                invited_by: user?.email
            });

            // Log activity
            await DocumentActivity.create({
                document_id: document.id,
                user_email: user?.email,
                user_name: user?.full_name || user?.email,
                activity_type: 'collaborator_added',
                description: `Added ${newCollaborator.email} as ${newCollaborator.role}`,
                metadata: { collaborator_email: newCollaborator.email }
            });

            setNewCollaborator({ email: '', role: 'viewer' });
            toast.success('Collaborator added successfully!');
            loadData();
        } catch (error) {
            console.error('Error adding collaborator:', error);
            toast.error('Failed to add collaborator');
        }
    };

    const addComment = async () => {
        if (!newComment.trim() || !document?.id) return;

        try {
            await DocumentComment.create({
                document_id: document.id,
                comment_text: newComment,
                author_email: user?.email,
                author_name: user?.full_name || user?.email,
                comment_type: 'general'
            });

            // Log activity
            await DocumentActivity.create({
                document_id: document.id,
                user_email: user?.email,
                user_name: user?.full_name || user?.email,
                activity_type: 'commented',
                description: `Added a comment: "${newComment.substring(0, 50)}${newComment.length > 50 ? '...' : ''}"`
            });

            setNewComment('');
            toast.success('Comment added!');
            loadData();
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            owner: 'bg-purple-100 text-purple-800',
            editor: 'bg-blue-100 text-blue-800',
            reviewer: 'bg-green-100 text-green-800',
            viewer: 'bg-gray-100 text-gray-800'
        };
        return colors[role] || colors.viewer;
    };

    const getActivityIcon = (type) => {
        const icons = {
            created: <Plus className="w-4 h-4" />,
            updated: <Edit3 className="w-4 h-4" />,
            commented: <MessageSquare className="w-4 h-4" />,
            collaborator_added: <Users className="w-4 h-4" />,
            approved: <CheckCircle className="w-4 h-4" />,
            rejected: <XCircle className="w-4 h-4" />
        };
        return icons[type] || <Clock className="w-4 h-4" />;
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="collaborators" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="collaborators">
                        <Users className="w-4 h-4 mr-2" />
                        People ({collaborators.length})
                    </TabsTrigger>
                    <TabsTrigger value="comments">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comments ({comments.length})
                    </TabsTrigger>
                    <TabsTrigger value="activity">
                        <Clock className="w-4 h-4 mr-2" />
                        Activity ({activities.length})
                    </TabsTrigger>
                    <TabsTrigger value="approvals">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approvals ({approvals.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="collaborators" className="space-y-4">
                    {/* Add Collaborator */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Add Collaborator</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Email address"
                                    value={newCollaborator.email}
                                    onChange={(e) => setNewCollaborator({ ...newCollaborator, email: e.target.value })}
                                    className="flex-1"
                                />
                                <Select
                                    value={newCollaborator.role}
                                    onValueChange={(value) => setNewCollaborator({ ...newCollaborator, role: value })}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                        <SelectItem value="reviewer">Reviewer</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={addCollaborator}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Collaborators List */}
                    <div className="space-y-2">
                        {collaborators.map((collaborator) => (
                            <Card key={collaborator.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>
                                                {(collaborator.collaborator_name || collaborator.collaborator_email).charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{collaborator.collaborator_name || collaborator.collaborator_email}</p>
                                            <p className="text-sm text-gray-500">{collaborator.collaborator_email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getRoleColor(collaborator.role)}>
                                            {collaborator.role}
                                        </Badge>
                                        {collaborator.invitation_status === 'pending' && (
                                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                    {/* Add Comment */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={3}
                                />
                                <div className="flex justify-end">
                                    <Button onClick={addComment} disabled={!newComment.trim()}>
                                        <Send className="w-4 h-4 mr-2" />
                                        Comment
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comments List */}
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <Card key={comment.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {(comment.author_name || comment.author_email).charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{comment.author_name || comment.author_email}</span>
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{comment.comment_text}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-3">
                    {activities.map((activity) => (
                        <Card key={activity.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {getActivityIcon(activity.activity_type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-medium">{activity.user_name || activity.user_email}</span>{' '}
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="approvals" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Approval Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {approvals.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No approval requests</p>
                            ) : (
                                <div className="space-y-3">
                                    {approvals.map((approval) => (
                                        <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{approval.approver_name || approval.approver_email}</p>
                                                <p className="text-sm text-gray-500">
                                                    Requested by {approval.requested_by}
                                                </p>
                                            </div>
                                            <Badge className={
                                                approval.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                                                approval.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                approval.approval_status === 'changes_requested' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                            }>
                                                {approval.approval_status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}