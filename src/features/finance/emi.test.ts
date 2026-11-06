import assert from "node:assert/strict";
import test from "node:test";
import { calculateEmi, loanAmount } from "./emi";

test("EMI matches the reducing-balance formula", () => {
  // ₹10 lakh at 9.5% for 5 years: ₹21,002 a month, ₹2,60,112 interest.
  const result = calculateEmi({ principal: 1_000_000, annualRatePercent: 9.5, months: 60 });
  assert.equal(result.monthly, 21_002);
  assert.equal(result.totalInterest, 260_112);
  assert.equal(result.totalPayable, 1_260_112);
});

test("zero interest splits the loan evenly and zero loan costs nothing", () => {
  assert.equal(calculateEmi({ principal: 120_000, annualRatePercent: 0, months: 12 }).monthly, 10_000);
  assert.deepEqual(calculateEmi({ principal: 0, annualRatePercent: 9.5, months: 60 }), {
    monthly: 0,
    totalPayable: 0,
    totalInterest: 0,
  });
});

test("invalid inputs are rejected rather than producing NaN", () => {
  assert.throws(() => calculateEmi({ principal: -1, annualRatePercent: 9.5, months: 60 }));
  assert.throws(() => calculateEmi({ principal: 100, annualRatePercent: 9.5, months: 0 }));
  assert.throws(() => calculateEmi({ principal: 100, annualRatePercent: Number.NaN, months: 12 }));
});

test("down payment is clamped between zero and the price", () => {
  assert.equal(loanAmount(1_378_000, 275_600), 1_102_400);
  assert.equal(loanAmount(1_378_000, 2_000_000), 0);
  assert.equal(loanAmount(1_378_000, -5), 1_378_000);
});
