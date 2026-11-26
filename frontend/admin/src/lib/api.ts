import "server-only";

/** Keys the API sends as ISO strings that admin pages use as Date objects. */
type DateKey = "createdAt" | "updatedAt" | "publishedAt" | "completedAt";
const DATE_KEYS = new Set<string>(["createdAt", "updatedAt", "publishedAt", "completedAt"]);

export type Revived<T> = T extends (infer U)[]
  ? Revived<U>[]
  : T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends DateKey
          ? T[K] extends string
            ? Date
            : T[K] extends string | null
              ? Date | null
              : T[K]
          : Revived<T[K]>;
      }
    : T;

/** Turn the API's ISO timestamps back into Dates, so admin pages keep working unchanged. */
export function reviveDates<T>(value: T): Revived<T> {
  if (Array.isArray(value)) return value.map(reviveDates) as Revived<T>;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = DATE_KEYS.has(k) && typeof v === "string" ? new Date(v) : reviveDates(v);
    }
    return out as Revived<T>;
  }
  return value as Revived<T>;
}

type ErrorBody = { error?: { message?: string; details?: Array<{ message?: string }> } };

/** The most useful message from a failed API response. */
export async function failureMessage(res: Response, fallback = "Something went wrong. Please try again."): Promise<string> {
  const body = (await res.json().catch(() => null)) as ErrorBody | null;
  const detail = body?.error?.details?.[0]?.message;
  if (res.status === 400 && detail) return detail;
  return body?.error?.message ?? fallback;
}

export class AdminApiError extends Error {
  constructor(what: string, readonly status: number) {
    super(`Admin API: ${what} failed (${status})`);
    this.name = "AdminApiError";
  }
}
