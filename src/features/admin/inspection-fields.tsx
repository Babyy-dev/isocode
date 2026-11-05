import { inspectionAreaLabels } from "@/features/inspection/copy";
import { inspectionFieldName } from "@/features/inspection/form";
import { inspectionAreas, type Inspection, type InspectionArea } from "@/features/inspection/types";
import { indiaDate } from "@/lib/date";

export function InspectionFields({ inspection }: { inspection?: Inspection | null }) {
  const checkFor = (area: InspectionArea) =>
    inspection?.checks.find((check) => check.area === area);
  return (
    <fieldset className="border border-line p-4 sm:col-span-2">
      <legend className="px-2 text-sm font-medium">Inspection checklist</legend>
      <p className="text-xs leading-5 text-muted">
        Leave the date blank until the car is inspected. Every “Noted” item needs a
        short description; buyers see it on the listing.
      </p>
      <label className="field-label mt-4 max-w-xs">
        Inspection date
        <input
          className="field"
          type="date"
          name={inspectionFieldName.date}
          max={indiaDate()}
          defaultValue={inspection?.inspectedOn}
        />
      </label>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {inspectionAreas.map((area) => (
          <CheckField key={area} area={area} result={checkFor(area)?.result} note={checkFor(area)?.note} />
        ))}
      </div>
    </fieldset>
  );
}

function CheckField({
  area,
  result = "pass",
  note = "",
}: {
  area: InspectionArea;
  result?: string;
  note?: string;
}) {
  const label = inspectionAreaLabels.en[area];
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[12rem_8rem_1fr] sm:items-center">
      <span className="text-sm">{label}</span>
      <select
        className="field"
        name={inspectionFieldName.result(area)}
        defaultValue={result}
        aria-label={`${label} result`}
      >
        <option value="pass">Passed</option>
        <option value="attention">Noted</option>
      </select>
      <input
        className="field"
        name={inspectionFieldName.note(area)}
        maxLength={200}
        defaultValue={note}
        placeholder="Optional detail, required when noted"
        aria-label={`${label} note`}
      />
    </div>
  );
}
