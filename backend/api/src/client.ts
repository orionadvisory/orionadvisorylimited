/**
 * Typed API client for web/admin. Only *types* come from the API app,
 * so importing this never pulls server code (DB, secrets) into a frontend bundle.
 */
import { hc } from "hono/client";
import type { AppType } from "./app";

export type ApiClientOptions = {
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
  fetch?: typeof fetch;
};

export function createApiClient(baseUrl: string, options: ApiClientOptions = {}) {
  return hc<AppType>(baseUrl, options);
}

export type ApiClient = ReturnType<typeof createApiClient>;
