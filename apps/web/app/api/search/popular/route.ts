// apps/web/app/api/search/popular/route.ts
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';

export async function GET() {
  try {
    // Get popular quests based on views and completion count
    const popularQuests = await prisma.quest.findMany({
      where: {isPublished: true},
      orderBy: [{views: 'desc'}, {completions: {_count: 'desc'}}],
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    // Get trending searches (you might want to implement this with a separate table)
    const trendingSearches = await prisma.searchQuery.findMany({
      orderBy: {count: 'desc'},
      take: 5,
      select: {
        query: true,
        count: true,
      },
    });

    return NextResponse.json({
      popularQuests,
      trendingSearches,
    });
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    return NextResponse.json({error: 'Failed to fetch popular searches'}, {status: 500});
  }
}
