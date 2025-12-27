'use client';

import {useEffect, useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Loader2, Medal, Trophy} from 'lucide-react';
import {toast} from '@/components/ui/toast';

interface LeaderboardEntry {
    user_id: string;
    completed: number;
    rank: number;
    user: {
        id: string;
        username: string;
        display_name: string;
        avatar_url: string;
    };
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/leaderboard');
                const data = await res.json();
                if (data.items) {
                    setEntries(data.items);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load leaderboard',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
                <p className="text-muted-foreground">Top quest hunters by completed adventures.</p>
            </div>

            <div className="grid gap-4">
                {entries.map((entry, index) => (
                    <Card key={entry.user_id} className={index < 3 ? 'border-primary/50 bg-primary/5' : ''}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-8 text-center font-bold text-lg">
                                    {index === 0 && <Trophy className="h-6 w-6 text-yellow-500 mx-auto"/>}
                                    {index === 1 && <Medal className="h-6 w-6 text-slate-400 mx-auto"/>}
                                    {index === 2 && <Medal className="h-6 w-6 text-amber-600 mx-auto"/>}
                                    {index > 2 && <span>{entry.rank}</span>}
                                </div>
                                <Avatar className="h-12 w-12 border-2 border-background">
                                    <AvatarImage src={entry.user.avatar_url}/>
                                    <AvatarFallback>{entry.user.display_name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{entry.user.display_name || 'Anonymous'}</p>
                                    <p className="text-sm text-muted-foreground">@{entry.user.username}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black">{entry.completed}</p>
                                <p className="text-xs uppercase text-muted-foreground font-semibold">Quests</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {entries.length === 0 && (
                    <div className="text-center py-20 border rounded-xl bg-muted/20">
                        <p className="text-muted-foreground">
                            No hunters have completed any quests yet. Be the first!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
