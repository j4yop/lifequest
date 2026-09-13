-- ============================================================================
-- LEDGERLIGHT UPDATE — crit rolls, equipment paper-doll, daily chest, world zones
-- ============================================================================

-- ============ 1. CRIT ROLLS + CHEST STATE ON PROFILES ============
alter table public.profiles
  add column if not exists crit_count int not null default 0,
  add column if not exists chest_last_claimed date;

-- ============ 2. EQUIPMENT (paper-doll gear) ============
create extension if not exists "pgcrypto";

-- gear catalog: 6 slots x 3 tiers, mapped to attributes.
create table public.gear_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  slot public.attribute_key not null,          -- each attribute owns one gear slot
  tier int not null check (tier between 1 and 3),
  name text not null,
  description text not null,
  price int not null check (price >= 0),
  -- the visible layer drawn on the avatar (client draws by slug)
  unique (slot, tier)
);

-- what the hero currently wears (one per slot)
create table public.user_gear (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  slot public.attribute_key not null,
  tier int not null default 0 check (tier >= 0), -- 0 = plain clothes
  unique (profile_id, slot)
);

alter table public.user_gear enable row level security;
create policy "user_gear: read own" on public.user_gear
  for select using (auth.uid() = profile_id);

alter table public.gear_catalog enable row level security;
create policy "gear_catalog: read all" on public.gear_catalog
  for select using (auth.role() = 'authenticated');

-- ============ 3. WORLD ZONES (fog-of-war unlocks) ============
create table public.zones (
  id int primary key,
  name text not null,
  lore text not null,
  unlock_level int not null,          -- total character level
  order_index int not null
);

alter table public.zones enable row level security;
create policy "zones: read all" on public.zones
  for select using (auth.role() = 'authenticated');

-- ============ 4. NEW-USER GEAR BOOTSTRAP (extend existing trigger) ============
create or replace function public.handle_new_user()
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

  -- paper-doll: all slots start at tier 0 (plain clothes)
  insert into public.user_gear (profile_id, slot, tier)
  select new.id, a, 0 from unnest(enum_range(null::public.attribute_key)) as a;

  return new;
end;
$$;

-- ============ 5. COMPLETE_TASK v2: crit roll + gear grants ============
create or replace function public.complete_task(task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks;
  v_profile public.profiles;
  v_attr public.attributes;
  v_xp int;
  v_gold int;
  v_levels_gained int := 0;
  v_attr_levels int := 0;
  v_leveled_up boolean := false;
  v_streak_increased boolean := false;
  v_streak_frozen boolean := false;
  v_today date := (now() at time zone 'utc')::date;
  v_crit boolean := false;
  v_crit_multiplier numeric := 1;
  v_roll int;
  v_gear_granted text;
  v_old_gear int;
  v_new_gear int;
begin
  -- 1. Lock and validate.
  select * into v_task from public.tasks
    where id = task_id and profile_id = auth.uid()
    for update;
  if not found then
    raise exception 'Quest not found or not yours.';
  end if;
  if v_task.completed then
    raise exception 'Quest already completed today, hero.';
  end if;

  select * into v_profile from public.profiles where id = auth.uid() for update;

  -- 2. Complete + payout.
  update public.tasks
    set completed = true, completed_at = now(), updated_at = now()
    where id = task_id;

  select xp, gold into v_xp, v_gold from public.tier_rewards(v_task.tier);

  -- CRIT ROLL: d20, 20 = critical hit (double rewards, +1 luck counter)
  v_roll := floor(random() * 20)::int + 1;
  if v_roll = 20 then
    v_crit := true;
    v_crit_multiplier := 2;
    v_xp := v_xp * 2;
    v_gold := v_gold * 2;
  end if;

  update public.profiles
    set xp = xp + v_xp,
        gold = gold + v_gold,
        crit_count = crit_count + (case when v_crit then 1 else 0 end)
    where id = v_profile.id
    returning * into v_profile;

  -- 3. Attribute XP + level rolls.
  select * into v_attr from public.attributes
    where profile_id = v_profile.id and attribute = v_task.attribute for update;

  v_attr.xp := v_attr.xp + v_xp;
  while v_attr.xp >= public.attr_xp_needed(v_attr.level) loop
    v_attr.xp := v_attr.xp - public.attr_xp_needed(v_attr.level);
    v_attr.level := v_attr.level + 1;
    v_attr_levels := v_attr_levels + 1;
  end loop;
  update public.attributes
    set xp = v_attr.xp, level = v_attr.level
    where id = v_attr.id;

  -- 4. Profile level rolls.
  while v_profile.xp >= public.xp_needed(v_profile.level) loop
    v_profile.xp := v_profile.xp - public.xp_needed(v_profile.level);
    v_profile.level := v_profile.level + 1;
    v_levels_gained := v_levels_gained + 1;
  end loop;
  if v_levels_gained > 0 then
    v_leveled_up := true;
    update public.profiles
      set level = v_profile.level, xp = v_profile.xp
      where id = v_profile.id;
  end if;

  -- 5. Streak (UTC days).
  if v_profile.last_active_date is null or v_profile.streak_count = 0 then
    v_streak_increased := true;
    update public.profiles
      set streak_count = 1, streak_best = greatest(streak_best, 1), last_active_date = v_today
      where id = v_profile.id;
  elsif v_today = v_profile.last_active_date then
    null;
  elsif v_today - v_profile.last_active_date = 1 then
    v_streak_increased := true;
    update public.profiles
      set streak_count = streak_count + 1,
          streak_best = greatest(streak_best, streak_count + 1),
          last_active_date = v_today
      where id = v_profile.id;
  else
    if exists (
      select 1 from public.user_items ui
      join public.item_catalog ic on ic.id = ui.item_id
      where ui.profile_id = v_profile.id and ic.slug = 'consumable-streak-freeze' and ui.quantity > 0
    ) then
      v_streak_frozen := true;
      update public.user_items
        set quantity = quantity - 1
        where profile_id = v_profile.id
          and item_id = (select id from public.item_catalog where slug = 'consumable-streak-freeze');
      update public.profiles set last_active_date = v_today where id = v_profile.id;
    else
      update public.profiles
        set streak_count = 1, last_active_date = v_today
        where id = v_profile.id;
    end if;
  end if;

  select * into v_profile from public.profiles where id = v_profile.id;

  -- 6. GEAR GRANT: attribute level thresholds earn visible equipment.
  --    tier 1 at attr level 3, tier 2 at 6, tier 3 at 10.
  select tier into v_new_gear from (values (3,1),(6,2),(10,3)) as t(threshold, tier)
    where v_attr.level >= threshold order by tier desc limit 1;
  if v_new_gear is null then v_new_gear := 0; end if;

  select tier into v_old_gear from public.user_gear
    where profile_id = v_profile.id and slot = v_task.attribute;
  if v_old_gear is null then v_old_gear := 0; end if;

  if v_new_gear > v_old_gear then
    update public.user_gear
      set tier = v_new_gear
      where profile_id = v_profile.id and slot = v_task.attribute;
    select g.name into v_gear_granted
      from public.gear_catalog g
      where g.slot = v_task.attribute and g.tier = v_new_gear;
  end if;

  -- 7. Log.
  insert into public.activity_log (profile_id, event, detail)
    values (v_profile.id, 'task_completed', jsonb_build_object(
      'task_id', task_id,
      'title', v_task.title,
      'tier', v_task.tier,
      'xp', v_xp,
      'gold', v_gold,
      'attribute', v_task.attribute,
      'leveled_up', v_leveled_up,
      'new_level', v_profile.level,
      'crit', v_crit,
      'crit_roll', v_roll,
      'gear_granted', v_gear_granted
    ));

  -- 8. Return refreshed sheet + FX descriptor.
  return jsonb_build_object(
    'xp_gained', v_xp,
    'gold_gained', v_gold,
    'attribute', v_task.attribute,
    'attribute_levels_gained', v_attr_levels,
    'leveled_up', v_leveled_up,
    'levels_gained', v_levels_gained,
    'new_level', v_profile.level,
    'streak_increased', v_streak_increased,
    'streak_frozen', v_streak_frozen,
    'crit', v_crit,
    'crit_roll', v_roll,
    'gear_granted', v_gear_granted,
    'profile', to_jsonb(v_profile),
    'attributes', (
      select jsonb_agg(jsonb_build_object(
        'attribute', a.attribute, 'xp', a.xp, 'level', a.level,
        'xp_needed', public.attr_xp_needed(a.level)
      ) order by a.attribute)
      from public.attributes a where a.profile_id = v_profile.id
    ),
    'gear', (
      select coalesce(jsonb_object_agg(slot, tier), '{}'::jsonb)
      from public.user_gear where profile_id = v_profile.id
    )
  );
end;
$$;

-- ============ 6. DAILY ADVENTURER'S CHEST ============
create or replace function public.claim_chest()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_today date := (now() at time zone 'utc')::date;
  v_gold int;
  v_reward_slug text;
  v_reward_name text;
  v_rarity text;
  v_streak_bonus int;
  v_roll numeric := random();
  v_item record;
begin
  select * into v_profile from public.profiles where id = auth.uid() for update;
  if not found then
    raise exception 'Character sheet not found.';
  end if;

  if v_profile.chest_last_claimed = v_today then
    raise exception 'The chest is empty. Come back tomorrow, hero.';
  end if;

  -- gold scales with streak (loss aversion: keep the streak, bigger chest)
  v_streak_bonus := least(coalesce(v_profile.streak_count, 0) / 3, 20); -- +2 per 3-day streak, cap +20
  v_gold := 15 + v_streak_bonus;

  update public.profiles
    set gold = gold + v_gold, chest_last_claimed = v_today
    where id = v_profile.id
    returning * into v_profile;

  -- weighted loot roll: 55% nothing extra, 25% common badge, 12% consumable,
  -- 6% frame, 2% title
  if v_roll < 0.25 then
    select 'badge-stargazer' into v_reward_slug;
  elsif v_roll < 0.37 then
    select 'consumable-streak-freeze' into v_reward_slug;
  elsif v_roll < 0.43 then
    select 'frame-bronze' into v_reward_slug;
  elsif v_roll < 0.45 then
    select 'title-squire' into v_reward_slug;
  end if;

  if v_reward_slug is not null then
    select * into v_item from public.item_catalog
      where slug = v_reward_slug and purchasable;
    if found then
      v_reward_name := v_item.name;
      v_rarity := v_item.rarity::text;
      insert into public.user_items (profile_id, item_id, quantity)
        values (v_profile.id, v_item.id, 1)
        on conflict (profile_id, item_id)
        do update set quantity = public.user_items.quantity + 1;
    else
      v_reward_slug := null;
    end if;
  end if;

  insert into public.activity_log (profile_id, event, detail)
    values (v_profile.id, 'chest_claimed', jsonb_build_object(
      'gold', v_gold, 'item', v_reward_name, 'rarity', v_rarity
    ));

  return jsonb_build_object(
    'gold_gained', v_gold,
    'item_slug', v_reward_slug,
    'item_name', v_reward_name,
    'item_rarity', v_rarity,
    'profile', to_jsonb(v_profile)
  );
end;
$$;

-- ============ 7. GET SHEET v2: include gear + zones ============
create or replace function public.get_character_sheet()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'profile', (
      select to_jsonb(p) from public.profiles p where p.id = auth.uid()
    ),
    'attributes', (
      select jsonb_agg(jsonb_build_object(
        'attribute', a.attribute, 'xp', a.xp, 'level', a.level,
        'xp_needed', public.attr_xp_needed(a.level)
      ) order by a.attribute)
      from public.attributes a where a.profile_id = auth.uid()
    ),
    'gear', (
      select coalesce(jsonb_object_agg(slot, tier), '{}'::jsonb)
      from public.user_gear where profile_id = auth.uid()
    ),
    'inventory', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', ui.item_id,
        'slug', ic.slug,
        'name', ic.name,
        'description', ic.description,
        'kind', ic.kind,
        'rarity', ic.rarity,
        'glyph', ic.glyph,
        'price', ic.price,
        'quantity', ui.quantity,
        'equipped', ui.equipped
      ) order by ic.rarity, ic.name), '[]'::jsonb)
      from public.user_items ui
      join public.item_catalog ic on ic.id = ui.item_id
      where ui.profile_id = auth.uid()
    ),
    'zones', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', z.id, 'name', z.name, 'lore', z.lore,
        'unlock_level', z.unlock_level, 'order_index', z.order_index
      ) order by z.order_index), '[]'::jsonb)
      from public.zones z
    )
  );
$$;
