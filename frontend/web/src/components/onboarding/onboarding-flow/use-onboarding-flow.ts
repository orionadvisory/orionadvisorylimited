"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileData } from "@orion/core/health-check/types";
import { persistHealthCheck } from "@/app/actions/health-check";

export type FlowStep = "profile" | "documents" | "analysing";

/** State + submit pipeline for the legacy profile/documents onboarding flow. */
export function useOnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>("profile");
  const [companyName, setCompanyName] = useState("");
  const [profile, setProfile] = useState<Partial<ProfileData>>({
    hasRevenue: false,
    raisingFunding: false,
  });
  const [documentsHeld, setDocumentsHeld] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const profileComplete = Boolean(
    companyName.trim() &&
      profile.stage &&
      profile.jurisdiction &&
      profile.cofounders &&
      profile.employees &&
      profile.industry
  );

  const handleProfileChange = (updates: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleDocToggle = (docId: string) => {
    setDocumentsHeld((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleSubmit = async () => {
    setStep("analysing");
    setError("");

    try {
      // 1. Run AI health check assessment
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profile as ProfileData,
          documentsHeld: Array.from(documentsHeld),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Assessment failed");
      }

      const result = await res.json();

      // 2. Persist to database (user is already authenticated at this point)
      const persistResult = await persistHealthCheck(JSON.stringify(result));

      if (persistResult.error) {
        throw new Error(persistResult.error);
      }

      // 3. Also save the company name to the startup
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          startupId: persistResult.startupId,
        }),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("documents");
    }
  };

  return {
    step,
    setStep,
    companyName,
    setCompanyName,
    profile,
    profileComplete,
    handleProfileChange,
    documentsHeld,
    handleDocToggle,
    error,
    handleSubmit,
  };
}
