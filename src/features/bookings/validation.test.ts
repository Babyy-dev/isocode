import assert from "node:assert/strict";
import test from "node:test";
import { validateBooking } from "./validation";
import type { BookingInput } from "./types";
import type { BookingDocument } from "./types";
import { matchesRequest } from "./rules";

const input: BookingInput = {
  requestId: "00000000-0000-4000-8000-000000000001",
  carId: "NEW-H-02",
  cityId: "lucknow",
  priceVersion: 1,
  showroom: "Demo Showroom 1",
  date: "2027-01-10",
  time: "10:00",
  buyer: "Sample Buyer",
  needs: "Automatic for family use",
  consent: true,
};
const now = Date.parse("2027-01-01T00:00:00Z");

test("trade-in is optional, but an offered one must be complete", () => {
  assert.doesNotThrow(() => validateBooking({ ...input, tradeIn: null }, now));
  const tradeIn = { model: "Model A hatchback", year: 2018, kilometres: 64000, owners: 1 };
  assert.doesNotThrow(() => validateBooking({ ...input, tradeIn }, now));
  assert.throws(
    () => validateBooking({ ...input, tradeIn: { ...tradeIn, owners: 0 } }, now),
    (error: { code?: string }) => error.code === "tradeIn",
  );
});

test("retry matching cannot confirm a different slot under the same request ID", () => {
  const saved = {
    ...input,
    price: { cityId: input.cityId, version: input.priceVersion },
  } as unknown as BookingDocument;
  assert.equal(matchesRequest(saved, input), true);
  assert.equal(matchesRequest(saved, { ...input, time: "11:00" }), false);
  assert.equal(matchesRequest(saved, { ...input, priceVersion: 2 }), false);
});

test("booking requires explicit consent, a published price and listed resource", () => {
  assert.doesNotThrow(() => validateBooking(input, now));
  for (const patch of [
    { consent: false },
    { priceVersion: 0 },
    { showroom: "Unknown" },
    { time: "10:15" },
  ])
    assert.throws(() => validateBooking({ ...input, ...patch }, now));
});
test("booking validates dates and rejects a slot at or before the current instant", () => {
  assert.throws(() => validateBooking({ ...input, date: "2027-02-30" }, now));
  assert.throws(() =>
    validateBooking(input, Date.parse("2027-01-10T04:30:00Z")),
  );
  assert.doesNotThrow(() =>
    validateBooking(input, Date.parse("2027-01-10T04:29:59Z")),
  );
});
test("booking rejects oversized text and malformed identifiers", () => {
  for (const patch of [
    { buyer: " " },
    { needs: "x".repeat(1001) },
    { requestId: "bad" },
    { carId: "$ne" },
  ])
    assert.throws(() => validateBooking({ ...input, ...patch }, now));
});
