import { tradeInLimits, type TradeIn } from "./types";

export class TradeInError extends Error {}

/** Returns a clean trade-in, `null` when none was offered, or throws when it is incomplete. */
export function validateTradeIn(value: unknown, now = new Date()): TradeIn | null {
  if (value == null) return null;
  if (typeof value !== "object") throw new TradeInError();
  const input = value as Partial<TradeIn>;
  const model = typeof input.model === "string" ? input.model.trim() : "";
  if (!model || model.length > tradeInLimits.modelMaxLength) throw new TradeInError();
  return {
    model,
    year: wholeNumber(input.year, tradeInLimits.oldestYear, now.getFullYear()),
    kilometres: wholeNumber(input.kilometres, 0, tradeInLimits.maxKilometres),
    owners: wholeNumber(input.owners, 1, tradeInLimits.maxOwners),
  };
}

function wholeNumber(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max)
    throw new TradeInError();
  return value;
}
