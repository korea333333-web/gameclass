-- =========================================================================
-- GameClass — Sprint 1 schema (2026-04-27 인증 리워크: 학번+비번 + roster)
--
-- 실행 방법:
--   1) Supabase 대시보드 → SQL Editor → New query
--   2) 이 파일 전체 내용 복사 후 붙여넣기 → Run
--
-- 안전성:
--   - 모든 객체는 IF NOT EXISTS / OR REPLACE / DROP IF EXISTS 패턴
--   - 여러 번 실행해도 안전 (멱등성)
--   - 기존 테이블에도 누락 컬럼/제약을 알아서 추가
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. roster — 사전 등록 명단 (어드민 화이트리스트)
-- -------------------------------------------------------------------------
create table if not exists public.roster (
  student_id text primary key check (student_id ~ '^\d{7,10}$'),
  name text not null check (char_length(name) between 2 and 10),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 기존 테이블의 옛 check 제약 정리 후 새 제약 적용 (멱등)
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.roster'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%student_id%'
  loop
    execute 'alter table public.roster drop constraint ' || quote_ident(r.conname);
  end loop;

  for r in
    select conname from pg_constraint
    where conrelid = 'public.roster'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%name%'
  loop
    execute 'alter table public.roster drop constraint ' || quote_ident(r.conname);
  end loop;
end $$;

alter table public.roster
  add constraint roster_student_id_check
    check (student_id ~ '^\d{7,10}$');

alter table public.roster
  add constraint roster_name_check
    check (char_length(name) between 2 and 10);

alter table public.roster enable row level security;

-- -------------------------------------------------------------------------
-- 2. profiles — 가입한 사용자(학생 + 어드민)
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  student_id text unique,
  name text,
  grade smallint,
  role text not null default 'student',
  is_active boolean not null default false,
  avatar_url text,
  xp integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 기존 테이블에 누락 컬럼 추가 (멱등)
alter table public.profiles
  add column if not exists student_id text,
  add column if not exists name text,
  add column if not exists grade smallint,
  add column if not exists role text not null default 'student',
  add column if not exists is_active boolean not null default false,
  add column if not exists avatar_url text,
  add column if not exists xp integer not null default 0;

-- 어드민은 학번/이름/학년 비어도 되도록 NOT NULL 제거
alter table public.profiles
  alter column student_id drop not null,
  alter column name drop not null,
  alter column grade drop not null;

-- 제약 정리 — 기존 옛 제약을 떼고 새 제약으로 일관 적용
alter table public.profiles drop constraint if exists profiles_student_id_check;
alter table public.profiles
  add constraint profiles_student_id_check
    check (student_id is null or student_id ~ '^\d{7,10}$');

alter table public.profiles drop constraint if exists profiles_name_check;
alter table public.profiles
  add constraint profiles_name_check
    check (name is null or char_length(name) between 2 and 10);

alter table public.profiles drop constraint if exists profiles_grade_check;
alter table public.profiles
  add constraint profiles_grade_check
    check (grade is null or grade between 1 and 4);

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
    check (role in ('student', 'admin'));

alter table public.profiles drop constraint if exists profiles_xp_check;
alter table public.profiles
  add constraint profiles_xp_check check (xp >= 0);

-- student_id unique 보장 (이미 있으면 무시)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_student_id_key'
  ) then
    alter table public.profiles
      add constraint profiles_student_id_key unique (student_id);
  end if;
end $$;

alter table public.profiles enable row level security;

-- -------------------------------------------------------------------------
-- 3. is_admin() helper — 현재 로그인 사용자가 어드민인지 확인
-- -------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- -------------------------------------------------------------------------
-- 4. RLS 정책 — profiles
-- -------------------------------------------------------------------------
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- -------------------------------------------------------------------------
-- 5. RLS 정책 — roster
--    학생 본인은 직접 SELECT 불가 (다른 학생 명단 노출 방지)
--    가입 시 매칭 확인은 RPC 함수(verify_roster)로만 처리
--    어드민만 모든 작업 가능
-- -------------------------------------------------------------------------
drop policy if exists "Admins manage roster" on public.roster;
create policy "Admins manage roster"
  on public.roster for all
  using (public.is_admin())
  with check (public.is_admin());

-- -------------------------------------------------------------------------
-- 6. verify_roster RPC — 가입 시 학번+이름 매칭 확인 (anon 호출 가능)
--    SECURITY DEFINER로 roster RLS 우회, 결과는 boolean만 반환
-- -------------------------------------------------------------------------
create or replace function public.verify_roster(
  p_student_id text,
  p_name text
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.roster
    where student_id = p_student_id
      and name = p_name
  );
$$;

revoke all on function public.verify_roster(text, text) from public;
grant execute on function public.verify_roster(text, text) to anon, authenticated;

-- -------------------------------------------------------------------------
-- 7. updated_at 자동 갱신 트리거
-- -------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists roster_updated_at on public.roster;
create trigger roster_updated_at
  before update on public.roster
  for each row execute function public.handle_updated_at();

-- =========================================================================
-- Sprint 2: 시간표 + 과제 + 공유 코드
-- =========================================================================

-- -------------------------------------------------------------------------
-- 8. schedule_entries — 시간표 항목 (사용자별)
-- -------------------------------------------------------------------------
create table if not exists public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  day_of_week smallint not null check (day_of_week between 1 and 5),
  start_minute smallint not null check (start_minute between 540 and 1320),
  end_minute smallint not null check (end_minute between 570 and 1320),
  location text check (location is null or char_length(location) <= 30),
  professor text check (professor is null or char_length(professor) <= 20),
  color text not null default 'mustard'
    check (color in ('brick','mustard','olive','slate','mauve','terracotta','ink')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_entries_time_order check (start_minute < end_minute)
);

create index if not exists schedule_entries_user_idx
  on public.schedule_entries(user_id);

alter table public.schedule_entries enable row level security;

drop policy if exists "Users manage own schedule entries" on public.schedule_entries;
create policy "Users manage own schedule entries"
  on public.schedule_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists schedule_entries_updated_at on public.schedule_entries;
create trigger schedule_entries_updated_at
  before update on public.schedule_entries
  for each row execute function public.handle_updated_at();

-- -------------------------------------------------------------------------
-- 9. share_codes — 시간표 공유 코드 (사용자당 1개)
-- -------------------------------------------------------------------------
create table if not exists public.share_codes (
  code text primary key check (char_length(code) = 6),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.share_codes enable row level security;

drop policy if exists "Users see own share code" on public.share_codes;
create policy "Users see own share code"
  on public.share_codes for select
  using (auth.uid() = user_id);

drop policy if exists "Users delete own share code" on public.share_codes;
create policy "Users delete own share code"
  on public.share_codes for delete
  using (auth.uid() = user_id);

-- -------------------------------------------------------------------------
-- 10. generate_share_code RPC — 본인 공유 코드 발급(있으면 재사용)
--     혼동 글자 0/O/1/I 제외한 31개 문자에서 6자리 랜덤
-- -------------------------------------------------------------------------
create or replace function public.generate_share_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
  v_existing text;
  v_i int;
  v_attempt int;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  select code into v_existing from public.share_codes where user_id = v_uid;
  if v_existing is not null then
    return v_existing;
  end if;

  for v_attempt in 1..10 loop
    v_code := '';
    for v_i in 1..6 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;

    begin
      insert into public.share_codes (code, user_id) values (v_code, v_uid);
      return v_code;
    exception when unique_violation then
      -- 충돌, 재시도
    end;
  end loop;

  raise exception 'code_generation_failed';
end;
$$;

revoke all on function public.generate_share_code() from public;
grant execute on function public.generate_share_code() to authenticated;

-- -------------------------------------------------------------------------
-- 11. copy_schedule_from_code RPC — 코드로 다른 사용자 시간표 복사
--     본인 기존 시간표는 삭제 후 덮어씀
-- -------------------------------------------------------------------------
create or replace function public.copy_schedule_from_code(p_code text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_source uuid;
  v_count int;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  select user_id into v_source
  from public.share_codes
  where code = upper(p_code);

  if v_source is null then
    raise exception 'invalid_code';
  end if;

  if v_source = v_uid then
    raise exception 'own_code';
  end if;

  delete from public.schedule_entries where user_id = v_uid;

  insert into public.schedule_entries
    (user_id, name, day_of_week, start_minute, end_minute, location, professor, color)
  select v_uid, name, day_of_week, start_minute, end_minute, location, professor, color
  from public.schedule_entries
  where user_id = v_source;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.copy_schedule_from_code(text) from public;
grant execute on function public.copy_schedule_from_code(text) to authenticated;

-- -------------------------------------------------------------------------
-- 12. tasks — 과제 To-do
-- -------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  due_at timestamptz not null,
  schedule_entry_id uuid references public.schedule_entries(id) on delete set null,
  subject_label text check (subject_label is null or char_length(subject_label) <= 30),
  label text not null default 'personal'
    check (label in ('personal','team','exam','presentation','quiz')),
  memo text check (memo is null or char_length(memo) <= 500),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_due_idx
  on public.tasks(user_id, due_at);

alter table public.tasks enable row level security;

drop policy if exists "Users manage own tasks" on public.tasks;
create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();
