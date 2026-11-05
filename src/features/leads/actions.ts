"use server";

import { revalidatePath } from "next/cache";
import type { LeadChange } from "./update-rules";
import { updateLead } from "./mutations";
import { requireLeadActor } from "./repository";

export async function changeLead(id: string, change: LeadChange) {
  const actor = await requireLeadActor();
  if (
    typeof id !== "string" ||
    !/^[a-f0-9-]{36}$/.test(id) ||
    !change ||
    typeof change !== "object"
  )
    return { error: "Invalid request." };
  if (actor.role !== "admin" && !actor.profile)
    return { error: "Your consultant profile is not linked." };
  try {
    const result = await updateLead(actor, id, change);
    if (result.error) return result;
    revalidatePath("/leads");
    revalidatePath("/bookings");
    return { error: null };
  } catch {
    return { error: "Unable to update this lead. Please try again." };
  }
}
