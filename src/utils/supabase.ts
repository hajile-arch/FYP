import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or anonymous key");
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
