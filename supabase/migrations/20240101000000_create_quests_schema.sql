-- B:\git\quest-hunt\supabase\migrations\20240101000000_create_quests_schema.sql
-- Enable necessary extensions
create
extension if not exists "uuid-ossp";
create
extension if not exists "pgcrypto";
create
extension if not exists "postgis";

-- Create enum types
create type quest_status as enum ('draft', 'published', 'archived');
create type quest_difficulty as enum ('easy', 'medium', 'hard', 'expert');

-- Quests table
create table public.quests
(
    id                         uuid                                                       default uuid_generate_v4() primary key,
    title                      text                                              not null,
    description                text,
    difficulty                 quest_difficulty                                  not null default 'medium',
    status                     quest_status                                      not null default 'draft',
    start_location             geography(point, 4326),
    estimated_duration_minutes integer,
    created_by                 uuid references auth.users (id) on delete cascade not null,
    created_at                 timestamp with time zone                                   default timezone('utc'::text, now()) not null,
    updated_at                 timestamp with time zone                                   default timezone('utc'::text, now()) not null
);

-- Waypoints table
create table public.waypoints
(
    id           uuid                     default uuid_generate_v4() primary key,
    quest_id     uuid references public.quests (id) on delete cascade          not null,
    title        text                                                          not null,
    description  text,
    location     geography(point, 4326) not null,
    order_index  integer                                                       not null,
    clue         text,
    qr_code_data text,
    created_at   timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and set up policies
alter table public.quests enable row level security;
alter table public.waypoints enable row level security;

-- Queries policies
create
policy "Quests are viewable by everyone."
  on public.quests for
select
    using (true);

create
policy "Users can create quests."
  on public.quests for insert
  with check (auth.uid() = created_by);

create
policy "Users can update their own quests."
  on public.quests for
update
    using (auth.uid() = created_by);

-- Waypoints policies
create
policy "Waypoints are viewable by everyone."
  on public.waypoints for
select
    using (true);

create
policy "Quest creators can manage waypoints."
  on public.waypoints
  for all
  using (
    exists (
      select 1 from public.quests
      where quests.id = waypoints.quest_id
      and quests.created_by = auth.uid()
    )
  );