// B:\git\quest-hunt\apps\web\app\quests\page.tsx
import {createClient} from '@/lib/supabase/server';
import {QuestList} from '@/components/quests/quest-list';
import {Button} from '@/components/ui/button';
import Link from 'next/link';

export default async function QuestsPage() {
    const supabase = createClient();

    const {data: quests} = await supabase
        .from('quests')
        .select('*, created_by:profiles(username)')
        .order('created_at', {ascending: false});

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Quests</h1>
                    <p className="text-muted-foreground">Create and manage your geocaching adventures</p>
                </div>
                <Button asChild>
                    <Link href="/quests/new">Create Quest</Link>
                </Button>
            </div>

            <QuestList quests={quests || []}/>
        </div>
    );
}