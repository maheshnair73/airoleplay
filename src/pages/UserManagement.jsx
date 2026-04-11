import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Company, CompanyModuleAssignment, UserModuleAssignment, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Building2, Users, Package, Plus, Search, ChevronRight,
  Shield, Check, UserPlus, Settings, ArrowLeft, Crown,
  CheckSquare, Square, Layers
} from 'lucide-react';
import { toast } from 'sonner';

const GROUP_COLORS = {
  Core: 'blue',
  Sales: 'emerald',
  Coaching: 'amber',
  'Call Intelligence': 'cyan',
  Training: 'teal',
  Knowledge: 'sky',
  Gamification: 'orange',
  Analytics: 'indigo',
  AI: 'violet',
  Dialer: 'rose',
};

function ModuleSelector({ modulesByGroup, getStatus, isDisabledForUser, onToggle, disabled, title, description, onToggleAll }) {
  const totalEnabled = Object.values(modulesByGroup).flat().filter(m => getStatus(m.id)).length;
  const totalModules = Object.values(modulesByGroup).flat().length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">{totalEnabled} / {totalModules} enabled</span>
          <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${totalModules > 0 ? (totalEnabled / totalModules) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(modulesByGroup).map(([group, mods]) => {
          const enabledInGroup = mods.filter(m => getStatus(m.id)).length;
          const allEnabled = enabledInGroup === mods.filter(m => !isDisabledForUser?.(m.id)).length && enabledInGroup > 0;
          const color = GROUP_COLORS[group] || 'blue';

          const colorMap = {
            blue: { bg: 'bg-blue-50', border: 'border-blue-100', header: 'bg-blue-100/60', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', chip: 'bg-blue-500 text-white border-blue-500', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-blue-300' },
            emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', header: 'bg-emerald-100/60', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', chip: 'bg-emerald-500 text-white border-emerald-500', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300' },
            amber: { bg: 'bg-amber-50', border: 'border-amber-100', header: 'bg-amber-100/60', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', chip: 'bg-amber-500 text-white border-amber-500', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-amber-300' },
            cyan: { bg: 'bg-cyan-50', border: 'border-cyan-100', header: 'bg-cyan-100/60', badge: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500', chip: 'bg-cyan-500 text-white border-cyan-500', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-cyan-300' },
            teal: { bg: 'bg-teal-50', border: 'border-teal-100', header: 'bg-teal-100/60', badge: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500', chip: 'bg-teal-500 text-white border-teal-500', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-teal-300' },
            sky: { bg: 'bg-sky-50', border: 'border-sky-100', header: 'bg-sky-100/60', badge: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500', chip: 'bg-sky-500 text-white border-sky-500', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-sky-300' },
            orange: { bg: 'bg-orange-50', border: 'border-orange-100', header: 'bg-orange-100/60', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', chip: 'bg-orange-500 text-white border-orange-500', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-orange-300' },
            indigo: { bg: 'bg-slate-50', border: 'border-slate-200', header: 'bg-slate-100/60', badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500', chip: 'bg-slate-600 text-white border-slate-600', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-slate-400' },
            violet: { bg: 'bg-slate-50', border: 'border-slate-200', header: 'bg-slate-100/60', badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500', chip: 'bg-slate-700 text-white border-slate-700', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-slate-400' },
            rose: { bg: 'bg-rose-50', border: 'border-rose-100', header: 'bg-rose-100/60', badge: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500', chip: 'bg-rose-500 text-white border-rose-500', chipOff: 'bg-white text-slate-600 border-slate-200 hover:border-rose-300' },
          };
          const c = colorMap[color] || colorMap.blue;

          return (
            <div key={group} className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden`}>
              <div className={`flex items-center justify-between px-4 py-2.5 ${c.header}`}>
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{group}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${c.badge}`}>
                    {enabledInGroup}/{mods.length}
                  </span>
                </div>
                {!disabled && onToggleAll && (
                  <button
                    onClick={() => onToggleAll(mods, !allEnabled)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                  >
                    {allEnabled ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    {allEnabled ? 'Disable all' : 'Enable all'}
                  </button>
                )}
              </div>

              <div className="p-3 flex flex-wrap gap-2">
                {mods.map(mod => {
                  const enabled = getStatus(mod.id);
                  const lockedOut = isDisabledForUser?.(mod.id);
                  return (
                    <button
                      key={mod.id}
                      disabled={disabled || lockedOut}
                      onClick={() => !disabled && !lockedOut && onToggle(mod, enabled)}
                      title={lockedOut ? 'Not enabled for this company' : undefined}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                        ${lockedOut ? 'opacity-35 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200' :
                          enabled ? `${c.chip} shadow-sm` : `${c.chipOff} cursor-pointer`}
                        ${!disabled && !lockedOut ? 'hover:scale-105 active:scale-95' : ''}
                      `}
                    >
                      {enabled && !lockedOut && <Check className="w-3 h-3 flex-shrink-0" />}
                      {mod.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ALL_MODULES = [
  { id: 'Dashboard', name: 'Dashboard', group: 'Core' },
  { id: 'effyLeads', name: 'effyLeads', group: 'Sales' },
  { id: 'DigitalSalesRooms', name: 'Digital Sales Rooms', group: 'Sales' },
  { id: 'EffyDocProposals', name: 'effyDoc Proposals', group: 'Sales' },
  { id: 'AIRoleplay', name: 'AI Roleplay', group: 'Coaching' },
  { id: 'PracticeHub', name: 'Practice Hub', group: 'Coaching' },
  { id: 'SkillCoach', name: 'SkillCoach AI', group: 'Coaching' },
  { id: 'CoachingHub', name: 'Coaching Tasks', group: 'Coaching' },
  { id: 'PracticeAnalytics', name: 'Practice Analytics', group: 'Coaching' },
  { id: 'LiveMeetings', name: 'Meeting Assistant', group: 'Call Intelligence' },
  { id: 'CallInsights', name: 'Call Recordings', group: 'Call Intelligence' },
  { id: 'TrainingLibrary', name: 'Training Library', group: 'Training' },
  { id: 'CertifyHub', name: 'Certify Hub', group: 'Training' },
  { id: 'TrainingROIAnalytics', name: 'Training ROI Analytics', group: 'Training' },
  { id: 'RoleplayKnowledgeHub', name: 'Practice Materials', group: 'Knowledge' },
  { id: 'ProductManagement', name: 'Products', group: 'Knowledge' },
  { id: 'CompetitorManagement', name: 'Competitor Intel', group: 'Knowledge' },
  { id: 'Leaderboard', name: 'Leaderboard', group: 'Gamification' },
  { id: 'GamificationAdmin', name: 'Gamification Hub', group: 'Gamification' },
  { id: 'KPIDashboard', name: 'KPI Dashboard', group: 'Analytics' },
  { id: 'AIAssistant', name: 'Chat with Effy', group: 'AI' },
  { id: 'VoiceAIDialer', name: 'Voice AI Dialer', group: 'Dialer' },
  { id: 'Dialer', name: 'Manual Dialer', group: 'Dialer' },
];

const ROLES = ['sales_agent', 'sales_manager', 'company_admin'];

export default function UserManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [companyModules, setCompanyModules] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userModules, setUserModules] = useState([]);

  const [view, setView] = useState('companies');
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', role: 'sales_agent', password: '' });
  const [isAddingUser, setIsAddingUser] = useState(false);

  const [showCompanyModules, setShowCompanyModules] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      const role = user?.role || '';
      const superAdmin = ['super_admin', 'admin', 'saas_admin'].includes(role);
      const compAdmin = ['company_admin', 'admin', 'saas_admin', 'super_admin'].includes(role);
      setIsSuperAdmin(superAdmin);
      setIsCompanyAdmin(compAdmin);

      if (superAdmin) {
        const { data: companiesData } = await supabase.from('companies').select('*').order('company_name');
        setCompanies(companiesData || []);
        setView('companies');
      } else if (compAdmin && user.company_id) {
        const { data: co } = await supabase.from('companies').select('*').eq('id', user.company_id).maybeSingle();
        if (co) {
          setSelectedCompany(co);
          await loadCompanyData(co.id);
          setView('company-detail');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompanyData = async (companyId) => {
    const [usersRes, modulesRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('company_id', companyId),
      supabase.from('company_module_assignments').select('*').eq('company_id', companyId),
    ]);
    setCompanyUsers(usersRes.data || []);
    setCompanyModules(modulesRes.data || []);
  };

  const selectCompany = async (company) => {
    setSelectedCompany(company);
    await loadCompanyData(company.id);
    setView('company-detail');
  };

  const loadUserModules = async (userId) => {
    const { data } = await supabase
      .from('user_module_assignments')
      .select('*')
      .eq('user_id', userId);
    setUserModules(data || []);
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    await loadUserModules(user.id);
    setView('user-modules');
  };

  const toggleCompanyModule = async (moduleId, moduleName, currentEnabled) => {
    if (!selectedCompany) return;
    const existing = companyModules.find(m => m.module_id === moduleId);
    try {
      if (existing) {
        await supabase.from('company_module_assignments')
          .update({ is_enabled: !currentEnabled, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        setCompanyModules(prev => prev.map(m => m.module_id === moduleId ? { ...m, is_enabled: !currentEnabled } : m));
      } else {
        const { data } = await supabase.from('company_module_assignments').insert({
          company_id: selectedCompany.id,
          module_id: moduleId,
          module_name: moduleName,
          is_enabled: true,
          created_by: currentUser?.id,
        }).select().single();
        setCompanyModules(prev => [...prev, data]);
      }
      toast.success('Module updated');
    } catch (e) {
      toast.error('Failed to update module');
    }
  };

  const toggleUserModule = async (moduleId, moduleName, currentEnabled) => {
    if (!selectedUser || !selectedCompany) return;
    const companyModule = companyModules.find(m => m.module_id === moduleId && m.is_enabled);
    if (!companyModule) {
      toast.error('This module is not enabled for the company');
      return;
    }
    const existing = userModules.find(m => m.module_id === moduleId);
    try {
      if (existing) {
        await supabase.from('user_module_assignments')
          .update({ is_enabled: !currentEnabled, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        setUserModules(prev => prev.map(m => m.module_id === moduleId ? { ...m, is_enabled: !currentEnabled } : m));
      } else {
        const { data } = await supabase.from('user_module_assignments').insert({
          user_id: selectedUser.id,
          company_id: selectedCompany.id,
          module_id: moduleId,
          module_name: moduleName,
          is_enabled: true,
          assigned_by: currentUser?.id,
        }).select().single();
        setUserModules(prev => [...prev, data]);
      }
      toast.success('Access updated');
    } catch (e) {
      toast.error('Failed to update access');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsAddingUser(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: { full_name: newUser.full_name }
        }
      });
      if (authErr) throw authErr;

      if (authData.user) {
        await supabase.from('user_profiles').upsert({
          id: authData.user.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          company_id: selectedCompany?.id,
        });
        toast.success('User added successfully');
        setShowAddUser(false);
        setNewUser({ full_name: '', email: '', role: 'sales_agent', password: '' });
        if (selectedCompany) await loadCompanyData(selectedCompany.id);
      }
    } catch (e) {
      toast.error(e.message || 'Failed to add user');
    } finally {
      setIsAddingUser(false);
    }
  };

  const getCompanyModuleStatus = (moduleId) => {
    const m = companyModules.find(m => m.module_id === moduleId);
    return m ? m.is_enabled : false;
  };

  const getUserModuleStatus = (moduleId) => {
    const m = userModules.find(m => m.module_id === moduleId);
    if (m !== undefined) return m.is_enabled;
    return getCompanyModuleStatus(moduleId);
  };

  const modulesByGroup = ALL_MODULES.reduce((acc, m) => {
    if (!acc[m.group]) acc[m.group] = [];
    acc[m.group].push(m);
    return acc;
  }, {});

  const filteredCompanies = companies.filter(c =>
    c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredUsers = companyUsers.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isSuperAdmin && !isCompanyAdmin) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600">You don't have permission to access User Management.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'companies' && isSuperAdmin && (
              <Button variant="ghost" size="icon" onClick={() => {
                if (view === 'user-modules') { setView('company-detail'); setSelectedUser(null); }
                else { setView('companies'); setSelectedCompany(null); }
              }}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {view === 'companies' && 'Company Management'}
                {view === 'company-detail' && (selectedCompany?.company_name || 'Company')}
                {view === 'user-modules' && (selectedUser?.full_name || 'User')}
              </h1>
              <p className="text-sm text-slate-500">
                {view === 'companies' && 'Manage companies and their module access'}
                {view === 'company-detail' && 'Manage users and module assignments'}
                {view === 'user-modules' && `Module access for ${selectedUser?.email}`}
              </p>
            </div>
          </div>

          {view === 'companies' && isSuperAdmin && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toast.info('Use the Super Admin panel to add new companies')}>
              <Plus className="w-4 h-4 mr-2" />Add Company
            </Button>
          )}
          {view === 'company-detail' && isCompanyAdmin && (
            <div className="flex gap-2">
              {isSuperAdmin && (
                <Button variant="outline" onClick={() => setShowCompanyModules(true)}>
                  <Package className="w-4 h-4 mr-2" />Company Modules
                </Button>
              )}
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddUser(true)}>
                <UserPlus className="w-4 h-4 mr-2" />Add User
              </Button>
            </div>
          )}
        </div>

        {view === 'companies' && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search companies..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map(company => {
                const enabledModules = companyModules.filter(m => m.company_id === company.id && m.is_enabled).length;
                return (
                  <Card key={company.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => selectCompany(company)}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{company.company_name}</h3>
                            <p className="text-xs text-slate-500">{company.industry || 'No industry set'}</p>
                          </div>
                        </div>
                        <Badge className={
                          company.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                          company.subscription_status === 'trial' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-600'
                        }>
                          {company.subscription_status || 'unknown'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{company.used_license_count || 0} users</span>
                        <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{enabledModules > 0 ? `${enabledModules} modules` : 'No modules set'}</span>
                      </div>
                      <div className="flex items-center justify-end mt-3 text-blue-600 text-xs font-medium">
                        Manage <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredCompanies.length === 0 && (
                <div className="col-span-3 text-center py-12 text-slate-500">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>No companies found</p>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'company-detail' && selectedCompany && (
          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
              <TabsTrigger value="modules"><Package className="w-4 h-4 mr-2" />Module Access</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input placeholder="Search users..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <Card key={user.id} className="hover:shadow-sm transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                              {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">{user.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            user.role === 'company_admin' ? 'bg-amber-100 text-amber-800' :
                            user.role === 'sales_manager' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {user.role === 'company_admin' ? <Crown className="w-3 h-3 mr-1 inline" /> : null}
                            {user.role}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => selectUser(user)}>
                            <Settings className="w-3.5 h-3.5 mr-1" />Modules
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-10 text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p>No users found. Add your first user.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="modules" className="mt-4">
              <ModuleSelector
                modulesByGroup={modulesByGroup}
                getStatus={getCompanyModuleStatus}
                onToggle={(mod, enabled) => {
                  if (!isCompanyAdmin) { toast.error('Only admins can change company modules'); return; }
                  toggleCompanyModule(mod.id, mod.name, enabled);
                }}
                disabled={!isCompanyAdmin}
                title={`Modules for ${selectedCompany.company_name || selectedCompany.name}`}
                description={!isCompanyAdmin ? 'Contact your admin to change module access.' : 'Click modules to enable or disable them for this company.'}
                onToggleAll={async (groupMods, enable) => {
                  if (!isCompanyAdmin) { toast.error('Only admins can change company modules'); return; }
                  for (const mod of groupMods) {
                    const cur = getCompanyModuleStatus(mod.id);
                    if (cur !== enable) await toggleCompanyModule(mod.id, mod.name, cur);
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        )}

        {view === 'user-modules' && selectedUser && (
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                      {(selectedUser.full_name || selectedUser.email || '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedUser.full_name}</p>
                    <p className="text-sm text-slate-500">{selectedUser.email} &middot; <span className="capitalize">{selectedUser.role}</span></p>
                  </div>
                  <Badge className="ml-auto bg-blue-100 text-blue-800">
                    {userModules.filter(m => m.is_enabled).length} modules active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <ModuleSelector
              modulesByGroup={modulesByGroup}
              getStatus={(modId) => {
                const companyEnabled = getCompanyModuleStatus(modId);
                return companyEnabled ? getUserModuleStatus(modId) : false;
              }}
              isDisabledForUser={(modId) => !getCompanyModuleStatus(modId)}
              onToggle={(mod, enabled) => toggleUserModule(mod.id, mod.name, enabled)}
              disabled={false}
              title="Module Access"
              description="Dimmed modules are not enabled for this company. Enable them in the Module Access tab first."
              onToggleAll={async (groupMods, enable) => {
                for (const mod of groupMods) {
                  if (!getCompanyModuleStatus(mod.id)) continue;
                  const cur = getUserModuleStatus(mod.id);
                  if (cur !== enable) await toggleUserModule(mod.id, mod.name, cur);
                }
              }}
            />
          </div>
        )}
      </div>

      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name *</Label>
              <Input
                placeholder="Jane Smith"
                value={newUser.full_name}
                onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="jane@company.com"
                value={newUser.email}
                onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                placeholder="Temporary password"
                value={newUser.password}
                onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={isAddingUser} className="bg-blue-600 hover:bg-blue-700">
              {isAddingUser ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
