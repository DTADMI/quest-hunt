'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {profileUpdateSchema} from '@/lib/server/schemas';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Skeleton} from '@/components/ui/skeleton';

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

    const form = useForm<ProfileForm>({
        resolver: zodResolver(profileUpdateSchema.partial()),
        defaultValues: {},
    });

    useEffect(() => {
        let abort = false;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/users/me', {cache: 'no-store'});
                if (res.status === 401) {
                    setError('You need to be signed in to view your profile.');
                    return;
                }
                if (!res.ok) throw new Error('Failed to load profile');
                const data = await res.json();
                if (!abort && data) {
                    form.reset({
                        username: data.username ?? '',
                        display_name: data.display_name ?? '',
                        bio: data.bio ?? '',
                        location: data.location ?? '',
                        avatar_url: data.avatar_url ?? '',
                    });
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
                <Skeleton className="h-8 w-64 mb-6"/>
                <div className="grid gap-4 max-w-xl">
                    {Array.from({length: 6}).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full"/>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

            {error && (
                <div className="mb-4 text-sm text-red-600">{error}</div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4">
                    <FormField name="username" control={form.control} render={({field}) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="yourhandle" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField name="display_name" control={form.control} render={({field}) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField name="bio" control={form.control} render={({field}) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Tell others about you" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField name="location" control={form.control} render={({field}) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="City, Country" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField name="avatar_url" control={form.control} render={({field}) => (
                        <FormItem>
                            <FormLabel>Avatar URL (optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <div className="pt-2">
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
