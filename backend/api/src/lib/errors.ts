import type { ErrorCode, ErrorResponse } from "@orion/contracts";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/** Throw from any handler/service to return a typed error envelope. */
export class ApiError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorBody(
  code: ErrorCode,
  message: string,
  opts: { details?: unknown; requestId?: string } = {},
): ErrorResponse {
  return {
    error: {
      code,
      message,
      ...(opts.details !== undefined ? { details: opts.details } : {}),
      ...(opts.requestId ? { requestId: opts.requestId } : {}),
    },
  };
}

/** Map a raw HTTP status (e.g. from HTTPException) to our error code vocabulary. */
export function codeForStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 422:
      return "validation_failed";
    case 429:
      return "rate_limited";
    case 503:
      return "service_unavailable";
    default:
      return status >= 500 ? "internal_error" : "bad_request";
  }
}
