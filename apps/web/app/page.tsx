import Link from 'next/link';
import {Button} from '@/components/ui/button';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
                    Discover & Create
                    <br/>
                    <span className="text-primary">Geocaching Adventures</span>
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                    Join the ultimate treasure hunting experience. Create quests, explore hidden locations,
                    and connect with fellow adventurers.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                    <Button size="lg" asChild>
                        <Link href="/quests">Explore Quests</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/auth/signin">Sign In</Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
