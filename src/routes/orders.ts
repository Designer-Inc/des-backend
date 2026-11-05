import { Hono } from "hono";
import type { AppEnv } from "../env";

export const orders = new Hono<AppEnv>();

// TODO: implement the orders routes from openapi.yaml.
// Keep the shared error shape, pagination and ownership checks from lib/.
