import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/server/auth';
import {getBadgeStats} from '@/lib/server/badges';

export async function GET() {
    try {
        const {user} = await requireAuth();
        if (!user) return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        const stats = await getBadgeStats(user.id);
        return NextResponse.json(stats);
    } catch (e) {
        console.error('Error getting badge stats', e);
        return NextResponse.json({error: 'Failed to get badge stats'}, {status: 500});
    }
}
