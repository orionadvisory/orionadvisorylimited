import { createMiddleware } from "hono/factory";

/** One structured JSON line per request. Health probes are skipped to keep logs quiet. */
export const requestLog = createMiddleware(async (c, next) => {
  const start = performance.now();
  await next();
  if (c.req.path === "/healthz" || c.req.path === "/readyz") return;
  console.log(
    JSON.stringify({
      level: c.res.status >= 500 ? "error" : "info",
      msg: "request",
      requestId: c.get("requestId"),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      ms: Math.round(performance.now() - start),
    }),
  );
});
