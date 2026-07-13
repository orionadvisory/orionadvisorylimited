import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@orion/db";
import { users } from "@orion/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const useSecureCookies = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  // When AUTH_COOKIE_DOMAIN is set (e.g. ".orion.africa"), the session cookie
  // is shared across subdomains so the web app and admin app share a login.
  // Left unset in local dev (localhost cookies are already shared across ports).
  cookies: process.env.AUTH_COOKIE_DOMAIN
    ? {
        sessionToken: {
          name: `${useSecureCookies ? "__Secure-" : ""}authjs.session-token`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            domain: process.env.AUTH_COOKIE_DOMAIN,
            secure: useSecureCookies,
          },
        },
      }
    : undefined,
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      if (token.id && (user || !token.role || !token.status || !token.onboardingCompleted)) {
        const [dbUser] = await db
          .select({
            role: users.role,
            status: users.status,
            onboardingCompleted: users.onboardingCompleted,
          })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);

        token.role = dbUser?.role ?? "member";
        token.status = dbUser?.status ?? "active";
        token.onboardingCompleted = dbUser?.onboardingCompleted ?? false;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "member" | "admin") ?? "member";
        session.user.status = (token.status as "active" | "suspended") ?? "active";
        session.user.onboardingCompleted = (token.onboardingCompleted as boolean) ?? false;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // /login, /dashboard and /onboarding live in the web app. Inside the
      // admin app, NEXT_PUBLIC_WEB_URL points these redirects at the web
      // origin; in the web app it is unset (or its own origin), keeping them
      // same-origin.
      const webUrl = (path: string) =>
        new URL(path, process.env.NEXT_PUBLIC_WEB_URL || request.url);

      // Route classification
      const isAppRoute =
        pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
      const isAdminCreate = pathname === "/admin/create";
      const isAdminRoute = pathname.startsWith("/admin") && !isAdminCreate;
      const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/signup");
      const isOnboardingRoute = pathname.startsWith("/onboarding");
      const isActiveAdmin =
        auth?.user?.role === "admin" && auth.user.status === "active";
      const hasCompletedOnboarding = auth?.user?.onboardingCompleted === true;

      // Unauthenticated → login
      if (isAppRoute && !isLoggedIn) {
        return Response.redirect(webUrl("/login"));
      }

      if (isAdminRoute && !isLoggedIn) {
        // The admin app has its own login on the same origin.
        return Response.redirect(new URL("/login", request.url));
      }

      // Onboarding enforcement: incomplete users can only access /onboarding (admins exempt)
      if (isLoggedIn && !hasCompletedOnboarding && !isActiveAdmin && !isOnboardingRoute && !isAuthRoute && !isAdminCreate) {
        return Response.redirect(webUrl("/onboarding"));
      }

      // Completed users can't go back to /onboarding
      if (isLoggedIn && hasCompletedOnboarding && isOnboardingRoute) {
        return Response.redirect(webUrl("/dashboard"));
      }

      // Admin route protection
      if (isAdminRoute && !isActiveAdmin) {
        return Response.redirect(webUrl("/dashboard"));
      }

      // Logged-in users don't need auth pages
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(webUrl("/dashboard"));
      }

      return true;
    },
  },
});
