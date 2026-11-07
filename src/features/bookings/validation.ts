import { demoShowrooms, demoTimes } from "@/features/demo/data";
import { endOfIndiaDate } from "@/features/pricing/validate-price";
import type { BookingInput } from "./types";
import type { BookingErrorCode } from "./copy";
import { validateTradeIn } from "@/features/trade-in/validate-trade-in";
import { isUuid } from "@/lib/ids";

/** Carries a message key; the action translates it into the visitor's language. */
export class BookingError extends Error {
  constructor(
    readonly code: BookingErrorCode,
    readonly params: Record<string, string | number> = {},
  ) {
    super(code);
  }
}

export function validateBooking(input: BookingInput, now = Date.now()) {
  if (!input || typeof input !== "object")
    throw new BookingError("invalid");
  if (input.aiConsent !== undefined && typeof input.aiConsent !== "boolean")
    throw new BookingError("aiConsentChoice");
  if (input.consent !== true)
    throw new BookingError("consentRequired");
  if (!isUuid(input.requestId)) throw new BookingError("reload");
  if (
    typeof input.carId !== "string" ||
    !/^[\w-]{1,80}$/.test(input.carId) ||
    typeof input.cityId !== "string" ||
    !/^[a-z-]{1,80}$/.test(input.cityId)
  )
    throw new BookingError("carAndCity");
  if (!Number.isSafeInteger(input.priceVersion) || input.priceVersion < 1)
    throw new BookingError("priceRequired");
  if (
    !demoShowrooms.includes(input.showroom) ||
    !demoTimes.includes(input.time)
  )
    throw new BookingError("showroomSlot");
  try {
    endOfIndiaDate(input.date);
  } catch {
    throw new BookingError("validDate");
  }
  if (Date.parse(`${input.date}T${input.time}:00+05:30`) <= now)
    throw new BookingError("futureSlot");
  if (
    typeof input.buyer !== "string" ||
    !input.buyer.trim() ||
    input.buyer.length > 80 ||
    typeof input.needs !== "string" ||
    input.needs.length > 1000
  )
    throw new BookingError("nameNeeds");
  bookingTradeIn(input);
}

/** The validated trade-in for this booking, or null when none was offered. */
export function bookingTradeIn(input: BookingInput) {
  try {
    return validateTradeIn(input.tradeIn);
  } catch {
    throw new BookingError("tradeIn");
  }
}
