# End-to-end test checklist: Phases 0–4 + dashboard redesign

Run everything locally first, then on staging. Tick each line; anything unexpected, note the
`X-Request-Id` response header (it's in every API log line).

## Setup

```bash
pnpm install
cp backend/api/.env.example backend/api/.env   # fill DATABASE_URL, R2_*, OPENAI_API_KEY
# frontend/web/.env and frontend/admin/.env need: API_URL=http://localhost:4000
pnpm dev            # web :3000, admin :3001, api :4000
```

Sanity: `curl localhost:4000/readyz` → `{"status":"ready"}`. The API docs are at http://localhost:4000/v1/openapi.json.

> Everyone is signed out once after this deploy (the old NextAuth cookies are no longer accepted). That's expected.

## 1. Public site (web, signed out)
- [ ] `/` loads, and the partner logo strip shows (logos come from the API).
- [ ] `/pricing` loads.
- [ ] `/health-check`: answer some questions, submit, and a score with issues appears (takes about 10s, real AI).
- [ ] Run the guest health check 6 times quickly. The 6th gets "Too many health checks right now" (the limit is 5 per hour per IP).

## 2. Sign up and onboarding
- [ ] `/signup` with a new email. You land on `/onboarding`.
- [ ] A short password (under 8 characters) is rejected with a clear message.
- [ ] Signing up with an existing email in different case is rejected.
- [ ] During onboarding, upload a document on a file question (PDF/DOCX). It uploads.
- [ ] Leave mid-way and come back. The draft is restored.
- [ ] Finish onboarding. You land on `/dashboard`, and `/onboarding` now redirects to `/dashboard`.

## 3. Founder dashboard (new "Orion bento" design)
- [ ] "Welcome back, {first name}", the health score card, the stat cards (open, critical/high, documents) and the dark "Next steps" card all show real data.
- [ ] Sidebar badges show the open-issue and document counts. Check mobile width too (single column, collapsible sidebar).
- [ ] Documents: generate one from a template (AI). It appears in the list, and downloading it works.
- [ ] Documents: your onboarding upload appears in the list.
- [ ] Referrals: request expert help on an issue. It appears in "your referrals".
- [ ] AI chat: ask a question. The answer streams in word by word. (Messages are saved server-side as context, but the chat page has never re-displayed past messages after a reload.)
- [ ] Settings page loads.
- [ ] Log out. You're back at `/login`, and `/dashboard` now redirects to `/login`.

## 4. Login and sessions
- [ ] Log in with an existing account created before this release. It works with the same password.
- [ ] A wrong password says "Invalid email or password". After 10 wrong attempts on one email, it's locked for 15 minutes (other accounts are unaffected).
- [ ] In production, the session cookie `orion_session` is HttpOnly and Secure, on `.orion.africa`.

## 5. Admin console (new styling)
- [ ] Log in at the admin app `/login` with an admin account. You land on `/admin`.
- [ ] A member account trying `/admin` is sent to the web dashboard.
- [ ] The overview shows stats and the recent admin activity feed.
- [ ] Users: search and paginate. Change a user's role, then check the audit feed shows it.
- [ ] Users: suspend a test user. **That user is signed out on their next page load** and can't log back in. Then un-suspend them.
- [ ] Users: try to suspend yourself. This is refused.
- [ ] Assessments: create a template, then add a section, a question (with JSON options) and a rule. Edit each, then delete each.
- [ ] Publish a template. The **oldest** published template is the live one, so a new template only goes live once the current one is archived. After switching, the web `/health-check` shows it within about a minute, with no redeploy.
- [ ] Trying to delete a published template is refused ("Archive first").
- [ ] Submissions: the list filters by template. On the detail view, the founder's uploaded file downloads.
- [ ] Organisations (partners): add one with a logo, reorder, then delete. The landing page strip updates within about a minute.

## 6. Security spot checks (optional but recommended)
- [ ] Signed in as account A (copy its `orion_session` cookie), run `curl -X POST localhost:4000/v1/referrals -H 'content-type: application/json' -H 'Cookie: orion_session=…' -d '{"issueId":"<issue id from account B>","issueSummary":"x"}'`. You get 404, not success.
- [ ] `GET /api/documents/<someone else's document id>/download` returns 404.
- [ ] `curl -s localhost:4000/v1/admin/users` (no cookie) returns 401. With a member's cookie it returns 403.

## Deploy order (staging, then prod)
1. API with `DATABASE_URL`, `R2_*`, `OPENAI_API_KEY`, `COOKIE_DOMAIN=.orion.africa`, `CORS_ORIGINS=https://orion.africa,https://admin.orion.africa`.
2. Web and admin on Vercel: set `API_URL` and `NEXT_PUBLIC_API_URL`, and change the Root Directory to `frontend/web` / `frontend/admin`. Remove `DATABASE_URL`, `AUTH_*`, `R2_*` and `OPENAI_API_KEY` from both. They no longer need them.
