
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { TaskSubmission } from '@/api/entities';
import { CoachingTask } from '@/api/entities';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, Send, Award, Star, ThumbsUp, ThumbsDown, BookCopy } from 'lucide-react';
import { toast } from 'sonner';

export default function TaskReview() {
    const [submission, setSubmission] = useState(null);
    const [task, setTask] = useState(null);
    const [lead, setLead] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [score, setScore] = useState(75);
    const [strengths, setStrengths] = useState('');
    const [improvements, setImprovements] = useState('');
    const [addToLibrary, setAddToLibrary] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const submissionId = new URLSearchParams(location.search).get('submissionId');

    useEffect(() => {
        const fetchData = async () => {
            if (!submissionId) {
                toast.error("No submission specified.");
                navigate('/CoachingHub');
                return;
            }
            setIsLoading(true);
            try {
                const [subData, user] = await Promise.all([
                    TaskSubmission.get(submissionId),
                    User.me()
                ]);
                
                setSubmission(subData);
                setCurrentUser(user);

                if (subData.task_id) {
                    const taskData = await CoachingTask.get(subData.task_id);
                    setTask(taskData);
                }
                if (subData.related_lead_id) {
                    const leadData = await Lead.get(subData.related_lead_id);
                    setLead(leadData);
                }
            } catch (error) {
                console.error("Error fetching review data:", error);
                toast.error("Failed to load submission for review.");
            }
            setIsLoading(false);
        };
        fetchData();
    }, [submissionId, navigate]);

    const handleSubmitReview = async () => {
        setIsLoading(true);
        try {
            const feedback = {
                score,
                strengths,
                improvements
            };

            await TaskSubmission.update(submission.id, {
                manager_feedback: JSON.stringify(feedback),
                score: score,
                status: 'reviewed',
                is_in_library: addToLibrary
            });
            toast.success("Feedback submitted successfully!");
            navigate('/CoachingHub');
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error("Failed to submit feedback.");
        }
        setIsLoading(false);
    };

    if (isLoading && !submission) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin" /></div>;
    }

    if (!submission) {
        return <div className="text-center p-8">Could not load submission.</div>;
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <Link to="/CoachingHub" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Coaching Hub
            </Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Submission Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submission Details</CardTitle>
                            <CardDescription>
                                Submitted by {submission.submitted_by} on {new Date(submission.created_date).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {task && <p><strong>Task:</strong> {task.task_title}</p>}
                            {lead && <p><strong>Regarding Lead:</strong> {lead.contact_name} at {lead.company_name}</p>}
                            <audio controls src={submission.submission_url} className="w-full mt-4"></audio>
                        </CardContent>
                    </Card>
                    {submission.ai_analysis && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /> AI Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="bg-slate-100 p-4 rounded-md text-xs whitespace-pre-wrap">{JSON.stringify(JSON.parse(submission.ai_analysis), null, 2)}</pre>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Side: Feedback Form */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award className="w-6 h-6 text-blue-600" /> Your Feedback</CardTitle>
                        <CardDescription>Provide your review for this submission.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="score" className="text-lg font-semibold">Overall Score: {score}</Label>
                            <Slider id="score" value={[score]} onValueChange={(val) => setScore(val[0])} max={100} step={1} className="mt-2" />
                        </div>

                        <div>
                            <Label htmlFor="strengths" className="flex items-center gap-2 text-lg font-semibold mb-2"><ThumbsUp className="w-5 h-5 text-green-500" /> Strengths</Label>
                            <Textarea id="strengths" value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="What went well? What should they keep doing?" />
                        </div>

                        <div>
                            <Label htmlFor="improvements" className="flex items-center gap-2 text-lg font-semibold mb-2"><ThumbsDown className="w-5 h-5 text-red-500" /> Areas for Improvement</Label>
                            <Textarea id="improvements" value={improvements} onChange={(e) => setImprovements(e.target.value)} placeholder="What could be improved? Provide specific, actionable advice." />
                        </div>

                        {currentUser?.role?.includes('admin') && (
                            <div className="flex items-center space-x-2 pt-4 border-t">
                                <Checkbox id="add-to-library" checked={addToLibrary} onCheckedChange={setAddToLibrary} />
                                <Label htmlFor="add-to-library" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                    <BookCopy className="w-4 h-4 text-purple-600" />
                                    Add this submission to the Pitch Library as a best practice example
                                </Label>
                            </div>
                        )}
                        
                        <Button onClick={handleSubmitReview} disabled={isLoading} className="w-full text-lg py-6">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> Submit Review</>}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
