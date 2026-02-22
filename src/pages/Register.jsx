import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // For now, just simulate registration and redirect to dashboard
            // In a real app, this would create the user account
            
            if (!formData.fullName || !formData.email) {
                toast.error("Please fill in all required fields");
                setIsLoading(false);
                return;
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Account created successfully! Welcome to effySales Pro!");
            
            // Redirect to dashboard
            window.location.href = createPageUrl('Dashboard');
            
        } catch (error) {
            console.error("Registration failed:", error);
            toast.error("Registration failed. Please try again.");
            setIsLoading(false);
        }
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
                            <h3 className="font-semibold text-violet-300 mb-2">Quick Test Access</h3>
                            <div className="text-sm text-slate-400 space-y-1">
                                <p><strong>Name:</strong> user123</p>
                                <p><strong>Email:</strong> user123@test.com</p>
                                <p><strong>Password:</strong> password</p>
                            </div>
                        </div>
                        <div className="text-sm text-slate-400">
                            <p>✅ Instant access to all features</p>
                            <p>✅ No email verification required</p>
                            <p>✅ Start exploring immediately</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-8">
                <div className="max-w-sm w-full space-y-6">
                    <div className="text-center">
                        <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <BrainCircuit className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800">effySales Pro</h1>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Create your account</h2>
                        <p className="mt-2 text-slate-600">Get started in seconds</p>
                    </div>
                    
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email Address *</Label>
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
                                placeholder="Choose a password (optional)"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <Button 
                            type="submit"
                            disabled={isLoading} 
                            className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account & Start Free Trial"
                            )}
                        </Button>
                    </form>

                    <p className="text-sm text-slate-500 text-center">
                        Already have an account?{' '}
                        <Link to={createPageUrl('Welcome')} className="font-medium text-blue-600 hover:underline">
                            Sign In
                        </Link>
                    </p>

                    <p className="text-xs text-slate-500 text-center pt-4">
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}