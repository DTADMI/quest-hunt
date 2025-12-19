// Supabase server-side client for Next.js App Router
// Creates a cookie-aware Supabase client for Server Components and Route Handlers
import {cookies} from 'next/headers';
import {type CookieOptions, createServerClient} from '@supabase/ssr';

export function createClient() {
    const cookieStore = cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
        );
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                cookieStore.set({name, value, ...options});
            },
            remove(name: string, options: CookieOptions) {
                cookieStore.set({name, value: '', ...options, maxAge: 0});
            },
        },
    });
}
