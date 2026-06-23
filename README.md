# FutbolMatch Uruguay

**Encontrá tu equipo, viví el fútbol.**

FutbolMatch es la red social de fútbol amateur en Uruguay. Conecta jugadores y equipos, permitiendo buscar talento, organizar partidos, chatear en tiempo real y gestionar toda la actividad futbolística amateur.

## Stack

- **Framework:** [Next.js 16](https://nextjs.org) con React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 + Radix UI + shadcn/ui
- **Base de datos:** PostgreSQL en [Neon](https://neon.tech) (serverless)
- **ORM:** Capa custom sobre SQL parametrizado
- **Auth:** JWT + bcryptjs con cookies
- **Tiempo real:** Pusher (chat privado)
- **Pagos:** Stripe (checkout + webhooks)
- **Uploads:** UploadThing
- **Hosting:** Vercel

## Funcionalidades

| Ruta | Descripción |
|---|---|
| `/` | Landing page pública con pricing |
| `/auth/login` · `/auth/register` | Autenticación |
| `/dashboard` | Panel principal con resumen y acceso rápido |
| `/profile` | Perfil de jugador (editable) |
| `/teams` · `/teams/new` · `/teams/[id]` | Explorar, crear y ver equipos |
| `/search` | Búsqueda avanzada de jugadores |
| `/opportunities` | Oportunidades para unirte a equipos |
| `/challenges` | Desafíos entre equipos |
| `/chat` | Mensajería en tiempo real |
| `/feed` | Red social con posts, likes y comentarios |
| `/ranking` | Ranking de jugadores |
| `/premium` | Plan premium ($9.99/mes) |
| `/admin` | Panel de administración |

## Categorías

- +18, +30, +40
- Posiciones: Arquero, Defensa, Mediocampo, Delantero, etc.
- Niveles: Principiante, Intermedio, Avanzado

## Cómo empezar

```bash
npm install
npm run dev
```

Requiere variables de entorno para Neon DB, Supabase Auth, Pusher, Stripe y UploadThing.

## Licencia

Uso privado.
