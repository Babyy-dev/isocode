import type { MetadataRoute } from "next";
import { listCars, toCar } from "@/features/cars/repository";
import { carPath } from "@/features/cars/presentation";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

function entry(englishPath: string, hindiPath: string, lastModified?: Date): Entry {
  return {
    url: absoluteUrl(englishPath),
    ...(lastModified ? { lastModified } : {}),
    alternates: {
      languages: { "en-IN": absoluteUrl(englishPath), "hi-IN": absoluteUrl(hindiPath) },
    },
  };
}

/** Home and every live (non-archived) car page, each with its Hindi alternate. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const documents = await listCars();
  return [
    entry("/", "/?lang=hi"),
    ...documents.map((document) => {
      const car = toCar(document);
      return entry(carPath(car), carPath(car, "hi"), document.updatedAt);
    }),
  ];
}
