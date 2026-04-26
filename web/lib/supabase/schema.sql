-- =========================================================================
-- GameClass — Sprint 1 schema
-- profiles (학번, 이름, 학년) + RLS
-- 실행: Supabase 대시보드 SQL Editor 또는 supabase db push
-- =========================================================================

-- profiles 테이블
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  student_id text unique not null check (student_id ~ '^\d{8}$'),
  name text not null check (char_length(name) between 2 and 10),
  grade smallint not null check (grade between 1 and 4),
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.profiles enable row level security;

-- 본인만 SELECT
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 본인만 INSERT
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 본인만 UPDATE
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- updated_at 자동 갱신 함수
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
