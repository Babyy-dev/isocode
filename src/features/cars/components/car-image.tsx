"use client";

import { useState } from "react";
import Image from "next/image";
import modelH from "../../../../public/images/cars/model-h.webp";
import modelC from "../../../../public/images/cars/model-c.webp";
import modelS from "../../../../public/images/cars/model-s.webp";

const carImages = {
  "NEW-H-02": modelH,
  "UC-1182": modelC,
  "UC-1190": modelS,
};
import type { Car } from "../types";

type CarImageProps = { car: Car; priority?: boolean; sizes: string };

export function CarImage({ car, priority = false, sizes }: CarImageProps) {
  if (car.photoUrls?.[0])
    return (
      <RemotePhoto
        key={car.photoUrls[0]}
        src={car.photoUrls[0]}
        model={car.model}
        priority={priority}
        sizes={sizes}
      />
    );
  const sample = carImages[car.stockId as keyof typeof carImages];
  if (!sample) return <PhotoPlaceholder />;
  return (
    <Image
      src={sample}
      placeholder="blur"
      alt={`Illustrative vehicle photograph; not the actual ${car.model}`}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]"
    />
  );
}

function RemotePhoto({
  src,
  model,
  priority,
  sizes,
}: {
  src: string;
  model: string;
  priority: boolean;
  sizes: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <PhotoPlaceholder />;
  // External images load directly in the browser; the server never fetches an arbitrary URL.
  return (
    <Image
      src={src}
      alt={`${model} photograph`}
      fill
      unoptimized
      sizes={sizes}
      priority={priority}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="object-cover"
    />
  );
}

function PhotoPlaceholder() {
  return (
    <div
      role="img"
      aria-label="Car photo unavailable"
      className="flex h-full min-h-32 items-center justify-center bg-surface text-sm text-muted"
    >
      Photo unavailable
    </div>
  );
}
