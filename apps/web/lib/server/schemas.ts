import {z} from 'zod';

export const pointSchema = z
    .object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
    })
    .nullable()
    .optional();

export const questCreateSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(1000).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('medium'),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    start_location: pointSchema,
    estimated_duration_minutes: z.number().int().positive().nullable().optional(),
});

export const questUpdateSchema = z
    .object({
        title: z.string().min(3).max(100).optional(),
        description: z.string().max(1000).optional(),
        difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        start_location: pointSchema,
        estimated_duration_minutes: z.number().int().positive().nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    });

export const waypointCreateSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    order_index: z.number().int().nonnegative(),
    clue: z.string().max(1000).optional(),
    qr_code_data: z.string().max(512).optional(),
});

export const waypointUpdateSchema = waypointCreateSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
    });

export const visitWaypointSchema = z.object({
    proof: z
        .object({
            qr: z.string().optional(),
            note: z.string().max(1000).optional(),
        })
        .optional(),
});

// User profile
export const profileUpdateSchema = z
    .object({
    username: z.string().min(3).max(32).optional(),
    display_name: z.string().min(1).max(64).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(120).optional(),
    avatar_url: z.string().url().max(300).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
    });
