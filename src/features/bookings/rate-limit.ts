import "server-only";
import { consumeFixedWindow, RateLimitError } from "@/lib/rate-limit";
import { BookingError } from "./validation";

export const BOOKING_WINDOW_MS = 10 * 60 * 1000;
export const BOOKING_ATTEMPTS = 5;

export async function consumeBookingAttempt(userId: string, now = Date.now()) {
  try {
    await consumeFixedWindow(
      "bookingRateLimits",
      userId,
      BOOKING_ATTEMPTS,
      BOOKING_WINDOW_MS,
      now,
    );
  } catch (error) {
    if (error instanceof RateLimitError)
      throw new BookingError(
        `Too many booking attempts. Try again in ${error.retryAfter} seconds.`,
      );
    throw error;
  }
}
