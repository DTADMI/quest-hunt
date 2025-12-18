import {Activity} from '@/types/activity';
import {formatRelativeTime} from '@/lib/date-utils';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {CheckCircle, MapPin, Trophy, Users, Zap} from 'lucide-react';
import Link from 'next/link';

interface ActivityItemProps {
    activity: Activity;
    onMarkAsRead?: (activityId: string) => void;
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'quest_completed':
            return <Trophy className="h-5 w-5 text-yellow-500"/>;
        case 'quest_started':
            return <Zap className="h-5 w-5 text-blue-500"/>;
        case 'waypoint_reached':
            return <MapPin className="h-5 w-5 text-green-500"/>;
        case 'friend_joined':
            return <Users className="h-5 w-5 text-purple-500"/>;
        case 'achievement_unlocked':
            return <Trophy className="h-5 w-5 text-amber-500"/>;
        default:
            return <div className="h-5 w-5 rounded-full bg-gray-200"/>;
    }
};

const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
        case 'quest_completed':
            return `completed the quest "${activity.quest.title}"`;
        case 'quest_started':
            return `started the quest "${activity.quest.title}"`;
        case 'waypoint_reached':
            return `reached waypoint ${activity.waypoint.order} in "${activity.quest.title}"`;
        case 'friend_joined':
            return `joined QuestHunt! Welcome ${activity.friend.name}!`;
        case 'achievement_unlocked':
            return `unlocked the achievement "${activity.achievement.name}"`;
        default:
            return 'completed an activity';
    }
};

export function ActivityItem({activity, onMarkAsRead}: ActivityItemProps) {
    const handleMarkAsRead = () => {
        if (onMarkAsRead && !activity.isRead) {
            onMarkAsRead(activity.id);
        }
    };

    return (
        <Card
            className={`relative overflow-hidden transition-all hover:shadow-md ${
                !activity.isRead ? 'border-l-4 border-l-blue-500' : ''
            }`}
            onClick={handleMarkAsRead}
        >
            <CardContent className="p-4 flex items-start gap-3">
                <div className="relative">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={activity.user.avatar} alt={activity.user.name}/>
                        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                        {getActivityIcon(activity.type)}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{activity.user.name}</span>
                            <span className="text-muted-foreground text-xs">
                {formatRelativeTime(activity.timestamp)}
              </span>
                        </div>
                        {!activity.isRead && (
                            <Badge variant="outline" className="text-xs">
                                New
                            </Badge>
                        )}
                    </div>

                    <p className="mt-1">
                        {getActivityMessage(activity)}
                    </p>

                    {(activity.type === 'quest_completed' || activity.type === 'quest_started' || activity.type === 'waypoint_reached') && (
                        <div className="mt-2">
                            <Link href={`/quests/${activity.quest.id}`}>
                                <Card className="p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        {activity.quest.imageUrl && (
                                            <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                                                <img
                                                    src={activity.quest.imageUrl}
                                                    alt={activity.quest.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h4 className="font-medium truncate">{activity.quest.title}</h4>
                                            {activity.type === 'quest_completed' && 'xpEarned' in activity && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <span>+{activity.xpEarned} XP</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    )}

                    {activity.type === 'achievement_unlocked' && (
                        <div className="mt-2">
                            <Card
                                className="p-3 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                                        <Trophy className="h-6 w-6 text-amber-500"/>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{activity.achievement.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.achievement.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </CardContent>

            {!activity.isRead && (
                <div className="absolute top-2 right-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead();
                        }}
                    >
                        <CheckCircle className="h-4 w-4"/>
                    </Button>
                </div>
            )}
        </Card>
    );
}
