import { createClient } from '@supabase/supabase-js';

// Use a first-party proxy path to bypass adblockers/Brave Shields
const supabaseUrl = typeof window !== 'undefined'
  ? window.location.origin + '/supabase'
  : new URL(import.meta.env.VITE_SUPABASE_URL).origin;

export const supabase = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_ANON_KEY);
