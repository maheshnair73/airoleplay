import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Star } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { InvokeLLM } from '@/api/integrations';
import { TaskSubmission } from '@/api/entities';
import { toast } from "sonner";

const CriterionRating = ({ criterion, value, onChange }) => (
    <div>
        <label className="font-medium text-sm">{criterion.name}</label>
        <p className="text-xs text-slate-500 mb-2">{criterion.description}</p>
        <div className="flex items-center gap-4">
            <Slider value={[value]} onValueChange={([val]) => onChange(val)} max={10} step={1} />
            <span className="font-bold text-blue-600 w-8 text-center">{value}</span>
        </div>
    </div>
);

export default function SubmissionReviewModal({ submission, task, isOpen, onOpenChange, onReviewed }) {
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [feedback, setFeedback] = useState({});
    
    useEffect(() => {
        if (submission) {
            const initialFeedback = task.evaluation_criteria.reduce((acc, crit) => {
                acc[crit.name] = 5;
                return acc;
            }, {});
            initialFeedback.strengths = '';
            initialFeedback.improvements = '';
            
            const existingFeedback = submission.manager_feedback ? JSON.parse(submission.manager_feedback) : (submission.ai_analysis ? JSON.parse(submission.ai_analysis) : {});
            setFeedback({ ...initialFeedback, ...existingFeedback });
        }
    }, [submission, task]);

    const handleGetAiAnalysis = async () => {
        setIsAiLoading(true);
        try {
            const criteriaList = task.evaluation_criteria.map(c => `"${c.name}"`).join(', ');
            const prompt = `As a sales coach, analyze this pitch transcript. Scenario: "${task.scenario}". Transcript: "${submission.transcript || 'No transcript available.'}" Please provide feedback in JSON format. The root object should have keys: "scores" (an object with keys for each criterion: ${criteriaList}, with values from 1-10), "strengths" (a string), and "improvements" (a string).`;
            
            const schema = {
                type: 'object',
                properties: {
                    scores: {
                        type: 'object',
                        properties: task.evaluation_criteria.reduce((acc, crit) => {
                            acc[crit.name] = { type: 'number', minimum: 1, maximum: 10 };
                            return acc;
                        }, {}),
                        required: task.evaluation_criteria.map(c => c.name)
                    },
                    strengths: { type: 'string' },
                    improvements: { type: 'string' }
                },
                required: ['scores', 'strengths', 'improvements']
            };

            const aiResponse = await InvokeLLM({ prompt, response_json_schema: schema });
            
            if (aiResponse) {
                const newFeedback = { ...feedback, ...aiResponse.scores, strengths: aiResponse.strengths, improvements: aiResponse.improvements };
                setFeedback(newFeedback);
                await TaskSubmission.update(submission.id, { ai_analysis: JSON.stringify(aiResponse) });
                toast.success("AI Analysis complete.");
            }
        } catch (error) { toast.error("Failed to get AI analysis."); }
        finally { setIsAiLoading(false); }
    };
    
    const handleFeedbackChange = (criterionName, value) => {
        setFeedback(prev => ({ ...prev, [criterionName]: value }));
    };

    const handleSubmitReview = async () => {
        const totalPossibleScore = task.evaluation_criteria.length * 10;
        const actualScore = task.evaluation_criteria.reduce((sum, crit) => sum + (feedback[crit.name] || 0), 0);
        const finalScore = Math.round((actualScore / totalPossibleScore) * 100);

        try {
            await TaskSubmission.update(submission.id, {
                manager_feedback: JSON.stringify(feedback),
                score: finalScore,
                status: 'reviewed'
            });
            toast.success("Review submitted successfully!");
            onReviewed();
            onOpenChange(false);
        } catch (error) { toast.error("Failed to submit review."); }
    };

    if (!submission || !task) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Review Submission: {submission.submitted_by}</DialogTitle>
                    <DialogDescription>Task: {task.task_title}</DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
                    <div className="flex flex-col space-y-4">
                        <Card className="flex-1">
                            <CardHeader><CardTitle>Submission</CardTitle></CardHeader>
                            <CardContent>
                                <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center text-white">
                                    {submission.submission_url ? <video src={submission.submission_url} controls className="w-full h-full" /> : <p>Video player placeholder</p>}
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Transcript</CardTitle></CardHeader>
                            <CardContent className="max-h-48 overflow-y-auto text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                                {submission.transcript || "No transcript available. AI analysis may not be accurate."}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex flex-col space-y-4 min-h-0">
                        <Button onClick={handleGetAiAnalysis} disabled={isAiLoading} className="bg-violet-600 hover:bg-violet-700 text-white w-full">
                            {isAiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} Get AI Analysis
                        </Button>
                        <Card className="flex-1 overflow-y-auto">
                            <CardHeader><CardTitle>Feedback & Scoring</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {task.evaluation_criteria.map(crit => (
                                    <CriterionRating key={crit.name} criterion={crit} value={feedback[crit.name] || 0} onChange={(val) => handleFeedbackChange(crit.name, val)} />
                                ))}
                                <div>
                                    <label className="font-medium text-sm">Strengths</label>
                                    <Textarea value={feedback.strengths || ''} onChange={(e) => handleFeedbackChange('strengths', e.target.value)} placeholder="What went well?" />
                                </div>
                                <div>
                                    <label className="font-medium text-sm">Areas for Improvement</label>
                                    <Textarea value={feedback.improvements || ''} onChange={(e) => handleFeedbackChange('improvements', e.target.value)} placeholder="What could be better?" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmitReview} className="bg-blue-600 hover:bg-blue-700 text-white">Submit Review</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}