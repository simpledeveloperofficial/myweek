begin;

alter table public.schedule_events
  add column if not exists notes text not null default '';

commit;
