-- ============================================================
-- FUTBOLMATCH URUGUAY - Seed Data
-- ============================================================
-- Datos de ejemplo para desarrollo
-- ============================================================

-- Sponsors de ejemplo
insert into public.sponsors (name, logo_url, description, is_active) values
  ('Deportes Montevideo', null, 'Tienda de artículos deportivos', true),
  ('Canchas del Parque', null, 'Complejo deportivo con 5 canchas', true),
  ('Deportivo Uruguayo', null, 'Indumentaria y equipamiento', true);

-- Insignias de ejemplo (se asignan manualmente desde admin)
-- insert into public.badges (user_id, type) values ('USERS_ID_AQUI', 'player_of_week');
