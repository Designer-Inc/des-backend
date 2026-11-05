import type { Permission, UserRole } from "./types";

const customer: Permission[] = [
  "catalog:read",
  "design:write",
  "design:publish",
  "order:write",
  "company:write"
];

const moderator: Permission[] = [
  ...customer,
  "moderation:review"
];

const admin: Permission[] = [
  ...moderator,
  "admin:catalog",
  "admin:orders",
  "admin:users",
  "admin:analytics"
];

export function permissionsForRole(role: UserRole): Permission[] {
  switch (role) {
    case "moderator":
      return moderator;
    case "admin":
    case "super_admin":
      return admin;
    default:
      return customer;
  }
}

export const roleRank: Record<UserRole, number> = {
  customer: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3
};
