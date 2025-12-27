// apps/web/app/api/search/suggest/route.ts
import {NextResponse} from 'next/server';
import {suggestQuests} from '@/lib/search/quest-search';
import {suggestUsers} from '@/lib/search/user-search';

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = (searchParams.get('type') as 'all' | 'quests' | 'users' | null) || 'all';
    const limit = parseInt(searchParams.get('limit') || '5');

    try {
        const [quests, users] = await Promise.all([
            type === 'all' || type === 'quests' ? suggestQuests(query, limit) : Promise.resolve([]),
            type === 'all' || type === 'users' ? suggestUsers(query, limit) : Promise.resolve([]),
        ]);

        return NextResponse.json({
            query,
            results: {
                quests: {results: quests, total: quests.length, page: 1, limit},
                users: {results: users, total: users.length, page: 1, limit},
            },
        });
    } catch (error) {
        console.error('Search suggest error:', error);
        return NextResponse.json({error: 'Failed to get search suggestions'}, {status: 500});
    }
}
