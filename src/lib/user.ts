import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "./errors";
import { permissionsForRole } from "./permissions";
import type { PublicUser, UserRow } from "./types";

const userColumns = [
  "id",
  "email",
  "full_name",
  "phone",
  "role",
  "status",
  "locale",
  "avatar_file_id",
  "created_at"
].join(",");

export function mapUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role,
    status: row.status,
    locale: row.locale,
    avatarUrl: null,
    permissions: permissionsForRole(row.role),
    createdAt: row.created_at
  };
}

export async function loadUserProfile(
  admin: SupabaseClient,
  userId: string
): Promise<PublicUser> {
  const { data, error } = await admin
    .from("users")
    .select(userColumns)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load user profile", { userId, error });
    throw new AppError(500, "INTERNAL_ERROR", "Failed to load user profile");
  }

  if (!data) {
    throw new AppError(401, "UNAUTHORIZED", "User profile not found");
  }

  const row = data as unknown as UserRow;
  if (row.status !== "active") {
    throw new AppError(403, "FORBIDDEN", "User is not active");
  }

  return mapUser(row);
}
