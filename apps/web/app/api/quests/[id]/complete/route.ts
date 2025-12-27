import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/server/auth';
import {completeQuest} from '@/lib/server/progress';

export async function POST(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const {user} = await requireAuth();
        if (!user) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const res = await completeQuest(id, user.id);
        return NextResponse.json(res);
    } catch (e) {
        console.error('Error completing quest', e);
        return NextResponse.json({error: 'Failed to complete quest'}, {status: 500});
    }
}
