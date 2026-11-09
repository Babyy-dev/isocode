import { AiError, type BuyerAssistance } from "./types";

export function draftHasCommercialClaim(draft: string): boolean {
  return /₹|\b(?:INR|Rs\.?|rupees?|lakhs?|crores?|discounts?|cashback|rebates?|complimentary)\b|\d[\d,.]*\s*%|छूट|रुपये|रुपया|लाख|करोड़/i.test(
    draft,
  );
}

export function parseAssistance(text: string): BuyerAssistance {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new AiError(
      "AI returned an invalid response. Write a manual reply or try again.",
    );
  }
  if (!value || typeof value !== "object")
    throw new AiError("AI response is incomplete.");
  const result = value as Record<string, unknown>;
  if (
    typeof result.summary !== "string" ||
    !result.summary.trim() ||
    result.summary.length > 1200 ||
    typeof result.draft !== "string" ||
    !result.draft.trim() ||
    result.draft.length > 2000 ||
    !Array.isArray(result.uncertainties) ||
    result.uncertainties.length > 6 ||
    result.uncertainties.some(
      (item) => typeof item !== "string" || item.length > 300,
    )
  )
    throw new AiError(
      "AI response failed validation. Write a manual reply or try again.",
    );
  if (draftHasCommercialClaim(result.draft))
    throw new AiError(
      "AI draft included pricing or discount language and was blocked. Write a manual reply.",
    );
  return {
    summary: result.summary.trim(),
    draft: result.draft.trim(),
    uncertainties: result.uncertainties as string[],
  };
}

type ChatCompletion = {
  choices?: { finish_reason?: string; message?: { content?: string | null; refusal?: string | null } }[];
};

/** Pulls the JSON text out of an OpenAI-compatible (Groq) chat completion, or explains why there is none. */
export function extractResponseText(body: unknown): string {
  if (!body || typeof body !== "object") throw new AiError("AI returned an invalid response.");
  const choice = (body as ChatCompletion).choices?.[0];
  if (!choice) throw new AiError("AI returned no answer. Try again or write a manual reply.");
  if (choice.message?.refusal || choice.finish_reason === "content_filter")
    throw new AiError("AI declined this request. Review the original needs and write a manual reply.");
  if (choice.finish_reason !== "stop")
    throw new AiError("AI could not finish this request. Try again or write a manual reply.");
  const text = choice.message?.content ?? "";
  if (!text || text.length > 12000) throw new AiError("AI response was empty or too long.");
  return text;
}
