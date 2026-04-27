import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl        = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for client-side use (handles cookies for Next.js)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ──────────────────────────────────────────────────────────────────
// Server-side admin client. Must be initialised with the SERVICE ROLE
// key — silently falling back to the anon key would mask RLS bugs and
// could leak write access in production. We HARD-FAIL on the server in
// production if the service-role key is missing, and warn loudly in
// dev so local setups still work for read-only flows.
// ──────────────────────────────────────────────────────────────────
const isServer = typeof window === 'undefined';

if (isServer && !supabaseServiceKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[supabase] SUPABASE_SERVICE_ROLE_KEY is missing. Refusing to start ' +
      'in production with an anon-key fallback for supabaseAdmin — that ' +
      'would silently bypass intended privilege boundaries.'
    );
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      '[supabase] SUPABASE_SERVICE_ROLE_KEY is missing. supabaseAdmin will ' +
      'fall back to the anon key for local development only. Set ' +
      'SUPABASE_SERVICE_ROLE_KEY in .env before deploying.'
    );
  }
}

// Client for server-side administrative use (bypasses RLS).
// `autoRefreshToken` and `persistSession` are disabled because this client
// is stateless and per-request — there's no user session to persist.
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  }
);
