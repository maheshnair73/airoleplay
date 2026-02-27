import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const customFetch = async (url, options = {}, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      console.log(`Fetching (attempt ${i + 1}/${retries}):`, url);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('Fetch response:', response.status, response.statusText);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Fetch error (attempt ${i + 1}/${retries}):`, {
        message: error.message,
        name: error.name,
        url,
        isAbort: error.name === 'AbortError'
      });

      if (i === retries - 1) {
        throw new Error(`Connection to Supabase failed after ${retries} attempts. This is likely due to: 1) Network firewall/proxy blocking ${new URL(url).hostname}, 2) ISP blocking Supabase, or 3) Slow/unstable internet. Try: mobile hotspot, different network, or VPN. Error: ${error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    fetch: customFetch
  }
});
