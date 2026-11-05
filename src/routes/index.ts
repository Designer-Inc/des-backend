import { Hono } from "hono";
import type { AppEnv } from "../env";
import { auth } from "./auth";
import { catalog } from "./catalog";
import { config } from "./config";
import { health } from "./health";

export const routes = new Hono<AppEnv>();

routes.route("/", health);
routes.route("/", config);
routes.route("/", auth);
routes.route("/", catalog);
