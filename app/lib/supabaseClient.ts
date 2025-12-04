import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read environment variables provided by Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
// This allows the app to work in demo mode without Supabase
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("Supabase client initialized with URL:", supabaseUrl);
} else {
  console.log("Supabase not configured - running in demo mode (localStorage only)");
}

export { supabase };
