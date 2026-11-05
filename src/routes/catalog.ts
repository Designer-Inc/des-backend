import { Hono } from "hono";
import type { AppEnv } from "../env";
import { AppError } from "../lib/errors";
import { adminClient } from "../lib/supabase";

export const catalog = new Hono<AppEnv>();

catalog.get("/categories", async (c) => {
  const { data, error } = await adminClient(c.env)
    .from("categories")
    .select("id,name,slug,description,position,is_active")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (error) {
    console.error("Failed to load categories", error);
    throw new AppError(500, "INTERNAL_ERROR", "Failed to load categories");
  }

  return c.json({
    items: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      position: row.position,
      isActive: row.is_active
    }))
  });
});

// TODO: GET /products, GET /products/:id, GET /designs, GET /designs/:id,
// GET /designs/mine, GET /search.
