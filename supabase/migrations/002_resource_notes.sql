-- ProdPath: Personal notes per resource
-- Execute this script in your Supabase Project's SQL Editor

create table if not exists public.resource_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  resource_id text not null,
  content text not null,
  updated_at timestamptz default now(),
  unique(user_id, resource_id)
);

alter table public.resource_notes enable row level security;

create policy "Users can read own notes"
  on public.resource_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.resource_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.resource_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.resource_notes for delete
  using (auth.uid() = user_id);
