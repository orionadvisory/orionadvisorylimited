import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import type { Env } from "./env";
import { ApiError, codeForStatus, errorBody } from "./lib/errors";
import { requestLog } from "./middleware/request-log";
import { sessionMiddleware } from "./middleware/session";
import type { AssessmentsRepo } from "./modules/assessments/repo";
import { assessmentsRoutes } from "./modules/assessments/routes";
import { authRoutes } from "./modules/auth/routes";
import type { AuthService } from "./modules/auth/service";
import { founderRoutes, type FounderDeps } from "./modules/founder/routes";
import { adminRoutes, bootstrapRoutes, type AdminDeps } from "./modules/admin/routes";
import type { PartnersRepo } from "./modules/partners/repo";
import { partnersRoutes } from "./modules/partners/routes";
import { systemRoutes } from "./modules/system/routes";

/** Everything the app touches outside itself, injected so tests can swap in fakes. */
export type AppDeps = {
  env: Env;
  checkDb: () => Promise<boolean>;
  partners: PartnersRepo;
  assessments: AssessmentsRepo;
  auth: AuthService;
  founder: FounderDeps;
  admin: AdminDeps;
};

export function createApp({ env, checkDb, partners, assessments, auth, founder, admin }: AppDeps) {
  const app = new OpenAPIHono({
    // Request validation failures use the shared error envelope.
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          errorBody("validation_failed", "Request validation failed", {
            details: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
            requestId: c.get("requestId"),
          }),
          400,
        );
      }
    },
  });

  app.use("*", requestId());
  app.use("*", requestLog);
  // `same-site` (not the default `same-origin`) so *.orion.africa pages can embed API-served assets like partner logos.
  app.use("*", secureHeaders({ crossOriginResourcePolicy: "same-site" }));
  app.use(
    "*",
    cors({
      origin: (origin) => (env.CORS_ORIGINS.includes(origin) ? origin : null),
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["X-Request-Id"],
      maxAge: 600,
    }),
  );

  // Health probes and public assets skip the session lookup; everything under /v1 gets it.
  app.use("/v1/*", sessionMiddleware(auth));

  const routes = app
    .route("/", systemRoutes({ version: env.APP_VERSION, checkDb }))
    .route("/", partnersRoutes(partners))
    .route("/", assessmentsRoutes(assessments))
    .route("/", authRoutes(auth, env))
    .route("/", founderRoutes(founder))
    .route("/", bootstrapRoutes(admin))
    .route("/", adminRoutes(admin));

  if (env.NODE_ENV !== "production") {
    app.doc31("/v1/openapi.json", {
      openapi: "3.1.0",
      info: { title: "Orion API", version: env.APP_VERSION },
    });
  }

  app.notFound((c) =>
    c.json(errorBody("not_found", `No route for ${c.req.method} ${c.req.path}`, { requestId: c.get("requestId") }), 404),
  );

  app.onError((err, c) => {
    const rid = c.get("requestId");
    if (err instanceof ApiError) {
      return c.json(errorBody(err.code, err.message, { details: err.details, requestId: rid }), err.status);
    }
    if (err instanceof HTTPException) {
      return c.json(errorBody(codeForStatus(err.status), err.message, { requestId: rid }), err.status);
    }
    console.error(JSON.stringify({ level: "error", msg: "unhandled error", requestId: rid, err: String(err), stack: (err as Error).stack }));
    // Never leak internals to clients.
    return c.json(errorBody("internal_error", "Something went wrong", { requestId: rid }), 500);
  });

  return routes;
}

/** Type of the full route tree; consumed by the typed client in `./client`. */
export type AppType = ReturnType<typeof createApp>;
