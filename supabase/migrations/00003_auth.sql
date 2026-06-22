-- Agregar columna de contraseña a users
alter table public.users add column if not exists password_hash text;

-- Crear admin por defecto (contraseña: admin123)
-- El hash bcrypt de "admin123" es: $2a$10$...
-- Se crea desde la app en el registro
