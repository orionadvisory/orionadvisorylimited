import { z } from "zod";

const csv = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().url().optional(),
    /** Comma-separated list of browser origins allowed to call the API with credentials. */
    CORS_ORIGINS: z
      .string()
      .default("http://localhost:3000,http://localhost:3001")
      .transform(csv),
    APP_VERSION: z.string().default("dev"),
    /** Parent domain for the session cookie in prod (e.g. ".orion.africa") so web, admin and api share it. Unset locally. */
    COOKIE_DOMAIN: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined),
    SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default("gpt-4o-mini"),
    /** Resend API key. Unset locally: emails are logged to the console instead of sent. */
    RESEND_API_KEY: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined),
    /** Sender, e.g. "ORION <hello@mail.example.com>". The domain must be verified in Resend. */
    EMAIL_FROM: z.string().default("ORION <onboarding@resend.dev>"),
    /** Public URL of the founder web app, used to build links in emails. */
    WEB_APP_URL: z.string().url().default("http://localhost:3000"),
  })
  .refine((env) => env.NODE_ENV !== "production" || !!env.DATABASE_URL, {
    message: "DATABASE_URL is required in production",
    path: ["DATABASE_URL"],
  });

export type Env = z.infer<typeof EnvSchema>;

/** Parse and validate environment variables; throws with a readable message on failure. */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid API environment:\n${issues}`);
  }
  return result.data;
}
