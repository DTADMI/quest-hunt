// B:\git\quest-hunt\apps\web\components\quests\quest-list.tsx
'use client';

import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {formatDistanceToNow} from 'date-fns';
import {Clock, MapPin, Pencil, User} from 'lucide-react';

const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
};

interface Quest {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    created_by: {
        id: string;
        username: string;
    };
    start_location: {
        type: 'Point';
        coordinates: [number, number];
    } | null;
    estimated_duration_minutes: number | null;
}

interface QuestListProps {
    quests: Quest[];
    showActions?: boolean;
}

export function QuestList({quests, showActions = true}: QuestListProps) {
    if (quests.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium">No quests found</h3>
                <p className="text-muted-foreground mt-2">Get started by creating a new quest</p>
                {showActions && (
                    <Button className="mt-4" asChild>
                        <Link href="/quests/new">Create Quest</Link>
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quests.map((quest) => (
                <Card key={quest.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{quest.title}</CardTitle>
                            <Badge className={difficultyColors[quest.difficulty]}>{quest.difficulty}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {quest.description || 'No description provided.'}
                        </p>

                        <div className="mt-4 space-y-2 text-sm">
                            {quest.start_location && (
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="h-4 w-4 mr-2"/>
                                    <span>
                    {quest.start_location.coordinates[1].toFixed(4)},{' '}
                                        {quest.start_location.coordinates[0].toFixed(4)}
                  </span>
                                </div>
                            )}

                            {quest.estimated_duration_minutes && (
                                <div className="flex items-center text-muted-foreground">
                                    <Clock className="h-4 w-4 mr-2"/>
                                    <span>~{quest.estimated_duration_minutes} minutes</span>
                                </div>
                            )}

                            <div className="flex items-center text-muted-foreground">
                                <User className="h-4 w-4 mr-2"/>
                                <span>Created by {quest.created_by?.username || 'Unknown'}</span>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                Created {formatDistanceToNow(new Date(quest.created_at), {addSuffix: true})}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                        <Button variant="outline" asChild>
                            <Link href={`/quests/${quest.id}`}>View Details</Link>
                        </Button>
                        {showActions && (
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/quests/${quest.id}/edit`}>
                                    <Pencil className="h-4 w-4"/>
                                    <span className="sr-only">Edit</span>
                                </Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
