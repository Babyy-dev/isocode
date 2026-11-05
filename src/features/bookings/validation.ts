import { demoShowrooms, demoTimes } from "@/features/demo/data";
import { endOfIndiaDate } from "@/features/pricing/validate-price";
import type { BookingInput } from "./types";

export class BookingError extends Error {}

export function validateBooking(input: BookingInput, now = Date.now()) {
  if (!input || typeof input !== "object")
    throw new BookingError("Invalid booking.");
  if (input.aiConsent !== undefined && typeof input.aiConsent !== "boolean")
    throw new BookingError("Choose whether to allow AI assistance.");
  if (input.consent !== true)
    throw new BookingError(
      "Consent is required to book and arrange follow-up.",
    );
  if (
    typeof input.requestId !== "string" ||
    !/^[a-f0-9-]{36}$/.test(input.requestId)
  )
    throw new BookingError("Reload the form and try again.");
  if (
    typeof input.carId !== "string" ||
    !/^[\w-]{1,80}$/.test(input.carId) ||
    typeof input.cityId !== "string" ||
    !/^[a-z-]{1,80}$/.test(input.cityId)
  )
    throw new BookingError("Choose a car and city.");
  if (!Number.isSafeInteger(input.priceVersion) || input.priceVersion < 1)
    throw new BookingError("An available price is required.");
  if (
    !demoShowrooms.includes(input.showroom) ||
    !demoTimes.includes(input.time)
  )
    throw new BookingError("Choose a showroom and a listed slot.");
  try {
    endOfIndiaDate(input.date);
  } catch {
    throw new BookingError("Choose a valid date.");
  }
  if (Date.parse(`${input.date}T${input.time}:00+05:30`) <= now)
    throw new BookingError("Choose a future slot.");
  if (
    typeof input.buyer !== "string" ||
    !input.buyer.trim() ||
    input.buyer.length > 80 ||
    typeof input.needs !== "string" ||
    input.needs.length > 1000
  )
    throw new BookingError(
      "Check your name and preferences (up to 1,000 characters).",
    );
}
