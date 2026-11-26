# Orion Redesign Plan: Frontend (web + admin) / Backend (API)

_Status: draft, agreed 2026-11-24_

## Decisions

| Topic | Decision |
|---|---|
| Scope | Architecture split **and** visual/UX redesign. API extraction leads; UI redesign runs in parallel once the data layer is decoupled. |
| API framework | **Hono** + `@hono/zod-openapi` (typed routes, OpenAPI docs generated from code) |
| API hosting | **Long-running Node server** (Railway/Fly/Render container) at `api.orion.africa`. Frontends stay on Vercel. |
| Auth | **API owns auth.** It issues an httpOnly session cookie on `.orion.africa`. NextAuth is removed from the Next apps. |

## Current state (as of `52e5b75`, before the folder split; paths below are pre-move)

- Turborepo: `apps/web`, `apps/admin` (both Next 16), `packages/{db,auth,core,ui}`. These now live at `frontend/{web,admin,ui}` and `backend/{db,core,auth}`.
- **No backend service.** Business logic is in Next server actions and route handlers (~3.5k LOC):
  - `apps/admin/src/app/actions/admin.ts`: 1,269 lines (users, assessment builder, submissions, audit)
  - `apps/web/src/app/actions/*`: auth, dashboard, assessment, drafts, health-check, referrals
  - `apps/web/src/app/api/*`: health-check (+reevaluate), documents (list/upload/generate/recommended/download), chat, onboarding, assessments/start, partner logos
  - `apps/admin/src/app/api/admin/*`: partners, upload downloads
- Both apps import `@orion/db` and query Neon directly. Auth is NextAuth (JWT) with a subdomain-shared cookie.

## Target architecture

```
frontend/
  web/        Next: marketing + founder app (server components fetch the API)
  admin/      Next: admin console
  ui/         design system: tokens, primitives, patterns (redesign lives here)
backend/
  api/        Hono on Node. ONLY service touching Postgres, R2, OpenAI, email
  db/         Drizzle schema/migrations (consumed by api only)
  core/       health-check engine, document templates, storage, text extraction (api only)
  auth/       NextAuth today; folded into api in Phase 2, then deleted
packages/
  contracts/  zod schemas + DTO types (the only package shared by frontend and backend)
```

The folders show ownership: anything under `backend/` is server-only.

**Boundary rule:** nothing in `frontend/` may depend on a `backend/` package except the type-only `@orion/api/client`. This is enforced by an ESLint `no-restricted-imports` rule plus a CI check on package.json deps (Phase 5).

### API module layout (`backend/api/src`)

```
app.ts                  Hono app, middleware (request id, logging, CORS, error handler)
server.ts               Node entry (@hono/node-server)
middleware/             session, requireRole('admin'), rate-limit, audit
modules/
  auth/                 signup, login, logout, session, password reset
  me/                   current user + startup profile
  onboarding/
  assessments/          published template, start, drafts, submit
  health-check/         evaluate, reevaluate, results (wraps @orion/core engine)
  issues/               issues + recommendations
  documents/            list, upload, generate, recommended, download (signed URLs)
  referrals/
  chat/                 AI orchestrator: context build → LLM → guardrail check → audit log (SSE stream)
  partners/             public list + logo
  admin/
    users/  templates/  submissions/  partners/  audit/  uploads/
```

Each module has `routes.ts` (OpenAPI route defs using schemas from `@orion/contracts`), `service.ts` (business logic), `repo.ts` (Drizzle queries).

### Endpoint map (v1)

| Area | Routes | Replaces |
|---|---|---|
| Auth | `POST /v1/auth/signup` `POST /v1/auth/login` `POST /v1/auth/logout` `GET /v1/auth/session` | `actions/auth.ts` (both apps), NextAuth handler |
| Me | `GET/PATCH /v1/me` `GET /v1/me/dashboard` | `actions/dashboard.ts` |
| Onboarding | `POST /v1/onboarding/complete` | `api/onboarding/complete` |
| Assessments | `GET /v1/assessments/published` `POST /v1/assessments/start` `GET/PUT/DELETE /v1/assessments/:templateId/draft` | `actions/assessment*.ts`, `api/assessments/start` |
| Health check | `POST /v1/health-check` `POST /v1/health-check/reevaluate` `GET /v1/health-check/latest` | `api/health-check/*`, `actions/health-check.ts` |
| Issues | `GET /v1/issues` | `actions/referrals.ts#getUserIssues` |
| Documents | `GET /v1/documents` `POST /v1/documents/upload` `POST /v1/documents/generate` `GET /v1/documents/recommended` `GET /v1/documents/:id/download` | `api/documents/*` |
| Referrals | `GET/POST /v1/referrals` | `actions/referrals.ts` |
| Chat | `POST /v1/chat` (SSE) | `api/chat` |
| Partners | `GET /v1/partners` `GET /v1/partners/:id/logo` | `api/partners/[id]/logo` |
| Admin | `/v1/admin/users` `/v1/admin/templates[/:id/sections\|questions\|rules]` `/v1/admin/submissions` `/v1/admin/partners` `/v1/admin/audit` `/v1/admin/uploads/:id/download` `/v1/admin/bootstrap` | `admin/actions/*`, `admin/api/admin/*` |

Conventions: JSON bodies, cursor or `page`/`pageSize` pagination with a `{ data, meta }` envelope, and errors as `{ error: { code, message, details? } }` with correct HTTP status codes. Every mutating admin route writes to `audit_log`.

## Auth design

_Changed from the original plan:_ the API uses its own small session module instead of Better Auth. Better Auth needs its own table shapes, which would mean a production schema migration. The existing NextAuth `sessions` table was unused (NextAuth ran in JWT mode) and already fits the session-token model, and Google sign-in had already been removed. So there's no migration, about 200 lines of code we own, and passwords stay bcrypt.

- **Module:** `backend/api/src/modules/auth/`. Endpoints: `POST /v1/auth/signup`, `POST /v1/auth/login`, `POST /v1/auth/logout`, `GET /v1/auth/session`.
- **Session:** a random 256-bit token sits in the httpOnly `orion_session` cookie. Only its SHA-256 hash is stored in `sessions.session_token`. The cookie is `SameSite=Lax`, `Secure` in prod, with `Domain=$COOKIE_DOMAIN` (`.orion.africa`) so web, admin and api share it. Sessions last a fixed 30 days (`SESSION_TTL_DAYS`) and don't slide.
- **Existing passwords:** they're bcrypt cost 12, the same as before, so nobody has to reset.
- **Fresh data on every request:** role, status and `onboardingCompleted` are read from the DB on each session check. Suspension takes effect immediately and revokes the session. Suspended users can't sign in, which is new: NextAuth let them in.
- **Hardening:**
  - Unknown emails take as long as wrong passwords, so accounts can't be probed.
  - Emails are matched case-insensitively.
  - After 10 failed logins on an email, it locks for 15 minutes. This uses an in-memory limiter keyed by email, because requests arrive from the Next servers, not browsers. Move it to Redis if the API runs more than one instance.
- **Guards:** `requireUser` and `requireRole('admin')` middleware, for `/v1/me/*` and `/v1/admin/*` in Phases 3 and 4.
- **Next apps (`frontend/session`, `@orion/session`):**
  - `auth()` and `requireActiveAdmin()` keep the old NextAuth shapes and call `GET /v1/auth/session`, forwarding the cookie.
  - `proxy.ts` applies the same redirect rules as the old `authorized` callback.
  - The login, signup and logout server actions call the API and re-issue its `Set-Cookie` to the browser.
- **Cutover effect:** everyone is signed out once at deploy, because the old NextAuth JWT cookies are ignored.

## How frontends call the API

- `@orion/api/client` exports `createApiClient(baseUrl, { headers, fetch })`, built on `hono/client`. It imports only the API's route **types**, so no server code reaches a frontend bundle. `@orion/contracts` holds the zod schemas and DTO types both sides share.
- Server components and server actions use a `serverApi()` helper that forwards the incoming `cookie` header. Server actions remain as thin form handlers that call the API (no DB access).
- Caching: public data (partners, published assessment) uses `fetch` with `next: { revalidate, tags }`. User data is `no-store`.

## Phased migration (strangler: the app stays live throughout)

| Phase | Work | Exit criteria |
|---|---|---|
| **0. Scaffold** ✅ code done (`feat/api-phase-0`) | `backend/api` (Hono, node-server, JSON logs, request id, CORS, error envelope, `/healthz`, `/readyz`, OpenAPI at `/v1/openapi.json` outside prod), `packages/contracts`, typed client, Dockerfile, CI (typecheck, test, api build, image build; lint non-blocking until the existing admin `sidebar.tsx` error is fixed). `packages/config` deferred. Repo split into `frontend/`, `backend/`, `packages/`. **Remaining:** deploy to staging. | API deployed; web can call `/healthz` |
| **1. Read-only/public** ✅ code done | `GET /v1/partners`, `GET /v1/partners/:id/logo`, `GET /v1/assessments/published`. Web landing marquee, `/health-check` and `/onboarding` read from the API. The old `actions/assessment.ts` and `api/partners/[id]/logo` are deleted, and the admin logo preview points at the API. `/health-check` and `/onboarding` now render per request (they used to be baked at build time, so newly published templates never appeared until a redeploy). The dashboard read moves to Phase 3 because it needs a session. | Those pages read from the API; DB imports removed from those files |
| **2. Auth cutover** ✅ code done | API-owned sessions (see Auth design), session middleware and role guards. Both apps use `@orion/session` for `auth()`, `requireActiveAdmin()`, the proxy and the login/signup/logout actions. NextAuth, `backend/auth` and `/api/auth/[...nextauth]` are deleted. **Not yet verified:** a real login and signup against the live DB, which needs a throwaway account. | Existing users can log in unchanged; admin gating works |
| **3. Founder flows** ✅ code done | `backend/api/src/modules/founder` covers `/v1/me/dashboard`, `/v1/issues`, `/v1/referrals`, `/v1/assessments/{id}/draft`, `/v1/assessments/start`, `/v1/health-check` (+`/persist`, `/reevaluate`), `/v1/onboarding/complete`, `/v1/documents` (+`/recommended`, `/generate`, `/upload`, `/{id}/download`) and `/v1/chat` (SSE). LLM and R2 sit behind injectable interfaces, and AI spend is rate-limited. In web, the server actions call the API, and `app/api/[...path]` is an allowlisted bridge to `/v1/*`, so client components are unchanged. **The web app no longer imports `@orion/db`.** Security fixes are listed under Phase 3 security fixes below. | Full founder journey E2E on staging via API |
| **4. Admin** ✅ code done | `backend/api/src/modules/admin` covers users (list, stats, role, status; suspending a user also revokes their sessions), templates, sections, questions, rules, submissions, audit feed, partners and upload downloads under `/v1/admin/*`, all behind one `requireRole("admin")` gate. First-admin setup moved to the public `/v1/bootstrap/admin`, which locks once an admin exists. Every mutation is audited, including partner changes, which weren't before. The admin actions keep all 25 exports, with dates revived for the pages, and `app/api/admin/[...path]` is an allowlisted bridge. | Admin console fully on API; every mutation audited |
| **5. Lock the boundary** 🟡 mostly done | Done: neither frontend imports or depends on `@orion/db`, `drizzle-orm`, `bcryptjs` or storage. CI has a blocking boundary check, and lint is now blocking (0 errors). Remaining: move the static catalogues (`@orion/core/documents/templates`, `health-check/questions`, `types`) that web still imports into `packages/contracts`. | CI fails on any FE→DB import |
| **UI (parallel from Phase 1)** 🟡 dashboard done | Done: "Orion bento" tokens in `frontend/ui/src/theme.css`, primitives (`BentoCard`, `StatNumeral`, `PillSegments`, `ArrowButton`, `NavPill`, `Chip`), the founder dashboard and shell, and the admin shell, home, users and assessments pages (admin re-themed from indigo to Orion teal). Next: the remaining admin forms and login, and the founder sub-pages (documents, referrals, AI, settings). | See below |

Each phase ships behind no feature flag. Pages switch to the API one by one, and each switch goes in its own PR.

## UI redesign track

1. **Foundations:** design tokens (color, type, spacing, radius, motion) as CSS variables + Tailwind v4 theme in `frontend/ui`, with light/dark support.
2. **Primitives:** button, input, select, dialog, table, tabs, toast, badge, card, empty/loading/error states (Radix-based, accessible).
3. **Patterns:** app shell (sidebar/topbar), data table with filters/pagination (admin), form builder pieces (assessment builder), results/score views.
4. **Screens:** admin first (most CRUD, benefits most from the data table and forms), then the founder dashboard and health-check flow, then marketing.
5. Component rules: domain folders, and split any component over ~200 lines into a folder (`index.tsx` + `use-*.ts` + parts).

_Open: visual direction / references (see `/design` folder). Agree on this before Foundations._

## Testing & quality

- **API:** Vitest integration tests per module against a disposable Neon branch (or a local Postgres container). The health-check engine gets unit tests on rule evaluation.
- **Contracts:** request/response schemas validated on both sides. The OpenAPI doc is served at `/v1/docs` (staging only).
- **E2E:** Playwright for the core journey (sign up → health check → results → document → referral) and admin template publish.
- **Security:** authz tests (a member can't reach `/v1/admin/*`, and users can't read another startup's docs), upload type/size limits, rate limits on auth and chat, and signed short-lived R2 URLs.

## Environments & config

- `backend/api/.env`: `DATABASE_URL`, `AUTH_SECRET`, `OPENAI_API_KEY`, `R2_*`, `S3_ENDPOINT`, `CORS_ORIGINS`, `COOKIE_DOMAIN`
- `frontend/web/.env`, `frontend/admin/.env`: `NEXT_PUBLIC_API_URL`, `API_URL` (internal) only. No DB or secret keys.

## Phase 3 security fixes (found while porting)

| Was | Now |
|---|---|
| `/api/health-check` (unauthenticated) read any R2 object named by a client-supplied `storageKey` and sent its text to the LLM, so other users' uploads could be exfiltrated | Files resolve only via `uploadId` owned by the signed-in caller. Guests can't attach files. |
| `createReferral` accepted any `issueId` (IDOR) | The issue must belong to the caller's startup (404 otherwise) |
| `/api/chat` accepted any `startupId`, which loaded another startup's issues and chat history into the context and wrote into their thread | Always the caller's own startup. The client `startupId` is ignored. |
| Unauthenticated, unmetered OpenAI calls | Guests: 5/hour per IP plus 200/hour globally. Signed-in users: 60 AI calls/hour. |
| Raw model output returned to the browser when parsing failed | Model JSON is schema-validated, and failures return a generic 502 (the detail is logged server-side) |
| Upload file names went into storage keys unsanitised, and the download `Content-Disposition` took the raw name | Names are sanitised (no `../`, no header injection) |
| A non-owner download returned 403 (confirming the document exists) | It returns 404 |

**Open follow-ups (unchanged behaviour, flagged):**
- `/v1/onboarding/complete` and `/v1/health-check/persist` still store the score and issues the browser sends back. Results are schema-checked but not tamper-proof. Fix: sign results in `/v1/health-check` (HMAC) or keep them server-side. This matters once scores are shared with partners.
- Re-evaluation needs a `profile` response that only the old guest flow writes, so it 404s after normal onboarding (a pre-existing bug).
- Rate limits are in memory. Move them to Redis if the API runs more than one instance.

## Risks

- **Auth migration:** session invalidation logs everyone out once at cutover. That's acceptable, but announce it.
- **Cross-origin cookies:** local dev on different ports and preview deployments on `*.vercel.app` won't share the `.orion.africa` cookie. Use a Next rewrite (`/api/*` → API) for previews, or a staging domain.
- **Server-component latency:** an extra network hop. Colocate the API region with Neon and the Vercel functions region.
- **Scope creep:** the UI redesign mixed with the refactor. Keep PRs single-purpose (move the logic **or** restyle, never both).
