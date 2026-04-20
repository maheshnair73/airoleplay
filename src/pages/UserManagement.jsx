import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Building2, Users, Package, Plus, Search, ChevronRight,
  Shield, UserPlus, Settings, ArrowLeft, Crown, Layers,
  Clock, Activity, Upload, Download, MoreVertical, Eye,
  EyeOff, CheckCircle, XCircle, AlertCircle, Filter,
  Mail, Phone, Briefcase, Key, Globe, BarChart2
} from 'lucide-react';

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
  saas_admin: 'SaaS Admin',
  super_admin: 'Super Admin',
};
const ROLE_COLORS = {
  sales_agent: 'bg-slate-100 text-slate-700',
  sales_manager: 'bg-sky-100 text-sky-800',
  company_admin: 'bg-blue-100 text-blue-800',
  saas_admin: 'bg-slate-800 text-white',
  super_admin: 'bg-slate-800 text-white',
};

const modulesByGroup = ALL_MODULES.reduce((acc, m) => {
  if (!acc[m.group]) acc[m.group] = [];
  acc[m.group].push(m);
  return acc;
}, {});

function formatDate(dt) {
  if (!dt) return 'Never';
  const d = new Date(dt);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

function formatTokens(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function TokenBar({ used, cap, label }) {
  if (!cap) return <span className="text-sm text-slate-500">{formatTokens(used)} used</span>;
  const pct = Math.min(100, Math.round((used / cap) * 100));
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-blue-500';
  return (
    <div className="space-y-1 w-full">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label || 'Tokens'}</span>
        <span>{formatTokens(used)} / {formatTokens(cap)} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ModuleTable({ groups, getStatus, onToggle, lockedModules = new Set() }) {
  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([group, mods]) => (
        <div key={group}>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{group}</h4>
          <div className="space-y-1.5">
            {mods.map(mod => {
              const enabled = getStatus(mod.id);
              const locked = lockedModules.has(mod.id);
              return (
                <div key={mod.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${locked ? 'bg-slate-50 opacity-50' : 'bg-white border border-slate-200'}`}>
                  <span className="text-sm text-slate-700">{mod.name}</span>
                  <Switch checked={!locked && enabled} disabled={locked} onCheckedChange={() => !locked && onToggle(mod, enabled)} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function UserRow({ user, companyModules, onToggleActive, onEditModules, onChangeRole }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${user.is_active === false ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'}`}>
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarFallback className={`text-sm font-bold ${user.is_active === false ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>
          {(user.full_name || user.email || '?')[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-900 text-sm">{user.full_name || 'Unnamed User'}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600'}`}>
            {ROLE_LABELS[user.role] || user.role}
          </span>
          {user.is_active === false && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Inactive</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
        <div className="flex items-center gap-4 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {formatDate(user.last_login_at)}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <BarChart2 className="w-3 h-3" />
            {formatTokens(user.token_usage || 0)} tokens
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 relative" ref={ref}>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onEditModules(user)}>
          <Package className="w-3.5 h-3.5 mr-1" />Modules
        </Button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => { onChangeRole(user, r); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                {user.role === r && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                {user.role !== r && <div className="w-3.5 h-3.5" />}
                {ROLE_LABELS[r]}
              </button>
            ))}
            <div className="border-t border-slate-100 my-1" />
            <button
              onClick={() => { onToggleActive(user); setMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${user.is_active === false ? 'text-emerald-700 hover:bg-emerald-50' : 'text-red-700 hover:bg-red-50'}`}
            >
              {user.is_active === false ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {user.is_active === false ? 'Activate User' : 'Deactivate User'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BulkImportModal({ open, onClose, companyId, currentUserId, onImported }) {
  const [csv, setCsv] = useState('');
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const fileRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      return obj;
    }).filter(r => r.email);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsv(text);
      setPreview(parseCSV(text).slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const rows = parseCSV(csv);
    if (!rows.length) { toast.error('No valid rows found'); return; }
    setImporting(true);
    const res = { success: 0, failed: [], skipped: 0 };

    for (const row of rows) {
      if (!row.email) { res.skipped++; continue; }
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: row.email,
          password: row.password || 'Welcome@123',
          options: { data: { full_name: row.full_name || row.name || '' } }
        });
        if (authErr) throw authErr;
        if (authData.user) {
          await supabase.from('user_profiles').upsert({
            id: authData.user.id,
            email: row.email,
            full_name: row.full_name || row.name || '',
            role: row.role || 'sales_agent',
            company_id: companyId,
            department: row.department || null,
            phone: row.phone || null,
            is_active: true,
          });
          res.success++;
        }
      } catch (e) {
        res.failed.push({ email: row.email, error: e.message });
      }
    }
    setResults(res);
    setImporting(false);
    if (res.success > 0) { onImported(); toast.success(`${res.success} users imported`); }
  };

  const downloadTemplate = () => {
    const template = 'full_name,email,password,role,department,phone\nJane Smith,jane@acme.com,TempPass123,sales_agent,Sales,+1234567890\nJohn Doe,john@acme.com,TempPass123,sales_manager,Revenue,';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'user_import_template.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  const reset = () => { setCsv(''); setPreview([]); setResults(null); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Bulk User Import
          </DialogTitle>
        </DialogHeader>

        {results ? (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{results.success}</p>
                <p className="text-xs text-emerald-600 mt-1">Imported</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{results.failed.length}</p>
                <p className="text-xs text-red-600 mt-1">Failed</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-700">{results.skipped}</p>
                <p className="text-xs text-slate-600 mt-1">Skipped</p>
              </div>
            </div>
            {results.failed.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 space-y-1 max-h-32 overflow-y-auto">
                {results.failed.map((f, i) => (
                  <p key={i} className="text-xs text-red-700"><strong>{f.email}:</strong> {f.error}</p>
                ))}
              </div>
            )}
            <Button className="w-full" onClick={() => { reset(); onClose(); }}>Done</Button>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-900">CSV Format</p>
              <p className="text-xs text-blue-700">Columns: <code className="bg-blue-100 px-1 rounded">full_name, email, password, role, department, phone</code></p>
              <p className="text-xs text-blue-600">Roles: sales_agent, sales_manager, company_admin</p>
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 h-7 text-xs" onClick={downloadTemplate}>
                <Download className="w-3.5 h-3.5 mr-1" />Download Template
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">Upload CSV File</Label>
              <div
                className="mt-2 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400 mt-1">.csv files only</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              </div>
            </div>

            {preview.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Preview (first {preview.length} rows)</p>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="text-xs w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {Object.keys(preview[0]).map(k => (
                          <th key={k} className="px-3 py-2 text-left text-slate-500 font-medium">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          {Object.values(row).map((v, j) => (
                            <td key={j} className="px-3 py-2 text-slate-700">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                onClick={handleImport}
                disabled={!csv || importing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {importing ? 'Importing...' : `Import ${parseCSV(csv).length} Users`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
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
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showAddUser, setShowAddUser] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', role: 'sales_agent', password: '', department: '', phone: '' });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      const role = user?.role || '';
      const superAdmin = ['super_admin', 'saas_admin'].includes(role);
      const compAdmin = ['company_admin', 'super_admin', 'saas_admin'].includes(role);
      setIsSuperAdmin(superAdmin);
      setIsCompanyAdmin(compAdmin);

      if (superAdmin) {
        const { data } = await supabase.from('companies').select('*').order('company_name');
        setCompanies(data || []);
        setView('companies');
      } else if (compAdmin && user.company_id) {
        const { data: co } = await supabase.from('companies').select('*').eq('id', user.company_id).maybeSingle();
        if (co) { setSelectedCompany(co); await loadCompanyData(co.id); setView('company-detail'); }
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const loadCompanyData = async (companyId) => {
    const [usersRes, modulesRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('company_id', companyId).order('full_name'),
      supabase.from('company_module_assignments').select('*').eq('company_id', companyId),
    ]);
    setCompanyUsers(usersRes.data || []);
    setCompanyModules(modulesRes.data || []);
  };

  const selectCompany = async (company) => {
    setSelectedCompany(company);
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    await loadCompanyData(company.id);
    setView('company-detail');
    setActiveTab('users');
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
        await supabase.from('company_module_assignments').update({ is_enabled: !currentEnabled }).eq('id', existing.id);
        setCompanyModules(prev => prev.map(m => m.module_id === mod.id ? { ...m, is_enabled: !currentEnabled } : m));
      } else {
        const { data } = await supabase.from('company_module_assignments').insert({
          company_id: selectedCompany.id, module_id: mod.id, module_name: mod.name, is_enabled: true, created_by: currentUser?.id,
        }).select().single();
        setCompanyModules(prev => [...prev, data]);
      }
      toast.success('Module updated');
    } catch { toast.error('Failed to update module'); }
  };

  const toggleUserModule = async (mod, currentEnabled) => {
    if (!selectedUser || !selectedCompany) return;
    if (!getCompanyModuleStatus(mod.id)) { toast.error('Module not enabled for this company'); return; }
    const existing = userModules.find(m => m.module_id === mod.id);
    try {
      if (existing) {
        await supabase.from('user_module_assignments').update({ is_enabled: !currentEnabled }).eq('id', existing.id);
        setUserModules(prev => prev.map(m => m.module_id === mod.id ? { ...m, is_enabled: !currentEnabled } : m));
      } else {
        const { data } = await supabase.from('user_module_assignments').insert({
          user_id: selectedUser.id, company_id: selectedCompany.id, module_id: mod.id, module_name: mod.name, is_enabled: true, assigned_by: currentUser?.id,
        }).select().single();
        setUserModules(prev => [...prev, data]);
      }
      toast.success('Access updated');
    } catch { toast.error('Failed to update access'); }
  };

  const toggleUserActive = async (user) => {
    const newStatus = !(user.is_active !== false);
    try {
      await supabase.from('user_profiles').update({ is_active: newStatus }).eq('id', user.id);
      setCompanyUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
      if (selectedUser?.id === user.id) setSelectedUser(prev => ({ ...prev, is_active: newStatus }));
      toast.success(newStatus ? 'User activated' : 'User deactivated');
    } catch { toast.error('Failed to update user status'); }
  };

  const changeUserRole = async (user, newRole) => {
    try {
      await supabase.from('user_profiles').update({ role: newRole }).eq('id', user.id);
      setCompanyUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${ROLE_LABELS[newRole]}`);
    } catch { toast.error('Failed to update role'); }
  };

  const handleAddUser = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.password) { toast.error('Name, email and password are required'); return; }
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
          department: newUser.department || null,
          phone: newUser.phone || null,
          is_active: true,
        });

        const { data: defaults } = await supabase.from('role_module_defaults').select('*').eq('role', newUser.role).eq('is_enabled', true);
        if (defaults?.length) {
          await supabase.from('user_module_assignments').upsert(
            defaults.map(d => ({ user_id: authData.user.id, company_id: selectedCompany?.id, module_id: d.module_id, module_name: d.module_name, is_enabled: true, assigned_by: currentUser?.id })),
            { onConflict: 'user_id,module_id' }
          );
        }
        toast.success('User created successfully');
        setShowAddUser(false);
        setNewUser({ full_name: '', email: '', role: 'sales_agent', password: '', department: '', phone: '' });
        if (selectedCompany) await loadCompanyData(selectedCompany.id);
      }
    } catch (e) { toast.error(e.message || 'Failed to create user'); }
    finally { setIsAddingUser(false); }
  };

  const filteredUsers = companyUsers.filter(u => {
    const matchSearch = !searchTerm || u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? u.is_active !== false : u.is_active === false);
    return matchSearch && matchRole && matchStatus;
  });

  const stats = selectedCompany ? {
    total: companyUsers.length,
    active: companyUsers.filter(u => u.is_active !== false).length,
    inactive: companyUsers.filter(u => u.is_active === false).length,
  } : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isSuperAdmin && !isCompanyAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-600 font-medium">Access Restricted</p>
        <p className="text-sm text-slate-400 mt-1">You need Company Admin or higher permissions</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        <div className="flex items-center gap-3">
          {view !== 'companies' && (
            <button onClick={() => {
              if (view === 'user-modules') { setView('company-detail'); setSelectedUser(null); }
              else { setView('companies'); setSelectedCompany(null); }
            }} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white border border-slate-200 transition-all">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {view === 'companies' && 'Company Management'}
              {view === 'company-detail' && selectedCompany?.company_name}
              {view === 'user-modules' && (selectedUser?.full_name || 'User Modules')}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {view === 'companies' && `${companies.length} companies`}
              {view === 'company-detail' && `${stats?.active || 0} active · ${stats?.inactive || 0} inactive users`}
              {view === 'user-modules' && selectedUser?.email}
            </p>
          </div>

          {view === 'company-detail' && isCompanyAdmin && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowBulkImport(true)}>
                <Upload className="w-4 h-4 mr-1.5" />Bulk Import
              </Button>
              <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddUser(true)}>
                <UserPlus className="w-4 h-4 mr-1.5" />Add User
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
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.filter(c => !searchTerm || c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())).map(company => {
                const tokenPct = company.token_limit_per_month
                  ? Math.round(((company.token_used_this_month || 0) / company.token_limit_per_month) * 100)
                  : 0;
                const licensePct = company.license_count
                  ? Math.round(((company.used_license_count || 0) / company.license_count) * 100)
                  : 0;
                return (
                  <div
                    key={company.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all"
                    onClick={() => selectCompany(company)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{company.company_name}</p>
                          <p className="text-xs text-slate-500">{company.industry || 'No industry'}</p>
                        </div>
                      </div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        company.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        company.subscription_status === 'trial' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {company.subscription_status || 'unknown'}
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />Users</span>
                          <span>{company.used_license_count || 0} / {company.license_count || 0}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${licensePct > 90 ? 'bg-red-500' : licensePct > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${licensePct}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" />Token Usage</span>
                          <span>{formatTokens(company.token_used_this_month || 0)} / {formatTokens(company.token_limit_per_month || 0)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${tokenPct > 90 ? 'bg-red-500' : tokenPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${tokenPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400 capitalize">{company.subscription_plan || 'starter'} plan</span>
                      <span className="text-xs text-blue-600 font-medium flex items-center gap-1">Manage <ChevronRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                );
              })}
              {companies.length === 0 && (
                <div className="col-span-3 text-center py-16 text-slate-500">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>No companies yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'company-detail' && selectedCompany && (
          <>
            {stats && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Total Users</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{stats.active}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Active</p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                  <p className="text-2xl font-bold text-red-700">{stats.inactive}</p>
                  <p className="text-xs text-red-600 mt-0.5">Inactive</p>
                </div>
              </div>
            )}

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              {[
                { id: 'users', label: 'Users', icon: Users },
                { id: 'modules', label: 'Module Access', icon: Package },
                { id: 'role-defaults', label: 'Role Defaults', icon: Shield },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input placeholder="Search users..." className="pl-9 bg-white h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-40 h-9 bg-white"><SelectValue placeholder="All roles" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 h-9 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      companyModules={companyModules}
                      onToggleActive={toggleUserActive}
                      onEditModules={selectUser}
                      onChangeRole={changeUserRole}
                    />
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                      <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>No users match your filters</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500 mb-5">
                  Enable or disable modules for this company. Only enabled modules are available to users.
                </p>
                <ModuleTable
                  groups={modulesByGroup}
                  getStatus={getCompanyModuleStatus}
                  onToggle={isCompanyAdmin ? toggleCompanyModule : () => {}}
                />
              </div>
            )}

            {activeTab === 'role-defaults' && (
              <RoleDefaultsTab companyId={selectedCompany.id} currentUserId={currentUser?.id} />
            )}
          </>
        )}

        {view === 'user-modules' && selectedUser && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-bold">
                  {(selectedUser.full_name || selectedUser.email || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900">{selectedUser.full_name || 'Unnamed'}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[selectedUser.role] || 'bg-slate-100 text-slate-600'}`}>
                    {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                  </span>
                  {selectedUser.is_active === false && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />Last login: {formatDate(selectedUser.last_login_at)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <BarChart2 className="w-3 h-3" />{formatTokens(selectedUser.token_usage || 0)} tokens used
                  </span>
                  <Badge className="text-xs bg-blue-100 text-blue-800 border-0">
                    {ALL_MODULES.filter(m => getCompanyModuleStatus(m.id) && getUserModuleStatus(m.id)).length} modules active
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-5">Greyed-out modules are not enabled at company level.</p>
              <ModuleTable
                groups={modulesByGroup}
                getStatus={(id) => getCompanyModuleStatus(id) ? getUserModuleStatus(id) : false}
                onToggle={toggleUserModule}
                lockedModules={new Set(ALL_MODULES.filter(m => !getCompanyModuleStatus(m.id)).map(m => m.id))}
              />
            </div>
          </div>
        )}
      </div>

      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />Add New User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-slate-600">Full Name *</Label>
                <Input className="mt-1" placeholder="Jane Smith" value={newUser.full_name} onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">Role</Label>
                <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600">Email *</Label>
              <Input className="mt-1" type="email" placeholder="jane@company.com" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600">Temporary Password *</Label>
              <div className="relative mt-1">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} className="pr-9" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-slate-600">Department</Label>
                <Input className="mt-1" placeholder="Sales" value={newUser.department} onChange={e => setNewUser(p => ({ ...p, department: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">Phone</Label>
                <Input className="mt-1" placeholder="+1 234 567 8900" value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-2">Role defaults will be auto-applied to this user's module access.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={isAddingUser} className="bg-blue-600 hover:bg-blue-700">
              {isAddingUser ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BulkImportModal
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        companyId={selectedCompany?.id}
        currentUserId={currentUser?.id}
        onImported={() => selectedCompany && loadCompanyData(selectedCompany.id)}
      />
    </div>
  );
}

function RoleDefaultsTab({ companyId, currentUserId }) {
  const [activeRole, setActiveRole] = useState('sales_agent');
  const [roleDefaults, setRoleDefaults] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const query = supabase.from('role_module_defaults').select('*').eq('role', activeRole);
    if (companyId) query.eq('company_id', companyId);
    else query.is('company_id', null);
    const { data } = await query;
    setRoleDefaults(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeRole, companyId]);

  const getStatus = (moduleId) => roleDefaults.find(d => d.module_id === moduleId)?.is_enabled ?? false;

  const toggle = async (mod, currentEnabled) => {
    const existing = roleDefaults.find(d => d.module_id === mod.id);
    try {
      if (existing) {
        await supabase.from('role_module_defaults').update({ is_enabled: !currentEnabled }).eq('id', existing.id);
        setRoleDefaults(prev => prev.map(d => d.module_id === mod.id ? { ...d, is_enabled: !currentEnabled } : d));
      } else {
        const payload = { role: activeRole, module_id: mod.id, module_name: mod.name, is_enabled: true, created_by: currentUserId };
        if (companyId) payload.company_id = companyId;
        const { data } = await supabase.from('role_module_defaults').insert(payload).select().single();
        setRoleDefaults(prev => [...prev, data]);
      }
      toast.success('Role default updated');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {ROLES.map(role => (
            <button key={role} onClick={() => setActiveRole(role)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeRole === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >{ROLE_LABELS[role]}</button>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-3">
          Modules enabled here are auto-assigned when a <strong>{ROLE_LABELS[activeRole]}</strong> is created.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto pr-1">
          <ModuleTable groups={modulesByGroup} getStatus={getStatus} onToggle={toggle} />
        </div>
      )}
    </div>
  );
}
