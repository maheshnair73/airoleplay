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

const customFetch = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
        throw new Error(`Failed to connect to Supabase after ${retries} attempts. Please check: 1) Your internet connection, 2) If the Supabase project is active, 3) If you're behind a firewall blocking the connection. Original error: ${error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
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
