"use server";

import { loginWithPassword, logoutSession } from "@orion/session/credentials";
import { redirect } from "next/navigation";

const field = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function logIn(formData: FormData) {
  const email = field(formData, "email");
  const password = field(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const result = await loginWithPassword({ email, password });
  if (!result.ok) return { error: result.error };

  redirect("/admin");
}

export async function logOut() {
  await logoutSession();
  redirect("/login");
}
