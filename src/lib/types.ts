export type UserRole = "customer" | "moderator" | "admin" | "super_admin";

export type UserStatus = "active" | "blocked" | "deleted";

export type Permission =
  | "catalog:read"
  | "design:write"
  | "design:publish"
  | "order:write"
  | "company:write"
  | "moderation:review"
  | "admin:catalog"
  | "admin:orders"
  | "admin:users"
  | "admin:analytics";

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  locale: "uk" | "en";
  avatarUrl: string | null;
  permissions: Permission[];
  createdAt: string;
}

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  locale: "uk" | "en";
  avatar_file_id: string | null;
  created_at: string;
}
