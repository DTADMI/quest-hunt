export type ActivityType =
    | 'all'
    | 'quest_completed'
    | 'quest_started'
    | 'waypoint_reached'
    | 'friend_joined'
    | 'achievement_unlocked';

export interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
}

export interface Quest {
  id: string;
  title: string;
  imageUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface BaseActivity {
  id: string;
  type: ActivityType;
  user: User;
  timestamp: string;
  isRead: boolean;
}

export interface QuestActivity extends BaseActivity {
  type: 'quest_completed' | 'quest_started';
  quest: Quest;
  xpEarned?: number;
}

export interface WaypointActivity extends BaseActivity {
  type: 'waypoint_reached';
  quest: Quest;
  waypoint: {
    id: string;
    title: string;
    order: number;
  };
}

export interface FriendJoinedActivity extends BaseActivity {
  type: 'friend_joined';
  friend: User;
}

export interface AchievementActivity extends BaseActivity {
  type: 'achievement_unlocked';
  achievement: Achievement;
}

export type Activity =
    | QuestActivity
    | WaypointActivity
    | FriendJoinedActivity
    | AchievementActivity;

export interface ActivityGroup {
  date: string;
  activities: Activity[];
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'new_activity' | 'activity_read' | 'connection_established' | 'error';
  data: any;
}

export interface ActivityNotification extends WebSocketMessage {
  type: 'new_activity';
  data: Activity;
}

export interface ConnectionEstablishedMessage extends WebSocketMessage {
  type: 'connection_established';
  data: {
    message: string;
    connectionId: string;
  };
}
