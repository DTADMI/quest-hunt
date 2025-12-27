'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {profileUpdateSchema} from '@/lib/server/schemas';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Skeleton} from '@/components/ui/skeleton';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {BadgeCard} from '@/components/badges/BadgeCard';
import {ActivityFeed} from '@/components/activity/ActivityFeed';
import {MapPin, Star, Trophy} from 'lucide-react';

type ProfileForm = {
    username?: string;
    display_name?: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
};

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({quests_completed: 0, total_points: 0, badges_count: 0});
    const [userBadges, setUserBadges] = useState([]);

    const form = useForm<ProfileForm>({
        resolver: zodResolver(profileUpdateSchema.partial()),
        defaultValues: {},
    });

    useEffect(() => {
        let abort = false;
        (async () => {
            try {
                setLoading(true);
                const [profileRes, statsRes, badgesRes] = await Promise.all([
                    fetch('/api/users/me', {cache: 'no-store'}),
                    fetch('/api/users/me/stats'),
                    fetch('/api/users/me/badges'),
                ]);

                if (profileRes.status === 401) {
                    setError('You need to be signed in to view your profile.');
                    return;
                }

                const profileData = await profileRes.json();
                if (!abort && profileData) {
                    form.reset({
                        username: profileData.username ?? '',
                        display_name: profileData.display_name ?? '',
                        bio: profileData.bio ?? '',
                        location: profileData.location ?? '',
                        avatar_url: profileData.avatar_url ?? '',
                    });
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                if (badgesRes.ok) {
                    const badgesData = await badgesRes.json();
                    setUserBadges(
                        badgesData.items.map((item: any) => ({
                            ...item.badge,
                            userProgress: {
                                isUnlocked: item.is_unlocked,
                                progress: item.progress,
                                unlockedAt: item.unlocked_at,
                            },
                        })) || []
                    );
                }
            } catch (e) {
                console.error(e);
                if (!abort) setError('Failed to load profile');
            } finally {
                if (!abort) setLoading(false);
            }
        })();
        return () => {
            abort = true;
        };
    }, [form]);

    const onSubmit = async (values: ProfileForm) => {
        try {
            setSaving(true);
            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error('Failed to update profile');
            router.refresh();
        } catch (e) {
            console.error(e);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-8">
                <Skeleton className="h-32 w-full mb-8 rounded-xl"/>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <Skeleton className="h-64 w-full rounded-xl"/>
                        <Skeleton className="h-64 w-full rounded-xl"/>
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-64 w-full rounded-xl"/>
                    </div>
                </div>
            </div>
        );
    }

    const currentValues = form.getValues();

    return (
        <div className="container py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={currentValues.avatar_url}/>
                    <AvatarFallback className="text-4xl">
                        {currentValues.display_name?.[0] || '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <div>
                        <h1 className="text-4xl font-black">{currentValues.display_name || 'Quest Hunter'}</h1>
                        <p className="text-xl text-muted-foreground">@{currentValues.username}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full">
                            <Trophy className="h-4 w-4"/>
                            <span>{stats.quests_completed} Quests</span>
                        </div>
                        <div
                            className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full">
                            <Star className="h-4 w-4"/>
                            <span>{stats.total_points} Points</span>
                        </div>
                        {currentValues.location && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                                <MapPin className="h-4 w-4"/>
                                <span>{currentValues.location}</span>
                            </div>
                        )}
                    </div>
                    {currentValues.bio && (
                        <p className="text-lg leading-relaxed max-w-2xl">{currentValues.bio}</p>
                    )}
                </div>
            </div>

            <Tabs defaultValue="feed" className="w-full">
                <TabsList className="mb-8 h-12 p-1 bg-muted/50">
                    <TabsTrigger value="feed" className="px-8 h-10">
                        Activity
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="px-8 h-10">
                        Badges
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="px-8 h-10">
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="feed" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <ActivityFeed/>
                        </div>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Recent Progress</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Completion Rate</span>
                                        <span className="font-bold">85%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{width: '85%'}}/>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="badges">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {userBadges.length > 0 ? (
                            userBadges.map((badge: any) => (
                                <BadgeCard key={badge.id} badge={badge.badge} unlocked={badge.is_unlocked}/>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                                <p className="text-muted-foreground">No badges earned yet. Go out and explore!</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Edit Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            name="username"
                                            control={form.control}
                                            render={({field}) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="yourhandle" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                                            )}
                                        />

                                        <FormField
                                            name="display_name"
                                            control={form.control}
                                            render={({field}) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        name="bio"
                                        control={form.control}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell others about you"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        name="location"
                                        control={form.control}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="City, Country" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        name="avatar_url"
                                        control={form.control}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Avatar URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-4 border-t">
                                        <Button type="submit" size="lg" disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
