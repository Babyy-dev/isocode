/**
 * One outbound message on a lead. Delivery is simulated: nothing leaves the app,
 * but the record shows exactly what a WhatsApp/SMS provider would have been sent.
 */
export type LeadMessage = {
  kind: "acknowledgement" | "reply";
  channel: "WhatsApp" | "SMS";
  /** Approved provider template id; null for free-text consultant replies. */
  template: string | null;
  body: string;
  status: "simulated";
  sentAt: number;
  /** "system" for automatic messages, otherwise the consultant profile name. */
  sentBy: string;
};

export const ACKNOWLEDGEMENT_TEMPLATE = "test_drive_ack_v1";
