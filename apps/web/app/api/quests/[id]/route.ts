import {createClient} from '@/lib/supabase/server';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {requireAuth} from '@/lib/server/auth';

const questSchema = z
    .object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().max(1000).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
        start_location: z
            .object({
        type: z.literal('Point'),
                coordinates: z.tuple([z.number(), z.number()]),
            })
            .nullable()
            .optional(),
    estimated_duration_minutes: z.number().int().positive().nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    });

export async function GET(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const supabase = createClient();

        const {data: quest, error} = await supabase
            .from('quests')
            .select('*, created_by:profiles(username)')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }
        if (!quest) {
            return NextResponse.json({error: 'Quest not found'}, {status: 404});
        }

        return NextResponse.json(quest);
    } catch (error) {
        console.error('Error fetching quest:', error);
        return NextResponse.json({error: 'Failed to fetch quest'}, {status: 500});
    }
}

export async function PUT(request: Request, {params}: { params: Promise<{ id: string }> }) {
    try {
        const {id} = await params;
        const {user} = await requireAuth();

        if (!user) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }

        const body = await request.json();
        const validation = questSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {error: 'Invalid request data', details: validation.error.issues},
                {status: 400}
            );
        }

        const supabase = createClient();
        // Check if quest exists and user is the owner
        const {data: existingQuest, error: fetchError} = await supabase
            .from('quests')
            .select('created_by')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }
        if (!existingQuest) {
            return NextResponse.json({error: 'Quest not found'}, {status: 404});
        }
        if (existingQuest.created_by !== user.id) {
            return NextResponse.json({error: 'Not authorized to update this quest'}, {status: 403});
        }

        const {data: quest, error} = await supabase
            .from('quests')
            .update(validation.data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(quest);
    } catch (error) {
        console.error('Error updating quest:', error);
        return NextResponse.json({error: 'Failed to update quest'}, {status: 500});
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
        // Check if quest exists and user is the owner
        const {data: existingQuest, error: fetchError} = await supabase
            .from('quests')
            .select('created_by')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }
        if (!existingQuest) {
            return NextResponse.json({error: 'Quest not found'}, {status: 404});
        }
        if (existingQuest.created_by !== user.id) {
            return NextResponse.json({error: 'Not authorized to delete this quest'}, {status: 403});
        }

        const {error} = await supabase.from('quests').delete().eq('id', id);

        if (error) {
            throw error;
        }

        return new Response(null, {status: 204});
    } catch (error) {
        console.error('Error deleting quest:', error);
        return NextResponse.json({error: 'Failed to delete quest'}, {status: 500});
    }
}
