-- ============================================================
-- FUTBOLMATCH URUGUAY - Esquema Completo de Base de Datos
-- ============================================================
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 0. EXTENSIONES
create extension if not exists "pgcrypto";

-- 1. TABLA DE USUARIOS (sync con Supabase Auth)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,
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
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  badge_url text,
  city text not null,
  neighborhood text,
  category text not null check (category in ('+18','+30','+40')),
  description text,
  player_count int default 1,
  created_by uuid not null references public.users(id) on delete cascade,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. MIEMBROS DEL EQUIPO
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'player' check (role in ('captain','player','delegate')),
  joined_at timestamptz default now(),
  unique(team_id, user_id)
);

-- 5. NECESIDADES DEL EQUIPO
create table if not exists public.team_needs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  position text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 6. POSTULACIONES A EQUIPOS
create table if not exists public.player_applications (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  team_need_id uuid references public.team_needs(id) on delete set null,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- 7. OPORTUNIDADES (equipos buscan jugadores)
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  player_id uuid not null references public.users(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now(),
  unique(opportunity_id, player_id)
);

-- 9. DESAFÍOS (equipo busca rival)
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  opponent_team_id uuid references public.teams(id) on delete set null,
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

-- 10. PUBLICACIONES (feed social)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- 12. LIKES
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- 13. CHATS
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  participants uuid[] not null,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- 14. MENSAJES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- 15. SUSCRIPCIONES
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,
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
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('player_of_week','most_active','captain','premium','veteran')),
  awarded_at timestamptz default now(),
  unique(user_id, type)
);

-- 17. SPONSORS / PUBLICIDAD
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 18. DENUNCIAS / REPORTES
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  reported_user_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','reviewed','resolved')),
  created_at timestamptz default now()
);

-- 19. NOTIFICACIONES
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
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
-- FUNCIONES (increment/decrement counters)
-- ============================================================
create or replace function increment_likes(post_id uuid)
returns void as $$
  update public.posts set likes_count = likes_count + 1 where id = post_id;
$$ language sql security definer;

create or replace function decrement_likes(post_id uuid)
returns void as $$
  update public.posts set likes_count = greatest(0, likes_count - 1) where id = post_id;
$$ language sql security definer;

create or replace function increment_comments(post_id uuid)
returns void as $$
  update public.posts set comments_count = comments_count + 1 where id = post_id;
$$ language sql security definer;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- USERS
alter table public.users enable row level security;
create policy "Users can view all profiles" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Admin can insert/update any" on public.users for insert with check (true);
create policy "Admin can delete users" on public.users for delete using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- PLAYER PROFILES
alter table public.player_profiles enable row level security;
create policy "Anyone can view profiles" on public.player_profiles for select using (true);
create policy "Users can manage own profile" on public.player_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.player_profiles for update using (auth.uid() = user_id);

-- TEAMS
alter table public.teams enable row level security;
create policy "Anyone can view teams" on public.teams for select using (true);
create policy "Authenticated can create teams" on public.teams for insert with check (auth.role() = 'authenticated');
create policy "Creator can update team" on public.teams for update using (auth.uid() = created_by);
create policy "Admin can delete teams" on public.teams for delete using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- TEAM MEMBERS
alter table public.team_members enable row level security;
create policy "Anyone can view members" on public.team_members for select using (true);
create policy "Captain can manage members" on public.team_members for insert with check (
  exists (select 1 from public.team_members where team_id = team_members.team_id and user_id = auth.uid() and role = 'captain')
);
create policy "Captain can update members" on public.team_members for update using (
  exists (select 1 from public.team_members where team_id = team_members.team_id and user_id = auth.uid() and role = 'captain')
);

-- TEAM NEEDS
alter table public.team_needs enable row level security;
create policy "Anyone can view needs" on public.team_needs for select using (true);
create policy "Captain can manage needs" on public.team_needs for insert with check (
  exists (select 1 from public.team_members where team_id = team_needs.team_id and user_id = auth.uid() and role = 'captain')
);
create policy "Captain can update needs" on public.team_needs for update using (
  exists (select 1 from public.team_members where team_id = team_needs.team_id and user_id = auth.uid() and role = 'captain')
);

-- PLAYER APPLICATIONS
alter table public.player_applications enable row level security;
create policy "Anyone can view apps" on public.player_applications for select using (true);
create policy "Players can apply" on public.player_applications for insert with check (auth.uid() = player_id);
create policy "Captain can update status" on public.player_applications for update using (
  exists (select 1 from public.team_members where team_id = player_applications.team_id and user_id = auth.uid() and role in ('captain','delegate'))
);

-- OPPORTUNITIES
alter table public.opportunities enable row level security;
create policy "Anyone can view opportunities" on public.opportunities for select using (true);
create policy "Captain can create" on public.opportunities for insert with check (
  exists (select 1 from public.team_members where team_id = opportunities.team_id and user_id = auth.uid() and role in ('captain','delegate'))
);
create policy "Captain can update" on public.opportunities for update using (
  exists (select 1 from public.team_members where team_id = opportunities.team_id and user_id = auth.uid() and role in ('captain','delegate'))
);

-- OPPORTUNITY APPLICATIONS
alter table public.opportunity_applications enable row level security;
create policy "Anyone can view opp apps" on public.opportunity_applications for select using (true);
create policy "Players can apply to opps" on public.opportunity_applications for insert with check (auth.uid() = player_id);

-- CHALLENGES
alter table public.challenges enable row level security;
create policy "Anyone can view challenges" on public.challenges for select using (true);
create policy "Captain can create" on public.challenges for insert with check (
  exists (select 1 from public.team_members where team_id = challenges.team_id and user_id = auth.uid() and role in ('captain','delegate'))
);
create policy "Captain can update" on public.challenges for update using (
  exists (select 1 from public.team_members where team_id = challenges.team_id and user_id = auth.uid() and role in ('captain','delegate'))
);

-- POSTS
alter table public.posts enable row level security;
create policy "Anyone can view posts" on public.posts for select using (true);
create policy "Auth users can create posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Admin can delete posts" on public.posts for delete using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- COMMENTS
alter table public.comments enable row level security;
create policy "Anyone can view comments" on public.comments for select using (true);
create policy "Auth users can comment" on public.comments for insert with check (auth.uid() = user_id);

-- LIKES
alter table public.likes enable row level security;
create policy "Anyone can view likes" on public.likes for select using (true);
create policy "Auth users can like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on public.likes for delete using (auth.uid() = user_id);

-- CHATS
alter table public.chats enable row level security;
create policy "Participants can view chats" on public.chats for select using (auth.uid() = any(participants));
create policy "Auth users can create chats" on public.chats for insert with check (auth.role() = 'authenticated');

-- MESSAGES
alter table public.messages enable row level security;
create policy "Participants can view messages" on public.messages for select using (
  exists (select 1 from public.chats where id = messages.chat_id and auth.uid() = any(participants))
);
create policy "Participants can send messages" on public.messages for insert with check (
  exists (select 1 from public.chats where id = messages.chat_id and auth.uid() = any(participants))
);

-- SUBSCRIPTIONS
alter table public.subscriptions enable row level security;
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Admin can view all" on public.subscriptions for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- BADGES
alter table public.badges enable row level security;
create policy "Anyone can view badges" on public.badges for select using (true);
create policy "Admin can manage badges" on public.badges for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- SPONSORS
alter table public.sponsors enable row level security;
create policy "Anyone can view sponsors" on public.sponsors for select using (true);
create policy "Admin can manage sponsors" on public.sponsors for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- REPORTS
alter table public.reports enable row level security;
create policy "Users can view own reports" on public.reports for select using (auth.uid() = reporter_id);
create policy "Admin can view all reports" on public.reports for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Users can create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Admin can manage reports" on public.reports for update using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- NOTIFICATIONS
alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System can create notifications" on public.notifications for insert with check (true);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

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

create trigger users_updated_at before update on public.users
  for each row execute function update_updated_at();
create trigger profiles_updated_at before update on public.player_profiles
  for each row execute function update_updated_at();
create trigger teams_updated_at before update on public.teams
  for each row execute function update_updated_at();

-- ============================================================
-- TRIGGER: sincronizar usuario con auth
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'player')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- TRIGGER: sincronizar eliminación de usuario
-- ============================================================
create or replace function handle_delete_user()
returns trigger as $$
begin
  delete from public.users where id = old.id;
  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function handle_delete_user();
