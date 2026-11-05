import assert from "node:assert/strict";
import test from "node:test";
import { endOfIndiaDate, validatePriceInput } from "./validate-price";
import { formatPrice } from "../cars/presentation";

const price = {
  carId: "NEW-H-02",
  cityId: "lucknow",
  version: 0,
  basePricePaise: 124500000,
  roadTaxPaise: 9500000,
  insurancePaise: 3800000,
  accessoriesPaise: 0,
  validThrough: "2027-03-31",
};

test("valid through includes the full India calendar day", () => {
  assert.equal(
    endOfIndiaDate("2027-03-31").toISOString(),
    "2027-03-31T18:30:00.000Z",
  );
  assert.doesNotThrow(() =>
    validatePriceInput(price, new Date("2027-03-31T18:29:59Z")),
  );
  assert.throws(() =>
    validatePriceInput(price, new Date("2027-03-31T18:30:00Z")),
  );
});
test("rejects rolled dates, invalid money and stale-version shapes", () => {
  for (const date of ["2027-02-29", "2027-04-31", "invalid"])
    assert.throws(() => endOfIndiaDate(date));
  for (const amount of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() =>
      validatePriceInput({ ...price, basePricePaise: amount }),
    );
  assert.throws(() => validatePriceInput({ ...price, version: -1 }));
});

test("public prices retain paise without adding decimals to whole rupees", () => {
  assert.equal(formatPrice(123456.75), "₹1,23,456.75");
  assert.equal(formatPrice(123456), "₹1,23,456");
});
