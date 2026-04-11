import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Building2, Users, Package, Plus, Search, ChevronRight,
  Shield, UserPlus, Settings, ArrowLeft, Crown, Layers
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

const ROLE_LABELS = {
  sales_agent: 'Sales Agent',
  sales_manager: 'Sales Manager',
  company_admin: 'Company Admin',
};

const modulesByGroup = ALL_MODULES.reduce((acc, m) => {
  if (!acc[m.group]) acc[m.group] = [];
  acc[m.group].push(m);
  return acc;
}, {});

function ModuleTable({ groups, getStatus, onToggle, lockedModules = new Set() }) {
  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([group, mods]) => (
        <div key={group}>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">{group}</h3>
          <div className="space-y-2">
            {mods.map(mod => {
              const enabled = getStatus(mod.id);
              const locked = lockedModules.has(mod.id);
              return (
                <div
                  key={mod.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    locked ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-sm font-medium ${locked ? 'text-slate-400' : 'text-slate-700'}`}>
                    {mod.name}
                  </span>
                  <Switch
                    checked={enabled && !locked}
                    disabled={locked}
                    onCheckedChange={() => !locked && onToggle(mod, enabled)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoleDefaultsTab({ companyId, currentUserId, isCompanyAdmin }) {
  const [activeRole, setActiveRole] = useState('sales_agent');
  const [roleDefaults, setRoleDefaults] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const query = supabase
      .from('role_module_defaults')
      .select('*')
      .eq('role', activeRole);

    if (companyId) query.eq('company_id', companyId);
    else query.is('company_id', null);

    const { data } = await query;
    setRoleDefaults(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeRole, companyId]);

  const getStatus = (moduleId) => {
    const r = roleDefaults.find(d => d.module_id === moduleId);
    return r ? r.is_enabled : false;
  };

  const toggle = async (mod, currentEnabled) => {
    const existing = roleDefaults.find(d => d.module_id === mod.id);
    try {
      if (existing) {
        await supabase
          .from('role_module_defaults')
          .update({ is_enabled: !currentEnabled, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        setRoleDefaults(prev => prev.map(d => d.module_id === mod.id ? { ...d, is_enabled: !currentEnabled } : d));
      } else {
        const payload = {
          role: activeRole,
          module_id: mod.id,
          module_name: mod.name,
          is_enabled: true,
          created_by: currentUserId,
        };
        if (companyId) payload.company_id = companyId;

        const { data } = await supabase
          .from('role_module_defaults')
          .insert(payload)
          .select()
          .single();
        setRoleDefaults(prev => [...prev, data]);
      }
      toast.success('Role default updated');
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const toggleGroup = async (mods, enable) => {
    for (const mod of mods) {
      const cur = getStatus(mod.id);
      if (cur !== enable) await toggle(mod, cur);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        {ROLES.map(role => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeRole === role
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        Modules enabled here will be automatically assigned when a <strong>{ROLE_LABELS[activeRole]}</strong> is added.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : (
        <ModuleTable
          groups={modulesByGroup}
          getStatus={getStatus}
          onToggle={toggle}
          showGroupToggle={isCompanyAdmin}
          onToggleGroup={toggleGroup}
        />
      )}
    </div>
  );
}

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

  useEffect(() => { init(); }, []);

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
        const { data } = await supabase.from('companies').select('*').order('company_name');
        setCompanies(data || []);
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
    const { data } = await supabase.from('user_module_assignments').select('*').eq('user_id', userId);
    setUserModules(data || []);
  };

  const selectUser = async (user) => {
    setSelectedUser(user);
    await loadUserModules(user.id);
    setView('user-modules');
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

  const toggleCompanyModule = async (mod, currentEnabled) => {
    if (!selectedCompany || !isCompanyAdmin) return;
    const existing = companyModules.find(m => m.module_id === mod.id);
    try {
      if (existing) {
        await supabase.from('company_module_assignments')
          .update({ is_enabled: !currentEnabled, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        setCompanyModules(prev => prev.map(m => m.module_id === mod.id ? { ...m, is_enabled: !currentEnabled } : m));
      } else {
        const { data } = await supabase.from('company_module_assignments').insert({
          company_id: selectedCompany.id,
          module_id: mod.id,
          module_name: mod.name,
          is_enabled: true,
          created_by: currentUser?.id,
        }).select().single();
        setCompanyModules(prev => [...prev, data]);
      }
      toast.success('Module updated');
    } catch {
      toast.error('Failed to update module');
    }
  };

  const toggleUserModule = async (mod, currentEnabled) => {
    if (!selectedUser || !selectedCompany) return;
    if (!getCompanyModuleStatus(mod.id)) { toast.error('Not enabled for this company'); return; }
    const existing = userModules.find(m => m.module_id === mod.id);
    try {
      if (existing) {
        await supabase.from('user_module_assignments')
          .update({ is_enabled: !currentEnabled, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        setUserModules(prev => prev.map(m => m.module_id === mod.id ? { ...m, is_enabled: !currentEnabled } : m));
      } else {
        const { data } = await supabase.from('user_module_assignments').insert({
          user_id: selectedUser.id,
          company_id: selectedCompany.id,
          module_id: mod.id,
          module_name: mod.name,
          is_enabled: true,
          assigned_by: currentUser?.id,
        }).select().single();
        setUserModules(prev => [...prev, data]);
      }
      toast.success('Access updated');
    } catch {
      toast.error('Failed to update access');
    }
  };

  const toggleGroupCompany = async (mods, enable) => {
    for (const mod of mods) {
      const cur = getCompanyModuleStatus(mod.id);
      if (cur !== enable) await toggleCompanyModule(mod, cur);
    }
  };

  const toggleGroupUser = async (mods, enable) => {
    for (const mod of mods) {
      if (!getCompanyModuleStatus(mod.id)) continue;
      const cur = getUserModuleStatus(mod.id);
      if (cur !== enable) await toggleUserModule(mod, cur);
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
        options: { data: { full_name: newUser.full_name } }
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

        const { data: defaults } = await supabase
          .from('role_module_defaults')
          .select('*')
          .eq('role', newUser.role)
          .eq('is_enabled', true);

        if (defaults?.length) {
          const inserts = defaults.map(d => ({
            user_id: authData.user.id,
            company_id: selectedCompany?.id,
            module_id: d.module_id,
            module_name: d.module_name,
            is_enabled: true,
            assigned_by: currentUser?.id,
          }));
          await supabase.from('user_module_assignments').upsert(inserts, { onConflict: 'user_id,module_id' });
        }

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
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
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(view !== 'companies' || !isSuperAdmin) && view !== 'companies' && (
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
                {view === 'companies' && 'Select a company to manage users and modules'}
                {view === 'company-detail' && 'Manage users, module access and role defaults'}
                {view === 'user-modules' && selectedUser?.email}
              </p>
            </div>
          </div>

          {view === 'company-detail' && isCompanyAdmin && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddUser(true)}>
              <UserPlus className="w-4 h-4 mr-2" />Add User
            </Button>
          )}
        </div>

        {view === 'companies' && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Search companies..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map(company => (
                <Card key={company.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => selectCompany(company)}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{company.company_name}</h3>
                        <p className="text-xs text-slate-500">{company.industry || 'No industry set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{company.used_license_count || 0} users</span>
                      <span className="flex items-center gap-1 text-blue-600 font-medium">Manage <ChevronRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              <TabsTrigger value="role-defaults"><Shield className="w-4 h-4 mr-2" />Role Defaults</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Search users..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                            {user.role === 'company_admin' && <Crown className="w-3 h-3 mr-1 inline" />}
                            {ROLE_LABELS[user.role] || user.role}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => selectUser(user)}>
                            <Settings className="w-3.5 h-3.5 mr-1.5" />Modules
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-10 text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p>No users found.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="modules" className="mt-4">
              <p className="text-sm text-slate-500 mb-4">
                {isCompanyAdmin
                  ? 'Enable or disable modules for this company. Users can only access enabled company modules.'
                  : 'These are the modules enabled for this company.'}
              </p>
              <ModuleTable
                groups={modulesByGroup}
                getStatus={getCompanyModuleStatus}
                onToggle={isCompanyAdmin ? toggleCompanyModule : () => {}}
                showGroupToggle={isCompanyAdmin}
                onToggleGroup={isCompanyAdmin ? toggleGroupCompany : undefined}
              />
            </TabsContent>

            <TabsContent value="role-defaults" className="mt-4">
              <RoleDefaultsTab
                companyId={selectedCompany.id}
                currentUserId={currentUser?.id}
                isCompanyAdmin={isCompanyAdmin}
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
                    <p className="text-sm text-slate-500">
                      {selectedUser.email} &middot; {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                    </p>
                  </div>
                  <Badge className="ml-auto bg-blue-100 text-blue-800">
                    {ALL_MODULES.filter(m => getCompanyModuleStatus(m.id) && getUserModuleStatus(m.id)).length} modules active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-slate-500">
              Greyed-out modules are not enabled for this company. Enable them in the Module Access tab first.
            </p>

            <ModuleTable
              groups={modulesByGroup}
              getStatus={(modId) => getCompanyModuleStatus(modId) ? getUserModuleStatus(modId) : false}
              onToggle={toggleUserModule}
              lockedModules={new Set(ALL_MODULES.filter(m => !getCompanyModuleStatus(m.id)).map(m => m.id))}
              showGroupToggle={true}
              onToggleGroup={toggleGroupUser}
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
              <Input placeholder="Jane Smith" value={newUser.full_name} onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" placeholder="jane@company.com" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Password *</Label>
              <Input type="password" placeholder="Temporary password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-slate-500">
              Role defaults will be automatically applied to this user's module access.
            </p>
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
