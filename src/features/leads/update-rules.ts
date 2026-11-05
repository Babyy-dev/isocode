import { draftHasCommercialClaim } from "@/features/ai/output";
import type { BookingDocument } from "@/features/bookings/types";
import { demoConsultants } from "@/features/demo/data";
import { replyMessage } from "@/features/messaging/templates";

export type LeadChange =
  | { kind: "status"; value: string }
  | { kind: "assign"; value: string }
  | { kind: "contact" }
  | { kind: "reply"; value: string; reviewed: boolean };

export function buildLeadUpdate(
  change: LeadChange,
  lead: BookingDocument,
  now = Date.now(),
) {
  switch (change.kind) {
    case "contact":
      return {
        $set: { contactedAt: Date.now(), leadStatus: "Contacted" as const },
      };
    case "status": {
      if (!["New", "Contacted", "Won", "Lost"].includes(change.value))
        return "Invalid lead status.";
      return {
        $set: { leadStatus: change.value as BookingDocument["leadStatus"] },
      };
    }
    case "assign": {
      const eligible = demoConsultants.some(
        (person) =>
          person.name === change.value &&
          person.showroom === lead.showroom &&
          (!person.models.length || person.models.includes(lead.carId)),
      );
      if (!eligible) return "Choose an eligible consultant in this showroom.";
      return { $set: { consultant: change.value } };
    }
    case "reply": {
      if (
        change.reviewed !== true ||
        typeof change.value !== "string" ||
        !change.value.trim() ||
        change.value.length > 2000
      )
        return "Review a reply of 1–2,000 characters before sending.";
      if (draftHasCommercialClaim(change.value))
        return "Remove pricing and discount language before sending. Prices come from the admin table.";
      // Sent on behalf of the assigned consultant, who owns the conversation.
      return {
        $push: { messages: replyMessage(change.value, lead.consultant, now) },
      };
    }
    default:
      return "Invalid lead update.";
  }
}
