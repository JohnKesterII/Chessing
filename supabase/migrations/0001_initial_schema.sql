create extension if not exists "pgcrypto";

create type public.plan_status as enum ('free', 'pro');
create type public.game_mode as enum ('self', 'bot', 'online');
create type public.game_result as enum ('white', 'black', 'draw', 'ongoing', 'aborted');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.generate_username(source_text text)
returns text
language plpgsql
as $$
declare
  base text;
begin
  base := regexp_replace(lower(coalesce(source_text, 'player')), '[^a-z0-9]+', '_', 'g');
  base := trim(both '_' from base);
  if base = '' then
    base := 'player';
  end if;
  return left(base, 16) || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4);
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text,
  avatar_url text,
  bio text,
  country_code text,
  blitz_rating integer not null default 1200,
  rapid_rating integer not null default 1200,
  bullet_rating integer not null default 1200,
  classical_rating integer not null default 1200,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_created_at_idx on public.profiles(created_at desc);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  board_theme text not null default 'midnight',
  piece_theme text not null default 'classic',
  sound_enabled boolean not null default true,
  animation_speed text not null default 'balanced',
  locale text not null default 'en',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan public.plan_status not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists subscriptions_plan_status_idx on public.subscriptions(plan, status);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  white_player_id uuid references public.profiles(id) on delete set null,
  black_player_id uuid references public.profiles(id) on delete set null,
  mode public.game_mode not null default 'self',
  time_control text not null default '10+0',
  visibility text not null default 'public',
  pgn text not null,
  current_fen text not null,
  result public.game_result not null default 'ongoing',
  opening_name text,
  reviewed boolean not null default false,
  white_accuracy numeric(5,2),
  black_accuracy numeric(5,2),
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists games_white_player_idx on public.games(white_player_id, created_at desc);
create index if not exists games_black_player_idx on public.games(black_player_id, created_at desc);
create index if not exists games_mode_idx on public.games(mode, created_at desc);

create table if not exists public.game_moves (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  ply integer not null,
  move_number integer not null,
  san text not null,
  uci text not null,
  fen_after text not null,
  clock_white integer,
  clock_black integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(game_id, ply)
);

create index if not exists game_moves_game_id_idx on public.game_moves(game_id, ply asc);

create table if not exists public.analysis_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fen text not null,
  fen_hash text not null,
  mode text not null default 'analysis',
  evaluation jsonb not null,
  plan_required public.plan_status not null default 'free',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists analysis_cache_user_idx on public.analysis_cache(user_id, created_at desc);
create index if not exists analysis_cache_hash_idx on public.analysis_cache(fen_hash);

create table if not exists public.opening_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  opening_name text not null,
  eco_code text,
  games_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, opening_name)
);

create table if not exists public.user_stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  games_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  bot_games integer not null default 0,
  reviewed_games integer not null default 0,
  longest_streak integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.game_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  summary jsonb not null,
  move_reviews jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, game_id)
);

create index if not exists game_reviews_user_idx on public.game_reviews(user_id, created_at desc);

create table if not exists public.puzzles_saved (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fen text not null,
  pgn text,
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid references public.games(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_sessions_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_sessions_log_user_idx on public.user_sessions_log(user_id, created_at desc);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  identifier text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists security_events_bucket_idx on public.security_events(bucket, identifier, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  username_candidate text;
begin
  username_candidate := public.generate_username(
    coalesce(new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1))
  );

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    username_candidate,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive')
  on conflict (user_id) do nothing;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at before update on public.user_settings for each row execute procedure public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.set_updated_at();

drop trigger if exists set_games_updated_at on public.games;
create trigger set_games_updated_at before update on public.games for each row execute procedure public.set_updated_at();

drop trigger if exists set_game_moves_updated_at on public.game_moves;
create trigger set_game_moves_updated_at before update on public.game_moves for each row execute procedure public.set_updated_at();

drop trigger if exists set_analysis_cache_updated_at on public.analysis_cache;
create trigger set_analysis_cache_updated_at before update on public.analysis_cache for each row execute procedure public.set_updated_at();

drop trigger if exists set_opening_stats_updated_at on public.opening_stats;
create trigger set_opening_stats_updated_at before update on public.opening_stats for each row execute procedure public.set_updated_at();

drop trigger if exists set_user_stats_updated_at on public.user_stats;
create trigger set_user_stats_updated_at before update on public.user_stats for each row execute procedure public.set_updated_at();

drop trigger if exists set_game_reviews_updated_at on public.game_reviews;
create trigger set_game_reviews_updated_at before update on public.game_reviews for each row execute procedure public.set_updated_at();

drop trigger if exists set_puzzles_saved_updated_at on public.puzzles_saved;
create trigger set_puzzles_saved_updated_at before update on public.puzzles_saved for each row execute procedure public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at before update on public.reports for each row execute procedure public.set_updated_at();

drop trigger if exists set_user_sessions_log_updated_at on public.user_sessions_log;
create trigger set_user_sessions_log_updated_at before update on public.user_sessions_log for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.subscriptions enable row level security;
alter table public.games enable row level security;
alter table public.game_moves enable row level security;
alter table public.analysis_cache enable row level security;
alter table public.opening_stats enable row level security;
alter table public.user_stats enable row level security;
alter table public.game_reviews enable row level security;
alter table public.puzzles_saved enable row level security;
alter table public.reports enable row level security;
alter table public.user_sessions_log enable row level security;
alter table public.security_events enable row level security;

create policy "profiles are public readable"
on public.profiles for select
using (true);

create policy "users manage own profile"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users manage own settings"
on public.user_settings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users view own subscriptions"
on public.subscriptions for select
using (auth.uid() = user_id);

create policy "service role manages subscriptions"
on public.subscriptions for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "users can insert their own games"
on public.games for insert
with check (
  auth.uid() = white_player_id or
  auth.uid() = black_player_id or
  mode = 'self' or
  mode = 'bot'
);

create policy "players can view visible games"
on public.games for select
using (
  visibility = 'public' or
  auth.uid() = white_player_id or
  auth.uid() = black_player_id
);

create policy "players can update their games"
on public.games for update
using (
  auth.uid() = white_player_id or
  auth.uid() = black_player_id
)
with check (
  auth.uid() = white_player_id or
  auth.uid() = black_player_id
);

create policy "players can manage moves"
on public.game_moves for all
using (
  exists (
    select 1 from public.games
    where games.id = game_moves.game_id
      and (
        games.visibility = 'public' or
        games.white_player_id = auth.uid() or
        games.black_player_id = auth.uid()
      )
  )
)
with check (
  exists (
    select 1 from public.games
    where games.id = game_moves.game_id
      and (
        games.white_player_id = auth.uid() or
        games.black_player_id = auth.uid()
      )
  )
);

create policy "users manage own analysis cache"
on public.analysis_cache for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own opening stats"
on public.opening_stats for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user stats are public readable"
on public.user_stats for select
using (true);

create policy "users manage own stats"
on public.user_stats for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own reviews"
on public.game_reviews for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own saved puzzles"
on public.puzzles_saved for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users create and read their own reports"
on public.reports for all
using (auth.uid() = reporter_user_id)
with check (auth.uid() = reporter_user_id);

create policy "users view own session logs"
on public.user_sessions_log for select
using (auth.uid() = user_id);

create policy "service role manages session logs"
on public.user_sessions_log for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manages security events"
on public.security_events for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
