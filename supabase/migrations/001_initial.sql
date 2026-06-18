-- Solitaire cloud schema — saves, stats, daily_results with RLS

create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game jsonb not null,
  seed text not null,
  draw_count smallint not null check (draw_count in (1, 3)),
  is_daily boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.daily_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_date date not null,
  elapsed_ms integer not null check (elapsed_ms >= 0),
  moves integer not null check (moves >= 0),
  score integer not null default 0,
  completed_at timestamptz not null default now(),
  unique (user_id, challenge_date)
);

create index if not exists daily_results_date_elapsed_idx
  on public.daily_results (challenge_date, elapsed_ms asc);

alter table public.saves enable row level security;
alter table public.stats enable row level security;
alter table public.daily_results enable row level security;

create policy "Users read own saves"
  on public.saves for select
  using (auth.uid() = user_id);

create policy "Users insert own saves"
  on public.saves for insert
  with check (auth.uid() = user_id);

create policy "Users update own saves"
  on public.saves for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own saves"
  on public.saves for delete
  using (auth.uid() = user_id);

create policy "Users read own stats"
  on public.stats for select
  using (auth.uid() = user_id);

create policy "Users insert own stats"
  on public.stats for insert
  with check (auth.uid() = user_id);

create policy "Users update own stats"
  on public.stats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read own daily results"
  on public.daily_results for select
  using (auth.uid() = user_id);

create policy "Users insert own daily results"
  on public.daily_results for insert
  with check (auth.uid() = user_id);

create policy "Users update own daily results"
  on public.daily_results for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Authenticated users read daily leaderboard"
  on public.daily_results for select
  using (auth.role() = 'authenticated');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists saves_set_updated_at on public.saves;
create trigger saves_set_updated_at
  before update on public.saves
  for each row execute function public.set_updated_at();

drop trigger if exists stats_set_updated_at on public.stats;
create trigger stats_set_updated_at
  before update on public.stats
  for each row execute function public.set_updated_at();
