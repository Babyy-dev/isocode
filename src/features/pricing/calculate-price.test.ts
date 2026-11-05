import assert from "node:assert/strict";
import test from "node:test";
import { calculateOnRoadPrice, createPriceQuote } from "./calculate-price";
import type { PriceVersion } from "./types";

// Test fixture only. These charges are not dealership seed data.
const price: PriceVersion = {
  id: "test-price",
  version: 1,
  basePricePaise: 124500000,
  roadTaxPaise: 10000000,
  insurancePaise: 5000000,
  accessoriesPaise: 100001,
  validFrom: new Date("2026-01-01T00:00:00Z"),
  validUntil: new Date("2026-02-01T00:00:00Z"),
};

test("adds admin components exactly, including paise", () => {
  assert.equal(calculateOnRoadPrice(price), 139600001);
});

test("accepts zero charges without inventing defaults", () => {
  assert.equal(calculateOnRoadPrice({
    basePricePaise: 124500000,
    roadTaxPaise: 0,
    insurancePaise: 0,
    accessoriesPaise: 0,
  }), 124500000);
});

test("rejects negative, fractional and non-finite components", () => {
  for (const roadTaxPaise of [-1, 0.5, NaN, Infinity]) {
    assert.throws(() => calculateOnRoadPrice({ ...price, roadTaxPaise }));
  }
});

test("rejects totals beyond safe integer precision", () => {
  assert.throws(() => calculateOnRoadPrice({
    ...price,
    basePricePaise: Number.MAX_SAFE_INTEGER,
  }));
});

test("missing city prices remain unavailable", () => {
  assert.deepEqual(createPriceQuote(null, price.validFrom), { status: "unavailable" });
});

test("validity includes its start and excludes its end", () => {
  const quote = createPriceQuote(price, price.validFrom);
  assert.equal(quote.status, "available");
  assert.deepEqual(createPriceQuote(price, price.validUntil), { status: "expired" });
});

test("future prices are not presented as current quotes", () => {
  assert.deepEqual(createPriceQuote(price, new Date("2025-12-31T23:59:59Z")), {
    status: "upcoming",
  });
});

test("rejects invalid dates and reversed validity windows", () => {
  assert.throws(() => createPriceQuote(price, new Date("invalid")));
  assert.throws(() => createPriceQuote({ ...price, validUntil: price.validFrom }, price.validFrom));
});
