-- Progress and badges schema additions
create table if not exists public.quest_progress
(
    id
    uuid
    primary
    key
    default
    uuid_generate_v4
(
),
    quest_id uuid not null references public.quests
(
    id
) on delete cascade,
    user_id uuid not null references auth.users
(
    id
)
  on delete cascade,
    status text not null default 'started', -- started|completed
    started_at timestamptz not null default timezone
(
    'utc'
    :
    :
    text,
    now
(
)),
    completed_at timestamptz
    );

create unique index if not exists uq_quest_progress_unique on public.quest_progress(quest_id, user_id);

create table if not exists public.waypoint_visits
(
    id
    uuid
    primary
    key
    default
    uuid_generate_v4
(
),
    waypoint_id uuid not null references public.waypoints
(
    id
) on delete cascade,
    user_id uuid not null references auth.users
(
    id
)
  on delete cascade,
    visited_at timestamptz not null default timezone
(
    'utc'
    :
    :
    text,
    now
(
)),
    proof jsonb
    );

create index if not exists idx_visits_user_waypoint on public.waypoint_visits(user_id, waypoint_id);

-- Badges tables (simple)
create type badge_rarity as enum ('common','uncommon','rare','epic','legendary');

create table if not exists public.badges
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
    type
    text
    not
    null,
    rarity
    badge_rarity
    not
    null
    default
    'common',
    icon
    text,
    points
    integer
    not
    null
    default
    0,
    criteria
    jsonb
    not
    null
    default
    '{}',
    hidden
    boolean
    not
    null
    default
    false,
    created_at
    timestamptz
    not
    null
    default
    timezone(
    'utc'
    :
    :
    text,
    now
(
)),
    updated_at timestamptz not null default timezone
(
    'utc'
    :
    :
    text,
    now
(
))
    );

create table if not exists public.user_badges
(
    id
    uuid
    primary
    key
    default
    uuid_generate_v4
(
),
    badge_id text not null references public.badges
(
    id
) on delete cascade,
    user_id uuid not null references auth.users
(
    id
)
  on delete cascade,
    progress integer not null default 0,
    is_unlocked boolean not null default false,
    unlocked_at timestamptz,
    progress_updated_at timestamptz not null default timezone
(
    'utc'
    :
    :
    text,
    now
(
))
    );

create unique index if not exists uq_user_badges_unique on public.user_badges(badge_id, user_id);

-- Enable RLS
alter table public.quest_progress enable row level security;
alter table public.waypoint_visits enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Policies
-- quest_progress: users can see their own, create for themselves
create
policy if not exists "Users can read their quest progress" on public.quest_progress for
select using (auth.uid() = user_id);
create
policy if not exists "Users can start progress for themselves" on public.quest_progress for insert with check (auth.uid() = user_id);
create
policy if not exists "Users can update their quest progress" on public.quest_progress for
update using (auth.uid() = user_id);

-- waypoint_visits: users can read/create their own
create
policy if not exists "Users can read their visits" on public.waypoint_visits for
select using (auth.uid() = user_id);
create
policy if not exists "Users can create their visits" on public.waypoint_visits for insert with check (auth.uid() = user_id);

-- badges: everyone can read
create
policy if not exists "Badges are viewable by everyone" on public.badges for
select using (true);

-- user_badges: users can read/update their own
create
policy if not exists "Users can read their badges" on public.user_badges for
select using (auth.uid() = user_id);
create
policy if not exists "Users can update their badges" on public.user_badges for
update using (auth.uid() = user_id);
create
policy if not exists "Users can insert their badges" on public.user_badges for insert with check (auth.uid() = user_id);
