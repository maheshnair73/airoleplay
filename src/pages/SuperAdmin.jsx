
import React, { useState, useEffect } from 'react';
import { Company } from '@/api/entities';
import { CompanyUser } from '@/api/entities';
import { Subscription } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Building2, Users, DollarSign, TrendingUp, Search,
    Settings, Crown, AlertTriangle, CheckCircle, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import CompanyCreationModal from '@/components/super_admin/CompanyCreationModal';

const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="transition-all hover:shadow-lg">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
                </div>
                <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </CardContent>
    </Card>
);

const CompanyCard = ({ company, onManage }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'trial': return 'bg-blue-100 text-blue-800';
            case 'past_due': return 'bg-yellow-100 text-yellow-800';
            case 'canceled': return 'bg-red-100 text-red-800';
            case 'suspended': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg">{company.company_name}</h3>
                        <p className="text-sm text-muted-foreground">{company.industry || 'Industry not specified'}</p>
                    </div>
                    <Badge className={getStatusColor(company.subscription_status)}>
                        {company.subscription_status}
                    </Badge>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium capitalize">{company.subscription_plan}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Users:</span>
                        <span className="font-medium">{company.used_license_count}/{company.license_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-medium">${company.monthly_price}/month</span>
                    </div>
                </div>

                <Button
                    onClick={() => onManage(company)}
                    className="w-full"
                    variant="outline"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Company
                </Button>
            </CardContent>
        </Card>
    );
};

export default function SuperAdmin() {
    const [companies, setCompanies] = useState([]);
    const [metrics, setMetrics] = useState({
        totalCompanies: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        trialCompanies: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showDemoMode, setShowDemoMode] = useState(false);
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);

    useEffect(() => {
        checkSuperAdminAccess();
        loadDashboardData();
    }, []);

    const checkSuperAdminAccess = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);

            // For demo purposes, if user is 'admin', show demo mode notice
            if (currentUser.role === 'admin') {
                setShowDemoMode(true);
                // Load demo data
                loadDemoData();
            } else if (currentUser.role !== 'super_admin') {
                toast.error("Access denied. Super admin privileges required.");
                return;
            }
        } catch (error) {
            toast.error("Failed to verify admin access.");
        }
    };

    const loadDemoData = () => {
        // Demo companies data
        const demoCompanies = [
            {
                id: 'demo-1',
                company_name: 'TechCorp Solutions',
                industry: 'Technology',
                subscription_plan: 'enterprise',
                subscription_status: 'active',
                license_count: 50,
                used_license_count: 42,
                monthly_price: 14950
            },
            {
                id: 'demo-2',
                company_name: 'Global Dynamics Inc',
                industry: 'Manufacturing',
                subscription_plan: 'professional',
                subscription_status: 'active',
                license_count: 25,
                used_license_count: 25,
                monthly_price: 2475
            },
            {
                id: 'demo-3',
                company_name: 'StartupXYZ',
                industry: 'Fintech',
                subscription_plan: 'starter',
                subscription_status: 'trial',
                license_count: 5,
                used_license_count: 3,
                monthly_price: 145
            }
        ];

        setCompanies(demoCompanies);
        setMetrics({
            totalCompanies: 3,
            activeSubscriptions: 2,
            totalRevenue: 14950 + 2475 + 145, // Sum of monthly_price from demo data
            trialCompanies: 1
        });
        setIsLoading(false);
    };

    const loadDashboardData = async () => {
        if (showDemoMode) return;

        setIsLoading(true);
        try {
            // Load real companies and calculate metrics
            const allCompanies = await Company.list('-created_date');
            setCompanies(allCompanies);

            const activeSubscriptions = allCompanies.filter(c => c.subscription_status === 'active').length;
            const totalRevenue = allCompanies.reduce((sum, c) => sum + (c.monthly_price || 0), 0);
            const trialCompanies = allCompanies.filter(c => c.subscription_status === 'trial').length;

            setMetrics({
                totalCompanies: allCompanies.length,
                activeSubscriptions,
                totalRevenue,
                trialCompanies
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // If real data fails, show demo data
            loadDemoData();
            setShowDemoMode(true);
        }
        setIsLoading(false);
    };

    const handleManageCompany = (company) => {
        if (showDemoMode) {
            toast.info("This is demo mode. Real company management would open here.");
            return;
        }
        // Navigate to company management page
        window.location.href = `/CompanyManagement?id=${company.id}`;
    };

    const handleCreateCompany = () => {
        if (showDemoMode) {
            setIsCreatingCompany(true);
        } else {
            setIsCreatingCompany(true);
        }
    };

    const promoteToSuperAdmin = async () => {
        try {
            await User.updateMyUserData({ role: 'super_admin' });
            toast.success("You've been promoted to Super Admin! Reloading page...");
            setTimeout(() => window.location.reload(), 1000); // Give toast time to show
        } catch (error) {
            console.error("Failed to update role:", error);
            toast.error("Failed to update role. This is likely not allowed in this environment.");
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (user && user.role !== 'super_admin' && user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You need super admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            {/* Demo Mode Notice */}
            {showDemoMode && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                                <Shield className="w-5 h-5"/>
                                Demo Super Admin Mode
                            </h3>
                            <p className="text-blue-700 mt-1">
                                You're viewing demo data as you have admin privileges. In production, only super_admin role users can access this page.
                            </p>
                        </div>
                        {user?.role === 'admin' && (
                            <Button onClick={promoteToSuperAdmin} variant="outline" size="sm">
                                Promote to Super Admin
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <Crown className="w-10 h-10 text-yellow-500" />
                        Super Admin Dashboard
                        {showDemoMode && <Badge variant="secondary" className="ml-2">Demo Mode</Badge>}
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage companies, subscriptions, and platform analytics</p>
                </div>
                <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={handleCreateCompany}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Company
                </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Companies"
                    value={metrics.totalCompanies}
                    icon={Building2}
                    color="bg-blue-500"
                    subtitle="Registered companies"
                />
                <MetricCard
                    title="Active Subscriptions"
                    value={metrics.activeSubscriptions}
                    icon={CheckCircle}
                    color="bg-green-500"
                    subtitle="Paying customers"
                />
                <MetricCard
                    title="Monthly Revenue"
                    value={`$${metrics.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-purple-500"
                    subtitle="Recurring revenue"
                />
                <MetricCard
                    title="Trial Companies"
                    value={metrics.trialCompanies}
                    icon={TrendingUp}
                    color="bg-orange-500"
                    subtitle="Potential conversions"
                />
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                    <CompanyCard
                        key={company.id}
                        company={company}
                        onManage={handleManageCompany}
                    />
                ))}
            </div>

            {filteredCompanies.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">No companies found</h3>
                    <p className="text-muted-foreground">Get started by adding your first company.</p>
                </div>
            )}

            <CompanyCreationModal
                open={isCreatingCompany}
                onOpenChange={setIsCreatingCompany}
                onCompanyCreated={loadDashboardData}
            />
        </div>
    );
}
