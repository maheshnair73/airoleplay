import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Circle, XCircle, Edit, Save } from 'lucide-react';
import { Lead } from '@/api/entities';
import { LeadActivity } from '@/api/entities';
import { toast } from 'sonner';

export default function LeadStageIndicator({ currentStatus, lead, onLeadUpdate }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [statusNotes, setStatusNotes] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const stages = [
        { key: 'new', label: 'New', color: 'bg-blue-500' },
        { key: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
        { key: 'won', label: 'Won', color: 'bg-green-500' },
        { key: 'lost', label: 'Lost', color: 'bg-red-500' }
    ];

    const statusOptions = [
        { value: 'new', label: 'New', stage: 'new' },
        { value: 'contacted', label: 'Contacted', stage: 'in_progress' },
        { value: 'qualified', label: 'Qualified', stage: 'in_progress' },
        { value: 'meeting_scheduled', label: 'Meeting Scheduled', stage: 'in_progress' },
        { value: 'proposal_sent', label: 'Proposal Sent', stage: 'in_progress' },
        { value: 'negotiation', label: 'Negotiation', stage: 'in_progress' },
        { value: 'closed_won', label: 'Closed Won', stage: 'won' },
        { value: 'closed_lost', label: 'Closed Lost', stage: 'lost' }
    ];

    // Map current status to stage
    const getStageFromStatus = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption ? statusOption.stage : 'new';
    };

    const currentStage = getStageFromStatus(currentStatus);
    const currentStageIndex = stages.findIndex(stage => stage.key === currentStage);

    const getStageIcon = (stage, index) => {
        if (currentStage === 'lost' && stage.key === 'lost') {
            return <XCircle className="w-5 h-5 text-white" />;
        }
        if (currentStage === 'won' && stage.key === 'won') {
            return <CheckCircle className="w-5 h-5 text-white" />;
        }
        if (index < currentStageIndex || (index === currentStageIndex && currentStage !== 'lost')) {
            return <CheckCircle className="w-5 h-5 text-white" />;
        }
        return <Circle className="w-5 h-5 text-white" />;
    };

    const getStageStatus = (stage, index) => {
        if (currentStage === 'lost') {
            if (stage.key === 'lost') return 'current-lost';
            if (index < stages.findIndex(s => s.key === 'lost')) return 'completed';
            return 'pending';
        }
        if (currentStage === 'won') {
            if (stage.key === 'won') return 'current-won';
            if (index < stages.findIndex(s => s.key === 'won')) return 'completed';
            return 'skipped';
        }
        if (index < currentStageIndex) return 'completed';
        if (index === currentStageIndex) return 'current';
        return 'pending';
    };

    const handleStageUpdate = async () => {
        if (!selectedStatus || selectedStatus === currentStatus) {
            setIsEditModalOpen(false);
            return;
        }

        setIsUpdating(true);
        try {
            // Update lead status
            await Lead.update(lead.id, { status: selectedStatus });

            // Log activity
            await LeadActivity.create({
                lead_id: lead.id,
                activity_type: 'Status Change',
                disposition: selectedStatus,
                notes: statusNotes || `Status changed to ${selectedStatus}`
            });

            // Update parent component
            if (onLeadUpdate) {
                onLeadUpdate({ status: selectedStatus });
            }

            toast.success(`Lead status updated to ${statusOptions.find(opt => opt.value === selectedStatus)?.label}`);
            setIsEditModalOpen(false);
            setStatusNotes('');

        } catch (error) {
            console.error('Error updating lead status:', error);
            toast.error('Failed to update lead status');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-700">Lead Stage</h3>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-1"
                    >
                        <Edit className="w-3 h-3" />
                        Update
                    </Button>
                </div>
                <div className="flex items-center justify-between">
                    {stages.map((stage, index) => {
                        const status = getStageStatus(stage, index);
                        const isActive = status === 'current' || status === 'current-won' || status === 'current-lost';
                        const isCompleted = status === 'completed';
                        const isLost = status === 'current-lost';
                        const isWon = status === 'current-won';

                        return (
                            <div key={stage.key} className="flex flex-col items-center flex-1">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105
                                    ${isActive || isCompleted ? stage.color : 'bg-slate-200'}
                                    ${isActive ? 'ring-4 ring-opacity-20' : ''}
                                    ${isActive && !isLost && !isWon ? 'ring-yellow-300' : ''}
                                    ${isWon ? 'ring-green-300' : ''}
                                    ${isLost ? 'ring-red-300' : ''}
                                `}
                                onClick={() => setIsEditModalOpen(true)}
                                >
                                    {getStageIcon(stage, index)}
                                </div>
                                <span className={`
                                    mt-2 text-xs font-medium
                                    ${isActive ? 'text-slate-900' : 'text-slate-500'}
                                `}>
                                    {stage.label}
                                </span>
                                {isActive && (
                                    <Badge className={`
                                        mt-1 text-xs px-2 py-0.5
                                        ${isWon ? 'bg-green-100 text-green-800' : ''}
                                        ${isLost ? 'bg-red-100 text-red-800' : ''}
                                        ${!isWon && !isLost ? 'bg-yellow-100 text-yellow-800' : ''}
                                    `}>
                                        {isWon ? 'Closed Won' : isLost ? 'Closed Lost' : 'Current'}
                                    </Badge>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* Current Status Detail */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Current Status</p>
                            <p className="text-sm font-medium text-slate-900">
                                {statusOptions.find(opt => opt.value === currentStatus)?.label || currentStatus}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">Progress</p>
                            <p className="text-sm font-medium text-slate-900">
                                {Math.round(((currentStageIndex + 1) / stages.length) * 100)}%
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                                currentStage === 'won' ? 'bg-green-500' : 
                                currentStage === 'lost' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.round(((currentStageIndex + 1) / stages.length) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Edit Status Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Lead Status</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">New Status</label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                            <Textarea
                                placeholder="Why is this status changing? Any additional context..."
                                value={statusNotes}
                                onChange={(e) => setStatusNotes(e.target.value)}
                                className="min-h-20"
                            />
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleStageUpdate}
                                disabled={isUpdating || selectedStatus === currentStatus}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isUpdating ? (
                                    <>Updating...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Status
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}