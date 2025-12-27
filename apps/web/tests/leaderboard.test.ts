import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GET as getLeaderboard} from '@/app/api/leaderboard/route';

vi.mock('@/lib/server/auth', () => ({
    requireAuth: vi.fn().mockResolvedValue({user: {id: 'user-1'}, session: {}}),
}));

const rows = [
    {user_id: 'u1', status: 'completed'},
    {user_id: 'u1', status: 'completed'},
    {user_id: 'u2', status: 'completed'},
];

const mockSelect = vi.fn();
const mockIn = vi.fn();
const mockFrom = vi.fn((table: string) => {
    if (table === 'quest_progress') {
        return {
            select: (cols: string) => ({
                eq: (col: string, val: string) => ({data: rows, error: null}),
            }),
        } as any;
    }
    if (table === 'profiles') {
        return {
            select: () => ({
                in: (_: string, ids: string[]) => ({
                    data: ids.map((id) => ({id, username: id})),
                    error: null,
                }),
            }),
        } as any;
    }
    return {select: mockSelect, in: mockIn} as any;
});

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => ({
        from: mockFrom,
        auth: {
            getSession: vi.fn().mockResolvedValue({data: {session: {user: {id: 'user-1'}}}}),
        },
    }),
}));

describe('API /api/leaderboard', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns aggregated leaderboard', async () => {
        const res = await getLeaderboard(new Request('http://localhost/api/leaderboard?limit=10'));
        const json = await (res as Response).json();
        expect((res as Response).status).toBe(200);
        expect(Array.isArray(json.items)).toBe(true);
        expect(json.items[0].user_id).toBe('u1');
        expect(json.items[0].completed).toBe(2);
        expect(json.items[0].rank).toBe(1);
    });
});
