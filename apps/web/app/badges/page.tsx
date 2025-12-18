'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {BadgeRarity, BadgeStats, BadgeWithProgress} from '@/types/badges';
import {badgeService} from '@/lib/badge-service';
import {BadgeCard} from '@/components/badges/BadgeCard';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {Award, Check, Filter, Sparkles, Trophy, Zap} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Badge} from '@/components/ui/badge';
import {useAuth} from '@/hooks/use-auth';
// Dropdown components
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {Input} from '@/components/ui/input';

const rarityOrder: Record<BadgeRarity, number> = {
    common: 0,
    uncommon: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
};

const rarityLabels: Record<BadgeRarity, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
};

type BadgeFilter = 'all' | 'unlocked' | 'locked' | BadgeRarity;

export default function BadgesPage() {
    const router = useRouter();
    const {user, isLoading: isAuthLoading} = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
    const [stats, setStats] = useState<BadgeStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<BadgeFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch badges and stats
    useEffect(() => {
        if (!user?.id) return;

        const loadData = async () => {
            try {
                setIsLoading(true);

                // In a real app, you would fetch badges with user progress
                const [allBadges, badgeStats] = await Promise.all([
                    badgeService.getBadges(),
                    badgeService.getBadgeStats(user.id),
                ]);

                // Get user progress for each badge
                const badgesWithProgress = await Promise.all(
                    allBadges.map(badge =>
                        badgeService.getBadgeWithProgress(user.id, badge.id)
                    )
                );

                setBadges(badgesWithProgress.filter((b): b is BadgeWithProgress => b !== null));
                setStats(badgeStats);
            } catch (error) {
                console.error('Error loading badges:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user?.id]);

    // Filter badges based on active tab and search query
    const filteredBadges = badges.filter(badge => {
        // Filter by tab
        if (activeTab !== 'all' && badge.type !== activeTab) {
            return false;
        }

        // Filter by search query
        if (searchQuery && !badge.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !badge.description.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Filter by badge status or rarity
        if (filter === 'unlocked' && !badge.userProgress?.isUnlocked) {
            return false;
        }

        if (filter === 'locked' && badge.userProgress?.isUnlocked) {
            return false;
        }

        if (['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(filter) &&
            badge.rarity !== filter) {
            return false;
        }

        return true;
    });

    // Group badges by category for the "All" tab
    const badgesByCategory = filteredBadges.reduce<Record<string, BadgeWithProgress[]>>((acc, badge) => {
        if (!acc[badge.type]) {
            acc[badge.type] = [];
        }
        acc[badge.type].push(badge);
        return acc;
    }, {});

    // Sort badges by rarity (legendary first) and then by name
    const sortBadges = (a: BadgeWithProgress, b: BadgeWithProgress) => {
        // Sort by unlocked status first
        if (a.userProgress?.isUnlocked !== b.userProgress?.isUnlocked) {
            return a.userProgress?.isUnlocked ? -1 : 1;
        }

        // Then by rarity
        if (rarityOrder[b.rarity] !== rarityOrder[a.rarity]) {
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        }

        // Finally by name
        return a.name.localeCompare(b.name);
    };

    const categoryLabels: Record<string, string> = {
        all: 'All Badges',
        quest_completion: 'Quest Completion',
        waypoint_milestone: 'Waypoint Milestones',
        explorer: 'Exploration',
        social: 'Social',
        streak: 'Streaks',
        special: 'Special',
    };

    const categoryIcons: Record<string, React.ReactNode> = {
        all: <Trophy className="h-4 w-4"/>,
        quest_completion: <Award className="h-4 w-4"/>,
        waypoint_milestone: <MapPin className="h-4 w-4"/>,
        explorer: <Compass className="h-4 w-4"/>,
        social: <Users className="h-4 w-4"/>,
        streak: <Zap className="h-4 w-4"/>,
        special: <Sparkles className="h-4 w-4"/>,
    };

    if (isAuthLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Achievements</h1>
                <p className="text-muted-foreground">
                    Track your progress and unlock new badges by completing quests and challenges.
                </p>
            </div>

            {/* Stats Summary */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card rounded-lg p-4 border">
                        <div className="text-3xl font-bold">{stats.unlockedBadges}</div>
                        <div className="text-sm text-muted-foreground">Unlocked</div>
                    </div>
                    <div className="bg-card rounded-lg p-4 border">
                        <div className="text-3xl font-bold">{stats.lockedBadges}</div>
                        <div className="text-sm text-muted-foreground">Locked</div>
                    </div>
                    <div className="bg-card rounded-lg p-4 border">
                        <div className="text-3xl font-bold">{stats.totalPoints}</div>
                        <div className="text-sm text-muted-foreground">Total XP</div>
                    </div>
                    <div className="bg-card rounded-lg p-4 border">
                        <div className="text-3xl font-bold">
                            {Math.round((stats.unlockedBadges / stats.totalBadges) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Completion</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <Tabs
                defaultValue="all"
                className="w-full"
                onValueChange={setActiveTab}
                value={activeTab}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7">
                        {Object.entries(categoryLabels).map(([key, label]) => (
                            <TabsTrigger
                                key={key}
                                value={key}
                                className="flex items-center gap-1.5"
                            >
                                {categoryIcons[key]}
                                <span className="hidden sm:inline">{label.split(' ')[0]}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                            <Input
                                type="search"
                                placeholder="Search badges..."
                                className="pl-9 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10">
                                    <Filter className="h-4 w-4 mr-2"/>
                                    <span className="hidden sm:inline">Filter</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuCheckboxItem
                                    checked={filter === 'all'}
                                    onCheckedChange={() => setFilter('all')}
                                >
                                    All Badges
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filter === 'unlocked'}
                                    onCheckedChange={() => setFilter('unlocked')}
                                >
                                    Unlocked
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filter === 'locked'}
                                    onCheckedChange={() => setFilter('locked')}
                                >
                                    Locked
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuLabel>By Rarity</DropdownMenuLabel>
                                {Object.entries(rarityLabels).map(([rarity, label]) => (
                                    <DropdownMenuCheckboxItem
                                        key={rarity}
                                        checked={filter === rarity}
                                        onCheckedChange={() => setFilter(rarity as BadgeRarity)}
                                        className="capitalize"
                                    >
                                        {label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Loading state */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-48 rounded-lg"/>
                        ))}
                    </div>
                ) : (
                    // Tabs content
                    <>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                            <TabsContent key={key} value={key} className="mt-0">
                                {key === 'all' ? (
                                    // For the "All" tab, show categories
                                    <div className="space-y-8">
                                        {Object.entries(badgesByCategory)
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .map(([category, categoryBadges]) => (
                                                <div key={category} className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        {categoryIcons[category]}
                                                        <h2 className="text-xl font-semibold">
                                                            {categoryLabels[category] || category.replace('_', ' ')}
                                                        </h2>
                                                        <Badge variant="outline" className="ml-2">
                                                            {categoryBadges.filter(b => b.userProgress?.isUnlocked).length} / {categoryBadges.length}
                                                        </Badge>
                                                    </div>

                                                    <div
                                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                        {categoryBadges.sort(sortBadges).map((badge) => (
                                                            <BadgeCard
                                                                key={badge.id}
                                                                badge={badge}
                                                                showProgress={!badge.userProgress?.isUnlocked}
                                                                showLock={!badge.userProgress?.isUnlocked}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ) : (
                                    // For category tabs, show all badges in that category
                                    <div
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {filteredBadges.length > 0 ? (
                                            filteredBadges.sort(sortBadges).map((badge) => (
                                                <BadgeCard
                                                    key={badge.id}
                                                    badge={badge}
                                                    showProgress={!badge.userProgress?.isUnlocked}
                                                    showLock={!badge.userProgress?.isUnlocked}
                                                />
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                                <p>No badges found</p>
                                                <p className="text-sm mt-1">
                                                    {filter !== 'all' ? `Try changing your filters` : 'Complete quests to unlock more badges'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </>
                )}
            </Tabs>

            {/* Rarity Legend */}
            <div className="mt-12 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Badge Rarities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(rarityLabels).map(([rarity, label]) => (
                        <div
                            key={rarity}
                            className={cn(
                                'p-4 rounded-lg border flex items-center gap-3',
                                rarity === 'common' && 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800',
                                rarity === 'uncommon' && 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50',
                                rarity === 'rare' && 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50',
                                rarity === 'epic' && 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50',
                                rarity === 'legendary' && 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50',
                            )}
                        >
                            <div className={cn(
                                'h-10 w-10 rounded-full flex items-center justify-center text-xl',
                                rarity === 'common' && 'bg-gray-200 dark:bg-gray-700',
                                rarity === 'uncommon' && 'bg-green-200 dark:bg-green-800/50',
                                rarity === 'rare' && 'bg-blue-200 dark:bg-blue-800/50',
                                rarity === 'epic' && 'bg-purple-200 dark:bg-purple-800/50',
                                rarity === 'legendary' && 'bg-amber-200 dark:bg-amber-800/50',
                            )}>
                                {rarity === 'common' && '★'}
                                {rarity === 'uncommon' && '★★'}
                                {rarity === 'rare' && '★★★'}
                                {rarity === 'epic' && '✧✦✧'}
                                {rarity === 'legendary' && '✧✧✧'}
                            </div>
                            <div>
                                <div className="font-medium">{label}</div>
                                <div className="text-sm text-muted-foreground">
                                    {stats?.byRarity[rarity as BadgeRarity]?.unlocked || 0} / {stats?.byRarity[rarity as BadgeRarity]?.total || 0} unlocked
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Missing icon components
function Compass(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
        </svg>
    );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    );
}

function MapPin(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
        </svg>
    );
}

function Search(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
        </svg>
    );
}

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = DropdownMenuPrimitive.Content;
const DropdownMenuLabel = DropdownMenuPrimitive.Label;
const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

function DropdownMenuCheckboxItem({
                                      children,
                                      checked,
                                      onCheckedChange,
                                      className,
                                      ...props
                                  }: {
    children: React.ReactNode;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
} & React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            checked={checked}
            onCheckedChange={onCheckedChange}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
            {...props}
        >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4"/>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    );
}
