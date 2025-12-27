import {createClient} from '@/lib/supabase/client';
import {useEffect, useState} from 'react';

export type FeatureFlag = {
    id: string;
    name: string;
    description: string;
    is_enabled: boolean;
};

export function useFeatureFlags() {
    const [flags, setFlags] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchFlags() {
            const {data, error} = await supabase.from('feature_flags').select('id, is_enabled');

            if (!error && data) {
                const flagMap = data.reduce(
                    (acc, flag) => {
                        acc[flag.id] = flag.is_enabled;
                        return acc;
                    },
                    {} as Record<string, boolean>
                );
                setFlags(flagMap);
            }
            setLoading(false);
        }

        fetchFlags();

        // Subscribe to changes
        const channel = supabase
            .channel('public:feature_flags')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'feature_flags'},
                (payload) => {
                    const updatedFlag = payload.new as FeatureFlag;
                    setFlags((prev) => ({
                        ...prev,
                        [updatedFlag.id]: updatedFlag.is_enabled,
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const isEnabled = (flagId: string) => {
        return !!flags[flagId];
    };

    return {flags, loading, isEnabled};
}
