import { Hono } from "hono";
import type { AppEnv } from "../env";

export const admin = new Hono<AppEnv>();

// TODO: implement the admin routes from openapi.yaml.
// Keep the shared error shape, pagination and ownership checks from lib/.
