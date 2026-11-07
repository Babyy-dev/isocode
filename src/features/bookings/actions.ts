"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/features/auth/session";
import { updateOwnedBooking } from "./mutations";
import { createBooking } from "./create-booking";
import { BookingError } from "./validation";
import { consumeBookingAttempt } from "./rate-limit";
import type { BookingInput } from "./types";
import { bookingErrorText } from "./copy";
import { requestLanguage } from "@/lib/i18n/request-language";
import type { Language } from "@/lib/i18n/language";
import { isUuid } from "@/lib/ids";

export async function bookTestDrive(input: BookingInput) {
  const session = await requireSession("/book");
  const language = await requestLanguage();
  try {
    await consumeBookingAttempt(session.user.id);
    const id = await createBooking(input, session.user, language);
    refreshBookings();
    return { id, error: null };
  } catch (error) {
    return { id: null, error: errorText(error, language) };
  }
}

export async function updateBuyerBooking(
  id: string,
  action: "cancel" | "opt-out" | "opt-in" | "ai-opt-in" | "ai-opt-out",
) {
  const session = await requireSession("/bookings");
  const language = await requestLanguage();
  if (
    !isUuid(id) ||
    !["cancel", "opt-out", "opt-in", "ai-opt-in", "ai-opt-out"].includes(action)
  )
    return { error: bookingErrorText("invalidRequest", language) };
  try {
    const matched = await updateOwnedBooking(session.user.id, id, action);
    if (!matched) return { error: bookingErrorText("notFound", language) };
    refreshBookings();
    return { error: null };
  } catch {
    return { error: bookingErrorText("updateFailed", language) };
  }
}

function errorText(error: unknown, language: Language) {
  return error instanceof BookingError
    ? bookingErrorText(error.code, language, error.params)
    : bookingErrorText("unexpected", language);
}

function refreshBookings() {
  revalidatePath("/book");
  revalidatePath("/bookings");
  revalidatePath("/leads");
}
