import { Hono } from "hono";
import type { AppEnv } from "../env";

export const uploads = new Hono<AppEnv>();

// TODO: implement the uploads routes from openapi.yaml.
// Keep the shared error shape, pagination and ownership checks from lib/.
