/** The buyer's current car, offered in part-exchange. Valued later by the used-car team. */
export type TradeIn = {
  model: string;
  year: number;
  kilometres: number;
  owners: number;
};

export const tradeInLimits = {
  modelMaxLength: 60,
  oldestYear: 1995,
  maxKilometres: 500_000,
  maxOwners: 9,
} as const;
