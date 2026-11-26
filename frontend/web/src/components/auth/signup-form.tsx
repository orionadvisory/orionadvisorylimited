"use client";

import { useActionState, useState } from "react";
import { signUp } from "@/app/actions/auth";
import { AuthShowcase } from "./auth-showcase";
import { AuthPanel } from "./auth-panel";
import { AuthError, AuthField, AuthSubmit } from "./form-parts";
import { emailScore, lengthScore, str, useSkyForm } from "./use-sky-form";

const score = (f: FormData) =>
  (lengthScore(str(f, "name").trim(), 3) + emailScore(str(f, "email")) + lengthScore(str(f, "password"), 8)) / 3;

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => await signUp(formData),
    undefined,
  );
  const { formRef, onInput } = useSkyForm(score, pending, state);
  // Controlled so a failed attempt keeps what was typed (React resets the form after an action).
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <>
      <AuthShowcase eyebrow="Eight domains · one map" title="Chart your company’s" accent="legal sky." />
      <AuthPanel
        kicker="Get started — free"
        title={<>Create your <em>account</em></>}
        subtitle="Map every legal gap across formation, equity, IP, tax and compliance — then fix them."
        footer={{ text: "Already have an account?", href: "/login", cta: "Sign in" }}
      >
        <form ref={formRef} action={formAction} onInput={onInput} className="space-y-5">
          <AuthField label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" placeholder="Alex Johnson" />
          <AuthField label="Email address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@startup.com" />
          <AuthField label="Password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
          <AuthError message={state?.error} />
          <AuthSubmit pending={pending} idle="Create account" busy="Creating your account…" />
          <p className="text-center text-xs text-mist">By signing up you agree to our Terms and Privacy Policy.</p>
        </form>
      </AuthPanel>
    </>
  );
}
