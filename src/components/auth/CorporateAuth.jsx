import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Building2, Loader2, ShieldCheck, Users, UserCircle, Eye, EyeOff, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const DEMO_ACCOUNTS = [
  {
    email: 'saas@effysalespro.com',
    password: 'demo123',
    label: 'SaaS Admin',
    sublabel: 'Platform owner',
    color: 'from-slate-800 to-slate-900',
    ring: 'ring-slate-600',
    icon: Globe,
    badge: 'bg-slate-700 text-slate-200',
  },
  {
    email: 'admin@effysalespro.com',
    password: 'demo123',
    label: 'Company Admin',
    sublabel: 'Acme Corp',
    color: 'from-blue-600 to-blue-800',
    ring: 'ring-blue-400',
    icon: ShieldCheck,
    badge: 'bg-blue-700 text-blue-100',
  },
  {
    email: 'manager@effysalespro.com',
    password: 'demo123',
    label: 'Manager',
    sublabel: 'Sales Manager',
    color: 'from-sky-500 to-sky-700',
    ring: 'ring-sky-400',
    icon: Users,
    badge: 'bg-sky-600 text-sky-100',
  },
  {
    email: 'agent1@effysalespro.com',
    password: 'demo123',
    label: 'Sales Agent',
    sublabel: 'Individual Rep',
    color: 'from-emerald-500 to-emerald-700',
    ring: 'ring-emerald-400',
    icon: UserCircle,
    badge: 'bg-emerald-600 text-emerald-100',
  },
];

export default function CorporateAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(null);
  const [showDemo, setShowDemo] = useState(false);

  const signIn = async (emailVal, passwordVal, demoLabel = null) => {
    if (demoLabel) setLoadingDemo(demoLabel);
    else setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailVal,
        password: passwordVal,
      });
      if (error) throw error;

      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      toast.success('Welcome back!');
    } catch (err) {
      const msg = err.message?.includes('Invalid login credentials')
        ? 'Incorrect email or password'
        : err.message || 'Sign in failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setLoadingDemo(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password'); return; }
    signIn(email, password);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-cyan-500 blur-3xl" />
        </div>
        <div className="relative z-10 text-white max-w-md">
          <div className="w-16 h-16 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white border-opacity-20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">effySales Pro</h1>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            AI-powered sales intelligence platform for modern revenue teams.
          </p>
          <div className="space-y-4">
            {[
              'AI Roleplay & coaching sessions',
              'Real-time call intelligence',
              'Team performance analytics',
              'Gamified sales training',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 bg-opacity-30 border border-blue-400 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">effySales Pro</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-slate-500 mt-1 text-sm">Enter your credentials to access the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-slate-300 focus:border-blue-500"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10 border-slate-300 focus:border-blue-500"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="flex items-center gap-1.5 bg-white px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Demo accounts
                {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showDemo && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 text-center">Click any role to sign in instantly</p>
              <div className="grid grid-cols-2 gap-2.5">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  const isThisLoading = loadingDemo === account.label;
                  return (
                    <button
                      key={account.email}
                      onClick={() => signIn(account.email, account.password, account.label)}
                      disabled={!!loadingDemo || isLoading}
                      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${account.color} p-4 text-left text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-white bg-opacity-15 flex items-center justify-center">
                          {isThisLoading
                            ? <Loader2 className="w-4 h-4 animate-spin text-white" />
                            : <Icon className="w-4 h-4 text-white" />
                          }
                        </div>
                      </div>
                      <p className="font-bold text-sm leading-tight">{account.label}</p>
                      <p className="text-xs opacity-75 mt-0.5">{account.sublabel}</p>
                      <p className="text-xs opacity-50 mt-1 truncate">{account.email}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 text-center">All demo accounts use password: <code className="bg-slate-100 px-1 rounded">demo123</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
