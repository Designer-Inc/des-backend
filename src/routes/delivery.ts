import { Hono } from "hono";
import type { AppEnv } from "../env";

export const delivery = new Hono<AppEnv>();

// TODO: implement the delivery routes from openapi.yaml.
// Keep the shared error shape, pagination and ownership checks from lib/.
