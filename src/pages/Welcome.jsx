import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrainCircuit, Zap, BarChart3, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Welcome() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // For now, just simulate login and redirect to dashboard
            if (!formData.email) {
                toast.error("Please enter your email");
                setIsLoading(false);
                return;
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Welcome back to effySales Pro!");
            
            // Redirect to dashboard
            window.location.href = createPageUrl('Dashboard');
            
        } catch (error) {
            console.error("Login failed:", error);
            toast.error("Login failed. Please try again.");
            setIsLoading(false);
        }
    };

    const quickLogin = async () => {
        setIsLoading(true);
        // Quick demo login
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success("Logged in as demo user!");
        window.location.href = createPageUrl('Dashboard');
    };

    return (
        <div className="flex w-full h-screen font-sans">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center">
                            <BrainCircuit className="h-9 w-9 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">effySales Pro</h1>
                            <p className="text-slate-300 text-lg">Your AI-Powered Sales Co-Pilot</p>
                        </div>
                    </div>
                    <div className="space-y-6 pt-6 border-t border-slate-700">
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <h3 className="font-semibold text-violet-300 mb-2">Quick Demo Access</h3>
                            <Button 
                                onClick={quickLogin}
                                disabled={isLoading}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    "Demo Login (No Signup)"
                                )}
                            </Button>
                        </div>
                        
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Instant Access</h3>
                                <p className="text-slate-400 text-sm">Jump right into the platform and explore all features</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-8">
                <div className="max-w-sm w-full space-y-6">
                    <div className="text-center">
                        <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <BrainCircuit className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800">effySales Pro</h1>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                        <p className="mt-2 text-slate-600">Sign in to access your dashboard</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <Button 
                            type="submit"
                            disabled={isLoading} 
                            className="w-full text-lg py-6 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <Button 
                            onClick={quickLogin}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full mb-4"
                        >
                            Quick Demo Access
                        </Button>
                    </div>

                    <p className="text-sm text-slate-500 text-center">
                        Don't have an account?{' '}
                        <Link to={createPageUrl('Register')} className="font-medium text-blue-600 hover:underline">
                            Sign Up Free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}