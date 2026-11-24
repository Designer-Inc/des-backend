import { describe, expect, it } from "vitest";
import { app } from "./app";
import type { Env } from "./env";

describe("health caching", () => {
  it("marks health responses as no-store", async () => {
    const response = await app.request("/health", {}, {} as unknown as Env);

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
