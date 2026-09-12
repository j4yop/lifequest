-- Life Quest schema: users, quests, attributes, economy, activity log
-- All game math is server-side; RLS isolates every row per user.

create extension if not exists "pgcrypto";

-- ============ ENUMS ============
create type public.difficulty_tier as enum ('trivial', 'easy', 'medium', 'hard', 'epic');
create type public.attribute_key as enum ('str', 'int', 'vit', 'dis', 'cha', 'cra');
create type public.item_kind as enum ('frame', 'title', 'badge', 'theme', 'consumable');
create type public.rarity as enum ('common', 'uncommon', 'rare', 'epic', 'legendary');

-- ============ PROFILES ============
-- One row per auth user. Character sheet header.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  class_name text not null default 'Wanderer',
  level int not null default 1 check (level >= 1),
  xp int not null default 0 check (xp >= 0),
  gold int not null default 0 check (gold >= 0),
  streak_count int not null default 0 check (streak_count >= 0),
  streak_best int not null default 0 check (streak_best >= 0),
  last_active_date date,
  created_at timestamptz not null default now()
);

-- ============ ATTRIBUTES ============
-- Six stats. Per-attribute XP/levels.
create table public.attributes (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  attribute public.attribute_key not null,
  xp int not null default 0 check (xp >= 0),
  level int not null default 1 check (level >= 1),
  unique (profile_id, attribute)
);

-- ============ QUESTS (tasks) ============
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  notes text,
  tier public.difficulty_tier not null default 'medium',
  attribute public.attribute_key not null default 'dis',
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_profile_open on public.tasks (profile_id, completed, created_at desc);

-- ============ ITEM CATALOG (shared, read-only to clients) ============
create table public.item_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  kind public.item_kind not null,
  rarity public.rarity not null default 'common',
  price int not null check (price >= 0),
  glyph text not null default 'star',
  purchasable boolean not null default true
);

-- ============ USER ITEMS (owned / equipped) ============
create table public.user_items (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  item_id uuid not null references public.item_catalog (id) on delete restrict,
  quantity int not null default 1 check (quantity >= 0),
  equipped boolean not null default false,
  acquired_at timestamptz not null default now(),
  unique (profile_id, item_id)
);

-- ============ ACTIVITY LOG ============
-- One row per completed quest (plus purchase events) — the historical log.
create table public.activity_log (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  event text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_profile_date on public.activity_log (profile_id, created_at desc);

-- ============ NEW USER BOOTSTRAP ============
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));

  insert into public.attributes (profile_id, attribute)
  select new.id, unnest(enum_range(null::public.attribute_key));

  insert into public.user_items (profile_id, item_id, quantity)
  select new.id, id, 1
  from public.item_catalog
  where slug = 'badge-newcomer' and purchasable;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
