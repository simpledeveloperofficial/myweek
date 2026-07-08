begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(nickname)) between 3 and 24)
);

create unique index if not exists profiles_nickname_lower_idx
  on public.profiles ((lower(trim(nickname))));

create table if not exists public.monthly_points (
  user_id uuid not null references auth.users (id) on delete cascade,
  month_key date not null,
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, month_key)
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, friend_user_id),
  check (user_id <> friend_user_id)
);

revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

revoke all on table public.monthly_points from anon;
grant select, insert, update on table public.monthly_points to authenticated;
grant select, insert, update, delete on table public.monthly_points to service_role;

revoke all on table public.friendships from anon;
grant select, insert, delete on table public.friendships to authenticated;
grant select, insert, update, delete on table public.friendships to service_role;

alter table public.profiles enable row level security;
alter table public.monthly_points enable row level security;
alter table public.friendships enable row level security;

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Authenticated users can view monthly points" on public.monthly_points;
create policy "Authenticated users can view monthly points"
  on public.monthly_points
  for select
  to authenticated
  using (true);

drop policy if exists "Users can create their own monthly points" on public.monthly_points;
create policy "Users can create their own monthly points"
  on public.monthly_points
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own monthly points" on public.monthly_points;
create policy "Users can update their own monthly points"
  on public.monthly_points
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own friendships" on public.friendships;
create policy "Users can view their own friendships"
  on public.friendships
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own friendships" on public.friendships;
create policy "Users can create their own friendships"
  on public.friendships
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own friendships" on public.friendships;
create policy "Users can delete their own friendships"
  on public.friendships
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

commit;
