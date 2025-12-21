'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';

type Props = {
    questId: string;
};

export function StartQuestButton({questId}: Props) {
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);

    const onStart = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/quests/${questId}/start`, {method: 'POST'});
            if (!res.ok) throw new Error('Failed to start quest');
            setStarted(true);
        } catch (e) {
            console.error(e);
            alert('Failed to start quest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={onStart} disabled={loading || started}>
            {started ? 'Quest Started' : loading ? 'Starting...' : 'Start Quest'}
        </Button>
    );
}
