import "server-only";
import { createApiClient } from "@orion/api/client";

/** Server-to-server base URL for the Orion API (private network URL in prod if available). */
const API_URL = process.env.API_URL ?? "http://localhost:4000";

/** Browser-facing base URL for API-served assets (e.g. partner logos in <img src>). */
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = createApiClient(API_URL);

export class ApiRequestError extends Error {
  constructor(
    readonly endpoint: string,
    readonly status: number,
  ) {
    super(`Orion API ${endpoint} failed with ${status}`);
    this.name = "ApiRequestError";
  }
}
