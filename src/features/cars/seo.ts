import type { Metadata } from "next";
import type { Language } from "@/lib/i18n/language";
import { absoluteUrl } from "@/lib/site";
import { carPath, formatKilometres, formatPrice } from "./presentation";
import { sampleImageFor } from "./sample-images";
import type { Car } from "./types";

const DEALER = "Company A";
const CITY = { en: "Lucknow", hi: "लखनऊ" } as const;

function carName(car: Car) {
  return `${car.model} ${car.variant} ${car.year}`;
}

function title(car: Car, language: Language) {
  const price = formatPrice(car.priceInRupees);
  if (language === "hi")
    return `${carName(car)} – ${price} ${car.type === "New" ? "एक्स-शोरूम" : "सूचीबद्ध कीमत"} | ${CITY.hi}`;
  return `${carName(car)} – ${price} ${car.type === "New" ? "ex-showroom" : "listed"} | ${CITY.en}`;
}

function description(car: Car, language: Language) {
  const km = formatKilometres(car.kilometres);
  const price = formatPrice(car.priceInRupees);
  if (language === "hi")
    return car.type === "New"
      ? `${car.model} ${car.variant}, ${car.year}। एक्स-शोरूम ${price}; ${CITY.hi} की ऑन-रोड कीमत का पूरा ब्योरा देखें और ${DEALER} में टेस्ट ड्राइव बुक करें।`
      : `प्रमाणित पुरानी ${car.model} ${car.variant} ${car.year}, ${km} किमी। ${price}, निरीक्षण रिपोर्ट के साथ। ${DEALER}, ${CITY.hi} में टेस्ट ड्राइव बुक करें।`;
  return car.type === "New"
    ? `${car.model} ${car.variant} ${car.year}, ${car.fuel.toLowerCase()}. Ex-showroom ${price}; see the full ${CITY.en} on-road price breakup and book a test drive at ${DEALER}.`
    : `Certified used ${car.model} ${car.variant} ${car.year}, ${car.fuel.toLowerCase()}, ${km} km. Listed at ${price} with an inspection report. Book a test drive at ${DEALER}, ${CITY.en}.`;
}

function imageUrl(car: Car) {
  if (car.photoUrls?.[0]) return car.photoUrls[0];
  const sample = sampleImageFor(car.stockId);
  return sample ? absoluteUrl(sample.src) : undefined;
}

/** Canonical + hreflang so the English and Hindi pages are indexed as translations, not duplicates. */
export function carMetadata(car: Car, language: Language): Metadata {
  const image = imageUrl(car);
  return {
    title: { absolute: `${title(car, language)} | ${DEALER}` },
    description: description(car, language),
    alternates: {
      canonical: carPath(car, language),
      languages: { "en-IN": carPath(car, "en"), "hi-IN": carPath(car, "hi"), "x-default": carPath(car, "en") },
    },
    openGraph: {
      type: "website",
      siteName: DEALER,
      locale: language === "hi" ? "hi_IN" : "en_IN",
      title: title(car, language),
      description: description(car, language),
      url: carPath(car, language),
      ...(image ? { images: [{ url: image, alt: carName(car) }] } : {}),
    },
  };
}

/** schema.org/Car with the dealer's offer, for rich results. */
export function carJsonLd(car: Car) {
  const image = imageUrl(car);
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: carName(car),
    brand: { "@type": "Brand", name: "Brand X" },
    model: car.model,
    vehicleConfiguration: car.variant,
    vehicleModelDate: String(car.year),
    fuelType: car.fuel,
    itemCondition: car.type === "New" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.kilometres, unitCode: "KMT" },
    ...(car.type === "Used" && car.owners ? { numberOfPreviousOwners: car.owners } : {}),
    ...(image ? { image } : {}),
    url: absoluteUrl(carPath(car)),
    offers: {
      "@type": "Offer",
      price: car.priceInRupees,
      priceCurrency: "INR",
      availability: car.status === "Available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "AutoDealer", name: DEALER, address: { "@type": "PostalAddress", addressLocality: CITY.en, addressCountry: "IN" } },
    },
  };
}

/** Serialises JSON-LD for a <script> tag; escaping "<" stops admin-entered text closing the tag. */
export function jsonLdScript(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
