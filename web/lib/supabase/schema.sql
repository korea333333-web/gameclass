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
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. roster — 사전 등록 명단 (어드민 화이트리스트)
-- -------------------------------------------------------------------------
create table if not exists public.roster (
  student_id text primary key check (student_id ~ '^\d{7,8}$'),
  name text not null check (char_length(name) between 2 and 10),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roster enable row level security;

-- -------------------------------------------------------------------------
-- 2. profiles — 가입한 사용자(학생 + 어드민)
--    학번/이름은 roster에서 자동 채워짐, 학년만 학생 본인이 입력
--    role 컬럼으로 어드민 분리
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  student_id text unique check (student_id ~ '^\d{7,8}$'),
  name text check (char_length(name) between 2 and 10),
  grade smallint check (grade between 1 and 4),
  role text not null default 'student' check (role in ('student', 'admin')),
  is_active boolean not null default false,
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 기존 테이블에 컬럼이 없으면 추가 (멱등)
alter table public.profiles
  add column if not exists is_active boolean not null default false;

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
--    → 명단 자체는 노출되지 않음
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
-- 7. handle_new_student RPC — 가입 직후 profiles 자동 생성
--    학번/이름은 roster에서 가져와 자동 채움
--    호출자는 인증된 본인만 가능
-- -------------------------------------------------------------------------
-- (handle_new_student RPC는 더 이상 사용하지 않습니다 — signup API route에서 직접 처리)

-- -------------------------------------------------------------------------
-- 8. updated_at 자동 갱신 트리거
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

-- -------------------------------------------------------------------------
-- 9. (선택) 학번 → 이메일 매핑 함수
--    학번을 가짜 이메일로 변환하는 일관된 규칙 (클라이언트에서도 같이 사용)
--    ex) 2026038001 → 2026038001@gameclass.local
-- -------------------------------------------------------------------------
-- (DB 함수로 만들지 않고 클라이언트에서 단순 문자열 조합으로 처리)
