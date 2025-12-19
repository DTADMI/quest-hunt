// apps/web/lib/search/user-search.ts
import {prisma} from '@/lib/db';
import {SearchResultItem, SearchResults} from '@/types/search';

export async function searchUsers(
    query: string,
    page: number = 1,
    limit: number = 10
): Promise<SearchResults> {
    const skip = (page - 1) * limit;

    try {
        const [results, total] = await Promise.all([
            prisma.user.findMany({
                where: {
                    OR: [
                        {name: {contains: query, mode: 'insensitive'}},
                        {username: {contains: query, mode: 'insensitive'}},
                        {bio: {contains: query, mode: 'insensitive'}},
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                    bio: true,
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                            quests: {where: {isPublished: true}},
                        },
                    },
                },
                skip,
                take: limit,
            }),
            prisma.user.count({
                where: {
                    OR: [
                        {name: {contains: query, mode: 'insensitive'}},
                        {username: {contains: query, mode: 'insensitive'}},
                        {bio: {contains: query, mode: 'insensitive'}},
                    ],
                },
            }),
        ]);

        return {
            results: results.map(user => ({
                id: user.id,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,
                followersCount: user._count.followers,
                followingCount: user._count.following,
                questsCount: user._count.quests,
                type: 'user',
            })) as SearchResultItem[],
            total,
            page,
            limit,
        };
    } catch (error) {
        console.error('Error searching users:', error);
        throw new Error('Failed to search users');
    }
}

export async function suggestUsers(query: string, limit: number = 5): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];

    try {
        const results = await prisma.user.findMany({
            where: {
                OR: [
                    {name: {contains: query, mode: 'insensitive'}},
                    {username: {contains: query, mode: 'insensitive'}},
                ],
            },
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                bio: true,
            },
            take: limit,
        });

        return results.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            type: 'user',
        })) as SearchResultItem[];
    } catch (error) {
        console.error('Error suggesting users:', error);
        return [];
    }
}