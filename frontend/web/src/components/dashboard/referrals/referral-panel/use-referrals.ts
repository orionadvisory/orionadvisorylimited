"use client";

import { useCallback, useEffect, useState } from "react";
import { createReferral, getUserIssues, getUserReferrals } from "@/app/actions/referrals";
import type { Issue, Referral } from "./referral-model";

/** Loads the user's issues + referrals and submits new referral requests. */
export function useReferrals() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [referralsList, setReferralsList] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    const [issueData, referralData] = await Promise.all([getUserIssues(), getUserReferrals()]);
    setIssues(issueData as Issue[]);
    setReferralsList(referralData as Referral[]);
    setLoading(false);
  }, []);

  // Initial load: state is only set in async callbacks, and skipped after unmount.
  useEffect(() => {
    let cancelled = false;
    Promise.all([getUserIssues(), getUserReferrals()]).then(([issueData, referralData]) => {
      if (cancelled) return;
      setIssues(issueData as Issue[]);
      setReferralsList(referralData as Referral[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (issueId: string, summary: string) => {
    setSubmitting(true);
    setSuccess("");
    setError("");
    const result = await createReferral({ issueId, issueSummary: summary });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess("Your referral request has been submitted. We'll match you with an expert shortly.");
    loadData();
  };

  return { issues, referralsList, loading, submitting, success, error, handleSubmit };
}
