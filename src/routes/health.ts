import { Hono } from "hono";
import type { AppEnv } from "../env";
import { adminClient } from "../lib/supabase";

const VERSION = "0.1.0";

export const health = new Hono<AppEnv>();

health.get("/health", async (c) => {
  try {
    const { error } = await adminClient(c.env)
      .from("categories")
      .select("id", { count: "exact", head: true });

    if (error) throw error;

    return c.json({
      status: "ok",
      version: VERSION,
      timestamp: new Date().toISOString(),
      checks: { database: "ok" }
    });
  } catch (error) {
    console.error("Health check failed", error);
    return c.json(
      {
        status: "degraded",
        version: VERSION,
        timestamp: new Date().toISOString(),
        checks: { database: "error" }
      },
      503
    );
  }
});
