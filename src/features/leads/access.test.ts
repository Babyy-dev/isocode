import assert from "node:assert/strict";
import test from "node:test";
import { leadScope } from "./access";
import { assignConsultant } from "./assignment";
import { buildLeadUpdate } from "./update-rules";
import type { BookingDocument } from "@/features/bookings/types";

test("unlinked consultants are denied and linked consultants have an assignment filter", () => {
  assert.throws(() =>
    leadScope({ userId: "u1", role: "consultant", profile: null }),
  );
  assert.deepEqual(
    leadScope({ userId: "u1", role: "consultant", profile: "Consultant 1A" }),
    { consultant: "Consultant 1A" },
  );
  assert.deepEqual(
    leadScope({ userId: "admin", role: "admin", profile: null }),
    {},
  );
});
test("assignment excludes cancelled and closed work and stays within model eligibility", () => {
  const leads = [
    { consultant: "Consultant 1A", leadStatus: "New", status: "Confirmed" },
  ];
  assert.equal(
    assignConsultant(leads, "Demo Showroom 1", "NEW-H-02"),
    "Consultant 1B",
  );
  assert.equal(
    assignConsultant(leads, "Demo Showroom 1", "UC-1182"),
    "Consultant 1A",
  );
  assert.equal(
    assignConsultant(
      [{ ...leads[0], status: "Cancelled" }],
      "Demo Showroom 1",
      "NEW-H-02",
    ),
    "Consultant 1A",
  );
  assert.equal(
    assignConsultant(leads, "Demo Showroom 1", "OTHER"),
    "Lead desk 1",
  );
});
test("lead updates reject unreviewed replies and cross-showroom reassignment", () => {
  const lead = {
    showroom: "Demo Showroom 1",
    carId: "UC-1182",
  } as BookingDocument;
  assert.equal(
    typeof buildLeadUpdate(
      { kind: "reply", value: "Hello", reviewed: false },
      lead,
    ),
    "string",
  );
  assert.equal(
    typeof buildLeadUpdate({ kind: "assign", value: "Consultant 2A" }, lead),
    "string",
  );
  assert.equal(
    typeof buildLeadUpdate({ kind: "assign", value: "Consultant 1B" }, lead),
    "string",
  );
  assert.deepEqual(
    buildLeadUpdate({ kind: "reply", value: " Hello ", reviewed: true }, lead),
    { $push: { messages: "Simulated reply: Hello" } },
  );
});
