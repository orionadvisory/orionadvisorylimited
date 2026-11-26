import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { loadEnv } from "./env";
import { checkDatabase } from "./lib/db-check";
import { assessmentsRepo } from "./modules/assessments/repo";
import { FailureLimiter } from "./modules/auth/rate-limit";
import { authRepo } from "./modules/auth/repo";
import { createAuthService } from "./modules/auth/service";
import { partnersRepo } from "./modules/partners/repo";
import { founderRepo } from "./modules/founder/repo";
import { adminRepo } from "./modules/admin/repo";
import { createMailer } from "./lib/email";
import { createOpenAiLlm } from "./lib/llm";
import { defaultAiLimits } from "./lib/rate-limit";
import { r2Storage } from "./lib/storage";

const env = loadEnv();
const auth = createAuthService({
  repo: authRepo,
  limiter: new FailureLimiter(),
  ttlMs: env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  mailer: createMailer(env),
  appUrl: env.WEB_APP_URL,
});
const founder = {
  repo: founderRepo,
  llm: createOpenAiLlm({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL }),
  storage: r2Storage,
  limits: defaultAiLimits(),
};
const app = createApp({
  env,
  checkDb: checkDatabase,
  partners: partnersRepo,
  assessments: assessmentsRepo,
  auth,
  founder,
  admin: { repo: adminRepo, storage: r2Storage },
});

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(JSON.stringify({ level: "info", msg: "orion api listening", port: info.port, env: env.NODE_ENV }));
});

function shutdown(signal: string) {
  console.log(JSON.stringify({ level: "info", msg: "shutting down", signal }));
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
