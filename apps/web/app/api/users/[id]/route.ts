import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export async function GET(
    request: Request,
    {params}: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const {data, error} = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, bio, location, created_at')
            .eq('id', params.id)
            .single();
        if (error) throw error;
        if (!data) return NextResponse.json({error: 'User not found'}, {status: 404});
        return NextResponse.json(data);
    } catch (e) {
        console.error('profiles/[id] GET error', e);
        return NextResponse.json({error: 'Failed to load user'}, {status: 500});
    }
}
