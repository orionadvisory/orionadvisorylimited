"use server";

import { apiErrorMessage, sessionApi } from "@orion/session/api";
import { revalidatePath } from "next/cache";

/** Consume a confirmation token from the emailed link. Works signed in or out. */
export async function confirmEmail(token: string) {
  const api = await sessionApi();
  const res = await api.v1.auth["verify-email"].$post({ json: { token } });
  if (!res.ok) return { error: await apiErrorMessage(res, "This confirmation link is invalid or has expired") };
  revalidatePath("/dashboard", "layout");
  return { success: true as const };
}

/** Send the signed-in user a new confirmation email. */
export async function resendConfirmationEmail() {
  const api = await sessionApi();
  const res = await api.v1.auth["verification-email"].$post();
  if (!res.ok) return { error: await apiErrorMessage(res) };
  return { success: true as const, status: (await res.json()).data.status };
}
