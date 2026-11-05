import "server-only";
import { AiError } from "./types";
import {
  assistanceInstructions,
  assistanceSchema,
  redactContactDetails,
} from "./prompt";
import { extractResponseText, parseAssistance } from "./output";

export function aiConfiguration() {
  const key = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim();
  if (!key || !model)
    throw new AiError(
      "AI is not configured. Ask the operator to set OPENAI_API_KEY and OPENAI_MODEL. Manual replies remain available.",
    );
  return { key, model };
}

export async function generateAssistance(
  needs: string,
  modelName: string,
  language: "en" | "hi",
) {
  const { key, model } = aiConfiguration();
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 1400,
        instructions: assistanceInstructions,
        input: JSON.stringify({
          buyerNeeds: redactContactDetails(needs),
          carModel: modelName,
          preferredLanguage: language,
        }),
        text: {
          format: {
            type: "json_schema",
            name: "buyer_assistance",
            strict: true,
            schema: assistanceSchema,
          },
        },
      }),
    });
  } catch {
    throw new AiError(
      "AI request timed out or could not connect. Try again or write a manual reply.",
    );
  }
  if (!response.ok) {
    if (response.status === 429)
      throw new AiError(
        "AI provider capacity or quota is unavailable. Try later or write a manual reply.",
      );
    if (response.status === 401 || response.status === 403)
      throw new AiError(
        "AI credentials or model access need attention. Ask the operator to check the configuration.",
      );
    throw new AiError(
      "AI provider could not process this request. Manual replies remain available.",
    );
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new AiError("AI returned an unreadable response. Please try again.");
  }
  return { ...parseAssistance(extractResponseText(body)), model };
}
