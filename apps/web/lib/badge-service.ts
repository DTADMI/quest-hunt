import {
  Badge,
  BadgeProgressUpdate,
  BadgeStats,
  BadgeTriggerEvent,
  BadgeUnlockEvent,
  BadgeWithProgress,
  UserBadge
} from '@/types/badges';
import {webSocketService} from './websocket';

// Mock data for development
const MOCK_BADGES: Badge[] = [
    {
        id: 'quest_first_complete',
        name: 'First Quest',
        description: 'Complete your first quest',
        type: 'quest_completion',
        rarity: 'common',
        icon: '🏆',
        points: 10,
        criteria: {type: 'quest_completed', threshold: 1},
        hidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'explorer_10_waypoints',
        name: 'Explorer',
        description: 'Visit 10 waypoints',
        type: 'explorer',
        rarity: 'uncommon',
        icon: '🗺️',
        points: 25,
        criteria: {type: 'waypoint_reached', threshold: 10},
        hidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Add 5 friends',
        type: 'social',
        rarity: 'rare',
        icon: '🦋',
        points: 50,
        criteria: {type: 'friend_added', threshold: 5},
        hidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    // Add more badges as needed
];

class BadgeService {
    private static instance: BadgeService;
    private userBadges: Map<string, UserBadge> = new Map();
    private badges: Map<string, Badge> = new Map();

    private constructor() {
        // Initialize with mock data
        MOCK_BADGES.forEach(badge => this.badges.set(badge.id, badge));
        this.loadUserBadges();
    }

    public static getInstance(): BadgeService {
        if (!BadgeService.instance) {
            BadgeService.instance = new BadgeService();
        }
        return BadgeService.instance;
    }

    public async getBadges(): Promise<Badge[]> {
        return Array.from(this.badges.values());
    }

    public async getUserBadges(userId: string): Promise<UserBadge[]> {
        return Array.from(this.userBadges.values()).filter(b => b.userId === userId);
    }

    public async getBadgeWithProgress(userId: string, badgeId: string): Promise<BadgeWithProgress | null> {
        const badge = this.badges.get(badgeId);
        if (!badge) return null;

        const userBadge = this.userBadges.get(badgeId) || {
            id: `temp_${userId}_${badgeId}`,
            badgeId,
            userId,
            progress: 0,
            isUnlocked: false,
            progressUpdatedAt: new Date().toISOString(),
        };

        return {...badge, userProgress: userBadge};
    }

    public async getBadgeStats(userId: string): Promise<BadgeStats> {
        const badges = await this.getBadges();
        const userBadges = await this.getUserBadges(userId);
        const unlockedBadges = userBadges.filter(b => b.isUnlocked);

        const byRarity: Record<string, { total: number; unlocked: number }> = {
            common: {total: 0, unlocked: 0},
            uncommon: {total: 0, unlocked: 0},
            rare: {total: 0, unlocked: 0},
            epic: {total: 0, unlocked: 0},
            legendary: {total: 0, unlocked: 0},
        };

        const byType: Record<string, { total: number; unlocked: number }> = {};

        // Initialize badge types
        const badgeTypes = ['quest_completion', 'waypoint_milestone', 'explorer', 'social', 'streak', 'special'];
        badgeTypes.forEach(type => {
            byType[type] = {total: 0, unlocked: 0};
        });

        // Count badges by rarity and type
        for (const badge of badges) {
            byRarity[badge.rarity].total++;
            byType[badge.type].total++;

            const userBadge = userBadges.find(b => b.badgeId === badge.id);
            if (userBadge?.isUnlocked) {
                byRarity[badge.rarity].unlocked++;
                byType[badge.type].unlocked++;
            }
        }

        // Get recent unlocks (last 5)
        const recentUnlocks = await Promise.all(
            unlockedBadges
                .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))
                .slice(0, 5)
                .map(badge => this.getBadgeWithProgress(userId, badge.badgeId))
        );

        // Get closest to unlocking (top 5)
        const closestToUnlock = await Promise.all(
            badges
                .filter(badge => {
                    const userBadge = userBadges.find(b => b.badgeId === badge.id);
                    return !userBadge?.isUnlocked;
                })
                .map(async badge => {
                    const withProgress = await this.getBadgeWithProgress(userId, badge.id);
                    return withProgress!;
                })
        );

        closestToUnlock.sort((a, b) => {
            const progressA = (a.userProgress?.progress || 0) / a.criteria.threshold;
            const progressB = (b.userProgress?.progress || 0) / b.criteria.threshold;
            return progressB - progressA;
        });

        return {
            totalBadges: badges.length,
            unlockedBadges: unlockedBadges.length,
            lockedBadges: badges.length - unlockedBadges.length,
            totalPoints: unlockedBadges.reduce((sum, badge) => {
                const badgeData = this.badges.get(badge.badgeId);
                return sum + (badgeData?.points || 0);
            }, 0),
            byRarity,
            byType,
            recentUnlocks: recentUnlocks.filter((b): b is BadgeWithProgress => b !== null),
            nextClosestBadges: closestToUnlock.slice(0, 5).filter((b): b is BadgeWithProgress => b !== null),
        };
    }

    public async processEvent(event: BadgeTriggerEvent): Promise<BadgeUnlockEvent[]> {
        const unlockedBadges: BadgeUnlockEvent[] = [];
        const badges = await this.getBadges();

        for (const badge of badges) {
            if (badge.criteria.type === event.type) {
                const userBadge = await this.updateBadgeProgress({
                    userId: event.userId,
                    badgeId: badge.id,
                    progress: 1, // Increment by 1 for each event
                    isUnlocked: false, // This will be determined by the update function
                });

                if (userBadge.isUnlocked && !userBadge.unlockedAt) {
                    // This is a new unlock
                    const unlockEvent: BadgeUnlockEvent = {
                        type: 'badge_unlocked',
                        userId: event.userId,
                        badge,
                        timestamp: new Date().toISOString(),
                        metadata: {...event},
                    };

                    // Notify via WebSocket
                    webSocketService.sendMessage({
                        type: 'badge_unlocked',
                        data: unlockEvent,
                    });

                    unlockedBadges.push(unlockEvent);
                }
            }
        }

        return unlockedBadges;
    }

    // Admin functions
    public async createBadge(badge: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Badge> {
        const newBadge: Badge = {
            ...badge,
            id: `badge_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.badges.set(newBadge.id, newBadge);
        return newBadge;
    }

    public async updateBadge(id: string, updates: Partial<Omit<Badge, 'id' | 'createdAt'>>): Promise<Badge | null> {
        const badge = this.badges.get(id);
        if (!badge) return null;

        const updatedBadge: Badge = {
            ...badge,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        this.badges.set(id, updatedBadge);
        return updatedBadge;
    }

    public async deleteBadge(id: string): Promise<boolean> {
        return this.badges.delete(id);
    }

    private async loadUserBadges() {
        // In a real app, this would fetch from your API
        const mockUserBadges: UserBadge[] = [];
        this.userBadges = new Map(mockUserBadges.map(badge => [badge.badgeId, badge]));
    }

    private async updateBadgeProgress(update: BadgeProgressUpdate): Promise<UserBadge> {
        const badge = this.badges.get(update.badgeId);
        if (!badge) {
            throw new Error(`Badge ${update.badgeId} not found`);
        }

        const now = new Date().toISOString();
        const existingBadge = this.userBadges.get(update.badgeId);

        // Calculate new progress
        const currentProgress = existingBadge?.progress || 0;
        const newProgress = currentProgress + update.progress;
        const threshold = badge.criteria.threshold;
        const isUnlocked = newProgress >= threshold || existingBadge?.isUnlocked === true;

        const updatedBadge: UserBadge = {
            ...(existingBadge || {
                id: `ub_${update.userId}_${update.badgeId}`,
                badgeId: update.badgeId,
                userId: update.userId,
            }),
            progress: Math.min(newProgress, threshold),
            isUnlocked,
            progressUpdatedAt: now,
            ...(isUnlocked && !existingBadge?.unlockedAt ? {unlockedAt: now} : {}),
            metadata: {
                ...existingBadge?.metadata,
                ...update.metadata,
            },
        };

        // In a real app, this would save to your database
        this.userBadges.set(update.badgeId, updatedBadge);

        return updatedBadge;
    }
}

export const badgeService = BadgeService.getInstance();
