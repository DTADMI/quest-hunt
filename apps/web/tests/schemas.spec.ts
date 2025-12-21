import {describe, expect, it} from 'vitest';
import {profileUpdateSchema, questCreateSchema, waypointCreateSchema} from '@/lib/server/schemas';

describe('Zod Schemas', () => {
    it('validates questCreateSchema', () => {
        const ok = questCreateSchema.safeParse({
            title: 'My Quest',
            description: 'A description',
            difficulty: 'medium',
            status: 'draft',
            start_location: null,
            estimated_duration_minutes: 60,
        });
        expect(ok.success).toBe(true);

        const bad = questCreateSchema.safeParse({title: 'Q'});
        expect(bad.success).toBe(false);
    });

    it('validates waypointCreateSchema', () => {
        const ok = waypointCreateSchema.safeParse({
            title: 'WP 1',
            description: 'Do something',
            location: {type: 'Point', coordinates: [10, 20]},
            order_index: 0,
        });
        expect(ok.success).toBe(true);

        const bad = waypointCreateSchema.safeParse({
            title: '',
            location: {type: 'Point', coordinates: ['x', 'y']},
            order_index: -1,
        } as any);
        expect(bad.success).toBe(false);
    });

    it('validates profileUpdateSchema partial updates', () => {
        const ok = profileUpdateSchema.safeParse({bio: 'Hello'});
        expect(ok.success).toBe(true);
        const bad = profileUpdateSchema.safeParse({});
        expect(bad.success).toBe(false);
    });
});
