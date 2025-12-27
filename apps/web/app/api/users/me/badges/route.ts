import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {requireAuth} from '@/lib/server/auth';

export async function GET() {
    try {
        const {user} = await requireAuth();
        if (!user) return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        const supabase = createClient();

        const {data, error} = await supabase
            .from('user_badges')
            .select(
                `
                id,
                is_unlocked,
                unlocked_at,
                progress,
                badge:badges(*)
            `
            )
            .eq('user_id', user.id);

        if (error) throw error;
        return NextResponse.json({items: data || []});
    } catch (e) {
        console.error('badges GET error', e);
        return NextResponse.json({error: 'Failed to load badges'}, {status: 500});
    }
}
