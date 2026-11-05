import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppEnv } from "../env";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "OUT_OF_STOCK"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "RATE_LIMITED"
  | "DPI_TOO_LOW"
  | "PERSONALIZATION_MISMATCH"
  | "PAYMENT_FAILED"
  | "COMPANY_PROFILE_INCOMPLETE"
  | "INVALID_STATUS_TRANSITION"
  | "DESIGN_NOT_ORDERABLE"
  | "INTERNAL_ERROR";

export interface ValidationDetail {
  field?: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ValidationDetail[]
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(err: Error, c: Context<AppEnv>): Response {
  const requestId = c.get("requestId") ?? "unknown";

  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
          requestId
        }
      },
      err.status
    );
  }

  console.error("Unhandled error", { requestId, error: err });
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        requestId
      }
    },
    500
  );
}

export function notFoundHandler(c: Context<AppEnv>): Response {
  return c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
        requestId: c.get("requestId") ?? "unknown"
      }
    },
    404
  );
}
