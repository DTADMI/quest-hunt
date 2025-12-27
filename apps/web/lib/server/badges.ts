import {createClient} from '@/lib/supabase/server';

export async function listBadges() {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('badges')
        .select('*')
        .order('points', {ascending: false});
    if (error) throw error;
    return data ?? [];
}

export async function getBadgeStats(userId: string) {
    const supabase = createClient();
    const {data: badges, error: bErr} = await supabase.from('badges').select('id, rarity');
    if (bErr) throw bErr;
    const {data: userBadges, error: ubErr} = await supabase
        .from('user_badges')
        .select('badge_id, is_unlocked')
        .eq('user_id', userId);
    if (ubErr) throw ubErr;

    const unlockedSet = new Set(
        (userBadges ?? []).filter((b) => b.is_unlocked).map((b) => b.badge_id)
    );

    const byRarity: Record<string, { total: number; unlocked: number }> = {
        common: {total: 0, unlocked: 0},
        uncommon: {total: 0, unlocked: 0},
        rare: {total: 0, unlocked: 0},
        epic: {total: 0, unlocked: 0},
        legendary: {total: 0, unlocked: 0},
    };
    for (const b of badges ?? []) {
        byRarity[b.rarity].total += 1;
        if (unlockedSet.has(b.id)) byRarity[b.rarity].unlocked += 1;
    }

    return {
        total: badges?.length ?? 0,
        unlocked: unlockedSet.size,
        byRarity,
    } as any;
}

export async function evaluateBadges(userId: string) {
    // Minimal placeholder: in a real app, compute progress based on events
    // Here, we ensure rows exist in user_badges for all badges
    const supabase = createClient();
    const {data: badges, error: bErr} = await supabase.from('badges').select('id, criteria');
    if (bErr) throw bErr;
    for (const b of badges ?? []) {
        const {error} = await supabase
            .from('user_badges')
            .upsert({badge_id: b.id, user_id: userId}, {onConflict: 'badge_id,user_id'});
        if (error) throw error;
    }
    return {ok: true};
}
