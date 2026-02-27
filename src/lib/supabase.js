import { mockSupabase } from './mockSupabase';

console.log('Using Mock Supabase Client (No Network Connection Required)');

export const supabase = mockSupabase;
