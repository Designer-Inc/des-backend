import { Hono } from "hono";
import type { AppEnv } from "../env";

export const cart = new Hono<AppEnv>();

// TODO: implement the cart routes from openapi.yaml.
// Keep the shared error shape, pagination and ownership checks from lib/.
