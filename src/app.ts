import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv } from "./env";
import { errorHandler, notFoundHandler } from "./lib/errors";
import { requestId } from "./middleware/request-id";
import { routes } from "./routes";

export const app = new Hono<AppEnv>();

app.use("*", requestId);
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const env = (c as unknown as { env?: Partial<AppEnv["Bindings"]> }).env;
      const allowed = [
        env?.APP_ORIGIN,
        "http://localhost:5173",
        "http://localhost:4173"
      ].filter((value): value is string => Boolean(value));

      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Authorization",
      "Content-Type",
      "Idempotency-Key",
      "X-Request-Id"
    ],
    exposeHeaders: ["X-Request-Id", "Retry-After"],
    credentials: true,
    maxAge: 600
  })
);

app.get("/", (c) => {
  return c.json({
    name: "des-backend",
    version: "0.1.0",
    docs: "https://github.com/Designer-Inc/des-docs"
  });
});

app.route("/", routes);
app.notFound(notFoundHandler);
app.onError(errorHandler);
