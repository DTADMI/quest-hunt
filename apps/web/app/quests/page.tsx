'use client';

import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {useDebounce} from 'use-debounce';
import {Clock, MapPin, Search, Star, Trophy} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';

// Types
type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
type Status = 'upcoming' | 'ongoing' | 'completed';

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
        location: ['Downtown', 'Mountains', 'Forest', 'Beach', 'City Center'][Math.floor(Math.random() * 5)],
        imageUrl: `https://picsum.photos/seed/quest-${i + 1}/600/400`,
        status: statuses[Math.floor(Math.random() * statuses.length)] as Status,
        tags: Array.from({length: Math.floor(Math.random() * 3) + 1},
            () => tags[Math.floor(Math.random() * tags.length)]).filter((v, i, a) => a.indexOf(v) === i)
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

    // Load quests
    useEffect(() => {
        const loadQuests = async () => {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockQuests = generateMockQuests(12);
            setQuests(mockQuests);
            setFilteredQuests(mockQuests);
            setIsLoading(false);
        };

        loadQuests();
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let result = [...quests];

        // Apply search filter
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            result = result.filter(
                quest => quest.title.toLowerCase().includes(searchLower) ||
                    quest.description.toLowerCase().includes(searchLower) ||
                    quest.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Apply difficulty filter
        if (difficultyFilter !== 'all') {
            result = result.filter(quest => quest.difficulty === difficultyFilter);
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(quest => quest.status === statusFilter);
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return b.id.localeCompare(a.id);
                case 'rating':
                    return b.rating - a.rating;
                case 'distance':
                    return a.distance - b.distance;
                case 'duration':
                    return a.duration - b.duration;
                default:
                    return 0;
            }
        });

        setFilteredQuests(result);
    }, [quests, debouncedSearch, difficultyFilter, statusFilter, sortBy]);

    // Update URL with filters
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (sortBy !== 'newest') params.set('sort', sortBy);

        router.replace(`/quests?${params.toString()}`, {scroll: false});
    }, [debouncedSearch, difficultyFilter, statusFilter, sortBy, router]);

    // Load filters from URL on initial load
    useEffect(() => {
        const search = searchParams.get('search');
        const difficulty = searchParams.get('difficulty');
        const status = searchParams.get('status');
        const sort = searchParams.get('sort');

        if (search) setSearchTerm(search);
        if (difficulty) setDifficultyFilter(difficulty);
        if (status) setStatusFilter(status);
        if (sort) setSortBy(sort);
    }, [searchParams]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setDifficultyFilter('all');
        setStatusFilter('all');
        setSortBy('newest');
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
                                <option value="extreme">Extreme</option>
                            </select>
                        </div>

                        <div className="relative">
                            <select
                                className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

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

                {(searchTerm || difficultyFilter !== 'all' || statusFilter !== 'all') && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{filteredQuests.length} quests found</span>
                        <span className="text-muted-foreground/50">•</span>
                        <button
                            onClick={handleResetFilters}
                            className="text-primary hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Quest Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: 6}).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full rounded-t-lg"/>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2"/>
                                <Skeleton className="h-4 w-1/2"/>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-5/6"/>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Skeleton className="h-8 w-20"/>
                                <Skeleton className="h-8 w-24"/>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : filteredQuests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuests.map((quest) => (
                        <Card key={quest.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative">
                                <img
                                    src={quest.imageUrl}
                                    alt={quest.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <Badge
                                        className={`${difficultyColors[quest.difficulty]} hover:${difficultyColors[quest.difficulty]}`}
                                    >
                                        {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl">{quest.title}</CardTitle>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mr-1"/>
                                    <span>{quest.location}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {quest.description}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {quest.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1"/>
                                        <span>{quest.rating}</span>
                                        <span className="text-muted-foreground ml-1">({quest.reviewCount})</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 text-muted-foreground mr-1"/>
                                        <span>{Math.floor(quest.duration / 60)}h {quest.duration % 60}m</span>
                                    </div>
                                </div>
                                <Button size="sm">View Details</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Trophy className="h-6 w-6 text-muted-foreground"/>
                    </div>
                    <h3 className="mt-4 text-lg font-medium">No quests found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Try adjusting your search or filter to find what you're looking for.
                    </p>
                    <Button className="mt-4" onClick={handleResetFilters}>
                        Clear filters
                    </Button>
                </div>
            )}

            {/* Load More Button (for pagination) */}
            {!isLoading && filteredQuests.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <Button variant="outline" className="w-full max-w-sm">
                        Load More Quests
                    </Button>
                </div>
            )}
        </div>
    );
}
