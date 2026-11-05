"use client";

import { useState, useTransition } from "react";
import type { Car } from "@/features/cars/types";
import { saveCar } from "./car-actions";
import type { CarInput } from "./car-validation";
import { CarDetailFields, CarContentFields } from "./car-fields";

export function CarEditor({
  car,
  onSaved,
  onClose,
}: {
  car?: Car;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"New" | "Used">(car?.type ?? "New");
  function submit(form: FormData) {
    const value = (key: string) => String(form.get(key) ?? "").trim();
    const input: CarInput = {
      stockId: car?.stockId ?? value("stockId"),
      type,
      model: value("model"),
      variant: value("variant"),
      fuel: value("fuel") as Car["fuel"],
      status: value("status") as Car["status"],
      year: Number(value("year")),
      kilometres: Number(value("kilometres")),
      priceInRupees: Number(value("price")),
      description: value("description"),
      colours: value("colours")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      specifications: value("specifications")
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const separator = line.indexOf(":");
          return {
            label: separator < 0 ? line : line.slice(0, separator),
            value: separator < 0 ? "" : line.slice(separator + 1).trim(),
          };
        }),
      owners: value("owners") ? Number(value("owners")) : null,
      registrationMasked: value("registrationMasked"),
      inspectionReport: value("inspectionReport"),
      expectedVersion: car?.contentVersion ?? 0,
      photoUrls: value("photoUrls")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    startTransition(async () => {
      try {
        const result = await saveCar(input, !car);
        if (result.error) setMessage(result.error);
        else onSaved();
      } catch {
        setMessage("Unable to save. Check your connection and try again.");
      }
    });
  }
  return (
    <form action={submit} className="mt-8 border border-line bg-surface/40 p-6">
      <h2 className="text-2xl">{car ? `Edit ${car.stockId}` : "Add a car"}</h2>
      <p className="mt-3 text-sm text-muted">
        Base/listed price appears in the catalogue. Publish each city’s on-road
        charges separately. Archive to remove a car from browsing without
        deleting its history.
      </p>
      <fieldset disabled={pending} className="mt-6 space-y-6">
        <CarDetailFields car={car} type={type} setType={setType} />
        <CarContentFields car={car} type={type} />
        <div className="flex gap-5">
          <button className="button-primary">
            {pending ? "Saving…" : "Save car"}
          </button>
          <button type="button" className="text-sm underline" onClick={onClose}>
            Close editor
          </button>
        </div>
      </fieldset>
      <p role="alert" className="mt-4 text-sm text-red-700">
        {message}
      </p>
    </form>
  );
}
