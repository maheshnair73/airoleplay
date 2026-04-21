const STORAGE_KEY = 'effysales-session';

const DEMO_USERS = [
  {
    id: '008af220-5501-4e61-87ca-9ec45a15963d',
    email: 'saas@effysalespro.com',
    password: 'demo1234',
    role: 'saas_admin',
    full_name: 'SaaS Admin',
    company_id: null,
  },
  {
    id: 'a23fa129-b2ec-4aac-9241-52046c07cc01',
    email: 'admin@effysalespro.com',
    password: 'demo1234',
    role: 'company_admin',
    full_name: 'Company Admin',
    company_id: 'company-001',
  },
  {
    id: '34b6c96c-dc6d-413a-bcc2-79982c6a0892',
    email: 'manager@effysalespro.com',
    password: 'demo1234',
    role: 'sales_manager',
    full_name: 'Sales Manager',
    company_id: 'company-001',
  },
  {
    id: '0a32d1bb-ea1e-4f8c-968b-ea5e5ae46dde',
    email: 'agent1@effysalespro.com',
    password: 'demo1234',
    role: 'sales_agent',
    full_name: 'Sales Agent',
    company_id: 'company-001',
  },
  {
    id: 'db617ab3-a722-4aa2-a8dd-4c7a0b309d94',
    email: 'agent2@effysalespro.com',
    password: 'demo1234',
    role: 'sales_agent',
    full_name: 'Sales Agent 2',
    company_id: 'company-001',
  },
];

const getSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveSession = (session) => {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const buildSession = (user) => {
  const { password: _pw, role, ...safeUser } = user;
  return {
    user: { ...safeUser, aud: 'authenticated', role, app_role: role },
    access_token: `local-token-${user.id}`,
    refresh_token: `local-refresh-${user.id}`,
    expires_at: Date.now() + 1000 * 60 * 60 * 24,
  };
};

let listeners = [];

const notify = (event, session) => {
  listeners.forEach((cb) => cb(event, session));
};

export const localAuth = {
  async signInWithPassword({ email, password }) {
    const user = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }
    const session = buildSession(user);
    saveSession(session);
    setTimeout(() => notify('SIGNED_IN', session), 0);
    return { data: { user: session.user, session }, error: null };
  },

  async signOut() {
    saveSession(null);
    setTimeout(() => notify('SIGNED_OUT', null), 0);
    return { error: null };
  },

  async getSession() {
    const session = getSession();
    return { data: { session }, error: null };
  },

  async getUser() {
    const session = getSession();
    if (!session?.user) return { data: { user: null }, error: null };
    return { data: { user: session.user }, error: null };
  },

  onAuthStateChange(callback) {
    listeners.push(callback);
    // Do NOT fire immediately — callers should use getSession() for initial state.
    // Firing here caused every new subscriber to trigger a setState → re-render loop.
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            listeners = listeners.filter((l) => l !== callback);
          },
        },
      },
    };
  },

  async updateUser(updates) {
    const session = getSession();
    if (!session) return { data: null, error: { message: 'Not authenticated' } };
    const updated = { ...session, user: { ...session.user, ...updates } };
    saveSession(updated);
    return { data: { user: updated.user }, error: null };
  },
};
