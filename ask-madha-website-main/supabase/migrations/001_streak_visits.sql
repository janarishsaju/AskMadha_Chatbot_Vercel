-- Streak tracking table: one row per user per day they open the app/website
create table if not exists public.streak_visits (
  user_id    uuid not null references auth.users(id) on delete cascade,
  visit_date date not null default current_date,
  created_at timestamptz not null default now(),
  primary key (user_id, visit_date)
);

-- Index for fast monthly queries
create index if not exists idx_streak_visits_user_date
  on public.streak_visits (user_id, visit_date desc);

-- Enable RLS
alter table public.streak_visits enable row level security;

-- Users can read their own visits
create policy "Users can read own streak visits"
  on public.streak_visits for select
  using (auth.uid() = user_id);

-- Users can insert their own visits
create policy "Users can insert own streak visits"
  on public.streak_visits for insert
  with check (auth.uid() = user_id);
