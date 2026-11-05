import type { Car } from "./types";

export type Language = "en" | "hi";

export function getLanguage(value: string | string[] | undefined): Language {
  return value === "hi" ? "hi" : "en";
}

export function carPath(car: Car, language: Language = "en"): string {
  const name = `${car.model}-${car.variant}${car.type === "Used" ? `-${car.year}` : ""}`;
  const slug = car.slug ?? name.toLowerCase().replaceAll(" ", "-");
  return `/cars/${slug}${language === "hi" ? "?lang=hi" : ""}`;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatKilometres(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}
