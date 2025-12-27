import {createClient} from '@/lib/supabase/server';

export async function startQuest(questId: string, userId: string) {
    const supabase = createClient();
    // Upsert-like: insert or ignore if exists
    const {data, error} = await supabase
        .from('quest_progress')
        .upsert(
            {quest_id: questId, user_id: userId, status: 'started'},
            {onConflict: 'quest_id,user_id'}
        )
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function completeQuest(questId: string, userId: string) {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('quest_progress')
        .update({status: 'completed', completed_at: new Date().toISOString()})
        .eq('quest_id', questId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function visitWaypoint(waypointId: string, userId: string, proof?: any) {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('waypoint_visits')
        .insert([{waypoint_id: waypointId, user_id: userId, proof: proof ?? null}])
        .select()
        .single();
    if (error) throw error;
    return data;
}
