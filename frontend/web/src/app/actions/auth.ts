"use server";

import { loginWithPassword, logoutSession, signupWithPassword } from "@orion/session/credentials";
import { redirect } from "next/navigation";

const field = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function signUp(formData: FormData) {
  const name = field(formData, "name");
  const email = field(formData, "email");
  const password = field(formData, "password");

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const result = await signupWithPassword({ name, email, password });
  if (!result.ok) return { error: result.error };

  redirect("/onboarding");
}

export async function logIn(formData: FormData) {
  const email = field(formData, "email");
  const password = field(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const result = await loginWithPassword({ email, password });
  if (!result.ok) return { error: result.error };

  redirect("/dashboard");
}

export async function logOut() {
  await logoutSession();
  redirect("/login");
}
