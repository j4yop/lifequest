-- ============================================================================
-- FIX: guild-shop purchases failing with 42702 "column reference 'item_id'
-- is ambiguous".
--
-- purchase_item(item_id) and equip_item(item_id) declare a PL/pgSQL
-- parameter whose name collides with user_items.item_id. Inside
-- INSERT ... ON CONFLICT (profile_id, item_id) and
-- UPDATE ... where item_id = item_id, PL/pgSQL substitutes the parameter
-- for the column reference, producing an ambiguous / always-true predicate.
-- Affected every real purchase (the INSERT is only planned after the
-- gold check passes), so all buys rolled back with "Purchase failed."
--
-- Fix: copy the parameter into a non-colliding local (v_item_id) for regular
-- references, and use the ON CONSTRAINT form of ON CONFLICT — the constraint
-- target contains no column references, so PL/pgSQL cannot substitute the
-- parameter there. UPDATE ... WHERE uses table-qualified references.
-- The unique constraint name is the deterministic auto-generated name from
-- migration 0001's `unique (profile_id, item_id)` on public.user_items.
-- RPC parameter names are unchanged, so existing client calls keep working.
-- ============================================================================

create or replace function public.purchase_item(item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid := item_id;
  v_item public.item_catalog;
  v_profile public.profiles;
begin
  select * into v_item from public.item_catalog where id = v_item_id and purchasable;
  if not found then
    raise exception 'That item is not for sale.';
  end if;

  -- Non-consumables are one-per-hero: refuse a second copy BEFORE any gold
  -- moves (guards against double-clicks and two-tab races).
  if v_item.kind <> 'consumable' and exists (
    select 1 from public.user_items ui
    where ui.profile_id = auth.uid() and ui.item_id = v_item.id
  ) then
    raise exception 'You already own that item, hero.';
  end if;

  select * into v_profile from public.profiles where id = auth.uid() for update;
  if not found then
    raise exception 'Character sheet not found.';
  end if;

  if v_profile.gold < v_item.price then
    raise exception 'Not enough gold, hero. % more needed.', v_item.price - v_profile.gold;
  end if;

  update public.profiles
    set gold = gold - v_item.price
    where id = v_profile.id
    returning * into v_profile;

  if v_item.kind = 'consumable' then
    insert into public.user_items (profile_id, item_id, quantity)
      values (v_profile.id, v_item.id, 1)
      on conflict on constraint user_items_profile_id_item_id_key
      do update set quantity = public.user_items.quantity + 1;
  else
    insert into public.user_items (profile_id, item_id, quantity)
      values (v_profile.id, v_item.id, 1)
      on conflict on constraint user_items_profile_id_item_id_key
      do nothing;
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

create or replace function public.equip_item(item_id uuid, want_equipped boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid := item_id;
  v_kind public.item_kind;
begin
  select ic.kind into v_kind
    from public.item_catalog ic
    join public.user_items ui on ui.item_id = ic.id
    where ic.id = v_item_id and ui.profile_id = auth.uid();

  if v_kind is null then
    raise exception 'You do not own that item.';
  end if;

  -- Unequip all others of the same kind, then equip the chosen one.
  update public.user_items
    set equipped = false
    where profile_id = auth.uid()
      and equipped
      and public.user_items.item_id in
        (select ic.id from public.item_catalog ic where ic.kind = v_kind);

  update public.user_items
    set equipped = want_equipped
    where public.user_items.profile_id = auth.uid()
      and public.user_items.item_id = v_item_id;
end;
$$;
