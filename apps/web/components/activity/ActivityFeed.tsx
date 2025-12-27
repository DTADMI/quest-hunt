'use client';

import {useCallback, useEffect, useState} from 'react';
import {Activity, ActivityType} from '@/types/activity';
import {webSocketService} from '@/lib/websocket';
import {groupActivitiesByDate} from '@/lib/date-utils';
import {ActivityItem} from './ActivityItem';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {Bell, BellOff, RefreshCw} from 'lucide-react';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useToast} from '@/components/ui/use-toast';

interface ActivityFeedProps {
  initialActivities?: Activity[];
  userId: string;
  showTabs?: boolean;
  limit?: number;
  className?: string;
}

export function ActivityFeed({
                               initialActivities = [],
                               userId,
                               showTabs = true,
                               limit,
                               className = '',
                             }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const {toast} = useToast();

  // Group activities by date
  const groupedActivities = groupActivitiesByDate(
      filter === 'all' ? activities : activities.filter((activity) => activity.type === filter)
  );

  // Fetch more activities
  const fetchMoreActivities = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/activities?page=${page + 1}&limit=${limit || 10}`);
      const data = await response.json();

      if (data.activities.length === 0) {
        setHasMore(false);
      } else {
        setActivities((prev) => [...prev, ...data.activities]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching more activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load more activities',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, hasMore, isLoading, toast]);

  // Handle new activity from WebSocket
  const handleNewActivity = useCallback(
      (message: any) => {
        if (message.type === 'new_activity' && !isPaused) {
          setActivities((prev) => [message.data, ...prev]);

          // Show notification for new activities
          if (message.data.user.id !== userId) {
            toast({
              title: 'New Activity',
              description: `${message.data.user.name} ${getActivityMessage(message.data)}`,
            });
          }
        }
      },
      [isPaused, toast, userId]
  );

  // Mark activity as read
  const markAsRead = useCallback((activityId: string) => {
    setActivities((prev) =>
        prev.map((activity) =>
            activity.id === activityId ? {...activity, isRead: true} : activity
        )
    );

    // Notify server
    webSocketService.markActivityAsRead(activityId);
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const unreadIds = activities
        .filter((activity) => !activity.isRead)
        .map((activity) => activity.id);

    if (unreadIds.length === 0) return;

    setActivities((prev) =>
        prev.map((activity) => (!activity.isRead ? {...activity, isRead: true} : activity))
    );

    // Notify server for each unread activity
    unreadIds.forEach(webSocketService.markActivityAsRead);
  }, [activities]);

  // Connect to WebSocket and set up event listeners
  useEffect(() => {
    const connect = async () => {
      let unsubscribe = () => {
      };

      try {
        await webSocketService.connect();
        setIsConnected(true);

        // Subscribe to new activities
        unsubscribe = webSocketService.subscribe('new_activity', handleNewActivity);
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to real-time updates',
          variant: 'destructive',
        });
      }

      // Return cleanup function that will be called on unmount or when dependencies change
      return () => {
        unsubscribe();
        webSocketService.disconnect();
        setIsConnected(false);
      };
    };

    connect();

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [handleNewActivity, toast]);

  // Helper function to get activity message for notifications
  function getActivityMessage(activity: Activity): string {
    switch (activity.type) {
      case 'quest_completed':
        return `completed the quest "${activity.quest.title}"`;
      case 'quest_started':
        return `started the quest "${activity.quest.title}"`;
      case 'waypoint_reached':
        return `reached a waypoint in "${activity.quest.title}"`;
      case 'friend_joined':
        return `joined QuestHunt!`;
      case 'achievement_unlocked':
        return `unlocked the achievement "${activity.achievement.name}"`;
      default:
        return 'completed an activity';
    }
  }

  // Filter activities based on the current tab
  const filteredActivities = activities.filter(
      (activity) => filter === 'all' || activity.type === filter
  );

  // Check if there are unread activities
  const hasUnread = filteredActivities.some((activity) => !activity.isRead);

  return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Activity Feed</h2>
          <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? 'Resume updates' : 'Pause updates'}
            >
              {isPaused ? (
                  <BellOff className="h-5 w-5"/>
              ) : (
                  <Bell className={`h-5 w-5 ${hasUnread ? 'text-blue-500 fill-blue-500' : ''}`}/>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={!hasUnread}>
              Mark all as read
            </Button>
          </div>
        </div>

        {showTabs && (
            <Tabs
                defaultValue="all"
                className="mb-4"
                onValueChange={(value: ActivityType) => setFilter(value)}
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="quest_completed">Quests</TabsTrigger>
                <TabsTrigger value="waypoint_reached">Waypoints</TabsTrigger>
                <TabsTrigger value="achievement_unlocked">Achievements</TabsTrigger>
                <TabsTrigger value="friend_joined">Friends</TabsTrigger>
              </TabsList>
            </Tabs>
        )}

        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-6">
            {groupedActivities.length > 0 ? (
                groupedActivities.map((group, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">{group.date}</h3>
                      <div className="space-y-3">
                        {group.activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} onMarkAsRead={markAsRead}/>
                        ))}
                      </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No activities found</p>
                  <p className="text-sm mt-1">
                    {filter === 'all'
                        ? 'Start completing quests to see activities here!'
                        : `No ${filter.replace('_', ' ')} activities found`}
                  </p>
                </div>
            )}

            {isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2 p-4">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full"/>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]"/>
                            <Skeleton className="h-3 w-[200px]"/>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {hasMore && !isLoading && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={fetchMoreActivities} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}/>
                    Load More
                  </Button>
                </div>
            )}
          </div>
        </ScrollArea>

        {!isConnected && (
            <div
                className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
              <p>Disconnected from real-time updates. Trying to reconnect...</p>
            </div>
        )}
      </div>
  );
}
