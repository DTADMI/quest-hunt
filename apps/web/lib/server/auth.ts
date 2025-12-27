import {createClient} from '@/lib/supabase/server';

export async function getSession() {
    const supabase = createClient();
    const {
        data: {session},
        error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        return {user: null, session: null};
    }
    return {user: session.user, session};
}
