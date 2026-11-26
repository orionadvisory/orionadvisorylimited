# Orion

Orion — the legal operating system for startups — as a **pnpm + Turborepo monorepo**.

## Structure

```
orion/
├── frontend/
│   ├── web/       # Orion app: marketing, auth, onboarding, dashboard, health-check (port 3000)
│   ├── admin/     # Admin console: users, assessment builder, bootstrap (port 3001)
│   ├── ui/        # @orion/ui   — design system: UI primitives + cn() util
│   └── session/   # @orion/session — auth() / requireActiveAdmin() / proxy / login actions, backed by the API
├── backend/
│   ├── api/       # @orion/api  — Hono backend API (port 4000), owns auth + sessions
│   ├── db/        # @orion/db   — Drizzle schema, client, migrations, seed
│   └── core/      # @orion/core — R2 storage, health-check engine, document templates
└── packages/
    └── contracts/ # @orion/contracts — zod schemas + types shared by frontend and backend
```

Rule: `frontend/*` talks to the backend only over HTTP (`@orion/api/client`) and shares
types via `packages/contracts`. Frontends still import `@orion/db`/`core` directly
today; that is removed phase by phase (see `docs/architecture/redesign-plan.md`).

Sign-in is owned by the API (`/v1/auth/*`). Both apps share a single session: the API's
`orion_session` cookie is scoped to the parent domain via `COOKIE_DOMAIN` (e.g. `.orion.africa`),
and the admin app points auth redirects at the web app via `NEXT_PUBLIC_WEB_URL`.

## Getting Started

```bash
pnpm install

# run both apps together
pnpm dev

# or individually
pnpm dev:web     # http://localhost:3000
pnpm dev:admin   # http://localhost:3001
pnpm dev:api     # http://localhost:4000  (GET /healthz, /readyz, /v1/openapi.json)
```

The API is migrating in phases: business logic is moving out of the Next apps into
`backend/api`. See `docs/architecture/redesign-plan.md`. API env: `backend/api/.env.example`.
Docker: `docker build -f backend/api/Dockerfile -t orion-api .`

## Common tasks

```bash
pnpm build        # build all apps (Turborepo)
pnpm typecheck    # typecheck every workspace
pnpm lint         # lint every workspace
pnpm test         # run tests (currently backend/api)

pnpm db:push      # push Drizzle schema to Neon
pnpm db:generate  # generate a migration
pnpm db:migrate   # apply migrations
pnpm db:studio    # open Drizzle Studio
pnpm db:seed      # seed the 52-question legal health check
```

## Environment

Env lives per app (`frontend/web/.env`, `frontend/admin/.env`, `backend/api/.env`) plus a root `.env` used by the
`@orion/db` tooling. Required: `DATABASE_URL`, `OPENAI_API_KEY`,
and the `R2_*` / `S3_ENDPOINT` storage vars. See `.env.example`.

Frontends reach the API via `API_URL` (server-side) and `NEXT_PUBLIC_API_URL` (browser, e.g. logo
`<img>`s); both default to `http://localhost:4000`. The API needs `DATABASE_URL`, the `R2_*` vars and
`CORS_ORIGINS` (must include the web and admin origins). See `backend/api/.env.example`.

## Notes

- This repo tracks a modified build of Next.js — see `AGENTS.md`. Read
  `node_modules/next/dist/docs/` before writing framework code.
- Request interception uses the Next 16 `proxy.ts` convention (the former `middleware.ts`).
