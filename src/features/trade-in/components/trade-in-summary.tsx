import type { Language } from "@/lib/i18n/language";
import { tradeInCopy } from "../copy";
import type { TradeIn } from "../types";

export function TradeInSummary({ tradeIn, language = "en" }: { tradeIn: TradeIn | null; language?: Language }) {
  if (!tradeIn) return null;
  const copy = tradeInCopy[language];
  return (
    <p className="mt-3 text-sm">
      <span className="font-medium">{copy.title}:</span> {copy.summary(tradeIn)}
    </p>
  );
}
