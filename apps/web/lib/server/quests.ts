import {createClient} from '@/lib/supabase/server';

export async function listQuests() {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('quests')
        .select('*, created_by:profiles(username)')
        .order('created_at', {ascending: false});
    if (error) throw error;
    return data ?? [];
}

export async function getQuest(id: string) {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('quests')
        .select('*, created_by:profiles(username)')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export async function createQuest(values: any, userId: string) {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('quests')
        .insert([{...values, created_by: userId}])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateQuest(id: string, values: any, userId: string) {
    const supabase = createClient();
    // ownership check
    const {data: existing, error: fetchErr} = await supabase
        .from('quests')
        .select('created_by')
        .eq('id', id)
        .single();
    if (fetchErr) throw fetchErr;
    if (!existing || existing.created_by !== userId) {
        throw Object.assign(new Error('Not authorized'), {status: 403});
    }
    const {data, error} = await supabase
        .from('quests')
        .update(values)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteQuest(id: string, userId: string) {
    const supabase = createClient();
    const {data: existing, error: fetchErr} = await supabase
        .from('quests')
        .select('created_by')
        .eq('id', id)
        .single();
    if (fetchErr) throw fetchErr;
    if (!existing || existing.created_by !== userId) {
        throw Object.assign(new Error('Not authorized'), {status: 403});
    }
    const {error} = await supabase.from('quests').delete().eq('id', id);
    if (error) throw error;
    return true;
}
