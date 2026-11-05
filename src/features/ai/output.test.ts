import assert from "node:assert/strict";
import test from "node:test";
import {
  draftHasCommercialClaim,
  extractResponseText,
  parseAssistance,
} from "./output";
import { redactContactDetails } from "./prompt";

const valid = {
  summary: "Buyer wants an automatic for family use.",
  draft: "Hello, thank you for your interest. How many seats do you need?",
  uncertainties: ["Seating needs are unknown."],
};

test("AI output must match the expected bounded structure", () => {
  assert.deepEqual(parseAssistance(JSON.stringify(valid)), valid);
  for (const value of [
    "not json",
    "null",
    "{}",
    JSON.stringify({ ...valid, uncertainties: "none" }),
    JSON.stringify({ ...valid, draft: "x".repeat(2001) }),
  ])
    assert.throws(() => parseAssistance(value));
});
test("AI and manual replies reject pricing and discount language", () => {
  for (const draft of [
    "We offer a 10% discount",
    "Your price is ₹845000",
    "EMI Rs 9000",
    "हम 5% छूट देंगे",
    "Cashback included",
  ])
    assert.equal(draftHasCommercialClaim(draft), true);
  assert.equal(draftHasCommercialClaim(valid.draft), false);
  assert.throws(() =>
    parseAssistance(
      JSON.stringify({ ...valid, draft: "Save with a discount" }),
    ),
  );
});
test("Responses API refusal, incomplete and empty output are handled explicitly", () => {
  const response = {
    status: "completed",
    output: [
      {
        type: "message",
        content: [{ type: "output_text", text: JSON.stringify(valid) }],
      },
    ],
  };
  assert.deepEqual(parseAssistance(extractResponseText(response)), valid);
  assert.throws(() =>
    extractResponseText({ ...response, status: "incomplete" }),
  );
  assert.throws(() =>
    extractResponseText({
      status: "completed",
      output: [{ type: "message", content: [{ type: "refusal" }] }],
    }),
  );
  assert.throws(() => extractResponseText({ status: "completed", output: [] }));
});
test("common email addresses and Indian phone numbers are removed from needs", () => {
  const redacted = redactContactDetails(
    "Email demo@example.invalid or call +91 98765 43210. Need automatic.",
  );
  assert.ok(!redacted.includes("demo@example.invalid"));
  assert.ok(!redacted.includes("98765"));
  assert.ok(redacted.includes("Need automatic"));
});
