/** Inputs the buyer can adjust; the calculator UI stays inside these limits. */
export const emiLimits = {
  rate: { min: 6, max: 18, step: 0.25, default: 9.5 },
  tenureMonths: { options: [12, 24, 36, 48, 60, 72, 84], default: 60 },
  downPaymentShare: { default: 0.2 },
} as const;

export type EmiInput = {
  /** Amount financed, in whole rupees. */
  principal: number;
  annualRatePercent: number;
  months: number;
};

export type EmiResult = {
  monthly: number;
  totalInterest: number;
  totalPayable: number;
};

export class EmiInputError extends Error {}

/** Standard reducing-balance EMI: P·r·(1+r)^n / ((1+r)^n − 1), rounded to the rupee. */
export function calculateEmi({ principal, annualRatePercent, months }: EmiInput): EmiResult {
  if (!Number.isFinite(principal) || principal < 0)
    throw new EmiInputError("Loan amount must be zero or more.");
  if (!Number.isInteger(months) || months < 1 || months > 120)
    throw new EmiInputError("Tenure must be 1 to 120 months.");
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0 || annualRatePercent > 50)
    throw new EmiInputError("Interest rate must be between 0% and 50%.");
  const rate = annualRatePercent / 100 / 12;
  const exact =
    rate === 0
      ? principal / months
      : (principal * rate * (1 + rate) ** months) / ((1 + rate) ** months - 1);
  const monthly = Math.round(exact);
  const totalPayable = Math.round(exact * months);
  return { monthly, totalPayable, totalInterest: totalPayable - Math.round(principal) };
}

/** Down payment clamped to the price, so the loan amount is never negative. */
export function loanAmount(onRoadPrice: number, downPayment: number) {
  return Math.max(0, onRoadPrice - Math.min(Math.max(0, downPayment), onRoadPrice));
}
