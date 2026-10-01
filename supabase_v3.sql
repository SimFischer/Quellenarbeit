-- Einmal im SQL Editor als postgres ausführen. Erhält alle Altdaten.
begin;

create table if not exists public.teacher_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Lehrkraft', created_at timestamptz not null default now()
);
alter table public.teacher_profiles enable row level security;
revoke all on public.teacher_profiles from anon, authenticated;
grant select on public.teacher_profiles to authenticated;
drop policy if exists "Teachers see their profile" on public.teacher_profiles;
create policy "Teachers see their profile" on public.teacher_profiles for select to authenticated using (user_id = auth.uid());

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(user_id),
  name text not null check (char_length(name) between 1 and 80),
  exchange_open boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists courses_teacher_idx on public.courses(teacher_id);
create table if not exists public.course_students (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  seat integer not null check (seat between 1 and 100),
  -- New codes: 8 base32 characters (40 random bits). Legacy codes remain valid.
  access_code text not null unique check (access_code ~ '^([0123456789abcdefghjkmnpqrstvwxyz]{8}|[a-f0-9]{24})$'),
  unique(course_id, seat)
);
create table if not exists public.course_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.course_students(id) on delete cascade,
  group_code text not null check (group_code in ('A','B','C','D','E')),
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  submitted_at timestamptz not null default now(),
  reviewed boolean not null default false
);
alter table public.courses enable row level security;
alter table public.course_students enable row level security;
alter table public.course_submissions enable row level security;
revoke all on public.courses, public.course_students, public.course_submissions from anon, authenticated;
grant select on public.courses, public.course_students, public.course_submissions to authenticated;
grant update(exchange_open) on public.courses to authenticated;
grant update(reviewed) on public.course_submissions to authenticated;

drop policy if exists own_courses on public.courses;
create policy own_courses on public.courses for select to authenticated using (teacher_id = auth.uid());
drop policy if exists own_course_gate on public.courses;
create policy own_course_gate on public.courses for update to authenticated using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists own_students on public.course_students;
create policy own_students on public.course_students for select to authenticated using (exists (select 1 from public.courses c where c.id = course_id and c.teacher_id = auth.uid()));
drop policy if exists own_submissions on public.course_submissions;
create policy own_submissions on public.course_submissions for select to authenticated using (exists (select 1 from public.course_students s join public.courses c on c.id = s.course_id where s.id = student_id and c.teacher_id = auth.uid()));
drop policy if exists review_own_submissions on public.course_submissions;
create policy review_own_submissions on public.course_submissions for update to authenticated using (exists (select 1 from public.course_students s join public.courses c on c.id = s.course_id where s.id = student_id and c.teacher_id = auth.uid())) with check (exists (select 1 from public.course_students s join public.courses c on c.id = s.course_id where s.id = student_id and c.teacher_id = auth.uid()));

-- Also update the constraint on an existing installation.
alter table public.course_students drop constraint if exists course_students_access_code_check;
alter table public.course_students add constraint course_students_access_code_check
  check (access_code ~ '^([0123456789abcdefghjkmnpqrstvwxyz]{8}|[a-f0-9]{24})$');

create or replace function public.new_student_code() returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := '0123456789abcdefghjkmnpqrstvwxyz';
  bits bigint := ('x' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))::bit(40)::bigint;
  result text := '';
begin
  for i in 1..8 loop
    result := substr(alphabet, (bits & 31)::integer + 1, 1) || result;
    bits := bits >> 5;
  end loop;
  return result;
end $$;
revoke all on function public.new_student_code() from public, anon, authenticated;

create or replace function public.create_course(p_name text, p_count integer) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_i integer; v_student uuid;
begin
  if not exists(select 1 from public.teacher_profiles where user_id = auth.uid()) then raise exception 'Kein Lehrerzugang.'; end if;
  if p_name is null or char_length(trim(p_name)) not between 1 and 80 or p_count is null or p_count not between 1 and 100 then raise exception 'Kursname und 1–100 Schülerplätze angeben.'; end if;
  insert into public.courses(teacher_id, name) values(auth.uid(), trim(p_name)) returning id into v_id;
  for v_i in 1..p_count loop
    loop
      insert into public.course_students(course_id, seat, access_code)
        values(v_id, v_i, public.new_student_code())
        on conflict (access_code) do nothing returning id into v_student;
      exit when v_student is not null;
    end loop;
  end loop;
  return v_id;
end $$;

create or replace function public.replace_student_code(p_student uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare v_code text;
begin
  loop
    begin
      update public.course_students s set access_code = public.new_student_code()
      where s.id = p_student and exists(select 1 from public.courses c where c.id = s.course_id and c.teacher_id = auth.uid())
      returning access_code into v_code;
      exit;
    exception when unique_violation then
      -- Retry the very unlikely random-code collision.
    end;
  end loop;
  if v_code is null then raise exception 'Schülerplatz nicht gefunden.'; end if;
  return v_code;
end $$;

create or replace function public.student_context(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if p_code is null or p_code !~ '^([0123456789abcdefghjkmnpqrstvwxyz]{8}|[a-f0-9]{24})$' then raise exception 'Zugangscode ungültig.'; end if;
  select jsonb_build_object('student_id', s.id, 'seat', s.seat, 'course_id', c.id, 'course_name', c.name, 'exchange_open', c.exchange_open)
    into v_result from public.course_students s join public.courses c on c.id = s.course_id where s.access_code = p_code;
  if v_result is null then raise exception 'Zugangscode ungültig oder ersetzt. Bitte die Lehrkraft fragen.'; end if;
  return v_result;
end $$;

create or replace function public.submit_course_work(p_code text, p_group text, p_answers jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_student uuid; v_id uuid;
begin
  if p_code is null or p_code !~ '^([0123456789abcdefghjkmnpqrstvwxyz]{8}|[a-f0-9]{24})$' then raise exception 'Zugangscode ungültig.'; end if;
  -- Row lock makes code replacement and submission mutually exclusive.
  select id into v_student from public.course_students where access_code = p_code for update;
  if v_student is null then raise exception 'Zugangscode ungültig oder ersetzt.'; end if;
  if p_group is null or p_group not in ('A','B','C','D','E') or p_answers is null or jsonb_typeof(p_answers) <> 'object' or octet_length(p_answers::text) > 200000 then raise exception 'Abgabe ungültig oder zu groß.'; end if;
  insert into public.course_submissions(student_id, group_code, answers)
    values(v_student, p_group, p_answers - array['student_name','display_name','class_code','access_code','code','course_id','student_id','device_id'])
    on conflict(student_id) do update set group_code = excluded.group_code, answers = excluded.answers, submitted_at = now(), reviewed = false
    returning id into v_id;
  return v_id;
end $$;

revoke all on function public.create_course(text, integer), public.replace_student_code(uuid), public.student_context(text), public.submit_course_work(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.create_course(text, integer), public.replace_student_code(uuid) to authenticated;
grant execute on function public.student_context(text), public.submit_course_work(text,text,jsonb) to anon, authenticated;

-- Old tables remain intact but are no longer exposed by the browser API.
-- Existing results can be exported by the project administrator in the dashboard.
do $$ begin
  if to_regclass('public.submissions') is not null then
    revoke all on public.submissions from anon, authenticated;
  end if;
  if to_regclass('public.class_gates') is not null then
    revoke all on public.class_gates from anon, authenticated;
  end if;
end $$;
notify pgrst, 'reload schema';
commit;
