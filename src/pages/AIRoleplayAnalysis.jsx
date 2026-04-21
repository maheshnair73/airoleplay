
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { RoleplaySession } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft, Play, Pause, Volume2, MessageSquare,
    CheckCircle, XCircle, BarChart3, Clock, Target,
    Brain, TrendingUp, Award, FileText, Bot, Repeat, PlusCircle,
    ChevronRight, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function AIRoleplayAnalysis() {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionNotFound, setSessionNotFound] = useState(false);
    const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = React.useRef(null);

    const location = useLocation();
    const navigate = useNavigate(); // Initialize useNavigate
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('id');

    const createMockSession = useCallback((id) => {
        // Define different mock sessions based on ID
        const baseMockSession = {
            id: id,
            bot_name: 'Kathy Wood',
            bot_personality: 'VP of Sales',
            scenario: 'Discovery Call Practice',
            created_date: '2024-02-08T14:30:00Z',
            session_duration: 420,
            call_type: 'discovery',
            audio_url: 'https://example.com/audio-call-' + id + '.mp3',
            transcript: [
                {
                    speaker: 'ai',
                    text: "Hi there! Thanks for taking the time to speak with me today. I'm Kathy, VP of Sales here at TechCorp. How's your day going?",
                    timestamp: '2024-02-08T14:30:15Z',
                    timeInSeconds: 0
                },
                {
                    speaker: 'user',
                    text: "Hi Kathy, nice to meet you. My day's been pretty busy, but I'm glad we could connect.",
                    timestamp: '2024-02-08T14:30:25Z',
                    timeInSeconds: 10
                },
                {
                    speaker: 'ai',
                    text: "I completely understand. Before we dive in, I noticed on your LinkedIn you're a big fan of hiking. Have you been on any good trails lately?",
                    timestamp: '2024-02-08T14:30:35Z',
                    timeInSeconds: 20
                },
                {
                    speaker: 'user',
                    text: "Wow, great research! I just got back from Yosemite. It was amazing. But yeah, let's talk business. We're struggling with lead qualification.",
                    timestamp: '2024-02-08T14:30:50Z',
                    timeInSeconds: 35
                },
                {
                    speaker: 'ai',
                    text: "Yosemite is incredible. Okay, focusing on lead qualification—that's a common challenge. When you say conversion rates aren't where you want them, what's your current rate, and where would you ideally like to see it?",
                    timestamp: '2024-02-08T14:31:05Z',
                    timeInSeconds: 50
                },
                {
                    speaker: 'user',
                    text: "Right now we're at about 8%, and honestly, we'd like to be closer to 15% or even 20%. We're spending so much time on leads that go nowhere.",
                    timestamp: '2024-02-08T14:31:22Z',
                    timeInSeconds: 67
                },
                {
                    speaker: 'ai',
                    text: "That's a significant gap. What do you think is causing that? Is it a data quality issue, or is it more about your team's ability to identify the right leads?",
                    timestamp: '2024-02-08T14:31:38Z',
                    timeInSeconds: 83
                },
                {
                    speaker: 'user',
                    text: "I think it's a bit of both. Our data isn't always accurate, and sometimes our reps spend time on companies that aren't even in our ICP.",
                    timestamp: '2024-02-08T14:31:52Z',
                    timeInSeconds: 97
                },
                {
                    speaker: 'ai',
                    text: "Got it. And what's the impact of this on your team? Are they frustrated? Is it affecting morale?",
                    timestamp: '2024-02-08T14:32:05Z',
                    timeInSeconds: 110
                },
                {
                    speaker: 'user',
                    text: "Definitely. My top performers are getting burned out chasing bad leads. It's a real problem.",
                    timestamp: '2024-02-08T14:32:18Z',
                    timeInSeconds: 123
                },
                {
                    speaker: 'ai',
                    text: "I can see how that would be a major concern. Have you tried any solutions to address this so far?",
                    timestamp: '2024-02-08T14:32:30Z',
                    timeInSeconds: 135
                },
                {
                    speaker: 'user',
                    text: "We're using ZoomInfo for data, but we're still having issues with accuracy and enrichment.",
                    timestamp: '2024-02-08T14:32:42Z',
                    timeInSeconds: 147
                },
                {
                    speaker: 'ai',
                    text: "ZoomInfo is a solid tool. Many of our customers actually use us alongside ZoomInfo to enrich their data further and improve qualification accuracy. What's been your experience with their data quality specifically?",
                    timestamp: '2024-02-08T14:33:00Z',
                    timeInSeconds: 165
                },
                {
                    speaker: 'user',
                    text: "It's decent, but we still find a lot of outdated contacts and missing information. Plus, it doesn't really help us prioritize which leads to focus on first.",
                    timestamp: '2024-02-08T14:33:18Z',
                    timeInSeconds: 183
                },
                {
                    speaker: 'ai',
                    text: "That makes sense. If you could wave a magic wand and fix one thing about your lead qualification process today, what would it be?",
                    timestamp: '2024-02-08T14:33:35Z',
                    timeInSeconds: 200
                },
                {
                    speaker: 'user',
                    text: "I'd want real-time insights on which leads are most likely to convert, so my team isn't wasting time on dead ends.",
                    timestamp: '2024-02-08T14:33:50Z',
                    timeInSeconds: 215
                },
                {
                    speaker: 'ai',
                    text: "That's exactly what our platform helps with. We use AI to score and prioritize leads based on conversion probability. Would it make sense to schedule a quick 20-minute demo next week so I can show you how it works?",
                    timestamp: '2024-02-08T14:34:10Z',
                    timeInSeconds: 235
                },
                {
                    speaker: 'user',
                    text: "Yeah, that could be interesting. Let me check my calendar. How about Tuesday at 2 PM?",
                    timestamp: '2024-02-08T14:34:25Z',
                    timeInSeconds: 250
                },
                {
                    speaker: 'ai',
                    text: "Tuesday at 2 PM works perfectly. I'll send you a calendar invite with a link to the demo. In the meantime, is there anything specific you'd like me to prepare or focus on?",
                    timestamp: '2024-02-08T14:34:40Z',
                    timeInSeconds: 265
                },
                {
                    speaker: 'user',
                    text: "Just show me how it integrates with our existing tools and what kind of ROI we can expect.",
                    timestamp: '2024-02-08T14:34:55Z',
                    timeInSeconds: 280
                },
                {
                    speaker: 'ai',
                    text: "Perfect. I'll prepare some case studies from similar companies in your industry. Looking forward to it, and thanks for your time today!",
                    timestamp: '2024-02-08T14:35:10Z',
                    timeInSeconds: 295
                },
                {
                    speaker: 'user',
                    text: "Sounds good. Thanks, Kathy!",
                    timestamp: '2024-02-08T14:35:20Z',
                    timeInSeconds: 305
                }
            ],
            analysis_results: {
                overall_score: 0,
                talk_listen_ratio: 45,
                filler_words: 8,
                questions_count: 7,
                longest_monologue: 45,
                talk_speed_wpm: 142,
                evaluation_framework: "Cold Call Framework",
                summary: "The agent started with good rapport-building but could have tied it back to the business conversation more smoothly. They successfully identified a key pain point (lead qualification) but missed an opportunity to explore the financial impact before jumping to metrics. The call ended with a clear, but not confirmed, next step.",
                objections: [
                    { objection: "I'm not interested in buying customer data right now.", response: "I understand, and I'm not here to sell you data today. I'm here to understand if the challenges you face with lead qualification are something we might be able to help with down the line." },
                    { objection: "We're already using ZoomInfo.", response: "That's great, they're a solid tool. Many of our customers use us alongside ZoomInfo to enrich the data they already have and improve qualification accuracy. What's been your experience with their data quality?" }
                ],
                questions_asked: [
                    "How's your day going?",
                    "Could you tell me a bit about your current sales process?",
                    "What's your current conversion rate, and where would you ideally like to see it?"
                ],
                what_went_well: [
                    { title: "Rapport Building", text: "Used personal information from LinkedIn to build initial rapport." },
                    { title: "Open-Ended Questions", text: "Asked questions that encouraged the prospect to elaborate on their challenges." },
                ],
                areas_for_improvement: [
                    { title: "Probing Deeper", text: "Could have asked 'What's the financial impact of poor lead qualification?' to create more urgency." },
                    { title: "Handling Objections", text: "When the prospect mentioned using a competitor, the agent could have explored their satisfaction level more before positioning their own product." },
                ],
                scorecard: [
                    {
                        category: "Opener",
                        score: 0,
                        maxScore: 2,
                        criteria: [
                            {
                                text: "Permission based opener?",
                                passed: false,
                                explanation: "After reviewing the transcript, I can see that the sales rep (Mahesh Michael) did not use a permission-based opener. A permission-based opener would involve asking the prospect for permission to take a few minutes of their time before explaining the purpose of the call. Instead, the conversation flow was:",
                                details: [
                                    "The prospect answered and asked who was calling",
                                    "The rep introduced himself and asked how the prospect was doing",
                                    "They exchanged pleasantries about being busy",
                                    "The prospect directly asked what the call was about",
                                    "The rep then launched into explaining his reason for calling without first asking for permission to take a few minutes of the prospect's time"
                                ],
                                improvement: "The sales rep should have used a permission-based opener after the initial greeting exchange. For example, after the prospect mentioned being busy, the rep could have said: 'I understand you're busy. Would it be okay if I took just 2 minutes to explain why I'm calling, and then you can decide if it makes sense to continue?' This shows respect for the prospect's time and gives them control over the conversation."
                            },
                            {
                                text: "Used research on prospect?",
                                passed: false,
                                explanation: "After analyzing the transcript, I found no evidence that the sales rep (Mahesh Michael) had conducted any prior research on the prospect. Throughout the conversation, the rep:",
                                details: [
                                    "Started with a generic greeting without mentioning the prospect's name",
                                    "Made a general assumption about the prospect being busy due to 'month end' without specific knowledge of their role",
                                    "Presented a CRM product without knowing that the prospect works in engineering, not sales",
                                    "When the prospect mentioned they work on the engineering side, the rep immediately ended the call rather than pivoting the conversation based on this new information"
                                ],
                                improvement: "The sales rep should conduct thorough research before making calls to ensure they're speaking with the right person about relevant solutions. Specifically: (1) Identify the prospect's name, role, and department before calling (2) Research the company to understand their tech stack and potential pain points (3) Verify that the prospect's role aligns with the solution being offered"
                            }
                        ]
                    },
                    {
                        category: "Social Proof",
                        score: 0,
                        maxScore: 2,
                        criteria: [
                            {
                                text: "Provided social proof?",
                                passed: false,
                                explanation: "After carefully reviewing the transcript, I found no instances where the sales rep provided any social proof to the prospect. Social proof would include mentioning:",
                                details: [
                                    "Customer testimonials or success stories",
                                    "Case studies of similar companies",
                                    "Industry statistics showing product effectiveness",
                                    "Names of other clients using the product",
                                    "Reviews or ratings from existing customers"
                                ],
                                improvement: "The sales rep should incorporate social proof early in the conversation to build credibility. For example, they could say something like: 'We've implemented this with several engineering-focused companies like [Company X] who saw a 30% reduction in data entry time and improved lead conversion rates. Their engineering teams particularly appreciated how it integrated with their existing systems.' Additionally, the rep should have asked if the prospect would like to see specific examples relevant to their industry."
                            },
                            {
                                text: "Asked if social proof was relevant?",
                                passed: false,
                                explanation: "The rep only provided a general description of the CRM product's features (interactive, voice-enabled data entry) but did not reference any existing customers, success metrics, or other forms of social validation that would help establish credibility and value.",
                                details: [],
                                improvement: "After providing social proof, always validate its relevance by asking questions like: 'Does this sound similar to challenges your team faces?' or 'Would it be helpful to see how other engineering teams have used this?'"
                            }
                        ]
                    },
                    {
                        category: "Discovery",
                        score: 0,
                        maxScore: 1,
                        criteria: [
                            {
                                text: "SDR asked for preconceptions of product?",
                                passed: false,
                                explanation: "The rep did not ask about the prospect's existing perceptions, assumptions, or prior knowledge about their product category or company. Understanding preconceptions helps address potential biases or misconceptions early in the conversation.",
                                details: [],
                                improvement: "Before presenting the solution, ask: 'Have you heard of [our company] before?' or 'What has been your experience with similar CRM tools?' This helps uncover any preconceptions that might need to be addressed."
                            }
                        ]
                    },
                    {
                        category: "Takeaway",
                        score: 0,
                        maxScore: 2,
                        criteria: [
                            {
                                text: "Re-confirmed that the time works for the prospect?",
                                passed: false,
                                explanation: "While the prospect initially engaged in the conversation, the rep never explicitly re-confirmed whether the timing was still good after the prospect mentioned being busy. This is important to ensure you're not losing the prospect's attention or goodwill.",
                                details: [],
                                improvement: "After the initial exchange, especially when a prospect mentions being busy, ask: 'Is this still a good time for a quick conversation, or would you prefer I call back at a better time?' This demonstrates respect and can actually increase engagement."
                            },
                            {
                                text: "Asked for success criteria for next call?",
                                passed: false,
                                explanation: "The rep did not attempt to schedule a next call or define what success criteria would look like for a follow-up conversation. The call ended abruptly when Mahesh decided to hang up after learning the product wasn't relevant to the prospect's role.",
                                details: [],
                                improvement: "Even when a prospect isn't the right fit, ask for a referral or define next steps: 'Would it make sense for me to reach out to someone on your sales or CRM team instead?' This keeps doors open and shows professionalism."
                            }
                        ]
                    },
                    {
                        category: "Closing",
                        score: 0,
                        maxScore: 2,
                        criteria: [
                            {
                                text: "Next steps agreed upon?",
                                passed: false,
                                explanation: "No next steps were agreed upon. The call ended when Mahesh Michael decided to hang up after learning that the recipient worked on the engineering side and didn't handle sales or customer relationship management directly.",
                                details: [],
                                improvement: "Before ending the call, always try to secure next steps, even if it's just getting a referral to the right person or permission to send information."
                            },
                            {
                                text: "Follow-up meeting booked?",
                                passed: false,
                                explanation: "No follow-up meeting was scheduled. The conversation ended quickly when Mahesh realized the product wasn't relevant to the recipient's role.",
                                details: [],
                                improvement: "Even when speaking with the wrong person, attempt to book time with the right stakeholder or get an introduction."
                            }
                        ]
                    }
                ]
            },
            bot_configuration: JSON.stringify({
                id: 'mock_bot_1',
                name: 'Kathy Wood',
                title: 'VP of Sales',
                company_name: 'TechCorp',
                personality: 'Professional, Analytical',
                roleplay_type: 'discovery',
                voice: 'english_male',
                language: 'english',
                traits: ['Professional', 'Analytical', 'Challenging'],
                painPoints: ['Lead qualification', 'Sales cycle length', 'Conversion rates'],
                background: 'Kathy Wood is a VP of Sales at TechCorp, a growing B2B SaaS company. She\'s generally open to new solutions but is also skeptical of flashy sales pitches and prioritizes demonstrable ROI. She\'s currently focused on improving lead quality and sales efficiency.',
                difficulty: 'Medium'
            })
        };

        // Customize based on different session IDs
        const variations = {
            '2': {
                scenario: 'MEDDIC Discovery Call',
                session_duration: 480,
                call_type: 'discovery',
                analysis_results: {
                    ...baseMockSession.analysis_results,
                    overall_score: 67,
                    evaluation_framework: "MEDDIC",
                    scorecard: [
                        {
                            category: "Metrics",
                            score: 2,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified quantifiable business metrics?",
                                    passed: true,
                                    explanation: "The sales rep successfully identified that the prospect is currently at 8% conversion rate and wants to reach 15-20%. This is a clear, quantifiable metric that can be measured.",
                                    details: [
                                        "Prospect stated current conversion rate: 8%",
                                        "Prospect stated target conversion rate: 15-20%",
                                        "Gap identified: 7-12% improvement needed"
                                    ],
                                    improvement: "While the rep captured the conversion rate, they could have gone deeper by asking: 'How many leads does that 8% represent in absolute numbers?' and 'What would a 15% conversion rate mean in terms of additional revenue?'"
                                },
                                {
                                    text: "Discussed ROI or cost savings?",
                                    passed: false,
                                    explanation: "The rep did not discuss specific ROI or cost savings. While they touched on the problem of wasted time on bad leads, they didn't quantify the financial impact or potential savings.",
                                    details: [],
                                    improvement: "Ask questions like: 'What's the average deal size?' and 'If we could help you reach that 15% conversion rate, what would that mean in terms of additional annual revenue?' This helps build a business case."
                                },
                                {
                                    text: "Established measurable success criteria?",
                                    passed: true,
                                    explanation: "The rep confirmed the prospect wants to improve from 8% to 15-20% conversion rate, which is a clear success metric.",
                                    details: [],
                                    improvement: "Could have expanded by asking: 'What timeframe are you looking to achieve this improvement in?' and 'Are there any other KPIs we should be tracking?'"
                                }
                            ]
                        },
                        {
                            category: "Economic Buyer",
                            score: 0,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified the economic buyer?",
                                    passed: false,
                                    explanation: "The rep did not identify or ask about who controls the budget for this type of purchase.",
                                    details: [],
                                    improvement: "Ask: 'Who typically owns the budget for sales tools and data platforms at your company?' or 'What's the approval process for this type of investment?'"
                                },
                                {
                                    text: "Understood budget authority?",
                                    passed: false,
                                    explanation: "No discussion about budget authority or financial decision-making power.",
                                    details: [],
                                    improvement: "Probe with: 'What does the budgeting process look like for your team?' and 'Do you have allocated budget for solving this problem?'"
                                },
                                {
                                    text: "Confirmed ability to make financial decisions?",
                                    passed: false,
                                    explanation: "The rep never confirmed whether the prospect (VP of Sales) has the authority to make this purchase decision.",
                                    details: [],
                                    improvement: "Ask directly: 'If we find a solution that meets your needs, what's your involvement in the final decision?'"
                                }
                            ]
                        },
                        {
                            category: "Decision Criteria",
                            score: 1,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Uncovered evaluation criteria?",
                                    passed: true,
                                    explanation: "The prospect mentioned two key criteria: integration with existing tools and ROI expectations.",
                                    details: [
                                        "Prospect wants to see 'how it integrates with our existing tools'",
                                        "Prospect wants to understand 'what kind of ROI we can expect'"
                                    ],
                                    improvement: "Follow up with: 'Besides integration and ROI, what other factors will be important in your decision?' and 'How do you typically prioritize these criteria?'"
                                },
                                {
                                    text: "Understood what matters most in selection?",
                                    passed: false,
                                    explanation: "While criteria were mentioned, the rep didn't probe to understand which criteria are most important or deal-breakers.",
                                    details: [],
                                    improvement: "Ask: 'If you had to rank those factors, which is most critical?' and 'Are there any must-haves versus nice-to-haves?'"
                                },
                                {
                                    text: "Identified competing priorities?",
                                    passed: false,
                                    explanation: "No discussion about what else the prospect is evaluating or considering.",
                                    details: [],
                                    improvement: "Probe: 'Are you looking at any other solutions?' and 'What other projects are competing for your attention right now?'"
                                }
                            ]
                        },
                        {
                            category: "Decision Process",
                            score: 1,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Mapped out the buying process?",
                                    passed: false,
                                    explanation: "The rep scheduled a demo but didn't map out what happens after the demo or the full buying process.",
                                    details: [],
                                    improvement: "Ask: 'After the demo, what are the typical next steps in your evaluation process?' and 'Who else would need to be involved before moving forward?'"
                                },
                                {
                                    text: "Identified timeline and steps?",
                                    passed: true,
                                    explanation: "A demo was scheduled for Tuesday at 2 PM, establishing a clear next step and timeline.",
                                    details: [],
                                    improvement: "Go deeper: 'What's your ideal timeline for having a solution in place?' and 'Are there any upcoming events or deadlines driving your timeline?'"
                                },
                                {
                                    text: "Understood stakeholders involved?",
                                    passed: false,
                                    explanation: "No discussion about who else needs to be involved in the decision or who should attend the demo.",
                                    details: [],
                                    improvement: "Ask: 'Who else from your team should join the demo?' and 'Whose input will be important in the final decision?'"
                                }
                            ]
                        },
                        {
                            category: "Identify Pain",
                            score: 2,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Discovered compelling pain points?",
                                    passed: true,
                                    explanation: "The rep successfully uncovered multiple pain points: low conversion rates (8%), time wasted on bad leads, and team burnout.",
                                    details: [
                                        "8% conversion rate (target: 15-20%)",
                                        "Time wasted on leads that go nowhere",
                                        "Top performers getting burned out",
                                        "Inaccurate data from ZoomInfo",
                                        "Lack of lead prioritization"
                                    ],
                                    improvement: "Excellent pain discovery! Could probe even deeper: 'What happens if you can't solve this in the next 6 months?'"
                                },
                                {
                                    text: "Quantified impact of current situation?",
                                    passed: true,
                                    explanation: "The rep got the prospect to quantify the conversion rate gap and discuss the impact on team morale.",
                                    details: [],
                                    improvement: "Quantify further: 'How much time does your team waste per week on unqualified leads?' and 'What's the cost of replacing a burned-out top performer?'"
                                },
                                {
                                    text: "Created urgency to change?",
                                    passed: false,
                                    explanation: "While pain was identified, the rep didn't create strong urgency or consequences of not changing.",
                                    details: [],
                                    improvement: "Build urgency: 'If this continues for another quarter, what impact will that have on your team's targets?' and 'What prompted you to start looking for a solution now?'"
                                }
                            ]
                        },
                        {
                            category: "Champion",
                            score: 0,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified internal champion?",
                                    passed: false,
                                    explanation: "The rep didn't ask about or identify an internal champion who would advocate for the solution.",
                                    details: [],
                                    improvement: "Ask: 'Who in your organization is most passionate about solving this problem?' and 'Is there someone who would be excited to help drive this initiative?'"
                                },
                                {
                                    text: "Built relationship with advocate?",
                                    passed: false,
                                    explanation: "No effort to build the prospect as a champion or identify other potential champions.",
                                    details: [],
                                    improvement: "Engage the prospect: 'Based on what we've discussed, does this sound like something you'd be willing to champion internally?' and 'What would you need from me to build a strong case with your team?'"
                                },
                                {
                                    text: "Confirmed champion's influence?",
                                    passed: false,
                                    explanation: "Did not assess the prospect's influence or ability to drive the deal forward internally.",
                                    details: [],
                                    improvement: "Validate: 'How have you successfully brought in new solutions like this in the past?' and 'What's your relationship like with the final decision maker?'"
                                }
                            ]
                        }
                    ]
                },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'John Doe', title: 'IT Manager', roleplay_type: 'discovery', personality: 'Analytical, Detail-oriented' })
            },
            '3': {
                scenario: 'SPIN Selling Discovery',
                session_duration: 510,
                call_type: 'discovery',
                analysis_results: {
                    ...baseMockSession.analysis_results,
                    overall_score: 83,
                    evaluation_framework: "SPIN Selling",
                    scorecard: [
                        {
                            category: "Situation Questions",
                            score: 3,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Asked about current situation/context?",
                                    passed: true,
                                    explanation: "The rep effectively asked about the prospect's current sales process and team structure. They started with open-ended questions to understand the baseline situation.",
                                    details: [
                                        "Asked: 'Could you tell me a bit about your current sales process?'",
                                        "Inquired about team size and structure",
                                        "Asked about current tools and systems in use"
                                    ],
                                    improvement: "Excellent situation discovery! Continue this approach of starting with broad, open-ended questions to understand context."
                                },
                                {
                                    text: "Gathered background information?",
                                    passed: true,
                                    explanation: "The rep gathered comprehensive background about the company's sales operations, current conversion rates, and existing tool stack (ZoomInfo).",
                                    details: [],
                                    improvement: "Great job gathering context. Could also ask: 'How long has your team been using this current process?' to understand change readiness."
                                },
                                {
                                    text: "Understood existing processes?",
                                    passed: true,
                                    explanation: "The rep demonstrated clear understanding of how the prospect currently qualifies leads and manages their sales pipeline.",
                                    details: [],
                                    improvement: "Excellent process mapping! Consider asking: 'Walk me through what happens from the moment a lead comes in to when it's assigned to a rep.'"
                                }
                            ]
                        },
                        {
                            category: "Problem Questions",
                            score: 2,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified specific problems/challenges?",
                                    passed: true,
                                    explanation: "The rep identified multiple specific problems: low 8% conversion rate, time wasted on unqualified leads, and team burnout.",
                                    details: [
                                        "Low conversion rate (8% vs. target of 15-20%)",
                                        "Time wasted on leads that don't convert",
                                        "Top performers experiencing burnout",
                                        "Inaccurate data from current tools"
                                    ],
                                    improvement: "Strong problem identification! Could probe deeper: 'Which of these problems is causing the most immediate pain right now?'"
                                },
                                {
                                    text: "Explored pain points in depth?",
                                    passed: true,
                                    explanation: "The rep dug into the details of each problem, understanding both the tactical challenges and emotional impact (team morale).",
                                    details: [],
                                    improvement: "Good depth! Could explore further: 'Tell me more about how the burnout is manifesting. Are you seeing increased turnover?'"
                                },
                                {
                                    text: "Got prospect to articulate difficulties?",
                                    passed: false,
                                    explanation: "While the rep identified problems, they could have let the prospect articulate more of the difficulties in their own words rather than jumping in with solutions.",
                                    details: [],
                                    improvement: "Ask more open-ended questions like: 'What's been the most frustrating part of dealing with this issue?' Let the prospect talk more."
                                }
                            ]
                        },
                        {
                            category: "Implication Questions",
                            score: 1,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Explored consequences of the problem?",
                                    passed: true,
                                    explanation: "The rep touched on consequences like missed revenue targets and team attrition, but could have explored these implications more deeply.",
                                    details: [],
                                    improvement: "Dig deeper into implications: 'If this 8% conversion rate continues, what impact will that have on your annual revenue targets?' and 'What happens to team morale if nothing changes?'"
                                },
                                {
                                    text: "Discussed impact on business/team?",
                                    passed: false,
                                    explanation: "The rep didn't sufficiently explore the broader business impact beyond the immediate sales metrics. No discussion of customer satisfaction, company reputation, or strategic goals.",
                                    details: [],
                                    improvement: "Ask: 'How is this affecting other parts of the business?' and 'What does your leadership team think about these conversion rates?'"
                                },
                                {
                                    text: "Built urgency around solving the issue?",
                                    passed: false,
                                    explanation: "The rep didn't create a strong sense of urgency or explore what happens if the problem isn't solved soon.",
                                    details: [],
                                    improvement: "Build urgency: 'If we're talking again in 6 months and nothing has changed, what will that mean for your role?' and 'Is there a point where this becomes critical?'"
                                }
                            ]
                        },
                        {
                            category: "Need-Payoff Questions",
                            score: 2,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Asked about value of solving the problem?",
                                    passed: true,
                                    explanation: "The rep asked about the target conversion rate (15-20%), which implies the value of improvement, though they could have been more explicit about quantifying the value.",
                                    details: [],
                                    improvement: "Be more direct: 'If you could wave a magic wand and have perfect lead qualification, what would that be worth to your business?'"
                                },
                                {
                                    text: "Got prospect to describe ideal outcome?",
                                    passed: true,
                                    explanation: "The prospect mentioned wanting to reach 15-20% conversion rate and have better lead quality, describing their ideal state.",
                                    details: [],
                                    improvement: "Expand: 'Paint me a picture of what success looks like 6 months from now. What's changed?' Let them visualize the solution."
                                },
                                {
                                    text: "Linked solution to business impact?",
                                    passed: false,
                                    explanation: "The rep didn't explicitly link improved conversion rates to broader business outcomes like revenue growth, profitability, or competitive advantage.",
                                    details: [],
                                    improvement: "Connect the dots: 'If we can help you get to that 15% conversion rate, what does that mean for your annual revenue?' and 'How would that change your position in the market?'"
                                }
                            ]
                        }
                    ]
                },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Sarah Chen', title: 'Product Owner', roleplay_type: 'discovery', personality: 'Detail-oriented, Technical' })
            },
            '4': {
                scenario: 'MEDDPICC Enterprise Deal',
                session_duration: 620,
                call_type: 'enterprise_discovery',
                analysis_results: {
                    ...baseMockSession.analysis_results,
                    overall_score: 75,
                    evaluation_framework: "MEDDPICC",
                    scorecard: [
                        {
                            category: "Metrics",
                            score: 2,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified quantifiable business metrics?",
                                    passed: true,
                                    explanation: "Rep identified the 8% conversion rate and 15-20% target, providing clear baseline metrics.",
                                    details: [],
                                    improvement: "Also quantify the number of leads, deals, and revenue impact to build a stronger business case."
                                },
                                {
                                    text: "Discussed ROI or cost savings?",
                                    passed: false,
                                    explanation: "No specific ROI calculation or cost-benefit analysis was discussed.",
                                    details: [],
                                    improvement: "Calculate: 'With 1000 monthly leads at 8% vs 15%, that's 80 vs 150 deals. At $10K average deal size, that's $700K additional monthly revenue.'"
                                },
                                {
                                    text: "Established measurable success criteria?",
                                    passed: true,
                                    explanation: "Target conversion rate of 15-20% serves as a clear success metric.",
                                    details: [],
                                    improvement: "Add timeframe: 'When do you need to achieve this 15% conversion rate by?'"
                                }
                            ]
                        },
                        {
                            category: "Economic Buyer",
                            score: 1,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified the economic buyer?",
                                    passed: true,
                                    explanation: "Speaking with VP of Sales who likely has budget authority, though not explicitly confirmed.",
                                    details: [],
                                    improvement: "Confirm: 'As VP of Sales, do you own the budget for sales tools, or is that shared with another department?'"
                                },
                                {
                                    text: "Understood budget authority?",
                                    passed: false,
                                    explanation: "No discussion about budget allocation, approval limits, or financial authority.",
                                    details: [],
                                    improvement: "Ask: 'What's the approval process for investments in this range?' and 'Is there allocated budget for solving this problem?'"
                                },
                                {
                                    text: "Confirmed ability to make financial decisions?",
                                    passed: false,
                                    explanation: "Did not confirm if VP has sole authority or needs approval from CFO/CEO.",
                                    details: [],
                                    improvement: "Clarify: 'For a solution like this, what's your involvement in the final purchasing decision?'"
                                }
                            ]
                        },
                        {
                            category: "Decision Criteria",
                            score: 2,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Uncovered evaluation criteria?",
                                    passed: true,
                                    explanation: "Prospect mentioned integration requirements and ROI expectations as key criteria.",
                                    details: [],
                                    improvement: "Get complete list: 'What else will be important in your evaluation besides integration and ROI?'"
                                },
                                {
                                    text: "Understood what matters most in selection?",
                                    passed: true,
                                    explanation: "Rep understood that integration with existing tools and demonstrable ROI are priorities.",
                                    details: [],
                                    improvement: "Prioritize: 'If you had to rank these factors, which is the absolute must-have?'"
                                },
                                {
                                    text: "Identified competing priorities?",
                                    passed: false,
                                    explanation: "No discussion of what other solutions or projects the prospect is evaluating.",
                                    details: [],
                                    improvement: "Ask: 'Are you looking at any other vendors?' and 'What other initiatives are competing for this budget?'"
                                }
                            ]
                        },
                        {
                            category: "Decision Process",
                            score: 1,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Mapped out the buying process?",
                                    passed: false,
                                    explanation: "Only scheduled a demo, didn't map the full process from demo to signature.",
                                    details: [],
                                    improvement: "Map it out: 'After the demo, what happens? Who reviews it? What are the steps to get to a signed agreement?'"
                                },
                                {
                                    text: "Identified timeline and steps?",
                                    passed: true,
                                    explanation: "Demo scheduled for Tuesday 2 PM is a clear next step.",
                                    details: [],
                                    improvement: "Get full timeline: 'What's your ideal timeline from demo to implementation?' and 'Are there any deadlines driving this?'"
                                },
                                {
                                    text: "Understood stakeholders involved?",
                                    passed: false,
                                    explanation: "No discussion of who else will be involved in evaluation and decision.",
                                    details: [],
                                    improvement: "Map stakeholders: 'Who else should join the demo?' and 'Whose buy-in do you need before moving forward?'"
                                }
                            ]
                        },
                        {
                            category: "Paper Process",
                            score: 0,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Understood contracting/legal process?",
                                    passed: false,
                                    explanation: "No discussion of legal review, procurement, or contracting processes.",
                                    details: [],
                                    improvement: "Ask: 'Once we align on a solution, what does your legal and procurement process look like?'"
                                },
                                {
                                    text: "Identified approval requirements?",
                                    passed: false,
                                    explanation: "No discussion of what approvals are needed or who needs to sign off.",
                                    details: [],
                                    improvement: "Clarify: 'What approvals will you need to get this through?' and 'Have you purchased similar solutions before?'"
                                },
                                {
                                    text: "Discussed procurement procedures?",
                                    passed: false,
                                    explanation: "No mention of procurement team, vendor onboarding, or security reviews.",
                                    details: [],
                                    improvement: "Explore: 'Does your procurement team need to be involved?' and 'Are there any security or compliance reviews required?'"
                                }
                            ]
                        },
                        {
                            category: "Identify Pain",
                            score: 3,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Discovered compelling pain points?",
                                    passed: true,
                                    explanation: "Excellent pain discovery: low conversion rates, wasted time, team burnout, poor data quality.",
                                    details: [],
                                    improvement: "Outstanding! This level of pain discovery creates strong motivation to change."
                                },
                                {
                                    text: "Quantified impact of current situation?",
                                    passed: true,
                                    explanation: "Quantified the conversion rate gap and discussed impact on team performance.",
                                    details: [],
                                    improvement: "Perfect. Could add: 'What's the cost of a sales rep leaving due to burnout?'"
                                },
                                {
                                    text: "Created urgency to change?",
                                    passed: true,
                                    explanation: "Rep established urgency around team burnout and missed targets.",
                                    details: [],
                                    improvement: "Great urgency building! Consider adding: 'What happens if this isn't solved by end of quarter?'"
                                }
                            ]
                        },
                        {
                            category: "Champion",
                            score: 1,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified internal champion?",
                                    passed: false,
                                    explanation: "Didn't ask about or identify someone who would champion the solution internally.",
                                    details: [],
                                    improvement: "Ask: 'Who in your organization is most excited about solving this?' and 'Who would help drive this internally?'"
                                },
                                {
                                    text: "Built relationship with advocate?",
                                    passed: true,
                                    explanation: "Rep built good rapport with the VP of Sales, who could potentially be a champion.",
                                    details: [],
                                    improvement: "Strengthen the relationship: 'What would you need from me to build a strong business case with your team?'"
                                },
                                {
                                    text: "Confirmed champion's influence?",
                                    passed: false,
                                    explanation: "Didn't validate the VP's ability to influence other stakeholders or drive the deal.",
                                    details: [],
                                    improvement: "Validate: 'How have you successfully brought in new solutions in the past?' and 'What's your relationship with the CFO?'"
                                }
                            ]
                        },
                        {
                            category: "Competition",
                            score: 1,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified competitive alternatives?",
                                    passed: true,
                                    explanation: "Prospect mentioned using ZoomInfo currently, which is a competitive solution.",
                                    details: [],
                                    improvement: "Explore further: 'Besides ZoomInfo, are you evaluating any other data or lead qualification tools?'"
                                },
                                {
                                    text: "Understood competitive landscape?",
                                    passed: false,
                                    explanation: "Rep didn't explore what other vendors the prospect might be considering or their status quo bias.",
                                    details: [],
                                    improvement: "Ask: 'Are you looking at other providers?' and 'Have you considered just improving your current ZoomInfo usage?'"
                                },
                                {
                                    text: "Positioned against competition?",
                                    passed: false,
                                    explanation: "No clear differentiation from competitors or discussion of unique value proposition.",
                                    details: [],
                                    improvement: "Position: 'Unlike traditional data providers that just give you contact info, we focus on predictive lead scoring to improve conversion.'"
                                }
                            ]
                        }
                    ]
                },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Michael Lee', title: 'CFO', roleplay_type: 'enterprise_discovery', personality: 'Budget-focused, Strategic' })
            },
            '5': {
                scenario: 'BANT Qualification Call',
                session_duration: 380,
                call_type: 'qualification',
                analysis_results: {
                    ...baseMockSession.analysis_results,
                    overall_score: 68,
                    evaluation_framework: "BANT",
                    scorecard: [
                        {
                            category: "Budget",
                            score: 1,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Discussed available budget?",
                                    passed: false,
                                    explanation: "The rep did not ask about budget availability or financial constraints during the conversation.",
                                    details: [],
                                    improvement: "Early in discovery, ask: 'Have you allocated budget for addressing this lead qualification challenge?' or 'What budget range are you working with for this type of solution?'"
                                },
                                {
                                    text: "Understood financial constraints?",
                                    passed: true,
                                    explanation: "Rep indirectly gauged financial interest when prospect asked about ROI, but didn't explicitly discuss budget constraints.",
                                    details: [],
                                    improvement: "Be direct: 'Are there any budget constraints I should be aware of as we explore options?'"
                                },
                                {
                                    text: "Confirmed funding allocation?",
                                    passed: false,
                                    explanation: "No discussion about whether funds are already allocated or need to be secured.",
                                    details: [],
                                    improvement: "Ask: 'Is there budget already set aside for this initiative, or would this need to come from a different source?'"
                                }
                            ]
                        },
                        {
                            category: "Authority",
                            score: 2,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified decision maker(s)?",
                                    passed: true,
                                    explanation: "Speaking with VP of Sales who is likely a key decision maker, though didn't confirm if others are involved.",
                                    details: [],
                                    improvement: "Clarify: 'Are you the sole decision maker on this, or are there others who need to be involved?'"
                                },
                                {
                                    text: "Understood approval process?",
                                    passed: true,
                                    explanation: "Rep established next steps with demo, implying understanding of the process, but didn't map it explicitly.",
                                    details: [],
                                    improvement: "Map it: 'After the demo, what's your internal approval process? Who else needs to weigh in?'"
                                },
                                {
                                    text: "Confirmed stakeholder involvement?",
                                    passed: false,
                                    explanation: "Didn't ask who else from the team or company needs to be involved in the decision.",
                                    details: [],
                                    improvement: "Ask: 'Besides yourself, who else should we include in these conversations?' and 'Whose opinion will be most important in this decision?'"
                                }
                            ]
                        },
                        {
                            category: "Need",
                            score: 3,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Identified business need?",
                                    passed: true,
                                    explanation: "Excellent needs identification: low conversion rate, poor lead quality, team burnout.",
                                    details: [
                                        "8% conversion rate (target 15-20%)",
                                        "Wasted time on bad leads",
                                        "Team burnout and morale issues",
                                        "Data quality problems with current tools"
                                    ],
                                    improvement: "Outstanding needs discovery! This creates a compelling reason to buy."
                                },
                                {
                                    text: "Understood pain points?",
                                    passed: true,
                                    explanation: "Rep thoroughly explored multiple pain points and their impact on the business and team.",
                                    details: [],
                                    improvement: "Excellent work. Continue to explore both quantitative (metrics) and qualitative (morale) pain points."
                                },
                                {
                                    text: "Confirmed problem severity?",
                                    passed: true,
                                    explanation: "The magnitude of the problem is clear: nearly doubling conversion rate needed, top performers burning out.",
                                    details: [],
                                    improvement: "Perfect severity assessment. The gap between 8% and 15-20% creates urgency."
                                }
                            ]
                        },
                        {
                            category: "Timeline",
                            score: 1,
                            maxScore: 3,
                            criteria: [
                                {
                                    text: "Established buying timeline?",
                                    passed: false,
                                    explanation: "Rep scheduled a demo but didn't ask about the overall timeline for making a decision.",
                                    details: [],
                                    improvement: "Ask: 'What's your ideal timeline for having a solution in place?' and 'When do you need to start seeing results?'"
                                },
                                {
                                    text: "Identified key dates/milestones?",
                                    passed: true,
                                    explanation: "Demo scheduled for Tuesday at 2 PM is a clear milestone, though broader timeline wasn't discussed.",
                                    details: [],
                                    improvement: "Expand timeline discussion: 'Are there any important dates coming up that we should work around?' (e.g., end of quarter, annual planning)"
                                },
                                {
                                    text: "Understood urgency?",
                                    passed: false,
                                    explanation: "While pain was identified, the urgency around when they need to solve it wasn't clearly established.",
                                    details: [],
                                    improvement: "Create urgency: 'How long can you continue with an 8% conversion rate before it becomes critical?' and 'What's driving your timeline?'"
                                }
                            ]
                        }
                    ]
                },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Emily White', title: 'Procurement Specialist', roleplay_type: 'qualification', personality: 'Process-oriented, Budget-conscious' })
            },
            '6': {
                scenario: 'Pricing Discussion',
                session_duration: 450,
                call_type: 'pricing',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 85 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'David Kim', title: 'Head of Operations', roleplay_type: 'pricing', personality: 'Value-driven, Negotiator' })
            },
            '7': {
                scenario: 'Competitive Positioning',
                session_duration: 290,
                call_type: 'competitive',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 82 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Jessica Green', title: 'Marketing Director', roleplay_type: 'competitive', personality: 'Brand-focused, Comparative' })
            },
            '8': {
                scenario: 'Closing Techniques',
                session_duration: 340,
                call_type: 'closing',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 76 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Robert Blue', title: 'CEO', roleplay_type: 'closing', personality: 'Decision-maker, Bottom-line focused' })
            },
            '9': {
                scenario: 'Discovery Call - Enterprise Client',
                session_duration: 390,
                call_type: 'discovery',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 84 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Linda Brown', title: 'Enterprise Account Manager', roleplay_type: 'discovery', personality: 'Complex needs, Strategic' })
            },
            '10': {
                scenario: 'Warm Call Follow-up',
                session_duration: 250,
                call_type: 'warm_call',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 89 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Steven Gray', title: 'Small Business Owner', roleplay_type: 'warm_call', personality: 'Friendly, Time-conscious' })
            },
            '11': {
                scenario: 'Technical Demo',
                session_duration: 600,
                call_type: 'demo',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 77 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Alex Wong', title: 'Lead Developer', roleplay_type: 'demo', personality: 'Technical, In-depth questions' })
            },
            '12': {
                scenario: 'Contract Negotiation',
                session_duration: 480,
                call_type: 'negotiation',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 92 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Olivia White', title: 'Legal Counsel', roleplay_type: 'negotiation', personality: 'Risk-averse, Detailed' })
            },
            'dummy-1': {
                scenario: 'Cold outreach to VP of Sales at TechCorp - Discovery call focused on pain points',
                session_duration: 420,
                call_type: 'ai_roleplay',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 87 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Sarah Johnson', title: 'VP of Sales', roleplay_type: 'discovery', personality: 'Strategic, Bottom-line focused' })
            },
            'dummy-2': {
                scenario: 'Multi-stakeholder demo with CTO, CFO, and VP of Operations',
                session_duration: 1800,
                call_type: 'multi_party',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 72 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Executive Panel', title: 'C-Suite Team', roleplay_type: 'demo', personality: 'Analytical, Risk-averse' })
            },
            'dummy-3': {
                scenario: 'Handling pricing objections - Manager coaching session',
                session_duration: 900,
                call_type: 'human_roleplay',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 91 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Mentor', title: 'Sales Manager', roleplay_type: 'coaching', personality: 'Supportive, Instructive' })
            },
            'dummy-4': {
                scenario: 'Follow-up call after demo - Addressing technical concerns',
                session_duration: 600,
                call_type: 'ai_roleplay',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 65 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Mark Chen', title: 'CTO', roleplay_type: 'technical', personality: 'Detail-oriented, Skeptical' })
            },
            'dummy-5': {
                scenario: 'Negotiation with procurement team - Multiple decision makers',
                session_duration: 2100,
                call_type: 'multi_party',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 78 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Procurement Team', title: 'Procurement Panel', roleplay_type: 'negotiation', personality: 'Cost-conscious, Detail-oriented' })
            },
            'dummy-6': {
                scenario: 'Contract signing - Final questions and objections',
                session_duration: 540,
                call_type: 'ai_roleplay',
                analysis_results: { ...baseMockSession.analysis_results, overall_score: 94 },
                bot_configuration: JSON.stringify({ ...JSON.parse(baseMockSession.bot_configuration), name: 'Emily Rodriguez', title: 'Legal Counsel', roleplay_type: 'closing', personality: 'Cautious, Detail-focused' })
            }
        };

        return { ...baseMockSession, ...(variations[id] || {}) };
    }, []);

    const buildSessionFromData = useCallback((sessionData) => {
        const md = sessionData.meeting_details || {};
        const rawTranscript = Array.isArray(sessionData.transcript) ? sessionData.transcript : [];
        return {
            id: sessionData.id,
            bot_name: md.bot_name || 'AI Bot',
            bot_personality: md.bot_personality || md.bot_configuration?.personality || 'Professional',
            scenario: sessionData.session_name || sessionData.scenario_type || 'Roleplay Session',
            created_date: sessionData.created_at || new Date().toISOString(),
            session_duration: sessionData.duration || 0,
            call_type: sessionData.scenario_type || 'Cold Call',
            transcript: rawTranscript,
            analysis_results: {
                overall_score: sessionData.score || sessionData.overall_score || 0,
                summary: sessionData.feedback || sessionData.feedback_summary || 'Session completed.',
                feedback_summary: sessionData.feedback || sessionData.feedback_summary || '',
                objections: [],
                questions_asked: [],
                what_went_well: md.what_went_well || sessionData.what_went_well || [],
                areas_for_improvement: md.areas_for_improvement || sessionData.areas_for_improvement || [],
                scorecard: md.scorecard || sessionData.scorecard || [],
            },
            bot_configuration: JSON.stringify(md.bot_configuration || { name: md.bot_name || 'AI Bot' }),
        };
    }, []);

    const loadSession = useCallback(async () => {
        setIsLoading(true);

        // Check for inline session passed via router state (when DB save failed)
        const inlineSession = location.state?.inlineSession;
        if (inlineSession) {
            setSession(buildSessionFromData({ ...inlineSession, transcript: [] }));
            setSessionNotFound(false);
            setIsLoading(false);
            return;
        }

        if (sessionId) {
            try {
                const sessionData = await RoleplaySession.get(sessionId);
                setSession(buildSessionFromData(sessionData));
                setSessionNotFound(false);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading session:', error);
                if (/^[1-9]$|^1[0-9]$|^20$/.test(sessionId) || sessionId?.startsWith('dummy-')) {
                    setSession(createMockSession(sessionId));
                    setSessionNotFound(false);
                } else {
                    setSessionNotFound(true);
                }
                setIsLoading(false);
            }
        } else {
            setSessionNotFound(true);
            setIsLoading(false);
        }
    }, [sessionId, createMockSession, buildSessionFromData, location.state]);

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const handleSeekToTime = (timeInSeconds) => {
        if (audioRef.current) {
            audioRef.current.currentTime = timeInSeconds;
            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const TranscriptViewer = ({ transcript }) => (
        <div className="space-y-4 max-h-96 overflow-y-auto bg-slate-50 p-4 rounded-lg">
            {transcript.map((item, index) => (
                <div
                    key={index}
                    className={`flex gap-3 ${item.speaker === 'user' ? 'justify-end' : 'justify-start'} group cursor-pointer hover:bg-slate-100/50 p-2 rounded-lg transition-colors`}
                    onClick={() => handleSeekToTime(item.timeInSeconds || 0)}
                >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                        item.speaker === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-slate-200'
                    }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 opacity-50" />
                            <span className="text-xs font-medium opacity-70">
                                {formatTime(item.timeInSeconds || 0)}
                            </span>
                            <span className="text-xs opacity-50">
                                {item.speaker === 'user' ? 'You' : session?.bot_name}
                            </span>
                        </div>
                        <p className="text-sm">{item.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const ScorecardView = ({ scorecard }) => {
        const [expandedCriteria, setExpandedCriteria] = useState({});

        const toggleCriteria = (categoryIdx, criterionIdx) => {
            const key = `${categoryIdx}-${criterionIdx}`;
            setExpandedCriteria(prev => ({
                ...prev,
                [key]: !prev[key]
            }));
        };

        return (
            <div className="space-y-6">
                {scorecard?.map((category, categoryIdx) => (
                    <div key={categoryIdx} className="border rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b">
                            <h4 className="font-semibold text-slate-800 text-lg">{category.category}</h4>
                            <span className="text-sm font-bold text-slate-600 bg-white px-3 py-1.5 rounded-md border">
                                {category.score}/{category.maxScore}
                            </span>
                        </div>
                        <div className="divide-y">
                            {category.criteria?.map((criterion, criterionIdx) => {
                                const key = `${categoryIdx}-${criterionIdx}`;
                                const isExpanded = expandedCriteria[key];

                                return (
                                    <div key={criterionIdx} className="bg-white">
                                        <button
                                            onClick={() => toggleCriteria(categoryIdx, criterionIdx)}
                                            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
                                        >
                                            {criterion.passed ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            )}
                                            <span className="text-sm text-slate-700 flex-1">{criterion.text}</span>
                                            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </button>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 bg-slate-50/50 border-t">
                                                <div className="mt-4 space-y-4">
                                                    {criterion.explanation && (
                                                        <div>
                                                            <h5 className="font-semibold text-sm text-slate-900 mb-2">
                                                                Why were you scored this way?
                                                            </h5>
                                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                                {criterion.explanation}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {criterion.details && criterion.details.length > 0 && (
                                                        <div>
                                                            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                                                                {criterion.details.map((detail, detailIdx) => (
                                                                    <li key={detailIdx} className="leading-relaxed">{detail}</li>
                                                                ))}
                                                            </ol>
                                                        </div>
                                                    )}

                                                    {criterion.improvement && (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                            <h5 className="font-semibold text-sm text-blue-900 mb-2">
                                                                What could you do differently next time?
                                                            </h5>
                                                            <p className="text-sm text-blue-800 leading-relaxed">
                                                                {criterion.improvement}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handlePracticeAgain = () => {
        if (!session) return; // Ensure session data is available

        // Navigate to a unique practice session URL instead of back to the main list
        // Note: The bot_configuration parsing logic is removed as AIRoleplayPractice expects
        // simpler parameters like bot_name and original_session ID.
        const practiceUrl = createPageUrl(`AIRoleplayPractice?bot_name=${encodeURIComponent(session.bot_name)}&session_type=repeat&original_session=${session.id}`);
        window.location.href = practiceUrl;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading analysis...</p>
                </div>
            </div>
        );
    }

    if (sessionNotFound) {
        return (
            <div className="p-6">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Session Not Found</h2>
                    <p className="text-slate-600 mb-6">The session you're looking for doesn't exist or may have been deleted.</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" asChild>
                            <Link to={createPageUrl('AIRoleplayHistory')}>View All Sessions</Link>
                        </Button>
                        <Button asChild>
                            <Link to={createPageUrl('AIRoleplay')}>Start New Session</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        // This case should ideally not be reached if sessionNotFound and isLoading are handled correctly,
        // but it's a good fallback for robustness.
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">Session data could not be loaded.</p>
                    <Button asChild>
                        <Link to={createPageUrl('AIRoleplay')}>Back to AI Roleplay</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link to={createPageUrl('AIRoleplayHistory')}>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Session Analysis</h1>
                            <p className="text-slate-600">{session.scenario}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={`${getScoreColor(session.analysis_results?.overall_score || 0)} font-bold px-3 py-1`}>
                            {session.analysis_results?.overall_score || 0}% Overall
                        </Badge>
                    </div>
                </div>

                {/* Audio Player */}
                {session.audio_url && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={togglePlayPause}
                                    className="h-12 w-12 rounded-full"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-5 w-5" />
                                    ) : (
                                        <Play className="h-5 w-5 ml-0.5" />
                                    )}
                                </Button>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1 text-sm text-slate-600">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={currentTime}
                                        onChange={(e) => {
                                            const time = parseFloat(e.target.value);
                                            setCurrentTime(time);
                                            if (audioRef.current) {
                                                audioRef.current.currentTime = time;
                                            }
                                        }}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <Volume2 className="h-5 w-5 text-slate-400" />
                            </div>
                            <audio
                                ref={audioRef}
                                src={session.audio_url}
                                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                                onLoadedMetadata={(e) => setDuration(e.target.duration)}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Click on any transcript message to jump to that timestamp
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Session Overview */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-600" />
                            Session Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Clock className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Duration</p>
                                <p className="text-lg font-bold">{formatDuration(session.session_duration)}</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Exchanges</p>
                                <p className="text-lg font-bold">{session.transcript?.length || 0}</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Target className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Bot Personality</p>
                                <p className="text-lg font-bold">{session.bot_personality}</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Award className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Call Type</p>
                                <p className="text-lg font-bold">{session.call_type?.replace('_', ' ') || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="feedback" className="space-y-6">
                    <TabsList className="grid grid-cols-3 w-full md:w-fit">
                        <TabsTrigger value="feedback" className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Feedback & Scorecard
                        </TabsTrigger>
                        <TabsTrigger value="transcript" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Transcript
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Key Moments
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="feedback" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Feedback Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                                        <p className="text-sm text-slate-700">
                                            You provided a concise description of your product's key benefits (interactive CRM that saves time through voice input).
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                                        <p className="text-sm text-slate-700">
                                            You introduced yourself clearly at the beginning of the call.
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                                        <p className="text-sm text-slate-700">
                                            You attempted to build some initial rapport by acknowledging the prospect's busy schedule.
                                        </p>
                                    </li>
                                </ul>

                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-blue-600" />
                                        Scorecard
                                    </h3>
                                    <Badge variant="outline" className="text-xs font-normal">
                                        {session.analysis_results?.evaluation_framework || "Standard Framework"}
                                    </Badge>
                                </div>
                                {session.analysis_results?.scorecard?.length > 0 ? (
                                    <ScorecardView scorecard={session.analysis_results.scorecard} />
                                ) : (
                                    <p className="text-slate-500 text-center py-8">No detailed scorecard available for this session.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transcript">
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversation Transcript</CardTitle>
                                <p className="text-sm text-slate-600">Review the full conversation flow</p>
                            </CardHeader>
                            <CardContent>
                                <TranscriptViewer transcript={session.transcript} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="insights">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600 mb-1">Talk/Listen Ratio</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {session.analysis_results?.talk_listen_ratio || 45}%
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Recommended: 30-40%
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600 mb-1">Filler Words</p>
                                            <p className="text-2xl font-bold text-yellow-600">
                                                {session.analysis_results?.filler_words || 0}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Recommended: 0-5
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600 mb-1">Questions Asked</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {session.analysis_results?.questions_count || 0}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Great discovery!
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600 mb-1">Talk Speed</p>
                                            <p className="text-2xl font-bold text-slate-700">
                                                {session.analysis_results?.talk_speed_wpm || 0} wpm
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Recommended: 120-150
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-blue-600">Key Objections & Rep Responses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {session.analysis_results?.objections?.map((item, index) => (
                                            <li key={index} className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                                <p className="text-sm font-semibold text-slate-600 mb-1">Objection: "{item.objection}"</p>
                                                <p className="text-sm text-slate-800">Response: "{item.response}"</p>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-green-600">What Went Well</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {session.analysis_results?.what_went_well?.map((item, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold">{item.title}</h4>
                                                        <p className="text-sm text-slate-600">{item.text}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {session.analysis_results?.areas_for_improvement?.map((item, index) => (
                                                 <li key={index} className="flex items-start gap-3">
                                                    <XCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold">{item.title}</h4>
                                                        <p className="text-sm text-slate-600">{item.text}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Next Steps
                        </CardTitle>
                        <CardDescription>Continue improving your sales skills.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap justify-center gap-4">
                        <Button
                            onClick={handlePracticeAgain}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                            <Repeat className="w-4 h-4" />
                            Practice this Scenario Again
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to={createPageUrl('AIRoleplay')} className="flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Start a New Session
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to={createPageUrl('AIRoleplayHistory')} className="flex items-center gap-2">
                                <Bot className="w-4 h-4" />
                                View All Bot Sessions
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
