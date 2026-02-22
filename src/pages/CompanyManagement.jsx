import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Company } from '@/api/entities';
import { CompanyUser } from '@/api/entities';
import { Subscription } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Building2, Users, DollarSign, Calendar, Search, Filter,
    Eye, Settings, Ban, CheckCircle, XCircle, Clock,
    TrendingUp, Mail, Phone, Globe, AlertTriangle
} from 'lucide-react';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';

const StatusBadge = ({ status }) => {
    const colors = {
        active: 'bg-green-100 text-green-800',
        trial: 'bg-blue-100 text-blue-800',
        past_due: 'bg-yellow-100 text-yellow-800',
        canceled: 'bg-red-100 text-red-800',
        suspended: 'bg-gray-100 text-gray-800'
    };

    const icons = {
        active: CheckCircle,
        trial: Clock,
        past_due: AlertTriangle,
        canceled: XCircle,
        suspended: Ban
    };

    const Icon = icons[status] || Clock;

    return (
        <Badge className={`${colors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            {status?.replace('_', ' ') || 'Unknown'}
        </Badge>
    );
};

const CompanyRow = ({ company, onViewDetails, onToggleStatus }) => {
    const trialDaysLeft = company.trial_end_date ?
        Math.max(0, Math.ceil((new Date(company.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24))) : 0;

    const utilizationPercentage = company.license_count > 0 ?
        Math.round((company.used_license_count / company.license_count) * 100) : 0;

    const getUtilizationColor = (percentage) => {
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <tr className="border-b hover:bg-slate-50">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900">{company.company_name}</div>
                        <div className="text-sm text-slate-500">{company.domain || 'No domain'}</div>
                    </div>
                </div>
            </td>
            <td className="p-4">
                <div>
                    <div className="font-medium text-slate-900">{company.admin_name || 'No admin'}</div>
                    <div className="text-sm text-slate-500">{company.admin_email || 'No email'}</div>
                </div>
            </td>
            <td className="p-4">
                <StatusBadge status={company.subscription_status} />
            </td>
            <td className="p-4">
                <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 capitalize">
                        {company.subscription_plan}
                    </div>
                    <div className="text-sm text-slate-500">
                        ${(company.monthly_price || 0).toLocaleString()}/mo
                    </div>
                </div>
            </td>
            <td className="p-4">
                <div className="text-center">
                    <div className={`text-lg font-bold ${getUtilizationColor(utilizationPercentage)}`}>
                        {company.used_license_count}/{company.license_count}
                    </div>
                    <div className="text-sm text-slate-500">
                        {utilizationPercentage}% used
                    </div>
                </div>
            </td>
            <td className="p-4 text-center">
                {company.subscription_status === 'trial' ? (
                    <div>
                        <div className="font-medium text-slate-900">
                            {trialDaysLeft} days
                        </div>
                        <div className="text-sm text-slate-500">remaining</div>
                    </div>
                ) : (
                    <div className="text-sm text-slate-500">
                        {company.subscription_status === 'active' ? 'Paid' : 'N/A'}
                    </div>
                )}
            </td>
            <td className="p-4 text-sm text-slate-500">
                <div>
                    {company.created_date ? format(new Date(company.created_date), 'MMM d, yyyy') : 'Unknown'}
                </div>
                <div className="text-xs">
                    {company.created_date ? formatDistanceToNow(new Date(company.created_date), { addSuffix: true }) : ''}
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(company)}
                        className="flex items-center gap-1"
                    >
                        <Eye className="w-4 h-4" />
                        View
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(company)}
                        className={`flex items-center gap-1 ${
                            company.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                        }`}
                    >
                        {company.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {company.is_active ? 'Suspend' : 'Activate'}
                    </Button>
                </div>
            </td>
        </tr>
    );
};

export default function CompanyManagement() {
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    const [metrics, setMetrics] = useState({
        totalCompanies: 0,
        activeSubscriptions: 0,
        trialCompanies: 0,
        totalRevenue: 0,
        averageLicenseUtilization: 0
    });

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        filterCompanies();
    }, [companies, searchTerm, statusFilter]);

    const loadCompanies = async () => {
        setIsLoading(true);
        try {
            const companiesData = await Company.list('-created_at');
            setCompanies(companiesData);
            calculateMetrics(companiesData);
        } catch (error) {
            console.error('Error loading companies:', error);
            toast.error('Failed to load companies');
        }
        setIsLoading(false);
    };

    const calculateMetrics = (companiesData) => {
        const totalCompanies = companiesData.length;
        const activeSubscriptions = companiesData.filter(c => c.subscription_status === 'active').length;
        const trialCompanies = companiesData.filter(c => c.subscription_status === 'trial').length;
        const totalRevenue = companiesData.reduce((sum, c) => sum + (c.monthly_price || 0), 0);

        const utilizationRates = companiesData
            .filter(c => c.license_count > 0)
            .map(c => (c.used_license_count / c.license_count) * 100);
        const averageLicenseUtilization = utilizationRates.length > 0 ?
            utilizationRates.reduce((sum, rate) => sum + rate, 0) / utilizationRates.length : 0;

        setMetrics({
            totalCompanies,
            activeSubscriptions,
            trialCompanies,
            totalRevenue,
            averageLicenseUtilization: Math.round(averageLicenseUtilization)
        });
    };

    const filterCompanies = () => {
        let filtered = companies;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(company => company.subscription_status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(company =>
                company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.domain?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCompanies(filtered);
    };

    const handleToggleStatus = async (company) => {
        try {
            const newStatus = company.is_active ? false : true;
            await Company.update(company.id, { is_active: newStatus });

            setCompanies(prev => prev.map(c =>
                c.id === company.id ? { ...c, is_active: newStatus } : c
            ));

            toast.success(`Company ${newStatus ? 'activated' : 'suspended'} successfully`);
        } catch (error) {
            console.error('Error toggling company status:', error);
            toast.error('Failed to update company status');
        }
    };

    const handleViewDetails = (company) => {
        navigate(createPageUrl(`CompanyDetails?id=${company.id}`));
    };

    const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600">{title}</p>
                        <p className="text-3xl font-bold text-slate-900">{value}</p>
                        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Company Management</h1>
                    <p className="text-slate-600 mt-2">Monitor and manage all registered companies</p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <MetricCard
                    title="Total Companies"
                    value={metrics.totalCompanies}
                    icon={Building2}
                    color="bg-blue-500"
                    subtitle="Registered"
                />
                <MetricCard
                    title="Active Subscriptions"
                    value={metrics.activeSubscriptions}
                    icon={CheckCircle}
                    color="bg-green-500"
                    subtitle="Paying customers"
                />
                <MetricCard
                    title="Trial Companies"
                    value={metrics.trialCompanies}
                    icon={Clock}
                    color="bg-orange-500"
                    subtitle="In trial period"
                />
                <MetricCard
                    title="Monthly Revenue"
                    value={`$${metrics.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-purple-500"
                    subtitle="Recurring"
                />
                <MetricCard
                    title="Avg License Usage"
                    value={`${metrics.averageLicenseUtilization}%`}
                    icon={TrendingUp}
                    color="bg-indigo-500"
                    subtitle="Utilization rate"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search companies, emails, domains..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="past_due">Past Due</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Companies Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-slate-500">Loading companies...</p>
                        </div>
                    ) : filteredCompanies.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Company</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Admin</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Plan</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">License Usage</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-slate-600">Trial Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Created</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCompanies.map((company) => (
                                        <CompanyRow
                                            key={company.id}
                                            company={company}
                                            onViewDetails={handleViewDetails}
                                            onToggleStatus={handleToggleStatus}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600 mb-2">No companies found</h3>
                            <p className="text-slate-500">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'No companies have been registered yet'
                                }
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}