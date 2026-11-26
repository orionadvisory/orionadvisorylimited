"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileData } from "@orion/core/health-check/types";

export type HealthCheckStep = "profile" | "documents" | "analysing";

/** State + submit for the profile → documents health check. */
export function useHealthCheckFlow() {
  const router = useRouter();
  const [step, setStep] = useState<HealthCheckStep>("profile");
  const [profile, setProfile] = useState<Partial<ProfileData>>({
    hasRevenue: false,
    raisingFunding: false,
  });
  const [documentsHeld, setDocumentsHeld] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const profileComplete = Boolean(
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
      localStorage.setItem("orion_health_check", JSON.stringify(result));
      router.push("/health-check/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("documents");
    }
  };

  const goTo = (next: HealthCheckStep) => {
    setStep(next);
    window.scrollTo(0, 0);
  };

  const currentStep = step === "profile" ? 1 : 2;
  const progressPercent = step === "analysing" ? 100 : (currentStep / 2) * 100;

  return {
    step,
    profile,
    documentsHeld,
    error,
    profileComplete,
    currentStep,
    progressPercent,
    handleProfileChange,
    handleDocToggle,
    handleSubmit,
    goTo,
  };
}
