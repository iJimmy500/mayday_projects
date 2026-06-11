import { createClient } from '@supabase/supabase-js';

// Connect directly to Supabase. Realtime runs over a WebSocket, and the
// first-party `/supabase` worker proxy does not pass WebSocket upgrades in
// production (the connection fails with a non-101 response), which silently
// broke all multiplayer joining/syncing when deployed.
//
// VITE_SUPABASE_URL in .env includes a `/rest/v1/` path — createClient needs
// the bare project origin or it builds broken realtime/auth/storage URLs.
const supabaseOrigin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;

export const supabase = createClient(
  supabaseOrigin,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
