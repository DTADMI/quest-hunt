export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than a minute
    if (diffInSeconds < 60) {
        return 'just now';
    }

    // Minutes
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }

    // Hours
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }

    // Days
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }

    // Weeks
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks}w ago`;
    }

    // Months
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths}mo ago`;
    }

    // Years
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}y ago`;
}

export function groupActivitiesByDate(activities: any[]): { date: string; activities: any[] }[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = new Map<string, any[]>();

    activities.forEach((activity) => {
        const activityDate = new Date(activity.timestamp);
        activityDate.setHours(0, 0, 0, 0);

        let dateLabel: string;

        if (activityDate.getTime() === today.getTime()) {
            dateLabel = 'Today';
        } else if (activityDate.getTime() === yesterday.getTime()) {
            dateLabel = 'Yesterday';
        } else {
            dateLabel = activityDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }

        if (!groups.has(dateLabel)) {
            groups.set(dateLabel, []);
        }

        groups.get(dateLabel)?.push(activity);
    });

    return Array.from(groups.entries()).map(([date, activities]) => ({
        date,
        activities,
    }));
}
