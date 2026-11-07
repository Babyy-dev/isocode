import assert from "node:assert/strict";
import test from "node:test";
import { validateTradeIn } from "./validate-trade-in";

const now = new Date("2026-11-09T12:00:00+05:30");
const car = { model: "  Model A hatchback ", year: 2018, kilometres: 64_000, owners: 1 };

test("no trade-in is allowed and stays null", () => {
  assert.equal(validateTradeIn(null, now), null);
  assert.equal(validateTradeIn(undefined, now), null);
});

test("a complete trade-in is trimmed and kept", () => {
  assert.deepEqual(validateTradeIn(car, now), { ...car, model: "Model A hatchback" });
});

test("incomplete or impossible trade-ins are rejected", () => {
  for (const patch of [
    { model: " " },
    { model: "x".repeat(61) },
    { year: 2027 },
    { year: 1980 },
    { year: 2018.5 },
    { kilometres: -1 },
    { kilometres: 600_000 },
    { owners: 0 },
    { owners: "2" },
  ])
    assert.throws(() => validateTradeIn({ ...car, ...patch }, now), JSON.stringify(patch));
});
