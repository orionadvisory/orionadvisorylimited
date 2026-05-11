import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "member" | "admin";
      status: "active" | "suspended";
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "member" | "admin";
    status?: "active" | "suspended";
    onboardingCompleted?: boolean;
  }
}
