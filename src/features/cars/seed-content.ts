import type { Car, CarContent } from "./types";

/** Labelled assessment fixtures, not client-provided vehicle facts or certifications. */
export function syntheticCarContent(car: Car): CarContent {
  return {
    description:
      "Synthetic assessment listing. Photos and additional details illustrate the experience; confirm actual vehicle details with the dealership.",
    colours:
      car.type === "New" ? ["Pearl white", "Midnight blue"] : ["Pearl white"],
    specifications: [
      {
        label: "Transmission (synthetic)",
        value: car.stockId === "NEW-H-02" ? "Automatic" : "Manual",
      },
    ],
    ...(car.type === "Used"
      ? {
          owners: car.stockId === "UC-1182" ? 1 : 2,
          registrationMasked:
            car.stockId === "UC-1182" ? "UP32****82" : "UP32****90",
          inspectionReport:
            "SYNTHETIC ASSESSMENT REPORT — not a real vehicle inspection or certification.\nSample checks: lights and controls operating; no warning lamps observed; tyres show normal wear.\nSample disclosed defect: minor rear-bumper paint marks.\nA real inspection report must be provided and verified by the dealership before sale.",
        }
      : {}),
  };
}
