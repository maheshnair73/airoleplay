import { createClient } from '@supabase/supabase-js';
import { localAuth } from './localAuth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = new Proxy(realSupabase, {
  get(target, prop) {
    if (prop === 'auth') return localAuth;
    const value = target[prop];
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
