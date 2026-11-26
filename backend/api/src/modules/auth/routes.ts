import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  LoginBodySchema,
  SESSION_COOKIE_NAME,
  SessionResponseSchema,
  SignupBodySchema,
  VerifyEmailBodySchema,
} from "@orion/contracts";
import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import type { Env } from "../../env";
import { ApiError } from "../../lib/errors";
import type { ActiveSession, AuthService, IssuedSession } from "./service";

const json = <T>(schema: T) => ({ "application/json": { schema } });
const errors = (...codes: Array<400 | 401 | 403 | 409 | 429>) =>
  Object.fromEntries(codes.map((c) => [c, { description: "Error", content: json(ErrorResponseSchema) }]));

const signupRoute = createRoute({
  method: "post",
  path: "/v1/auth/signup",
  tags: ["auth"],
  summary: "Create an account and start a session (sets the session cookie)",
  request: { body: { content: json(SignupBodySchema), required: true } },
  responses: {
    201: { description: "Account created, signed in", content: json(SessionResponseSchema) },
    ...errors(400, 409),
  },
});

const loginRoute = createRoute({
  method: "post",
  path: "/v1/auth/login",
  tags: ["auth"],
  summary: "Sign in with email and password (sets the session cookie)",
  request: { body: { content: json(LoginBodySchema), required: true } },
  responses: {
    200: { description: "Signed in", content: json(SessionResponseSchema) },
    ...errors(400, 401, 403, 429),
  },
});

const logoutRoute = createRoute({
  method: "post",
  path: "/v1/auth/logout",
  tags: ["auth"],
  summary: "End the current session (clears the session cookie)",
  responses: { 204: { description: "Signed out" } },
});

const sessionRoute = createRoute({
  method: "get",
  path: "/v1/auth/session",
  tags: ["auth"],
  summary: "The current session, from the session cookie",
  responses: {
    200: { description: "Signed in", content: json(SessionResponseSchema) },
    ...errors(401),
  },
});

const verifyEmailRoute = createRoute({
  method: "post",
  path: "/v1/auth/verify-email",
  tags: ["auth"],
  summary: "Confirm an email address with the token from the confirmation link",
  request: { body: { content: json(VerifyEmailBodySchema), required: true } },
  responses: {
    200: { description: "Email confirmed", content: json(z.object({ data: z.object({ verified: z.literal(true) }) })) },
    ...errors(400),
  },
});

const resendVerificationRoute = createRoute({
  method: "post",
  path: "/v1/auth/verification-email",
  tags: ["auth"],
  summary: "Send the signed-in user a new confirmation email",
  responses: {
    200: {
      description: "Sent, or already verified",
      content: json(z.object({ data: z.object({ status: z.enum(["sent", "already_verified"]) }) })),
    },
    ...errors(401, 429),
  },
});

const toBody = (s: ActiveSession) => ({ data: { user: s.user, expires: s.expires.toISOString() } });

export function authRoutes(auth: AuthService, env: Env) {
  const cookieBase = {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax" as const,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };

  const startSession = (c: Context, issued: IssuedSession) =>
    setCookie(c, SESSION_COOKIE_NAME, issued.token, {
      ...cookieBase,
      expires: issued.session.expires,
      maxAge: Math.floor((issued.session.expires.getTime() - Date.now()) / 1000),
    });

  return new OpenAPIHono()
    .openapi(signupRoute, async (c) => {
      const issued = await auth.signup(c.req.valid("json"));
      startSession(c, issued);
      return c.json(toBody(issued.session), 201);
    })
    .openapi(loginRoute, async (c) => {
      const issued = await auth.login(c.req.valid("json"));
      startSession(c, issued);
      return c.json(toBody(issued.session), 200);
    })
    .openapi(logoutRoute, async (c) => {
      const token = c.get("sessionToken");
      if (token) await auth.logout(token);
      deleteCookie(c, SESSION_COOKIE_NAME, cookieBase);
      return c.body(null, 204);
    })
    .openapi(verifyEmailRoute, async (c) => {
      await auth.verifyEmail(c.req.valid("json").token);
      return c.json({ data: { verified: true as const } }, 200);
    })
    .openapi(resendVerificationRoute, async (c) => {
      const session = c.get("session");
      if (!session) throw new ApiError(401, "unauthorized", "Not signed in");
      return c.json({ data: { status: await auth.resendVerification(session.user) } }, 200);
    })
    .openapi(sessionRoute, (c) => {
      const session = c.get("session");
      if (!session) throw new ApiError(401, "unauthorized", "Not signed in");
      c.header("Cache-Control", "no-store");
      return c.json(toBody(session), 200);
    });
}
