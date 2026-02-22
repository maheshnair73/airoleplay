
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Company } from '@/api/entities';
import { Subscription } from '@/api/entities';
import { PlanFeature } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    Building2, DollarSign, Users, Calendar, Activity, BarChart,
    Loader2, AlertTriangle, CheckCircle, Clock, ArrowLeft, XCircle, Ban
} from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

const StatusBadge = ({ status }) => {
    const colors = {
        active: 'bg-green-100 text-green-800',
        trial: 'bg-blue-100 text-blue-800',
        past_due: 'bg-yellow-100 text-yellow-800',
        canceled: 'bg-red-100 text-red-800',
        suspended: 'bg-gray-100 text-gray-800'
    };
    const icons = { active: CheckCircle, trial: Clock, past_due: AlertTriangle, canceled: XCircle, suspended: Ban };
    const Icon = icons[status] || Activity;

    return (
        <Badge className={`${colors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            {status?.replace('_', ' ') || 'Unknown'}
        </Badge>
    );
};

const UsageBar = ({ feature, currentUsage, limit }) => {
    const percentage = limit > 0 ? (currentUsage / limit) * 100 : 0;
    let colorClass = "bg-green-500";
    if (percentage > 75) colorClass = "bg-yellow-500";
    if (percentage >= 100) colorClass = "bg-red-500";

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">{feature}</span>
                <span className="text-sm text-slate-500">{currentUsage} / {limit === Infinity ? '∞' : limit}</span>
            </div>
            <Progress value={percentage} indicatorClassName={colorClass} />
        </div>
    );
};


export default function CompanyDetails() {
    const [companyId, setCompanyId] = useState(null);
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [planFeatures, setPlanFeatures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        setCompanyId(id);
    }, [window.location.search]);

    useEffect(() => {
        const loadDetails = async () => {
            if (!companyId) {
                setIsLoading(false);
                return;
            };
            setIsLoading(true);
            try {
                const [companyData, subData] = await Promise.all([
                    Company.get(companyId),
                    Subscription.filter({ company_id: companyId })
                ]);

                if (companyData) {
                    setCompany(companyData);
                    const featuresData = await PlanFeature.filter({ plan_availability: { "$in" : [companyData.subscription_plan]} });
                    setPlanFeatures(featuresData);
                }

                if (subData.length > 0) {
                    setSubscription(subData[0]);
                }
                
            } catch (error) {
                console.error("Error loading company details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDetails();
    }, [companyId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
        );
    }
    
    if (!company) {
         return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Company not found.</h1>
                 <Button onClick={() => navigate(createPageUrl('CompanyManagement'))} variant="outline" className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Company Management
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">{company.company_name}</h1>
                        <p className="text-slate-600 mt-1">{company.domain}</p>
                    </div>
                </div>
                 <Button onClick={() => navigate(createPageUrl('CompanyManagement'))} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to List
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-slate-500" />
                                Subscription Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between"><span>Status:</span> <StatusBadge status={subscription?.status} /></div>
                            <div className="flex justify-between"><span>Plan:</span> <span className="font-medium capitalize">{subscription?.plan_name}</span></div>
                            <div className="flex justify-between"><span>Billing:</span> <span className="font-medium capitalize">{subscription?.billing_cycle}</span></div>
                            <div className="flex justify-between"><span>Users:</span> <span className="font-medium">{company.used_license_count} / {company.license_count}</span></div>
                            <div className="flex justify-between"><span>MRR:</span> <span className="font-medium">${(company.monthly_price || 0).toLocaleString()}</span></div>
                            {subscription?.trial_end && (
                                <div className="flex justify-between"><span>Trial Ends:</span> <span className="font-medium">{format(new Date(subscription.trial_end), 'MMM d, yyyy')}</span></div>
                            )}
                            {subscription?.billing_cycle_resets_on && (
                                <div className="flex justify-between"><span>Billing Resets:</span> <span className="font-medium">{format(new Date(subscription.billing_cycle_resets_on), 'MMM d, yyyy')}</span></div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart className="w-5 h-5 text-slate-500" />
                                Current Usage
                            </CardTitle>
                        </CardHeader>
                         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {planFeatures.length > 0 ? planFeatures.map(feature => (
                                <UsageBar
                                    key={feature.feature_key}
                                    feature={feature.feature_name}
                                    currentUsage={subscription?.current_usage?.[feature.feature_key] || 0}
                                    limit={feature.default_limit ?? Infinity}
                                />
                            )) : (
                                <p className="text-slate-500 text-center py-4 col-span-2">No features with usage limits defined for this plan.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
