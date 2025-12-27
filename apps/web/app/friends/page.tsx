'use client';

import {useEffect, useState} from 'react';
import {useAuth} from '@/lib/hooks/use-auth';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Check, Loader2, Search, UserMinus, UserPlus, X} from 'lucide-react';
import {toast} from '@/components/ui/toast';
import {Input} from '@/components/ui/input';

interface Friend {
    id: string;
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted' | 'declined';
    created_at: string;
    user?: {
        id: string;
        username: string;
        display_name: string;
        avatar_url: string;
    };
}

export default function FriendsPage() {
    const {user} = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends');
            const data = await res.json();
            if (data.items) {
                // Enriched friends would ideally come from the API with user details
                // For now, let's assume we need to fetch their profiles or the API provides them
                setFriends(data.items);
            }
        } catch (error) {
            console.error('Failed to fetch friends', error);
            toast({title: 'Error', description: 'Failed to load friends list', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchFriends();
        }
    }, [user]);

    const handleAction = async (id: string, action: 'accept' | 'decline' | 'delete') => {
        try {
            if (action === 'delete') {
                const res = await fetch(`/api/friends/${id}`, {method: 'DELETE'});
                if (!res.ok) throw new Error();
                toast({title: 'Success', description: 'Friend removed'});
            } else {
                const res = await fetch(`/api/friends/${id}?action=${action}`, {method: 'PUT'});
                if (!res.ok) throw new Error();
                toast({
                    title: 'Success',
                    description: `Request ${action === 'accept' ? 'accepted' : 'declined'}`,
                });
            }
            fetchFriends();
        } catch (error) {
            toast({title: 'Error', description: 'Action failed', variant: 'destructive'});
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setSearching(true);
        try {
            // Search for users to add as friends
            const res = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();
            setSearchResults(data.items || []);
        } catch (error) {
            toast({title: 'Error', description: 'Search failed', variant: 'destructive'});
        } finally {
            setSearching(false);
        }
    };

    const sendFriendRequest = async (friendId: string) => {
        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({friend_id: friendId}),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to send request');
            }
            toast({title: 'Success', description: 'Friend request sent!'});
            fetchFriends();
        } catch (error: any) {
            toast({title: 'Error', description: error.message, variant: 'destructive'});
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        );
    }

    const acceptedFriends = friends.filter((f) => f.status === 'accepted');
    const pendingRequests = friends.filter((f) => f.status === 'pending' && f.friend_id === user?.id);
    const sentRequests = friends.filter((f) => f.status === 'pending' && f.user_id === user?.id);

    return (
        <div className="container max-w-4xl py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Social</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Tabs defaultValue="friends">
                        <TabsList className="mb-4">
                            <TabsTrigger value="friends">Friends ({acceptedFriends.length})</TabsTrigger>
                            <TabsTrigger value="pending">Requests ({pendingRequests.length})</TabsTrigger>
                            <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="friends">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Friends</CardTitle>
                                    <CardDescription>People you can quest with.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {acceptedFriends.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            No friends yet. Start searching!
                                        </p>
                                    ) : (
                                        acceptedFriends.map((f) => (
                                            <div
                                                key={f.id}
                                                className="flex items-center justify-between p-2 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={f.user?.avatar_url}/>
                                                        <AvatarFallback>{f.user?.display_name?.[0] || '?'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{f.user?.display_name || 'Anonymous'}</p>
                                                        <p className="text-sm text-muted-foreground">@{f.user?.username}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAction(f.id, 'delete')}
                                                >
                                                    <UserMinus className="h-4 w-4 mr-2"/>
                                                    Remove
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pending">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Friend Requests</CardTitle>
                                    <CardDescription>People who want to connect with you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {pendingRequests.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">No pending requests.</p>
                                    ) : (
                                        pendingRequests.map((f) => (
                                            <div
                                                key={f.id}
                                                className="flex items-center justify-between p-2 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={f.user?.avatar_url}/>
                                                        <AvatarFallback>{f.user?.display_name?.[0] || '?'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{f.user?.display_name || 'Anonymous'}</p>
                                                        <p className="text-sm text-muted-foreground">@{f.user?.username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleAction(f.id, 'accept')}>
                                                        <Check className="h-4 w-4 mr-1"/>
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAction(f.id, 'decline')}
                                                    >
                                                        <X className="h-4 w-4 mr-1"/>
                                                        Decline
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sent">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sent Requests</CardTitle>
                                    <CardDescription>Requests you've sent to others.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {sentRequests.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">No sent requests.</p>
                                    ) : (
                                        sentRequests.map((f) => (
                                            <div
                                                key={f.id}
                                                className="flex items-center justify-between p-2 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={f.user?.avatar_url}/>
                                                        <AvatarFallback>{f.user?.display_name?.[0] || '?'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{f.user?.display_name || 'Anonymous'}</p>
                                                        <p className="text-sm text-muted-foreground">@{f.user?.username}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAction(f.id, 'delete')}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Find People</CardTitle>
                            <CardDescription>Search for users by username.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    placeholder="Username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button type="submit" size="icon" disabled={searching}>
                                    {searching ? (
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                    ) : (
                                        <Search className="h-4 w-4"/>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 space-y-4">
                                {searchResults.map((userResult) => (
                                    <div
                                        key={userResult.id}
                                        className="flex items-center justify-between p-2 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={userResult.avatar_url}/>
                                                <AvatarFallback>{userResult.display_name?.[0] || '?'}</AvatarFallback>
                                            </Avatar>
                                            <div className="text-sm">
                                                <p className="font-medium leading-none">{userResult.display_name}</p>
                                                <p className="text-muted-foreground leading-none mt-1">
                                                    @{userResult.username}
                                                </p>
                                            </div>
                                        </div>
                                        {userResult.id !== user?.id && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => sendFriendRequest(userResult.id)}
                                            >
                                                <UserPlus className="h-4 w-4"/>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
