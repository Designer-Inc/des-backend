import type { Context } from "hono";
import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../env";
import { getBearerToken } from "../lib/bearer";
import {
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie
} from "../lib/cookies";
import { AppError } from "../lib/errors";
import { adminClient, anonClient } from "../lib/supabase";
import { loadUserProfile } from "../lib/user";
import { parseJson } from "../lib/validation";
import { requireAuth } from "../middleware/auth";

const localeSchema = z.enum(["uk", "en"]);
const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[0-9]/, "Password must contain at least one digit");

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  email: z.email(),
  password: passwordSchema,
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().min(10).max(20).optional(),
  locale: localeSchema.optional(),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  termsVersion: z.string().min(1),
  privacyVersion: z.string().min(1)
});

const forgotSchema = z.object({
  email: z.email()
});

const resetSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema
});

const verifySchema = z.object({
  token: z.string().min(1)
});

const oauthSchema = z.object({
  idToken: z.string().min(1)
});

interface SessionLike {
  access_token: string;
  refresh_token: string;
}

async function sessionPayload(
  c: Context<AppEnv>,
  userId: string,
  session: SessionLike
) {
  setRefreshCookie(c, session.refresh_token);
  const profile = await loadUserProfile(adminClient(c.env), userId);

  return {
    accessToken: session.access_token,
    tokenType: "Bearer" as const,
    expiresIn: 900,
    user: profile,
    permissions: profile.permissions
  };
}

export const auth = new Hono<AppEnv>();

auth.post("/auth/register", async (c) => {
  const body = await parseJson(c, registerSchema);
  const anon = anonClient(c.env);

  const { data, error } = await anon.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        full_name: body.fullName,
        phone: body.phone ?? null,
        locale: body.locale ?? "uk"
      },
      emailRedirectTo: `${c.env.APP_ORIGIN}/login`
    }
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      throw new AppError(409, "CONFLICT", "Email is already registered");
    }
    throw new AppError(422, "VALIDATION_ERROR", error.message);
  }

  if (!data.user) {
    throw new AppError(422, "VALIDATION_ERROR", "Registration failed");
  }

  // TODO: insert legal_acceptances for termsVersion/privacyVersion.
  const profile = await loadUserProfile(adminClient(c.env), data.user.id);

  return c.json(
    {
      user: profile,
      requiresEmailConfirmation: !data.session,
      accessToken: data.session?.access_token ?? null,
      expiresIn: data.session ? 900 : null,
      permissions: profile.permissions
    },
    201
  );
});

auth.post("/auth/login", async (c) => {
  const body = await parseJson(c, loginSchema);
  const anon = anonClient(c.env);

  const { data, error } = await anon.auth.signInWithPassword({
    email: body.email,
    password: body.password
  });

  if (error || !data.session || !data.user) {
    throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  return c.json(await sessionPayload(c, data.user.id, data.session));
});

auth.post("/auth/refresh", async (c) => {
  const refreshToken = readRefreshCookie(c);
  if (!refreshToken) {
    throw new AppError(401, "UNAUTHORIZED", "Missing refresh token");
  }

  const { data, error } = await anonClient(c.env).auth.refreshSession({
    refresh_token: refreshToken
  });

  if (error || !data.session) {
    clearRefreshCookie(c);
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired refresh token");
  }

  setRefreshCookie(c, data.session.refresh_token);
  return c.json({
    accessToken: data.session.access_token,
    expiresIn: 900
  });
});

auth.post("/auth/logout", async (c) => {
  const accessToken = getBearerToken(c);

  if (accessToken) {
    try {
      await adminClient(c.env).auth.admin.signOut(accessToken, "local");
    } catch (error) {
      console.error("Failed to revoke Supabase session", error);
    }
  }

  clearRefreshCookie(c);
  return c.body(null, 204);
});

auth.post("/auth/password/forgot", async (c) => {
  const body = await parseJson(c, forgotSchema);

  const { error } = await anonClient(c.env).auth.resetPasswordForEmail(
    body.email,
    { redirectTo: `${c.env.APP_ORIGIN}/reset-password` }
  );

  if (error) {
    console.error("Password reset email failed", error);
  }

  return c.body(null, 204);
});

auth.post("/auth/password/reset", async (c) => {
  const body = await parseJson(c, resetSchema);
  const anon = anonClient(c.env);

  const { error: verifyError } = await anon.auth.verifyOtp({
    token_hash: body.token,
    type: "recovery"
  });

  if (verifyError) {
    throw new AppError(422, "VALIDATION_ERROR", "Invalid or expired reset token");
  }

  const { error: updateError } = await anon.auth.updateUser({
    password: body.newPassword
  });

  if (updateError) {
    throw new AppError(422, "VALIDATION_ERROR", updateError.message);
  }

  return c.body(null, 204);
});

auth.post("/auth/email/verify", async (c) => {
  const body = await parseJson(c, verifySchema);
  const anon = anonClient(c.env);

  const { data, error } = await anon.auth.verifyOtp({
    token_hash: body.token,
    type: "email"
  });

  if (error || !data.session || !data.user) {
    throw new AppError(422, "VALIDATION_ERROR", "Invalid or expired email token");
  }

  return c.json(await sessionPayload(c, data.user.id, data.session));
});

auth.post("/auth/oauth/google", async (c) => {
  const body = await parseJson(c, oauthSchema);
  const anon = anonClient(c.env);

  const { data, error } = await anon.auth.signInWithIdToken({
    provider: "google",
    token: body.idToken
  });

  if (error || !data.session || !data.user) {
    throw new AppError(401, "UNAUTHORIZED", "Google authentication failed");
  }

  return c.json(await sessionPayload(c, data.user.id, data.session));
});

auth.get("/auth/me", requireAuth, (c) => {
  return c.json(c.get("user"));
});
