
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, CreditCard, Loader2 } from 'lucide-react';
import { Company } from '@/api/entities';
import { Subscription } from '@/api/entities';
import { toast } from 'sonner';
import { CompanyUser } from '@/api/entities';
import { SendEmail } from '@/api/integrations';

const PLANS = {
    starter: {
        name: 'Starter',
        monthly: 29,
        annual: 290,
        features: ['Up to 5 users', 'Basic CRM', 'Email integration', '5GB storage'],
        description: 'Perfect for small teams getting started'
    },
    professional: {
        name: 'Professional', 
        monthly: 99,
        annual: 990,
        features: ['Up to 25 users', 'Advanced AI tools', 'Call analytics', '50GB storage', 'API access'],
        description: 'Ideal for growing sales teams'
    },
    enterprise: {
        name: 'Enterprise',
        monthly: 299,
        annual: 2990,
        features: ['Unlimited users', 'Custom integrations', 'Advanced analytics', 'Unlimited storage', 'Priority support'],
        description: 'For large organizations with complex needs'
    }
};

export default function CompanyCreationModal({ open, onOpenChange, onCompanyCreated }) {
    const [step, setStep] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        // Company Info
        company_name: '',
        domain: '',
        industry: '',
        company_size: '',
        
        // Admin Info
        admin_name: '',
        admin_email: '',

        // Billing Info
        billing_email: '',
        billing_address: {
            street: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US'
        },
        
        // Subscription
        subscription_plan: 'professional',
        billing_cycle: 'monthly',
        license_count: 10,
        
        // Trial
        trial_days: 14
    });

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const calculatePricing = () => {
        const plan = PLANS[formData.subscription_plan];
        const pricePerUser = formData.billing_cycle === 'monthly' ? plan.monthly : plan.annual;
        const totalPrice = pricePerUser * formData.license_count;
        const monthlyPrice = formData.billing_cycle === 'monthly' ? totalPrice : totalPrice / 12;
        
        return {
            pricePerUser,
            totalPrice,
            monthlyPrice: Math.round(monthlyPrice),
            savings: formData.billing_cycle === 'annual' ? (plan.monthly * formData.license_count * 12) - totalPrice : 0
        };
    };

    const sendWelcomeEmail = async (adminName, adminEmail, companyName) => {
        const appUrl = window.location.origin;
        const subject = `🚀 Welcome to SalesAI Pro, ${companyName}!`;
        const body = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome aboard, ${adminName}!</h2>
                <p>Your company, <strong>${companyName}</strong>, has been successfully set up on SalesAI Pro.</p>
                <p>As the administrator, you can now log in to manage your team, configure settings, and start exploring our powerful AI sales tools.</p>
                <a href="${appUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                    Access Your Dashboard
                </a>
                <p>Your username is your email: <strong>${adminEmail}</strong></p>
                <p>If you have any questions, feel free to reply to this email.</p>
                <p>Best,<br/>The SalesAI Pro Team</p>
            </div>
        `;

        try {
            await SendEmail({ to: adminEmail, subject, body });
            toast.info(`Welcome email sent to ${adminEmail}`);
        } catch (error) {
            console.error("Error sending welcome email:", error);
            toast.error("Company created, but failed to send welcome email.");
        }
    };

    const handleCreateCompany = async () => {
        setIsCreating(true);
        try {
            const pricing = calculatePricing();
            
            // Create company
            const company = await Company.create({
                company_name: formData.company_name,
                domain: formData.domain,
                admin_name: formData.admin_name,
                admin_email: formData.admin_email,
                industry: formData.industry,
                company_size: formData.company_size,
                billing_email: formData.billing_email,
                billing_address: formData.billing_address,
                subscription_plan: formData.subscription_plan,
                license_count: formData.license_count,
                used_license_count: 0,
                subscription_status: 'trial',
                trial_end_date: new Date(Date.now() + formData.trial_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                subscription_start_date: new Date().toISOString().split('T')[0],
                monthly_price: pricing.monthlyPrice,
                is_active: true
            });

            // Create subscription record
            await Subscription.create({
                company_id: company.id,
                plan_name: formData.subscription_plan,
                plan_display_name: PLANS[formData.subscription_plan].name,
                billing_cycle: formData.billing_cycle,
                price_per_user: pricing.pricePerUser,
                total_amount: pricing.totalPrice,
                user_limit: formData.license_count,
                status: 'trial',
                trial_start: new Date().toISOString().split('T')[0],
                trial_end: new Date(Date.now() + formData.trial_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                auto_renewal: true
            });

            // Create the Company Admin user
            await CompanyUser.create({
                company_id: company.id,
                user_email: formData.admin_email,
                user_name: formData.admin_name,
                role: 'company_admin',
                is_active: true,
                invitation_status: 'accepted' // Assuming direct creation grants access
            });

            // Send welcome email
            await sendWelcomeEmail(formData.admin_name, formData.admin_email, formData.company_name);

            toast.success(`Company "${formData.company_name}" created successfully!`);
            onCompanyCreated();
            onOpenChange(false);
            
            // Reset form
            setStep(1);
            setFormData({
                company_name: '',
                domain: '',
                admin_name: '',
                admin_email: '',
                industry: '',
                company_size: '',
                billing_email: '',
                billing_address: { street: '', city: '', state: '', postal_code: '', country: 'US' },
                subscription_plan: 'professional',
                billing_cycle: 'monthly',
                license_count: 10,
                trial_days: 14
            });
            
        } catch (error) {
            console.error('Error creating company:', error);
            toast.error('Failed to create company. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Company & Admin Information</h3>
                    <p className="text-sm text-slate-600">Details about the company and its first admin user</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input 
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        placeholder="e.g. Acme Corporation"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="domain">Domain</Label>
                    <Input 
                        id="domain"
                        value={formData.domain}
                        onChange={(e) => handleInputChange('domain', e.target.value)}
                        placeholder="e.g. acme.com"
                    />
                </div>
                 <div>
                    <Label htmlFor="admin_name">Admin Name *</Label>
                    <Input 
                        id="admin_name"
                        value={formData.admin_name}
                        onChange={(e) => handleInputChange('admin_name', e.target.value)}
                        placeholder="e.g. Jane Doe"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="admin_email">Admin Email *</Label>
                    <Input 
                        id="admin_email"
                        type="email"
                        value={formData.admin_email}
                        onChange={(e) => handleInputChange('admin_email', e.target.value)}
                        placeholder="e.g. jane.doe@acme.com"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-1000">201-1000 employees</SelectItem>
                            <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="billing_email">Billing Email *</Label>
                <Input 
                    id="billing_email"
                    type="email"
                    value={formData.billing_email}
                    onChange={(e) => handleInputChange('billing_email', e.target.value)}
                    placeholder="billing@acme.com"
                    required
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Subscription Plan</h3>
                    <p className="text-sm text-slate-600">Choose the right plan for this company</p>
                </div>
            </div>

            <div className="grid gap-4">
                {Object.entries(PLANS).map(([key, plan]) => (
                    <Card 
                        key={key} 
                        className={`cursor-pointer transition-all ${
                            formData.subscription_plan === key 
                                ? 'ring-2 ring-blue-500 bg-blue-50' 
                                : 'hover:shadow-md'
                        }`}
                        onClick={() => handleInputChange('subscription_plan', key)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold">{plan.name}</h4>
                                    <p className="text-sm text-slate-600 mb-2">{plan.description}</p>
                                    <div className="text-sm text-slate-500">
                                        {plan.features.slice(0, 2).map((feature, idx) => (
                                            <div key={idx}>• {feature}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">${plan.monthly}</div>
                                    <div className="text-sm text-slate-500">per user/month</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="billing_cycle">Billing Cycle</Label>
                    <Select value={formData.billing_cycle} onValueChange={(value) => handleInputChange('billing_cycle', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="annual">Annual (Save 16%)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="license_count">Number of Users</Label>
                    <Input 
                        id="license_count"
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.license_count}
                        onChange={(e) => handleInputChange('license_count', parseInt(e.target.value) || 1)}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="trial_days">Trial Period (Days)</Label>
                <Input 
                    id="trial_days"
                    type="number"
                    min="0"
                    max="90"
                    value={formData.trial_days}
                    onChange={(e) => handleInputChange('trial_days', parseInt(e.target.value) || 0)}
                />
            </div>
        </div>
    );

    const renderStep3 = () => {
        const pricing = calculatePricing();
        
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Review & Confirm</h3>
                        <p className="text-sm text-slate-600">Verify all details before creating the company</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Company & Admin Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Company:</span> {formData.company_name}
                            </div>
                            <div>
                                <span className="font-medium">Admin:</span> {formData.admin_name} ({formData.admin_email})
                            </div>
                            <div>
                                <span className="font-medium">Industry:</span> {formData.industry || 'Not specified'}
                            </div>
                            <div>
                                <span className="font-medium">Size:</span> {formData.company_size || 'Not specified'}
                            </div>
                            <div>
                                <span className="font-medium">Billing Email:</span> {formData.billing_email}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-medium">{PLANS[formData.subscription_plan].name} Plan</div>
                                <div className="text-sm text-slate-600">{formData.license_count} users • {formData.billing_cycle} billing</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">${pricing.totalPrice.toLocaleString()}</div>
                                <div className="text-sm text-slate-600">per {formData.billing_cycle === 'monthly' ? 'month' : 'year'}</div>
                            </div>
                        </div>
                        
                        {pricing.savings > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="text-sm font-medium text-green-800">
                                    Annual savings: ${pricing.savings.toLocaleString()}
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-800">
                                {formData.trial_days}-day free trial included
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                                Company will be automatically activated after trial period
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Create New Company
                    </DialogTitle>
                    
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center space-x-4 mt-4">
                        {[1, 2, 3].map((stepNum) => (
                            <div key={stepNum} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step >= stepNum 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-slate-200 text-slate-600'
                                }`}>
                                    {stepNum}
                                </div>
                                {stepNum < 3 && (
                                    <div className={`w-16 h-1 mx-2 ${
                                        step > stepNum ? 'bg-blue-600' : 'bg-slate-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </DialogHeader>

                <div className="py-6">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        {step > 1 && (
                            <Button variant="outline" onClick={() => setStep(step - 1)}>
                                Previous
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        
                        {step < 3 ? (
                            <Button 
                                onClick={() => setStep(step + 1)}
                                disabled={
                                    step === 1 && (!formData.company_name || !formData.admin_name || !formData.admin_email || !formData.billing_email)
                                }
                            >
                                Next
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleCreateCompany}
                                disabled={isCreating}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Company'
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
