# FutbolMatch Uruguay - Guía de Setup Completa

## 1. Crear Proyecto en Supabase

1. Andá a https://supabase.com y creá una cuenta
2. Creá un nuevo proyecto (e.g. `futbolmatch-uruguay`)
3. Elegí la región más cercana a Uruguay (São Paulo o Virginia)
4. Esperá a que se provisione la base de datos
5. Andá a **Project Settings > API** y copiá:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Configurar Base de Datos

1. En Supabase, andá a **SQL Editor**
2. Abrí `supabase/migrations/00001_schema.sql`
3. Copiá todo el contenido y ejecutalo
4. Abrí `supabase/migrations/00002_storage.sql`
5. Copiá y ejecutalo
6. Opcional: ejecutá `supabase/seed.sql` para datos de ejemplo

## 3. Configurar Autenticación

1. En Supabase, andá a **Authentication > Settings**
2. En **SITE URL**: `http://localhost:3000`
3. En **Redirect URLs** agregá: `http://localhost:3000/auth/callback`
4. En **Providers > Email**, asegurate que esté habilitado
5. Opcional: habilitá Google, GitHub, etc.

## 4. Configurar Variables de Entorno

Creá o editá `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 5. Configurar Stripe (para Premium)

1. Creá una cuenta en https://stripe.com
2. Andá a **Developers > API Keys**
3. Copiá `Secret key` → `STRIPE_SECRET_KEY`
4. Copiá `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. En **Developers > Webhooks**, agregá:
   - Endpoint: `https://tu-dominio/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copiá el `Signing secret` → `STRIPE_WEBHOOK_SECRET`
6. En Stripe Dashboard, creá un producto llamado "FutbolMatch Premium" por $9.99/mes

## 6. Configurar Storage (fotos de perfil)

1. En Supabase, andá a **Storage**
2. Verificá que existan los buckets: `avatars`, `team-photos`, `post-images`
3. Las políticas RLS ya están creadas en `00002_storage.sql`

## 7. Ejecutar el Proyecto

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

## 8. Crear el primer Admin

1. Registrate en la app como jugador
2. En Supabase SQL Editor, ejecutá:
   ```sql
   update public.users set role = 'admin' where email = 'tu@email.com';
   ```
3. Refrescá y entrá a `/admin`

## 9. Para Producción

- Actualizá `NEXT_PUBLIC_SITE_URL` con tu dominio real
- Configurá el deployment en Vercel, Railway o similar
- Agregá el dominio en **Authentication > Settings > Site URL**
- En Stripe, cambiá de modo test a modo producción
- Habilitá **Row Level Security** ya está todo configurado en las migraciones

## 10. Estructura de Archivos Clave

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (ThemeProvider)
│   ├── auth/                       # Login, Register, Callback
│   ├── dashboard/                  # Panel principal
│   ├── profile/                    # Perfil de jugador
│   ├── teams/                      # CRUD de equipos
│   ├── search/                     # Búsqueda con filtros
│   ├── opportunities/              # Oportunidades
│   ├── challenges/                 # Desafíos
│   ├── chat/                       # Chat en tiempo real
│   ├── feed/                       # Red social
│   ├── premium/                    # Planes y suscripción
│   ├── admin/                      # Panel admin
│   ├── ranking/                    # Ranking y recomendaciones
│   └── api/stripe/                 # Stripe integration
├── components/
│   └── ui/                         # shadcn components
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── constants.ts                # Posiciones, categorías, etc.
│   ├── utils.ts                    # Helper functions
│   └── supabase/                   # Clientes Supabase
└── middleware.ts                   # Auth middleware

supabase/
└── migrations/
    ├── 00001_schema.sql            # Tablas + RLS + triggers
    └── 00002_storage.sql           # Storage buckets + policies
```
