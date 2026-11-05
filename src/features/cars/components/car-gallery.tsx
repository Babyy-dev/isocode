"use client";

import { useState } from "react";
import type { Car } from "../types";
import { CarImage } from "./car-image";

export function CarGallery({ car }: { car: Car }) {
  const [selected, setSelected] = useState(0);
  const photos = car.photoUrls ?? [];
  const shown = photos[selected]
    ? { ...car, photoUrls: [photos[selected]] }
    : car;
  return (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface sm:aspect-[2.2/1]">
        <CarImage
          car={shown}
          priority
          sizes="(max-width: 1280px) 100vw, 1240px"
        />
      </div>
      {photos.length > 1 && (
        <div
          className="mt-3 flex flex-wrap gap-2"
          aria-label="Choose car photo"
        >
          {photos.map((photo, index) => (
            <button
              key={photo + index}
              type="button"
              aria-pressed={selected === index}
              aria-label={`View photo ${index + 1}`}
              onClick={() => setSelected(index)}
              className={`relative h-16 w-24 overflow-hidden border-2 ${selected === index ? "border-accent" : "border-transparent"}`}
            >
              <CarImage car={{ ...car, photoUrls: [photo] }} sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
