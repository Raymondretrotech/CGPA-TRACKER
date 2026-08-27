-- CGPA CUMULATIVE TRACKER — Supabase schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- on a fresh project. Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE.

-- ============================================================
-- 1. profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  university text,
  department text,
  programme text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by their owner" on public.profiles;
create policy "Profiles are viewable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are editable by their owner" on public.profiles;
create policy "Profiles are editable by their owner"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by their owner" on public.profiles;
create policy "Profiles are insertable by their owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up, seeded from
-- the metadata passed to supabase.auth.signUp({ options: { data: {...} } }).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, university, department, programme)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'university',
    new.raw_user_meta_data ->> 'department',
    new.raw_user_meta_data ->> 'programme'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. semesters
-- ============================================================
create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  level int not null check (level in (100, 200, 300, 400, 500, 600, 700)),
  semester int not null check (semester in (1, 2)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, level, semester)
);

alter table public.semesters enable row level security;

drop policy if exists "Semesters are owned by the user" on public.semesters;
create policy "Semesters are owned by the user"
  on public.semesters for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 3. courses
-- ============================================================
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  semester_id uuid not null references public.semesters (id) on delete cascade,
  course_code text not null,
  course_title text not null,
  credit_unit int not null check (credit_unit between 1 and 10),
  grade text not null check (grade in ('A', 'B', 'C', 'D', 'E', 'F')),
  grade_point numeric not null default 0,
  quality_point numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

drop policy if exists "Courses are owned by the user" on public.courses;
create policy "Courses are owned by the user"
  on public.courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists courses_semester_id_idx on public.courses (semester_id);
create index if not exists courses_user_id_idx on public.courses (user_id);

-- Grade point / quality point are always derived server-side, never trusted
-- from client input, so results can't be tampered with.
create or replace function public.calculate_course_points()
returns trigger as $$
declare
  gp numeric;
begin
  gp := case new.grade
    when 'A' then 5
    when 'B' then 4
    when 'C' then 3
    when 'D' then 2
    when 'E' then 1
    when 'F' then 0
    else 0
  end;
  new.grade_point := gp;
  new.quality_point := new.credit_unit * gp;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_course_points on public.courses;
create trigger set_course_points
  before insert or update on public.courses
  for each row execute procedure public.calculate_course_points();

-- Keep profiles.updated_at / semesters.updated_at fresh on edit.
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_semesters_updated_at on public.semesters;
create trigger touch_semesters_updated_at
  before update on public.semesters
  for each row execute procedure public.touch_updated_at();
