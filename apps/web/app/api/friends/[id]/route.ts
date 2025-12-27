import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {requireAuth} from '@/lib/server/auth';

// Manage a specific friendship/request by id (row id) or by user id via query

export async function PUT(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const {user} = await requireAuth();
        if (!user) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const supabase = createClient();
        const {searchParams} = new URL(request.url);
        const action = searchParams.get('action'); // 'accept' | 'decline'

        if (!action || !['accept', 'decline'].includes(action)) {
            return NextResponse.json({error: 'Invalid action'}, {status: 400});
        }

        const status = action === 'accept' ? 'accepted' : 'declined';
        const {data, error} = await supabase
            .from('friends')
            .update({status})
            .eq('id', id)
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
            .select('id, user_id, friend_id, status, created_at')
            .single();
        if (error) {
            throw error;
        }
        return NextResponse.json(data);
    } catch (e: any) {
        if (e?.message?.includes('relation')) {
            return NextResponse.json(
                {error: 'Friends feature not enabled (table missing)'},
                {status: 501}
            );
        }
        console.error('friends/[id] PUT error', e);
        return NextResponse.json({error: 'Failed to update friend request'}, {status: 500});
    }
}

export async function DELETE(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const {user} = await requireAuth();
        if (!user) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const supabase = createClient();
        const {error} = await supabase
            .from('friends')
            .delete()
            .eq('id', id)
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
        if (error) {
            throw error;
        }
        return NextResponse.json({ok: true});
    } catch (e: any) {
        if (e?.message?.includes('relation')) {
            return NextResponse.json(
                {error: 'Friends feature not enabled (table missing)'},
                {status: 501}
            );
        }
        console.error('friends/[id] DELETE error', e);
        return NextResponse.json({error: 'Failed to delete friendship'}, {status: 500});
    }
}
