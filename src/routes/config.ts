import { Hono } from "hono";
import { publicConfig } from "../config/public";
import type { AppEnv } from "../env";

export const config = new Hono<AppEnv>();

config.get("/config", (c) => {
  return c.json(publicConfig(c.env.PUBLIC_ASSETS_BASE_URL ?? ""));
});
