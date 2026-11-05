import { indiaDate } from "@/lib/date";
import {
  inspectionAreas,
  type Inspection,
  type InspectionCheck,
} from "./types";

export class InspectionInputError extends Error {}

const NOTE_MAX = 200;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns a clean inspection, or throws a message an admin can act on. */
export function validateInspection(value: unknown, now = new Date()): Inspection {
  if (!value || typeof value !== "object")
    throw new InspectionInputError("Complete the inspection checklist.");
  const input = value as Partial<Inspection>;
  return {
    inspectedOn: validateDate(input.inspectedOn, now),
    checks: validateChecks(input.checks),
  };
}

function validateDate(value: unknown, now: Date) {
  if (typeof value !== "string" || !isCalendarDate(value))
    throw new InspectionInputError("Enter the inspection date.");
  if (value > indiaDate(now))
    throw new InspectionInputError("The inspection date cannot be in the future.");
  return value;
}

function isCalendarDate(value: string) {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(+parsed) && parsed.toISOString().startsWith(value);
}

function validateChecks(value: unknown): InspectionCheck[] {
  if (!Array.isArray(value))
    throw new InspectionInputError("Complete the inspection checklist.");
  // Output always follows the canonical area order, one check per area.
  return inspectionAreas.map((area) => {
    const matches = value.filter((check) => check?.area === area);
    if (matches.length !== 1)
      throw new InspectionInputError("Record exactly one result for every area.");
    return validateCheck(matches[0]);
  });
}

function validateCheck(check: InspectionCheck): InspectionCheck {
  if (check.result !== "pass" && check.result !== "attention")
    throw new InspectionInputError("Mark each area as passed or noted.");
  if (typeof check.note !== "string" || check.note.length > NOTE_MAX)
    throw new InspectionInputError(`Keep each note under ${NOTE_MAX} characters.`);
  const note = check.note.trim();
  if (check.result === "attention" && !note)
    throw new InspectionInputError("Describe every noted item so buyers see what was found.");
  return { area: check.area, result: check.result, note };
}

export function summariseInspection(inspection: Inspection) {
  const noted = inspection.checks.filter((check) => check.result === "attention");
  return {
    total: inspection.checks.length,
    passed: inspection.checks.length - noted.length,
    noted,
  };
}
