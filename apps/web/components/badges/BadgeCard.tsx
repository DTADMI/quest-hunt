import {BadgeRarity, BadgeWithProgress} from '@/types/badges';
import {cn} from '@/lib/utils';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Check, Lock} from 'lucide-react';

const rarityColors: Record<BadgeRarity, string> = {
    common: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    uncommon: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    rare: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    epic: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    legendary: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
};

const rarityBorders: Record<BadgeRarity, string> = {
    common: 'border-gray-200 dark:border-gray-700',
    uncommon: 'border-green-200 dark:border-green-800',
    rare: 'border-blue-200 dark:border-blue-800',
    epic: 'border-purple-200 dark:border-purple-800',
    legendary: 'border-amber-200 dark:border-amber-800',
};

interface BadgeCardProps {
    badge: BadgeWithProgress;
    showProgress?: boolean;
    showLock?: boolean;
    className?: string;
    onClick?: () => void;
}

export function BadgeCard({
                              badge,
                              showProgress = true,
                              showLock = true,
                              className,
                              onClick,
                          }: BadgeCardProps) {
    const isUnlocked = badge.userProgress?.isUnlocked || false;
    const progress = badge.userProgress?.progress || 0;
    const progressPercentage = Math.min(Math.round((progress / badge.criteria.threshold) * 100), 100);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            'relative group rounded-lg p-4 border flex flex-col items-center text-center transition-all',
                            'hover:shadow-md hover:-translate-y-1',
                            isUnlocked
                                ? `${rarityColors[badge.rarity]} ${rarityBorders[badge.rarity]}`
                                : 'bg-muted/50 border-border opacity-70',
                            className
                        )}
                        onClick={onClick}
                    >
                        {!isUnlocked && showLock && (
                            <div className="absolute top-2 right-2 text-muted-foreground">
                                <Lock className="h-4 w-4"/>
                            </div>
                        )}

                        <div className={cn(
                            'h-16 w-16 rounded-full flex items-center justify-center text-3xl mb-3',
                            isUnlocked
                                ? 'bg-white/20 dark:bg-black/20'
                                : 'bg-muted/30 dark:bg-muted/50',
                            !isUnlocked && 'saturate-0 opacity-70'
                        )}>
                            {badge.icon}
                        </div>

                        <h3 className={cn(
                            'font-medium mb-1',
                            !isUnlocked && 'text-muted-foreground'
                        )}>
                            {badge.name}
                        </h3>

                        <p className={cn(
                            'text-sm mb-2',
                            isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
                        )}>
                            {badge.description}
                        </p>

                        {showProgress && !isUnlocked && (
                            <div className="w-full bg-muted-foreground/10 rounded-full h-2 mt-2">
                                <div
                                    className={cn(
                                        'h-full rounded-full',
                                        {
                                            'bg-gray-400': !isUnlocked,
                                            'bg-green-500': isUnlocked,
                                        }
                                    )}
                                    style={{width: `${progressPercentage}%`}}
                                />
                            </div>
                        )}

                        {isUnlocked && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                <Check className="h-3 w-3"/>
                            </div>
                        )}
                    </div>
                </TooltipTrigger>

                <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">{badge.name}</span>
                            <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full',
                                rarityColors[badge.rarity]
                            )}>
                {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
              </span>
                        </div>
                        <p className="text-sm">{badge.description}</p>

                        {!isUnlocked ? (
                            <p className="text-xs text-muted-foreground mt-1">
                                Progress: {progress}/{badge.criteria.threshold} ({progressPercentage}%)
                            </p>
                        ) : badge.userProgress?.unlockedAt ? (
                            <p className="text-xs text-muted-foreground mt-1">
                                Unlocked on {new Date(badge.userProgress.unlockedAt).toLocaleDateString()}
                            </p>
                        ) : null}

                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {badge.points} XP
              </span>
                            <span className="text-xs text-muted-foreground">
                {isUnlocked ? 'Unlocked' : 'Locked'}
              </span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
