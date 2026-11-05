import assert from "node:assert/strict";
import test from "node:test";
import {
  validateCar,
  validatePhotoUrls,
  type CarInput,
} from "./car-validation";
import { carPath } from "@/features/cars/presentation";

const input: CarInput = {
  stockId: "UC-1201",
  type: "Used",
  model: "Model C",
  variant: "VX",
  fuel: "Diesel",
  year: 2022,
  kilometres: 41200,
  priceInRupees: 845000.25,
  status: "Available",
  expectedVersion: 0,
  owners: 1,
  registrationMasked: "UP32****82",
};

test("car editing preserves paise and rejects unmasked registration", () => {
  assert.equal(validateCar(input).pricePaise, 84500025);
  assert.throws(() =>
    validateCar({ ...input, registrationMasked: "UP32AB1182" }),
  );
  assert.throws(() => validateCar({ ...input, kilometres: -1 }));
  assert.throws(() => validateCar({ ...input, owners: 0 }));
});
test("admin photos require public HTTPS URLs and no credentials", () => {
  assert.deepEqual(validatePhotoUrls(["https://images.example.com/car.webp"]), [
    "https://images.example.com/car.webp",
  ]);
  for (const url of [
    "http://images.example.com/car.jpg",
    "https://localhost/car.jpg",
    "https://127.0.0.1/car",
    "https://user:password@example.com/car",
    "javascript:alert(1)",
  ])
    assert.throws(() => validatePhotoUrls([url]));
  assert.throws(() =>
    validatePhotoUrls(Array(9).fill("https://example.com/car.jpg")),
  );
});
test("admin car text has bounds and stored slugs survive renamed models", () => {
  assert.throws(() =>
    validateCar({ ...input, specifications: [{ label: "Seats", value: "" }] }),
  );
  assert.throws(() => validateCar({ ...input, description: "x".repeat(1501) }));
  const car = {
    ...input,
    type: "Used" as const,
    priceLabel: "Listed price" as const,
    slug: "stable-model-c-uc-1201",
  };
  assert.equal(
    carPath({ ...car, model: "Renamed model" }),
    "/cars/stable-model-c-uc-1201",
  );
});
