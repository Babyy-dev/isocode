"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/features/auth/session";
import { saveCarRecord, archiveCarRecord } from "./car-repository";
import { CarInputError, type CarInput } from "./car-validation";

export async function saveCar(input: CarInput, create: boolean) {
  const session = await requireRole("/admin", ["admin"]);
  if (typeof create !== "boolean") return { error: "Invalid request." };
  try {
    await saveCarRecord(input, create, session.user.id);
    revalidatePath("/", "layout");
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof CarInputError
          ? error.message
          : "Unable to save this car. Please try again.",
    };
  }
}

export async function archiveCar(
  stockId: string,
  archived: boolean,
  version: number,
) {
  await requireRole("/admin", ["admin"]);
  if (
    typeof stockId !== "string" ||
    !/^[A-Z0-9-]{1,40}$/.test(stockId) ||
    typeof archived !== "boolean" ||
    !Number.isSafeInteger(version) ||
    version < 0
  )
    return { error: "Invalid archive request." };
  try {
    await archiveCarRecord(stockId, archived, version);
    revalidatePath("/", "layout");
    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof CarInputError
          ? error.message
          : "Unable to change publication status.",
    };
  }
}
