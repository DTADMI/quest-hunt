// apps/web/lib/search/quest-search.ts
import {prisma} from '@/lib/db';
import {SearchResultItem, SearchResults} from '@/types/search';

export async function searchQuests(
    query: string,
    page: number = 1,
    limit: number = 10
): Promise<SearchResults> {
    const skip = (page - 1) * limit;

    try {
        const [results, total] = await Promise.all([
            prisma.quest.findMany({
                where: {
                    OR: [
                        {title: {contains: query, mode: 'insensitive'}},
                        {description: {contains: query, mode: 'insensitive'}},
                        {tags: {hasSome: [query]}},
                    ],
                    isPublished: true,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    imageUrl: true,
                    difficulty: true,
                    duration: true,
                    location: true,
                    rating: true,
                    reviewCount: true,
                    createdAt: true,
                    updatedAt: true,
                },
                skip,
                take: limit,
                orderBy: {
                    _relevance: {
                        fields: ['title', 'description', 'tags'],
                        search: query,
                        sort: 'desc',
                    },
                },
            }),
            prisma.quest.count({
                where: {
                    OR: [
                        {title: {contains: query, mode: 'insensitive'}},
                        {description: {contains: query, mode: 'insensitive'}},
                        {tags: {hasSome: [query]}},
                    ],
                    isPublished: true,
                },
            }),
        ]);

        return {
            results: results.map((quest) => ({
                id: quest.id,
                title: quest.title,
                description: quest.description,
                imageUrl: quest.imageUrl,
                difficulty: quest.difficulty,
                duration: quest.duration,
                location: quest.location,
                rating: quest.rating,
                reviewCount: quest.reviewCount,
                type: 'quest',
            })) as SearchResultItem[],
            total,
            page,
            limit,
        };
    } catch (error) {
        console.error('Error searching quests:', error);
        throw new Error('Failed to search quests');
    }
}

export async function suggestQuests(query: string, limit: number = 5): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];

    try {
        const results = await prisma.quest.findMany({
            where: {
                OR: [
                    {title: {contains: query, mode: 'insensitive'}},
                    {description: {contains: query, mode: 'insensitive'}},
                ],
                isPublished: true,
            },
            select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
            },
            take: limit,
            orderBy: {
                _relevance: {
                    fields: ['title', 'description'],
                    search: query,
                    sort: 'desc',
                },
            },
        });

        return results.map((quest) => ({
            id: quest.id,
            title: quest.title,
            description: quest.description,
            imageUrl: quest.imageUrl,
            type: 'quest',
        })) as SearchResultItem[];
    } catch (error) {
        console.error('Error suggesting quests:', error);
        return [];
    }
}
