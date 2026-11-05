"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/features/auth/session";
import { publishPrice, PriceConflict } from "@/features/pricing/repository";
import { validatePriceInput } from "@/features/pricing/validate-price";
import type { PriceInput } from "@/features/pricing/types";
import { getDatabase } from "@/lib/database";
import type { CarDocument } from "@/lib/mongodb/documents";

export async function savePrice(input: PriceInput) {
  const session = await requireRole("/admin", ["admin"]);
  try {
    validatePriceInput(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invalid price." };
  }
  try {
    await publishPrice(input, session.user.id);
  } catch (error) {
    return {
      error:
        error instanceof PriceConflict
          ? error.message
          : "Price could not be saved. Please try again.",
    };
  }
  revalidatePath("/", "layout");
  return { error: null };
}

export async function changeAvailability(stockId: string, previous: string) {
  await requireRole("/admin", ["admin"]);
  if (
    typeof stockId !== "string" ||
    !/^[\w-]{1,80}$/.test(stockId) ||
    (previous !== "Available" && previous !== "Booked")
  )
    return { error: "Invalid stock selection." };
  try {
    const database = await getDatabase();
    const result = await database.collection<CarDocument>("cars").updateOne(
      { stockId, status: previous },
      {
        $inc: { contentVersion: 1 },
        $set: {
          status: previous === "Available" ? "Booked" : "Available",
          updatedAt: new Date(),
        },
      },
    );
    if (!result.matchedCount)
      return { error: "Stock changed. Reload before trying again." };
  } catch {
    return { error: "Availability could not be saved. Please try again." };
  }
  revalidatePath("/", "layout");
  return { error: null };
}
