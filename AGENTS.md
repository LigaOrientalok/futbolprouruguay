<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project State

## Architecture
- Server Components for data fetching; Client Components only for interactivity.
- React Query (v5) for client-side caching/refetching via `useQuery`/`useMutation`.
- Server Actions (`src/lib/actions.ts`) for all mutations (replaces old `/api/db` proxy).
- Zustand for lightweight global UI state.
- Auth handled via React Context (`auth-client.tsx`) and server-side helpers (`auth-server.ts`).
- `uploadFiles` from `@/lib/uploadthing` for file uploads.

## Pages Status (all migrated ✅)
All pages now use React Query + Server Actions instead of `useEffect` + `db-client`:
- `/` (landing) — Server Component, client islands for theme/mobile menu
- `/dashboard` — Server Component with Suspense boundaries
- `/profile` — Client, uses `useQuery` + `useMutation`
- `/teams` — Client, uses `useQuery` with client-side filtering
- `/teams/new` — Client, uses `createTeam` action
- `/teams/[id]` — Client, uses `useQuery` with parallel queries
- `/search` — Client, uses `useQuery` with `placeholderData: keepPreviousData`
- `/opportunities` — Client, uses `useQuery` + `useMutation`
- `/challenges` — Client, uses `useQuery` + `useMutation`
- `/feed` — Client, uses `useQuery` + `useMutation` for likes/comments
- `/chat` — Client, uses `useQuery` + Pusher real-time
- `/premium` — Client, uses `useQuery` for auth check
- `/ranking` — Client, uses `useQuery`
- `/admin` — Client, uses `useQuery` + `useMutation`

## Remaining cleanup
- Remove legacy files: `src/lib/db-client.ts`, `src/app/api/db/route.ts`
- Add `loading.tsx` + `error.tsx` for remaining routes
- Eliminate Turbopack root warning (set `turbopack.root` in next.config)
