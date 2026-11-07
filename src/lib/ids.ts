const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Booking and request ids are UUIDs; anything else is rejected before touching the database. */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}
