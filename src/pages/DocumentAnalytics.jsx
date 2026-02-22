
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Document } from '@/api/entities';
import { DocumentView } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Clock, BarChartBig, Users, FileText, MessageSquare, MapPin, Globe, Tv, Smartphone, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { createPageUrl } from '@/utils';

// --- Start of Dummy Data Definitions ---
const createDummyDoc = (id, name, company, status, views, updatedMinutesAgo) => ({
    id,
    document_name: name,
    company_name: company,
    status,
    analytics: { total_views: views },
    updated_date: new Date(Date.now() - updatedMinutesAgo * 60 * 1000).toISOString(),
});

const dummyDocs = [
    createDummyDoc(1, 'TechCorp Enterprise Proposal', 'TechCorp Industries', 'viewed', 23, 360),
    createDummyDoc(2, 'Increased Scope in New Requirement...', 'Global Dynamics', 'draft', 0, 360),
    createDummyDoc(3, 'Innovate LLC Partnership Agreement', 'Innovate LLC', 'signed', 15, 1200),
    createDummyDoc(4, 'Q3 Marketing Case Study', 'Marketing Co.', 'sent', 5, 2400),
    createDummyDoc(5, 'NextGen Solutions RFP Response', 'NextGen Solutions', 'approved', 8, 4800),
    createDummyDoc(6, 'Alpha Org Onboarding Materials', 'Alpha Organization', 'draft', 0, 30),
    createDummyDoc(7, 'Security Compliance Review', 'TechCorp Industries', 'pending_approval', 2, 90),
    createDummyDoc(8, 'Project Phoenix Contract', 'Global Dynamics', 'rejected', 11, 7200),
];

const defaultDummyViews = [
    {
        id: 'view-1',
        document_id: 'demo-doc-1',
        viewer_email: 'john.doe@techcorp.com',
        viewer_name: 'John Doe',
        location: 'San Francisco, CA',
        session_duration_seconds: 420,
        created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        page_analytics: [
            { page_number: 1, time_spent_seconds: 45 }, { page_number: 2, time_spent_seconds: 120 },
            { page_number: 3, time_spent_seconds: 180 }, { page_number: 4, time_spent_seconds: 75 }
        ]
    },
    {
        id: 'view-2',
        document_id: 'demo-doc-1',
        viewer_email: 'sarah.smith@techcorp.com',
        viewer_name: 'Sarah Smith',
        location: 'New York, NY',
        session_duration_seconds: 285,
        created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        page_analytics: [
            { page_number: 1, time_spent_seconds: 30 }, { page_number: 2, time_spent_seconds: 95 },
            { page_number: 3, time_spent_seconds: 160 }
        ]
    },
    {
        id: 'view-3',
        document_id: 'demo-doc-1',
        viewer_email: 'mike.johnson@techcorp.com',
        viewer_name: 'Mike Johnson',
        location: 'Austin, TX',
        session_duration_seconds: 195,
        created_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        page_analytics: [
            { page_number: 1, time_spent_seconds: 25 }, { page_number: 2, time_spent_seconds: 85 },
            { page_number: 3, time_spent_seconds: 85 }
        ]
    }
];
// --- End of Dummy Data Definitions ---

// Helper to format duration from seconds to a readable string
const formatDuration = (seconds) => {
  if (!seconds || seconds < 1) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return [
    hours > 0 ? `${hours}h` : '',
    minutes > 0 ? `${minutes}m` : '',
    remainingSeconds > 0 ? `${remainingSeconds}s` : '',
  ].join(' ').trim();
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
            <Icon className={`w-5 h-5 ${color}`} />
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </CardContent>
    </Card>
);

const PageAnalyticsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-slate-500 text-center py-8">No page-level data available.</p>;
    }
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatDuration} tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => [formatDuration(value), 'Time Spent']}
                />
                <Bar dataKey="time_spent" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default function DocumentAnalytics() {
    const [doc, setDoc] = useState(null);
    const [views, setViews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const docId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('id');
    }, [location.search]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (!docId) {
                    setDoc(dummyDocs[0]);
                    setViews(defaultDummyViews);
                } else {
                    // Try to fetch real data
                    const [docData, viewsData] = await Promise.all([
                        Document.get(docId),
                        DocumentView.filter({ document_id: docId }, '-created_date')
                    ]);
                    setDoc(docData);
                    setViews(viewsData);
                }
            } catch (err) {
                // If fetching fails, check if it's a known dummy ID
                const dummyId = parseInt(docId, 10);
                const dummyDocData = dummyDocs.find(d => d.id === dummyId);

                if (dummyDocData) {
                    // It's a dummy document, so load dummy analytics.
                    setDoc(dummyDocData);
                    setViews(defaultDummyViews);
                    setError(null); // Clear any potential error
                } else {
                    // It's a real error for an unknown document
                    console.error("Error fetching analytics data:", err);
                    setError('Failed to load document analytics. The document may not exist.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [docId]);

    const analyticsSummary = useMemo(() => {
        if (!views || views.length === 0) {
            return { totalViews: 0, uniqueViewers: 0, avgTimeSpent: 0, pageData: [], timeline: [] };
        }

        const uniqueViewers = new Set(views.map(v => v.viewer_email));
        const totalTimeSpent = views.reduce((sum, v) => sum + (v.session_duration_seconds || 0), 0);

        const pageDataAgg = {};
        const timeline = [];

        views.forEach(view => {
            timeline.push({
                type: 'view',
                icon: Eye,
                color: 'text-blue-500',
                text: `${view.viewer_name || view.viewer_email} viewed the document.`,
                timestamp: view.created_date,
            });

            if (view.page_analytics && Array.isArray(view.page_analytics)) {
                view.page_analytics.forEach(p => {
                    if (!pageDataAgg[p.page_number]) {
                        pageDataAgg[p.page_number] = { time_spent: 0, name: `Page ${p.page_number}` };
                    }
                    pageDataAgg[p.page_number].time_spent += p.time_spent_seconds || 0;
                });
            }
        });

        // Placeholder for comments and shares if those entities existed
        // timeline.push({ type: 'comment', ... })
        // timeline.push({ type: 'share', ... })

        timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        const pageData = Object.values(pageDataAgg).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));

        return {
            totalViews: views.length,
            uniqueViewers: uniqueViewers.size,
            avgTimeSpent: totalTimeSpent / views.length,
            pageData,
            timeline,
        };
    }, [views]);
    
    const recipientActivity = useMemo(() => {
        const activityByEmail = {};
        views.forEach(v => {
            if (!activityByEmail[v.viewer_email]) {
                activityByEmail[v.viewer_email] = {
                    name: v.viewer_name || v.viewer_email,
                    email: v.viewer_email,
                    location: v.location || 'Unknown',
                    total_time: 0,
                    last_viewed: v.created_date,
                    view_count: 0
                };
            }
            const entry = activityByEmail[v.viewer_email];
            entry.total_time += v.session_duration_seconds || 0;
            entry.view_count++;
            if (new Date(v.created_date) > new Date(entry.last_viewed)) {
                entry.last_viewed = v.created_date;
            }
        });
        return Object.values(activityByEmail).sort((a,b) => new Date(b.last_viewed) - new Date(a.last_viewed));
    }, [views]);

    const handleBackClick = () => {
        navigate(createPageUrl('Documents'));
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={handleBackClick} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Documents
                    </Button>
                </div>
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">Document not found.</p>
                    <Button onClick={handleBackClick} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Documents
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header with Back Button */}
            <div className="mb-6">
                <Button 
                    onClick={handleBackClick} 
                    variant="ghost" 
                    className="mb-4 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Documents
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{doc.document_name}</h1>
                    <p className="text-slate-600">Analytics and Engagement Overview</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <StatCard title="Total Views" value={analyticsSummary.totalViews} icon={Eye} color="text-blue-500" />
                         <StatCard title="Unique Viewers" value={analyticsSummary.uniqueViewers} icon={Users} color="text-purple-500" />
                         <StatCard title="Avg. Time Spent" value={formatDuration(analyticsSummary.avgTimeSpent)} icon={Clock} color="text-green-500" />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChartBig className="w-5 h-5 text-indigo-500" /> Page-Level Engagement</CardTitle>
                            <CardDescription>Time spent by all viewers on each page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PageAnalyticsChart data={analyticsSummary.pageData} />
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-orange-500" /> Recipient Activity</CardTitle>
                            <CardDescription>Engagement breakdown by individual viewer.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {recipientActivity.map(recipient => (
                               <div key={recipient.email} className="flex items-center justify-between p-3 bg-slate-100/50 rounded-lg">
                                   <div className="flex items-center gap-3">
                                       <Avatar>
                                           <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                               {recipient.name.charAt(0).toUpperCase()}
                                           </AvatarFallback>
                                       </Avatar>
                                       <div>
                                           <p className="font-semibold text-slate-800">{recipient.name}</p>
                                           <p className="text-sm text-slate-500">{recipient.email}</p>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-6 text-sm">
                                       <div className="flex items-center gap-2 text-slate-600" title="Location">
                                           <MapPin className="w-4 h-4" />
                                           <span>{recipient.location}</span>
                                       </div>
                                        <div className="flex items-center gap-2 text-slate-600" title="Total Views">
                                           <Eye className="w-4 h-4" />
                                           <span>{recipient.view_count} {recipient.view_count > 1 ? 'views' : 'view'}</span>
                                       </div>
                                       <div className="flex items-center gap-2 text-slate-600" title="Total Time Spent">
                                           <Clock className="w-4 h-4" />
                                           <span>{formatDuration(recipient.total_time)}</span>
                                       </div>
                                       <div className="text-right">
                                           <p className="font-medium text-slate-700">Last viewed</p>
                                           <p className="text-slate-500">{formatDistanceToNowStrict(new Date(recipient.last_viewed), { addSuffix: true })}</p>
                                       </div>
                                   </div>
                               </div>
                           ))}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Timeline Column */}
                <div className="lg:col-span-1">
                     <Card className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Engagement Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-6">
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200" />
                                {analyticsSummary.timeline.map((item, index) => (
                                    <div key={index} className="relative mb-6">
                                        <div className={`absolute -left-[37px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white`}>
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                                              <item.icon className={`w-4 h-4 ${item.color}`} />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm text-slate-700">{item.text}</p>
                                            <p className="text-xs text-slate-500">{format(new Date(item.timestamp), 'MMM d, yyyy, h:mm a')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
