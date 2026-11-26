/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { HealthCheckResult } from "@orion/core/health-check/types";

/** Reads the last health check from localStorage; sends the visitor back if there is none. */
export function useResults() {
  const router = useRouter();
  const [result, setResult] = useState<HealthCheckResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("orion_health_check");
    if (!stored) {
      router.push("/health-check");
      return;
    }
    setResult(JSON.parse(stored));
  }, [router]);

  return { result, retake: () => router.push("/health-check") };
}
