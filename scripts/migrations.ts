import type { Db } from "mongodb";
import type { BookingDocument } from "../src/features/bookings/types";
import { ACKNOWLEDGEMENT_TEMPLATE, type LeadMessage } from "../src/features/messaging/types";

/** Idempotent data migrations; each one only touches records still in the old shape. */
export async function runMigrations(database: Db) {
  const messages = await migrateLegacyMessages(database);
  const cars = await dropFreeTextInspections(database);
  return { messages, cars };
}

/** Bookings used to store messages as plain strings such as "Simulated reply: …". */
async function migrateLegacyMessages(database: Db) {
  const bookings = database.collection<BookingDocument>("bookings");
  const legacy = await bookings.find({ messages: { $type: "string" } }).toArray();
  for (const booking of legacy) {
    const raw = booking.messages as unknown[];
    const messages = raw.map((item) =>
      typeof item === "string" ? fromLegacyText(item, booking) : (item as LeadMessage),
    );
    await bookings.updateOne({ _id: booking._id }, { $set: { messages } });
  }
  return legacy.length;
}

function fromLegacyText(text: string, booking: BookingDocument): LeadMessage {
  const isReply = text.startsWith("Simulated reply:");
  return {
    kind: isReply ? "reply" : "acknowledgement",
    channel: "WhatsApp",
    template: isReply ? null : ACKNOWLEDGEMENT_TEMPLATE,
    body: text.replace(/^Simulated (reply|acknowledgement):\s*/, ""),
    status: "simulated",
    // The original send time was not stored; the booking time is the closest known value.
    sentAt: booking.createdAt,
    sentBy: isReply ? booking.consultant : "system",
  };
}

/** The free-text inspectionReport field was replaced by the structured `inspection` checklist. */
async function dropFreeTextInspections(database: Db) {
  const result = await database
    .collection("cars")
    .updateMany({ inspectionReport: { $exists: true } }, { $unset: { inspectionReport: "" } });
  return result.modifiedCount;
}
