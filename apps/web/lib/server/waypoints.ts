import {createClient} from '@/lib/supabase/server';

export async function listWaypoints(questId: string) {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('waypoints')
        .select('*')
        .eq('quest_id', questId)
        .order('order_index', {ascending: true});
    if (error) throw error;
    return data ?? [];
}

export async function createWaypoint(questId: string, values: any, userId: string) {
    const supabase = createClient();
    // Ensure quest belongs to user
    const {data: quest, error: qErr} = await supabase
        .from('quests')
        .select('created_by')
        .eq('id', questId)
        .single();
    if (qErr) throw qErr;
    if (!quest || quest.created_by !== userId) {
        throw Object.assign(new Error('Not authorized'), {status: 403});
    }
    const {data, error} = await supabase
        .from('waypoints')
        .insert([{...values, quest_id: questId}])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateWaypoint(
    questId: string,
    waypointId: string,
    values: any,
    userId: string
) {
    const supabase = createClient();
    // ownership via join
    const {data: join, error: jErr} = await supabase
        .from('waypoints')
        .select('quest_id, quests!inner(created_by)')
        .eq('id', waypointId)
        .single();
    if (jErr) throw jErr;
    // @ts-ignore created_by from join
    if (!join || (join as any).quests.created_by !== userId || (join as any).quest_id !== questId) {
        throw Object.assign(new Error('Not authorized'), {status: 403});
    }
    const {data, error} = await supabase
        .from('waypoints')
        .update(values)
        .eq('id', waypointId)
        .eq('quest_id', questId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteWaypoint(questId: string, waypointId: string, userId: string) {
    const supabase = createClient();
    // ownership via join
    const {data: join, error: jErr} = await supabase
        .from('waypoints')
        .select('quest_id, quests!inner(created_by)')
        .eq('id', waypointId)
        .single();
    if (jErr) throw jErr;
    // @ts-ignore
    if (!join || (join as any).quests.created_by !== userId || (join as any).quest_id !== questId) {
        throw Object.assign(new Error('Not authorized'), {status: 403});
    }
    const {error} = await supabase
        .from('waypoints')
        .delete()
        .eq('id', waypointId)
        .eq('quest_id', questId);
    if (error) throw error;
    return true;
}
