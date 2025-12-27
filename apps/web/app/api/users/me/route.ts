import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {requireAuth} from '@/lib/server/auth';
import {profileUpdateSchema} from '@/lib/server/schemas';

export async function GET() {
    try {
        const {user} = await requireAuth();
        if (!user) return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        const supabase = createClient();
        const {data, error} = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, bio, location, created_at, updated_at')
            .eq('id', user.id)
            .single();
        if (error) throw error;
        return NextResponse.json(data ?? null);
    } catch (e) {
        console.error('profiles/me GET error', e);
        return NextResponse.json({error: 'Failed to load profile'}, {status: 500});
    }
}

export async function PUT(request: Request) {
    try {
        const {user} = await requireAuth();
        if (!user) return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        const body = await request.json().catch(() => ({}));
        const parsed = profileUpdateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {error: 'Invalid request data', details: parsed.error.issues},
                {status: 400}
            );
        }
        const supabase = createClient();
        const {data, error} = await supabase
            .from('profiles')
            .update({...parsed.data, updated_at: new Date().toISOString()})
            .eq('id', user.id)
            .select('id, username, display_name, avatar_url, bio, location, created_at, updated_at')
            .single();
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e) {
        console.error('profiles/me PUT error', e);
        return NextResponse.json({error: 'Failed to update profile'}, {status: 500});
    }
}
