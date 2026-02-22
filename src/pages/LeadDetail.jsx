
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lead } from '@/api/entities';
import { DocumentView } from '@/api/entities';
import { DigitalSalesRoom } from '@/api/entities';
import { ModuleAccess } from '@/api/entities';
import { CallRecord } from '@/api/entities';
import { Meeting } from '@/api/entities';
import { LeadActivity } from '@/api/entities'; // Assuming LeadActivity entity exists
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Star, TrendingUp, Phone, Mail, Building, Briefcase, Bot, Sparkles, MessageSquare, Calendar, Mic, Edit, Info, History, BarChart, X, User as UserIcon, Target, Zap, PhoneOff, Volume2, Send, Users, Brain, ChevronDown, DollarSign, Clock, BrainCircuit, Plus, FileText, BarChart3, Activity, Eye, Save, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import EmailComposer from '@/components/email/EmailComposer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ComprehensiveAIAgent from '@/components/ai/ComprehensiveAIAgent';
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { groupBy } from 'lodash';
import CallPrepTabContent from '@/components/leads/CallPrepTabContent';
import { EditLeadModal } from '@/components/leads/EditLeadModal';
import CalendarScheduler from '@/components/calendar/CalendarScheduler';
import LeadStageIndicator from '@/components/leads/LeadStageIndicator';
import CRMAssistant from '@/components/ai/CRMAssistant';
import RealTimeNotifications from '@/components/notifications/RealTimeNotifications';
import LiveCallAssistant from '@/components/ai/LiveCallAssistant';
import eventBus from '@/components/utils/eventBus';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import RoleplayOverlay from '@/components/coaching/RoleplayOverlay';

// New CompanyDescriptionEditor Component
const CompanyDescriptionEditor = ({ lead, onLeadUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(lead.company_description || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedDescription(lead.company_description || '');
    }, [lead.company_description]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedLead = await Lead.update(lead.id, { company_description: editedDescription });
            onLeadUpdate(updatedLead);
            toast.success("Company description updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update company description:', error);
            toast.error("Failed to update company description.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedDescription(lead.company_description || '');
        setIsEditing(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-slate-800">Company Overview</h4>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />Edit
                    </Button>
                )}
            </div>
            {isEditing ? (
                <div>
                    <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={6}
                        className="mb-4"
                        placeholder="Enter company overview here..."
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                            <X className="w-4 h-4 mr-2" />Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || editedDescription === (lead.company_description || '')}
                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save
                        </Button>
                    </div>
                </div>
            ) : (
                lead.company_description ? (
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.company_description}</p>
                    </div>
                ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                        <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 mb-2">No company overview available</p>
                        <p className="text-sm text-slate-400">Add company information to better understand this prospect</p>
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            size="sm"
                            className="mt-3"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Add Company Details
                        </Button>
                    </div>
                )
            )}
        </div>
    );
};

const aggregatePageAnalytics = (sessions) => {
    const pageData = {};
    (sessions || []).forEach(session => {
        (session.page_analytics || []).forEach(pageAnalytic => {
            const { page_number, time_spent_seconds } = pageAnalytic;
            if (!pageData[page_number]) {
                pageData[page_number] = { page: `Page ${page_number}`, views: 0, total_time: 0 };
            }
            pageData[page_number].views += 1;
            pageData[page_number].total_time += time_spent_seconds || 0;
        });
    });
    return Object.values(pageData).map(data => ({ ...data, avg_time: data.views > 0 ? Math.round(data.total_time / data.views) : 0 })).sort((a, b) => a.page.localeCompare(b.page, undefined, { numeric: true }));
};

const GenericActivityCard = ({ activity }) => (
    <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Activity className="w-4 h-4 text-slate-500" />
                {activity.title || activity.type}
            </CardTitle>
            <span className="text-xs text-slate-500">{format(new Date(activity.date || activity.created_date), 'MMM d, yyyy • h:mm a')}</span>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-slate-600">{activity.description}</p>
        </CardContent>
    </Card>
);

const CallActivityCard = ({ call }) => (
    <Card className="shadow-sm border-l-4 border-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
                <Phone className="w-4 h-4 text-blue-500" />
                Call - {call.direction === 'outbound' ? 'Outbound' : 'Inbound'}
            </CardTitle>
            <span className="text-xs text-slate-500">{format(new Date(call.created_date), 'MMM d, yyyy • h:mm a')}</span>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-slate-600">
                <Badge variant="outline" className="px-2 py-0.5"><Clock className="w-3 h-3 mr-1" />{call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : 'N/A'}</Badge>
                {call.sentiment && <Badge variant="outline" className="px-2 py-0.5"><Volume2 className="w-3 h-3 mr-1" />Sentiment: {call.sentiment}</Badge>}
            </div>
            {call.ai_summary && (
                <div>
                    <h5 className="font-semibold text-slate-700 flex items-center gap-1 mb-1"><Bot className="w-4 h-4 text-purple-600" /> AI Summary</h5>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{call.ai_summary}</p>
                </div>
            )}
            {call.action_items && call.action_items.length > 0 && (
                <div>
                    <h5 className="font-semibold text-slate-700 flex items-center gap-1 mb-1"><Zap className="w-4 h-4 text-orange-600" /> Action Items</h5>
                    <ul className="list-disc list-inside text-sm text-slate-700">
                        {call.action_items.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}
            {call.notes && (
                <div>
                    <h5 className="font-semibold text-slate-700 flex items-center gap-1 mb-1"><FileText className="w-4 h-4 text-slate-600" /> Notes</h5>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{call.notes}</p>
                </div>
            )}
        </CardContent>
    </Card>
);

const MeetingActivityCard = ({ meeting }) => (
    <Card className="shadow-sm border-l-4 border-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
                <Calendar className="w-4 h-4 text-green-500" />
                Meeting - {meeting.type || 'Scheduled'}
            </CardTitle>
            <span className="text-xs text-slate-500">{format(new Date(meeting.scheduled_at), 'MMM d, yyyy • h:mm a')}</span>
        </CardHeader>
        <CardContent className="space-y-3">
            <p className="text-sm text-slate-700 font-medium">{meeting.title}</p>
            {meeting.description && <p className="text-sm text-slate-600 whitespace-pre-wrap">{meeting.description}</p>}
            {meeting.ai_summary && (
                <div>
                    <h5 className="font-semibold text-slate-700 flex items-center gap-1 mb-1"><Bot className="w-4 h-4 text-purple-600" /> AI Meeting Summary</h5>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{meeting.ai_summary}</p>
                </div>
            )}
            {meeting.action_items && meeting.action_items.length > 0 && (
                <div>
                    <h5 className="font-semibold text-slate-700 flex items-center gap-1 mb-1"><Zap className="w-4 h-4 text-orange-600" /> Action Items</h5>
                    <ul className="list-disc list-inside text-sm text-slate-700">
                        {meeting.action_items.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}
            {meeting.status && <Badge variant="outline" className="px-2 py-0.5"><Activity className="w-3 h-3 mr-1" />Status: {meeting.status}</Badge>}
        </CardContent>
    </Card>
);


export default function LeadDetail() {
    const [lead, setLead] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Added error state
    const [showEmailComposer, setShowEmailComposer] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [callStartTime, setCallStartTime] = useState(null);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [engagementHistory, setEngagementHistory] = useState([]);
    const [salesRooms, setSalesRooms] = useState([]);
    const [moduleAccessRules, setModuleAccessRules] = useState([]);
    const [expandedDocIds, setExpandedDocIds] = new useState(new Set());
    const [expandedVisitIds, setExpandedVisitIds] = useState(new Set());
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCalendarScheduler, setShowCalendarScheduler] = useState(false);
    const [isLiveAssistantOpen, setIsLiveAssistantOpen] = useState(false);
    const [showMeetingEdit, setShowMeetingEdit] = useState(false);
    const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // Added for tab control

    // New state declarations for activity feed
    const [callRecords, setCallRecords] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [activities, setActivities] = useState([]); // For generic LeadActivity
    const [combinedActivities, setCombinedActivities] = useState([]);

    const navigate = useNavigate();
    const location = useLocation(); // Added useLocation

    const processedEngagement = useMemo(() => {
        if (!engagementHistory.length) return [];
        const grouped = groupBy(engagementHistory, 'document_id');
        return Object.values(grouped).map(group => {
            const firstView = group[0];
            return {
                document_id: firstView.document_id,
                document_name: firstView.document_details?.document_name || 'Untitled Document',
                views: group.length,
                total_duration_seconds: group.reduce((sum, view) => sum + (view.session_duration_seconds || 0), 0),
                last_viewed_at: group.reduce((latest, view) => new Date(latest.created_date) < new Date(view.created_date) ? view : latest, group[0]).created_date,
                page_wise_report: aggregatePageAnalytics(group),
                sessions: group.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
                active_session: group.find(s => s.is_currently_viewing) || null,
            };
        }).sort((a, b) => new Date(b.last_viewed_at) - new Date(a.last_viewed_at));
    }, [engagementHistory]);

    const leadAnalytics = useMemo(() => {
        if (!lead) return null;
        const daysSinceCreated = Math.floor((new Date() - new Date(lead.created_date)) / (1000 * 60 * 60 * 24));
        const emailsSent = lead.analytics?.emails_sent || 0;
        const emailsOpened = lead.analytics?.emails_opened || 0;
        const callsMade = lead.analytics?.calls_made || 0;
        const documentsViewed = processedEngagement.length;
        const salesRoomsCreated = salesRooms.length;
        const totalTouchpoints = emailsSent + callsMade + documentsViewed + salesRoomsCreated;
        return {
            daysSinceCreated,
            totalTouchpoints,
            emailsSent,
            emailsOpened,
            emailResponses: lead.analytics?.email_responses || 0,
            responseRate: emailsOpened > 0 ? Math.round(((lead.analytics?.email_responses || 0) / emailsOpened) * 100) : 0,
            callsMade,
            documentsViewed,
            salesRoomsCreated,
            pipelineVelocity: lead.analytics?.pipeline_velocity || 0,
            engagementScore: lead.engagement_score || 0,
            leadScore: lead.ai_score || 0,
        };
    }, [lead, processedEngagement, salesRooms]);

    // Removed activityTimelineItems useMemo as it's replaced by combinedActivities and renderActivityFeed

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const leadId = urlParams.get('leadId') || sessionStorage.getItem('selectedLeadId');
        if (!leadId) {
            setError('No lead ID provided.');
            setIsLoading(false);
            return;
        }

        const fetchLeadData = async () => {
            setIsLoading(true);
            try {
                const [leadData, roomsData, accessRules, callData, meetingData, activityData] = await Promise.all([
                    Lead.get(leadId),
                    DigitalSalesRoom.filter({ lead_id: leadId }, '-created_date'),
                    ModuleAccess.list().catch(() => []),
                    CallRecord.filter({ lead_id: leadId }, '-created_date'),
                    Meeting.filter({ lead_id: leadId }, '-created_date'),
                    LeadActivity.filter({ lead_id: leadId }, '-created_date')
                ]);

                setLead(leadData);
                setSalesRooms(roomsData);
                setModuleAccessRules(accessRules);
                setCallRecords(callData);
                setMeetings(meetingData);
                setActivities(activityData);

                if (leadData?.contact_email) {
                    const history = await DocumentView.filter({ viewer_email: leadData.contact_email }, '-created_date');
                    setEngagementHistory(history);
                }
            } catch (err) {
                console.error('Error fetching lead details:', err);
                toast.error('Failed to load lead details.');
                setError('Failed to load lead details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeadData();
    }, [location.search]); // Depend on location.search to refetch if URL params change

    // New useEffect to combine all activities
    useEffect(() => {
        const allActivities = [
            ...(activities || []).map(a => ({ ...a, type: 'activity', date: a.created_date })),
            ...(callRecords || []).map(c => ({ ...c, type: 'call', date: c.created_date })),
            ...(meetings || []).map(m => ({ ...m, type: 'meeting', date: m.scheduled_at })),
            ...(salesRooms || []).map(room => ({ ...room, type: 'sales_room', date: room.created_date, title: `Sales room created: ${room.room_name}`, description: room.description || 'No description' })),
            ...(processedEngagement || []).map(doc => ({ ...doc, type: 'document_view', date: new Date(doc.last_viewed_at), title: `Document viewed: ${doc.document_name}` }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setCombinedActivities(allActivities);
    }, [activities, callRecords, meetings, salesRooms, processedEngagement]);


    useEffect(() => {
        let interval;
        if (isCallActive) {
            interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        }
        return () => clearInterval(interval);
    }, [isCallActive]);

    const getBackUrl = () => createPageUrl(new URLSearchParams(window.location.search).get('returnTo') === 'CallPrep' ? 'CallPrep' : 'effyLeads');
    const getBackLabel = () => new URLSearchParams(window.location.search).get('returnTo') === 'CallPrep' ? 'Back to Upcoming Calls' : 'Back to effyLeads';

    const handleCallLead = async () => {
        if (!lead?.contact_phone) return toast.error("No phone number for this lead");
        setIsCallActive(true);
        setCallStartTime(Date.now());
        toast.success(`Calling ${lead.contact_name}...`);
    };

    const handleEndCall = () => {
        setIsCallActive(false);
        setCallStartTime(null);
        toast.success("Call ended");
        // CRM Assistant handles saving the call record, transcription, AI notes etc.
        setTimeout(() => eventBus.dispatch('open-crm-assistant', { leadId: lead.id }), 500);
    };

    const handleCancelMeeting = async () => {
        try {
            const updatedLead = await Lead.update(lead.id, {
                meeting_date_time: null,
                meeting_type: null,
                status: 'qualified' // Revert status
            });
            handleLeadUpdate(updatedLead);
            toast.success("Meeting cancelled successfully in the CRM.");
        } catch (error) {
            console.error('Failed to cancel meeting:', error);
            toast.error("Failed to cancel meeting.");
        }
        setIsCancelAlertOpen(false);
    };

    const formatCallDuration = () => {
        if (!callStartTime) return "00:00";
        const elapsed = Math.floor((currentTime - callStartTime) / 1000);
        return `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
    };

    const getScoreColor = (score) => {
        if (!score) return 'bg-slate-100 text-slate-800';
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const statusColors = { new: 'bg-blue-100 text-blue-800', contacted: 'bg-cyan-100 text-cyan-800', qualified: 'bg-yellow-100 text-yellow-800', proposal_sent: 'bg-orange-100 text-orange-800', negotiation: 'bg-purple-100 text-purple-800', closed_won: 'bg-green-100 text-green-800', closed_lost: 'bg-red-100 text-red-800' };
    const formatDuration = (seconds) => seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const formatDate = (dateString) => format(new Date(dateString), 'dd-MMM-yyyy, HH:mm');
    const toggleSet = (set, item, setter) => setter(prev => { const newSet = new Set(prev); newSet.has(item) ? newSet.delete(item) : newSet.add(item); return newSet; });
    const getPageThumbnail = (pageNumber) => `https://placehold.co/120x160/f0f0f0/333?text=P.${pageNumber}`;

    const handleLeadUpdate = (updatedLeadData) => {
        setLead(prev => ({ ...prev, ...updatedLeadData }));
    };

    const handleEmailSent = () => {
        setShowEmailComposer(false);
        toast.success("Email sent successfully!");
        setTimeout(() => eventBus.dispatch('open-crm-assistant', { leadId: lead.id }), 1000);
    };

    const hasSalesRoomsAccess = () => {
        const rule = moduleAccessRules.find(r => r.module_id === 'DigitalSalesRooms');
        return !rule || rule.is_enabled;
    };

    const handleAIEnrich = async () => {
        // Validation: Check if essential details are present
        const missingFields = [];

        if (!lead.contact_name || lead.contact_name.trim() === '') {
            missingFields.push('Contact Name');
        }
        if (!lead.company_name || lead.company_name.trim() === '') {
            missingFields.push('Company Name');
        }
        if (!lead.contact_title || lead.contact_title.trim() === '') {
            missingFields.push('Contact Title');
        }

        if (missingFields.length > 0) {
            toast.error("Missing Essential Information", {
                description: `Please add the following details before AI enrichment: ${missingFields.join(', ')}. Click Edit to add them.`
            });
            return;
        }

        // Optional fields warning (don't block, just warn)
        const optionalMissingFields = [];
        if (!lead.company_website || lead.company_website.trim() === '') optionalMissingFields.push('Company Website');
        if (!lead.industry || lead.industry.trim() === '') optionalMissingFields.push('Industry');

        if (optionalMissingFields.length > 0) {
            toast.info("Optional Information Missing", {
                description: `For better results, consider adding: ${optionalMissingFields.join(', ')}. Proceeding with available data.`
            });
        }

        setIsEnriching(true);
        toast.info("AI enrichment started...", {
            description: "Gathering insights from the web. This may take a moment."
        });

        try {
            const prompt = `You are an expert B2B sales intelligence researcher. Analyze and enrich the following lead profile with publicly available information.

CURRENT LEAD DATA:
- Contact: ${lead.contact_name} (${lead.contact_title})
- Company: ${lead.company_name}
- Industry: ${lead.industry || 'Not specified'}
- Company Size: ${lead.company_size || 'Not specified'}
- Website: ${lead.company_website || 'Not specified'}
- Current Notes: ${lead.notes || 'None'}

Your task is to research this lead and company using public web data and provide a comprehensive, structured JSON response. Infer reasonable estimates where direct data is unavailable.

Return a JSON object containing the following fields:
- company_description: A rich overview of the company, what they do, their market position, and any recent news.
- pain_points: Likely business challenges based on their industry, size, and the contact's role.
- personality_traits: Inferred personality traits of the contact for communication style matching (e.g., "Data-driven", "Relationship-focused").
- competitor_mentions: Known competitors or alternative solutions they might be using.
- decision_makers: A list of other potential decision-makers and their likely titles.
- estimated_deal_value: A reasonable estimate for a potential deal value in USD (as a number).
- probability: An initial estimated probability of closing (0-100).
- priority: Suggested priority for this lead ('High', 'Medium', or 'Low').
- budget_range: An estimated budget range (e.g., "$20k - $50k").
- timeline: A likely decision-making timeline (e.g., "This Quarter", "6-12 months").
- product_interest: The specific product/service from our offerings they would be most interested in.
- elevator_pitch: A personalized 30-second elevator pitch for this specific prospect.
- key_insights: 3-5 critical insights or conversation starters about the prospect or their company.
- recommended_approach: A recommended sales approach and messaging strategy.
- next_action: A tangible and logical next action for the sales rep to take.
`;

            const response = await InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        company_description: { type: "string" },
                        pain_points: { type: "array", items: { type: "string" } },
                        personality_traits: { type: "array", items: { type: "string" } },
                        competitor_mentions: { type: "array", items: { type: "string" } },
                        decision_makers: { type: "array", items: { type: "string" } },
                        estimated_deal_value: { type: "number" },
                        probability: { type: "number" },
                        priority: { type: "string", enum: ["High", "Medium", "Low"] },
                        budget_range: { type: "string" },
                        timeline: { type: "string" },
                        product_interest: { type: "string" },
                        elevator_pitch: { type: "string" },
                        key_insights: { type: "array", items: { type: "string" } },
                        recommended_approach: { type: "string" },
                        next_action: { type: "string" }
                    }
                }
            });

            const newNotes = `--- AI ENRICHMENT (${new Date().toLocaleDateString()}) ---\nKey Insights:\n• ${response.key_insights?.join('\n• ') || 'N/A'}\n\nRecommended Approach: ${response.recommended_approach || 'N/A'}`;

            // Update the lead with all the new enriched data
            const updatedLead = await Lead.update(lead.id, {
                company_description: response.company_description || lead.company_description,
                pain_points: response.pain_points?.length ? response.pain_points : lead.pain_points,
                personality_traits: response.personality_traits?.length ? response.personality_traits : lead.personality_traits,
                competitor_mentions: response.competitor_mentions?.length ? response.competitor_mentions : lead.competitor_mentions,
                decision_makers: response.decision_makers?.length ? response.decision_makers : lead.decision_makers,
                estimated_deal_value: response.estimated_deal_value || lead.estimated_deal_value,
                probability: response.probability || lead.probability,
                priority: response.priority || lead.priority,
                budget_range: response.budget_range || lead.budget_range,
                timeline: response.timeline || lead.timeline,
                product_interest: response.product_interest || lead.product_interest,
                next_action: response.next_action || lead.next_action,
                ai_generated_pitch: response.elevator_pitch || lead.ai_generated_pitch, // Store the generated pitch
                notes: lead.notes ? `${lead.notes}\n\n${newNotes}` : newNotes
            });

            handleLeadUpdate(updatedLead);
            toast.success("AI enrichment complete!", {
                description: "Lead profile has been fully updated with new insights and a personalized pitch."
            });

        } catch (error) {
            console.error('Error during AI enrichment:', error);
            toast.error("AI enrichment failed", {
                description: "Please try again or check your internet connection."
            });
        } finally {
            setIsEnriching(false);
        }
    };

    const renderActivityFeed = () => {
        if (isLoading) return <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
        if (combinedActivities.length === 0) {
            return (
                <div className="text-center py-12">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-medium text-slate-600">No activity yet</h3>
                    <p className="text-sm text-slate-500">Calls, emails, meetings, sales rooms, and document views will appear here.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {combinedActivities.map((item, index) => {
                    if (item.type === 'meeting') {
                        return <MeetingActivityCard key={`meeting-${item.id || index}`} meeting={item} />;
                    }
                    if (item.type === 'call') {
                        return <CallActivityCard key={`call-${item.id || index}`} call={item} />;
                    }
                    if (item.type === 'sales_room') {
                        return (
                            <Card key={`sales_room-${item.id || index}`} className="shadow-sm border-l-4 border-purple-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
                                        <Briefcase className="w-4 h-4 text-purple-500" />
                                        Digital Sales Room
                                    </CardTitle>
                                    <span className="text-xs text-slate-500">{format(new Date(item.date), 'MMM d, yyyy • h:mm a')}</span>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-700 font-medium">{item.room_name}</p>
                                    <p className="text-sm text-slate-600">{item.description}</p>
                                    <Link to={createPageUrl(`SalesRoomAnalytics?roomId=${item.id}`)} className="text-blue-600 hover:underline text-sm mt-2 block">View Room Details</Link>
                                </CardContent>
                            </Card>
                        );
                    }
                    if (item.type === 'document_view') {
                        return (
                            <Card key={`doc_view-${item.document_id || index}`} className="shadow-sm border-l-4 border-orange-500">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700">
                                        <FileText className="w-4 h-4 text-orange-500" />
                                        Document Viewed
                                    </CardTitle>
                                    <span className="text-xs text-slate-500">{format(new Date(item.last_viewed_at), 'MMM d, yyyy • h:mm a')}</span>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-700 font-medium">{item.document_name}</p>
                                    <div className="flex flex-wrap gap-2 text-sm text-slate-600 mt-1">
                                        <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />{item.views} Views</Badge>
                                        <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{formatDuration(item.total_duration_seconds)} total</Badge>
                                    </div>
                                    <Button variant="link" size="sm" onClick={() => toggleSet(expandedDocIds, item.document_id, setExpandedDocIds)} className="px-0 mt-2">
                                        {expandedDocIds.has(item.document_id) ? 'Hide Details' : 'Show Details'}
                                    </Button>
                                    {expandedDocIds.has(item.document_id) && (
                                        <div className="mt-3 bg-slate-50 p-3 rounded-md border border-slate-200">
                                            <h6 className="font-semibold text-sm mb-2">Page-wise Engagement:</h6>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {item.page_wise_report.map(p => (
                                                    <div key={p.page}>{p.page}: {p.avg_time}s avg.</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    }
                    // For generic activities (like LeadActivity or other basic events)
                    return <GenericActivityCard key={`activity-${item.id || index}`} activity={item} />;
                })}
            </div>
        );
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (error) return <div className="text-center py-10"><h2 className="text-xl text-red-600">Error: {error}</h2><Button asChild><Link to={getBackUrl()}>Go back</Link></Button></div>;
    if (!lead) return <div className="text-center py-10"><h2 className="text-xl">No Lead Selected</h2><Button asChild><Link to={getBackUrl()}>Go back</Link></Button></div>;

    const DetailItem = ({ label, value, children }) => (
        <div>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <div className="text-sm text-slate-900 font-medium">{value || children || 'N/A'}</div>
        </div>
    );

    const TagList = ({ items, color = 'blue' }) => (
        <div className="flex flex-wrap gap-1.5">
            {items?.length > 0 ? items.map((item, index) => <Badge key={index} variant="outline" className={`text-xs border-${color}-300 text-${color}-700 bg-${color}-50`}>{item}</Badge>) : <p className="text-xs text-slate-400">Not specified</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <RealTimeNotifications />
            {isCallActive && <Button onClick={() => setIsLiveAssistantOpen(true)} className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white"><BrainCircuit className="w-6 h-6" /></Button>}

            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative">
                <div className="relative max-w-7xl mx-auto">
                    <div className="mb-4"><Link to={getBackUrl()} className="flex items-center gap-2 text-blue-100 hover:text-white"><ArrowLeft className="w-4 h-4" />{getBackLabel()}</Link></div>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">{lead.contact_name?.charAt(0) || 'L'}</div>
                                <div>
                                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">{lead.contact_name || 'Unknown'}<Badge variant="outline" className="bg-white/10 border-white/20 text-blue-100">Offline</Badge></h1>
                                    <p className="text-blue-100 text-xl">{lead.contact_title} at {lead.company_name}</p>
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        <Badge className={`px-3 py-1 text-sm ${statusColors[lead.status] || 'bg-slate-100'}`}>{lead.status || 'new'}</Badge>
                                        {lead.ai_score && <Badge className={`px-3 py-1 text-sm ${getScoreColor(lead.ai_score)}`}><Star className="w-4 h-4 mr-1" />Lead Score: {lead.ai_score}</Badge>}
                                        {lead.engagement_score && <Badge className={`px-3 py-1 text-sm ${getScoreColor(lead.engagement_score)}`}><TrendingUp className="w-4 h-4 mr-1" />Engagement: {lead.engagement_score}%</Badge>}
                                        <Badge className="bg-white/20 text-white px-3 py-1">Source: {lead.lead_source || 'unknown'}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center justify-center pt-6 border-t border-white/20">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button disabled={!lead.contact_phone} className="bg-green-600 hover:bg-green-700 text-white"><Phone className="w-4 h-4 mr-2" />Call <ChevronDown className="w-4 h-4 ml-2" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={handleCallLead}><Phone className="w-4 h-4 mr-2" />Call Now</DropdownMenuItem>
                                    {/* Changed to switch to Call Prep tab */}
                                    <DropdownMenuItem onClick={() => setActiveTab('call-prep')}><Mic className="w-4 h-4 mr-2" />Practice Pitch</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={() => setShowEmailComposer(true)} className="bg-blue-600 hover:bg-blue-700"><Mail className="w-4 h-4 mr-2" />Email</Button>
                            <Button onClick={() => setShowCalendarScheduler(true)} className="bg-orange-600 hover:bg-orange-700"><Calendar className="w-4 h-4 mr-2" />Schedule</Button>
                            <ComprehensiveAIAgent lead={lead} onLeadUpdate={setLead} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className={`grid w-full ${hasSalesRoomsAccess() ? 'grid-cols-5' : 'grid-cols-4'} mb-6 bg-white shadow-sm`}>
                        <TabsTrigger value="details"><Info className="w-4 h-4 mr-2" />Lead Details</TabsTrigger>
                        <TabsTrigger value="call-prep"><Brain className="w-4 h-4 mr-2" />Call Prep</TabsTrigger>
                        {hasSalesRoomsAccess() && <TabsTrigger value="sales-rooms"><Briefcase className="w-4 h-4 mr-2" />Sales Rooms</TabsTrigger>}
                        <TabsTrigger value="engagement"><Eye className="w-4 h-4 mr-2" />Engagement</TabsTrigger>
                        <TabsTrigger value="activity"><History className="w-4 h-4 mr-2" />Activity & Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        <LeadStageIndicator currentStatus={lead.status} lead={lead} onLeadUpdate={handleLeadUpdate} />

                        {/* Contact Information Section */}
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <UserIcon className="w-5 h-5" />
                                    Contact Information
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button onClick={() => setShowEditModal(true)} variant="outline" size="sm">
                                        <Edit className="w-4 h-4 mr-2" />Edit
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <DetailItem label="Full Name" value={lead.contact_name} />
                                <DetailItem label="Job Title" value={lead.contact_title} />
                                <DetailItem label="Email">
                                    {lead.contact_email ? (
                                        <a href={`mailto:${lead.contact_email}`} className="text-blue-600 hover:underline">{lead.contact_email}</a>
                                    ) : 'N/A'}
                                </DetailItem>
                                <DetailItem label="Phone">
                                    {lead.contact_phone ? (
                                        <a href={`tel:${lead.contact_phone}`} className="text-blue-600 hover:underline">{lead.contact_phone}</a>
                                    ) : 'N/A'}
                                </DetailItem>
                                <DetailItem label="Assigned To" value={lead.assigned_to_email} />
                                <DetailItem label="Last Contact Date">
                                    {lead.last_contact_date ? format(new Date(lead.last_contact_date), 'dd-MMM-yyyy, hh:mm a') : 'N/A'}
                                </DetailItem>
                            </CardContent>
                        </Card>

                        {/* AI Research Status Card */}
                        <Card className="border-2 border-dashed border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-3">
                                    <BrainCircuit className="w-6 h-6 text-purple-600" />
                                    AI Lead Research
                                    {lead.ai_generated_pitch ? (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <Eye className="w-3 h-3 mr-1" />
                                            Researched
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Not Researched
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {lead.ai_generated_pitch ? 
                                        "AI has researched this lead. View Call Prep tab for personalized pitch and talking points." :
                                        "Get AI-powered insights, pain points, and personalized pitch to improve your success rate."
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {lead.ai_generated_pitch ? (
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-lg p-4 border border-green-200">
                                            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                Research Complete
                                            </h4>
                                            <p className="text-sm text-slate-600 mb-3">
                                                AI has analyzed {lead.company_name} and {lead.contact_name} to provide:
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                <div className="flex items-center gap-1 text-green-700">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    Company insights
                                                </div>
                                                <div className="flex items-center gap-1 text-green-700">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    Pain points
                                                </div>
                                                <div className="flex items-center gap-1 text-green-700">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    Personalized pitch
                                                </div>
                                                <div className="flex items-center gap-1 text-green-700">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    Talking points
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button 
                                                onClick={handleAIEnrich} 
                                                disabled={isEnriching}
                                                variant="outline"
                                                size="sm"
                                            >
                                                {isEnriching ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Refreshing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                        Refresh Research
                                                    </>
                                                )}
                                            </Button>
                                            <Button 
                                                onClick={() => setActiveTab('call-prep')}
                                                className="bg-purple-600 hover:bg-purple-700"
                                                size="sm"
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                View Call Prep
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="mb-4">
                                            <BrainCircuit className="w-16 h-16 text-purple-300 mx-auto mb-3" />
                                            <h4 className="text-lg font-semibold text-slate-800 mb-2">Ready to Research This Lead?</h4>
                                            <p className="text-slate-600 text-sm max-w-md mx-auto">
                                                AI will analyze {lead.company_name} and {lead.contact_name} to provide personalized insights, pain points, and a custom pitch.
                                            </p>
                                        </div>
                                        <Button 
                                            onClick={handleAIEnrich} 
                                            disabled={isEnriching}
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 shadow-lg"
                                            size="lg"
                                        >
                                            {isEnriching ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Researching Lead...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 mr-2" />
                                                    Start AI Research
                                                </>
                                            )}
                                        </Button>
                                        {(!lead.contact_name || lead.contact_name.trim() === '' ||
                                          !lead.company_name || lead.company_name.trim() === '' ||
                                          !lead.contact_title || lead.contact_title.trim() === '') ? (
                                            <p className="text-amber-600 text-xs mt-3 flex items-center justify-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Complete contact details first for better results
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Company Information Section */}
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Company Information
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button onClick={() => setShowEditModal(true)} variant="outline" size="sm">
                                        <Edit className="w-4 h-4 mr-2" />Edit
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                    <DetailItem label="Company Name" value={lead.company_name} />
                                    <DetailItem label="Website">
                                        {lead.company_website ? (
                                            <a
                                                href={lead.company_website.startsWith('http') ? lead.company_website : `https://${lead.company_website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {lead.company_website}
                                            </a>
                                        ) : 'N/A'}
                                    </DetailItem>
                                    <DetailItem label="Industry" value={lead.industry} />
                                    <DetailItem label="Company Size" value={lead.company_size} />
                                    <DetailItem label="Annual Revenue" value={lead.annual_revenue ? `$${parseInt(lead.annual_revenue).toLocaleString()}` : 'N/A'} />
                                    <DetailItem label="Lead Source" value={lead.lead_source} />
                                </div>

                                <div className="border-t pt-6">
                                    <CompanyDescriptionEditor lead={lead} onLeadUpdate={handleLeadUpdate} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Deal Information Section */}
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Deal Information
                                </CardTitle>
                                <Button onClick={() => setShowEditModal(true)} variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" />Edit</Button>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <DetailItem label="Estimated Deal Value ($)">
                                    {lead.estimated_deal_value ? `$${parseInt(lead.estimated_deal_value).toLocaleString()}` : 'N/A'}
                                </DetailItem>
                                <DetailItem label="Probability (%)" value={lead.probability ? `${lead.probability}%` : 'N/A'} />
                                <DetailItem label="Priority" value={lead.priority} />
                                <DetailItem label="Budget Range" value={lead.budget_range} />
                                <DetailItem label="Decision Timeline" value={lead.timeline} />
                                <DetailItem label="Product Interest" value={lead.product_interest} />
                            </CardContent>
                        </Card>

                        {/* Sales Insights Section */}
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    Sales Insights
                                </CardTitle>
                                <Button onClick={() => setShowEditModal(true)} variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" />Edit</Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-medium text-slate-800 mb-3">Personality Traits</h5>
                                        <TagList items={lead.personality_traits} color="blue" />
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-slate-800 mb-3">Pain Points</h5>
                                        <TagList items={lead.pain_points} color="red" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-medium text-slate-800 mb-3">Decision Makers</h5>
                                        <TagList items={lead.decision_makers} color="green" />
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-slate-800 mb-3">Competitor Mentions</h5>
                                        <TagList items={lead.competitor_mentions} color="purple" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Follow-up & Notes Section */}
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Follow-up & Notes
                                </CardTitle>
                                <Button onClick={() => setShowEditModal(true)} variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" />Edit</Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md::grid-cols-2 gap-6">
                                    <DetailItem label="Next Follow-up Date">
                                        {lead.next_followup_date ? format(new Date(lead.next_followup_date), 'dd-MMM-yyyy') : 'N/A'}
                                    </DetailItem>
                                    <DetailItem label="Next Action" value={lead.next_action} />
                                </div>
                                <div>
                                    <h5 className="font-medium text-slate-800 mb-3">Notes</h5>
                                    {lead.notes ? (
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500 mb-2">No notes available</p>
                                            <p className="text-sm text-slate-400">Add notes to keep track of important information</p>
                                            <Button
                                                onClick={() => setShowEditModal(true)}
                                                variant="outline"
                                                size="sm"
                                                className="mt-3"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Add Notes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Meeting Management Section - NEW */}
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Meeting Management
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button onClick={() => setShowCalendarScheduler(true)} variant="outline" size="sm">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {lead.meeting_date_time ? 'Reschedule' : 'Schedule'}
                                    </Button>
                                    {lead.meeting_date_time && (
                                        <Button onClick={() => setIsCancelAlertOpen(true)} variant="destructive" size="sm">
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {lead.meeting_date_time ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <DetailItem label="Meeting Date & Time">
                                            {format(new Date(lead.meeting_date_time), 'PPpp')}
                                        </DetailItem>
                                        <DetailItem label="Meeting Type" value={lead.meeting_type} />
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 mb-2">No meeting scheduled</p>
                                        <p className="text-sm text-slate-400">Click "Schedule" to set up a meeting with this lead</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="call-prep"><CallPrepTabContent lead={lead} /></TabsContent>

                    {hasSalesRoomsAccess() && (
                        <TabsContent value="sales-rooms" className="space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center"><CardTitle>Digital Sales Rooms</CardTitle><Button onClick={() => navigate(createPageUrl(`CreateDigitalSalesRoom?leadId=${lead.id}`))}><Plus className="w-4 h-4 mr-2" />Create</Button></CardHeader>
                                <CardContent>
                                    {salesRooms.length ? salesRooms.map(room => <div key={room.id}><Link to={createPageUrl(`SalesRoomAnalytics?roomId=${room.id}`)}>{room.room_name}</Link></div>) : <p>No sales rooms yet.</p>}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    <TabsContent value="engagement" className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Document Engagement</CardTitle></CardHeader>
                            <CardContent>
                                {processedEngagement.length ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead><tr><th>Document</th><th>Views</th><th>Duration</th><th>Report</th></tr></thead>
                                            <tbody>{processedEngagement.map(item => (
                                                <React.Fragment key={item.document_id}>
                                                    <tr>
                                                        <td>{item.document_name}</td>
                                                        <td>{item.views}</td>
                                                        <td>{formatDuration(item.total_duration_seconds)}</td>
                                                        <td><Button variant="link" onClick={() => toggleSet(expandedDocIds, item.document_id, setExpandedDocIds)}>Details</Button></td>
                                                    </tr>
                                                    {expandedDocIds.has(item.document_id) && (
                                                        <tr><td colSpan="4"><Tabs defaultValue="visits"><TabsList><TabsTrigger value="visits">Visits</TabsTrigger><TabsTrigger value="aggregate">Aggregate</TabsTrigger></TabsList>
                                                            <TabsContent value="visits">{item.sessions.map(s => <div key={s.id}>{formatDate(s.created_date)}</div>)}</TabsContent>
                                                            <TabsContent value="aggregate">{item.page_wise_report.map(p => <div key={p.page}>{p.page}: {p.avg_time}s</div>)}</TabsContent>
                                                        </Tabs></td></tr>
                                                    )}
                                                </React.Fragment>
                                            ))}</tbody>
                                        </table>
                                    </div>
                                ) : <p>No engagement history.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-6">
                        <Card><CardHeader><CardTitle>Performance</CardTitle></CardHeader><CardContent><p>Days in pipeline: {leadAnalytics.daysSinceCreated}</p></CardContent></Card>
                        <Card>
                            <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {renderActivityFeed()}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {showEmailComposer && <EmailComposer open={showEmailComposer} onOpenChange={setShowEmailComposer} lead={lead} onEmailSent={handleEmailSent} />}
            {showEditModal && <EditLeadModal open={showEditModal} onOpenChange={setShowEditModal} lead={lead} onLeadUpdate={handleLeadUpdate} />}
            {showCalendarScheduler && <CalendarScheduler open={showCalendarScheduler} onOpenChange={setShowCalendarScheduler} lead={lead} />}
            {isLiveAssistantOpen && <LiveCallAssistant open={isLiveAssistantOpen} onOpenChange={setIsLiveAssistantOpen} lead={lead} />}
            {showMeetingEdit && <EditLeadModal open={showMeetingEdit} onOpenChange={setShowMeetingEdit} lead={lead} onLeadUpdate={handleLeadUpdate} focusOnMeeting={true} />}
            <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to cancel this meeting?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the meeting from the CRM. Please remember to also cancel the event directly in your Google, Outlook, or other calendar application.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelMeeting} className="bg-red-600 hover:bg-red-700">Yes, Cancel Meeting</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
