import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../env";

export const requestId: MiddlewareHandler<AppEnv> = async (c, next) => {
  const id = c.req.header("x-request-id") ?? crypto.randomUUID();
  c.set("requestId", id);
  c.header("x-request-id", id);
  await next();
};
