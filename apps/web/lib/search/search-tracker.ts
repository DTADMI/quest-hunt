// apps/web/lib/search/search-tracker.ts
import {prisma} from '@/lib/db';

export async function trackSearch(query: string, userId?: string) {
  if (!query.trim()) return;

  try {
    await prisma.$transaction(async (tx) => {
      // Update or create search query
      await tx.searchQuery.upsert({
        where: {query},
        create: {query, count: 1},
        update: {count: {increment: 1}},
      });

      // Track user search history if user is logged in
      if (userId) {
        await tx.searchHistory.upsert({
          where: {userId_query: {userId, query}},
          create: {userId, query, searchCount: 1, lastSearchedAt: new Date()},
          update: {
            searchCount: {increment: 1},
            lastSearchedAt: new Date(),
          },
        });
      }
    });
  } catch (error) {
    console.error('Error tracking search:', error);
  }
}
