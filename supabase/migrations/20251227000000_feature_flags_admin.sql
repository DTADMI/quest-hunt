-- Feature flags and Admin management

-- Add is_admin to profiles
alter table public.profiles
    add column if not exists is_admin boolean default false;

-- Create feature flags table
create table if not exists public.feature_flags
(
    id
    text
    primary
    key,
    name
    text
    not
    null,
    description
    text,
    is_enabled
    boolean
    default
    false,
    updated_at
    timestamptz
    default
    now
(
)
    );

-- Enable RLS
alter table public.feature_flags enable row level security;

-- Policies for feature_flags
create
policy "Everyone can read feature flags"
    on public.feature_flags for
select
    using (true);

create
policy "Admins can manage feature flags"
    on public.feature_flags for all
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

-- Seed some flags
insert into public.feature_flags (id, name, description, is_enabled)
values ('social_features', 'Social Features', 'Enables friends system and activity feed', true),
       ('gamification', 'Gamification', 'Enables leaderboard and badges', true),
       ('messaging', 'Messaging', 'In-app messaging system', false) on conflict (id) do nothing;

-- Update Quests policies to allow Admins
drop
policy if exists "Users can update their own quests." on public.quests;
create
policy "Users and Admins can update quests."
    on public.quests for
update
    using (
    auth.uid() = created_by or
    exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
    )
    );

drop
policy if exists "Quest creators can manage waypoints." on public.waypoints;
create
policy "Quest creators and Admins can manage waypoints."
    on public.waypoints for all
    using (
        exists (
            select 1 from public.quests
            where quests.id = waypoints.quest_id
            and (quests.created_by = auth.uid() or 
                exists (
                    select 1 from public.profiles
                    where profiles.id = auth.uid()
                    and profiles.is_admin = true
                )
            )
        )
    );
