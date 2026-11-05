import { describe, expect, it } from "vitest";
import { app } from "./app";
import type { Env } from "./env";

const env = {
  APP_ORIGIN: "http://localhost:5173",
  PUBLIC_ASSETS_BASE_URL: "http://localhost:5173/assets",
  COOKIE_SECURE: "false",
  DEMO_MODE: "true",
  APP_ENV: "test"
} as unknown as Env;

describe("des-backend scaffold", () => {
  it("returns five fonts from /config", async () => {
    const response = await app.request("/config", {}, env);
    const body = (await response.json()) as { fonts: unknown[] };

    expect(response.status).toBe(200);
    expect(body.fonts).toHaveLength(5);
  });

  it("uses the shared error shape for unknown routes", async () => {
    const response = await app.request("/does-not-exist");
    const body = (await response.json()) as {
      error: { code: string; requestId: string };
    };

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.requestId).toBeTypeOf("string");
  });

  it("rejects /auth/me without a token", async () => {
    const response = await app.request("/auth/me");
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});
