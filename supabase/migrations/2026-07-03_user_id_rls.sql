begin;

create extension if not exists pgcrypto;

alter table public.schedule_events
  add column if not exists user_id uuid;

update public.schedule_events as schedule_events
set user_id = auth_users.id
from auth.users as auth_users
where schedule_events.user_id is null
  and schedule_events.device_id = auth_users.id::text;

delete from public.schedule_events
where user_id is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'schedule_events_user_id_fkey'
  ) then
    alter table public.schedule_events
      add constraint schedule_events_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;
end $$;

alter table public.schedule_events
  alter column user_id set not null;

create index if not exists schedule_events_user_id_idx
  on public.schedule_events (user_id);

drop index if exists public.schedule_events_device_id_idx;

alter table public.schedule_events
  drop column if exists device_id;

revoke all on table public.schedule_events from anon;
grant select, insert, update, delete on table public.schedule_events to authenticated;
grant select, insert, update, delete on table public.schedule_events to service_role;

alter table public.schedule_events enable row level security;

drop policy if exists "temporary public access for mvp" on public.schedule_events;
drop policy if exists "Users can view their own schedule events" on public.schedule_events;
drop policy if exists "Users can create their own schedule events" on public.schedule_events;
drop policy if exists "Users can update their own schedule events" on public.schedule_events;
drop policy if exists "Users can delete their own schedule events" on public.schedule_events;

create policy "Users can view their own schedule events"
  on public.schedule_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own schedule events"
  on public.schedule_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own schedule events"
  on public.schedule_events
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own schedule events"
  on public.schedule_events
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

commit;

-- Recommended project-wide hardening for future public objects.
-- Run this only if you want new tables/functions/sequences in public
-- to stop getting automatic Data API access by default.
--
-- alter default privileges for role postgres in schema public
--   revoke select, insert, update, delete on tables from anon, authenticated, service_role;
--
-- alter default privileges for role postgres in schema public
--   revoke execute on functions from anon, authenticated, service_role;
--
-- alter default privileges for role postgres in schema public
--   revoke usage, select on sequences from anon, authenticated, service_role;
--
-- alter default privileges for role postgres in schema public
--   revoke execute on functions from public;
