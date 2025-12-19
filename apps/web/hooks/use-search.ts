// apps/web/hooks/use-search.ts
import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {SearchResult} from '@/types/search';

export function useSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [type, setType] = useState<'all' | 'quests' | 'users'>(() => {
        const t = searchParams.get('type');
        return t === 'quests' || t === 'users' ? t : 'all';
    });
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const search = async (searchQuery: string, searchType: string = type) => {
        if (!searchQuery.trim()) {
            setResults(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                type: searchType,
                page: '1',
            });

            const response = await fetch(`/api/search?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch search results');
            }

            const data = await response.json();
            setResults(data.results);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to load search results');
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (searchQuery: string, searchType: string = type) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (searchType !== 'all') params.set('type', searchType);

        router.push(`/search?${params.toString()}`);
        search(searchQuery, searchType);
    };

    // Initial search when component mounts or query/type changes
    useEffect(() => {
        const searchQuery = searchParams.get('q') || '';
        const searchType = searchParams.get('type') as 'all' | 'quests' | 'users' || 'all';

        setQuery(searchQuery);
        setType(searchType);

        if (searchQuery) {
            search(searchQuery, searchType);
        }
    }, [searchParams]);

    return {
        query,
        type,
        isLoading,
        results,
        error,
        search: handleSearch,
        setType,
    };
}