import {createClient} from '@/lib/supabase/server';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

export default async function PublicUserPage({params}: { params: { id: string } }) {
    const supabase = createClient();
    const {data: profile} = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, location, created_at')
        .eq('id', params.id)
        .single();

    if (!profile) {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-semibold">User not found</h1>
                <p className="text-muted-foreground mt-2">
                    The profile you are looking for does not exist.
                </p>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                    <AvatarImage
                        src={profile.avatar_url || ''}
                        alt={profile.display_name || profile.username}
                    />
                    <AvatarFallback>
                        {(profile.display_name || profile.username || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
                    <div className="text-muted-foreground">@{profile.username}</div>
                </div>
            </div>

            {profile.location && (
                <div className="text-sm text-muted-foreground">📍 {profile.location}</div>
            )}

            {profile.bio && <p className="mt-4 whitespace-pre-line">{profile.bio}</p>}
        </div>
    );
}
