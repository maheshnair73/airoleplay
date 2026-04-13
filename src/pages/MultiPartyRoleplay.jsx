import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MultiPartyScenario } from '@/api/entities';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    Users, Loader2, Target,
    Clock, Star, Play, Filter,
    Briefcase, TrendingUp, Brain,
    UserCheck, DollarSign, Shield,
    Settings, Zap, Plus, Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import {
  RoleplaySetupLayout,
  RoleplaySetupSection
} from '@/components/roleplay/RoleplaySetupLayout';

export default function MultiPartyRoleplay() {
    const [scenarios, setScenarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadScenarios();
    }, []);

    const loadScenarios = async () => {
        setIsLoading(true);
        try {
            const allScenarios = await MultiPartyScenario.list();
            if (allScenarios && allScenarios.length > 0) {
                setScenarios(allScenarios);
            } else {
                setScenarios(getDummyScenarios());
            }
        } catch (error) {
            console.error('Error loading scenarios:', error);
            setScenarios(getDummyScenarios());
        } finally {
            setIsLoading(false);
        }
    };

    const getDummyScenarios = () => {
        return [
            {
                id: 'scenario-1',
                scenario_name: 'Executive Panel Demo',
                scenario_description: 'Present to a panel of C-suite executives including CEO, CFO, and CTO',
                scenario_type: 'panel_interview',
                difficulty_level: 'advanced',
                estimated_duration_minutes: 45,
                average_rating: 4.5,
                buyer_personas: [
                    {
                        name: 'Jennifer Morgan',
                        title: 'Chief Executive Officer',
                        company_name: 'TechVenture Inc',
                        role_in_scenario: 'primary_decision_maker',
                        personality: 'Strategic, Bottom-line focused',
                        is_ai: true
                    },
                    {
                        name: 'Robert Chen',
                        title: 'Chief Financial Officer',
                        company_name: 'TechVenture Inc',
                        role_in_scenario: 'financial_approver',
                        personality: 'Analytical, Risk-averse',
                        is_ai: true
                    },
                    {
                        name: 'Sarah Williams',
                        title: 'Chief Technology Officer',
                        company_name: 'TechVenture Inc',
                        role_in_scenario: 'technical_evaluator',
                        personality: 'Detail-oriented, Security-focused',
                        is_ai: true
                    }
                ],
                seller_personas: [
                    {
                        name: 'You',
                        sales_role: 'account_executive',
                        title: 'Senior Account Executive',
                        is_ai: false
                    }
                ]
            },
            {
                id: 'scenario-2',
                scenario_name: 'Procurement Team Negotiation',
                scenario_description: 'Navigate complex pricing discussions with procurement team',
                scenario_type: 'team_negotiation',
                difficulty_level: 'expert',
                estimated_duration_minutes: 60,
                average_rating: 4.2,
                buyer_personas: [
                    {
                        name: 'David Martinez',
                        title: 'Head of Procurement',
                        company_name: 'Global Corp',
                        role_in_scenario: 'primary_decision_maker',
                        personality: 'Tough negotiator, Cost-conscious',
                        is_ai: true
                    },
                    {
                        name: 'Linda Park',
                        title: 'Procurement Specialist',
                        company_name: 'Global Corp',
                        role_in_scenario: 'influencer',
                        personality: 'Detail-oriented, Process-driven',
                        is_ai: true
                    }
                ],
                seller_personas: [
                    {
                        name: 'You',
                        sales_role: 'account_executive',
                        title: 'Account Executive',
                        is_ai: false
                    },
                    {
                        name: 'Marcus Johnson',
                        sales_role: 'sales_engineer',
                        title: 'Solutions Architect',
                        is_ai: true
                    }
                ]
            },
            {
                id: 'scenario-3',
                scenario_name: 'Multi-Stakeholder Discovery',
                scenario_description: 'Discovery call with multiple departments to uncover needs',
                scenario_type: 'discovery_call',
                difficulty_level: 'intermediate',
                estimated_duration_minutes: 30,
                average_rating: 4.7,
                buyer_personas: [
                    {
                        name: 'Amanda Brooks',
                        title: 'VP of Sales',
                        company_name: 'SalesPro Inc',
                        role_in_scenario: 'end_user',
                        personality: 'Results-driven, Impatient',
                        is_ai: true
                    },
                    {
                        name: 'Tom Richardson',
                        title: 'Head of Sales Operations',
                        company_name: 'SalesPro Inc',
                        role_in_scenario: 'technical_evaluator',
                        personality: 'Analytical, Process-focused',
                        is_ai: true
                    }
                ],
                seller_personas: [
                    {
                        name: 'You',
                        sales_role: 'account_executive',
                        title: 'Account Executive',
                        is_ai: false
                    }
                ]
            }
        ];
    };

    const filteredScenarios = scenarios.filter(scenario => {
        if (filter === 'all') return true;
        return scenario.scenario_type === filter;
    });

    const getDifficultyColor = (level) => {
        const colors = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-blue-100 text-blue-800',
            advanced: 'bg-orange-100 text-orange-800',
            expert: 'bg-red-100 text-red-800'
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const getScenarioTypeIcon = (type) => {
        const icons = {
            panel_interview: <Users className="w-5 h-5" />,
            team_negotiation: <Briefcase className="w-5 h-5" />,
            executive_meeting: <UserCheck className="w-5 h-5" />,
            group_demo: <Zap className="w-5 h-5" />,
            discovery_call: <Target className="w-5 h-5" />,
            custom: <Settings className="w-5 h-5" />
        };
        return icons[type] || <Users className="w-5 h-5" />;
    };

    const getRoleIcon = (role) => {
        const icons = {
            primary_decision_maker: <UserCheck className="w-4 h-4" />,
            technical_evaluator: <Settings className="w-4 h-4" />,
            financial_approver: <DollarSign className="w-4 h-4" />,
            end_user: <Target className="w-4 h-4" />,
            influencer: <TrendingUp className="w-4 h-4" />,
            blocker: <Shield className="w-4 h-4" />
        };
        return icons[role] || <Users className="w-4 h-4" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-500">Loading multi-party scenarios...</p>
                </div>
            </div>
        );
    }

    return (
        <RoleplaySetupLayout
            title="Multi-Party Roleplay"
            description="Practice complex sales scenarios with multiple AI stakeholders"
            icon={Users}
            backPath={createPageUrl('AIRoleplay')}
            backLabel="Back to AI Roleplay"
        >
            <div className="p-8 bg-white border-b border-slate-200">
                <Link to={createPageUrl('CreateMultiPartyScenario')}>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                        <Play className="w-4 h-4 mr-2" />
                        Create New Scenario
                    </Button>
                </Link>
            </div>

            {/* Benefits Banner */}
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Brain className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Multi-Persona Training</h3>
                                <p className="text-sm text-slate-600">Practice with CFO, CTO, and end-users simultaneously</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Team Selling Practice</h3>
                                <p className="text-sm text-slate-600">Coordinate with AI sales teammates or train with your team</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Trophy className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Advanced Feedback</h3>
                                <p className="text-sm text-slate-600">Persona-specific and team collaboration analytics</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Scalable Training</h3>
                                <p className="text-sm text-slate-600">Practice 24/7 without manager availability constraints</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    size="sm"
                >
                    All Scenarios
                </Button>
                <Button
                    variant={filter === 'panel_interview' ? 'default' : 'outline'}
                    onClick={() => setFilter('panel_interview')}
                    size="sm"
                >
                    Panel Interview
                </Button>
                <Button
                    variant={filter === 'team_negotiation' ? 'default' : 'outline'}
                    onClick={() => setFilter('team_negotiation')}
                    size="sm"
                >
                    Team Negotiation
                </Button>
                <Button
                    variant={filter === 'executive_meeting' ? 'default' : 'outline'}
                    onClick={() => setFilter('executive_meeting')}
                    size="sm"
                >
                    Executive Meeting
                </Button>
                <Button
                    variant={filter === 'group_demo' ? 'default' : 'outline'}
                    onClick={() => setFilter('group_demo')}
                    size="sm"
                >
                    Group Demo
                </Button>
            </div>

            {/* Scenarios Grid */}
            {filteredScenarios.length === 0 ? (
                <Card className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Scenarios Found</h3>
                    <p className="text-gray-500 mb-6">Create your first multi-party scenario to get started</p>
                    <Link to={createPageUrl('CreateMultiPartyScenario')}>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Scenario
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredScenarios.map((scenario) => (
                        <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 rounded-lg">
                                            {getScenarioTypeIcon(scenario.scenario_type)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{scenario.scenario_name}</CardTitle>
                                            <CardDescription className="mt-1">{scenario.scenario_description}</CardDescription>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    <Badge className={getDifficultyColor(scenario.difficulty_level)}>
                                        {scenario.difficulty_level}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                                        <Users className="w-3 h-3" />
                                        {scenario.buyer_personas?.length || 0} Buyers
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                                        <Briefcase className="w-3 h-3" />
                                        {scenario.seller_personas?.length || 0} Sellers
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {scenario.estimated_duration_minutes} min
                                    </Badge>
                                    {scenario.average_rating > 0 && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            {scenario.average_rating.toFixed(1)}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Participants Preview */}
                                <div className="space-y-4 mb-4">
                                    {(!scenario.buyer_personas || scenario.buyer_personas.length === 0) &&
                                     (!scenario.seller_personas || scenario.seller_personas.length === 0) ? (
                                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                                            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">No participants configured yet</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Buyer Personas */}
                                            {scenario.buyer_personas?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Buyer Stakeholders:</h4>
                                                    <div className="space-y-2">
                                                        {scenario.buyer_personas.slice(0, 2).map((persona, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                                <div className="p-1 bg-blue-100 rounded">
                                                                    {getRoleIcon(persona.role_in_scenario)}
                                                                </div>
                                                                <span className="font-medium">{persona.name}</span>
                                                                <span className="text-slate-500">-</span>
                                                                <span className="text-slate-600 text-xs">{persona.title}</span>
                                                            </div>
                                                        ))}
                                                        {scenario.buyer_personas.length > 2 && (
                                                            <p className="text-xs text-slate-500 pl-7">
                                                                + {scenario.buyer_personas.length - 2} more buyers
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Seller Personas */}
                                            {scenario.seller_personas?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Sales Team:</h4>
                                                    <div className="space-y-2">
                                                        {scenario.seller_personas.slice(0, 2).map((persona, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                                <div className="p-1 bg-green-100 rounded">
                                                                    <Briefcase className="w-3 h-3" />
                                                                </div>
                                                                <span className="font-medium">{persona.name}</span>
                                                                <span className="text-slate-500">-</span>
                                                                <span className="text-slate-600 text-xs">
                                                                    {persona.sales_role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {scenario.seller_personas.length > 2 && (
                                                            <p className="text-xs text-slate-500 pl-7">
                                                                + {scenario.seller_personas.length - 2} more team members
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Learning Objectives Preview */}
                                {scenario.learning_objectives && scenario.learning_objectives.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Learning Objectives:</h4>
                                        <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                            {scenario.learning_objectives.slice(0, 2).map((objective, idx) => (
                                                <li key={idx}>{objective}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-4">
                                    <Button 
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                        onClick={() => navigate(createPageUrl(`MultiPartySession?scenario_id=${scenario.id}`))}
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Session
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => navigate(createPageUrl(`CreateMultiPartyScenario?edit=${scenario.id}`))}
                                    >
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </RoleplaySetupLayout>
    );
}