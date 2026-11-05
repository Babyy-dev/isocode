import { inspectionAreas, type Inspection, type InspectionResult } from "./types";

export const inspectionFieldName = {
  date: "inspectedOn",
  result: (area: string) => `inspection-${area}-result`,
  note: (area: string) => `inspection-${area}-note`,
};

/** Reads the admin checklist. A blank date means the car has not been inspected yet. */
export function readInspectionForm(form: FormData): Inspection | null {
  const read = (name: string) => String(form.get(name) ?? "").trim();
  const inspectedOn = read(inspectionFieldName.date);
  if (!inspectedOn) return null;
  return {
    inspectedOn,
    checks: inspectionAreas.map((area) => ({
      area,
      result: read(inspectionFieldName.result(area)) as InspectionResult,
      note: read(inspectionFieldName.note(area)),
    })),
  };
}
