import type { PriceBreakdown, PriceQuote, PriceVersion } from "./types";

export function calculateOnRoadPrice(price: PriceBreakdown): number {
  const amounts = [
    price.basePricePaise,
    price.roadTaxPaise,
    price.insurancePaise,
    price.accessoriesPaise,
  ];

  if (amounts.some((amount) => !Number.isSafeInteger(amount) || amount < 0)) {
    throw new Error("Price components must be non-negative integer paise.");
  }

  const total = amounts.reduce((sum, amount) => sum + amount, 0);

  if (!Number.isSafeInteger(total)) {
    throw new Error("The price total exceeds the supported range.");
  }

  return total;
}

export function createPriceQuote(
  price: PriceVersion | null,
  now: Date,
): PriceQuote {
  if (!price) return { status: "unavailable" };

  validatePriceDates(price, now);

  if (now < price.validFrom) return { status: "upcoming" };
  if (now >= price.validUntil) return { status: "expired" };

  return {
    status: "available",
    price,
    totalPaise: calculateOnRoadPrice(price),
  };
}

function validatePriceDates(price: PriceVersion, now: Date): void {
  const timestamps = [price.validFrom, price.validUntil, now].map(Number);

  if (timestamps.some((timestamp) => !Number.isFinite(timestamp))) {
    throw new Error("Price validity requires valid dates.");
  }

  if (price.validUntil <= price.validFrom) {
    throw new Error("Price validity must end after it starts.");
  }
}
