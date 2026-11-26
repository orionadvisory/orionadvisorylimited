import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./session";

export interface ActiveAdminUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "admin";
  status: "active";
}

/** Server-side gate for admin pages, actions and route handlers. */
export async function requireActiveAdmin(): Promise<ActiveAdminUser> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "admin" || session.user.status !== "active") {
    redirect("/dashboard");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: "admin",
    status: "active",
  };
}
