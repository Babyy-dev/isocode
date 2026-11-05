import type { Car, CarContent } from "@/features/cars/types";
import {
  InspectionInputError,
  validateInspection,
} from "@/features/inspection/validate-inspection";

export class CarInputError extends Error {}

export type CarInput = Omit<Car, "priceLabel" | "slug"> & {
  expectedVersion: number;
};

function text(
  value: unknown,
  label: string,
  max: number,
  required = false,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new CarInputError(`Check ${label} (up to ${max} characters).`);
  return value.trim();
}

function integer(
  value: unknown,
  min: number,
  max: number,
  label: string,
): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  )
    throw new CarInputError(
      `Check ${label}: enter a whole number from ${min} to ${max}.`,
    );
  return value;
}

export function validateCar(input: CarInput) {
  if (!input || typeof input !== "object")
    throw new CarInputError("Invalid car details.");
  const stockId = text(input.stockId, "stock ID", 40, true);
  if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(stockId))
    throw new CarInputError(
      "Use uppercase letters, numbers and hyphens for the stock ID.",
    );
  if (
    !["New", "Used"].includes(input.type) ||
    !["Petrol", "Diesel"].includes(input.fuel) ||
    !["Available", "Booked"].includes(input.status)
  )
    throw new CarInputError("Choose a valid type, fuel and availability.");
  if (
    typeof input.priceInRupees !== "number" ||
    !Number.isFinite(input.priceInRupees) ||
    input.priceInRupees < 0 ||
    input.priceInRupees > 100000000
  )
    throw new CarInputError("Enter a valid base price.");
  integer(input.expectedVersion, 0, Number.MAX_SAFE_INTEGER, "version");
  return {
    stockId,
    type: input.type,
    model: text(input.model, "model", 80, true),
    variant: text(input.variant, "variant", 100, true),
    fuel: input.fuel,
    year: integer(input.year, 1900, new Date().getFullYear() + 1, "year"),
    kilometres: integer(input.kilometres, 0, 2000000, "kilometres"),
    pricePaise: Math.round(input.priceInRupees * 100),
    status: input.status,
    ...validateContent(input),
  };
}

function validateContent(input: CarInput): CarContent {
  const colours = input.colours ?? [];
  const specifications = input.specifications ?? [];
  if (
    !Array.isArray(colours) ||
    colours.length > 12 ||
    !Array.isArray(specifications) ||
    specifications.length > 20
  )
    throw new CarInputError("Use up to 12 colours and 20 specifications.");
  const owners =
    input.owners == null ? null : integer(input.owners, 1, 20, "owners");
  const registrationMasked = text(
    input.registrationMasked ?? "",
    "masked registration",
    10,
  );
  if (
    registrationMasked &&
    !/^[A-Z]{2}\d{2}\*{4}\d{2}$/.test(registrationMasked)
  )
    throw new CarInputError(
      "Enter only a masked registration, for example UP32****82.",
    );
  return {
    photoUrls: validatePhotoUrls(input.photoUrls ?? []),
    description: text(input.description ?? "", "description", 1500),
    colours: colours.map((colour) => text(colour, "colour", 40, true)),
    specifications: specifications.map((spec) => {
      if (!spec || typeof spec !== "object")
        throw new CarInputError("Check each specification.");
      return {
        label: text(spec.label, "specification name", 60, true),
        value: text(spec.value, "specification value", 120, true),
      };
    }),
    owners: input.type === "Used" ? owners : null,
    registrationMasked: input.type === "Used" ? registrationMasked : "",
    inspection: input.type === "Used" ? usedCarInspection(input.inspection) : null,
  };
}

/** Optional until the yard completes it; when present it must be complete and valid. */
function usedCarInspection(value: unknown) {
  if (value == null) return null;
  try {
    return validateInspection(value);
  } catch (error) {
    if (error instanceof InspectionInputError) throw new CarInputError(error.message);
    throw error;
  }
}

export function validatePhotoUrls(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 8)
    throw new CarInputError("Use up to 8 photo URLs.");
  return value.map((item) => {
    const raw = text(item, "photo URL", 2048, true);
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      throw new CarInputError("Enter complete HTTPS photo URLs.");
    }
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !/\.[a-z]{2,}$/i.test(url.hostname) ||
      /\.(local|internal|localhost)$/i.test(url.hostname)
    )
      throw new CarInputError(
        "Photos must use public HTTPS URLs without embedded credentials.",
      );
    return url.toString();
  });
}
