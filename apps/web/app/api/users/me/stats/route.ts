import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {requireAuth} from '@/lib/server/auth';

export async function GET() {
    try {
        const {user} = await requireAuth();
        if (!user) return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        const supabase = createClient();

        // Get completed quests count
        const {count: questsCompleted, error: qErr} = await supabase
            .from('quest_progress')
            .select('*', {count: 'exact', head: true})
            .eq('user_id', user.id)
            .eq('status', 'completed');
        if (qErr) {
            throw qErr;
        }

        // Get total points (sum of badge points)
        const {data: badges, error: bErr} = await supabase
            .from('user_badges')
            .select('badge_id, badges(points)')
            .eq('user_id', user.id)
            .eq('is_unlocked', true);
        if (bErr) {
            throw bErr;
        }

        const totalPoints = (badges || []).reduce((sum, ub: any) => sum + (ub.badges?.points || 0), 0);

        return NextResponse.json({
            quests_completed: questsCompleted || 0,
            total_points: totalPoints,
            badges_count: badges?.length || 0,
        });
    } catch (e) {
        console.error('stats GET error', e);
        return NextResponse.json({error: 'Failed to load stats'}, {status: 500});
    }
}
