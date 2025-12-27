-- Create profiles table
create table if not exists public.profiles
(
    id
    uuid
    references
    auth
    .
    users
(
    id
) on delete cascade primary key,
    username text unique,
    display_name text,
    avatar_url text,
    bio text,
    location text,
    created_at timestamptz default now
(
) not null,
    updated_at timestamptz default now
(
) not null
    );

-- Create friends table
create table if not exists public.friends
(
    id
    uuid
    default
    uuid_generate_v4
(
) primary key,
    user_id uuid references auth.users
(
    id
) on delete cascade not null,
    friend_id uuid references auth.users
(
    id
)
  on delete cascade not null,
    status text not null default 'pending' check
(
    status
    in
(
    'pending',
    'accepted',
    'declined'
)),
    created_at timestamptz default now
(
) not null,
    unique
(
    user_id,
    friend_id
)
    );

-- Create activities table
create table if not exists public.activities
(
    id
    uuid
    default
    uuid_generate_v4
(
) primary key,
    user_id uuid references auth.users
(
    id
) on delete cascade not null,
    type text not null, -- 'quest_started', 'quest_completed', 'waypoint_visited', 'badge_unlocked', 'friend_added'
    data jsonb default '{}'::jsonb not null,
    created_at timestamptz default now
(
) not null
    );

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.friends enable row level security;
alter table public.activities enable row level security;

-- Profiles policies
create
policy "Public profiles are viewable by everyone." on public.profiles
    for
select using (true);

create
policy "Users can insert their own profile." on public.profiles
    for insert with check (auth.uid() = id);

create
policy "Users can update their own profile." on public.profiles
    for
update using (auth.uid() = id);

-- Friends policies
create
policy "Users can see their own friendships." on public.friends
    for
select using (auth.uid() = user_id or auth.uid() = friend_id);

create
policy "Users can send friend requests." on public.friends
    for insert with check (auth.uid() = user_id);

create
policy "Users can update their received friend requests." on public.friends
    for
update using (auth.uid() = friend_id);

create
policy "Users can delete their own friendships." on public.friends
    for delete
using (auth.uid() = user_id or auth.uid() = friend_id);

-- Activities policies
create
policy "Activities are viewable by everyone." on public.activities
    for
select using (true);

create
policy "System can insert activities." on public.activities
    for insert with check (true); -- In a real app, you might restrict this more

-- Trigger for profile creation on signup
create
or replace function public.handle_new_user()
returns trigger as $$
begin
insert into public.profiles (id, username, display_name, avatar_url)
values (new.id, new.raw_user_meta_data ->>'username', new.raw_user_meta_data ->>'display_name',
        new.raw_user_meta_data ->>'avatar_url');
return new;
end;
$$
language plpgsql security definer;

create trigger on_auth_user_created
    after insert
    on auth.users
    for each row execute procedure public.handle_new_user();
