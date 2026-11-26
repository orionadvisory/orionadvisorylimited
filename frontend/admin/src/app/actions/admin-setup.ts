"use server";

import { sessionApi } from "@orion/session/api";
import { failureMessage } from "@/lib/api";

export type SetupState = { error: string | null; success: boolean };

export async function hasAdminUser(): Promise<boolean> {
  const api = await sessionApi();
  const res = await api.v1.bootstrap.admin.$get();
  if (!res.ok) throw new Error(`Orion API GET /v1/bootstrap/admin failed with ${res.status}`);
  return (await res.json()).data.hasAdmin;
}

/** Create the very first admin. The API refuses once any admin exists. */
export async function createBootstrapAdmin(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const field = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : null;
  };
  const name = field("name");
  const email = field("email");
  const password = field("password");
  const confirmPassword = field("confirmPassword");

  if (name === null || email === null || password === null || confirmPassword === null) {
    return { error: "All fields are required.", success: false };
  }
  if (password.trim() !== confirmPassword.trim()) {
    return { error: "Passwords do not match.", success: false };
  }

  const api = await sessionApi();
  const res = await api.v1.bootstrap.admin.$post({ json: { name, email, password } });
  if (!res.ok) return { error: await failureMessage(res), success: false };
  return { error: null, success: true };
}
