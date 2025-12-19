import {NextResponse} from 'next/server';
import {getSession} from '@/lib/server/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({user: null}, {status: 200});
        }
        return NextResponse.json({user: session.user});
    } catch (e) {
        console.error('auth/me error', e);
        return NextResponse.json({error: 'Failed to get session'}, {status: 500});
    }
}
