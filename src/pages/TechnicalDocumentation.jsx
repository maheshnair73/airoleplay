import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Code, 
    Database, 
    Zap, 
    Shield, 
    Smartphone, 
    Bot,
    FileText,
    Users,
    BarChart3,
    Mail,
    Phone,
    Presentation,
    Brain,
    Download,
    BookOpen,
    Sparkles,
    Target,
    GraduationCap
} from 'lucide-react';

const TechnicalSection = ({ title, icon: Icon, children, className = "" }) => (
    <Card className={`card-print ${className}`}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Icon className="w-6 h-6" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const APIEndpoint = ({ method, endpoint, description, params = [], response = "" }) => (
    <div className="border border-slate-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
            <Badge className={
                method === 'GET' ? 'bg-green-100 text-green-800' :
                method === 'POST' ? 'bg-blue-100 text-blue-800' :
                method === 'PUT' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
            }>
                {method}
            </Badge>
            <code className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{endpoint}</code>
        </div>
        <p className="text-sm text-slate-600 mb-2">{description}</p>
        {params.length > 0 && (
            <div className="mb-2">
                <h5 className="text-sm font-medium mb-1">Parameters:</h5>
                <ul className="text-xs text-slate-500 space-y-1">
                    {params.map((param, idx) => (
                        <li key={idx} className="font-mono">
                            <span className="text-blue-600">{param.name}</span>
                            <span className="text-slate-400"> ({param.type})</span>
                            {param.required && <span className="text-red-500"> *</span>}
                            - {param.description}
                        </li>
                    ))}
                </ul>
            </div>
        )}
        {response && (
            <div>
                <h5 className="text-sm font-medium mb-1">Response Example:</h5>
                <pre className="text-xs bg-slate-50 p-2 rounded overflow-x-auto">{response}</pre>
            </div>
        )}
    </div>
);

const ModuleSection = ({ title, icon: Icon, description, features, apiEndpoints, dataFlow, technicalSpecs }) => (
    <TechnicalSection title={title} icon={Icon}>
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-slate-800 mb-2">Overview</h4>
                <p className="text-sm text-slate-600">{description}</p>
            </div>
            
            {features && (
                <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Key Features</h4>
                    <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                        {features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                        ))}
                    </ul>
                </div>
            )}

            {apiEndpoints && (
                <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Core API Endpoints</h4>
                    {apiEndpoints.map((endpoint, idx) => (
                        <APIEndpoint key={idx} {...endpoint} />
                    ))}
                </div>
            )}

            {dataFlow && (
                <div>
                    <h4 className="font-semibold text-slate-800 mb-2">High-Level Data Flow</h4>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap font-mono">{dataFlow}</pre>
                    </div>
                </div>
            )}

            {technicalSpecs && (
                <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Technical Specifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(technicalSpecs).map(([key, value], idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{key}</span>
                                <p className="text-sm text-slate-700 mt-1">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </TechnicalSection>
);

export default function TechnicalDocumentation() {
    const lastUpdatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        SalesAI Pro - Business Requirements Document
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        A comprehensive overview of the modules, features, and technical architecture of the SalesAI Pro platform.
                    </p>
                    <div data-no-print="true" className="mt-6 flex justify-center items-center gap-4">
                        <Badge variant="outline">Last Updated: {lastUpdatedDate}</Badge>
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download as PDF
                        </Button>
                    </div>
                </div>
                
                {/* effyLeads Module */}
                <ModuleSection 
                    title="effyLeads: Lead Management System"
                    icon={Users}
                    description="The effyLeads system is the central hub for all prospecting and lead generation activities. It enables sales teams to capture, enrich, qualify, and track leads through the entire funnel, from initial contact to handoff to the deals pipeline."
                    features={[
                        "Multi-source lead capture (web forms, CSV imports, manual entry, API).",
                        "AI-powered data enrichment to augment lead profiles with firmographic and contact data.",
                        "Automated lead scoring based on demographic fit and engagement level.",
                        "Real-time activity tracking (email opens, document views, call connections).",
                        "Kanban and list views for flexible workflow management.",
                        "Integration with AI Call Dialer and Email Sequencer."
                    ]}
                    apiEndpoints={[
                        {
                            method: "POST",
                            endpoint: "/api/leads",
                            description: "Create a new lead. Triggers automated enrichment and scoring.",
                            params: [{ name: "lead_data", type: "object", required: true, description: "Object containing lead details." }],
                            response: `{ "id": "lead_abc123", "ai_score": 85, "status": "new", ... }`
                        },
                        {
                            method: "PUT",
                            endpoint: "/api/leads/{id}/status",
                            description: "Update a lead's status. This is the core mechanism for moving a lead through the Kanban board.",
                            params: [{ name: "status", type: "string", required: true, description: "The new status of the lead." }]
                        }
                    ]}
                    dataFlow={`1. Lead Ingestion: A new 'Lead' entity is created.
2. Enrichment: An AI function is triggered to enrich the lead data.
3. Scoring: The lead's 'ai_score' is calculated based on enriched data and engagement.
4. Activity Logging: All interactions (calls, emails) create 'LeadActivity' entities linked to the lead.
5. Conversion: When a lead is moved to 'closed_won', a 'Deal' entity can be automatically created.`}
                    technicalSpecs={{
                        "Primary Entities": "Lead, LeadActivity",
                        "AI/ML Model": "Custom-trained Gradient Boosting model for lead scoring.",
                        "Real-time Updates": "WebSocket broadcasts on lead status changes.",
                        "Dependencies": "Clearbit/ZoomInfo for enrichment, AI Dialer for calls."
                    }}
                />

                {/* effyDoc Module */}
                <ModuleSection 
                    title="effyDoc: Content Management & Analytics"
                    icon={FileText}
                    description="effyDoc is an intelligent content hub for creating, sharing, and tracking sales collateral. It includes a team-wide Content Library for templates and a personal space for deal-specific documents, providing deep analytics on prospect engagement."
                    features={[
                        "Rich text editor and PDF uploads.",
                        "Reusable templates with dynamic variables (e.g., {{contact_name}}).",
                        "Secure, shareable links with access controls (email verification, password).",
                        "Real-time notifications and detailed analytics: page-by-page views, time spent, scroll depth.",
                        "Internal collaboration: commenting, versioning, and approval workflows."
                    ]}
                    apiEndpoints={[
                        { method: "POST", endpoint: "/api/documents", description: "Create a new document from a template or PDF." },
                        { method: "GET", endpoint: "/api/documents/{id}/analytics", description: "Fetch detailed viewing analytics." },
                        { method: "POST", endpoint: "/api/documents/{id}/share", description: "Generate a secure, shareable link." }
                    ]}
                    dataFlow={`1. Creation: A 'Document' is created from a 'DocumentTemplate' or uploaded.
2. Sharing: A public link is generated, pointing to DocumentPublicView.
3. Viewing: A 'DocumentView' entity is created for each viewing session, capturing detailed page-level analytics.
4. Real-time: A WebSocket message is sent to the document owner when a view starts.`}
                    technicalSpecs={{
                        "Primary Entities": "Document, DocumentView, DocumentTemplate, DocumentComment",
                        "Key Function": "generateThumbnail() for creating image previews of documents.",
                        "Frontend": "React-Quill for the editor, PDF.js for rendering.",
                        "Storage": "Supabase Storage for files, PostgreSQL for metadata."
                    }}
                />

                 {/* Digital Sales Rooms Module */}
                <ModuleSection 
                    title="Digital Sales Rooms (DSRs)"
                    icon={Presentation}
                    description="DSRs are persistent, shared microsites for specific deals. They act as a single source of truth, replacing messy email chains and providing a collaborative space for buyers and sellers to access materials, communicate, and align on next steps."
                    features={[
                        "Customizable branding (logo, colors).",
                        "Content sections for documents, videos, and rich text.",
                        "Integrated chat for real-time, deal-specific communication.",
                        "Mutual Action Plan to track tasks, owners, and due dates.",
                        "Consolidated analytics on all content engagement within the room."
                    ]}
                     dataFlow={`1. A 'DigitalSalesRoom' is created, linked to a 'Deal' entity.
2. Content (Documents, links) is added to the room's sections.
3. Participants (buyers, sellers) are invited.
4. All interactions (views, chats, task completions) create 'SalesRoomEngagement' and 'SalesRoomMessage' entities.`}
                     technicalSpecs={{
                        "Primary Entities": "DigitalSalesRoom, SalesRoomMessage, SalesRoomEngagement",
                        "Frontend": "Component-based architecture allowing modular content sections.",
                        "Real-time": "WebSocket channels for live chat and notifications."
                    }}
                />
                
                {/* AI Sales Coach Module */}
                <ModuleSection 
                    title="AI Sales Coach: Roleplay & Coaching"
                    icon={GraduationCap}
                    description="The AI Sales Coach is a training and development suite designed to improve sales skills through practice and automated feedback. It includes AI-powered roleplay, a library of best-practice pitches, and a hub for structured coaching tasks."
                    features={[
                        "AI-powered voice roleplay with realistic prospect personas.",
                        "Real-time analysis and scorecard generation after each roleplay session.",
                        "Pitch Library: A repository of approved pitches for reps to study.",
                        "Coaching Hub: Admins can assign specific practice tasks (e.g., 'Practice handling the price objection').",
                        "Performance tracking over time to identify skill gaps and improvements."
                    ]}
                    apiEndpoints={[
                        { method: "POST", endpoint: "/functions/aiRoleplay", description: "Initiates and manages a voice roleplay session." },
                        { method: "POST", endpoint: "/api/coaching-tasks", description: "Create and assign a new coaching task." },
                        { method: "GET", endpoint: "/api/roleplay-sessions/{id}", description: "Retrieve the full analysis of a past session." }
                    ]}
                     dataFlow={`1. User starts a session with an AI persona via the 'aiRoleplay' function.
2. The function orchestrates a conversation between the user's microphone input and AI-generated voice responses.
3. Upon completion, the entire transcript is sent to an LLM for analysis.
4. A 'RoleplaySession' entity is created, storing the transcript and the AI's feedback scorecard.`}
                     technicalSpecs={{
                        "Primary Entities": "RoleplaySession, CoachingTask, SharedPitch",
                        "AI Services": "Speech-to-Text (Deepgram), Text-to-Speech (ElevenLabs), Core Logic (GPT-4).",
                        "Key Function": "aiRoleplay()"
                    }}
                />

                {/* Knowledge Hub Module */}
                <ModuleSection
                    title="Knowledge Hub: Centralized Intelligence"
                    icon={Brain}
                    description="The Knowledge Hub is the single source of truth for the entire sales organization. It houses official product information, competitive battlecards, and valuable insights crowdsourced from internal experts across different departments (Product, Engineering, etc.)."
                    features={[
                        "Product Management: Detailed repository of all company products and services.",
                        "Competitor Management: Centralized database of competitor strengths, weaknesses, and differentiators.",
                        "Stakeholder Insights: A system to capture, approve, and share knowledge from non-sales departments.",
                        "Secure contribution links for external experts to add knowledge without needing a login."
                    ]}
                    dataFlow={`1. Product/Competitor data is managed by Admins.
2. Stakeholder Insights can be submitted by internal users or external contributors via a secure 'share_token' link.
3. Submitted insights have a status of 'pending_review'.
4. An Admin reviews the submission, can add comments, sets a 'weightage_score', and approves it.
5. Approved insights become visible to the entire sales team.`}
                    technicalSpecs={{
                        "Primary Entities": "Product, Competitor, StakeholderInsight",
                        "Key Feature": "Approval workflow for crowdsourced knowledge ensures data quality.",
                        "Access Control": "Public contribution form is isolated from the main app layout."
                    }}
                />
                 
                {/* Security & API Section */}
                <TechnicalSection title="Architecture & Security" icon={Shield}>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">Core Architecture</h4>
                            <p className="text-sm text-slate-600">The platform is built on a serverless architecture, leveraging Supabase for the PostgreSQL database, authentication, and storage. The frontend is a React single-page application (SPA). Backend logic is handled by Deno Deploy functions, which are used for integrating with third-party APIs and performing complex operations.</p>
                        </div>
                         <div>
                            <h4 className="font-semibold text-slate-800 mb-2">Authentication & Authorization</h4>
                            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                <li>Authentication is handled by Base44's built-in system, supporting email/password and social logins.</li>
                                <li>Authorization is managed via a role-based access control (RBAC) system. User roles ('sales_rep', 'admin', 'super_admin') are stored in the User entity.</li>
                                <li>The main layout file conditionally renders navigation items based on the user's role, hiding administrative sections from non-admin users.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">API Standards</h4>
                            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                <li>The primary API is the auto-generated Base44 SDK, which provides type-safe methods for CRUD operations on all entities.</li>
                                <li>Custom business logic and third-party integrations are exposed as serverless functions, accessible via the Base44 SDK.</li>
                                <li>All API communication is over HTTPS.</li>
                            </ul>
                        </div>
                    </div>
                </TechnicalSection>
            </div>
        </div>
    );
}