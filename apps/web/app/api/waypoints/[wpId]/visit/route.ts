import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/server/auth';
import {visitWaypoint} from '@/lib/server/progress';
import {visitWaypointSchema} from '@/lib/server/schemas';

export async function POST(
    request: Request,
    {params}: { params: { wpId: string } }
) {
    try {
        const {user} = await requireAuth();
        if (!user) return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        const body = await request.json().catch(() => ({}));
        const parsed = visitWaypointSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({error: 'Invalid request data', details: parsed.error.issues}, {status: 400});
        }
        const res = await visitWaypoint(params.wpId, user.id, parsed.data.proof);
        return NextResponse.json(res, {status: 201});
    } catch (e) {
        console.error('Error visiting waypoint', e);
        return NextResponse.json({error: 'Failed to record visit'}, {status: 500});
    }
}
