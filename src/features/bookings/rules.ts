import type { BookingDocument, BookingInput } from "./types";
import { bookingTradeIn } from "./validation";

export function matchesRequest(booking: BookingDocument, input: BookingInput) {
  return (
    (booking.aiConsent === true) === (input.aiConsent === true) &&
    booking.carId === input.carId &&
    booking.price.cityId === input.cityId &&
    booking.price.version === input.priceVersion &&
    booking.showroom === input.showroom &&
    booking.date === input.date &&
    booking.time === input.time &&
    booking.buyer === input.buyer.trim() &&
    booking.needs === input.needs.trim() &&
    JSON.stringify(booking.tradeIn ?? null) === JSON.stringify(bookingTradeIn(input))
  );
}
