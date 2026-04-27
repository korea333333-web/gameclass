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
