import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {requireAuth} from '@/lib/server/auth';

// Minimal Friends API (MVP)
// Tables expected (Supabase):
// friends: { id uuid pk, user_id uuid, friend_id uuid, status text ('pending'|'accepted'|'declined'), created_at timestamptz }

export async function GET(request: Request) {
    try {
        const {user} = await requireAuth();
        if (!user) return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        const supabase = createClient();

        // Get accepted friends and pending requests involving the user
        const {data, error} = await supabase
            .from('friends')
            .select('id, user_id, friend_id, status, created_at')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
            .order('created_at', {ascending: false});

        if (error) throw error;
        return NextResponse.json({items: data ?? []});
    } catch (e: any) {
        // If table missing or RLS prevents read, return empty list for MVP resilience
        if (e?.message?.includes('relation') || e?.message?.includes('permission')) {
            return NextResponse.json({items: []});
        }
        console.error('friends GET error', e);
        return NextResponse.json({error: 'Failed to load friends'}, {status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const {user} = await requireAuth();
        if (!user) return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        const body = await request.json().catch(() => ({}));
        const friend_id = body?.friend_id as string | undefined;
        if (!friend_id || typeof friend_id !== 'string') {
            return NextResponse.json({error: 'friend_id is required'}, {status: 400});
        }
        if (friend_id === user.id) {
            return NextResponse.json({error: 'Cannot friend yourself'}, {status: 400});
        }

        const supabase = createClient();

        // Prevent duplicates
        const {data: existing, error: checkErr} = await supabase
            .from('friends')
            .select('id, status')
            .or(`and(user_id.eq.${user.id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user.id})`)
            .limit(1)
            .maybeSingle();
        if (checkErr) throw checkErr;
        if (existing) {
            return NextResponse.json({error: 'Friend request already exists', status: existing.status}, {status: 409});
        }

        const {data, error} = await supabase
            .from('friends')
            .insert({user_id: user.id, friend_id, status: 'pending'})
            .select('id, user_id, friend_id, status, created_at')
            .single();
        if (error) throw error;
        return NextResponse.json(data, {status: 201});
    } catch (e: any) {
        if (e?.message?.includes('relation')) {
            // Table not present yet
            return NextResponse.json({error: 'Friends feature not enabled (table missing)'}, {status: 501});
        }
        console.error('friends POST error', e);
        return NextResponse.json({error: 'Failed to create friend request'}, {status: 500});
    }
}
