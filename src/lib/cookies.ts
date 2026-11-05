import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { AppEnv } from "../env";

export const REFRESH_COOKIE = "refresh_token";

function isSecure(c: Context<AppEnv>): boolean {
  return c.env.COOKIE_SECURE !== "false";
}

export function setRefreshCookie(c: Context<AppEnv>, token: string): void {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isSecure(c),
    sameSite: "Lax",
    path: "/auth",
    maxAge: 604800
  });
}

export function readRefreshCookie(c: Context<AppEnv>): string | undefined {
  return getCookie(c, REFRESH_COOKIE);
}

export function clearRefreshCookie(c: Context<AppEnv>): void {
  deleteCookie(c, REFRESH_COOKIE, {
    secure: isSecure(c),
    sameSite: "Lax",
    path: "/auth"
  });
}
