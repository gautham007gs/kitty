import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is required but not set');
}

if (!supabaseKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// Test connection on initialization
if (supabase) {
  supabase.from('messages_log').select('count', { count: 'exact' }).limit(1)
    .then(({ error }) => {
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('✅ Supabase connected successfully');
      }
    });
}