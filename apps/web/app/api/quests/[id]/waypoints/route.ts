import {NextResponse} from 'next/server';
import {requireAuth} from '@/lib/server/auth';
import {createWaypoint, listWaypoints} from '@/lib/server/waypoints';
import {waypointCreateSchema} from '@/lib/server/schemas';

export async function GET(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const waypoints = await listWaypoints(id);
        return NextResponse.json(waypoints);
    } catch (e) {
        console.error('Error fetching waypoints', e);
        return NextResponse.json({error: 'Failed to fetch waypoints'}, {status: 500});
    }
}

export async function POST(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const {user} = await requireAuth();
        if (!user) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const body = await request.json();
        const parsed = waypointCreateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {error: 'Invalid request data', details: parsed.error.issues},
                {status: 400}
            );
        }
        const waypoint = await createWaypoint(id, parsed.data as any, user.id);
        return NextResponse.json(waypoint, {status: 201});
    } catch (e: any) {
        const status = e?.status ?? 500;
        return NextResponse.json({error: 'Failed to create waypoint'}, {status});
    }
}
