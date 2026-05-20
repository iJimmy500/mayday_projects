import { createClient } from '@supabase/supabase-js';

// Supabase client requires the bare project origin — strip any path suffix
const supabaseUrl = new URL(import.meta.env.VITE_SUPABASE_URL).origin;

export const supabase = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_ANON_KEY);
