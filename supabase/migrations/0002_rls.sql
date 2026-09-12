-- Row Level Security: every user sees and touches only their own rows.
alter table public.profiles enable row level security;
alter table public.attributes enable row level security;
alter table public.tasks enable row level security;
alter table public.item_catalog enable row level security;
alter table public.user_items enable row level security;
alter table public.activity_log enable row level security;

-- ——— profiles ———
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);
-- insert/delete happen only via the security-definer trigger; no direct policies.

-- ——— attributes ———
create policy "attributes: read own" on public.attributes
  for select using (auth.uid() = profile_id);
-- mutations happen only inside security-definer RPCs.

-- ——— tasks ———
create policy "tasks: read own" on public.tasks
  for select using (auth.uid() = profile_id);
create policy "tasks: insert own" on public.tasks
  for insert with check (auth.uid() = profile_id);
create policy "tasks: update own" on public.tasks
  for update using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
create policy "tasks: delete own" on public.tasks
  for delete using (auth.uid() = profile_id);

-- ——— item catalog: readable by all authenticated, mutated by no one (via API) ———
create policy "catalog: read all" on public.item_catalog
  for select using (auth.role() = 'authenticated');

-- ——— user items ———
create policy "user_items: read own" on public.user_items
  for select using (auth.uid() = profile_id);

-- ——— activity log ———
create policy "activity: read own" on public.activity_log
  for select using (auth.uid() = profile_id);
