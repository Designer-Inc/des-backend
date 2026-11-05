import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "../env";

function requireEnv(env: Env, key: keyof Env): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${String(key)}`);
  }
  return value;
}

function makeClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        "X-Client-Info": "des-backend"
      }
    }
  });
}

export function anonClient(env: Env): SupabaseClient {
  return makeClient(
    requireEnv(env, "SUPABASE_URL"),
    requireEnv(env, "SUPABASE_ANON_KEY")
  );
}

export function adminClient(env: Env): SupabaseClient {
  return makeClient(
    requireEnv(env, "SUPABASE_URL"),
    requireEnv(env, "SUPABASE_SERVICE_ROLE_KEY")
  );
}
