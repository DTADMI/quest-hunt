import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GET as getMe, PUT as putMe} from '@/app/api/users/me/route';

// Mocks
vi.mock('@/lib/server/auth', () => ({
    requireAuth: vi.fn().mockResolvedValue({user: {id: 'user-1'}, session: {}}),
}));

const mockSelectSingle = vi.fn();
const mockUpdate = vi.fn(() => ({eq: () => ({select: () => ({single: mockSelectSingle})})}));
const mockFrom = vi.fn(() => ({
    select: () => ({eq: () => ({single: mockSelectSingle})}),
    update: mockUpdate,
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => ({
        from: mockFrom,
        auth: {getSession: vi.fn().mockResolvedValue({data: {session: {user: {id: 'user-1'}}}})}
    })
}));

describe('API /api/users/me', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns current user profile', async () => {
        mockSelectSingle.mockResolvedValueOnce({data: {id: 'user-1', username: 'alice'}, error: null});
        const res = await getMe();
        const json = await (res as Response).json();
        expect((res as Response).status).toBe(200);
        expect(json).toMatchObject({id: 'user-1', username: 'alice'});
    });

    it('updates current user profile with valid fields', async () => {
        mockSelectSingle.mockResolvedValueOnce({data: {id: 'user-1', username: 'alice'}, error: null});
        const req = new Request('http://localhost/api/users/me', {
            method: 'PUT',
            body: JSON.stringify({display_name: 'Alice'}),
        });
        const res = await putMe(req as any);
        const json = await (res as Response).json();
        expect((res as Response).status).toBe(200);
        expect(json).toMatchObject({id: 'user-1'});
        expect(mockUpdate).toHaveBeenCalled();
    });
});
