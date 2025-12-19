import {NextResponse} from 'next/server';
import {listBadges} from '@/lib/server/badges';

export async function GET() {
    try {
        const badges = await listBadges();
        return NextResponse.json(badges);
    } catch (e) {
        console.error('Error listing badges', e);
        return NextResponse.json({error: 'Failed to list badges'}, {status: 500});
    }
}
