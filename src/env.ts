import type { PublicUser } from "./lib/types";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  APP_ORIGIN: string;
  PUBLIC_ASSETS_BASE_URL: string;
  COOKIE_SECURE?: string;
  DEMO_MODE?: string;
  APP_ENV?: string;
}

export type AppEnv = {
  Bindings: Env;
  Variables: {
    user: PublicUser;
    requestId: string;
  };
};
