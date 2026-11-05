import "server-only";
import { getDatabase } from "@/lib/database";
import type { BookingDocument } from "./types";

export async function updateOwnedBooking(
  buyerId: string,
  id: string,
  action: "cancel" | "opt-out" | "opt-in" | "ai-opt-in" | "ai-opt-out",
) {
  const database = await getDatabase();
  const change =
    action === "cancel"
      ? { status: "Cancelled" as const }
      : action === "ai-opt-in" || action === "ai-opt-out"
        ? {
            aiConsent: action === "ai-opt-in",
            aiConsentAt: action === "ai-opt-in" ? Date.now() : null,
          }
        : { optedOut: action === "opt-out" };
  const result = await database
    .collection<BookingDocument>("bookings")
    .updateOne({ _id: id, buyerId }, { $set: change });
  return result.matchedCount === 1;
}
