"use server";

import { revalidatePath } from "next/cache";
import { requireLeadActor } from "@/features/leads/repository";
import { leadScope } from "@/features/leads/access";
import { getDatabase } from "@/lib/database";
import { consumeFixedWindow, RateLimitError } from "@/lib/rate-limit";
import type { BookingDocument } from "@/features/bookings/types";
import type { CarDocument } from "@/lib/mongodb/documents";
import { generateAssistance, aiConfiguration } from "./provider";
import { AiError } from "./types";

export async function generateBuyerAssistance(
  id: string,
  language: "en" | "hi",
) {
  const actor = await requireLeadActor();
  if (
    typeof id !== "string" ||
    !/^[a-f0-9-]{36}$/.test(id) ||
    !["en", "hi"].includes(language)
  )
    return { error: "Invalid AI request." };
  if (actor.role !== "admin" && !actor.profile)
    return { error: "Your consultant profile is not linked." };
  try {
    aiConfiguration();
    const database = await getDatabase();
    const bookings = database.collection<BookingDocument>("bookings");
    const filter = {
      _id: id,
      ...leadScope(actor),
      aiConsent: true,
      optedOut: false,
      status: "Confirmed" as const,
    };
    const lead = await bookings.findOne(filter);
    if (!lead)
      return {
        error:
          "Lead unavailable, reassigned, cancelled, or AI consent is missing. Manual review remains available.",
      };
    await consumeFixedWindow("aiRateLimits", actor.userId, 5, 600000);
    const car = await database
      .collection<CarDocument>("cars")
      .findOne({ stockId: lead.carId });
    const generated = await generateAssistance(
      lead.needs,
      car?.model ?? "Requested car",
      language,
    );
    const ai = {
      ...generated,
      generatedAt: Date.now(),
      generatedBy: actor.userId,
      summaryReviewedAt: null,
    };
    const result = await bookings.updateOne(
      {
        ...filter,
        ...(lead.ai
          ? {
              "ai.generatedAt": lead.ai.generatedAt,
              "ai.summaryReviewedAt": lead.ai.summaryReviewedAt,
            }
          : { ai: { $exists: false } }),
      },
      { $set: { ai } },
    );
    if (!result.matchedCount)
      return {
        error:
          "Consent or lead assignment changed. Generated output was discarded.",
      };
    revalidatePath("/leads");
    return { error: null, ai };
  } catch (error) {
    if (error instanceof RateLimitError)
      return {
        error: `AI limit reached. Try again in ${error.retryAfter} seconds.`,
      };
    return {
      error:
        error instanceof AiError
          ? error.message
          : "AI is temporarily unavailable. Write a manual reply.",
    };
  }
}

export async function saveReviewedSummary(
  id: string,
  summary: string,
  generatedAt: number,
) {
  const actor = await requireLeadActor();
  if (
    !Number.isSafeInteger(generatedAt) ||
    generatedAt < 1 ||
    typeof id !== "string" ||
    !/^[a-f0-9-]{36}$/.test(id) ||
    typeof summary !== "string" ||
    !summary.trim() ||
    summary.length > 1200
  )
    return { error: "Enter a summary of 1–1,200 characters." };
  if (actor.role !== "admin" && !actor.profile)
    return { error: "Your consultant profile is not linked." };
  try {
    const database = await getDatabase();
    const result = await database
      .collection<BookingDocument>("bookings")
      .updateOne(
        {
          _id: id,
          ...leadScope(actor),
          "ai.generatedAt": generatedAt,
          aiConsent: true,
          optedOut: false,
        },
        {
          $set: {
            "ai.summary": summary.trim(),
            "ai.summaryReviewedAt": Date.now(),
          },
        },
      );
    if (!result.matchedCount)
      return { error: "Summary is no longer available for review." };
    revalidatePath("/leads");
    return { error: null };
  } catch {
    return { error: "Unable to save this summary. Please try again." };
  }
}
