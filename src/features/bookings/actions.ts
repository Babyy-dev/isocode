"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/features/auth/session";
import { updateOwnedBooking } from "./mutations";
import { createBooking } from "./create-booking";
import { BookingError } from "./validation";
import { consumeBookingAttempt } from "./rate-limit";
import type { BookingInput } from "./types";

export async function bookTestDrive(input: BookingInput) {
  const session = await requireSession("/book");
  try {
    await consumeBookingAttempt(session.user.id);
    const id = await createBooking(input, session.user.id, session.user.email);
    refreshBookings();
    return { id, error: null };
  } catch (error) {
    return {
      id: null,
      error:
        error instanceof BookingError
          ? error.message
          : "Unable to reserve this slot. Please try again.",
    };
  }
}

export async function updateBuyerBooking(
  id: string,
  action: "cancel" | "opt-out" | "opt-in" | "ai-opt-in" | "ai-opt-out",
) {
  const session = await requireSession("/bookings");
  if (
    typeof id !== "string" ||
    !/^[a-f0-9-]{36}$/.test(id) ||
    !["cancel", "opt-out", "opt-in", "ai-opt-in", "ai-opt-out"].includes(action)
  )
    return { error: "Invalid request." };
  try {
    const matched = await updateOwnedBooking(session.user.id, id, action);
    if (!matched) return { error: "Booking not found in your account." };
    refreshBookings();
    return { error: null };
  } catch {
    return { error: "Unable to update your booking. Please try again." };
  }
}

function refreshBookings() {
  revalidatePath("/book");
  revalidatePath("/bookings");
  revalidatePath("/leads");
}
