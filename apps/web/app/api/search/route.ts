// apps/web/app/api/search/route.ts
import {NextResponse} from 'next/server';
import {searchQuests, suggestQuests} from '@/lib/search/quest-search';
import {searchUsers, suggestUsers} from '@/lib/search/user-search';

// Main search endpoint
export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = (searchParams.get('type') as 'all' | 'quests' | 'users' | null) || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isSuggest = searchParams.get('suggest') === 'true';

    try {
        // For autocomplete/suggestions
        if (isSuggest && query.length > 0) {
            const [quests, users] = await Promise.all([
                type === 'all' || type === 'quests' ? suggestQuests(query, 3) : Promise.resolve([]),
                type === 'all' || type === 'users' ? suggestUsers(query, 3) : Promise.resolve([]),
            ]);

            return NextResponse.json({
                query,
                results: {
                    quests: {results: quests, total: quests.length, page: 1, limit: 3},
                    users: {results: users, total: users.length, page: 1, limit: 3},
                },
            });
        }

        // Full search
        const [quests, users] = await Promise.all([
            type === 'all' || type === 'quests'
                ? searchQuests(query, page, limit)
                : {results: [], total: 0, page, limit},
            type === 'all' || type === 'users'
                ? searchUsers(query, page, limit)
                : {results: [], total: 0, page, limit},
        ]);

        return NextResponse.json({
            query,
            results: {
                quests,
                users,
            },
            meta: {
                page,
                limit,
                total: quests.total + users.total,
            },
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({error: 'Failed to perform search'}, {status: 500});
    }
}
