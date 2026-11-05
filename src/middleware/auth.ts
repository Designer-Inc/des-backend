import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../env";
import { getBearerToken } from "../lib/bearer";
import { AppError } from "../lib/errors";
import { roleRank } from "../lib/permissions";
import { adminClient, anonClient } from "../lib/supabase";
import { loadUserProfile } from "../lib/user";
import type { UserRole } from "../lib/types";

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getBearerToken(c);
  if (!token) {
    throw new AppError(401, "UNAUTHORIZED", "Missing access token");
  }

  const { data, error } = await anonClient(c.env).auth.getUser(token);
  if (error || !data.user) {
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired access token");
  }

  const user = await loadUserProfile(adminClient(c.env), data.user.id);
  c.set("user", user);
  await next();
};

export function requireRole(...roles: UserRole[]): MiddlewareHandler<AppEnv> {
  const minimumRank = Math.min(...roles.map((role) => roleRank[role]));

  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    if (roleRank[user.role] < minimumRank) {
      throw new AppError(403, "FORBIDDEN", "Insufficient permissions");
    }
    await next();
  };
}
