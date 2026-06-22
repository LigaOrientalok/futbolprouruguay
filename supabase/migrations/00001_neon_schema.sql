-- ============================================================
-- FUTBOLMATCH URUGUAY - Schema para Neon (PostgreSQL)
-- ============================================================
-- Adaptado sin dependencias de Supabase Auth
-- ============================================================

create extension if not exists pgcrypto;

-- 1. USUARIOS
create table if not exists public.users (
  id text primary key,
  email text unique not null,
  username text unique not null,
  full_name text not null,
  avatar_url text,
  role text not null default 'player' check (role in ('player', 'captain', 'admin')),
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'premium')),
  is_verified boolean default false,
  is_suspended boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PERFILES DE JUGADOR
create table if not exists public.player_profiles (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.users(id) on delete cascade unique,
  age int,
  main_position text check (main_position in ('Arquero','Defensa Central','Lateral Derecho','Lateral Izquierdo','Mediocentro','Volante de Creación','Extremo Derecho','Extremo Izquierdo','Delantero Centro','Segundo Delantero')),
  secondary_positions text[] default '{}',
  city text,
  neighborhood text,
  preferred_leg text check (preferred_leg in ('Derecha','Izquierda','Ambas')),
  height_cm int,
  weight_kg int,
  availability text check (availability in ('Mañana','Tarde','Noche','Fin de Semana','Flexible')),
  category text check (category in ('+18','+30','+40')),
  level text check (level in ('Principiante','Intermedio','Avanzado')),
  description text,
  social_instagram text,
  social_twitter text,
  social_facebook text,
  social_whatsapp text,
  video_urls text[] default '{}',
  is_captain boolean default false,
  weekly_applications int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. EQUIPOS
create table if not exists public.teams (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  badge_url text,
  city text not null,
  neighborhood text,
  category text not null check (category in ('+18','+30','+40')),
  description text,
  player_count int default 1,
  created_by text not null references public.users(id) on delete cascade,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. MIEMBROS DEL EQUIPO
create table if not exists public.team_members (
  id text primary key default gen_random_uuid()::text,
  team_id text not null references public.teams(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  role text not null default 'player' check (role in ('captain','player','delegate')),
  joined_at timestamptz default now(),
  unique(team_id, user_id)
);

-- 5. NECESIDADES DEL EQUIPO
create table if not exists public.team_needs (
  id text primary key default gen_random_uuid()::text,
  team_id text not null references public.teams(id) on delete cascade,
  position text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 6. POSTULACIONES A EQUIPOS
create table if not exists public.player_applications (
  id text primary key default gen_random_uuid()::text,
  player_id text not null references public.users(id) on delete cascade,
  team_id text not null references public.teams(id) on delete cascade,
  team_need_id text references public.team_needs(id) on delete set null,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- 7. OPORTUNIDADES
create table if not exists public.opportunities (
  id text primary key default gen_random_uuid()::text,
  team_id text not null references public.teams(id) on delete cascade,
  position text not null,
  date date,
  category text check (category in ('+18','+30','+40')),
  location text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. POSTULACIONES A OPORTUNIDADES
create table if not exists public.opportunity_applications (
  id text primary key default gen_random_uuid()::text,
  opportunity_id text not null references public.opportunities(id) on delete cascade,
  player_id text not null references public.users(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now(),
  unique(opportunity_id, player_id)
);

-- 9. DESAFÍOS
create table if not exists public.challenges (
  id text primary key default gen_random_uuid()::text,
  team_id text not null references public.teams(id) on delete cascade,
  opponent_team_id text references public.teams(id) on delete set null,
  date date not null,
  time time not null,
  category text check (category in ('+18','+30','+40')),
  zone text,
  location_type text not null default 'home' check (location_type in ('home','neutral','away')),
  description text,
  status text not null default 'open' check (status in ('open','accepted','completed','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. PUBLICACIONES (FEED)
create table if not exists public.posts (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.users(id) on delete cascade,
  content text not null,
  image_urls text[] default '{}',
  video_url text,
  likes_count int default 0,
  comments_count int default 0,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 11. COMENTARIOS
create table if not exists public.comments (
  id text primary key default gen_random_uuid()::text,
  post_id text not null references public.posts(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- 12. LIKES
create table if not exists public.likes (
  id text primary key default gen_random_uuid()::text,
  post_id text not null references public.posts(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- 13. CHATS
create table if not exists public.chats (
  id text primary key default gen_random_uuid()::text,
  participants text[] not null,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- 14. MENSAJES
create table if not exists public.messages (
  id text primary key default gen_random_uuid()::text,
  chat_id text not null references public.chats(id) on delete cascade,
  sender_id text not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- 15. SUSCRIPCIONES
create table if not exists public.subscriptions (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.users(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  tier text not null default 'free' check (tier in ('free','premium')),
  status text not null default 'active' check (status in ('active','canceled','past_due')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- 16. INSIGNIAS
create table if not exists public.badges (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.users(id) on delete cascade,
  type text not null check (type in ('player_of_week','most_active','captain','premium','veteran')),
  awarded_at timestamptz default now(),
  unique(user_id, type)
);

-- 17. SPONSORS
create table if not exists public.sponsors (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  logo_url text,
  website_url text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 18. DENUNCIAS
create table if not exists public.reports (
  id text primary key default gen_random_uuid()::text,
  reporter_id text not null references public.users(id) on delete cascade,
  reported_user_id text not null references public.users(id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','reviewed','resolved')),
  created_at timestamptz default now()
);

-- 19. NOTIFICACIONES
create table if not exists public.notifications (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  data jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_subscription on public.users(subscription_tier);
create index if not exists idx_profiles_position on public.player_profiles(main_position);
create index if not exists idx_profiles_city on public.player_profiles(city);
create index if not exists idx_profiles_category on public.player_profiles(category);
create index if not exists idx_teams_city on public.teams(city);
create index if not exists idx_teams_category on public.teams(category);
create index if not exists idx_posts_created on public.posts(created_at desc);
create index if not exists idx_messages_chat on public.messages(chat_id, created_at);
create index if not exists idx_chats_participants on public.chats using gin(participants);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);

-- ============================================================
-- FUNCIONES
-- ============================================================
create or replace function increment_likes(post_id text)
returns void as $$
  update public.posts set likes_count = likes_count + 1 where id = post_id;
$$ language sql;

create or replace function decrement_likes(post_id text)
returns void as $$
  update public.posts set likes_count = greatest(0, likes_count - 1) where id = post_id;
$$ language sql;

create or replace function increment_comments(post_id text)
returns void as $$
  update public.posts set comments_count = comments_count + 1 where id = post_id;
$$ language sql;

-- ============================================================
-- TRIGGER: actualizar updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
  for each row execute function update_updated_at();
drop trigger if exists profiles_updated_at on public.player_profiles;
create trigger profiles_updated_at before update on public.player_profiles
  for each row execute function update_updated_at();
drop trigger if exists teams_updated_at on public.teams;
create trigger teams_updated_at before update on public.teams
  for each row execute function update_updated_at();
