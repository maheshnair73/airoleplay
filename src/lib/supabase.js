import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const realSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'effysales-auth-token',
  },
});

const isServerError = (error) => {
  if (!error) return false;
  const msg = error.message || '';
  return (
    msg.includes('500') ||
    msg.includes('Internal Server Error') ||
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    error.status === 500
  );
};

const createHybridAuth = () => ({
  async signInWithPassword(credentials) {
    try {
      const result = await realSupabase.auth.signInWithPassword(credentials);
      if (result.error && isServerError(result.error)) {
        console.warn('[Auth] Supabase auth unavailable, using local fallback');
        return mockSupabase.auth.signInWithPassword(credentials);
      }
      return result;
    } catch (err) {
      if (isServerError(err)) {
        console.warn('[Auth] Supabase auth unavailable, using local fallback');
        return mockSupabase.auth.signInWithPassword(credentials);
      }
      throw err;
    }
  },

  async signOut() {
    const [realResult] = await Promise.allSettled([
      realSupabase.auth.signOut(),
      mockSupabase.auth.signOut(),
    ]);
    return realResult.status === 'fulfilled' ? realResult.value : { error: null };
  },

  async getSession() {
    try {
      const result = await realSupabase.auth.getSession();
      if (result.data?.session) return result;
      const mockResult = await mockSupabase.auth.getSession();
      if (mockResult.data?.session) return mockResult;
      return result;
    } catch {
      return mockSupabase.auth.getSession();
    }
  },

  async getUser() {
    try {
      const result = await realSupabase.auth.getUser();
      if (result.data?.user) return result;
      const mockResult = await mockSupabase.auth.getUser();
      if (mockResult.data?.user) return mockResult;
      return result;
    } catch {
      return mockSupabase.auth.getUser();
    }
  },

  onAuthStateChange(callback) {
    const realSub = realSupabase.auth.onAuthStateChange(callback);
    const mockSub = mockSupabase.auth.onAuthStateChange((event, session) => {
      if (session) callback(event, session);
    });
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            realSub.data?.subscription?.unsubscribe?.();
            mockSub.data?.subscription?.unsubscribe?.();
          },
        },
      },
    };
  },
});

export const supabase = {
  ...realSupabase,
  auth: createHybridAuth(),
};
