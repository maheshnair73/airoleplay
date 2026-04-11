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
  Edit, Trash2, Mail, Shield, Check, X, ToggleLeft, ToggleRight,
  UserPlus, Settings, ArrowLeft, Eye, Crown
} from 'lucide-react';
import { toast } from 'sonner';

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
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Modules enabled for {selectedCompany.company_name}</CardTitle>
                  <CardDescription>Toggle which modules this company has access to. {!isSuperAdmin && 'Contact your super admin to change this.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(modulesByGroup).map(([group, mods]) => (
                    <div key={group}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{group}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {mods.map(mod => {
                          const enabled = getCompanyModuleStatus(mod.id);
                          return (
                            <div key={mod.id} className={`flex items-center justify-between p-3 rounded-lg border ${enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-slate-300'}`} />
                                <span className={`text-sm ${enabled ? 'text-slate-900' : 'text-slate-400'}`}>{mod.name}</span>
                              </div>
                              <Switch
                                checked={enabled}
                                onCheckedChange={() => {
                                  if (!isSuperAdmin) { toast.error('Only super admins can change company modules'); return; }
                                  toggleCompanyModule(mod.id, mod.name, enabled);
                                }}
                                disabled={!isSuperAdmin}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Module Access</CardTitle>
                <CardDescription>Modules greyed out are not enabled for this company. Enable them in Company Modules first.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(modulesByGroup).map(([group, mods]) => (
                  <div key={group}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{group}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {mods.map(mod => {
                        const companyEnabled = getCompanyModuleStatus(mod.id);
                        const userEnabled = getUserModuleStatus(mod.id);
                        return (
                          <div key={mod.id} className={`flex items-center justify-between p-3 rounded-lg border ${!companyEnabled ? 'opacity-40 bg-slate-50 border-slate-100' : userEnabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${companyEnabled && userEnabled ? 'bg-green-500' : 'bg-slate-300'}`} />
                              <span className={`text-sm ${companyEnabled && userEnabled ? 'text-slate-900' : 'text-slate-400'}`}>{mod.name}</span>
                              {!companyEnabled && <span className="text-xs text-slate-400 ml-1">(company disabled)</span>}
                            </div>
                            <Switch
                              checked={companyEnabled && userEnabled}
                              onCheckedChange={() => toggleUserModule(mod.id, mod.name, companyEnabled && userEnabled)}
                              disabled={!companyEnabled}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
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
