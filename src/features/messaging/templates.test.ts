import assert from "node:assert/strict";
import test from "node:test";
import { draftHasCommercialClaim } from "@/features/ai/output";
import { acknowledgementMessage, replyMessage } from "./templates";
import { ACKNOWLEDGEMENT_TEMPLATE } from "./types";

const fields = {
  buyer: "  Neha Srivastava ",
  carName: "Model C VX",
  showroom: "Demo Showroom 1",
  date: "2026-11-12",
  time: "14:30",
  consultant: "Consultant 1A",
};

test("acknowledgement names the consultant, slot and opt-out", () => {
  const message = acknowledgementMessage(fields, 1000);
  assert.equal(message.template, `${ACKNOWLEDGEMENT_TEMPLATE}_en`);
  assert.equal(message.sentBy, "system");
  assert.equal(message.status, "simulated");
  assert.match(message.body, /^Hello Neha,/);
  assert.match(message.body, /12 Nov 2026 at 14:30/);
  assert.match(message.body, /Consultant 1A is your consultant/);
  assert.match(message.body, /Reply STOP to opt out\.$/);
});

test("Hindi acknowledgement uses the Hindi template and keeps the slot details", () => {
  const message = acknowledgementMessage(fields, 1000, "hi");
  assert.equal(message.template, `${ACKNOWLEDGEMENT_TEMPLATE}_hi`);
  assert.match(message.body, /^नमस्ते Neha,/);
  assert.match(message.body, /14:30 बजे/);
  assert.match(message.body, /Consultant 1A आपके सलाहकार हैं/);
  assert.match(message.body, /STOP/);
});

test("acknowledgement never quotes prices or discounts in either language", () => {
  for (const language of ["en", "hi"] as const)
    assert.equal(draftHasCommercialClaim(acknowledgementMessage(fields, 0, language).body), false);
});

test("consultant replies are free text attributed to the consultant", () => {
  const message = replyMessage("  See you on Thursday.  ", "Consultant 2A", 5);
  assert.deepEqual(
    [message.kind, message.template, message.body, message.sentBy],
    ["reply", null, "See you on Thursday.", "Consultant 2A"],
  );
});
