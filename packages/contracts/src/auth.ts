import { z } from "@hono/zod-openapi";

/** httpOnly cookie carrying the opaque session token. Set by the API, forwarded by the Next apps. */
export const SESSION_COOKIE_NAME = "orion_session";

export const UserRoleSchema = z.enum(["member", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum(["active", "suspended"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const SessionUserSchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    email: z.string(),
    image: z.string().nullable(),
    role: UserRoleSchema,
    status: UserStatusSchema,
    onboardingCompleted: z.boolean(),
    /** True once the user has clicked the confirmation link sent to their email. */
    emailVerified: z.boolean(),
  })
  .openapi("SessionUser");
export type SessionUser = z.infer<typeof SessionUserSchema>;

export const SessionSchema = z
  .object({
    user: SessionUserSchema,
    /** ISO timestamp when the session stops being valid. */
    expires: z.string(),
  })
  .openapi("Session");
export type Session = z.infer<typeof SessionSchema>;

export const SessionResponseSchema = z.object({ data: SessionSchema }).openapi("SessionResponse");

const EmailSchema = z.string().trim().toLowerCase().max(255).email();

export const LoginBodySchema = z
  .object({
    email: EmailSchema,
    password: z.string().min(1).max(1000),
  })
  .openapi("LoginBody");
export type LoginBody = z.infer<typeof LoginBodySchema>;

export const SignupBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email: EmailSchema,
    // bcrypt only uses the first 72 bytes, so longer passwords would be silently truncated.
    password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be at most 72 characters"),
  })
  .openapi("SignupBody");
export type SignupBody = z.infer<typeof SignupBodySchema>;

export const VerifyEmailBodySchema = z
  .object({ token: z.string().min(16).max(200) })
  .openapi("VerifyEmailBody");
