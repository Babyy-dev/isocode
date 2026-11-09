import "server-only";
import { AiError } from "./types";
import { assistanceInstructions, redactContactDetails } from "./prompt";
import { extractResponseText, parseAssistance } from "./output";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 20_000;

export function aiConfiguration() {
  const key = process.env.GROQ_API_KEY?.trim();
  const model = process.env.GROQ_MODEL?.trim();
  if (!key || !model)
    throw new AiError(
      "AI is not configured. Ask the operator to set GROQ_API_KEY and GROQ_MODEL. Manual replies remain available.",
    );
  return { key, model };
}

/** One Groq call: no automatic retries, bounded output, then strict validation. */
export async function generateAssistance(needs: string, modelName: string, language: "en" | "hi") {
  const { key, model } = aiConfiguration();
  const response = await callGroq(key, requestBody(model, needs, modelName, language));
  if (!response.ok) throw errorForStatus(response.status);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new AiError("AI returned an unreadable response. Please try again.");
  }
  return { ...parseAssistance(extractResponseText(body)), model };
}

function requestBody(model: string, needs: string, carModel: string, preferredLanguage: "en" | "hi") {
  return {
    model,
    messages: [
      { role: "system", content: assistanceInstructions },
      {
        role: "user",
        // Buyer text is passed as data, never concatenated into the instructions.
        content: JSON.stringify({ buyerNeeds: redactContactDetails(needs), carModel, preferredLanguage }),
      },
    ],
    // JSON mode works on every Groq chat model; parseAssistance enforces the exact shape.
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_completion_tokens: 1400,
  };
}

async function callGroq(key: string, body: object) {
  try {
    return await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new AiError("AI request timed out or could not connect. Try again or write a manual reply.");
  }
}

function errorForStatus(status: number) {
  if (status === 429)
    return new AiError("AI provider rate limit or quota reached. Try again shortly or write a manual reply.");
  if (status === 401 || status === 403)
    return new AiError("AI key was rejected. Ask the operator to check GROQ_API_KEY.");
  if (status === 404)
    return new AiError("AI model not found. Ask the operator to check GROQ_MODEL.");
  if (status === 400)
    return new AiError("AI could not produce a valid draft for this lead. Try again or write a manual reply.");
  if (status === 498 || status === 503)
    return new AiError("AI provider is over capacity right now. Try again shortly or write a manual reply.");
  return new AiError("AI provider could not process this request. Manual replies remain available.");
}
