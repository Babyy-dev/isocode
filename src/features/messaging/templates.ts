import type { Language } from "@/lib/i18n/language";
import { ACKNOWLEDGEMENT_TEMPLATE, type LeadMessage } from "./types";

export type AcknowledgementFields = {
  buyer: string;
  carName: string;
  showroom: string;
  /** Slot date as YYYY-MM-DD. */
  date: string;
  time: string;
  consultant: string;
};

/**
 * Fixed-wording templates, like pre-approved WhatsApp Business templates (one per language).
 * They name the consultant (the brief's "named consultant" promise) and never quote prices.
 */
export function acknowledgementBody(fields: AcknowledgementFields, language: Language = "en") {
  const firstName = fields.buyer.trim().split(/\s+/)[0] || (language === "hi" ? "जी" : "there");
  const date = formatSlotDate(fields.date, language);
  if (language === "hi")
    return (
      `नमस्ते ${firstName}, ${fields.showroom} में ${fields.carName} की आपकी टेस्ट ड्राइव ` +
      `${date} को ${fields.time} बजे पक्की हो गई है। ${fields.consultant} आपके सलाहकार हैं ` +
      `और जल्द ही आपको कॉल करेंगे। संदेश बंद करने के लिए STOP लिखें।`
    );
  return (
    `Hello ${firstName}, your test drive of the ${fields.carName} at ${fields.showroom} ` +
    `on ${date} at ${fields.time} is confirmed. ${fields.consultant} is your consultant ` +
    `and will call you shortly. Reply STOP to opt out.`
  );
}

export function acknowledgementMessage(
  fields: AcknowledgementFields,
  sentAt: number,
  language: Language = "en",
): LeadMessage {
  return {
    kind: "acknowledgement",
    channel: "WhatsApp",
    template: `${ACKNOWLEDGEMENT_TEMPLATE}_${language}`,
    body: acknowledgementBody(fields, language),
    status: "simulated",
    sentAt,
    sentBy: "system",
  };
}

export function replyMessage(body: string, consultant: string, sentAt: number): LeadMessage {
  return {
    kind: "reply",
    channel: "WhatsApp",
    template: null,
    body: body.trim(),
    status: "simulated",
    sentAt,
    sentBy: consultant,
  };
}

function formatSlotDate(isoDate: string, language: Language) {
  return new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
