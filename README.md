# Orion

Orion — the legal operating system for startups — as a **pnpm + Turborepo monorepo**.

## Structure

```
orion/
├── apps/
│   ├── web/      # Orion app: marketing, auth, onboarding, dashboard, health-check (port 3000)
│   └── admin/    # Admin console: users, assessment builder, bootstrap (port 3001)
└── packages/
    ├── db/       # @orion/db   — Drizzle schema, client, migrations, seed
    ├── auth/     # @orion/auth — NextAuth config + requireActiveAdmin guard
    ├── ui/       # @orion/ui   — shared UI primitives + cn() util
    └── core/     # @orion/core — R2 storage, health-check engine, document templates
```

Both apps share the same Neon database and a single auth session. In production the
session cookie is shared across subdomains via `AUTH_COOKIE_DOMAIN` (e.g. `.orion.africa`),
and the admin app points auth redirects at the web app via `NEXT_PUBLIC_WEB_URL`.

## Getting Started

```bash
pnpm install

# run both apps together
pnpm dev

# or individually
pnpm dev:web     # http://localhost:3000
pnpm dev:admin   # http://localhost:3001
```

## Common tasks

```bash
pnpm build        # build all apps (Turborepo)
pnpm typecheck    # typecheck every workspace
pnpm lint         # lint every workspace

pnpm db:push      # push Drizzle schema to Neon
pnpm db:generate  # generate a migration
pnpm db:migrate   # apply migrations
pnpm db:studio    # open Drizzle Studio
pnpm db:seed      # seed the 52-question legal health check
```

## Environment

Env lives per app (`apps/web/.env`, `apps/admin/.env`) plus a root `.env` used by the
`@orion/db` tooling. Required: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `OPENAI_API_KEY`,
and the `R2_*` / `S3_ENDPOINT` storage vars. See `.env.example`.

## Notes

- This repo tracks a modified build of Next.js — see `AGENTS.md`. Read
  `node_modules/next/dist/docs/` before writing framework code.
- Request interception uses the Next 16 `proxy.ts` convention (the former `middleware.ts`).
