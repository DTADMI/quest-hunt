import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/server/auth';
import {startQuest} from '@/lib/server/progress';

export async function POST(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const {user} = await requireAuth();
        if (!user) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const res = await startQuest(id, user.id);
        return NextResponse.json(res, {status: 201});
    } catch (e) {
        console.error('Error starting quest', e);
        return NextResponse.json({error: 'Failed to start quest'}, {status: 500});
    }
}
