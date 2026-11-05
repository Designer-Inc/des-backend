import { Hono } from "hono";
import type { AppEnv } from "../env";

export const moderation = new Hono<AppEnv>();

// TODO: implement the moderation routes from openapi.yaml.
// Keep the shared error shape, pagination and ownership checks from lib/.
