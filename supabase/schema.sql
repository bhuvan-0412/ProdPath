-- ProdPath Supabase Database Schema Migration
-- Execute this script in your Supabase Project's SQL Editor

-- 1. Create Tables
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  is_admin boolean default false,
  marketing_opt_in boolean default false,
  has_seen_opt_in boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  resource_id text not null,
  completed_at timestamptz default now(),
  unique(user_id, resource_id)
);

create table if not exists public.custom_resources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  url text,
  type text not null,
  week_id text,
  notes text,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.custom_resources enable row level security;

-- Helper function to check if executing user is admin safely
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- 3. RLS Policies for Profiles
create policy "Users can read own profile or admin reads all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. RLS Policies for User Progress
create policy "Users can read own progress or admin reads all"
  on public.user_progress for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on public.user_progress for delete
  using (auth.uid() = user_id);

-- 5. RLS Policies for Custom Resources
create policy "Users can read own custom resources"
  on public.custom_resources for select
  using (auth.uid() = user_id);

create policy "Users can insert own custom resources"
  on public.custom_resources for insert
  with check (auth.uid() = user_id);

create policy "Users can update own custom resources"
  on public.custom_resources for update
  using (auth.uid() = user_id);

create policy "Users can delete own custom resources"
  on public.custom_resources for delete
  using (auth.uid() = user_id);

-- 6. Trigger to automatically create profile on Google / OAuth Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, is_admin, marketing_opt_in, has_seen_opt_in)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    false,
    false,
    false
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution binding
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
