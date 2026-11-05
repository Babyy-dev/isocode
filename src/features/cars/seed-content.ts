import type { Inspection, InspectionCheck } from "@/features/inspection/types";
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
          inspection: syntheticInspection(car.stockId),
        }
      : {}),
  };
}

const passed = (area: InspectionCheck["area"], note = ""): InspectionCheck => ({
  area,
  result: "pass",
  note,
});

/** Synthetic reports with realistic disclosed items; not real vehicle inspections. */
function syntheticInspection(stockId: string): Inspection {
  if (stockId === "UC-1182")
    return {
      inspectedOn: "2026-10-28",
      checks: [
        passed("engine", "No leaks; diesel engine starts cleanly from cold."),
        passed("brakes"),
        passed("tyres", "All four tyres at about 60% tread."),
        { area: "body", result: "attention", note: "Minor paint marks on the rear bumper." },
        passed("interior"),
        passed("documents", "Authorised service records up to 40,000 km."),
      ],
    };
  return {
    inspectedOn: "2026-10-15",
    checks: [
      passed("engine"),
      passed("brakes"),
      { area: "tyres", result: "attention", note: "Front tyres due for replacement within 5,000 km." },
      { area: "body", result: "attention", note: "Repainted left front door; no structural damage found." },
      passed("interior"),
      passed("documents", "Two previous owners; service records complete."),
    ],
  };
}
