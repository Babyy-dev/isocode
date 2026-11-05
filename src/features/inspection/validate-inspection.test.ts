import assert from "node:assert/strict";
import test from "node:test";
import { inspectionAreas, type Inspection } from "./types";
import { summariseInspection, validateInspection } from "./validate-inspection";

const now = new Date("2026-11-09T12:00:00+05:30");

function report(overrides: Partial<Inspection> = {}): Inspection {
  return {
    inspectedOn: "2026-10-28",
    checks: inspectionAreas.map((area) => ({ area, result: "pass", note: "" })),
    ...overrides,
  };
}

test("inspection keeps canonical area order and trims notes", () => {
  const shuffled = report();
  shuffled.checks.reverse();
  shuffled.checks[0] = { ...shuffled.checks[0], note: "  Service book stamped  " };
  const result = validateInspection(shuffled, now);
  assert.deepEqual(result.checks.map((check) => check.area), [...inspectionAreas]);
  assert.equal(result.checks.at(-1)?.note, "Service book stamped");
});

test("inspection rejects missing, duplicate and unknown areas", () => {
  assert.throws(() => validateInspection(report({ checks: report().checks.slice(1) }), now));
  const duplicate = report();
  duplicate.checks[1] = { ...duplicate.checks[0] };
  assert.throws(() => validateInspection(duplicate, now));
  const badResult = report();
  badResult.checks[0] = { ...badResult.checks[0], result: "fail" as never };
  assert.throws(() => validateInspection(badResult, now));
});

test("noted items must explain what was found", () => {
  const noted = report();
  noted.checks[3] = { area: "body", result: "attention", note: " " };
  assert.throws(() => validateInspection(noted, now), /Describe every noted item/);
});

test("inspection date must be a real past or current India date", () => {
  assert.throws(() => validateInspection(report({ inspectedOn: "2026-02-30" }), now));
  assert.throws(() => validateInspection(report({ inspectedOn: "2026-11-10" }), now));
  assert.equal(validateInspection(report({ inspectedOn: "2026-11-09" }), now).inspectedOn, "2026-11-09");
});

test("summary counts passed areas and lists noted ones", () => {
  const noted = report();
  noted.checks[3] = { area: "body", result: "attention", note: "Paint marks on rear bumper" };
  const summary = summariseInspection(validateInspection(noted, now));
  assert.equal(summary.passed, 5);
  assert.equal(summary.total, 6);
  assert.deepEqual(summary.noted.map((check) => check.area), ["body"]);
});
