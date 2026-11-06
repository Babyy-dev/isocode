/** The client's success target: every web lead called within five minutes. */
export const RESPONSE_TARGET_MS = 5 * 60 * 1000;

export type ResponseState =
  | { kind: "waiting"; elapsedMs: number }
  | { kind: "overdue"; elapsedMs: number }
  | { kind: "met"; elapsedMs: number }
  | { kind: "missed"; elapsedMs: number };

type TimedLead = { createdAt: number; contactedAt: number | null };

export function responseState(lead: TimedLead, now: number): ResponseState {
  const end = lead.contactedAt ?? now;
  const elapsedMs = Math.max(0, end - lead.createdAt);
  const late = elapsedMs > RESPONSE_TARGET_MS;
  if (lead.contactedAt === null) return { kind: late ? "overdue" : "waiting", elapsedMs };
  return { kind: late ? "missed" : "met", elapsedMs };
}

/** "47s", "4m 05s", "2h 03m", "3d 4h": precise while it matters, compact after. */
export function formatElapsed(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`;
  if (hours < 24) return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function responseLabel(state: ResponseState) {
  const time = formatElapsed(state.elapsedMs);
  switch (state.kind) {
    case "waiting":
      return `Awaiting call · ${time} of 5m`;
    case "overdue":
      return `Overdue · waiting ${time}`;
    case "met":
      return `Called in ${time} ✓`;
    case "missed":
      return `Called in ${time} · over 5m target`;
  }
}
