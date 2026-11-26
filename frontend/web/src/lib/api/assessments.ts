import "server-only";
import type { PublishedAssessment } from "@orion/contracts";
import { api, ApiRequestError } from "./client";

/**
 * The published Legal Health Check, or null when none is published.
 * Cached for 60s so a newly published template shows up within a minute
 * without every page view hitting the API. Throws if the API is unreachable/errors.
 */
export async function getPublishedAssessment(): Promise<PublishedAssessment | null> {
  const res = await api.v1.assessments.published.$get(undefined, {
    init: { next: { revalidate: 60, tags: ["published-assessment"] } },
  });
  if (res.ok) return (await res.json()).data;
  // The route only declares 200/404, but a 5xx is still possible at runtime.
  const status: number = res.status;
  if (status === 404) return null;
  throw new ApiRequestError("GET /v1/assessments/published", status);
}
