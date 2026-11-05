export const inspectionAreas = [
  "engine",
  "brakes",
  "tyres",
  "body",
  "interior",
  "documents",
] as const;

export type InspectionArea = (typeof inspectionAreas)[number];

export type InspectionResult = "pass" | "attention";

export type InspectionCheck = {
  area: InspectionArea;
  result: InspectionResult;
  /** Required when the result is "attention"; optional detail otherwise. */
  note: string;
};

/** Certified used-car inspection: one check per area, dated in India time (YYYY-MM-DD). */
export type Inspection = {
  inspectedOn: string;
  checks: InspectionCheck[];
};
