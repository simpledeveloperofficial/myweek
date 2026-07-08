begin;

alter table public.schedule_events
  add column if not exists homework_done boolean not null default false;

commit;
