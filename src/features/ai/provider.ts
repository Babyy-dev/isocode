import "server-only";
import { AiError } from "./types";
import { assistanceInstructions, assistanceSchema, redactContactDetails } from "./prompt";
import { extractResponseText, parseAssistance } from "./output";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 20_000;

export function aiConfiguration() {
  const key = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim();
  if (!key || !model)
    throw new AiError(
      "AI is not configured. Ask the operator to set GEMINI_API_KEY and GEMINI_MODEL. Manual replies remain available.",
    );
  return { key, model };
}

/** One Gemini call: no automatic retries, bounded output, then strict validation. */
export async function generateAssistance(needs: string, modelName: string, language: "en" | "hi") {
  const { key, model } = aiConfiguration();
  const response = await callGemini(key, model, requestBody(needs, modelName, language));
  if (!response.ok) throw errorForStatus(response.status);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new AiError("AI returned an unreadable response. Please try again.");
  }
  return { ...parseAssistance(extractResponseText(body)), model };
}

function requestBody(needs: string, carModel: string, preferredLanguage: "en" | "hi") {
  return {
    systemInstruction: { parts: [{ text: assistanceInstructions }] },
    contents: [
      {
        role: "user",
        parts: [
          {
            // Buyer text is passed as data, never concatenated into the instructions.
            text: JSON.stringify({
              buyerNeeds: redactContactDetails(needs),
              carModel,
              preferredLanguage,
            }),
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: assistanceSchema,
      temperature: 0.3,
      // Generous ceiling: "thinking" models spend part of it before answering.
      maxOutputTokens: 4096,
    },
  };
}

async function callGemini(key: string, model: string, body: object) {
  try {
    return await fetch(`${GEMINI_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
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
    return new AiError("AI provider quota is used up for now. Try later or write a manual reply.");
  if (status === 402)
    return new AiError("AI provider credits are used up. Ask the operator to top up billing; manual replies remain available.");
  if (status === 400 || status === 401 || status === 403)
    return new AiError("AI key or request was rejected. Ask the operator to check GEMINI_API_KEY.");
  if (status === 404)
    return new AiError("AI model not found. Ask the operator to check GEMINI_MODEL.");
  if (status === 503)
    return new AiError("AI provider is overloaded right now. Try again shortly or write a manual reply.");
  return new AiError("AI provider could not process this request. Manual replies remain available.");
}
