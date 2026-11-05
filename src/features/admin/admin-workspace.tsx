"use client";

import { useState, useTransition } from "react";
import type { Car } from "@/features/cars/types";
import type { CityPrice } from "@/features/pricing/types";
import { PriceEditor } from "./price-editor";
import { changeAvailability } from "./actions";
import { CarEditor } from "./car-editor";
import { archiveCar } from "./car-actions";

export function AdminWorkspace({
  cars,
  cities,
  prices,
}: {
  cars: Car[];
  cities: { _id: string; name: string }[];
  prices: CityPrice[];
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [carId, setCarId] = useState(cars[0]?.stockId ?? "");
  const [city, setCity] = useState(cities[0]?._id ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const car = cars.find((row) => row.stockId === carId);
  const price = prices.find(
    (row) => row.carId === carId && row.cityId === city,
  );

  function toggleCar(stock: Car) {
    startTransition(async () => {
      try {
        const result = await changeAvailability(stock.stockId, stock.status);
        setMessage(result.error ?? "Availability saved.");
      } catch {
        setMessage("Unable to save. Check your connection and try again.");
      }
    });
  }

  function changePublication(stock: Car) {
    startTransition(async () => {
      try {
        const result = await archiveCar(
          stock.stockId,
          !stock.archived,
          stock.contentVersion ?? 0,
        );
        setMessage(
          result.error ??
            (stock.archived
              ? "Car restored."
              : "Car archived. Existing bookings and price history are retained."),
        );
      } catch {
        setMessage("Unable to update this car. Please try again.");
      }
    });
  }

  return (
    <>
      <p className="eyebrow">ADMINISTRATION</p>
      <h1 className="section-title mt-4">Cars & city prices</h1>
      <p className="mt-4 text-muted">
        Prices and stock availability are saved to MongoDB. Seed charges are
        illustrative. Bookings keep their original price snapshot.
      </p>
      <p role="status" className="mt-4 text-sm text-accent">
        {message}
      </p>
      <button className="button-primary mt-5" onClick={() => setEditing("new")}>
        Add car
      </button>
      {editing && (
        <CarEditor
          key={editing}
          car={cars.find((stock) => stock.stockId === editing)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setMessage("Car saved. City prices are managed separately below.");
          }}
        />
      )}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <section className="space-y-4">
          {cars.map((car) => (
            <article key={car.stockId} className="border border-line p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="font-semibold">
                    {car.model} · {car.variant}
                  </h2>
                  <p className="mt-2 text-xs text-muted">{car.stockId}</p>
                </div>
                <button
                  className="text-sm text-accent underline"
                  disabled={pending}
                  onClick={() => toggleCar(car)}
                >
                  {car.status === "Booked" ? "Mark available" : "Mark booked"}
                </button>
              </div>
              <p className="mt-3 text-sm">
                {car.archived ? "Archived · hidden from buyers" : car.status}
              </p>
              <div className="mt-4 flex gap-5 text-sm text-accent">
                <button
                  className="underline"
                  onClick={() => setEditing(car.stockId)}
                >
                  Edit details
                </button>
                <button
                  className="underline"
                  disabled={pending}
                  onClick={() => changePublication(car)}
                >
                  {car.archived ? "Restore listing" : "Archive listing"}
                </button>
              </div>
            </article>
          ))}
        </section>
        <section>
          <div className="grid grid-cols-2 gap-4">
            <label className="field-label">
              Car
              <select
                className="field"
                value={carId}
                onChange={(event) => setCarId(event.target.value)}
              >
                {cars.map((car) => (
                  <option key={car.stockId} value={car.stockId}>
                    {car.model}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              City
              <select
                className="field"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              >
                {cities.map((value) => (
                  <option key={value._id} value={value._id}>
                    {value.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {car && city ? (
            <PriceEditor
              key={`${carId}-${city}`}
              price={
                price ?? {
                  carId,
                  cityId: city,
                  version: 0,
                  basePricePaise: car.priceInRupees * 100,
                  roadTaxPaise: 0,
                  insurancePaise: 0,
                  accessoriesPaise: 0,
                  validThrough: "",
                }
              }
            />
          ) : (
            <p className="mt-6 text-muted">
              No cars or cities configured. Run the database seed first.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
