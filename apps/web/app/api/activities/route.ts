import {NextResponse} from 'next/server';
import {verifyAuth} from '@/lib/auth';
import {Activity, ActivityType} from '@/types/activity';

// Mock data generator for development
function generateMockActivities(count: number, userId: string): Activity[] {
    const activities: Activity[] = [];
    const types: ActivityType[] = [
        'quest_completed',
        'quest_started',
        'waypoint_reached',
        'friend_joined',
        'achievement_unlocked',
    ];

    const users = [
        {id: 'user1', name: 'Alex Johnson', username: 'alexj', avatar: 'https://i.pravatar.cc/150?img=1'},
        {id: 'user2', name: 'Sam Wilson', username: 'samw', avatar: 'https://i.pravatar.cc/150?img=2'},
        {id: 'user3', name: 'Taylor Swift', username: 'taylors', avatar: 'https://i.pravatar.cc/150?img=3'},
        {id: 'user4', name: 'Jordan Lee', username: 'jordanl', avatar: 'https://i.pravatar.cc/150?img=4'},
        {id: userId, name: 'You', username: 'you', avatar: 'https://i.pravatar.cc/150?img=5'},
    ];

    const quests = [
        {id: 'quest1', title: 'Historic Downtown Tour', imageUrl: 'https://picsum.photos/seed/quest1/400/300'},
        {id: 'quest2', title: 'Mystery of the Old Library', imageUrl: 'https://picsum.photos/seed/quest2/400/300'},
        {id: 'quest3', title: 'Nature Trail Adventure', imageUrl: 'https://picsum.photos/seed/quest3/400/300'},
    ];

    const achievements = [
        {id: 'ach1', name: 'First Quest', description: 'Complete your first quest', icon: '🏆'},
        {id: 'ach2', name: 'Explorer', description: 'Visit 10 waypoints', icon: '🗺️'},
        {id: 'ach3', name: 'Social Butterfly', description: 'Add 5 friends', icon: '🦋'},
    ];

    const now = new Date();

    for (let i = 0; i < count; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
        const isRead = Math.random() > 0.5;

        const baseActivity = {
            id: `act_${i}`,
            type,
            user,
            timestamp: timestamp.toISOString(),
            isRead: user.id === userId ? true : isRead, // Always mark user's own activities as read
        };

        switch (type) {
            case 'quest_completed':
            case 'quest_started':
                activities.push({
                    ...baseActivity,
                    type,
                    quest: quests[Math.floor(Math.random() * quests.length)],
                    ...(type === 'quest_completed' && {xpEarned: Math.floor(Math.random() * 100) + 50}),
                });
                break;

            case 'waypoint_reached':
                const quest = quests[Math.floor(Math.random() * quests.length)];
                activities.push({
                    ...baseActivity,
                    type,
                    quest,
                    waypoint: {
                        id: `wp_${i}`,
                        title: `Waypoint ${Math.floor(Math.random() * 5) + 1}`,
                        order: Math.floor(Math.random() * 5) + 1,
                    },
                });
                break;

            case 'friend_joined':
                // Ensure the user is not the one who joined
                const friend = users.find(u => u.id !== userId) || users[0];
                activities.push({
                    ...baseActivity,
                    type,
                    friend,
                });
                break;

            case 'achievement_unlocked':
                activities.push({
                    ...baseActivity,
                    type,
                    achievement: achievements[Math.floor(Math.random() * achievements.length)],
                });
                break;
        }
    }

    // Sort by timestamp (newest first)
    return activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export async function GET(request: Request) {
    try {
        // Verify authentication
        const session = await verifyAuth(request);
        if (!session) {
            return new NextResponse('Unauthorized', {status: 401});
        }

        // Get query parameters
        const {searchParams} = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const type = searchParams.get('type') as ActivityType | null;

        // In a real app, you would fetch from your database here
        const allActivities = generateMockActivities(50, session.userId);

        // Filter by type if specified
        const filteredActivities = type && type !== 'all'
            ? allActivities.filter(activity => activity.type === type)
            : allActivities;

        // Paginate results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedActivities = filteredActivities.slice(0, endIndex);

        return NextResponse.json({
            activities: paginatedActivities,
            hasMore: endIndex < filteredActivities.length,
            total: filteredActivities.length,
        });

    } catch (error) {
        console.error('Error fetching activities:', error);
        return new NextResponse('Internal Server Error', {status: 500});
    }
}
