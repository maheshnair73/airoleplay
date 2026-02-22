import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User } from '@/api/entities';
import { supabase } from '@/lib/supabase';
import { Building2, Loader2, ShieldCheck, Users, UserCircle, Info, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const DEMO_USERS = [
    {
        email: 'admin@effysalespro.com',
        password: 'demo123',
        role: 'company_admin',
        label: 'Admin',
        bgColor: 'bg-white border-2 border-blue-200',
        textColor: 'text-blue-700',
        icon: ShieldCheck,
        description: 'Company management'
    },
    {
        email: 'manager@effysalespro.com',
        password: 'demo123',
        role: 'sales_manager',
        label: 'Manager',
        bgColor: 'bg-white border-2 border-teal-200',
        textColor: 'text-teal-700',
        icon: Users,
        description: 'Team Manager'
    },
    {
        email: 'agent1@effysalespro.com',
        password: 'demo123',
        role: 'sales_agent',
        label: 'Agent 1',
        bgColor: 'bg-white border-2 border-teal-200',
        textColor: 'text-teal-700',
        icon: UserCircle,
        description: 'Sales Agent'
    },
    {
        email: 'agent2@effysalespro.com',
        password: 'demo123',
        role: 'sales_agent',
        label: 'Agent 2',
        bgColor: 'bg-white border-2 border-amber-200',
        textColor: 'text-amber-700',
        icon: UserCircle,
        description: 'Sales Agent'
    }
];

export default function CorporateAuthMessage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [demoUsersExist, setDemoUsersExist] = useState(false);
    const [checkingDemoUsers, setCheckingDemoUsers] = useState(true);

    useEffect(() => {
        checkDemoUsers();
    }, []);

    const checkDemoUsers = async () => {
        try {
            const { count } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .in('email', DEMO_USERS.map(u => u.email));

            setDemoUsersExist(count === DEMO_USERS.length);
        } catch (error) {
            console.error('Error checking demo users:', error);
        } finally {
            setCheckingDemoUsers(false);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            toast.success('Welcome back!');
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Failed to sign in');
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async (demoUser) => {
        setEmail(demoUser.email);
        setPassword(demoUser.password);

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: demoUser.email,
                password: demoUser.password,
            });

            if (error) throw error;

            toast.success(`Signed in as ${demoUser.label}`);
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Failed to sign in with demo account');
            setIsLoading(false);
        }
    };

    const createDemoUsers = async () => {
        setIsLoading(true);
        const createdUsers = [];

        try {
            for (const demoUser of DEMO_USERS) {
                try {
                    console.log(`Creating user: ${demoUser.email}`);

                    const { data: authData, error: signUpError } = await supabase.auth.signUp({
                        email: demoUser.email,
                        password: demoUser.password,
                        options: {
                            data: {
                                full_name: demoUser.label,
                                role: demoUser.role
                            },
                            emailRedirectTo: window.location.origin
                        }
                    });

                    console.log(`Auth response for ${demoUser.email}:`, { authData, signUpError });

                    if (signUpError) {
                        if (signUpError.message.includes('already registered')) {
                            console.log(`User ${demoUser.email} already exists`);
                            createdUsers.push(demoUser.email);
                            continue;
                        }
                        throw signUpError;
                    }

                    if (authData?.user) {
                        const { error: profileError } = await supabase
                            .from('user_profiles')
                            .upsert({
                                id: authData.user.id,
                                email: demoUser.email,
                                role: demoUser.role,
                                full_name: demoUser.label
                            }, {
                                onConflict: 'id'
                            });

                        if (profileError) {
                            console.error(`Profile error for ${demoUser.email}:`, profileError);
                        } else {
                            createdUsers.push(demoUser.email);
                            console.log(`Successfully created ${demoUser.email}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error creating ${demoUser.label}:`, error);
                    toast.error(`Failed to create ${demoUser.label}: ${error.message}`);
                }
            }

            if (createdUsers.length > 0) {
                toast.success(`Demo users ready! Created/verified ${createdUsers.length} accounts.`);
                setDemoUsersExist(true);
            } else {
                toast.error('No demo users were created. Please check the console for errors.');
            }
        } catch (error) {
            toast.error('Failed to create demo users');
            console.error('Error creating demo users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center space-y-2 pb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                        effySalesPro
                    </CardTitle>
                    <CardDescription className="text-base">
                        Sales Intelligence Platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-md"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {!checkingDemoUsers && (
                        <>
                            <div className="relative">
                                <Separator className="my-4" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-white px-3 text-sm text-slate-500">
                                        Quick Login (Demo Accounts)
                                    </span>
                                </div>
                            </div>

                            {demoUsersExist ? (
                                <TooltipProvider>
                                    <div className="grid grid-cols-2 gap-3">
                                        {DEMO_USERS.map((demoUser) => {
                                            return (
                                                <Tooltip key={demoUser.email}>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={() => handleQuickLogin(demoUser)}
                                                            disabled={isLoading}
                                                            variant="outline"
                                                            className={`h-auto py-4 ${demoUser.bgColor} ${demoUser.textColor} hover:shadow-lg transition-all duration-200 font-semibold text-base relative group`}
                                                        >
                                                            {demoUser.label}
                                                            <Info className="h-3 w-3 absolute top-2 right-2 opacity-40 group-hover:opacity-70" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="bg-slate-800 text-white p-3">
                                                        <div className="space-y-1 text-xs">
                                                            <div><span className="font-semibold">Email:</span> {demoUser.email}</div>
                                                            <div><span className="font-semibold">Password:</span> {demoUser.password}</div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                </TooltipProvider>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                    <p className="text-sm text-slate-700 font-medium text-center">
                                        First Time Setup?
                                    </p>
                                    <p className="text-xs text-slate-600 text-center">
                                        Demo users don't exist yet. Click below to create them.
                                    </p>
                                    <Button
                                        onClick={createDemoUsers}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-md"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Demo Users...
                                            </>
                                        ) : (
                                            'Create Demo Users'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}