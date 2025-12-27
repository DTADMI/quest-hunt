'use client';

import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {useDebounce} from 'use-debounce';
import {Search} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {QuestList} from '@/components/quests/quest-list';

// Types
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface Quest {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    distance: number;
    duration: number; // in minutes
    rating: number;
    reviewCount: number;
    location: string;
    imageUrl: string;
    status: Status;
    tags: string[];
}

// Mock data generator
const generateMockQuests = (count: number): Quest[] => {
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'extreme'];
    const statuses: Status[] = ['upcoming', 'ongoing', 'completed'];
    const tags = ['Adventure', 'Nature', 'City', 'History', 'Mystery', 'Scavenger'];

    return Array.from({length: count}, (_, i) => ({
        id: `quest-${i + 1}`,
        title: `Epic Quest ${i + 1}`,
        description: `An amazing adventure that will test your skills and reward your courage.`,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        distance: Math.floor(Math.random() * 20) + 1,
        duration: Math.floor(Math.random() * 240) + 30,
        rating: Number((Math.random() * 3 + 2).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 100),
        location: ['Downtown', 'Mountains', 'Forest', 'Beach', 'City Center'][
            Math.floor(Math.random() * 5)
            ],
        imageUrl: `https://picsum.photos/seed/quest-${i + 1}/600/400`,
        status: statuses[Math.floor(Math.random() * statuses.length)] as Status,
        tags: Array.from(
            {length: Math.floor(Math.random() * 3) + 1},
            () => tags[Math.floor(Math.random() * tags.length)]
        ).filter((v, i, a) => a.indexOf(v) === i),
    }));
};

const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    hard: 'bg-yellow-100 text-yellow-800',
    extreme: 'bg-red-100 text-red-800',
};

export default function QuestsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 300);
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [isLoading, setIsLoading] = useState(true);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(12);
    const [total, setTotal] = useState<number>(0);

    // Load quests from server API with server-side filters
    useEffect(() => {
        const controller = new AbortController();
        const loadQuests = async () => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();
                if (debouncedSearch) params.set('q', debouncedSearch);
                if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter);
                if (sortBy) params.set('sort', sortBy === 'newest' ? 'newest' : 'oldest');
                const res = await fetch(`/api/quests?${params.toString()}`, {
                    signal: controller.signal,
                    headers: {Accept: 'application/json'},
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error('Failed to load quests');
                const json = await res.json();
                setQuests(json.items ?? []);
                setTotal(json.total ?? 0);
            } catch (e) {
                if ((e as any).name !== 'AbortError') {
                    console.error(e);
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadQuests();
        return () => controller.abort();
    }, [debouncedSearch, difficultyFilter, sortBy, page, limit]);

    // No client-side filtering beyond server query; keep a mirror list for rendering
    useEffect(() => {
        setFilteredQuests(quests);
    }, [quests]);

    // Update URL with filters
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('q', debouncedSearch);
        if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter);
        if (sortBy !== 'newest') params.set('sort', sortBy);
        if (page !== 1) params.set('page', String(page));
        if (limit !== 12) params.set('limit', String(limit));

        router.replace(`/quests?${params.toString()}`, {scroll: false});
    }, [debouncedSearch, difficultyFilter, sortBy, page, limit, router]);

    // Load filters from URL on initial load
    useEffect(() => {
        const search = searchParams.get('q');
        const difficulty = searchParams.get('difficulty');
        const sort = searchParams.get('sort');
        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');

        if (search) setSearchTerm(search);
        if (difficulty) setDifficultyFilter(difficulty);
        if (sort) setSortBy(sort);
        if (pageParam) setPage(Math.max(1, parseInt(pageParam, 10) || 1));
        if (limitParam) setLimit(Math.min(50, Math.max(1, parseInt(limitParam, 10) || 12)));
    }, [searchParams]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setDifficultyFilter('all');
        setSortBy('newest');
        setPage(1);
        setLimit(12);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Discover Quests</h1>
                <p className="text-muted-foreground">Find your next adventure</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                        <Input
                            type="search"
                            placeholder="Search quests..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="relative">
                            <select
                                className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                            >
                                <option value="all">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>

                        {/* Status filter removed for MVP; server doesn't expose these statuses */}

                        <div className="relative">
                            <select
                                className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest</option>
                                <option value="rating">Top Rated</option>
                                <option value="distance">Nearest</option>
                                <option value="duration">Shortest</option>
                            </select>
                        </div>

                        <Button variant="outline" onClick={handleResetFilters}>
                            Reset
                        </Button>
                    </div>
                </div>

                {(searchTerm || difficultyFilter !== 'all') && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{filteredQuests.length} quests found</span>
                        <span className="text-muted-foreground/50">•</span>
                        <button onClick={handleResetFilters} className="text-primary hover:underline">
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Quest Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: 6}).map((_, i) => (
                        <div key={i} className="overflow-hidden rounded-lg border p-4 space-y-4">
                            <Skeleton className="h-6 w-1/2"/>
                            <Skeleton className="h-4 w-3/4"/>
                            <Skeleton className="h-4 w-full"/>
                        </div>
                    ))}
                </div>
            ) : (
                <QuestList quests={filteredQuests}/>
            )}

            {/* Pagination controls */}
            {!isLoading && (
                <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {page} • Showing {filteredQuests.length} of {total}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            disabled={page * limit >= total}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                        <select
                            className="ml-2 flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={limit}
                            onChange={(e) => {
                                setPage(1);
                                setLimit(parseInt(e.target.value, 10));
                            }}
                        >
                            {[6, 12, 24, 36].map((n) => (
                                <option key={n} value={n}>
                                    {n} / page
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
