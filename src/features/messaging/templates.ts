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
 * Fixed-wording template, like a pre-approved WhatsApp Business template.
 * It names the consultant (the brief's "named consultant" promise) and never quotes prices.
 */
export function acknowledgementBody(fields: AcknowledgementFields) {
  const firstName = fields.buyer.trim().split(/\s+/)[0] || "there";
  return (
    `Hello ${firstName}, your test drive of the ${fields.carName} at ${fields.showroom} ` +
    `on ${formatSlotDate(fields.date)} at ${fields.time} is confirmed. ${fields.consultant} is your consultant ` +
    `and will call you shortly. Reply STOP to opt out.`
  );
}

export function acknowledgementMessage(fields: AcknowledgementFields, sentAt: number): LeadMessage {
  return {
    kind: "acknowledgement",
    channel: "WhatsApp",
    template: ACKNOWLEDGEMENT_TEMPLATE,
    body: acknowledgementBody(fields),
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

function formatSlotDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
