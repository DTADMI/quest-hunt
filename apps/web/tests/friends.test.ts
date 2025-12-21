import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GET as getFriends, POST as postFriend} from '@/app/api/friends/route';
import {DELETE as deleteFriend, PUT as putFriend} from '@/app/api/friends/[id]/route';

vi.mock('@/lib/server/auth', () => ({
    requireAuth: vi.fn().mockResolvedValue({user: {id: 'user-1'}, session: {}}),
}));

const mockOrder = vi.fn(() => ({
    then: () => {
    }
}));
const mockOr = vi.fn(() => ({order: mockOrder}));
const mockSelect = vi.fn(() => ({eq: vi.fn().mockReturnThis(), or: mockOr, single: vi.fn()}));
const mockInsert = vi.fn(() => ({select: () => ({single: vi.fn()})}));
const mockUpdate = vi.fn(() => ({eq: () => ({or: () => ({select: () => ({single: vi.fn()})})})}));
const mockDelete = vi.fn(() => ({eq: () => ({or: () => ({})})}));

const mockFrom = vi.fn((table: string) => {
    return {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
    } as any;
});

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => ({
        from: mockFrom,
        auth: {getSession: vi.fn().mockResolvedValue({data: {session: {user: {id: 'user-1'}}}})}
    })
}));

describe('API /api/friends', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists friends (empty ok)', async () => {
        // simulate empty response
        mockSelect.mockReturnValueOnce({or: () => ({order: () => ({data: [], error: null})})} as any);
        const res = await getFriends(new Request('http://localhost/api/friends'));
        const json = await (res as Response).json();
        expect((res as Response).status).toBe(200);
        expect(json).toMatchObject({items: []});
    });

    it('creates a friend request', async () => {
        // no existing
        mockSelect.mockReturnValueOnce({
            or: () => ({
                limit: () => ({
                    maybeSingle: () => ({
                        data: null,
                        error: null
                    })
                })
            })
        } as any);
        // insert success
        mockInsert.mockReturnValueOnce({select: () => ({single: () => ({data: {id: 'f1'}, error: null})})} as any);
        const req = new Request('http://localhost/api/friends', {
            method: 'POST',
            body: JSON.stringify({friend_id: 'user-2'})
        });
        const res = await postFriend(req as any);
        expect((res as Response).status).toBe(201);
    });
});

describe('API /api/friends/[id]', () => {
    it('accepts a friend request', async () => {
        mockUpdate.mockReturnValueOnce({
            eq: () => ({
                or: () => ({
                    select: () => ({
                        single: () => ({
                            data: {
                                id: 'f1',
                                status: 'accepted'
                            }, error: null
                        })
                    })
                })
            })
        } as any);
        const req = new Request('http://localhost/api/friends/f1?action=accept', {method: 'PUT'});
        const res = await putFriend(req as any, {params: {id: 'f1'}});
        expect((res as Response).status).toBe(200);
    });

    it('deletes a friendship', async () => {
        mockDelete.mockReturnValueOnce({eq: () => ({or: () => ({error: null})})} as any);
        const req = new Request('http://localhost/api/friends/f1', {method: 'DELETE'});
        const res = await deleteFriend(req as any, {params: {id: 'f1'}});
        expect((res as Response).status).toBe(200);
    });
});
