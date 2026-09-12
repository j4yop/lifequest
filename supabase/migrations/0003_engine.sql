-- ============================================================================
-- LIFE QUEST PROGRESSION ENGINE — server-authoritative game logic
--
-- All reward math, level curves, streaks, and purchases happen inside these
-- security-definer functions, invoked as RPCs through PostgREST. The client
-- can only request an action; it can never compute or forge a reward.
--
-- Curves:
--   profile  xpNeeded(n) = round(100 * n^1.5)      — steep, non-linear
--   attribute xpNeeded(n) = round(40 * n^1.35)      — flatter, steadier
-- ============================================================================

create function public.xp_needed(profile_level int)
returns int
language sql
immutable
as $$
  select round(100 * power(profile_level::numeric, 1.5))::int;
$$;

create function public.attr_xp_needed(attr_level int)
returns int
language sql
immutable
as $$
  select round(40 * power(attr_level::numeric, 1.35))::int;
$$;

-- Tier payout table used by complete_task.
create function public.tier_rewards(tier public.difficulty_tier)
returns table (xp int, gold int)
language sql
immutable
as $$
  select case tier
           when 'trivial' then 10
           when 'easy'    then 25
           when 'medium'  then 50
           when 'hard'    then 100
           when 'epic'    then 200
         end,
         case tier
           when 'trivial' then 5
           when 'easy'    then 10
           when 'medium'  then 20
           when 'hard'    then 45
           when 'epic'    then 100
         end;
$$;

-- ============================================================================
-- complete_task(task_id) — the atomic victory transaction.
--   1. Lock the task; verify ownership + not completed (anti double-click).
--   2. Mark completed; pay tier XP + gold to profile.
--   3. Pay attribute XP; roll attribute level-ups.
--   4. Roll profile level while xp covers next threshold.
--   5. Update streak by UTC day, honoring an equipped Streak Freeze.
--   6. Log the activity.
-- Returns the refreshed character sheet + what happened (for celebration FX).
-- ============================================================================
create function public.complete_task(task_id uuid)
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
  v_gap int;
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
  update public.profiles
    set xp = xp + v_xp, gold = gold + v_gold
    where id = v_profile.id
    returning * into v_profile;

  -- 3. Attribute XP + level rolls (deterministic loop, same shape as profile).
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

  -- 5. Streak (UTC days). yesterday = +1; older gap: freeze once or reset.
  if v_profile.last_active_date is null or v_profile.streak_count = 0 then
    v_streak_increased := true;
    update public.profiles
      set streak_count = 1, streak_best = greatest(streak_best, 1), last_active_date = v_today
      where id = v_profile.id;
  elsif v_today = v_profile.last_active_date then
    null; -- already active today, streak unchanged
  elsif v_today - v_profile.last_active_date = 1 then
    v_streak_increased := true;
    update public.profiles
      set streak_count = streak_count + 1,
          streak_best = greatest(streak_best, streak_count + 1),
          last_active_date = v_today
      where id = v_profile.id;
  else
    -- gap of 2+ days: consume an equipped freeze once, else reset
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

  -- 6. Log.
  insert into public.activity_log (profile_id, event, detail)
    values (v_profile.id, 'task_completed', jsonb_build_object(
      'task_id', task_id,
      'title', v_task.title,
      'tier', v_task.tier,
      'xp', v_xp,
      'gold', v_gold,
      'attribute', v_task.attribute,
      'leveled_up', v_leveled_up,
      'new_level', v_profile.level
    ));

  -- Return refreshed sheet + FX descriptor.
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
    'profile', to_jsonb(v_profile),
    'attributes', (
      select jsonb_agg(jsonb_build_object(
        'attribute', a.attribute, 'xp', a.xp, 'level', a.level,
        'xp_needed', public.attr_xp_needed(a.level)
      ) order by a.attribute)
      from public.attributes a where a.profile_id = v_profile.id
    )
  );
end;
$$;

-- ============================================================================
-- reopen_task(task_id) — let a hero undo a mistaken completion.
-- This is a cosmetic undo: rewards already paid stay paid (and are NOT
-- re-earnable — the task cannot be completed twice).
-- ============================================================================
create function public.reopen_task(task_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tasks
    set completed = false, completed_at = null, updated_at = now()
    where id = task_id and profile_id = auth.uid() and completed = true;
  if not found then
    raise exception 'Quest not found, not yours, or already open.';
  end if;
end;
$$;

-- ============================================================================
-- purchase_item(item_id) — atomic shop transaction.
--   1. Lock profile; verify price affordable.
--   2. Deduct gold, upsert user_items (stack consumables).
--   3. Log.
-- ============================================================================
create function public.purchase_item(item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.item_catalog;
  v_profile public.profiles;
  v_stackable boolean;
begin
  select * into v_item from public.item_catalog where id = item_id and purchasable;
  if not found then
    raise exception 'That item is not for sale.';
  end if;

  select * into v_profile from public.profiles where id = auth.uid() for update;

  if v_profile.gold < v_item.price then
    raise exception 'Not enough gold, hero. % more needed.', v_item.price - v_profile.gold;
  end if;

  update public.profiles
    set gold = gold - v_item.price
    where id = v_profile.id
    returning * into v_profile;

  v_stackable := v_item.kind = 'consumable';
  if v_stackable then
    insert into public.user_items (profile_id, item_id, quantity)
      values (v_profile.id, v_item.id, 1)
      on conflict (profile_id, item_id)
      do update set quantity = public.user_items.quantity + 1;
  else
    insert into public.user_items (profile_id, item_id, quantity)
      values (v_profile.id, v_item.id, 1)
      on conflict (profile_id, item_id) do nothing;
  end if;

  insert into public.activity_log (profile_id, event, detail)
    values (v_profile.id, 'item_purchased', jsonb_build_object(
      'item', v_item.name, 'price', v_item.price
    ));

  return jsonb_build_object(
    'purchased', v_item.slug,
    'gold_remaining', v_profile.gold
  );
end;
$$;

-- ============================================================================
-- equip_item / unequip_item — swap the single equipped frame/title/theme.
-- ============================================================================
create function public.equip_item(item_id uuid, want_equipped boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind public.item_kind;
begin
  select ic.kind into v_kind
    from public.item_catalog ic
    join public.user_items ui on ui.item_id = ic.id
    where ic.id = item_id and ui.profile_id = auth.uid();

  if v_kind is null then
    raise exception 'You do not own that item.';
  end if;

  -- Unequip all others of the same kind, then equip the chosen one.
  update public.user_items
    set equipped = false
    where profile_id = auth.uid()
      and equipped
      and item_id in (select id from public.item_catalog where kind = v_kind);

  update public.user_items
    set equipped = want_equipped
    where profile_id = auth.uid() and item_id = item_id;
end;
$$;

-- ============================================================================
-- get_character_sheet() — one-call load of the whole board.
-- ============================================================================
create function public.get_character_sheet()
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
    )
  );
$$;
