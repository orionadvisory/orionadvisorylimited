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

/**
 * Build the API from environment variables and real dependencies. Shared by the
 * long-running Node server (server.ts, Docker) and the Vercel function (vercel.ts).
 */
export function buildApp() {
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
  return { app, env };
}
