export type UserRole = "buyer" | "consultant" | "admin";

export function normalizeRole(value: unknown): UserRole {
  return value === "admin" || value === "consultant" ? value : "buyer";
}

export function canAccess(
  role: unknown,
  allowed: readonly UserRole[],
): boolean {
  return allowed.includes(normalizeRole(role));
}

const allowedDestinations = new Set([
  "/account",
  "/book",
  "/bookings",
  "/admin",
  "/leads",
]);

export function safeReturnTo(value: unknown): string {
  return typeof value === "string" && allowedDestinations.has(value)
    ? value
    : "/account";
}
