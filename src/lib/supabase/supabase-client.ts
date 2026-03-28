import { createBrowserClient } from "@supabase/ssr";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

/**
 * Client-side Supabase client
 * Used inside React components
 */
export function createBrowserSupabaseClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
