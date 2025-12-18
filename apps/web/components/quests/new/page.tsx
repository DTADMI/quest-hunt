// B:\git\quest-hunt\apps\web\app\quests\new\page.tsx
'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {QuestForm} from '@/components/quests/quest-form';

export default function CreateQuestPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/quests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    status: 'draft',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create quest');
            }

            const result = await response.json();
            toast.success('Quest created successfully!');
            router.push(`/quests/${result.id}`);
        } catch (error) {
            console.error('Error creating quest:', error);
            toast.error('Failed to create quest. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Create New Quest</h1>
                <QuestForm onSubmit={handleSubmit} isSubmitting={isSubmitting}/>
            </div>
        </div>
    );
}