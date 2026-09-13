-- Einmal vollständig im Supabase SQL Editor ausführen.
-- Danach unter Authentication eine Lehrkraft anlegen und deren User-UUID
-- unten im letzten INSERT einsetzen.

create extension if not exists pgcrypto;

create table if not exists public.teacher_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Lehrkraft',
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  display_name text not null check (char_length(display_name) between 1 and 80),
  class_code text not null check (char_length(class_code) between 1 and 40),
  group_code text not null check (group_code in ('A','B','C','D','E')),
  device_id uuid not null,
  app_version text not null default '2.0.0',
  answers jsonb not null default '{}'::jsonb,
  reviewed boolean not null default false
);

create index if not exists submissions_submitted_at_idx on public.submissions (submitted_at desc);
create index if not exists submissions_class_code_idx on public.submissions (class_code);
create index if not exists submissions_group_code_idx on public.submissions (group_code);

alter table public.teacher_profiles enable row level security;
alter table public.submissions enable row level security;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.teacher_profiles
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_teacher() from public;
grant execute on function public.is_teacher() to authenticated;

drop policy if exists "Students may submit results" on public.submissions;
create policy "Students may submit results"
on public.submissions
for insert
to anon, authenticated
with check (
  char_length(display_name) between 1 and 80
  and char_length(class_code) between 1 and 40
  and group_code in ('A','B','C','D','E')
  and jsonb_typeof(answers) = 'object'
);

drop policy if exists "Teachers may read results" on public.submissions;
create policy "Teachers may read results"
on public.submissions
for select
to authenticated
using (public.is_teacher());

drop policy if exists "Teachers may update results" on public.submissions;
create policy "Teachers may update results"
on public.submissions
for update
to authenticated
using (public.is_teacher())
with check (public.is_teacher());

drop policy if exists "Teachers see their profile" on public.teacher_profiles;
create policy "Teachers see their profile"
on public.teacher_profiles
for select
to authenticated
using (user_id = auth.uid());

grant insert on table public.submissions to anon, authenticated;
grant select, update on table public.submissions to authenticated;
grant select on table public.teacher_profiles to authenticated;

-- NACH dem Anlegen der Lehrkraft ersetzen und einmal ausführen:
-- insert into public.teacher_profiles (user_id, display_name)
-- values ('HIER-DIE-USER-UUID-EINSETZEN', 'Simon Fischer');

