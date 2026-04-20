import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Building2, Users, Key, Plus, Search, MoreVertical, Eye, EyeOff,
  Copy, Trash2, RefreshCw, TrendingUp, Shield, Globe, AlertCircle,
  CheckCircle, XCircle, ChevronDown, Loader2, Activity, Zap, Lock,
  Edit3, Ban, Play, CreditCard, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

const PLANS = [
  { value: 'starter', label: 'Starter', color: 'bg-slate-100 text-slate-700' },
  { value: 'growth', label: 'Growth', color: 'bg-blue-100 text-blue-700' },
  { value: 'enterprise', label: 'Enterprise', color: 'bg-amber-100 text-amber-700' },
];

const API_PROVIDERS = [
  { value: 'openai', label: 'OpenAI', icon: '🤖' },
  { value: 'anthropic', label: 'Anthropic', icon: '🧠' },
  { value: 'elevenlabs', label: 'ElevenLabs', icon: '🎙️' },
  { value: 'google', label: 'Google AI', icon: '🔍' },
  { value: 'twilio', label: 'Twilio', icon: '📞' },
  { value: 'sendgrid', label: 'SendGrid', icon: '📧' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function UsageBar({ used, total, color = 'bg-blue-500' }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const barColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : color;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{used?.toLocaleString()} / {total?.toLocaleString()}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CreateCompanyModal({ open, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', industry: '', website: '', plan: 'starter',
    license_count: 10, token_limit_per_month: 100000,
    admin_name: '', admin_email: '', admin_password: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name || !form.admin_email || !form.admin_password) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const { data: company, error: cErr } = await supabase
        .from('companies')
        .insert({
          name: form.name,
          industry: form.industry,
          website: form.website,
          subscription_plan: form.plan,
          license_count: form.license_count,
          token_limit_per_month: form.token_limit_per_month,
          is_active: true,
          subscription_status: 'active',
          company_admin_email: form.admin_email,
        })
        .select()
        .single();
      if (cErr) throw cErr;

      const { data: authData, error: authErr } = await supabase.auth.admin
        ? { data: null, error: { message: 'Use Supabase dashboard to create auth users' } }
        : { data: null, error: { message: 'Admin API not available client-side' } };

      toast.success(`Company "${form.name}" created! Add admin user via Supabase dashboard.`);
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Create Company Account
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          {[1, 2].map(s => (
            <button
              key={s}
              onClick={() => s < step && setStep(s)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : step > s
                  ? 'bg-blue-100 text-blue-700 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {s === 1 ? 'Company Details' : 'Admin Account'}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Company Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Acme Corp" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Industry</Label>
                <Input value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="SaaS, Finance..." className="mt-1" />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Subscription Plan</Label>
              <Select value={form.plan} onValueChange={v => set('plan', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>License Count</Label>
                <Input type="number" value={form.license_count} onChange={e => set('license_count', +e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Monthly Token Limit</Label>
                <Input type="number" value={form.token_limit_per_month} onChange={e => set('token_limit_per_month', +e.target.value)} className="mt-1" />
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setStep(2)}>
              Next: Admin Account
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Admin Full Name</Label>
              <Input value={form.admin_name} onChange={e => set('admin_name', e.target.value)} placeholder="Jane Smith" className="mt-1" />
            </div>
            <div>
              <Label>Admin Email *</Label>
              <Input type="email" value={form.admin_email} onChange={e => set('admin_email', e.target.value)} placeholder="admin@company.com" className="mt-1" />
            </div>
            <div>
              <Label>Temporary Password *</Label>
              <Input type="password" value={form.admin_password} onChange={e => set('admin_password', e.target.value)} placeholder="Min 8 characters" className="mt-1" />
            </div>
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              The company record will be created. To complete admin user setup, create the auth user in the Supabase dashboard with this email, then assign company_admin role.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleCreate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Company
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function APIKeyModal({ open, onClose, editKey, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    provider: 'openai',
    key_value: '',
    token_limit: 500000,
    description: '',
  });

  useEffect(() => {
    if (editKey) {
      setForm({
        name: editKey.name || '',
        provider: editKey.provider || 'openai',
        key_value: '',
        token_limit: editKey.token_limit || 500000,
        description: editKey.description || '',
      });
    } else {
      setForm({ name: '', provider: 'openai', key_value: '', token_limit: 500000, description: '' });
    }
  }, [editKey, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || (!editKey && !form.key_value)) {
      toast.error('Name and API key are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        provider: form.provider,
        token_limit: form.token_limit,
        description: form.description,
        is_active: true,
      };
      if (form.key_value) payload.key_value = form.key_value;

      let error;
      if (editKey) {
        ({ error } = await supabase.from('api_keys').update(payload).eq('id', editKey.id));
      } else {
        ({ error } = await supabase.from('api_keys').insert(payload));
      }
      if (error) throw error;
      toast.success(editKey ? 'API key updated' : 'API key added');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            {editKey ? 'Edit API Key' : 'Add API Key'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Key Name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. OpenAI Production" className="mt-1" />
          </div>
          <div>
            <Label>Provider</Label>
            <Select value={form.provider} onValueChange={v => set('provider', v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {API_PROVIDERS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.icon} {p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{editKey ? 'New API Key Value (leave blank to keep current)' : 'API Key Value *'}</Label>
            <Input
              type="password"
              value={form.key_value}
              onChange={e => set('key_value', e.target.value)}
              placeholder={editKey ? '••••••••••••••••' : 'sk-...'}
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div>
            <Label>Monthly Token Limit</Label>
            <Input type="number" value={form.token_limit} onChange={e => set('token_limit', +e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional notes" className="mt-1" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editKey ? 'Save Changes' : 'Add Key'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompanyRow({ company, onUpdate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const planInfo = PLANS.find(p => p.value === company.subscription_plan) || PLANS[0];

  const toggleActive = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from('companies')
      .update({ is_active: !company.is_active })
      .eq('id', company.id);
    if (error) toast.error('Failed to update company');
    else {
      toast.success(`Company ${company.is_active ? 'suspended' : 'activated'}`);
      onUpdate?.();
    }
    setUpdating(false);
    setMenuOpen(false);
  };

  const changePlan = async (plan) => {
    const { error } = await supabase
      .from('companies')
      .update({ subscription_plan: plan })
      .eq('id', company.id);
    if (error) toast.error('Failed to update plan');
    else { toast.success('Plan updated'); onUpdate?.(); }
    setMenuOpen(false);
  };

  const userPct = company.license_count > 0
    ? Math.round((company.used_license_count || 0) / company.license_count * 100)
    : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{company.name}</h3>
              {company.is_active ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-red-400" />
              )}
            </div>
            <p className="text-xs text-slate-500">{company.company_admin_email || 'No admin set'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planInfo.color}`}>
            {planInfo.label}
          </span>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[180px] py-1">
                <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">Change Plan</div>
                {PLANS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => changePlan(p.value)}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-50 flex items-center justify-between ${company.subscription_plan === p.value ? 'text-blue-600 font-medium' : 'text-slate-700'}`}
                  >
                    {p.label}
                    {company.subscription_plan === p.value && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={toggleActive}
                  disabled={updating}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-slate-50 ${company.is_active ? 'text-red-600' : 'text-emerald-600'}`}
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : company.is_active ? <Ban className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {company.is_active ? 'Suspend Company' : 'Activate Company'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Users ({company.used_license_count || 0}/{company.license_count || 0})</p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${userPct > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${userPct}%` }} />
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Tokens this month</p>
          <UsageBar used={company.token_used_this_month || 0} total={company.token_limit_per_month || 100000} />
        </div>
      </div>

      {company.industry && (
        <p className="text-xs text-slate-400 mt-3">{company.industry}</p>
      )}
    </div>
  );
}

function APIKeyRow({ apiKey, onUpdate }) {
  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const provider = API_PROVIDERS.find(p => p.value === apiKey.provider) || API_PROVIDERS[API_PROVIDERS.length - 1];

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key_value || '');
    toast.success('Copied to clipboard');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this API key?')) return;
    setDeleting(true);
    const { error } = await supabase.from('api_keys').delete().eq('id', apiKey.id);
    if (error) toast.error('Failed to delete');
    else { toast.success('API key deleted'); onUpdate?.(); }
    setDeleting(false);
  };

  const toggleActive = async () => {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: !apiKey.is_active })
      .eq('id', apiKey.id);
    if (error) toast.error('Failed to update');
    else onUpdate?.();
  };

  const maskedKey = apiKey.key_value
    ? `${apiKey.key_value.substring(0, 8)}${'•'.repeat(24)}${apiKey.key_value.slice(-4)}`
    : '••••••••••••••••••••••••••••••••';

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-lg">
              {provider.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">{apiKey.name}</h3>
                <Switch checked={apiKey.is_active} onCheckedChange={toggleActive} className="scale-75" />
              </div>
              <p className="text-xs text-slate-500">{provider.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditOpen(true)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleDelete} disabled={deleting} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 mb-3">
          <Key className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <code className="text-xs text-slate-600 flex-1 truncate font-mono">
            {visible ? (apiKey.key_value || 'No key stored') : maskedKey}
          </code>
          <button onClick={() => setVisible(!visible)} className="text-slate-400 hover:text-slate-600 transition-colors">
            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleCopy} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <UsageBar used={apiKey.token_used || 0} total={apiKey.token_limit || 500000} />
        {apiKey.description && <p className="text-xs text-slate-400 mt-2">{apiKey.description}</p>}
      </div>

      <APIKeyModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editKey={apiKey}
        onSaved={onUpdate}
      />
    </>
  );
}

function AllUsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  const toggleActive = async (user) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: !user.is_active })
      .eq('id', user.id);
    if (error) toast.error('Failed to update');
    else loadUsers();
  };

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => {
    const map = {
      saas_admin: 'bg-slate-800 text-white',
      super_admin: 'bg-slate-800 text-white',
      company_admin: 'bg-blue-100 text-blue-800',
      sales_manager: 'bg-sky-100 text-sky-800',
      sales_agent: 'bg-emerald-100 text-emerald-800',
    };
    return map[role] || 'bg-slate-100 text-slate-700';
  };

  const formatDate = (d) => {
    if (!d) return 'Never';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Login</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tokens</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{u.full_name || 'Unnamed'}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge(u.role)}`}>
                      {u.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600">{u.companies?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">{formatDate(u.last_login_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-24">
                      <UsageBar used={u.token_usage || 0} total={u.token_cap || 10000} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={u.is_active !== false}
                      onCheckedChange={() => toggleActive(u)}
                      className="scale-75"
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [stats, setStats] = useState({ totalCompanies: 0, totalUsers: 0, totalTokens: 0, activeKeys: 0 });
  const [loading, setLoading] = useState(true);
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  const [addKeyOpen, setAddKeyOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: comps }, { data: keys }, { data: userCount }] = await Promise.all([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('api_keys').select('*').order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    ]);

    setCompanies(comps || []);
    setApiKeys(keys || []);

    const totalTokens = (comps || []).reduce((s, c) => s + (c.token_used_this_month || 0), 0);
    setStats({
      totalCompanies: (comps || []).length,
      totalUsers: userCount || 0,
      totalTokens,
      activeKeys: (keys || []).filter(k => k.is_active).length,
    });
    setLoading(false);
  };

  const filteredCompanies = companies.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredKeys = apiKeys.filter(k =>
    !search || k.name?.toLowerCase().includes(search.toLowerCase()) || k.provider?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'companies', label: 'Companies', icon: Building2, count: stats.totalCompanies },
    { id: 'apikeys', label: 'API Keys', icon: Key, count: stats.activeKeys },
    { id: 'users', label: 'All Users', icon: Users, count: stats.totalUsers },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>SaaS Administration</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Console</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage companies, API keys, and all platform users</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'companies' && (
              <Button onClick={() => setCreateCompanyOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                New Company
              </Button>
            )}
            {activeTab === 'apikeys' && (
              <Button onClick={() => setAddKeyOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                Add API Key
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Building2} label="Companies" value={stats.totalCompanies} sub="registered" color="bg-blue-50 text-blue-600" />
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} sub="across all companies" color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={Zap} label="Tokens Used" value={stats.totalTokens.toLocaleString()} sub="this month" color="bg-amber-50 text-amber-600" />
          <StatCard icon={Key} label="Active API Keys" value={stats.activeKeys} sub="integrations" color="bg-slate-100 text-slate-600" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab !== 'users' && (
              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={activeTab === 'companies' ? 'Search companies...' : 'Search API keys...'}
                  className="pl-9"
                />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {activeTab === 'companies' && (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredCompanies.map(c => (
                      <CompanyRow key={c.id} company={c} onUpdate={loadData} />
                    ))}
                    {filteredCompanies.length === 0 && (
                      <div className="col-span-3 py-16 text-center text-slate-400">
                        <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No companies found</p>
                        <Button onClick={() => setCreateCompanyOpen(true)} variant="outline" className="mt-4 gap-2">
                          <Plus className="w-4 h-4" /> Create first company
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'apikeys' && (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredKeys.map(k => (
                      <APIKeyRow key={k.id} apiKey={k} onUpdate={loadData} />
                    ))}
                    {filteredKeys.length === 0 && (
                      <div className="col-span-3 py-16 text-center text-slate-400">
                        <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No API keys configured</p>
                        <Button onClick={() => setAddKeyOpen(true)} variant="outline" className="mt-4 gap-2">
                          <Plus className="w-4 h-4" /> Add first API key
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'users' && <AllUsersTab />}
              </>
            )}
          </div>
        </div>
      </div>

      <CreateCompanyModal
        open={createCompanyOpen}
        onClose={() => setCreateCompanyOpen(false)}
        onCreated={loadData}
      />

      <APIKeyModal
        open={addKeyOpen}
        onClose={() => setAddKeyOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}
