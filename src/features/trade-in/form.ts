import type { TradeIn } from "./types";

export const tradeInFieldName = {
  offered: "tradeIn",
  model: "tradeIn-model",
  year: "tradeIn-year",
  kilometres: "tradeIn-kilometres",
  owners: "tradeIn-owners",
} as const;

/** Reads the optional trade-in section; the server validates the values. */
export function readTradeInForm(form: FormData): TradeIn | null {
  if (form.get(tradeInFieldName.offered) !== "on") return null;
  const read = (name: string) => String(form.get(name) ?? "").trim();
  return {
    model: read(tradeInFieldName.model),
    year: Number(read(tradeInFieldName.year)),
    kilometres: Number(read(tradeInFieldName.kilometres)),
    owners: Number(read(tradeInFieldName.owners)),
  };
}
