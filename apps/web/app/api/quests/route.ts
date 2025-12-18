import {createRouteHandlerClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {z} from 'zod';

const questSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(1000).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('medium'),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    start_location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()])
    }).nullable().optional(),
    estimated_duration_minutes: z.number().int().positive().nullable().optional(),
});

export async function GET() {
    try {
        const supabase = createRouteHandlerClient({cookies});
        const {data: {session}} = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                {error: 'Not authenticated'},
                {status: 401}
            );
        }

        const {data: quests, error} = await supabase
            .from('quests')
            .select('*, created_by:profiles(username)')
            .order('created_at', {ascending: false});

        if (error) throw error;

        return NextResponse.json(quests);
    } catch (error) {
        console.error('Error fetching quests:', error);
        return NextResponse.json(
            {error: 'Failed to fetch quests'},
            {status: 500}
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({cookies});
        const {data: {session}} = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                {error: 'Not authenticated'},
                {status: 401}
            );
        }

        const body = await request.json();
        const validation = questSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {error: 'Invalid request data', details: validation.error.issues},
                {status: 400}
            );
        }

        const {data: quest, error} = await supabase
            .from('quests')
            .insert([
                {
                    ...validation.data,
                    created_by: session.user.id,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(quest, {status: 201});
    } catch (error) {
        console.error('Error creating quest:', error);
        return NextResponse.json(
            {error: 'Failed to create quest'},
            {status: 500}
        );
    }
}
