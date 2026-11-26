"use client";

import { useActionState, useState } from "react";
import { logIn } from "@/app/actions/auth";
import { AuthShowcase } from "./auth-showcase";
import { AuthPanel } from "./auth-panel";
import { AuthError, AuthField, AuthSubmit } from "./form-parts";
import { emailScore, lengthScore, str, useSkyForm } from "./use-sky-form";

const score = (f: FormData) => emailScore(str(f, "email")) * 0.5 + lengthScore(str(f, "password"), 8) * 0.5;

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => await logIn(formData),
    undefined,
  );
  const { formRef, onInput } = useSkyForm(score, pending, state);
  // Controlled so a failed attempt keeps the email (React resets the form after an action).
  const [email, setEmail] = useState("");

  return (
    <>
      <AuthShowcase eyebrow="Your legal north star" title="Every legal gap," accent="connected." />
      <AuthPanel
        kicker="Welcome back"
        title={<>Sign in to <em>Orion</em></>}
        subtitle="Pick up where you left off — your dashboard, documents and co-pilot are waiting."
        footer={{ text: "New to Orion?", href: "/signup", cta: "Create an account" }}
      >
        <form ref={formRef} action={formAction} onInput={onInput} className="space-y-5">
          <AuthField label="Email address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@startup.com" />
          <AuthField label="Password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
          <AuthError message={state?.error} />
          <AuthSubmit pending={pending} idle="Sign in" busy="Signing in…" />
        </form>
      </AuthPanel>
    </>
  );
}
