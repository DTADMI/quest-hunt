import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {requireAuth} from '@/lib/server/auth';

// Leaderboard based on quests completed (count of quest_progress rows with status='completed')

export async function GET(request: Request) {
    try {
        // Leaderboard can be public; still try to resolve user for personalization if needed
        await requireAuth().catch(() => ({user: null}));
        const supabase = createClient();
        const {searchParams} = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);

        // Prefer a view or SQL, but use RPC-less aggregation for MVP
        const {data, error} = await supabase
            .from('quest_progress')
            .select('user_id', {count: 'exact'}) as any;

        if (error) throw error;

        // Supabase JS can't group on the client side; fetch minimal aggregate via SQL if available.
        // Fallback: fetch completed rows and aggregate here (may be heavy for large datasets).
        const {data: rows, error: rowsErr} = await supabase
            .from('quest_progress')
            .select('user_id, status')
            .eq('status', 'completed');
        if (rowsErr) throw rowsErr;

        const counts = new Map<string, number>();
        for (const r of rows ?? []) {
            counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1);
        }
        const items = Array.from(counts.entries())
            .map(([user_id, completed]) => ({user_id, completed}))
            .sort((a, b) => b.completed - a.completed)
            .slice(0, limit);

        // Optionally join profiles for display names
        const userIds = items.map(i => i.user_id);
        let profilesById: Record<string, any> = {};
        if (userIds.length) {
            const {data: profiles, error: pErr} = await supabase
                .from('profiles')
                .select('id, username, display_name, avatar_url')
                .in('id', userIds);
            if (!pErr) {
                profilesById = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));
            }
        }

        const enriched = items.map(i => ({
            rank: 0, // fill next
            ...i,
            user: profilesById[i.user_id] ?? {id: i.user_id},
        }));
        enriched.forEach((e, idx) => (e.rank = idx + 1));

        return NextResponse.json({items: enriched});
    } catch (e: any) {
        if (e?.message?.includes('relation')) {
            return NextResponse.json({items: []});
        }
        console.error('leaderboard GET error', e);
        return NextResponse.json({error: 'Failed to load leaderboard'}, {status: 500});
    }
}
