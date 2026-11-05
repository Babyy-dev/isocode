import "server-only";
import { getDatabase } from "@/lib/database";
import type { BookingDocument } from "@/features/bookings/types";
import { buildLeadUpdate, type LeadChange } from "./update-rules";
import { leadScope, type LeadActor } from "./access";

export async function updateLead(
  actor: LeadActor,
  id: string,
  change: LeadChange,
) {
  const database = await getDatabase();
  const collection = database.collection<BookingDocument>("bookings");
  const filter = { _id: id, ...leadScope(actor) };
  const lead = await collection.findOne(filter);
  if (!lead) return { error: "Lead not found or no longer assigned to you." };
  const update = buildLeadUpdate(change, lead);
  if (typeof update === "string") return { error: update };
  const result = await collection.updateOne(
    {
      ...filter,
      ...(change.kind === "reply" ? { optedOut: false } : {}),
      ...(change.kind === "contact" ? { contactedAt: null } : {}),
    },
    update,
  );
  if (!result.matchedCount)
    return {
      error:
        "Lead changed or buyer opted out. Refresh and review before retrying.",
    };
  return { error: null };
}
