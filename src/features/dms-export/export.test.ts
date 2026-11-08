import assert from "node:assert/strict";
import test from "node:test";
import { csvCell, toCsv } from "./csv";
import { dmsRows, indiaDayRange, istDateTime, type ExportBooking } from "./columns";

test("CSV cells are quoted when needed and formulas are neutralised", () => {
  assert.equal(csvCell("Model H"), "Model H");
  assert.equal(csvCell('He said "hi", then left'), '"He said ""hi"", then left"');
  assert.equal(csvCell("line1\nline2"), '"line1\nline2"');
  assert.equal(csvCell("=HYPERLINK(\"x\")"), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell("+91 98765"), "'+91 98765");
  assert.equal(csvCell("@cmd"), "'@cmd");
  assert.equal(csvCell(-5), "-5");
  assert.equal(csvCell(null), "");
  assert.equal(toCsv(["a", "b"], [[1, null]]), "a,b\r\n1,\r\n");
});

test("India day range and timestamps use IST, not the server time zone", () => {
  const { start, end } = indiaDayRange("2026-11-09");
  assert.equal(new Date(start).toISOString(), "2026-11-08T18:30:00.000Z");
  assert.equal(end - start, 86_400_000);
  assert.equal(istDateTime(Date.parse("2026-11-09T08:35:00Z")), "2026-11-09 14:05");
});

const booking: ExportBooking = {
  _id: "00000000-0000-4000-8000-000000000003",
  buyerId: "b",
  buyerEmail: "buyer@demo.companya.test",
  carId: "NEW-H-02",
  carName: "Model H ZX automatic",
  showroom: "Demo Showroom 1",
  date: "2026-11-12",
  time: "10:30",
  buyer: "Imran Qureshi",
  needs: "private free text that must not be exported",
  status: "Confirmed",
  consultant: "Consultant 1A",
  createdAt: Date.parse("2026-11-09T04:30:00Z"),
  contactedAt: Date.parse("2026-11-09T04:34:00Z"),
  leadStatus: "Contacted",
  optedOut: false,
  consentAt: 0,
  consentVersion: "booking-follow-up-v1",
  price: {
    carId: "NEW-H-02",
    cityId: "lucknow",
    version: 1,
    basePricePaise: 124_500_000,
    roadTaxPaise: 9_500_000,
    insurancePaise: 3_800_000,
    accessoriesPaise: 0,
    validThrough: "2027-03-31",
  },
  messages: [],
  tradeIn: { model: "Model A hatchback", year: 2018, kilometres: 64_000, owners: 1 },
};

test("DMS rows carry the price breakup, response time and trade-in, but not free text", () => {
  const { header, rows } = dmsRows([booking]);
  const row = Object.fromEntries(header.map((name, i) => [name, rows[0][i]]));
  assert.equal(row.created_at_ist, "2026-11-09 10:00");
  assert.equal(row.response_minutes, 4);
  assert.equal(row.on_road_price_inr, 1_378_000);
  assert.equal(row.trade_in_km, 64_000);
  assert.ok(!rows[0].includes(booking.needs));
  const none = dmsRows([{ ...booking, tradeIn: null, contactedAt: null }]).rows[0];
  assert.equal(none[header.indexOf("trade_in_model")], null);
  assert.equal(none[header.indexOf("response_minutes")], null);
});
