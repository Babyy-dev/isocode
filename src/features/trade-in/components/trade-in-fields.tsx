"use client";

import { useState } from "react";
import type { Language } from "@/lib/i18n/language";
import { tradeInCopy } from "../copy";
import { tradeInFieldName as field } from "../form";
import { tradeInLimits } from "../types";

/** Optional booking section; fields appear (and become required) only when ticked. */
export function TradeInFields({ language }: { language: Language }) {
  const copy = tradeInCopy[language];
  const [offered, setOffered] = useState(false);
  return (
    <fieldset className="border border-line p-4">
      <label className="flex gap-3 text-sm leading-6">
        <input
          className="mt-1"
          type="checkbox"
          name={field.offered}
          checked={offered}
          onChange={(event) => setOffered(event.target.checked)}
        />
        <span>
          {copy.toggle}
          <span className="block text-xs text-muted">{copy.hint}</span>
        </span>
      </label>
      {offered && (
        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <label className="field-label">
            {copy.model}
            <input
              className="field"
              name={field.model}
              required
              maxLength={tradeInLimits.modelMaxLength}
              placeholder={copy.modelPlaceholder}
            />
          </label>
          <NumberField label={copy.year} name={field.year} min={tradeInLimits.oldestYear} max={new Date().getFullYear()} />
          <NumberField label={copy.kilometres} name={field.kilometres} min={0} max={tradeInLimits.maxKilometres} />
          <NumberField label={copy.owners} name={field.owners} min={1} max={tradeInLimits.maxOwners} />
        </div>
      )}
    </fieldset>
  );
}

function NumberField({ label, name, min, max }: { label: string; name: string; min: number; max: number }) {
  return (
    <label className="field-label">
      {label}
      <input className="field" name={name} type="number" inputMode="numeric" required min={min} max={max} step={1} />
    </label>
  );
}
