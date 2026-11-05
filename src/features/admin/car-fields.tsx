import type { Car } from "@/features/cars/types";
import { InspectionFields } from "./inspection-fields";

export function CarDetailFields({
  car,
  type,
  setType,
}: {
  car?: Car;
  type: "New" | "Used";
  setType: (value: "New" | "Used") => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <label className="field-label">
        Stock ID
        <input
          className="field"
          name="stockId"
          required
          maxLength={40}
          readOnly={!!car}
          defaultValue={car?.stockId}
          placeholder="UC-1201"
          pattern="[A-Z0-9]+(-[A-Z0-9]+)*"
        />
      </label>
      <label className="field-label">
        Type
        <select
          className="field"
          value={type}
          disabled={!!car}
          onChange={(event) => setType(event.target.value as "New" | "Used")}
        >
          <option>New</option>
          <option>Used</option>
        </select>
      </label>
      <label className="field-label">
        Model
        <input
          className="field"
          name="model"
          required
          maxLength={80}
          defaultValue={car?.model}
        />
      </label>
      <label className="field-label">
        Variant
        <input
          className="field"
          name="variant"
          required
          maxLength={100}
          defaultValue={car?.variant}
        />
      </label>
      <label className="field-label">
        Fuel
        <select
          className="field"
          name="fuel"
          defaultValue={car?.fuel ?? "Petrol"}
        >
          <option>Petrol</option>
          <option>Diesel</option>
        </select>
      </label>
      <label className="field-label">
        Availability
        <select
          className="field"
          name="status"
          defaultValue={car?.status ?? "Available"}
        >
          <option>Available</option>
          <option>Booked</option>
        </select>
      </label>
      <label className="field-label">
        Year
        <input
          className="field"
          name="year"
          type="number"
          required
          min={1900}
          max={new Date().getFullYear() + 1}
          defaultValue={car?.year ?? new Date().getFullYear()}
        />
      </label>
      <label className="field-label">
        Kilometres
        <input
          className="field"
          name="kilometres"
          type="number"
          required
          min={0}
          max={2000000}
          defaultValue={car?.kilometres ?? 0}
        />
      </label>
      <label className="field-label">
        Base/listed price · INR
        <input
          className="field"
          name="price"
          type="number"
          required
          min={0}
          max={100000000}
          step="0.01"
          defaultValue={car?.priceInRupees}
        />
      </label>
    </div>
  );
}

export function CarContentFields({
  car,
  type,
}: {
  car?: Car;
  type: "New" | "Used";
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="field-label sm:col-span-2">
        Photo URLs · HTTPS, one per line (up to 8)
        <textarea
          className="field min-h-28"
          name="photoUrls"
          maxLength={16400}
          defaultValue={car?.photoUrls?.join("\n")}
          placeholder="https://your-image-host.example/car-front.webp"
        />
        <span className="text-xs text-muted">
          Use compressed images you have permission to publish. The first image
          is the cover. Empty uses the existing sample image or a placeholder.
        </span>
      </label>
      <label className="field-label">
        Description
        <textarea
          className="field min-h-28"
          name="description"
          maxLength={1500}
          defaultValue={car?.description}
        />
      </label>
      <label className="field-label">
        Specifications · one Label: Value per line
        <textarea
          className="field min-h-28"
          name="specifications"
          maxLength={3600}
          defaultValue={car?.specifications
            ?.map((spec) => `${spec.label}: ${spec.value}`)
            .join("\n")}
          placeholder="Transmission: Automatic"
        />
      </label>
      <label className="field-label">
        Colours · comma separated
        <input
          className="field"
          name="colours"
          maxLength={490}
          defaultValue={car?.colours?.join(", ")}
          placeholder="Pearl white, Midnight blue"
        />
      </label>
      {type === "Used" && (
        <>
          <label className="field-label">
            Number of owners
            <input
              className="field"
              name="owners"
              type="number"
              min={1}
              max={20}
              defaultValue={car?.owners ?? ""}
            />
          </label>
          <label className="field-label">
            Masked registration only
            <input
              className="field"
              name="registrationMasked"
              maxLength={10}
              pattern="[A-Z]{2}[0-9]{2}[*]{4}[0-9]{2}"
              defaultValue={car?.registrationMasked}
              placeholder="UP32****82"
            />
          </label>
          <InspectionFields inspection={car?.inspection} />
        </>
      )}
    </div>
  );
}
