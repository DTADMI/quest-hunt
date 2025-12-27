'use client';

import {useEffect, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import {useAuth} from '@/hooks/use-auth';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {useToast} from '@/components/ui/use-toast';
import {Skeleton} from '@/components/ui/skeleton';

type FeatureFlag = {
    id: string;
    name: string;
    description: string;
    is_enabled: boolean;
};

export default function AdminSettingsPage() {
    const {user, loading: authLoading} = useAuth();
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const {toast} = useToast();
    const supabase = createClient();

    useEffect(() => {
        async function checkAdminAndFetchFlags() {
            if (!user) {
                return;
            }

            const {data: profile} = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_admin) {
                setLoading(false);
                return;
            }

            setIsAdmin(true);

            const {data: flagsData} = await supabase
                .from('feature_flags')
                .select('*')
                .order('name');

            if (flagsData) {
                setFlags(flagsData);
            }
            setLoading(false);
        }

        if (!authLoading) {
            checkAdminAndFetchFlags();
        }
    }, [user, authLoading, supabase]);

    const toggleFlag = async (flagId: string, currentState: boolean) => {
        try {
            const {error} = await supabase
                .from('feature_flags')
                .update({is_enabled: !currentState})
                .eq('id', flagId);

            if (error) {
                throw error;
            }

            setFlags((prev) =>
                prev.map((f) => (f.id === flagId ? {...f, is_enabled: !currentState} : f))
            );

            toast({
                title: 'Flag updated',
                description: `Feature ${flagId} has been ${!currentState ? 'enabled' : 'disabled'}.`,
            });
        } catch (e) {
            console.error(e);
            toast({
                title: 'Error',
                description: 'Failed to update feature flag.',
                variant: 'destructive',
            });
        }
    };

    if (authLoading || loading) {
        return (
            <div className="container py-8 space-y-4">
                <Skeleton className="h-8 w-64"/>
                <Skeleton className="h-32 w-full"/>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container py-8 text-center">
                <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-4xl">
            <h1 className="text-3xl font-black mb-8">Admin Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Feature Flags</CardTitle>
                    <CardDescription>Toggle application features globally.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {flags.map((flag) => (
                        <div key={flag.id} className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor={flag.id} className="text-base font-bold">
                                    {flag.name}
                                </Label>
                                <p className="text-sm text-muted-foreground">{flag.description}</p>
                                <code className="text-xs bg-muted px-1 rounded">{flag.id}</code>
                            </div>
                            <Switch
                                id={flag.id}
                                checked={flag.is_enabled}
                                onCheckedChange={() => toggleFlag(flag.id, flag.is_enabled)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
