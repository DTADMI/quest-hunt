import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/server/auth';
import {deleteWaypoint, updateWaypoint} from '@/lib/server/waypoints';
import {waypointUpdateSchema} from '@/lib/server/schemas';

export async function PUT(
    request: Request,
    {params}: { params: Promise<{ id: string; wpId: string }> }
) {
    try {
        const {id, wpId} = await params;
        const {user} = await requireAuth();
        if (!user) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const body = await request.json();
        const parsed = waypointUpdateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {error: 'Invalid request data', details: parsed.error.issues},
                {status: 400}
            );
        }
        const wp = await updateWaypoint(id, wpId, parsed.data as any, user.id);
        return NextResponse.json(wp);
    } catch (e: any) {
        const status = e?.status ?? 500;
        return NextResponse.json({error: 'Failed to update waypoint'}, {status});
    }
}

export async function DELETE(
    request: Request,
    {params}: { params: Promise<{ id: string; wpId: string }> }
) {
    try {
        const {id, wpId} = await params;
        const {user} = await requireAuth();
        if (!user) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        await deleteWaypoint(id, wpId, user.id);
        return new Response(null, {status: 204});
    } catch (e: any) {
        const status = e?.status ?? 500;
        return NextResponse.json({error: 'Failed to delete waypoint'}, {status});
    }
}
