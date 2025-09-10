import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  // Allow access to __supabase on the global object
  var __supabase: SupabaseClient | undefined;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Fatal Error: NEXT_PUBLIC_SUPABASE_URL is not set in environment variables.');
  console.error('Current URL value:', supabaseUrl);
  throw new Error('Supabase URL is required');
}

if (!supabaseKey) {
  console.error('Fatal Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in environment variables.');
  console.error('Current key value:', supabaseKey);
  throw new Error('Supabase anon key is required');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Supabase URL must be a valid URL');
}

// Validate key format (should be a JWT)
if (!supabaseKey.includes('.') || supabaseKey.startsWith('http')) {
  console.error('Invalid Supabase key format. Key appears to be:', supabaseKey.substring(0, 50) + '...');
  throw new Error('Supabase anon key must be a JWT token, not a URL');
}

const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      // Persisting the session is crucial for a good user experience,
      // so the user doesn't have to log in on every single visit.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Helpful for OAuth and magic links
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
};

// This singleton pattern is the *only* way to ensure we use the same Supabase client instance
// across the entire application, which is the root cause of the subscription error.
// In development, hot-reloading can re-run this module, so we store the client globally.
const supabase: SupabaseClient = global.__supabase ?? createSupabaseClient();

// We only need to run the connection test when the client is first created.
if (!global.__supabase) {
    supabase.from('messages_log').select('count', { count: 'exact' }).limit(1)
    .then(({ error }) => {
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('✅ Supabase connected successfully (Singleton created)');
      }
    });
}

// In development environments, we want to persist the client across hot reloads.
if (process.env.NODE_ENV !== 'production') {
  global.__supabase = supabase;
}

export { supabase };
