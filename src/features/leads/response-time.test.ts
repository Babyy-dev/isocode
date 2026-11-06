import assert from "node:assert/strict";
import test from "node:test";
import { formatElapsed, responseLabel, responseState } from "./response-time";

const created = 1_000_000;
const minute = 60_000;

test("uncontacted leads become overdue after five minutes", () => {
  assert.equal(responseState({ createdAt: created, contactedAt: null }, created + 5 * minute).kind, "waiting");
  assert.equal(responseState({ createdAt: created, contactedAt: null }, created + 5 * minute + 1).kind, "overdue");
});

test("contacted leads freeze the timer at the first call", () => {
  const met = responseState({ createdAt: created, contactedAt: created + 4 * minute }, created + 99 * minute);
  assert.deepEqual(met, { kind: "met", elapsedMs: 4 * minute });
  const missed = responseState({ createdAt: created, contactedAt: created + 12 * minute }, created);
  assert.equal(missed.kind, "missed");
});

test("clock skew never shows negative time", () => {
  assert.equal(responseState({ createdAt: created, contactedAt: null }, created - 5000).elapsedMs, 0);
});

test("elapsed time stays readable from seconds to days", () => {
  assert.equal(formatElapsed(47_000), "47s");
  assert.equal(formatElapsed(4 * minute + 5000), "4m 05s");
  assert.equal(formatElapsed(123 * minute), "2h 03m");
  assert.equal(formatElapsed((3 * 24 + 4) * 60 * minute), "3d 4h");
  assert.equal(responseLabel({ kind: "overdue", elapsedMs: 47 * minute }), "Overdue · waiting 47m 00s");
});
