export type BadgeType =
    | 'quest_completion'
    | 'waypoint_milestone'
    | 'explorer'
    | 'social'
    | 'streak'
    | 'special';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Badge {
    id: string;
    name: string;
    description: string;
    type: BadgeType;
    rarity: BadgeRarity;
    icon: string;
    points: number;
    criteria: BadgeCriteria;
    hidden: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BadgeCriteria {
    type: string;
    threshold: number;
    // Additional criteria properties can be added here
    // e.g., questId for quest-specific badges
    // or waypointCount for explorer badges
    [key: string]: any;
}

export interface UserBadge {
    id: string;
    badgeId: string;
    userId: string;
    progress: number;
    isUnlocked: boolean;
    unlockedAt?: string;
    progressUpdatedAt: string;
    // Additional metadata about the badge unlock
    metadata?: Record<string, any>;
}

export interface BadgeProgressUpdate {
    userId: string;
    badgeId: string;
    progress: number;
    isUnlocked: boolean;
    metadata?: Record<string, any>;
}

export interface BadgeAward {
    userId: string;
    badgeId: string;
    awardedAt: string;
    metadata?: Record<string, any>;
}

export interface BadgeWithProgress extends Badge {
    userProgress?: UserBadge;
}

// Badge unlock events
export type BadgeUnlockEvent = {
    type: 'badge_unlocked';
    userId: string;
    badge: Badge;
    timestamp: string;
    metadata?: Record<string, any>;
};

// Event types that can trigger badge progress
export type BadgeTriggerEvent =
    | { type: 'quest_completed', questId: string, userId: string }
    | { type: 'waypoint_reached', waypointId: string, questId: string, userId: string }
    | { type: 'friend_added', userId: string, friendId: string }
    | { type: 'login_streak', userId: string, streak: number }
    | { type: 'quest_created', questId: string, userId: string };

// Badge category with badges
export interface BadgeCategory {
    id: BadgeType;
    name: string;
    description: string;
    icon: string;
    badges: BadgeWithProgress[];
    unlockedCount: number;
    totalCount: number;
}

// User badge statistics
export interface BadgeStats {
    totalBadges: number;
    unlockedBadges: number;
    lockedBadges: number;
    totalPoints: number;
    byRarity: Record<BadgeRarity, { total: number; unlocked: number }>;
    byType: Record<BadgeType, { total: number; unlocked: number }>;
    recentUnlocks: BadgeWithProgress[];
    nextClosestBadges: BadgeWithProgress[];
}

// Badge unlock toast notification
export interface BadgeUnlockToast {
    id: string;
    badge: Badge;
    timestamp: string;
    isNew: boolean;
}
