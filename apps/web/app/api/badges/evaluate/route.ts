import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/server/auth';
import {evaluateBadges} from '@/lib/server/badges';

export async function POST() {
    try {
        const {user} = await requireAuth();
        if (!user) return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        const res = await evaluateBadges(user.id);
        return NextResponse.json(res);
    } catch (e) {
        console.error('Error evaluating badges', e);
        return NextResponse.json({error: 'Failed to evaluate badges'}, {status: 500});
    }
}
