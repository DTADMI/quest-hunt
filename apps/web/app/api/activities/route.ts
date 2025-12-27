import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {requireAuth} from '@/lib/server/auth';
import {Activity, ActivityType} from '@/types/activity';

export async function GET(request: Request) {
  try {
    const {user} = await requireAuth();
    if (!user) return new NextResponse('Unauthorized', {status: 401});

    const supabase = createClient();
    const {searchParams} = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') as ActivityType | null;

    let query = supabase
        .from('activities')
        .select(
            `
                id,
                type,
                data,
                created_at,
                user:profiles!user_id (id, username, display_name, avatar_url)
            `
        )
        .order('created_at', {ascending: false});

    if (type && (type as string) !== 'all') {
      query = query.eq('type', type);
    }

    const offset = (page - 1) * limit;
    const {data: dbActivities, error, count} = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    // Transform DB data to Activity type
    const activities: Activity[] = (dbActivities || []).map((act: any) => {
      const baseActivity = {
        id: act.id,
        type: act.type as ActivityType,
        user: {
          id: act.user.id,
          name: act.user.display_name || act.user.username,
          username: act.user.username,
          avatar: act.user.avatar_url,
        },
        timestamp: act.created_at,
        isRead: true, // DB doesn't track isRead yet in this schema
      };

      // Map data field to specific activity properties
      switch (act.type) {
        case 'quest_completed':
        case 'quest_started':
          return {
            ...baseActivity,
            quest: act.data.quest,
            xpEarned: act.data.xpEarned,
          } as any;
        case 'waypoint_reached':
          return {
            ...baseActivity,
            quest: act.data.quest,
            waypoint: act.data.waypoint,
          } as any;
        case 'friend_joined':
          return {
            ...baseActivity,
            friend: act.data.friend,
          } as any;
        case 'achievement_unlocked':
          return {
            ...baseActivity,
            achievement: act.data.achievement,
          } as any;
        default:
          return baseActivity as any;
      }
    });

    return NextResponse.json({
      activities,
      hasMore: (dbActivities?.length || 0) === limit,
      total: count || 0,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return new NextResponse('Internal Server Error', {status: 500});
  }
}
