import { Hono } from "hono";
import type { AppEnv } from "../env";

export const designs = new Hono<AppEnv>();

// TODO: implement the designs routes from openapi.yaml.
// Keep the shared error shape, pagination and ownership checks from lib/.
