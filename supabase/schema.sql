create extension if not exists pgcrypto;

create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  type text not null check (type in ('school', 'tutor', 'sport', 'hobby')),
  day text not null check (
    day in (
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    )
  ),
  start_time text not null,
  end_time text not null,
  location text not null default '',
  notes text not null default '',
  homework_done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists schedule_events_user_id_idx
  on public.schedule_events (user_id);

revoke all on table public.schedule_events from anon;
grant select, insert, update, delete on table public.schedule_events to authenticated;
grant select, insert, update, delete on table public.schedule_events to service_role;

alter table public.schedule_events enable row level security;

drop policy if exists "Users can view their own schedule events" on public.schedule_events;
create policy "Users can view their own schedule events"
  on public.schedule_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own schedule events" on public.schedule_events;
create policy "Users can create their own schedule events"
  on public.schedule_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own schedule events" on public.schedule_events;
create policy "Users can update their own schedule events"
  on public.schedule_events
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own schedule events" on public.schedule_events;
create policy "Users can delete their own schedule events"
  on public.schedule_events
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
