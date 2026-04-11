import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create the client - always attempt creation if URL exists
// The client will fail at query time if keys are wrong, not at creation
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to create Supabase client:", err);
  }
}

export { supabase };
