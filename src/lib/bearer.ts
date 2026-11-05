import type { Context } from "hono";

export function getBearerToken(c: Context): string | null {
  const header = c.req.header("authorization");
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
}
