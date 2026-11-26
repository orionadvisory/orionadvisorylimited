import { ADMIN_PATHS, forwardToApi, toApiPath } from "@orion/session/bff";

/**
 * Same-origin bridge for admin client components (partners manager, upload downloads):
 * `/api/admin/<path>` → Orion API `/v1/admin/<path>`. Allowlisted; the API enforces the admin role.
 */
export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

async function handle(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const apiPath = toApiPath(["admin", ...(await params).path], ADMIN_PATHS);
  if (!apiPath) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    return await forwardToApi(req, apiPath, API_URL);
  } catch (err) {
    console.error(`[admin api bridge] ${req.method} ${apiPath} failed`, err);
    return Response.json({ error: "Service temporarily unavailable. Please try again." }, { status: 502 });
  }
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
