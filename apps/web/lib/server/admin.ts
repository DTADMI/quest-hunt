import {createClient} from '@/lib/supabase/server';

export async function isFeatureEnabled(flagId: string): Promise<boolean> {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('feature_flags')
        .select('is_enabled')
        .eq('id', flagId)
        .single();

    if (error || !data) {
        return false;
    }

    return data.is_enabled;
}

export async function isAdmin(userId: string): Promise<boolean> {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return false;
    }

    return data.is_admin;
}
