import { forwardToApi, toApiPath } from "@orion/session/bff";

/**
 * Same-origin bridge for client components: `/api/<path>` → Orion API `/v1/<path>`.
 * Only allowlisted paths are forwarded (see @orion/session/bff). Streams SSE, uploads
 * and downloads; translates the API's envelopes back to the legacy response shapes.
 */
export const dynamic = "force-dynamic";
// AI scoring, generation and chat can run long (Vercel's default is 10s).
export const maxDuration = 60;

const API_URL = process.env.API_URL ?? "http://localhost:4000";

async function handle(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const apiPath = toApiPath((await params).path);
  if (!apiPath) return Response.json({ error: "Not found" }, { status: 404 });
  try {
    return await forwardToApi(req, apiPath, API_URL);
  } catch (err) {
    console.error(`[api bridge] ${req.method} ${apiPath} failed`, err);
    return Response.json({ error: "Service temporarily unavailable. Please try again." }, { status: 502 });
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE };
