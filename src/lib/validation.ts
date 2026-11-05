import type { Context } from "hono";
import type { ZodType } from "zod";
import { AppError } from "./errors";

export async function parseJson<T>(c: Context, schema: ZodType<T>): Promise<T> {
  let raw: unknown;

  try {
    raw = await c.req.json();
  } catch {
    throw new AppError(400, "VALIDATION_ERROR", "Request body must be valid JSON");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      "Request validation failed",
      result.error.issues.map((issue) => ({
        field: issue.path.map(String).join(".") || undefined,
        message: issue.message
      }))
    );
  }

  return result.data;
}
