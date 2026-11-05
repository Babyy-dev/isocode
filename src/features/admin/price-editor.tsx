"use client";

import { useState, useTransition } from "react";
import type { CityPrice } from "@/features/pricing/types";
import { savePrice } from "./actions";

const components = [
  ["basePricePaise", "Base price"],
  ["roadTaxPaise", "Road tax / transfer charge"],
  ["insurancePaise", "Insurance"],
  ["accessoriesPaise", "Included accessories"],
] as const;

export function PriceEditor({ price }: { price: CityPrice }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(form: FormData) {
    const amounts = Object.fromEntries(
      components.map(([key]) => [key, Math.round(Number(form.get(key)) * 100)]),
    );
    startTransition(async () => {
      try {
        const result = await savePrice({
          ...price,
          ...amounts,
          validThrough: String(form.get("validThrough")),
        });
        setMessage(
          result.error ?? "Price saved. Public car pages now use this version.",
        );
      } catch {
        setMessage("Unable to save. Check your connection and try again.");
      }
    });
  }

  return (
    <form action={submit} className="mt-6 space-y-5 border border-line p-6">
      <h2 className="text-xl font-medium">Price components · INR</h2>
      <p className="text-xs text-muted">
        {price.version
          ? `Saved version ${price.version}`
          : "No published price. Enter all charges before publishing."}
      </p>
      <fieldset disabled={pending} className="space-y-5">
        {components.map(([key, label]) => (
          <label className="field-label" key={key}>
            {label}
            <input
              name={key}
              className="field"
              type="number"
              required
              min="0"
              max="100000000"
              step="0.01"
              defaultValue={price[key] / 100}
            />
          </label>
        ))}
        <label className="field-label">
          Valid through (India date)
          <input
            className="field"
            name="validThrough"
            type="date"
            required
            defaultValue={price.validThrough}
          />
        </label>
        <button className="button-primary">
          {pending ? "Saving…" : "Publish price"}
        </button>
      </fieldset>
      <p role="status" className="text-sm text-accent">
        {message}
      </p>
    </form>
  );
}
