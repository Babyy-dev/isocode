"use client";

import { useState } from "react";
import { formatPrice } from "@/features/cars/presentation";
import type { Language } from "@/lib/i18n/language";
import { financeCopy } from "../copy";
import { calculateEmi, emiLimits, loanAmount } from "../emi";

const DOWN_PAYMENT_STEP = 10_000;

/** Remount with `key={onRoadPrice}` so the defaults follow a city change. */
export function EmiCalculator({ onRoadPrice, language }: { onRoadPrice: number; language: Language }) {
  const copy = financeCopy[language];
  const [downPayment, setDownPayment] = useState(() =>
    roundTo(onRoadPrice * emiLimits.downPaymentShare.default, DOWN_PAYMENT_STEP),
  );
  const [rate, setRate] = useState<number>(emiLimits.rate.default);
  const [months, setMonths] = useState<number>(emiLimits.tenureMonths.default);
  const principal = loanAmount(onRoadPrice, downPayment);
  const emi = calculateEmi({ principal, annualRatePercent: rate, months });

  return (
    <details className="group mt-6 border-t border-line pt-5">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium text-accent">
        {copy.toggle}
        <span aria-hidden className="transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-4 space-y-5 text-sm">
        <Slider
          label={copy.downPayment}
          value={downPayment}
          display={formatPrice(Math.min(downPayment, onRoadPrice))}
          min={0}
          max={roundTo(onRoadPrice, DOWN_PAYMENT_STEP)}
          step={DOWN_PAYMENT_STEP}
          onChange={setDownPayment}
        />
        <Slider
          label={copy.rate}
          value={rate}
          display={`${rate.toFixed(2)}%`}
          min={emiLimits.rate.min}
          max={emiLimits.rate.max}
          step={emiLimits.rate.step}
          onChange={setRate}
        />
        <label className="field-label">
          {copy.tenure}
          <select className="field" value={months} onChange={(event) => setMonths(Number(event.target.value))}>
            {emiLimits.tenureMonths.options.map((option) => (
              <option key={option} value={option}>
                {copy.years(option / 12)}
              </option>
            ))}
          </select>
        </label>
        <div className="bg-surface p-5" aria-live="polite">
          <p className="text-xs text-muted">{copy.monthly}</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatPrice(emi.monthly)}
            <span className="text-sm font-normal text-muted">{copy.perMonth}</span>
          </p>
          <dl className="mt-3 space-y-1 text-xs text-muted">
            <div className="flex justify-between">
              <dt>{copy.loan}</dt>
              <dd>{formatPrice(principal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{copy.interest}</dt>
              <dd>{formatPrice(emi.totalInterest)}</dd>
            </div>
          </dl>
        </div>
        <p className="text-xs leading-5 text-muted">{copy.note}</p>
      </div>
    </details>
  );
}

type SliderProps = {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function Slider({ label, value, display, min, max, step, onChange }: SliderProps) {
  return (
    <label className="block">
      <span className="flex justify-between gap-3">
        <span>{label}</span>
        <span className="font-medium">{display}</span>
      </span>
      <input
        type="range"
        className="mt-2 w-full accent-accent"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}
