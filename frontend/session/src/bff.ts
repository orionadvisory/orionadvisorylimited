import { SESSION_COOKIE_NAME } from "@orion/contracts";

/**
 * Backend-for-frontend bridge: the web app's legacy same-origin `/api/*` routes forward
 * to the Orion API's `/v1/*`, so existing client components keep working unchanged.
 * Only an explicit allowlist is forwarded — this is not an open proxy.
 */
/** Paths the founder web app may forward. */
export const FOUNDER_PATHS: RegExp[] = [
  /^documents$/,
  /^documents\/upload$/,
  /^documents\/generate$/,
  /^documents\/recommended$/,
  /^documents\/[0-9a-f-]{36}\/download$/i,
  /^chat$/,
  /^health-check$/,
  /^health-check\/reevaluate$/,
  /^assessments\/start$/,
  /^onboarding\/complete$/,
];

/** Paths the admin app may forward (the API still enforces the admin role). */
export const ADMIN_PATHS: RegExp[] = [
  /^admin\/partners$/,
  /^admin\/partners\/[0-9a-f-]{36}$/i,
  /^admin\/uploads\/[0-9a-f-]{36}\/download$/i,
];

/** `["documents","upload"]` → `"/v1/documents/upload"`, or null if not forwardable. */
export function toApiPath(segments: string[], allowlist: RegExp[] = FOUNDER_PATHS): string | null {
  const joined = segments.join("/");
  if (segments.some((s) => s === ".." || s === "." || s === "")) return null;
  return allowlist.some((re) => re.test(joined)) ? `/v1/${joined}` : null;
}

const PASS_RESPONSE_HEADERS = ["content-type", "content-disposition", "cache-control", "location"];

/**
 * Adapt an API response to the legacy route contract:
 * JSON `{ data }` → the bare payload; JSON `{ error: { message } }` → `{ error: message }`;
 * redirects, streams (SSE) and files pass through untouched.
 */
export async function toLegacyResponse(upstream: Response): Promise<Response> {
  const headers = new Headers();
  for (const h of PASS_RESPONSE_HEADERS) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }

  const isJson = (upstream.headers.get("content-type") ?? "").includes("application/json");
  if (!isJson || upstream.status < 200 || (upstream.status >= 300 && upstream.status < 400)) {
    return new Response(upstream.body, { status: upstream.status, headers });
  }

  const body = (await upstream.json().catch(() => null)) as
    | { data?: unknown; error?: { message?: string } }
    | null;
  if (upstream.ok && body && "data" in body) return Response.json(body.data, { status: upstream.status });
  if (!upstream.ok && body?.error?.message) return Response.json({ error: body.error.message }, { status: upstream.status });
  return Response.json(body, { status: upstream.status });
}

/** Forward a browser request to the API as the same user (session cookie only). */
export async function forwardToApi(req: Request, apiPath: string, apiUrl: string): Promise<Response> {
  const url = new URL(req.url);
  const token = parseCookie(req.headers.get("cookie"), SESSION_COOKIE_NAME);

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", req.headers.get("accept") ?? "application/json");
  if (token) headers.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (clientIp) headers.set("x-orion-client-ip", clientIp);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const upstream = await fetch(`${apiUrl}${apiPath}${url.search}`, {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    redirect: "manual",
    cache: "no-store",
    // Required by Node's fetch when streaming a request body.
    ...(hasBody ? { duplex: "half" } : {}),
  } as RequestInit);

  return toLegacyResponse(upstream);
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=") || null;
  }
  return null;
}
