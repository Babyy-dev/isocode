import "server-only";
import { requireRole } from "@/features/auth/session";
import { getDatabase } from "@/lib/database";
import { bookingView, carNamesFor } from "@/features/bookings/queries";
import type { BookingDocument } from "@/features/bookings/types";
import { leadScope, type LeadActor } from "./access";

export type ConsultantLink = { _id: string; profile: string; updatedAt: Date };

export async function requireLeadActor(): Promise<LeadActor> {
  const session = await requireRole("/leads", ["admin", "consultant"]);
  const database = await getDatabase();
  const link = await database
    .collection<ConsultantLink>("consultantLinks")
    .findOne({ _id: session.user.id });
  return {
    userId: session.user.id,
    role: session.user.role === "admin" ? "admin" : "consultant",
    profile: link?.profile ?? null,
  };
}

export async function listLeads(actor: LeadActor) {
  const database = await getDatabase();
  const records = await database
    .collection<BookingDocument>("bookings")
    .find(leadScope(actor))
    .sort({ createdAt: -1 })
    .toArray();
  // The read time seeds the inbox's live response timers.
  const names = await carNamesFor(records);
  return {
    leads: records.map((record) => bookingView(record, names, true)),
    fetchedAt: Date.now(),
  };
}
