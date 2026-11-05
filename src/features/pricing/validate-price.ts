import { calculateOnRoadPrice } from "./calculate-price";
import type { PriceInput } from "./types";

export function endOfIndiaDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Choose a valid date.");
  const midnight = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(+midnight) ||
    midnight.toISOString().slice(0, 10) !== value
  )
    throw new Error("Choose a valid date.");
  return new Date(+midnight + 86400000 - 19800000);
}

export function validatePriceInput(input: PriceInput, now = new Date()) {
  if (!input || typeof input !== "object") throw new Error("Invalid price.");
  if (typeof input.carId !== "string" || !/^[\w-]{1,80}$/.test(input.carId))
    throw new Error("Choose a car.");
  if (typeof input.cityId !== "string" || !/^[a-z-]{1,80}$/.test(input.cityId))
    throw new Error("Choose a city.");
  if (!Number.isSafeInteger(input.version) || input.version < 0)
    throw new Error("Reload the price before saving.");
  calculateOnRoadPrice(input);
  const validUntil = endOfIndiaDate(input.validThrough);
  if (validUntil <= now)
    throw new Error("Validity must include today or a future date.");
  return validUntil;
}
